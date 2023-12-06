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
    category_id = request.form["category_id"]

    # Check if the category exists
    category_exists = db_helpers.select_one("SELECT 1 FROM Categories WHERE id = ?", (category_id,))
    if not category_exists:
        return jsonify({"error": "Category not found"}), 400

    wildlife_id = db_helpers.insert("INSERT INTO Wildlife (name, category_id) VALUES (?, ?)", (name, category_id))
    return jsonify({"message": "Wildlife created successfully", "wildlife_id": wildlife_id}), 201


@app.route("/api/search-wildlife/", methods=["GET"])
def search_wildlife():
    """Recursively search the provided category for a Wildlife whose name contains the query.
    If no category is provided, search across all Wildlife."""
    category_id = request.args.get("category_id")
    user_query = request.args.get("query")

    if category_id:
        # Recursively search the category if it's provided
        sql_query = """
        WITH RECURSIVE subcategories(id) AS (
            SELECT id FROM Categories WHERE id = ?
            UNION ALL
            SELECT c.id FROM Categories c INNER JOIN subcategories sc ON c.parent_id = sc.id
        )
        SELECT w.* FROM Wildlife w
        INNER JOIN subcategories sc ON w.category_id = sc.id
        WHERE w.name LIKE ?
        """
        params = (category_id, f'%{user_query}%')
    else:
        # Search across all wildlife if a category isn't provided
        sql_query = "SELECT * FROM Wildlife WHERE name LIKE ?"
        params = (f'%{user_query}%',)

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
