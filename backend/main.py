from app import create_app
from app import db_helpers


db_helpers.init_all_dbs()
app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
