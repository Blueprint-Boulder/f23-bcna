"""
api_callers.py

HTTP client utilities for interacting with the Blueprint Wildlife Database backend API.
Provides high-level functions for creating wildlife, fields, and categories.
Primarily used for administrative tasks and API testing.

Note: This module is designed to be called from external scripts or CLI tools.
      The API endpoints it calls should be authenticated for production use.
"""

from typing import Literal
import requests

BASE_URL = "http://127.0.0.1:5001/api"


def server_running() -> bool:
    """Check if the backend server is running and accessible.
    
    Returns:
        bool: True if the server is responding to /ping/ endpoint, False otherwise
    """
    response = requests.get(f"{BASE_URL}/ping/")
    return response.status_code == 200


def complain_if_server_not_running():
    """Verify server is running before making API calls.
    
    Raises:
        Exception: If the server is not running
    """
    if not server_running():
        raise Exception("Couldn't connect to the backend. Is it running?")


def create_wildlife(name: str, scientific_name: str, category_id: int,
                    custom_field_values: dict[str, str | int]) -> int:
    """Create a new wildlife entry in the database.
    
    Args:
        name: Common name of the wildlife species
        scientific_name: Scientific binomial name (e.g., Vulpes vulpes)
        category_id: Database ID of the parent category
        custom_field_values: Dictionary of field names to values for custom fields
    
    Returns:
        int: The database ID of the newly created wildlife entry
    
    Raises:
        Exception: If server is not running or creation fails
    """
    complain_if_server_not_running()
    response = requests.post(f"{BASE_URL}/create-wildlife/",
                             data={"name": name, "scientific_name": scientific_name, "category_id": category_id,
                                   **custom_field_values})
    if response.status_code == 201:
        return response.json()["wildlife_id"]
    else:
        raise Exception(
            f"Failed to create wildlife (server returned {response.status_code}). Full response: {response.text}")


def create_field(name: str, type: Literal["INTEGER", "TEXT"], category_ids: list[int]):
    """Create a new custom field and associate it with categories.
    
    Args:
        name: Name of the field (e.g., "wingspan", "habitat")
        type: Field data type, either "INTEGER" or "TEXT"
        category_ids: List of category database IDs this field belongs to
    
    Returns:
        int: The database ID of the newly created field
    
    Raises:
        Exception: If server is not running or creation fails
    """
    complain_if_server_not_running()
    response = requests.post(f"{BASE_URL}/create-field/",
                             data={"name": name, "type": type, "category_id": category_ids})
    if response.status_code == 201:
        return response.json()["field_id"]
    else:
        raise Exception(f"Failed to create field (server returned {response.status_code}). Full response: {response.text}")


def create_category(name: str, parent_id: int | None = None) -> int:
    """Create a new category (potentially nested under a parent category).
    
    Args:
        name: Name of the category (e.g., "Butterflies", "Birds")
        parent_id: Optional database ID of the parent category for nesting
    
    Returns:
        int: The database ID of the newly created category
    
    Raises:
        Exception: If server is not running or creation fails
    """
    complain_if_server_not_running()
    data = {"name": name, "parent_id": parent_id}
    if parent_id:
        data["parent_id"] = parent_id
    response = requests.post(f"{BASE_URL}/create-category/", data=data)
    if response.status_code == 201:
        return response.json()["category_id"]
    else:
        raise Exception(
            f"Failed to create category (server returned {response.status_code}). Full response: {response.text}")