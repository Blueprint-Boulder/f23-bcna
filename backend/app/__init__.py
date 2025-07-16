from flask import Flask
from flask_cors import CORS
from app.routes.wildlife import wildlife_bp
from app.routes.categories import categories_bp
from app.routes.images import images_bp

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:3000"])
    print("[CORS DEBUG] CORS enabled for all routes.")
    app.config["IMAGE_UPLOAD_FOLDER"] = "uploaded_images"
    app.register_blueprint(wildlife_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(images_bp)
    return app