# Server Configuration

This document contains instructions for running the project in development and production (as a service).

---

## 🛠 Development Environment

### Backend
To start the backend server manually:
```bash
cd backend
node index.js
```

### Frontend
To start the frontend development server:
```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

---

## 🚀 Production Environment (Systemd / systemctl)

Since the server reboots daily, using **systemd** ensures the services start automatically on boot.

### 1. Backend Service Configuration
Create a service file: `sudo nano /etc/systemd/system/oncofeliz-backend.service`

```ini
[Unit]
Description=OncoFeliz Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/git/Proyecto-unifranz/backend
# Use absolute path to Root's NVM-managed node version 23.9.0
ExecStart=/root/.nvm/versions/node/v23.9.0/bin/node /opt/git/Proyecto-unifranz/backend/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 2. Frontend Service Configuration
For production, it is highly recommended to **build** the frontend first:
```bash
cd /opt/git/Proyecto-unifranz/frontend
npm run build
```

Then, create the service file: `sudo nano /etc/systemd/system/oncofeliz-frontend.service`

```ini
[Unit]
Description=OncoFeliz Frontend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/git/Proyecto-unifranz/frontend
# Add NVM binary directory to PATH so 'npx' can find 'node'
Environment=PATH=/root/.nvm/versions/node/v23.9.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
# Recommended: Serve the static 'dist' folder
ExecStart=/root/.nvm/versions/node/v23.9.0/bin/npx serve -s dist -l 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Management Commands
Run these commands to enable and start the services:

```bash
# Reload systemd to recognize new files
sudo systemctl daemon-reload

# Enable services to start on boot
sudo systemctl enable oncofeliz-backend
sudo systemctl enable oncofeliz-frontend

# Start the services now
sudo systemctl start oncofeliz-backend
sudo systemctl start oncofeliz-frontend

# Check status
sudo systemctl status oncofeliz-backend
sudo systemctl status oncofeliz-frontend

# View logs
journalctl -u oncofeliz-backend -f
journalctl -u oncofeliz-frontend -f
```

---

## 📦 Alternative: PM2 (Process Manager)

If you prefer PM2, you must save the process list to handle reboots:

1. **Start services:**
   ```bash
   pm2 start backend/index.js --name "backend"
   pm2 serve frontend/dist 5173 --name "frontend" --spa
   ```
2. **Setup Reboot Persistence:**
   ```bash
   pm2 startup  # Follow the instructions printed in the terminal
   pm2 save     # Saves the current process list to be restored on boot
   ```

---

## 🛠 Administration Control Panel

A specialized Flask interface is available in the `/admin` folder to manage the system remotely.

### 1. Setup
Navigate to the admin folder and install requirements:
```bash
cd /opt/git/Proyecto-unifranz/admin
pip install -r requirements.txt
```

### 2. Features
- **Git Force Pull**: Resets the local repository to the latest commit on the current branch.
- **Database Backup**: Performs a `pg_dump` of the `onco` database.
- **Service Management**: Restarts Backend, Frontend, and PostgreSQL services.
- **Real-time Logs**: Stream `journalctl` logs for backend and frontend directly to the browser.

### 3. Run as a Service (Recommended)
Create `sudo nano /etc/systemd/system/oncofeliz-admin.service`:

```ini
[Unit]
Description=OncoFeliz Admin Interface
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/git/Proyecto-unifranz/admin
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable oncofeliz-admin
sudo systemctl start oncofeliz-admin
```

The interface will be available at `http://your-server-ip:5000`.
