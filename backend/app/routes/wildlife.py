from flask import Blueprint, request, jsonify, current_app
import os
from app import db_helpers

# from .utils import save_file, get_parent_ids  # Adjust import if needed
from werkzeug.utils import secure_filename
from app.utils import save_file, get_parent_ids, get_subcategory_ids  # Adjust import if needed


wildlife_bp = Blueprint('wildlife', __name__)


@wildlife_bp.route("/api/delete-wildlife/", methods=["DELETE"])
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
    n_rows_deleted = db_helpers.delete("DELETE FROM Wildlife WHERE id = ?", [wildlife_id])
    if n_rows_deleted == 0:
        return jsonify({"error": "Wildlife not found"}), 404

    image_field_values = [fv["value"] for fv in db_helpers.select_multiple("SELECT value FROM FieldValues WHERE wildlife_id = ? AND field_id IN (SELECT id FROM Fields WHERE type = 'IMAGE')", [wildlife_id])]
    for image_filename in image_field_values:
        image_path = os.path.join(current_app.config["IMAGE_UPLOAD_FOLDER"], image_filename)
        if os.path.exists(image_path):
            os.remove(image_path)
    db_helpers.delete("DELETE FROM FieldValues WHERE wildlife_id = ?", [wildlife_id])
    db_helpers.delete("DELETE FROM EnumeratedFieldValues WHERE wildlife_id = ?", [wildlife_id])
    return jsonify({"message": "Wildlife successfully deleted"}), 200


@wildlife_bp.route("/api/search-wildlife-by-integer-field/", methods=["GET"])
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


@wildlife_bp.route("/api/edit-wildlife/", methods=["POST"])
def edit_wildlife():
    """
    Edit an existing wildlife instance including name, scientific name, categories, and field values.
    Requires name, scientific_name, category_id, and field_id.
    Takes wildlife_id argument to know what wildlife to edit
    Additional custom fields can be provided, with the format name=value.
    Example request:
    POST /api/edit-wildlife/
    Form Data: name=Red Fox, scientific_name=Vulpes vulpes, category_id=1, Habitat=Woodland Forest
    Example output (successful edit):
    {
        "message": "Wildlife updated successfully",
        "wildlife_id": 3
    }
    """
    #---------------------------------VALIDATIONS----------------------------------------#
    #getting wildlife id
    wildlife_id = int(request.form["wildlife_id"])

    #checking if instance exists
    wildlife_exists = db_helpers.select_one("SELECT 1 FROM Wildlife WHERE id = ?", [wildlife_id])
    if not wildlife_exists:
        return jsonify({"error": "Wildlife not found"}), 404

    # Fetch category id & all custom fields
    category_id = request.form["category_id"]
    other_fields = {k: v for k, v in request.form.items() if k not in ("name", "scientific_name", "category_id", "wildlife_id", "thumbnail_id")}

    #checking if category exists
    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", [category_id])
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

        #checking for valid fields
    parent_category_ids = get_parent_ids(category_id)
    valid_fields = db_helpers.select_multiple(f"""
        SELECT Fields.name FROM Fields
        JOIN FieldsToCategories ON Fields.id = FieldsToCategories.field_id
        WHERE FieldsToCategories.category_id IN ({','.join('?' for _ in parent_category_ids)})
        """, parent_category_ids)
    valid_field_names = {field['name'] for field in valid_fields}
    provided_field_names = set(other_fields.keys())
    if not provided_field_names.issubset(valid_field_names):
        invalid_fields = provided_field_names - valid_field_names
        return jsonify({"error": f"Provided fields not valid for category: {', '.join(invalid_fields)}"}), 400
    
    valid_image_fields = filter(lambda field: field["type"] == "IMAGE", valid_fields)
    # valid_image_field_names = {field['name'] for field in valid_image_fields}

    # print(valid_image_field_names)

    for image_file in request.files.values():
        if image_file.filename == "":
            continue
        file_length = image_file.seek(0, os.SEEK_END)
        image_file.seek(0, os.SEEK_SET)
        if file_length > 10 * 1024 * 1024:
            return jsonify({"error": f"The image file {image_file.filename} is too large (max 10 MB)"}), 400
        if not image_file.mimetype.startswith("image/"):
            print("this is not an image")
            return jsonify({"error": f"The file {image_file.filename} is not an image (its MIME type is {image_file.mimetype}, which doesn't start with 'image/')"}), 400
    
    #------------------------------------------------------------------------------------#

    #---------------------------UPDATING INFORMATION-------------------------------------#
    #modify remaining fields

    for field_name, value in other_fields.items():
        print(field_name, value)
        field = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])
        if not field:
            return jsonify({"error": f"Field {field_name} not found"}), 400
        field_id = field["id"]
        db_helpers.update("REPLACE INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, value))

    
    for field_name, image_file in request.files.items():
        if image_file.filename == "":
            continue
        print(field_name, image_file)
        field = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])
        if not field:
            return jsonify({"error": f"Field {field_name} not found"}), 400
        field_id = field["id"]
        saved_filename = save_file(image_file, current_app.config["IMAGE_UPLOAD_FOLDER"])
        print(saved_filename)
        db_helpers.insert("REPLACE INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, saved_filename))
    #success message
    return jsonify({"message": "wildlife updated successfully", "wildlife_id": wildlife_id}), 201
    #------------------------------------------------------------------------------------#


@wildlife_bp.route("/api/create-wildlife/", methods=["POST"])
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
        return jsonify({"message": f"Wildlife with namne {name} already exists"}), 400

    wildlife_with_scientific_name_exists = db_helpers.select_multiple(
        "SELECT 1 FROM Wildlife WHERE scientific_name = ?", [scientific_name])
    if wildlife_with_scientific_name_exists:
        return jsonify({"message": f"Wildlife with scientific name {scientific_name} already exists"}), 400

    category_id = request.form["category_id"]
    provided_nonimage_fields = {k: v for k, v in request.form.items() if k not in ("name", "scientific_name", "category_id", "thumbnail")}

    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    # Get all parent category IDs, and the ID of the category itself
    parent_category_ids = get_parent_ids(category_id)

    # Fetch all fields valid for the category, including those inherited from parent categories
    valid_fields = db_helpers.select_multiple(f"""
            SELECT Fields.name, Fields.type FROM Fields
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
        file_length = image_file.seek(0, os.SEEK_END)
        image_file.seek(0, os.SEEK_SET)
        if file_length > 10 * 1024 * 1024:
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
        field_row = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])
        if not field_row:
            continue  # or handle error as appropriate
        field_id = field_row["id"]
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, value))

    # Insert the image field values
    for field_name, image_file in request.files.items():
        field_row = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])
        if not field_row:
            continue  # or handle error as appropriate
        field_id = field_row["id"]
        saved_filename = save_file(image_file, current_app.config["IMAGE_UPLOAD_FOLDER"])
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, saved_filename))

    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201

# CREATE TABLE IF NOT EXISTS Images (
#     id INTEGER PRIMARY KEY, 
#     wildlife_id INTEGER NOT NULL, 
#     image_path TEXT NOT NULL,
#     FOREIGN KEY (wildlife_id) REFERENCES Wildlife(id),
#     UNIQUE (wildlife_id, image_path)
# );


@wildlife_bp.route("/api/search-wildlife-names/", methods=["GET"])
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


@wildlife_bp.route("/api/search-wildlife-text-field/", methods=["GET"])
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




@wildlife_bp.route("/api/get-wildlife/", methods=["GET"])
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
            elif field["type"] == "IMAGE":
                field_value = fv["value"]
            else:
                raise NotImplementedError("Unsupported field type '{}'".format(field["type"]))

            cleaned_field_values.append({"field_id": field["id"], "value": field_value, "name": field["name"]})
        out.append({**wildlife, "field_values": cleaned_field_values})
    return jsonify(out), 200


@wildlife_bp.route("/api/get-wildlife-by-id/<int:wildlife_id>", methods=["GET"])
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


@wildlife_bp.route("/api/create-field/", methods=["POST"])
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


@wildlife_bp.route("/api/edit-field/", methods=["POST"])
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

@wildlife_bp.route("/api/delete-field/", methods=["DELETE"])
def delete_field():
    print("Received request to delete field")
    """
    Deletes a field by ID. 
    Requires 'field_id' and 'category_id'
    Example request:
    DELETE /api/delete-field/?field_id=2&category_id=1
    Example output:
    {
        "message": "Field successfully deleted"
    }
    """
    
    field_id = request.args["field_id"]
    category_id = request.args["category_id"]

    """
    Checking existence and association is redundant as Edit_Wildlife sends information from pre_existing queries.
    But for the sake of completeness, and perhaps futured debugging, 
    we will check if the field exists and if it is associated with the category
    """
    print("Deleting field with ID:", field_id, "from category ID:", category_id)

    row = db_helpers.select_one(
    """
    SELECT 
        EXISTS(SELECT 1 FROM Fields WHERE id = ?) AS field_exists,
        EXISTS(SELECT 1 FROM Categories WHERE id = ?) AS category_exists,
        EXISTS(SELECT 1 FROM FieldsToCategories WHERE field_id = ? AND category_id = ?) AS association_exists
    """,
    (field_id, category_id, field_id, category_id)
    )   
    if not row["field_exists"]:
        return jsonify({"error": f"Field {field_id} not found"}), 400
    if not row["category_exists"]:
        return jsonify({"error": f"Category {category_id} not found"}), 400
    if not row["association_exists"]:
        return jsonify({"error": f"Field {field_id} is not associated with category {category_id}"}), 400
    
    # Delete the field-category association
    db_helpers.delete("DELETE FROM FieldsToCategories WHERE field_id = ? AND category_id = ?", (field_id, category_id))

    return jsonify({"message": "Field successfully deleted"}), 200
