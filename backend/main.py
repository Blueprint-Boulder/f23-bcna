from typing import Sequence, Any

from flask import Flask, jsonify, request
from flask_cors import CORS
import db_helpers

app = Flask(__name__)
CORS(app)


@app.route("/api")
def hello_world():
    return 'Hello, from Flask!'


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

    field_id = db_helpers.insert("INSERT INTO Fields (name, type, category_id) VALUES (?, ?, ?)", (name, typ, category_id))
    return jsonify({"message": "Field created successfully", "field_id": field_id}), 201


if __name__ == "__main__":
    db_helpers.init_db()
    app.run(debug=True)
