from typing import Sequence, Any

from flask import Flask, jsonify, request
from flask_cors import CORS
import db_helpers

app = Flask(__name__)
CORS(app)


@app.route("/api")
def hello_world():
    return 'Hello, from Flask!'


@app.route("/api/create-wildlife/", methods=["POST"])
def create_wildlife():
    name = request.form["name"]
    scientific_name = request.form["scientific_name"]
    category_id = request.form["category_id"]

    # Check if the category exists
    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    wildlife_id = db_helpers.insert("INSERT INTO Wildlife (name, scientific_name, category_id) VALUES (?, ?, ?)", (name, scientific_name, category_id))
    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201


def get_all_category_ids(top_level_category_ids):
    """
    Extracts all category IDs, including subcategories, from a list of top-level category IDs.
    """
    if not top_level_category_ids:
        return []

    placeholders = ','.join('?' for _ in top_level_category_ids)  # Create a placeholder string for SQL query

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
    Search within the provided set of categories for Wildlife whose name or scientific name contains the query.
    Searches all wildlife if no categories are provided.
    Case-insensitive.
    """
    category_ids = request.args.getlist("category_id", type=int)
    user_query = request.args.get("query")

    if category_ids:
        all_category_ids = get_all_category_ids(category_ids)
        # This special case is necessary because "IN ()" is invalid syntax (it needs at least one value inside the parenthesis)
        if not all_category_ids:
            return jsonify([]), 200  # Return an empty list if no categories found

        placeholders = ','.join('?' for _ in all_category_ids)  # Create a placeholder string for SQL query

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

        placeholders = ','.join('?' for _ in all_category_ids)  # Create a placeholder string for SQL query

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
    name = request.form["name"]
    parent_id = request.form.get("parent_id")  # parent_id is optional

    # Check if parent category exists
    if parent_id:
        parent_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (parent_id,))
        if not parent_exists:
            return jsonify({"error": "Parent category not found"}), 400

    category_id = db_helpers.insert("INSERT INTO Categories (name, parent_id) VALUES (?, ?)", (name, parent_id))
    return jsonify({"message": "Category created successfully", "category_id": category_id}), 201


@app.route("/api/get-categories/", methods=["GET"])
def get_categories():
    categories = db_helpers.select_multiple("SELECT * FROM Categories")
    return jsonify(categories), 200


@app.route("/api/get-categories-and-fields/", methods=["GET"])
def get_categories_and_fields():
    def get_fields_for_category(category_id):
        # Retrieve fields for a specific category
        return db_helpers.select_multiple(
            "SELECT type, name FROM Fields WHERE category_id = ?", [category_id])

    def construct_category_structure(category_id=None):
        # Base query to select categories. If category_id is provided, it selects subcategories; otherwise, top-level categories
        category_query = "SELECT id, name FROM Categories WHERE parent_id = ?" if category_id else "SELECT id, name FROM Categories WHERE parent_id IS NULL"
        categories = db_helpers.select_multiple(category_query, [category_id] if category_id else [])

        category_list = []
        for category in categories:
            # Construct the category object
            category_obj = {
                "name": category['name'],
                "fields": get_fields_for_category(category['id']),
                "subcategories": construct_category_structure(category['id'])  # Recursively get subcategories
            }
            category_list.append(category_obj)

        return category_list

    # Start constructing the structure from top-level categories (those without a parent)
    categories_structure = construct_category_structure()

    return jsonify({"categories": categories_structure}), 200


@app.route("/api/create-field/", methods=["POST"])
def create_field():
    name = request.form["name"]
    typ = request.form["type"]
    category_id = request.form["category_id"]

    # Check if category exists
    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    # Check if field type is valid
    if typ not in ("INTEGER", "TEXT"):
        return jsonify({"error": "Invalid field type. Allowed types are INTEGER and TEXT."}), 400

    field_id = db_helpers.insert("INSERT INTO Fields (name, type, category_id) VALUES (?, ?, ?)",
                                 (name, typ, category_id))
    return jsonify({"message": "Field created successfully", "field_id": field_id}), 201


if __name__ == "__main__":
    db_helpers.init_db()
    app.run(debug=True)
