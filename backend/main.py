from flask import Flask, jsonify, request
from flask_cors import CORS
import db_helpers

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes


@app.route("/api")
def hello_world():
    """
    Simple endpoint to check if the API is running.
    Returns a greeting message.

    Example request:
    GET /api
    
    Example output (always outputs exactly this):
    "Hello, from Flask!"
    """
    return 'Hello, from Flask!'


@app.route("/api/create-wildlife/", methods=["POST"])
def create_wildlife():
    """
    Creates a new wildlife entry.
    Requires 'name', 'scientific_name', and 'category_id' in the form data.

    Example request:
    POST /api/create-wildlife/
    Form Data: name=Fox, scientific_name=Vulpes vulpes, category_id=1

    Example output:
    {
        "message": "Wildlife created successfully",
        "wildlife_id": 3
    }
    """
    # Check if the category exists
    name = request.form["name"]
    scientific_name = request.form["scientific_name"]
    category_id = request.form["category_id"]

    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    wildlife_id = db_helpers.insert("INSERT INTO Wildlife (name, scientific_name, category_id) VALUES (?, ?, ?)", (name, scientific_name, category_id))
    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201


def get_all_category_ids(top_level_category_ids):
    """
    Helper function.
    Extracts all category IDs, including subcategories, from a list of top-level category IDs.
    """
    if not top_level_category_ids:
        return []

    # Create a placeholder string for SQL query
    placeholders = ','.join('?' for _ in top_level_category_ids)

    # Construct the recursive query to find all subcategories
    sql_query = f"""
    WITH RECURSIVE subcategories(id) AS (
        SELECT id FROM Categories WHERE id IN ({placeholders})
        UNION ALL
        SELECT c.id FROM Categories c INNER JOIN subcategories sc ON c.parent_id = sc.id
    )
    SELECT DISTINCT id FROM subcategories
    """
    all_category_ids = db_helpers.select_multiple(sql_query, top_level_category_ids)
    return [row['id'] for row in all_category_ids]


@app.route("/api/search-wildlife-names/", methods=["GET"])
def search_wildlife_names():
    """
    Searches for wildlife by name or scientific name within specified categories. Case-insensitive.
    The 'category_id' parameter is optional and can be repeated to search across multiple categories.
    If no categories are provided, it searches across all categories.

    Example request:
    GET /api/search-wildlife-names/?query=fox&category_id=1&category_id=2

    Example output:
    [
        {
            "id": 2,
            "category_id": 1,
            "name": "Arctic Fox",
            "scientific_name": "Vulpes lagopus"
        },
        {
            "id": 3,
            "category_id": 2,
            "name": "Red Fox",
            "scientific_name": "Vulpes vulpes"
        }
    ]
    """
    category_ids = request.args.getlist("category_id", type=int)
    user_query = request.args.get("query")

    if category_ids:
        all_category_ids = get_all_category_ids(category_ids)
        # This special case is necessary because "IN ()" is invalid syntax (it needs at least one value inside the parenthesis)
        if not all_category_ids:
            return jsonify([]), 200  # Return an empty list if no categories found

        # Create a placeholder string for SQL query
        placeholders = ','.join('?' for _ in all_category_ids)

        sql_query = f"""
        SELECT w.* FROM Wildlife w
        WHERE w.category_id IN ({placeholders})
        AND (w.name LIKE ? OR w.scientific_name LIKE ?)
        """

        params = all_category_ids + [f'%{user_query}%', f'%{user_query}%']
    else:
        # If no category IDs are provided, search across all wildlife
        sql_query = "SELECT * FROM Wildlife WHERE name LIKE ? OR scientific_name LIKE ?"
        params = [f'%{user_query}%', f'%{user_query}%']

    wildlife_results = db_helpers.select_multiple(sql_query, params)
    return jsonify(wildlife_results), 200


@app.route("/api/search-wildlife-text-field/", methods=["GET"])
def search_wildlife_text_field():
    """
    Searches for wildlife by a specified text field within specified categories. Case-insensitive.
    Requires 'field_id' and 'query'.
    The 'category_id' parameter is optional and can be repeated for multiple categories.
    If no categories are provided, it searches across all categories.

    Note that you can't search for name or scientific name using this route, as they are part of the wildlife table itself, and aren't custom fields.
    To search for those, use the search-wildlife-names route (see above).

    Example request:
    GET /api/search-wildlife-text-field/?field_id=2&query=sea&category_id=1

    Example output:
    [
        {
            "id": 4,
            "category_id": 1,
            "name": "Green Turtle",
            "scientific_name": "Chelonia mydas"
        }
    ]
    For the example request to produce this output, Green Turtle would need a text field with field_id=2 that contains the string "sea".
    For example, maybe its parent category has an "extra notes" field, whose value for the Green Turtle is "It's also known as the green sea turtle".
    """
    category_ids = request.args.getlist("category_id", type=int)
    field_id = request.args.get("field_id", type=int)
    user_query = request.args.get("query")

    # Check if the field_id corresponds to a TEXT type field
    field_info = db_helpers.select_one("SELECT type FROM Fields WHERE id = ?", (field_id,))
    if not field_info or field_info["type"] != "TEXT":
        return jsonify({"error": "Field not found or not of type TEXT"}), 400

    if category_ids:
        all_category_ids = get_all_category_ids(category_ids)
        if not all_category_ids:
            # If there are no categories found, return an empty list
            return jsonify([]), 200

        # Create a placeholder string for SQL query
        placeholders = ','.join('?' for _ in all_category_ids)

        sql_query = f"""
        WITH RECURSIVE wildlife_in_categories(id) AS (
            SELECT id FROM Wildlife WHERE category_id IN ({placeholders})
        )
        SELECT w.* FROM Wildlife w
        JOIN FieldValues fv ON fv.wildlife_id = w.id
        JOIN wildlife_in_categories wic ON wic.id = w.id
        WHERE fv.field_id = ? AND fv.value LIKE ?
        """
        params = all_category_ids + [field_id, f'%{user_query}%']
    else:
        # If no category IDs are provided, search across all wildlife
        sql_query = """
        SELECT w.* FROM Wildlife w
        JOIN FieldValues fv ON fv.wildlife_id = w.id
        WHERE fv.field_id = ? AND fv.value LIKE ?
        """
        params = [field_id, f'%{user_query}%']

    wildlife_results = db_helpers.select_multiple(sql_query, params)
    return jsonify(wildlife_results), 200


@app.route("/api/create-category/", methods=["POST"])
def create_category():
    """
    Creates a new category with an optional parent category.
    Requires 'name'. 'parent_id' is optional.

    Example request:
    POST /api/create-category/
    Form Data: name=Mammals, parent_id=1

    Example output:
    {
        "message": "Category created successfully",
        "category_id": 2
    }
    """
    name = request.form["name"]
    parent_id = request.form.get("parent_id")  # optional

    # Check if parent category exists
    if parent_id:
        parent_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (parent_id,))
        if not parent_exists:
            return jsonify({"error": "Parent category not found"}), 400

    category_id = db_helpers.insert("INSERT INTO Categories (name, parent_id) VALUES (?, ?)", (name, parent_id))
    return jsonify({"message": "Category created successfully", "category_id": category_id}), 201


@app.route("/api/get-categories/", methods=["GET"])
def get_categories():
    """
    Retrieves all categories.

    Example request:
    GET /api/get-categories/

    Example output:
    [
        {
            "id": 1,
            "name": "Animals",
            "parent_id": null
        },
        {
            "id": 2,
            "name": "Mammals",
            "parent_id": 1
        }
    ]
    """
    categories = db_helpers.select_multiple("SELECT * FROM Categories")
    return jsonify(categories), 200


@app.route("/api/get-categories-and-fields/", methods=["GET"])
def get_categories_and_fields():
    """
    Retrieves all categories and their associated fields.
    The output format is complicated, so it's best to just look at the example below.
    
    Example request:
    GET /api/get-categories-and-fields/
    
    Example output:
    
    {
        "categories": [
            {
                "field_ids": [
                    1,
                    2
                ],
                "name": "Animals",
                "subcategories": [
                    {
                        "field_ids": [
                            3
                        ],
                        "name": "Birds",
                        "subcategories": []
                    },
                    {
                        "field_ids": [],
                        "name": "Cats",
                        "subcategories": []
                    }
                ]
            }
        ],
        "fields": {
            "1": {
                "id": 1,
                "name": "Description",
                "type": "TEXT"
            },
            "2": {
                "id": 2,
                "name": "Note",
                "type": "TEXT"
            },
            "3": {
                "id": 3,
                "name": "Wingspan",
                "type": "INTEGER"
            }
        }
    }
    
    Here, the "Animals" category has the "Description" and "Note" text fields.
    The "Birds" category is a subcategory of "Animals" and has the "Wingspan" integer field.
    The "Cats" category is a subcategory of "Animals" and has no extra fields.
    In this example, there's only one top-level category (Animals) but it's possible for there to be multiple.
    """
    
    def get_fields_for_category(category_id):
        return db_helpers.select_multiple("SELECT field_id FROM FieldsToCategories WHERE category_id = ?", [category_id])

    def construct_category_structure(category_id=None):
        category_query = "SELECT id, name FROM Categories WHERE parent_id = ?" if category_id else "SELECT id, name FROM Categories WHERE parent_id IS NULL"
        categories = db_helpers.select_multiple(category_query, [category_id] if category_id else [])

        category_list = []
        for category in categories:
            field_ids_row = get_fields_for_category(category['id'])
            field_ids = [row['field_id'] for row in field_ids_row]

            category_obj = {
                "name": category['name'],
                "field_ids": field_ids,
                "subcategories": construct_category_structure(category['id'])
            }
            category_list.append(category_obj)

        return category_list

    # Retrieve all fields in one go
    all_fields = db_helpers.select_multiple("SELECT id, type, name FROM Fields")
    fields_dict = {field['id']: field for field in all_fields}

    categories_structure = construct_category_structure()
    return jsonify({"categories": categories_structure, "fields": fields_dict}), 200



@app.route("/api/create-field/", methods=["POST"])
def create_field():
    """
    Creates a new field and associates it with zero or more categories.
    Requires 'name', 'type', and 'category_id' (can be repeated for multiple categories).

    Example request:
    POST /api/create-field/
    Form Data: name=Habitat, type=TEXT, category_id=1, category_id=2

    Example output:
    {
        "message": "Field created successfully",
        "field_id": 4
    }
    """
    name = request.form["name"]
    typ = request.form["type"]
    category_ids = request.form.getlist("category_id", type=int)

    for category_id in category_ids:
        # Check if category exists
        category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
        if not category_exists:
            return jsonify({"error": f"Category {category_id} not found"}), 400

    # Check if field type is valid
    if typ not in ("INTEGER", "TEXT"):
        return jsonify({"error": "Invalid field type. Allowed types are INTEGER and TEXT."}), 400

    field_id = db_helpers.insert("INSERT INTO Fields (name, type) VALUES (?, ?)", (name, typ))

    for category_id in category_ids:
        db_helpers.insert("INSERT INTO FieldsToCategories (field_id, category_id) VALUES (?, ?)", (field_id, category_id))

    return jsonify({"message": "Field created successfully", "field_id": field_id}), 201


if __name__ == "__main__":
    db_helpers.init_db()
    app.run(debug=True)
