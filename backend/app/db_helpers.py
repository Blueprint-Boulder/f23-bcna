"""
db_helpers.py

Database abstraction layer for the Blueprint Wildlife Database backend.
Handles all SQLite database operations, dataset management, and file path resolution.

Key Features:
    - Multi-dataset support (butterflies, dragonflies, wildflowers)
    - Dataset-aware query execution based on request context
    - Automatic database schema initialization and migration
    - Image upload folder management with fallback search

Database Operations:
    - insert(): Execute INSERT queries and return last inserted row ID
    - mutate(): Execute UPDATE or DELETE queries and return affected row count
    - update(): Alias for mutate() for UPDATE queries
    - delete(): Alias for mutate() for DELETE queries
    - select_multiple(): Execute SELECT queries and return all results as list of dicts
    - select_one(): Execute SELECT queries and return first result as dict
"""

import os
import json
import sqlite3
from typing import Sequence, Any
from flask import current_app, has_app_context, has_request_context, request

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(THIS_FOLDER)
DATA_FOLDER = os.path.join(PROJECT_ROOT, "data")

DEFAULT_DB_PATH = os.path.join(DATA_FOLDER, "butterflies", "database.db")
DEFAULT_IMAGE_UPLOAD_FOLDER = os.path.join(
    DATA_FOLDER, "butterflies", "uploaded_images"
)


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
        return current_app.config.get(
            "IMAGE_UPLOAD_FOLDER", DEFAULT_IMAGE_UPLOAD_FOLDER
        )
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

        fallback_folder = current_app.config.get(
            "IMAGE_UPLOAD_FOLDER", DEFAULT_IMAGE_UPLOAD_FOLDER
        )
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
    This also works with INSERT, but if you want to get the last inserted row ID, you should use the insert function instead.
    """
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


def _dedupe_family_field(conn):
    """Merge any case-variant duplicates of the 'family' field into a single
    lowercase 'family' field.

    The earlier `_seed_family_field` used a case-sensitive existence check, so
    on a dataset that already had a capital 'Family' field it would create a
    second lowercase 'family' row. This collapses those duplicates: the field
    with the most existing values is kept as canonical, everything pointing at
    the redundant rows is repointed to it, the redundant rows are deleted, and
    the survivor is renamed to lowercase 'family'.
    """
    cursor = conn.cursor()

    # Find all fields whose name is some case-variant of "family".
    cursor.execute("SELECT id, name FROM Fields WHERE LOWER(name) = 'family'")
    family_fields = [
        (r[0] if isinstance(r, tuple) else r["id"]) for r in cursor.fetchall()
    ]
    if not family_fields:
        return

    # Pick the canonical field: the one with the most FieldValues (the
    # data-bearing original), tie-broken by lowest id.
    def value_count(field_id):
        cursor.execute(
            "SELECT COUNT(*) FROM FieldValues WHERE field_id = ?", (field_id,)
        )
        return cursor.fetchone()[0]

    canonical_id = max(family_fields, key=lambda fid: (value_count(fid), -fid))
    redundant_ids = [fid for fid in family_fields if fid != canonical_id]

    for redundant_id in redundant_ids:
        # Repoint FieldValues to the canonical field where it doesn't already
        # have a value for that wildlife; drop the rest (PK collisions).
        cursor.execute(
            """UPDATE FieldValues SET field_id = ?
               WHERE field_id = ?
                 AND wildlife_id NOT IN (
                     SELECT wildlife_id FROM FieldValues WHERE field_id = ?
                 )""",
            (canonical_id, redundant_id, canonical_id),
        )
        cursor.execute("DELETE FROM FieldValues WHERE field_id = ?", (redundant_id,))

        # Repoint category associations, then drop the redundant ones.
        cursor.execute(
            """INSERT OR IGNORE INTO FieldsToCategories (field_id, category_id)
               SELECT ?, category_id FROM FieldsToCategories WHERE field_id = ?""",
            (canonical_id, redundant_id),
        )
        cursor.execute(
            "DELETE FROM FieldsToCategories WHERE field_id = ?", (redundant_id,)
        )

        # Strip the redundant id from any stored field_order. The canonical id
        # is re-derived from the category's fields when reading, so we only need
        # to remove the dangling reference here.
        cursor.execute(
            "SELECT id, field_order FROM Categories WHERE field_order IS NOT NULL"
        )
        for cat_row in cursor.fetchall():
            cat_id = cat_row[0] if isinstance(cat_row, tuple) else cat_row["id"]
            order_json = cat_row[1] if isinstance(cat_row, tuple) else cat_row["field_order"]
            try:
                order = json.loads(order_json)
            except (TypeError, ValueError):
                continue
            new_order = [fid for fid in order if fid != redundant_id]
            if new_order != order:
                cursor.execute(
                    "UPDATE Categories SET field_order = ? WHERE id = ?",
                    (json.dumps(new_order), cat_id),
                )

        cursor.execute("DELETE FROM Fields WHERE id = ?", (redundant_id,))

    # Standardize the survivor's name to lowercase 'family'.
    cursor.execute(
        "UPDATE Fields SET name = 'family' WHERE id = ? AND name != 'family'",
        (canonical_id,),
    )
    conn.commit()


def _seed_family_field(conn):
    """Ensure a 'family' TEXT field exists and is associated with all root categories."""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Fields WHERE LOWER(name) = 'family'")
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

        # Migrate: add metadata column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE Images ADD COLUMN metadata JSONB")
            conn.commit()
        except sqlite3.OperationalError:
            pass  # Column already exists

        # Migrate: add field_order column if it doesn't exist
        try:
            cursor.execute("ALTER TABLE Categories ADD COLUMN field_order TEXT")
            conn.commit()
        except sqlite3.OperationalError:
            pass  # Column already exists

        _dedupe_family_field(conn)
        _seed_family_field(conn)
        conn.close()
        print(f"[DB DEBUG] Dataset '{entry.name}' initialized with 'family' field.")
