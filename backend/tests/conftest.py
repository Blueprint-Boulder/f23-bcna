"""
conftest.py

Pytest configuration and fixtures for Blueprint Wildlife Database backend tests.
Provides test client setup with isolated temporary database for each test.

Fixtures:
    - client: Flask test client with temporary SQLite database
"""

import pytest
import sys
import os
import tempfile

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import create_app
from app import db_helpers

@pytest.fixture
def client():
    """Create test client with isolated temporary database.
    
    Yields:
        Flask test client connected to temporary SQLite database
        
    Cleanup:
        Temporary database file is deleted after test completes
    """
    db_fd, db_path = tempfile.mkstemp(suffix='.db')
    app = create_app({
        'TESTING': True,
        'DATABASE': db_path,
        'IMAGE_UPLOAD_FOLDER': '/tmp/test_uploaded_images',
    })

    with app.test_client() as client:
        with app.app_context():
            db_helpers.init_db()
        yield client

    # Cleanup: close file descriptor and remove temporary database
    os.close(db_fd)
    os.unlink(db_path)