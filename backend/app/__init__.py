from flask import Flask, jsonify, request
from flask_cors import CORS
from app.routes.wildlife import wildlife_bp
from app.routes.categories import categories_bp
from app.routes.images import images_bp

import os


def _normalize_dataset_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def _discover_dataset_configs(base_dir: str) -> dict[str, dict[str, str]]:
    dataset_configs: dict[str, dict[str, str]] = {}

    for entry in os.scandir(base_dir):
        if not entry.is_dir():
            continue
        db_path = os.path.join(entry.path, "database.db")
        if not os.path.isfile(db_path):
            continue

        key = _normalize_dataset_name(entry.name)
        dataset_configs[key] = {
            "name": entry.name,
            "db_path": db_path,
            "image_upload_folder": os.path.join(entry.path, "uploaded_images"),
        }

    return dataset_configs


def create_app(test_config=None):
    app = Flask(__name__)
    backend_dir = os.path.dirname(os.path.dirname(__file__))

    # Set default config
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(backend_dir, "database.db"),
        IMAGE_UPLOAD_FOLDER=os.path.join(backend_dir, "uploaded_images"),
        DATASET_CONFIGS={},
        DEFAULT_DATASET=None,
    )

    # Override with test config if provided
    if test_config is not None:
        app.config.update(test_config)

    # Auto-discover dataset folders for normal runtime; keep tests simple when DATABASE is explicitly overridden.
    if not app.config.get("DATASET_CONFIGS"):
        if test_config is not None and "DATABASE" in test_config:
            app.config["DATASET_CONFIGS"] = {}
        else:
            app.config["DATASET_CONFIGS"] = _discover_dataset_configs(backend_dir)

    if app.config["DATASET_CONFIGS"] and not app.config.get("DEFAULT_DATASET"):
        if "butterflies" in app.config["DATASET_CONFIGS"]:
            app.config["DEFAULT_DATASET"] = "butterflies"
        else:
            app.config["DEFAULT_DATASET"] = sorted(app.config["DATASET_CONFIGS"].keys())[0]

    # Enable CORS for frontend
    CORS(app, origins=["http://localhost:3000"])
    print("[CORS DEBUG] CORS enabled for all routes.")

    @app.before_request
    def validate_dataset():
        dataset = request.args.get("dataset")
        if not dataset:
            return None
        dataset_key = _normalize_dataset_name(dataset)
        if dataset_key not in app.config["DATASET_CONFIGS"]:
            return jsonify({
                "error": f"Unknown dataset '{dataset}'",
                "available_datasets": sorted(app.config["DATASET_CONFIGS"].keys()),
            }), 400
        return None

    @app.get("/api/datasets/")
    def get_datasets():
        return jsonify({
            "default_dataset": app.config.get("DEFAULT_DATASET"),
            "datasets": sorted(app.config["DATASET_CONFIGS"].keys()),
        }), 200

    # Register blueprints
    app.register_blueprint(wildlife_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(images_bp)

    return app
