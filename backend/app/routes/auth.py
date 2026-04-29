"""
auth.py

Authentication routes for the Blueprint Wildlife Database backend.
Provides admin login, token verification, and logout functionality.
Uses SHA256 password hashing and secure random token generation.

Security Notes:
    - Passwords are hashed with SHA256 (should use bcrypt for production)
    - Tokens are stored in-memory (lost on server restart)
    - For production, implement persistent token storage and implement token expiration
    - ADMIN_PASSWORD environment variable controls access (defaults to 'dev')

Routes:
    - POST /api/admin-login: Authenticate with password and receive token
    - POST /api/admin-verify: Verify if a token is valid
    - POST /api/admin-logout: Invalidate a token
"""

from flask import Blueprint, request, jsonify
import hashlib
import secrets
import os
from dotenv import load_dotenv

load_dotenv()

# Load admin password from environment or use default 'dev' for development
password = os.getenv("ADMIN_PASSWORD", "dev")
ADMIN_PASSWORD_HASH = hashlib.sha256(password.encode()).hexdigest()

auth_bp = Blueprint('auth', __name__)

# In-memory token store (persisted only for current server session)
valid_tokens = set()

@auth_bp.route("/api/admin-login", methods=["POST"])
def admin_login():
    """Authenticate admin user and return a session token.
    
    Expected JSON body: {"password": "<admin_password>"}
    
    Returns:
        200: {"token": "<hex_token>"} - Valid token for subsequent admin operations
        400: {"error": "Password required"} - No password provided
        401: {"error": "Incorrect password"} - Password doesn't match
    """
    password = request.json.get("password")
    if not password:
        return jsonify({"error": "Password required"}), 400

    entered_hash = hashlib.sha256(password.encode()).hexdigest()
    print(f"Entered password: '{password}'")
    print(f"Entered hash: {entered_hash}")
    print(f"Expected hash: {ADMIN_PASSWORD_HASH}")
    if entered_hash == ADMIN_PASSWORD_HASH:
        # Generate a secure random token (64 hex characters = 32 bytes)
        token = secrets.token_hex(32)
        valid_tokens.add(token)
        return jsonify({"token": token}), 200
    return jsonify({"error": "Incorrect password"}), 401

@auth_bp.route("/api/admin-verify", methods=["POST"])
def admin_verify():
    """Verify if a given token is valid and currently authenticated.
    
    Expected JSON body: {"token": "<hex_token>"}
    
    Returns:
        200: {"valid": true} - Token is valid
        401: {"valid": false} - Token is invalid or expired
    """
    token = request.json.get("token")
    if token and token in valid_tokens:
        return jsonify({"valid": True}), 200
    return jsonify({"valid": False}), 401

@auth_bp.route("/api/admin-logout", methods=["POST"])
def admin_logout():
    """Invalidate an admin token, logging out the user.
    
    Expected JSON body: {"token": "<hex_token>"}
    
    Returns:
        200: {"message": "Logged out"} - Token has been invalidated
    """
    token = request.json.get("token")
    valid_tokens.discard(token)  # Remove token if it exists, no error if not
    return jsonify({"message": "Logged out"}), 200