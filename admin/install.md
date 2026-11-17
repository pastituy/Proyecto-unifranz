# Admin Interface Installation Guide

This guide explains how to install the OncoFeliz Administration Control Panel as a system service.

## 1. Prerequisites
Ensure you have Python 3 and pip installed:
```bash
sudo apt update
sudo apt install python3 python3-pip -y
```

## 2. Setup Files
Navigate to the admin folder and install requirements:
```bash
cd /opt/git/Proyecto-unifranz/admin
pip3 install -r requirements.txt
```

## 3. Configure Systemd Service
Create the service definition file:
```bash
sudo nano /etc/systemd/system/oncofeliz-admin.service
```

Paste the following content:
```ini
[Unit]
Description=OncoFeliz Admin Interface
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/git/Proyecto-unifranz/admin
# Ensure you use the correct path to python3
ExecStart=/usr/bin/python3 app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 4. Enable and Start
Run these commands to apply the configuration and start the service:

```bash
# Reload systemd to recognize the new service
sudo systemctl daemon-reload

# Enable the service to start automatically on reboot
sudo systemctl enable oncofeliz-admin

# Start the service now
sudo systemctl start oncofeliz-admin

# Check the status to ensure it's running correctly
sudo systemctl status oncofeliz-admin
```

## 5. Accessing the Interface
Once running, the admin panel is available at:
`http://your-server-ip:5000`

---
**Note:** If you are using a firewall (like UFW), make sure to allow port 5000:
```bash
sudo ufw allow 5000/tcp
```
