from flask import Blueprint, request, jsonify, current_app, send_from_directory
import os
from app import db_helpers
# from .utils import save_file, get_parent_ids  # Adjust import if needed
from app.utils import save_file  # Adjust import if needed
import sqlite3

images_bp = Blueprint('images', __name__)

@images_bp.route("/api/get-image/<string:filename>/", strict_slashes = False, methods=["GET"])
def get_image(filename):
    """
    Gets a user-uploaded image file by its filename. Used for getting images associated with wildlife.

    Example request:
    GET /api/get-image/1234abcd.png

    Example output:
    (The image file)
    """
    image_folder = current_app.config["IMAGE_UPLOAD_FOLDER"]
    print(f"[DEBUG] Requested image filename: {filename}")
    print(f"[DEBUG] Image folder: {image_folder}")
    file_path = os.path.join(image_folder, filename)
    print(f"[DEBUG] Full file path: {file_path}")
    if not os.path.exists(file_path):
        print(f"[DEBUG] File does not exist: {file_path}")
    else:
        print(f"[DEBUG] File exists: {file_path}")
    return send_from_directory(image_folder, filename)



@images_bp.route("/api/add-image/", methods=["POST"])
def add_image():
    """
    Add an image to a wildlife instance.
    Requires wildlife_id and image_file
    """
    wildlife_id = request.form.get("wildlife_id")
    image_file = request.files.get("image_file")
    if not wildlife_id or not image_file:
        return jsonify({"error": "Both wildlife_id and image_file are required"}), 400

    file_length = image_file.seek(0, os.SEEK_END)
    image_file.seek(0, os.SEEK_SET)
    print("file_length", file_length)
    if file_length > 10 * 1024 * 1024:
        return jsonify({"error": f"The image file {image_file.filename} is too large (max 10 MB)"}), 400
    if not image_file.mimetype.startswith("image/"):
        return jsonify({"error": f"The file {image_file.filename} is not an image (its MIME type is {image_file.mimetype}, which doesn't start with 'image/')"}), 400

    saved_filename = save_file(image_file, current_app.config["IMAGE_UPLOAD_FOLDER"])
    # Insert the image and get its ID
    image_id = db_helpers.insert(
        "INSERT INTO Images (wildlife_id, image_path) VALUES (?, ?)",
        (wildlife_id, saved_filename)
    )


    return jsonify({"message": "Image added successfully", "image_id": image_id, "image_path": saved_filename}), 201

@images_bp.route("/api/set-thumbnail", methods=["PUT"])
def set_thumbnail():
    # Ensure both wildlife and image exist in the database
    wildlife_id = request.form.get("wildlife_id")
    thumbnail_id = request.form.get("thumbnail_id")

    # Validate input
    if not wildlife_id or not thumbnail_id:
        return jsonify({"error": "wildlife_id and thumbnail_id are required"}), 400

    # Check if wildlife exists
    wildlife = db_helpers.select_one("SELECT id FROM Wildlife WHERE id = ?", [wildlife_id])
    if not wildlife:
        return jsonify({"error": f"Wildlife with id {wildlife_id} does not exist"}), 404

    # Check if image exists and belongs to the wildlife
    if thumbnail_id != 'null':
        image = db_helpers.select_one("SELECT id FROM Images WHERE id = ? AND wildlife_id = ?", [thumbnail_id, wildlife_id])
        if not image:
            return jsonify({"error": f"Image with id {thumbnail_id} does not exist for wildlife {wildlife_id}"}), 404

    # Update the thumbnail_id in the Wildlife table
    db_helpers.mutate(
        "UPDATE Wildlife SET thumbnail_id = ? WHERE id = ?",
        (thumbnail_id, wildlife_id)
    )

    return jsonify({"message": "Thumbnail updated successfully", "wildlife_id": wildlife_id, "thumbnail_id": thumbnail_id}), 200


@images_bp.route("/api/get-images-by-wildlife-id/<int:wildlife_id>", methods=["GET"])
def get_images_by_wildlife_id(wildlife_id):
    """
    Get all images for a wildlife instance.
    Requires wildlife_id.
    """
    print("get_images_by_wildlife_id", wildlife_id)
    try:
        images = db_helpers.select_multiple("SELECT id, image_path FROM Images WHERE wildlife_id = ?", [wildlife_id])
        # print(images)
        return jsonify(images), 200
    except Exception as e:
        print("Error in get_images_by_wildlife_id:", e)
        return jsonify({"error": str(e)}), 500


@images_bp.route("/api/get-image-by-image-id/<int:image_id>", methods=["GET"])
def get_image_by_image_id(image_id):
    """
    Gets a user-uploaded image file by its image ID.
    Example request:
    GET /api/get-image-by-image-id/2
    """
    image = db_helpers.select_one("SELECT image_path FROM Images WHERE id = ?", [image_id])
    if image is None:
        return jsonify({"error": "Image not found"}), 404

    # Convert to dict if needed
    if isinstance(image, sqlite3.Row):
        print("heyyy")
        image = dict(image)

    if "image_path" not in image:
        return jsonify({"error": "Image not found"}), 404

    filename = image["image_path"]
    return send_from_directory(current_app.config["IMAGE_UPLOAD_FOLDER"], filename)


@images_bp.route("/api/delete_image/", methods=["DELETE"])
def delete_image(): 
    """
    Deletes an image. If that image is the thumbnail, sets thumbnail_id to null until a new thumbnail is assigned.
    Also deletes the image file from uploaded_images.

    Example request: 
    DELETE /api/delete_image/?id=2
    """
    import os

    image_id = request.args["id"]
    image = db_helpers.select_one("SELECT * FROM Images WHERE id = ?", [image_id])
    if not image:
        return jsonify({"error": f"Image with id {image_id} not found"}), 404

    # Delete the image file from uploaded_images
    image_path = image.get("image_path")
    if image_path:
        upload_dir = current_app.config["IMAGE_UPLOAD_FOLDER"]
        file_path = os.path.join(upload_dir, image_path)
        print("i am here")
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            # Log the error but continue with DB deletion
            print(f"Error deleting image file {file_path}: {e}")

    # Check if the image is the thumbnail for its wildlife
    wildlife = db_helpers.select_one("SELECT id, thumbnail_id, name FROM Wildlife WHERE id = ?", [image["wildlife_id"]])
    is_thumbnail = False
    if wildlife and wildlife["thumbnail_id"] is not None:
        is_thumbnail = str(wildlife["thumbnail_id"]) == str(image_id)

    # Delete the image from the database
    db_helpers.delete("DELETE FROM Images WHERE id = ?", [image_id])

    if is_thumbnail and wildlife:
        db_helpers.mutate("UPDATE Wildlife SET thumbnail_id = NULL WHERE id = ?", [wildlife["id"]])
        return jsonify({
            "message": (
                f"Image successfully deleted. Warning: this was the thumbnail for wildlife '{wildlife.get('name', '')}' "
                f"(ID: {wildlife['id']}). Please set a new thumbnail."
            )
        }), 200
    else: 
        return jsonify({"message": "Image successfully deleted"}), 200

