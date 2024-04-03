import sqlite3
from typing import Sequence, Any


def get_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def insert(query: str, params: Sequence[Any] = ()) -> int:
    """Executes an INSERT query and returns the last inserted row ID"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
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
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchone()
    conn.close()
    if result:
        return dict(result)
    else:
        return None


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    with open("create.sql", "r") as sql_file:
        sql_script = sql_file.read()
    cursor.executescript(sql_script)
    conn.commit()
    conn.close()
