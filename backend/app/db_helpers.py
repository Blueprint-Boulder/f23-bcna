import os
import sqlite3
from typing import Sequence, Any
from flask import current_app, has_app_context, has_request_context, request

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(THIS_FOLDER)
DATA_FOLDER = os.path.join(PROJECT_ROOT, "data")

DEFAULT_DB_PATH = os.path.join(DATA_FOLDER, "butterflies", "database.db")
DEFAULT_IMAGE_UPLOAD_FOLDER = os.path.join(DATA_FOLDER, "butterflies", "uploaded_images")


def _normalize_dataset_name(name: str) -> str:
    return name.strip().lower().replace(" ", "_")


def _get_selected_dataset_key() -> str | None:
    if not has_request_context():
        return None

    dataset_raw = request.args.get("dataset")
    if not dataset_raw:
        return None
    return _normalize_dataset_name(dataset_raw)


def _get_dataset_config() -> dict[str, str] | None:
    if not has_app_context():
        return None

    dataset_configs = current_app.config.get("DATASET_CONFIGS", {})
    if not dataset_configs:
        return None

    selected_dataset = _get_selected_dataset_key()
    if selected_dataset and selected_dataset in dataset_configs:
        return dataset_configs[selected_dataset]

    default_dataset = current_app.config.get("DEFAULT_DATASET")
    if default_dataset and default_dataset in dataset_configs:
        return dataset_configs[default_dataset]

    return None


def get_active_database_path() -> str:
    dataset_config = _get_dataset_config()
    if dataset_config:
        return dataset_config["db_path"]

    if has_app_context():
        return current_app.config.get("DATABASE", DEFAULT_DB_PATH)
    return DEFAULT_DB_PATH

def ensure_upload_folder_exists():
    folder = get_active_image_upload_folder()
    if not os.path.exists(folder):
        os.makedirs(folder, exist_ok=True)
        print(f"[DB DEBUG] Created missing folder: {folder}")
    return folder

def get_active_image_upload_folder() -> str:
    dataset_config = _get_dataset_config()
    if dataset_config:
        return dataset_config["image_upload_folder"]

    if has_app_context():
        return current_app.config.get("IMAGE_UPLOAD_FOLDER", DEFAULT_IMAGE_UPLOAD_FOLDER)
    return DEFAULT_IMAGE_UPLOAD_FOLDER


def find_existing_image_folder(filename: str) -> str | None:
    preferred_folder = get_active_image_upload_folder()
    preferred_path = os.path.join(preferred_folder, filename)
    if os.path.exists(preferred_path):
        return preferred_folder

    if has_app_context():
        for dataset in current_app.config.get("DATASET_CONFIGS", {}).values():
            folder = dataset["image_upload_folder"]
            if os.path.exists(os.path.join(folder, filename)):
                return folder

        fallback_folder = current_app.config.get("IMAGE_UPLOAD_FOLDER", DEFAULT_IMAGE_UPLOAD_FOLDER)
        if os.path.exists(os.path.join(fallback_folder, filename)):
            return fallback_folder

    return None


def get_connection():
    db_path = get_active_database_path()
    print(f"[DB DEBUG] Attempting to connect to database: {db_path}")  # Debug
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row 
        print("[DB DEBUG] Database connection established.")
        return conn
    except Exception as e:
        print(f"[DB DEBUG] Database connection failed: {e}")
        raise


def insert(query: str, params: Sequence[Any] = ()) -> int:
    """Executes an INSERT query and returns the last inserted row ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    if last_id is None:
        raise Exception("Failed to insert row")
    return last_id


def mutate(query: str, params: Sequence[Any] = ()) -> int:
    """Executes a mutating query (UPDATE or DELETE) and returns the number of affected rows.
    This also works with INSERT, but if you want to get the last inserted row ID, you should use the insert function instead."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    n_rows_affected = cursor.rowcount
    conn.commit()
    conn.close()
    return n_rows_affected


update = mutate
delete = mutate


def select_multiple(query: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
    """Executes a SELECT query and returns the results as a list of rows (dicts)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]


def select_one(query: str, params: Sequence[Any] = ()) -> dict[str, Any] | None:
    """Executes a SELECT query and returns the first result as a dict"""
    print(f"[DB DEBUG] Executing SELECT ONE: {query} | Params: {params}")
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchone()
    conn.close()
    print(f"[DB DEBUG] Result: {result}")
    if result:
        return dict(result)
    else:
        return None


def init_db():
    print("[DB DEBUG] Initializing database...")
    conn = get_connection()
    cursor = conn.cursor()
    with open(os.path.join(THIS_FOLDER, "create.sql"), "r") as sql_file:
        sql_script = sql_file.read()
    cursor.executescript(sql_script)
    conn.commit()
    conn.close()
    print("[DB DEBUG] Database initialized!")


def _seed_family_field(conn):
    """Ensure a 'family' TEXT field exists and is associated with all root categories."""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Fields WHERE name = 'family'")
    row = cursor.fetchone()
    if row is None:
        cursor.execute("INSERT INTO Fields (name, type) VALUES ('family', 'TEXT')")
        family_field_id = cursor.lastrowid
    else:
        family_field_id = row[0] if isinstance(row, tuple) else row["id"]

    # Associate with all root categories that aren't already linked
    cursor.execute("SELECT id FROM Categories WHERE parent_id IS NULL")
    root_categories = cursor.fetchall()
    for cat in root_categories:
        cat_id = cat[0] if isinstance(cat, tuple) else cat["id"]
        cursor.execute(
            "SELECT 1 FROM FieldsToCategories WHERE field_id = ? AND category_id = ?",
            (family_field_id, cat_id),
        )
        if cursor.fetchone() is None:
            cursor.execute(
                "INSERT INTO FieldsToCategories (field_id, category_id) VALUES (?, ?)",
                (family_field_id, cat_id),
            )
    conn.commit()


EXPECTED_DATASETS = ["butterflies", "dragonflies", "wildflowers"]


def init_all_dbs():
    """Initialize schema and seed the 'family' field for every dataset database."""
    sql_path = os.path.join(THIS_FOLDER, "create.sql")
    with open(sql_path, "r") as sql_file:
        sql_script = sql_file.read()

    # Ensure the data folder and expected dataset directories exist
    os.makedirs(DATA_FOLDER, exist_ok=True)
    for dataset in EXPECTED_DATASETS:
        dataset_dir = os.path.join(DATA_FOLDER, dataset)
        os.makedirs(dataset_dir, exist_ok=True)
        os.makedirs(os.path.join(dataset_dir, "uploaded_images"), exist_ok=True)

    for entry in os.scandir(DATA_FOLDER):
        if not entry.is_dir():
            continue
        db_path = os.path.join(entry.path, "database.db")
        print(f"[DB DEBUG] Initializing database for dataset '{entry.name}': {db_path}")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.executescript(sql_script)
        conn.commit()

        # Migrate: add field_order column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE Categories ADD COLUMN field_order TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            pass  # Column already exists

        _seed_family_field(conn)
        conn.close()
        print(f"[DB DEBUG] Dataset '{entry.name}' initialized with 'family' field.")
