"""
main.py

Application entry point for the Blueprint Wildlife Database Flask backend.
Initializes the Flask application, loads environment variables, and sets up all databases.
Runs the development server on http://0.0.0.0:5000 with debug mode enabled.

Environment Variables:
    - .env file is loaded from the parent directory (project root)
    - Required: SECRET_KEY, ADMIN_PASSWORD (optional, defaults to 'dev')
    - Optional: FRONTEND_URL (for CORS configuration)
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from parent directory (.env file)
parent_dir = Path(__file__).parent.parent
env_file = parent_dir / ".env"
if env_file.exists():
    load_dotenv(str(env_file))
else:
    print(f"Warning: .env file not found at {env_file}")

from app import create_app
from app import db_helpers

# Initialize all dataset databases (butterflies, dragonflies, wildflowers)
db_helpers.init_all_dbs()

# Create Flask application instance
app = create_app()

if __name__ == "__main__":
    # Run development server with debug mode enabled
    # Accessible from all network interfaces (0.0.0.0) on port 5000
    app.run(host="0.0.0.0", debug=True)
