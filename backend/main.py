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


db_helpers.init_all_dbs()
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
