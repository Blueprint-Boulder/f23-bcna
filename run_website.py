import os
import signal
import subprocess
import sys
import platform
import shutil

# Get the directory where the script is located
base_dir = os.path.dirname(os.path.abspath(__file__))

# Determine the virtual environment path and Python executable based on the OS
if platform.system() == 'Windows':
    venv_path = os.path.join(base_dir, 'backend', 'venv')
    venv_python = os.path.join(venv_path, 'Scripts', 'python.exe')
else:
    venv_path = os.path.join(base_dir, 'backend', 'venv')
    venv_python = os.path.join(venv_path, 'bin', 'python')

def get_venv_python():
    """Returns the path to the Python executable inside the virtual environment."""
    if not os.path.exists(venv_python):
        raise EnvironmentError("Virtual environment not found. Please create it first.")
    return venv_python

def setup_virtualenv():
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', venv_path], check=True)

def install_python_dependencies():
    requirements_path = os.path.join(base_dir, 'backend', 'requirements.txt')
    if os.path.exists(requirements_path):
        print("Installing Python dependencies...")
        subprocess.run([venv_python, '-m', 'pip', 'install', '-r', requirements_path], check=True)
    else:
        print("No requirements.txt found.")

def run_backend():
    print("Starting backend server...")
    backend_process = subprocess.Popen([venv_python, "-u", "main.py"], cwd=os.path.join(base_dir, "backend"))
    return backend_process

def setup_frontend():
    frontend_path = os.path.join(base_dir, 'frontend')
    
    # Check for npm executable
    npm_path = shutil.which("npm")
    if not npm_path:
        raise EnvironmentError("npm is not installed or not found in PATH.")
    
    if not os.path.exists(os.path.join(frontend_path, 'node_modules')):
        print("Installing frontend dependencies...")
        subprocess.run([npm_path, 'install'], cwd=frontend_path, check=True)
    
    print("Starting frontend...")
    frontend_process = subprocess.Popen([npm_path, 'start'], cwd=frontend_path)
    return frontend_process


def main():
    setup_virtualenv()
    install_python_dependencies()
    backend_process = run_backend()
    frontend_process = setup_frontend()

    try:
        while True:
            pass

    except KeyboardInterrupt:
        print("Shutting down...")

        if platform.system() == 'Windows':
            # Use terminate() for Windows
            backend_process.terminate()
            frontend_process.terminate()
        else:
            # Use send_signal for Unix-like systems
            backend_process.send_signal(signal.SIGINT)
            frontend_process.send_signal(signal.SIGINT)

        backend_process.wait()
        print("Backend successfully exited.")
        frontend_process.wait()
        print("Frontend successfully exited.")

if __name__ == "__main__":
    main()
