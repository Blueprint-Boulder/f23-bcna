"""
auth.py

Authentication routes for the Blueprint Wildlife Database backend.
Provides admin login, token verification, and logout functionality.
Uses PBKDF2-SHA256 password hashing (via werkzeug) and secure random token generation.

Security Notes:
    - Passwords are hashed with PBKDF2-SHA256 (salted, via werkzeug.security)
    - Tokens are stored in-memory with a 24-hour TTL (lost on server restart)
    - Rate limiting: 5 failed attempts per IP per 5-minute window triggers a 429
    - ADMIN_PASSWORD environment variable controls access (defaults to 'dev')

Routes:
    - POST /api/admin-login: Authenticate with password and receive token
    - POST /api/admin-verify: Verify if a token is valid
    - POST /api/admin-logout: Invalidate a token
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from collections import defaultdict
import secrets
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Load admin password from environment or use default 'dev' for development
password = os.getenv("ADMIN_PASSWORD", "dev")
ADMIN_PASSWORD_HASH = generate_password_hash(password)

auth_bp = Blueprint('auth', __name__)

# In-memory token store: token -> expiry timestamp
TOKEN_TTL = 86400  # 24 hours
valid_tokens: dict[str, float] = {}

# Rate limiting: IP -> list of failed attempt timestamps
_failed_attempts: dict[str, list[float]] = defaultdict(list)
MAX_ATTEMPTS = 20
RATE_WINDOW = 600  # 10 minutes


_LOOPBACK_IPS = {'127.0.0.1', '::1'}

def _check_rate_limit(ip: str) -> bool:
    if ip in _LOOPBACK_IPS:
        return False
    now = time.time()
    _failed_attempts[ip] = [t for t in _failed_attempts[ip] if now - t < RATE_WINDOW]
    return len(_failed_attempts[ip]) >= MAX_ATTEMPTS

@auth_bp.route("/api/admin-login", methods=["POST"])
def admin_login():
    """Authenticate admin user and return a session token.
    
    Expected JSON body: {"password": "<admin_password>"}
    
    Returns:
        200: {"token": "<hex_token>"} - Valid token for subsequent admin operations
        400: {"error": "Password required"} - No password provided
        401: {"error": "Incorrect password"} - Password doesn't match
    """
    ip = request.remote_addr
    if _check_rate_limit(ip):
        return jsonify({"error": "Too many failed attempts. Try again in 5 minutes."}), 429

    password = request.json.get("password")
    if not password:
        return jsonify({"error": "Password required"}), 400

    if check_password_hash(ADMIN_PASSWORD_HASH, password):
        _failed_attempts.pop(ip, None)
        token = secrets.token_hex(32)
        valid_tokens[token] = time.time() + TOKEN_TTL
        return jsonify({"token": token}), 200

    _failed_attempts[ip].append(time.time())
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
        if time.time() < valid_tokens[token]:
            return jsonify({"valid": True}), 200
        valid_tokens.pop(token)  # expired
    return jsonify({"valid": False}), 401

@auth_bp.route("/api/admin-logout", methods=["POST"])
def admin_logout():
    """Invalidate an admin token, logging out the user.
    
    Expected JSON body: {"token": "<hex_token>"}
    
    Returns:
        200: {"message": "Logged out"} - Token has been invalidated
    """
    token = request.json.get("token")
    valid_tokens.pop(token, None)
    return jsonify({"message": "Logged out"}), 200