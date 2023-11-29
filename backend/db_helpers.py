import sqlite3
from typing import Sequence, Any


def get_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def insert(query: str, params: Sequence[Any] = ()) -> int:
    """Executes an INSERT query and returns the last inserted row id"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    last_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return last_id


def select_multiple(query: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
    """Executes a SELECT query and returns the results as a list of rows (dicts)"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    return [dict(row) for row in results]


def select_one(query: str, params: Sequence[Any] = ()) -> dict[str, Any]:
    """Executes a SELECT query and returns the first result as a dict"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    result = cursor.fetchone()
    conn.close()
    return dict(result)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    with open("create.sql", "r") as sql_file:
        sql_script = sql_file.read()
    cursor.executescript(sql_script)
    conn.commit()
    conn.close()