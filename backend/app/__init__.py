from flask import Flask
from flask_cors import CORS
from app.routes.wildlife import wildlife_bp
from app.routes.categories import categories_bp
from app.routes.images import images_bp

import os

def create_app(test_config=None):
    app = Flask(__name__)

    # Set default config
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE='database.db',
        IMAGE_UPLOAD_FOLDER=os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploaded_images"),
    )

    # Override with test config if provided
    if test_config is not None:
        app.config.update(test_config)

    # Enable CORS for frontend
    CORS(app, origins=["http://localhost:3000"])
    print("[CORS DEBUG] CORS enabled for all routes.")

    # Register blueprints
    app.register_blueprint(wildlife_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(images_bp)

    return app