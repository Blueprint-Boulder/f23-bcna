from typing import Literal

import requests

BASE_URL = "http://127.0.0.1:5000/api"


def server_running() -> bool:
    response = requests.get(f"{BASE_URL}/ping/")
    return response.status_code == 200


def complain_if_server_not_running():
    if not server_running():
        raise Exception("Couldn't connect to the backend. Is it running?")


def create_wildlife(name: str, scientific_name: str, category_id: int,
                    custom_field_values: dict[str, str]) -> int:
    complain_if_server_not_running()
    response = requests.post(f"{BASE_URL}/create-wildlife/",
                             data={"name": name, "scientific_name": scientific_name, "category_id": category_id,
                                   **custom_field_values})
    if response.status_code == 201:
        return response.json()["wildlife_id"]
    else:
        raise Exception(
            f"Failed to create wildlife (server returned {response.status_code}). Full response: {response.text}")


def create_field(name: str, type: Literal["NUMBER", "TEXT"], category_ids: list[int]):
    complain_if_server_not_running()
    response = requests.post(f"{BASE_URL}/create-field/",
                             data={"name": name, "type": type, "category_id": category_ids})
    if response.status_code == 201:
        return response.json()["field_id"]
    else:
        raise Exception(f"Failed to create field (server returned {response.status_code}). Full response: {response.text}")


def create_category(name: str, parent_id: int | None = None) -> int:
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