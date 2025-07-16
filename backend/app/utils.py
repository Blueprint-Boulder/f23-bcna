import os
import uuid
from werkzeug.utils import secure_filename
from flask import jsonify
from app import db_helpers

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


def save_file(file, upload_folder):
    """Generates a unique filename and saves the file to the given upload_folder."""
    original_name = secure_filename(file.filename)
    extension = original_name.rsplit('.', 1)[1] if '.' in original_name else ''
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)
    return unique_filename