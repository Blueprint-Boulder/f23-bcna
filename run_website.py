"""
run_website.py

Development server launcher for the Blueprint Wildlife Database full-stack application.
Automatically manages the backend (Flask) and frontend (Vite) development servers,
including setup of virtual environments, dependency installation, and environment configuration.

Usage:
    python run_website.py

The script will:
    1. Verify prerequisites (Python, Node.js, npm)
    2. Create/verify virtual environment for backend
    3. Install Python and frontend dependencies
    4. Configure environment variables
    5. Launch both backend (port 5001) and frontend (port 5173) servers
    6. Handle graceful shutdown on Ctrl+C

Requirements:
    - Python 3.8+
    - Node.js 20.19.0+ (for Vite + Rolldown)
    - npm 8+
"""

import os
import signal
import subprocess
import sys
import platform
import shutil
import time

# Get the directory where the script is located (project root)
base_dir = os.path.dirname(os.path.abspath(__file__))

# Determine the virtual environment path and Python executable based on the OS
# The venv location differs between Windows (Scripts/) and Unix systems (bin/)
if platform.system() == "Windows":
    venv_path = os.path.join(base_dir, "backend", "venv")
    venv_python = os.path.join(venv_path, "Scripts", "python.exe")
else:
    # Unix-like systems (Linux, macOS)
    venv_path = os.path.join(base_dir, "backend", "venv")
    venv_python = os.path.join(venv_path, "bin", "python")


def get_venv_python():
    """Returns the path to the Python executable inside the virtual environment."""
    if not os.path.exists(venv_python):
        raise EnvironmentError("Virtual environment not found. Please create it first.")
    return venv_python


def parse_version(v):
    """Parse a version string like '20.19.0' into a comparable tuple of ints."""
    return tuple(map(int, v.split(".")))


def check_node_version():
    """Check that Node.js meets the minimum version requirements for Vite and Rolldown.

    Vite 5 requires Node >= 18.0.0.
    Rolldown (used by Vite's bundler pipeline) requires Node >= 20.19.0.
    Node 20.18.0 passes the Vite check but fails at runtime — this function catches that.

    Raises:
        EnvironmentError: If Node.js is not installed, unparseable, or below 20.19.0
    """
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        raise EnvironmentError("Node.js is not installed or not found in PATH.")

    version_str = result.stdout.strip().lstrip("v")
    try:
        major, minor, patch = parse_version(version_str)
    except Exception:
        raise EnvironmentError(f"Could not parse Node.js version: {version_str}")

    required_vite = (18, 0, 0)
    required_rolldown = (20, 19, 0)
    node_tuple = (major, minor, patch)

    if node_tuple < required_vite:
        raise EnvironmentError(
            f"Node.js {version_str} is too old. Vite requires >= 18.0.0.\n"
            "Upgrade Node: https://nodejs.org"
        )

    if node_tuple < required_rolldown:
        raise EnvironmentError(
            f"Node.js {version_str} is too old for Rolldown. "
            f"Rolldown requires >= 20.19.0.\n"
            "Upgrade Node: https://nodejs.org"
        )

    print(f"Using Node.js {version_str}")


def check_npm_version():
    """Check that npm meets the minimum version requirement (>= 8).

    npm < 8 can break modern Vite setups; npm 10+ can break older lockfiles.
    This ensures the installed npm is at least in a safe range.

    Raises:
        EnvironmentError: If npm is not found or its major version is below 8
    """
    result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        raise EnvironmentError("npm is not installed or not found in PATH. Please install Node.js.")

    version_str = result.stdout.strip()
    try:
        major = int(version_str.split(".")[0])
    except ValueError:
        raise EnvironmentError(f"Could not parse npm version: {version_str}")

    if major < 8:
        raise EnvironmentError(
            f"npm {version_str} is too old. npm >= 8 is required.\n"
            "Upgrade: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
        )

    print(f"Using npm {version_str}")


def check_prerequisites():
    """Verify all required tools are installed and meet minimum version requirements.

    Checks:
        - Python is installed and accessible
        - npm is installed and version >= 8
        - Node.js version is >= 20.19.0 (required by Rolldown/Vite)

    Raises:
        EnvironmentError: If any prerequisite is missing or version is too old
    """
    # Verify Python is available
    python_version = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
    if python_version.returncode != 0:
        raise EnvironmentError("Python is not available.")
    print(f"Using {python_version.stdout.strip()}")

    # Verify npm version (also confirms npm is installed)
    check_npm_version()

    # Verify Node.js version meets Vite + Rolldown requirements
    check_node_version()


def verify_venv_python():
    """Check whether the existing venv was created with a compatible Python version.

    Compares the major version of the venv's Python against the currently running
    Python. If they differ, the venv is deleted so setup_virtualenv() can recreate it.

    Returns:
        bool: True if venv is valid and version-compatible, False if missing or mismatched
    """
    if not os.path.exists(venv_python):
        return False

    result = subprocess.run([venv_python, "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        return False

    venv_ver = result.stdout.strip()
    system_ver = subprocess.run(
        [sys.executable, "--version"], capture_output=True, text=True
    ).stdout.strip()

    venv_major = venv_ver.split()[1].split(".")[0]
    system_major = system_ver.split()[1].split(".")[0]

    if venv_major != system_major:
        print(
            f"Python major version changed since venv creation "
            f"(venv: {venv_ver}, current: {system_ver}). Recreating venv..."
        )
        shutil.rmtree(venv_path)
        return False

    return True


def setup_virtualenv():
    """Create Python virtual environment for backend if it doesn't exist or is invalid.

    Calls verify_venv_python() first; if the venv is missing or was built under a
    different Python major version, it is deleted and recreated cleanly.
    """
    if not verify_venv_python():
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
    else:
        print("Virtual environment already exists and is compatible.")


def install_python_dependencies():
    """Install Python packages from backend/requirements.txt into the virtual environment.

    Uses the venv's pip to ensure dependencies are isolated from system packages.
    """
    requirements_path = os.path.join(base_dir, "backend", "requirements.txt")
    if os.path.exists(requirements_path):
        print("Installing/updating Python dependencies...")
        subprocess.run(
            [venv_python, "-m", "pip", "install", "-r", requirements_path], check=True
        )
    else:
        print("No requirements.txt found.")


def check_env_file():
    """Ensure .env configuration files exist in both project root and frontend26.

    Creates default .env files if missing with template values.
    These files are essential for:
        - Backend configuration (SECRET_KEY, ADMIN_PASSWORD)
        - Frontend Vite build configuration (VITE_BACKEND_URL)
    """
    # Create .env in repo root for backend configuration
    env_path = os.path.join(base_dir, ".env")
    if not os.path.exists(env_path):
        print("Warning: .env file not found in repo root. Creating with default values...")
        with open(env_path, "w") as f:
            f.write("VITE_BACKEND_URL=http://localhost:5001\n")
            f.write("ADMIN_PASSWORD=TEMPLATEPASSWORD\n")
            f.write("SECRET_KEY=TEMPLATEKEY\n")
    else:
        print(".env file found in repo root.")

    # Create .env in frontend26 for Vite (only needs VITE_BACKEND_URL)
    frontend_env_path = os.path.join(base_dir, "frontend26", ".env")
    if not os.path.exists(frontend_env_path):
        print("Creating .env file in frontend26 for Vite...")
        with open(frontend_env_path, "w") as f:
            f.write("VITE_BACKEND_URL=http://localhost:5001\n")
    else:
        print(".env file found in frontend26.")


def record_node_version(frontend_path):
    """Write the current Node.js version into node_modules/.node-version.

    This stamp is checked on the next run to detect whether node_modules was
    built under a different Node version, which can cause silent native binding failures.

    Args:
        frontend_path (str): Path to the frontend directory
    """
    version_file = os.path.join(frontend_path, "node_modules", ".node-version")
    node_version = subprocess.run(
        ["node", "--version"], capture_output=True, text=True
    ).stdout.strip()
    with open(version_file, "w") as f:
        f.write(node_version)


def check_node_modules_version(frontend_path):
    """Check whether node_modules was installed under the currently active Node version.

    If the recorded version doesn't match the current Node version, native bindings
    compiled during the previous install may be incompatible. This function triggers
    a clean reinstall in that case.

    Args:
        frontend_path (str): Path to the frontend directory

    Returns:
        bool: True if node_modules is valid for the current Node version, False otherwise
    """
    version_file = os.path.join(frontend_path, "node_modules", ".node-version")
    if not os.path.exists(version_file):
        print("node_modules exists but no version record found. Reinstalling...")
        return False

    with open(version_file) as f:
        recorded = f.read().strip()

    current = subprocess.run(
        ["node", "--version"], capture_output=True, text=True
    ).stdout.strip()

    if recorded != current:
        print(
            f"Node version changed since last install:\n"
            f"  Installed under: {recorded}\n"
            f"  Current:         {current}\n"
            "Reinstalling node_modules..."
        )
        return False

    return True


def verify_frontend_integrity(frontend_path):
    """Check that critical frontend files and packages are present.

    A partial or interrupted npm install can leave node_modules in a broken state
    without any obvious error. This check catches the most common missing pieces.

    Args:
        frontend_path (str): Path to the frontend directory

    Returns:
        bool: True if all required files exist, False if any are missing
    """
    required_files = [
        "package.json",
        "package-lock.json",
        "node_modules/vite",
        "node_modules/rollup",
    ]

    for f in required_files:
        if not os.path.exists(os.path.join(frontend_path, f)):
            print(f"Missing {f}. Reinstalling dependencies...")
            return False

    return True


def run_backend():
    """Start the Flask backend development server.

    Returns:
        subprocess.Popen: The backend process object for later termination control
    """
    print("Starting backend server...")
    # Use -u flag to prevent Python output buffering for better log visibility
    backend_process = subprocess.Popen(
        [venv_python, "-u", "main.py"], cwd=os.path.join(base_dir, "backend")
    )
    return backend_process


def setup_frontend():
    """Install frontend dependencies and start the Vite development server.

    Checks node_modules version compatibility and integrity before deciding whether
    to reinstall. After a successful install, stamps node_modules with the current
    Node version to enable future mismatch detection.

    The frontend runs on http://localhost:5173 by default.

    Returns:
        subprocess.Popen: The frontend process object for later termination control

    Raises:
        EnvironmentError: If npm is not found in PATH
    """
    frontend_path = os.path.join(base_dir, "frontend26")

    # Locate npm executable
    npm_path = shutil.which("npm")
    if not npm_path:
        raise EnvironmentError("npm is not installed or not found in PATH.")

    node_modules_exists = os.path.exists(os.path.join(frontend_path, "node_modules"))

    # Reinstall if: node_modules is missing, was built under a different Node version,
    # or is missing critical packages (partial/corrupted install).
    needs_install = (
        not node_modules_exists
        or not check_node_modules_version(frontend_path)
        or not verify_frontend_integrity(frontend_path)
    )

    if needs_install:
        print("Installing frontend dependencies...")
        subprocess.run([npm_path, "install"], cwd=frontend_path, check=True)
        record_node_version(frontend_path)

    # Start Vite development server
    print("Starting frontend...")
    frontend_process = subprocess.Popen([npm_path, "run", "dev"], cwd=frontend_path)
    return frontend_process


def main():
    """Orchestrate the full development environment setup and server launch.

    Executes setup pipeline:
        1. Verify all prerequisites are installed and version-compatible
        2. Ensure .env configuration files exist
        3. Create or recreate Python virtual environment if needed
        4. Install Python dependencies
        5. Launch backend Flask server
        6. Launch frontend Vite server (reinstalling node_modules if Node version changed)
        7. Keep both running until user terminates (Ctrl+C)
        8. Gracefully shut down both processes on exit
    """
    # Execute setup pipeline
    check_prerequisites()
    check_env_file()
    setup_virtualenv()
    install_python_dependencies()

    # Launch both servers
    backend_process = run_backend()
    frontend_process = setup_frontend()

    try:
        # Sleep-based loop avoids burning CPU on a busy-wait (was: while True: pass)
        while True:
            time.sleep(0.5)

    except KeyboardInterrupt:
        # Handle graceful shutdown on Ctrl+C
        print("Shutting down...")

        if platform.system() == "Windows":
            # Windows: use terminate() for cleaner shutdown
            backend_process.terminate()
            frontend_process.terminate()
        else:
            # Unix-like systems (Linux, macOS): send SIGINT signal for graceful shutdown
            backend_process.send_signal(signal.SIGINT)
            frontend_process.send_signal(signal.SIGINT)

        # Wait for both processes to exit
        backend_process.wait()
        print("Backend successfully exited.")
        frontend_process.wait()
        print("Frontend successfully exited.")


if __name__ == "__main__":
    # Entry point: start the development environment orchestrator
    main()