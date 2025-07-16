from app import create_app
from app import db_helpers


db_helpers.init_db()

app = create_app()


if __name__ == "__main__":
    app.run(debug=True)