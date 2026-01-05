import subprocess
import os
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'oncofeliz-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
REPO_PATH = "/opt/git/Proyecto-unifranz"
DB_CONFIG = {
    "host": "104.36.110.193",
    "port": "5432",
    "user": "onco",
    "pass": "Joss2025",
    "dbname": "onco"
}

def run_command(cmd, cwd=None):
    try:
        process = subprocess.Popen(
            cmd, 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            cwd=cwd,
            text=True
        )
        stdout, stderr = process.communicate()
        return {
            "success": process.returncode == 0,
            "stdout": stdout,
            "stderr": stderr
        }
    except Exception as e:
        return {"success": False, "stdout": "", "stderr": str(e)}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/git-pull', methods=['POST'])
def git_pull():
    # Force git pull last commit
    cmd = "git fetch --all && git reset --hard origin/$(git rev-parse --abbrev-ref HEAD)"
    result = run_command(cmd, cwd=REPO_PATH)
    return jsonify(result)

@app.route('/api/db-backup', methods=['POST'])
def db_backup():
    backup_file = f"/tmp/onco_backup_{os.popen('date +%Y%m%d_%H%M%S').read().strip()}.sql"
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_CONFIG["pass"]
    
    cmd = f"pg_dump -h {DB_CONFIG['host']} -p {DB_CONFIG['port']} -U {DB_CONFIG['user']} -d {DB_CONFIG['dbname']} -F p -f {backup_file}"
    
    try:
        process = subprocess.Popen(
            cmd, 
            shell=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            env=env,
            text=True
        )
        stdout, stderr = process.communicate()
        if process.returncode == 0:
            return jsonify({"success": True, "stdout": f"Backup created at {backup_file}", "stderr": ""})
        else:
            return jsonify({"success": False, "stdout": stdout, "stderr": stderr})
    except Exception as e:
        return jsonify({"success": False, "stdout": "", "stderr": str(e)})

@app.route('/api/restart-services', methods=['POST'])
def restart_services():
    services = [
        "oncofeliz-backend.service",
        "oncofeliz-frontend.service",
        "postgresql@18-main.service"
    ]
    results = {}
    for service in services:
        results[service] = run_command(f"systemctl restart {service}")
    
    all_success = all(r["success"] for r in results.values())
    return jsonify({"success": all_success, "details": results})

@socketio.on('start_logs')
def handle_logs(data):
    service = data.get('service')
    if service not in ['oncofeliz-backend', 'oncofeliz-frontend']:
        emit('log_data', {'data': 'Invalid service'})
        return

    # Using journalctl to get last 50 lines and then follow
    cmd = f"journalctl -u {service}.service -n 50 -f"
    process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    for line in iter(process.stdout.readline, ""):
        emit('log_data', {'data': line, 'service': service})
        socketio.sleep(0.1)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
