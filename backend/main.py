import os
import re
import uuid

from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS
from werkzeug.datastructures.file_storage import FileStorage
from werkzeug.utils import secure_filename

import db_helpers

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for all routes

# Set the folder for image uploads as uploaded_images, which is in the same folder as this file (main.py)
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
app.config["IMAGE_UPLOAD_FOLDER"] = os.path.join(THIS_FOLDER, "uploaded_images/")


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
    """Generates a unique filename and saves the file to the IMAGE_UPLOAD_FOLDER."""
    original_name = secure_filename(file.filename)
    extension = original_name.rsplit('.', 1)[1] if '.' in original_name else ''
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    file_path = os.path.join(app.config['IMAGE_UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    return unique_filename


def number_field_is_valid(value: str) -> bool:
    """
    Examples:
    5000 is valid
    5 000 is valid
    005000 is valid
    5000. is invalid
    -5000.00 is valid
    -0500 is valid
    --50 is invalid
    5e4 is invalid
    5.0.0 is invalid
    5..0 is invalid
    .5 is valid
    0.5 is valid
    00.5 is valid
    . is invalid
    5,1 is valid (and will be interpreted as 51)
    ,5,,4,,,  .,1,, is valid (and will be interpreted as 54.1)
    """
    value = value.replace(",", "").replace(" ", "")
    return re.match(r"^-?(\d+(\.\d*)?|\.\d+)$", value) is not None


def normalize_number_field(value: str) -> str:
    value = value.replace(",", "").replace(" ", "")  # 5 000 -> 5000; 5,000 -> 5000
    sign = "-" if value[0] == "-" else ""
    value_no_sign = value.lstrip("-")
    if "." in value:
        int_part, decimal_part = value_no_sign.split(".")
    else:
        int_part, decimal_part = value_no_sign, ""
    int_part = int_part.lstrip("0")
    decimal_part = decimal_part.rstrip("0")
    if int_part == "":
        int_part = "0"  # .5 -> 0.5
    if decimal_part == "":
        decimal_part = "0"  # 50. -> 50.0
    return sign + int_part + "." + decimal_part


def get_image_field_error(image_file: FileStorage) -> tuple[Response, int] | None:
    file_length = image_file.seek(0, os.SEEK_END)
    image_file.seek(0, os.SEEK_SET)
    if file_length > 10 * 1024 * 1024:
        return jsonify({"error": f"The image file {image_file.filename} is too large (max 10 MB)"}), 400
    if not image_file.mimetype.startswith("image/"):
        return jsonify({
            "error": f"The file {image_file.filename} is not an image (its MIME type is {image_file.mimetype}, which doesn't start with 'image/')"}), 400


@app.route("/api/create-wildlife/", methods=["POST"])
def create_wildlife():
    r"""
    Create a wildlife instance. Requires name, scientific_name, and category_id; thumbnail is optional and should be uploaded as a file.
    Additional custom fields can be provided at the end, with the format name=value (see example request).

    Numeric fields can be integers or floats, and can be negative. Commas and spaces are ignored.
    After the commas and spaces are removed, this is the regex to tell if a number is valid: ^-?(\d+(\.\d+)?|\.\d+)$
    There are no limits on the size or precision of the number.
    All mathematically equivalent numbers will be stored as the same value, e.g. 5000, 5000.0, and 05000 are all the same.
    If the number is invalid, the route will give an error.
    See number_field_is_valid's documentation for examples of valid and invalid numbers.

    For image fields, you should upload them as files. Like with other fields, the key should be the field name.
    Make sure to use enctype="multipart/form-data" on the HTML form; otherwise, you won't be able to upload images.
    Image files must be <10 MB. All common image formats should work by default.
    The route only accepts files whose MIME type starts with "image/". In the file input, you can add the attribute accept="image/*" to restrict the files to images.

    Example request:
    POST /api/create-wildlife/
    Form Data: name=Fox, scientific_name=Vulpes vulpes, category_id=1, Habitat=Forest, Population=5000

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
    
    if name in ["name", "scientific_name", "category_id", "thumbnail"]:
        return jsonify({"error": 'Wildlife name cannot be any of the following: "name", "scientific_name", "category_id", "thumbnail"'}), 400

    category_id = request.form["category_id"]
    provided_nonimage_fields = {k: v for k, v in request.form.items() if
                                k not in ("name", "scientific_name", "category_id")}
    provided_image_fields = {k: v for k, v in request.files.items() if k != "thumbnail"}

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
    provided_field_names = set(list(provided_nonimage_fields.keys()) + list(provided_image_fields.keys() - ["thumbnail"]))
    if not provided_field_names.issubset(valid_field_names):
        invalid_field_names = provided_field_names - valid_field_names
        return jsonify({
                           "error": f"The following fields are invalid for the category with ID {category_id}: {', '.join(invalid_field_names)}"}), 400

    # Ensure all required fields are provided
    if not valid_field_names.issubset(provided_field_names):
        missing_field_names = valid_field_names - provided_field_names
        return jsonify({"error": f"Missing required fields: {', '.join(missing_field_names)}"}), 400

    # Ensure all image fields are provided as files
    if not valid_image_field_names.issubset(provided_image_fields.keys()):
        field_names_missing_file = valid_image_field_names - request.files.keys()
        return jsonify({
                           "error": f"The following are image fields, but you provided them as non-files: {', '.join(field_names_missing_file)}"}), 400

    # Ensure all image files are a reasonable size and format
    for image_file in provided_image_fields.values():
        image_err = get_image_field_error(image_file)
        if image_err:
            return image_err

    # Ensure all non-image fields are provided as form data
    if not valid_nonimage_field_names.issubset(provided_nonimage_fields.keys()):
        field_names_missing_value = valid_nonimage_field_names - provided_nonimage_fields.keys()
        return jsonify({
                           "error": f"The following are non-image fields, but you provided them as files: {', '.join(field_names_missing_value)}"}), 400

    number_field_names = [field["name"] for field in valid_fields if field["type"] == "NUMBER"]

    # Ensure all number fields are actually provided as numbers
    for field_name, value in provided_nonimage_fields.items():
        if field_name in number_field_names and not number_field_is_valid(value):
            return jsonify({"error": f"Field {field_name} is a number field, but the provided value is not a valid number"}), 400

    # Save the thumbnail if it exists
    if request.files["thumbnail"].filename != "":
        thumbnail_file = request.files["thumbnail"]
        err = get_image_field_error(thumbnail_file)
        if err:
            return err
        thumbnail_saved_filename = save_file(thumbnail_file)
    else:
        thumbnail_saved_filename = None
    
    # Insert the wildlife entry
    wildlife_id = db_helpers.insert("INSERT INTO Wildlife (name, scientific_name, thumbnail, category_id) VALUES (?, ?, ?, ?)",
                                    (name, scientific_name, thumbnail_saved_filename, category_id))

    # Insert the non-image field values
    for field_name, value in provided_nonimage_fields.items():
        if field_name in number_field_names:
            value = normalize_number_field(value)
        field_id = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])["id"]
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, value))

    # Insert the image field values
    for field_name, image_file in provided_image_fields.values():
        field_id = db_helpers.select_one("SELECT id FROM Fields WHERE name = ?", [field_name])["id"]
        saved_filename = save_file(image_file)
        db_helpers.insert("INSERT INTO FieldValues (wildlife_id, field_id, value) VALUES (?, ?, ?)",
                          (wildlife_id, field_id, saved_filename))

    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201


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
                "type": "NUMBER"
            },
            "4": {
                "id": 4,
                "name": "Wingspan",
                "type": "NUMBER"
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


@app.route("/api/get-image/<string:filename>/", methods=["GET"])
def get_image(filename):
    """
    Gets a user-uploaded image file by its filename. Used for getting images associated with wildlife.

    Example request:
    GET /api/get-image/1234abcd.png

    Example output:
    (The image file)
    """
    return send_from_directory(app.config["IMAGE_UPLOAD_FOLDER"], filename)


@app.route("/api/get-wildlife/", methods=["GET"])
def get_wildlife():
    """
    Retrieves all wildlife entries, including their associated custom field values.

    Each entry includes id, name, scientific_name, category_id, thumbnail (may be null), and all the custom field values.
    Custom fields have their name as the key and their value as the value.
    Text field values are returned as strings, e.g. "Small fish and insects".
    Images, including the thumbnail, are returned as their filenames, e.g. "abcd.png". You can use the get-image route to get the actual image.

    Numeric field values are returned as floats inside strings, e.g. "50000.0" or "0.5". You can use decimal.js (https://mikemcl.github.io/decimal.js/) if you need to do math or comparisons with these values.
    If two numbers are mathematically equal, they will be returned as the same string. For example, there is no difference between 5.0 and 5; both are "5.0".
    The reason they're formatted this way is to avoid floating-point precision issues in JavaScript; otherwise e.g. 0.3 might be stored as 0.30000000000000004.

    TODO: Add enum support

    Example request:
    GET /api/get-wildlife/

    Example output:
    [
        {
            "id": 1,
            "category_id": 2,
            "name": "European Hedgehog",
            "scientific_name": "Erinaceus europaeus",
            "thumbnail": "1234abcd.png",
            "field_values": [
                {
                    "field_id": 1,
                    "value": "Forests and grasslands"
                },
                {
                    "field_id": 2,
                    "value": "500000.0"
                }
            ]
        },
        {
            "id": 2,
            "category_id": 3,
            "name": "Red Fox",
            "scientific_name": "Vulpes vulpes",
            "thumbnail": null,
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
            if field["type"] == "ENUM":
                raise NotImplementedError("Enum fields are not yet supported in get-wildlife")
            cleaned_field_values.append({"field_id": field["id"], "value": fv["value"]})
        out.append({**wildlife, "field_values": cleaned_field_values})
    return jsonify(out), 200


@app.route("/api/get-wildlife-by-id/<int:wildlife_id>/", methods=["GET"])
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
        "Population": "500000.0"
    }

    (Number fields are stored as strings to avoid precision issues. See the get-wildlife documentation.)
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
    if typ not in ("NUMBER", "TEXT", "ENUM", "IMAGE"):
        return jsonify({"error": "Invalid field type. Allowed types are NUMBER, TEXT, ENUM, and IMAGE."}), 400

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


@app.route("/api/delete-field/", methods=["DELETE"])
def delete_field():
    """
    Deletes a field. This removes it from all categories and deletes all its associated field values.

    Example request:
    DELETE /api/delete-field/?id=3

    Example output:
    {
        "message": "Field deleted successfully"
    }
    """
    field_id = request.args["id"]

    # Check if the field exists
    field = db_helpers.select_one("SELECT * FROM Fields WHERE id = ?", [field_id])
    if not field:
        return jsonify({"error": "Field not found"}), 400

    # Delete the image files
    if field["type"] == "IMAGE":
        image_filenames = [x["value"] for x in db_helpers.select_multiple(
            "SELECT value FROM FieldValues WHERE field_id = ?", [field_id])]
        for image_filename in image_filenames:
            image_path = os.path.join(app.config["IMAGE_UPLOAD_FOLDER"], image_filename)
            if os.path.exists(image_path):
                os.remove(image_path)

    db_helpers.delete("DELETE FROM FieldsToCategories WHERE field_id = ?", [field_id])
    db_helpers.delete("DELETE FROM FieldValues WHERE field_id = ?", [field_id])
    db_helpers.delete("DELETE FROM Fields WHERE id = ?", [field_id])

    return jsonify({"message": "Field deleted successfully"}), 200


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
                                  db_helpers.select_multiple(
                                      f"SELECT id FROM Wildlife WHERE category_id IN ({','.join('?' for _ in category_ids)})",
                                      category_ids)]
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
    n_rows_deleted = db_helpers.delete("DELETE FROM Wildlife WHERE id = ?", [wildlife_id])
    if n_rows_deleted == 0:
        return jsonify({"error": "Wildlife not found"}), 404

    image_field_values = [fv["value"] for fv in db_helpers.select_multiple(
        "SELECT value FROM FieldValues WHERE wildlife_id = ? AND field_id IN (SELECT id FROM Fields WHERE type = 'IMAGE')",
        [wildlife_id])]
    for image_filename in image_field_values:
        image_path = os.path.join(app.config["IMAGE_UPLOAD_FOLDER"], image_filename)
        if os.path.exists(image_path):
            os.remove(image_path)
    db_helpers.delete("DELETE FROM FieldValues WHERE wildlife_id = ?", [wildlife_id])
    db_helpers.delete("DELETE FROM EnumeratedFieldValues WHERE wildlife_id = ?", [wildlife_id])
    return jsonify({"message": "Wildlife successfully deleted"}), 200


if __name__ == "__main__":
    db_helpers.init_db()
    app.run(debug=True)
