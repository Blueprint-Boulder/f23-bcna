import os
import signal
import subprocess
import sys

# Get the directory where the script is located
base_dir = os.path.dirname(os.path.abspath(__file__))


def get_venv_python():
    """Returns the path to the Python executable inside the virtual environment."""
    venv_python = os.path.join(base_dir, 'backend', 'venv', 'bin', 'python')
    if not os.path.exists(venv_python):
        raise EnvironmentError("Virtual environment not found. Please create it first.")
    return venv_python


def setup_virtualenv():
    venv_path = os.path.join(base_dir, 'backend', 'venv')
    if not os.path.exists(venv_path):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', venv_path], check=True)


def install_python_dependencies():
    requirements_path = os.path.join(base_dir, 'backend', 'requirements.txt')
    venv_python = get_venv_python()  # Use the Python executable from the virtual environment
    if os.path.exists(requirements_path):
        print("Installing Python dependencies...")
        subprocess.run([venv_python, '-m', 'pip', 'install', '-r', requirements_path], check=True)
    else:
        print("No requirements.txt found.")


def run_backend():
    print("Starting backend server...")
    venv_python = get_venv_python()
    backend_process = subprocess.Popen([venv_python, "-u", "main.py"], cwd=os.path.join(base_dir, "backend"))
    return backend_process


def setup_frontend():
    frontend_path = os.path.join(base_dir, 'frontend')
    if not os.path.exists(os.path.join(frontend_path, 'node_modules')):
        print("Installing frontend dependencies...")
        subprocess.run(['npm', 'install'], cwd=frontend_path, check=True)
    print("Starting frontend...")
    frontend_process = subprocess.Popen(['npm', 'start'], cwd=frontend_path)
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
        backend_process.send_signal(signal.SIGINT)
        backend_process.wait()
        print("Backend successfully exited.")
        frontend_process.send_signal(signal.SIGINT)
        frontend_process.wait()
        print("Frontend successfully exited.")


if __name__ == "__main__":
    main()
