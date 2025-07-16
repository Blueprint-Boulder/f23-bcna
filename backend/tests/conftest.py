import pytest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
@pytest.fixture
def client():
    app = create_app({
        'TESTING': True,
        'DATABASE': ':memory:',  # Use in-memory SQLite DB
        'IMAGE_UPLOAD_FOLDER': '/tmp/test_uploaded_images',  # Use a temp folder
    })

    with app.test_client() as client:
        with app.app_context():
            # Initialize your schema here if needed
            pass
        yield client