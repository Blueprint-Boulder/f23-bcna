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
    5. Launch both backend (port 5000) and frontend (port 5173) servers
    6. Handle graceful shutdown on Ctrl+C

Requirements:
    - Python 3.8+
    - Node.js 18+ (for Vite)
    - npm 6+
"""

import os
import signal
import subprocess
import sys
import platform
import shutil

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


def check_node_version():
    """Check that Node.js meets the minimum version requirement (18.0.0 for Vite 5).
    
    Raises:
        EnvironmentError: If Node.js is not installed or version is too old
    """
    # Get installed Node.js version
    result = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if result.returncode != 0:
        raise EnvironmentError("Node.js is not installed or not found in PATH.")
    
    # Parse version string (e.g., "v20.18.0" -> "20.18.0")
    version_str = result.stdout.strip().lstrip("v")
    try:
        major, minor, *_ = map(int, version_str.split("."))
    except ValueError:
        raise EnvironmentError(f"Could not parse Node.js version: {version_str}")
    
    # Vite 5 requires Node 18+
    if major < 18:
        raise EnvironmentError(
            f"Node.js {version_str} is too old. Vite requires Node 18 or higher.\n"
            "Please upgrade: https://nodejs.org"
        )
    
    print(f"Using Node.js {version_str}")


def check_prerequisites():
    """Verify all required tools are installed and meet minimum version requirements.
    
    Checks:
        - Python is installed and accessible
        - npm is installed and accessible
        - Node.js version is 18 or higher (required by Vite 5)
    
    Raises:
        EnvironmentError: If any prerequisite is missing or version is too old
    """
    # Verify Python is available
    python_version = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
    if python_version.returncode != 0:
        raise EnvironmentError("Python is not available.")
    
    version_str = python_version.stdout.strip()
    print(f"Using {version_str}")
    
    # Verify npm is available
    npm_check = subprocess.run(["npm", "--version"], capture_output=True, text=True)
    if npm_check.returncode != 0:
        raise EnvironmentError("npm is not installed or not found in PATH. Please install Node.js.")
    print(f"Using npm {npm_check.stdout.strip()}")

    # Verify Node.js version meets requirements (18+)
    check_node_version()


def setup_virtualenv():
    """Create Python virtual environment for backend if it doesn't exist.
    
    The venv is created in backend/venv/ to isolate backend dependencies
    from the system Python installation.
    """
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
    else:
        print("Virtual environment already exists.")


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
            f.write("VITE_BACKEND_URL=http://localhost:5000\n")
            f.write("ADMIN_PASSWORD=TEMPLATEPASSWORD\n")
            f.write("SECRET_KEY=TEMPLATEKEY\n")
    else:
        print(".env file found in repo root.")
    
    # Create .env in frontend26 for Vite (only needs VITE_BACKEND_URL)
    frontend_env_path = os.path.join(base_dir, "frontend26", ".env")
    if not os.path.exists(frontend_env_path):
        print("Creating .env file in frontend26 for Vite...")
        with open(frontend_env_path, "w") as f:
            f.write("VITE_BACKEND_URL=http://localhost:5000\n")
    else:
        print(".env file found in frontend26.")


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
    
    Installs npm packages if node_modules doesn't exist, then starts the dev server.
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

    # Install node_modules if not already present
    if not os.path.exists(os.path.join(frontend_path, "node_modules")):
        print("Installing frontend dependencies...")
        subprocess.run([npm_path, "install"], cwd=frontend_path, check=True)

    # Start Vite development server
    print("Starting frontend...")
    frontend_process = subprocess.Popen([npm_path, "run", "dev"], cwd=frontend_path)
    return frontend_process


def main():
    """Orchestrate the full development environment setup and server launch.
    
    Executes setup pipeline:
        1. Verify all prerequisites are installed
        2. Ensure .env configuration files exist
        3. Create Python virtual environment
        4. Install Python dependencies
        5. Launch backend Flask server
        6. Launch frontend Vite server
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
        # Keep the main process running while both servers run
        while True:
            pass

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
