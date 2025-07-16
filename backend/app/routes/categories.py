from flask import Blueprint, request, jsonify, current_app
import os
from app import db_helpers
# from .utils import save_file, get_parent_ids  # Adjust import if needed
from werkzeug.utils import secure_filename
from app.utils import save_file, get_parent_ids, get_subcategory_ids  # Adjust import if needed

categories_bp = Blueprint('category', __name__)


@categories_bp.route("/api/create-category/", methods=["POST"])
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


@categories_bp.route("/api/get-categories/", methods=["GET"])
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


@categories_bp.route("/api/get-categories-and-fields/", methods=["GET"])
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





@categories_bp.route("/api/delete-category/", methods=["DELETE"])
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
