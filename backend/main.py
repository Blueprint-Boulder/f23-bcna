import os
import uuid

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

import db_helpers

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes

# Set the folder for image uploads as uploaded_images, which is in the same folder as this file (main.py)
app.config["IMAGE_UPLOAD_FOLDER"] = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploaded_images/")


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


def save_file(file):
    """Generates a unique filename and saves the file to the UPLOAD_FOLDER."""
    original_name = secure_filename(file.filename)
    extension = original_name.rsplit('.', 1)[1] if '.' in original_name else ''
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    return unique_filename


@app.route("/api/create-wildlife/", methods=["POST"])
def create_wildlife():
    """
    Create a wildlife instance. Requires name, scientific_name, and category_id.
    Additional custom fields can be provided at the end, with the format name=value (see example).
    For image fields, you should upload them as files. Like with other fields, the key should be the field name.
    Make sure to use enctype="multipart/form-data" on the HTML form; otherwise, you won't be able to upload images.

    Image files must be <10 MB. All common image formats should work by default.
    The route only accepts files whose MIME type starts with "image/". In the file input, you can add the attribute `accept="image/*"` to restrict the files to images.

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
    scientific_name = request.form["scientific_name"]

    wildlife_with_name_exists = db_helpers.select_multiple("SELECT 1 FROM Wildlife WHERE name = ?", [name])
    if wildlife_with_name_exists:
        return jsonify({"message": f"Wildlife with name {name} already exists"}), 400

    wildlife_with_scientific_name_exists = db_helpers.select_multiple(
        "SELECT 1 FROM Wildlife WHERE scientific_name = ?", [scientific_name])
    if wildlife_with_scientific_name_exists:
        return jsonify({"message": f"Wildlife with scientific name {scientific_name} already exists"}), 400

    category_id = request.form["category_id"]
    provided_nonimage_fields = {k: v for k, v in request.form.items() if k not in ("name", "scientific_name", "category_id")}

    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    # Get all parent category IDs, and the ID of the category itself
    parent_category_ids = get_parent_ids(category_id)

    # Fetch all fields valid for the category, including those inherited from parent categories
    valid_fields = db_helpers.select_multiple(f"""
            SELECT Fields.name FROM Fields
            JOIN FieldsToCategories ON Fields.id = FieldsToCategories.field_id
            WHERE FieldsToCategories.category_id IN ({','.join('?' for _ in parent_category_ids)})
        """, parent_category_ids)

    valid_nonimage_fields = filter(lambda field: field["type"] != "IMAGE", valid_fields)
    valid_image_fields = filter(lambda field: field["type"] == "IMAGE", valid_fields)

    valid_field_names = {field['name'] for field in valid_fields}
    valid_nonimage_field_names = {field['name'] for field in valid_nonimage_fields}
    valid_image_field_names = {field['name'] for field in valid_image_fields}

    # Ensure all provided fields exist
    provided_field_names = set(list(provided_nonimage_fields.keys()) + list(request.files.keys()))
    if not provided_field_names.issubset(valid_field_names):
        invalid_field_names = provided_field_names - valid_field_names
        return jsonify({"error": f"The following fields are invalid for the category with ID {category_id}: {', '.join(invalid_field_names)}"}), 400

    # Ensure all required fields are provided
    if not valid_field_names.issubset(provided_field_names):
        missing_field_names = valid_field_names - provided_field_names
        return jsonify({"error": f"Missing required fields: {', '.join(missing_field_names)}"}), 400

    # Ensure all image fields are provided as files
    if not valid_image_field_names.issubset(request.files.keys()):
        field_names_missing_file = valid_image_field_names - request.files.keys()
        return jsonify({"error": f"The following are image fields, but you provided them as non-files: {', '.join(field_names_missing_file)}"}), 400

    # Ensure all image files are a reasonable size and format
    for image_file in request.files.values():
        if image_file.content_length > 10 * 1024 * 1024:
            return jsonify({"error": f"The image file {image_file.filename} is too large (max 10 MB)"}), 400
        if not image_file.mimetype.startswith("image/"):
            return jsonify({"error": f"The file {image_file.filename} is not an image (its MIME type is {image_file.mimetype}, which doesn't start with 'image/')"}), 400

    # Ensure all non-image fields are provided as form data
    if not valid_nonimage_field_names.issubset(provided_nonimage_fields.keys()):
        field_names_missing_value = valid_nonimage_field_names - provided_nonimage_fields.keys()
        return jsonify({"error": f"The following are non-image fields, but you provided them as files: {', '.join(field_names_missing_value)}"}), 400

    # Insert the wildlife entry
    wildlife_id = db_helpers.insert("INSERT INTO Wildlife (name, scientific_name, category_id) VALUES (?, ?, ?)",
                                    (name, scientific_name, category_id))

    # Insert the non-image field values
    for field_name, value in provided_nonimage_fields.items():
        field_id = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])["id"]
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, value))

    # Insert the image field values
    for field_name, image_file in request.files.items():
        field_id = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])["id"]
        save_file(image_file)
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, image_file.filename))

    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201


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
    Retrieves all categories and their associated fields.
    The output format is complicated, so it's best to just look at the example below.

    Example request:
    GET /api/get-categories-and-fields/

    Example output:

    {
        "categories": [
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
        ],
        "fields": [
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
                "name": "Wingspan",
                "type": "INTEGER"
            }
        ]
    }

    Here, the "Animals" category has the "Description" and "Average Lifespan" text fields.
    The "Birds" category is a subcategory of "Animals" and has the extra field "Wingspan".
    The "Cats" category is a subcategory of "Animals" and has no extra fields.
    Note that subcategories always inherit the field IDs of their parent; i.e. the field_ids of a subcategory is a superset of its parent's field_ids.
    Don't rely on things being in a particular order, e.g. don't assume field_ids are sorted.
    """
    # The code here is pretty unreadable; if you're reading this and know what you're doing, feel free to clean it up

    category_data = db_helpers.select_multiple("SELECT * FROM Categories")
    fields_to_categories = db_helpers.select_multiple("SELECT * FROM FieldsToCategories")

    # Make a dict from categories to their fields
    category_fields = {}
    for entry in fields_to_categories:
        if entry["category_id"] in category_fields:
            category_fields[entry["category_id"]].append(entry["field_id"])
        else:
            category_fields[entry["category_id"]] = [entry["field_id"]]
    for category in category_data:
        if category["id"] not in category_fields:
            category_fields[category["id"]] = []

    category_dict = {}
    # First pass: id, name, empty subcategories list, and parent ID
    for category in category_data:
        category_dict[category["id"]] = {
            "id": category["id"],
            "name": category["name"],
            "parent_id": category["parent_id"],
            "subcategories": []
        }

    # Helper function for the second pass; gets all the field IDs that belong to a category
    def get_field_ids(category_id):
        category = category_dict[category_id]
        immediate_ids = category_fields[category["id"]]
        if category["parent_id"]:
            return list(set(immediate_ids + get_field_ids(category["parent_id"])))  # list(set()) removes duplicates
        else:
            return immediate_ids

    # Second pass: get subcategories and field IDs
    for category in category_data:
        if category["parent_id"]:
            category_dict[category["parent_id"]]["subcategories"].append(category["id"])
        category_dict[category["id"]]["field_ids"] = get_field_ids(category["id"])

    # Make fields
    fields_dict = {}
    fields_data = db_helpers.select_multiple("SELECT id, name, type FROM Fields")
    for field in fields_data:
        fields_dict[field["id"]] = field

    output = {"categories": category_dict, "fields": fields_dict}
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
        "Population": 500000
    }
    """
    wildlife = db_helpers.select_one("SELECT * FROM Wildlife WHERE id = ?", [wildlife_id])
    if not wildlife:
        return jsonify({"error": "Wildlife not found"}), 404

    # Retrieve custom field values
    field_values = db_helpers.select_multiple("SELECT * FROM FieldValues WHERE wildlife_id = ?", [wildlife_id])
    custom_fields = {fv["field_id"]: fv["value"] for fv in field_values}

    # Retrieve field names
    field_names = db_helpers.select_multiple("SELECT id, name FROM Fields")
    field_names_dict = {field["id"]: field["name"] for field in field_names}

    # Add custom field names and values to wildlife data
    for field_id, value in custom_fields.items():
        field_name = field_names_dict.get(field_id)
        if field_name:
            wildlife[field_name] = value

    return jsonify(wildlife), 200


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
        # Check if category exists
        category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", [category_id])
        if not category_exists:
            return jsonify({"error": f"Category {category_id} not found"}), 400

    # Check if field type is valid
    if typ not in ("INTEGER", "TEXT", "ENUM", "IMAGE"):
        return jsonify({"error": "Invalid field type. Allowed types are INTEGER, TEXT, ENUM, and IMAGE."}), 400

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
        wildlife_ids_to_delete = [x["id"] for x in
                                  db_helpers.select_multiple(f"SELECT id FROM Wildlife WHERE category_id IN ({','.join('?' for _ in category_ids)})", category_ids)]
        db_helpers.delete(f"DELETE FROM Wildlife WHERE id IN ({','.join('?' for _ in wildlife_ids_to_delete)})",
                          wildlife_ids_to_delete)
        db_helpers.delete(
            f"DELETE FROM FieldValues WHERE wildlife_id IN ({','.join('?' for _ in wildlife_ids_to_delete)})",
            wildlife_ids_to_delete)
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
    db_helpers.delete("DELETE FROM FieldValues WHERE wildlife_id = ?", [wildlife_id])
    # TODO delete enum stuff too
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