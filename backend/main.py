from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/api')
def hello_world():
    return 'Hello, from Flask!'


if __name__ == '__main__':
    app.run(debug=True)
