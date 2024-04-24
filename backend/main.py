from flask import Flask, jsonify, request
from flask_cors import CORS
import db_helpers

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes


@app.route("/api", methods=["GET"])
def hello_world():
    """
    Example request:
    GET /api
    
    Example output (always outputs exactly this):
    "Hello, from Flask!"
    """
    return 'Hello, from Flask!'


@app.route("/api/ping/", methods=["GET"])
def ping():
    return "Pong", 200


def get_subcategory_ids(top_level_category_ids):
    """
    Helper function.
    Returns the input (top_level_category_ids) with its subcategory IDs added as well.
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


def get_parent_ids(category_id):
    """
    Retrieves a list of parent category IDs for a given category, including the category itself.
    """
    sql_query = """
    WITH RECURSIVE parent_categories(id, parent_id) AS (
        SELECT id, parent_id FROM Categories WHERE id = ?
        UNION ALL
        SELECT c.id, c.parent_id FROM Categories c INNER JOIN parent_categories pc ON c.id = pc.parent_id
    )
    SELECT id FROM parent_categories
    """

    parent_ids = db_helpers.select_multiple(sql_query, [category_id])
    if not parent_ids:
        return jsonify({"error": "Category not found"}), 404

    # Extracting the IDs from the result rows
    parent_ids_list = [row['id'] for row in parent_ids]
    return parent_ids_list


@app.route("/api/create-wildlife/", methods=["POST"])
def create_wildlife():
    """
    Create a wildlife instance. Requires name, scientific_name, and category_id.
    Additional custom fields can be provided at the end, with the format name=value (see example).

    Example request:
    POST /api/create-wildlife/
    Form Data: name=Fox, scientific_name=Vulpes vulpes, category_id=1, Habitat=Forest

    Example output (successful creation):
    {
        "message": "Wildlife created successfully",
        "wildlife_id": 3
    }
    """
    name = request.form["name"]
    typ = request.form["type"]
    category_ids = request.form.getlist("category_id", type=int)
    options = request.form.getlist("options")  # For ENUM type fields

    # Check if the field name already exists
    field_exists = db_helpers.select_one("SELECT 1 FROM Fields WHERE name = ?", [name])
    if field_exists:
        return jsonify({"error": f"Field with name {name} already exists"}), 400

    # Validate field type
    valid_types = ["INTEGER", "TEXT", "ENUM", "MONTH_RANGE"]
    if typ not in valid_types:
        return jsonify({"error": f"Invalid field type. Allowed types are {', '.join(valid_types)}."}), 400

    # Insert the new field into the database
    field_id = db_helpers.insert("INSERT INTO Fields (name, type) VALUES (?, ?)", [name, typ])

    # If ENUM, also insert options into EnumeratedOptions
    if typ == "ENUM":
        if not options:
            return jsonify({"error": "ENUM type requires options"}), 400
        for option in options:
            db_helpers.insert("INSERT INTO EnumeratedOptions (field_id, option_value) VALUES (?, ?)", (field_id, option))

    # Associate field with categories
    for category_id in category_ids:
        category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", [category_id])
        if not category_exists:
            return jsonify({"error": f"Category {category_id} not found"}), 400
        db_helpers.insert("INSERT INTO FieldsToCategories (field_id, category_id) VALUES (?, ?)", [field_id, category_id])

    return jsonify({"message": "Field created successfully", "field_id": field_id}), 201



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
        all_category_ids = get_subcategory_ids(category_ids)
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
        all_category_ids = get_subcategory_ids(category_ids)
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
    # TODO add nesting limit of 5
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

    # Check if category with that name exists
    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE name = ?", [name])
    if category_exists:
        return jsonify({"error": f"Category with name {name} already exists"}), 400

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
    Retrieves all categories and their associated fields, including detailed ENUM options for fields that require predefined values.
    This function supports dynamic frontend implementations by providing complete schema details, especially useful for generating forms and inputs based on database constraints.

    Example request:
    GET /api/get-categories-and-fields/

    Example output:
    {
        "categories": {
            "3": {
                "id": 3,
                "parent_id": null,
                "field_ids": [5, 4],
                "name": "Animals",
                "subcategories": [6, 8]
            },
            "8": {
                "id": 8,
                "parent_id": 3,
                "field_ids": [5, 4, 2],
                "name": "Birds",
                "subcategories": []
            },
            "6": {
                "id": 6,
                "parent_id": 3,
                "field_ids": [5, 4],
                "name": "Cats",
                "subcategories": []
            }
        },
        "fields": {
            "5": {
                "id": 5,
                "name": "Description",
                "type": "TEXT"
            },
            "2": {
                "id": 2,
                "name": "Average Lifespan",
                "type": "INTEGER"
            },
            "4": {
                "id": 4,
                "name": "Active Months",
                "type": "ENUM",
                "options": [
                    "1 - January", "2 - February", "3 - March", "4 - April",
                    "5 - May", "6 - June", "7 - July", "8 - August",
                    "9 - September", "10 - October", "11 - November", "12 - December"
                ]
            }
        }
    }

    In this example, the 'Active Months' field for categories related to animal activities shows ENUM values formatted as 'number - month' to clearly specify each option. This format assists in ensuring that the data entries for active months are consistent and accurate across the system.
    """
    # The code here is pretty unreadable; if you're reading this and know what you're doing, feel free to clean it up

      # Fetch all category and field-category relationship data
    category_data = db_helpers.select_multiple("SELECT * FROM Categories")
    fields_to_categories = db_helpers.select_multiple("SELECT * FROM FieldsToCategories")
    fields_data = db_helpers.select_multiple("SELECT * FROM Fields")

    # Include ENUM options if the field type is ENUM
    for field in fields_data:
        if field["type"] == "ENUM":
            enum_options = db_helpers.select_multiple(
                "SELECT option_value FROM EnumeratedOptions WHERE field_id = ?",
                [field["id"]]
            )
            field["options"] = [option["option_value"] for option in enum_options]

    # Dictionary mapping categories to their field IDs
    category_fields = {}
    for entry in fields_to_categories:
        if entry["category_id"] in category_fields:
            category_fields[entry["category_id"]].append(entry["field_id"])
        else:
            category_fields[entry["category_id"]] = []

    # Prepare the categories dictionary
    category_dict = {}
    for category in category_data:
        category_dict[category["id"]] = {
            "id": category["id"],
            "name": category["name"],
            "parent_id": category["parent_id"],
            "subcategories": [],
            "field_ids": category_fields.get(category["id"], [])
        }

    # Recursive function to get all field IDs for a category, including inherited ones
    def get_field_ids(category_id):
        category = category_dict[category_id]
        immediate_ids = category_fields.get(category["id"], [])
        if category["parent_id"]:
            return list(set(immediate_ids + get_field_ids(category["parent_id"])))
        else:
            return immediate_ids

    # Add subcategories and populate field IDs for each category
    for category in category_data:
        if category["parent_id"]:
            category_dict[category["parent_id"]]["subcategories"].append(category["id"])
        category_dict[category["id"]]["field_ids"] = get_field_ids(category["id"])

    # Map field details to field IDs for easier JSON structuring
    fields_dict = {field['id']: {
        "id": field['id'],
        "name": field['name'],
        "type": field['type'],
        "options": field.get("options", [])  # Include options if available
    } for field in fields_data}

    # Compile the final output
    output = {
        "categories": category_dict,
        "fields": fields_dict
    }
    return jsonify(output), 200

@app.route("/api/get-wildlife/", methods=["GET"])
def get_wildlife():
    """
    Retrieves all wildlife entries, including their associated custom field values.

    Each entry includes id, name, scientific_name, category_id, and all the custom field values.
    Custom fields have their name as the key and their value as the value.
    Text field values are returned as strings; integer field values are returned as integers.

    Example request:
    GET /api/get-wildlife/

    Example output:
    [
        {
            "id": 1,
            "category_id": 2,
            "name": "European Hedgehog",
            "scientific_name": "Erinaceus europaeus",
            "field_values": [
                {
                    "field_id": 1,
                    "value": "Forests and grasslands"
                },
                {
                    "field_id": 2,
                    "value": 500000
                }
            ]
        },
        {
            "id": 2,
            "category_id": 3,
            "name": "Red Fox",
            "scientific_name": "Vulpes vulpes",

            "field_values": {
                {
                    "field_id": 1,
                    "value": "Urban and wild areas"
                },
                {
                    "field_id": 3,
                    "value": "Omnivore"
                }
            }
        }
    ]
    """
    all_wildlife = db_helpers.select_multiple("SELECT * FROM Wildlife")
    out = []
    for wildlife in all_wildlife:
        field_values = db_helpers.select_multiple("SELECT * FROM FieldValues WHERE FieldValues.wildlife_id = ?",
                                                  [wildlife["id"]])
        cleaned_field_values = []
        for fv in field_values:
            field = db_helpers.select_one("SELECT * FROM Fields WHERE id = ?", [fv["field_id"]])
            if field["type"] == "TEXT":
                field_value = fv["value"]
            elif field["type"] == "INTEGER":
                field_value = int(fv["value"])
            elif field["type"] == "ENUM":
                field_value = fv["value"]
            else:
                raise NotImplementedError("Unsupported field type")
            cleaned_field_values.append({"field_id": field["id"], "value": field_value})
        out.append({**wildlife, "field_values": cleaned_field_values})
    return jsonify(out), 200

def format_month_range(wildlife_id):
    month_ranges = db_helpers.select_multiple(
        "SELECT field_id, beginning_month, ending_month FROM FieldMonths WHERE wildlife_id = ?",
        [wildlife_id]
    )
    return {f"Month Range for Field {mr['field_id']}": f"{mr['beginning_month']} - {mr['ending_month']}"
            for mr in month_ranges}

@app.route("/api/get-wildlife-by-id/<int:wildlife_id>", methods=["GET"])
def get_wildlife_by_id(wildlife_id):
    """
    Retrieves wildlife by its ID.

    Example request:
    GET /api/get-wildlife-by-id/1

    Example output:
    {
        "id": 1,
        "category_id": 2,
        "name": "European Hedgehog",
        "scientific_name": "Erinaceus europaeus",
        "Habitat": "Forests and grasslands",
        "Active Season": "March - May"
    }
    """
    wildlife = db_helpers.select_one("SELECT * FROM Wildlife WHERE id = ?", [wildlife_id])
    if not wildlife:
        return jsonify({"error": "Wildlife not found"}), 404

    # Retrieve custom field values
    custom_fields = db_helpers.select_multiple("""
        SELECT Fields.id, Fields.name, FieldValues.value
        FROM Fields
        JOIN FieldValues ON Fields.id = FieldValues.field_id
        WHERE FieldValues.wildlife_id = ?
    """, [wildlife_id])

    # Add custom field values to wildlife data
    for field in custom_fields:
        wildlife[field['name']] = field['value']

    # Retrieve month range data and convert month numbers to names
    month_ranges = db_helpers.select_multiple("""
        SELECT Fields.name, MM1.month_name AS beginning_month, MM2.month_name AS ending_month
        FROM Fields
        JOIN FieldMonths ON Fields.id = FieldMonths.field_id
        JOIN MonthMappings MM1 ON FieldMonths.beginning_month = MM1.month_number
        JOIN MonthMappings MM2 ON FieldMonths.ending_month = MM2.month_number
        WHERE FieldMonths.wildlife_id = ?
    """, [wildlife_id])

    # Add month range data to wildlife data
    for mr in month_ranges:
        wildlife[mr['name']] = f"{mr['beginning_month']} - {mr['ending_month']}"

    return jsonify(wildlife), 200


@app.route("/api/search-wildlife-by-month-range/", methods=["GET"])
def search_wildlife_by_month_range():
    field_id = request.args.get("field_id", type=int)
    target_month = request.args.get("month", type=int)

    if not field_id or not target_month:
        return jsonify({"error": "Both field_id and month are required"}), 400

    # Validate field type is MONTH_RANGE
    field_info = db_helpers.select_one("SELECT id FROM Fields WHERE id = ? AND type = 'MONTH_RANGE'", [field_id])
    if not field_info:
        return jsonify({"error": "Invalid field ID or field is not of type MONTH_RANGE"}), 400

    results = db_helpers.select_multiple(
        "SELECT Wildlife.* FROM Wildlife "
        "JOIN FieldMonths ON Wildlife.id = FieldMonths.wildlife_id "
        "WHERE FieldMonths.field_id = ? AND FieldMonths.beginning_month <= ? AND FieldMonths.ending_month >= ?",
        [field_id, target_month, target_month]
    )
    return jsonify(results), 200



@app.route("/api/create-field/", methods=["POST"])
def create_field():
    """
    Creates a new field and associates it with zero or more categories.
    Requires 'name' and 'type'. 'category_id' can be repeated for multiple categories.

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

    field_exists = db_helpers.select_multiple("SELECT 1 FROM Fields WHERE name = ?", [name])
    if field_exists:
        return jsonify({"error": f"Field with name {name} already exists"}), 400

    for category_id in category_ids:
        category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", [category_id])
        if not category_exists:
            return jsonify({"error": f"Category {category_id} not found"}), 400

    # Add MONTH_RANGE to valid types
    if typ not in ("INTEGER", "TEXT", "ENUM", "MONTH_RANGE"):
        return jsonify({"error": "Invalid field type. Allowed types are INTEGER, TEXT, ENUM, and MONTH_RANGE."}), 400

    field_id = db_helpers.insert("INSERT INTO Fields (name, type) VALUES (?, ?)", [name, typ])

    for category_id in category_ids:
        db_helpers.insert("INSERT INTO FieldsToCategories (field_id, category_id) VALUES (?, ?)",
                          [field_id, category_id])

    return jsonify({"message": "Field created successfully", "field_id": field_id}), 201

@app.route("/api/edit-field/", methods=["POST"])
def edit_field():
    """
    Associates the field with zero or more new categories, provided by `new_category_id`. Keeps existing field-category associations.
    'new_category_id' can be repeated for multiple categories.
    `new_name` is optional, and changes the name of the field if provided.

    Example request:
    POST /api/edit-field/
    Form Data: field_id=2, new_name=Habitat, new_category_id=1, new_category_id=2

    Example output:
    {
        "message": "Field updated successfully",
    }
    """
    field_id = request.form["field_id"]
    new_name = request.form.get("new_name")
    new_category_ids = request.form.getlist("new_category_id", type=int)

    # Check if the field exists
    field_exists = db_helpers.select_one("SELECT 1 FROM Fields WHERE id = ?", (field_id,))
    if not field_exists:
        return jsonify({"error": "Field not found"}), 400

    # Verify all new categories exist and get the categories that are already associated with this field
    existing_categories = set()
    for category_id in new_category_ids:
        if not db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,)):
            return jsonify({"error": f"Category {category_id} not found"}), 400
        # Check if the category is already associated with the field
        if db_helpers.select_one("SELECT 1 FROM FieldsToCategories WHERE field_id = ? AND category_id = ?",
                                 (field_id, category_id)):
            existing_categories.add(category_id)

    # Add the field to new categories, excluding already associated ones
    for category_id in set(new_category_ids) - existing_categories:
        db_helpers.insert("INSERT INTO FieldsToCategories (field_id, category_id) VALUES (?, ?)",
                          (field_id, category_id))

    if new_name:
        db_helpers.update("UPDATE Fields SET name = ? WHERE id = ?", [new_name, field_id])

    return jsonify({"message": "Field updated successfully"}), 200



@app.route("/api/delete-category/", methods=["DELETE"])
def delete_category():
    """
    Deletes a category. Reassigns the members to the parent category by default; deletes them if 'delete-members' is provided.
    To be clear, providing `delete-members` AT ALL will delete them - if you don't want to delete, don't put it in the request, even as e.g. delete-members=false.
    If the category has no parent, and `delete-members` isn't provided, the request will fail.

    Example request:
    POST /api/delete-category/?id=2&delete-members

    Example output:
    {
        "message": "Category members and category successfully deleted"
    }
    """
    category_id = request.args["id"]
    delete_members = request.args.get("delete-members")

    category = db_helpers.select_one("SELECT * FROM Categories WHERE id = ?", [category_id])
    if delete_members is None:
        parent_id = category['parent_id']
        if parent_id is None:
            return jsonify({
                               "error": "Delete failed; cannot reassign members to the parent category because it does not exist."}), 400
        else:
            # Reassign wildlife to the parent category
            db_helpers.update("UPDATE Wildlife SET category_id = ? WHERE category_id = ?", [parent_id, category_id])
            # Reassign the subcategories to the parent category
            db_helpers.update("UPDATE Categories SET parent_id = ? WHERE parent_id = ?", [parent_id, category_id])
            # Delete the category
            db_helpers.delete("DELETE FROM Categories WHERE id = ?", [category_id])
            return jsonify({"message": "Category members successfully reassigned and category deleted"}), 200
    else:
        category_ids = get_subcategory_ids([category_id])
        # Delete the members
        db_helpers.delete(f"DELETE FROM Wildlife WHERE category_id IN ({','.join('?' for _ in category_ids)})",
                          category_ids)
        # Delete the category and its subcategories
        db_helpers.delete(f"DELETE FROM Categories WHERE id IN ({','.join('?' for _ in category_ids)})", category_ids)
        return jsonify({"message": "Category members and category successfully deleted"}), 200


@app.route("/api/delete-wildlife/", methods=["DELETE"])
def delete_wildlife():
    """
    Deletes a wildlife instance by ID.

    Example request:
    DELETE /api/delete-wildlife/?id=3

    Example output:
    {
        "message": "Wildlife successfully deleted"
    }
    """
    wildlife_id = request.args["id"]
    n_rows = db_helpers.delete("DELETE FROM Wildlife WHERE id = ?", [wildlife_id])
    if n_rows == 0:
        return jsonify({"error": "Wildlife not found"}), 404
    return jsonify({"message": "Wildlife successfully deleted"}), 200


@app.route("/api/search-wildlife-by-integer-field/", methods=["GET"])
def search_wildlife_by_integer_field():
    """
Searches wildlife records by any specified integer field. This can be used to search for records with an exact value, within a range (greater than a minimum value, less than a maximum value, or between a minimum and maximum value).

Requires:
- 'field_id': The ID of the integer field to search on.
- 'exact_value': (Optional) The exact value to search for. Cannot be used with min_value or max_value.
- 'min_value': (Optional) The minimum value to search for. Use alone for greater than queries or with max_value for range queries.
- 'max_value': (Optional) The maximum value to search for. Use alone for less than queries or with min_value for range queries.
Note: 'field_id' is required. Either 'exact_value' or one/both of 'min_value' and 'max_value' must be provided. It's not valid to provide 'exact_value' together with 'min_value' or 'max_value'.

Returns a JSON structure with a 'results' key containing search results.

Example request for an exact value search (searching for wildlife with a wingspan (where wingspan has a field_id of 7) of exactly 17 inches):
GET /api/search-wildlife-by-integer-field/?field_id=7&exact_value=17

Example request for a range value search (searching for wildlife with a wingspan greater than 15 inches but less than 30 inches):
GET /api/search-wildlife-by-integer-field/?field_id=7&min_value=15&max_value=30

Example output (for the exact value search, formatted as a JSON response):
{
  "results": [
    {
      "id": 12,
      "category_id": 4,
      "name": "Common Sparrow",
      "scientific_name": "Passer domesticus"
    }
  ]
}

Example output (for the range value search, formatted as a JSON response):
{
  "results": [
    {
      "id": 8,
      "category_id": 4,
      "name": "American Goldfinch",
      "scientific_name": "Spinus tristis"
    },
    {
      "id": 9,
      "category_id": 4,
      "name": "Eastern Bluebird",
      "scientific_name": "Sialia sialis"
    }
  ]
}
"""
    field_id = request.args.get("field_id", type=int)
    exact_value = request.args.get("exact_value", type=int, default=None)
    min_value = request.args.get("min_value", type=int, default=None)
    max_value = request.args.get("max_value", type=int, default=None)

    if field_id is None:
        return jsonify({"error": "field_id is required"}), 400
    field_info = db_helpers.select_one("SELECT * FROM Fields WHERE id = ? AND type = 'INTEGER'", (field_id,))
    if not field_info:
        return jsonify({"error": "Invalid field ID or field is not of type INTEGER"}), 400

    if exact_value is not None and (min_value is not None or max_value is not None):
        return jsonify({"error": "Cannot specify exact_value together with min_value or max_value"}), 400

    sql_query = "SELECT w.* FROM Wildlife w JOIN FieldValues fv ON w.id = fv.wildlife_id WHERE fv.field_id = ?"
    params = [field_id]

    if exact_value is not None:
        sql_query += " AND fv.value = ?"
        params.append(str(exact_value))
    else:
        if min_value is not None:
            sql_query += " AND fv.value > ?"
            params.append(str(min_value))
        if max_value is not None:
            sql_query += " AND fv.value < ?"
            params.append(str(max_value))

    results = db_helpers.select_multiple(sql_query, params)
    return jsonify(results), 200



if __name__ == "__main__":
    db_helpers.init_db()
    app.run(debug=True)