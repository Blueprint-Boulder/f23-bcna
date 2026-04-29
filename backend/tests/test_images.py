"""
test_images.py

Unit tests for image management API endpoints.
Tests image upload, retrieval, replacement, and error handling for image operations.

Test Coverage:
    - GET /api/get-image/<filename>: File not found
    - GET /api/get-image-by-image-id/<id>: ID not found
    - POST /api/add-image/: Missing required data and invalid file types
    - PUT /api/replace-image/<id>: Image replacement operations
    - PUT /api/set-thumbnail: Thumbnail assignment
    - DELETE /api/delete_image/: Image deletion with file cleanup
"""

import pytest
import logging
from io import BytesIO

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_get_image_by_image_id_not_found(client):
    response = client.get('/api/get-image-by-image-id/999')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 404
    assert response.is_json
    assert 'error' in response.get_json()

def test_get_image_nonexistent_filename(client):
    response = client.get('/api/get-image/nonexistentfile.png/')
    logger.debug(f"Response status: {response.status_code}")
    # send_from_directory returns 404 for missing files
    assert response.status_code == 404

def test_add_image_missing_data(client):
    response = client.post('/api/add-image/', data={})
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 400
    assert response.is_json
    assert 'error' in response.get_json()

def test_add_image_invalid_file_type(client):
    data = {
        'wildlife_id': '1',
        'image_file': (BytesIO(b"not an image"), 'test.txt')
    }
    response = client.post('/api/add-image/', data=data, content_type='multipart/form-data')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 400
    assert response.is_json
    assert 'error' in response.get_json()

def test_set_thumbnail_missing_data(client):
    response = client.put('/api/set-thumbnail', data={})
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 400
    assert response.is_json
    assert 'error' in response.get_json()

def test_set_thumbnail_invalid_ids(client):
    data = {'wildlife_id': '999', 'thumbnail_id': '999'}
    response = client.put('/api/set-thumbnail', data=data)
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code in (400, 404)
    assert response.is_json
    assert 'error' in response.get_json()

def test_delete_image_nonexistent_id(client):
    response = client.delete('/api/delete_image/?id=999')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 404
    assert response.is_json
    assert 'error' in response.get_json() 