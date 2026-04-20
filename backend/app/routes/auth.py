# auth.py
from flask import Blueprint, request, jsonify
import hashlib
import secrets
import os
from dotenv import load_dotenv

load_dotenv()

password = os.getenv("ADMIN_PASSWORD", "dev")  # falls back to "dev" if not set
ADMIN_PASSWORD_HASH = hashlib.sha256(password.encode()).hexdigest()

auth_bp = Blueprint('auth', __name__)

valid_tokens = set()

@auth_bp.route("/api/admin-login", methods=["POST"])
def admin_login():
    password = request.json.get("password")
    if not password:
        return jsonify({"error": "Password required"}), 400

    entered_hash = hashlib.sha256(password.encode()).hexdigest()
    print(f"Entered password: '{password}'")
    print(f"Entered hash: {entered_hash}")
    print(f"Expected hash: {ADMIN_PASSWORD_HASH}")
    if entered_hash == ADMIN_PASSWORD_HASH:
        token = secrets.token_hex(32)
        valid_tokens.add(token)
        return jsonify({"token": token}), 200
    return jsonify({"error": "Incorrect password"}), 401

@auth_bp.route("/api/admin-verify", methods=["POST"])
def admin_verify():
    token = request.json.get("token")
    if token and token in valid_tokens:
        return jsonify({"valid": True}), 200
    return jsonify({"valid": False}), 401

@auth_bp.route("/api/admin-logout", methods=["POST"])
def admin_logout():
    token = request.json.get("token")
    valid_tokens.discard(token)
    return jsonify({"message": "Logged out"}), 200