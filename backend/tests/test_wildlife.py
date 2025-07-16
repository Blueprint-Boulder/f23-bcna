import pytest
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def test_get_wildlife_empty(client):
    response = client.get('/api/get-wildlife/')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 200
    assert response.is_json
    assert isinstance(response.get_json(), list)

def test_get_wildlife_by_id_not_found(client):
    response = client.get('/api/get-wildlife-by-id/999')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 404
    assert response.is_json
    assert 'error' in response.get_json()

def test_delete_wildlife_not_found(client):
    response = client.delete('/api/delete-wildlife/?id=999')
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    assert response.status_code == 404
    assert response.is_json
    assert 'error' in response.get_json()

def test_create_wildlife_missing_fields(client):
    response = client.post('/api/create-wildlife/', data={})
    logger.debug(f"Response status: {response.status_code}, JSON: {response.get_json()}")
    # Should fail due to missing required fields
    assert response.status_code in (400, 500)
    assert response.is_json
