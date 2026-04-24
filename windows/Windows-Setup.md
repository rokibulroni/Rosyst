# Rosyst - Windows Setup Guide

If you are using a Windows machine as part of your development environment or server infrastructure for **[Rosyst](https://github.com/rokibulroni/Rosyst)**, you need to enable SSH access. This allows you to remotely connect, manage, and write code from your primary machine (like a Mac) without needing to physically interact with the Windows machine.

We have provided automated PowerShell scripts in the `windows/` directory to make this process seamless.

---

## ⚠️ Prerequisites

Before running these scripts, ensure you have:
1. Logged into your Windows machine.
2. Copied the `windows/` folder from this repository onto your Windows machine.

---

## Step 1: Open PowerShell as Administrator

To install system services and configure the firewall, you **must** run PowerShell with Administrator privileges.

1. Click the **Start Menu** (Windows icon) on your taskbar.
2. Type **`PowerShell`**.
3. On the right side of the search menu, click **"Run as Administrator"**.
   *(Alternatively, right-click "Windows PowerShell" and select "Run as Administrator").*
4. Click **Yes** when prompted by User Account Control (UAC).

---

## Step 2: Install and Enable OpenSSH

In your Administrator PowerShell window, navigate to the folder where you saved the scripts and run the SSH setup script:

```powershell
# Navigate to the folder (change the path to where you saved it)
cd C:\path\to\windows\folder

# Run the script
.\enable_ssh.ps1
```

> **Note:** If you receive an execution policy error, run this command first to temporarily bypass the restriction:
> `Set-ExecutionPolicy Bypass -Scope Process`

**What this script does:**
- Checks if OpenSSH Server is installed.
- Installs it via Windows Capabilities if it is missing.
- Starts the `sshd` background service.
- Configures the service to start automatically every time you boot the Windows machine.

---

## Step 3: Configure Windows Firewall

By default, the Windows Firewall might block incoming Ping requests and SSH connections, especially if your network profile is set to "Public". Run the second script to explicitly open these ports:

```powershell
# In the same Administrator PowerShell window, run:
.\firewall_rules.ps1
```

**What this script does:**
- Creates a firewall rule allowing incoming **ICMPv4 (Ping)** requests. This ensures you can verify network connectivity (`ping <windows-ip>`).
- Creates a firewall rule allowing incoming **TCP Port 22 (SSH)** traffic.

---

## Step 4: Install Rosyst Core Dependencies

According to the `plan.md`, the Rosyst stack relies on Linux-based networking tools (ntopng, Zeek) and modern web frameworks. To support this on Windows, you need WSL, Docker, Node.js, and Python.

We have created an automated script to install everything you need via Windows Package Manager (`winget`).

```powershell
# In the same Administrator PowerShell window, run:
.\install_dependencies.ps1
```

**What this script does:**
- Installs **Git** (for version control).
- Installs **Node.js** (for the Next.js/React frontend).
- Installs **Python 3.11** (for the FastAPI backend).
- Installs **Docker Desktop** (required to containerize AdGuard Home and ntopng).
- Enables **WSL (Windows Subsystem for Linux)**.

> ⚠️ **CRITICAL:** After this script finishes, you **MUST restart your Windows machine**. Once restarted, open Docker Desktop from your Start menu to accept the license agreement so the engine can start.

---

## Step 5: Route SSH Directly to WSL (Optional but Recommended)

By default, when you SSH into Windows, you land in a standard PowerShell session. Since we are using Docker and Linux tools, it's much faster if your SSH connection drops you directly into your Ubuntu environment.

Run this final script as Administrator:

```powershell
.\set_wsl_default_ssh.ps1
```

This changes a single registry key so that any incoming SSH connection bypasses Windows PowerShell entirely and instantly opens your WSL terminal.

---

## Step 6: Connect & Spin Up the Rosyst Core Engine

Once your machine has restarted and Docker is running, you are ready to deploy the Phase 2 Core Engine!

1. Open your Terminal on your Mac.
2. Run the SSH command:

```bash
ssh your_windows_username@192.168.x.x
```
*(Replace `your_windows_username` with your actual Windows account username and `192.168.x.x` with the IP address).*

3. Clone your repository into the Ubuntu environment:

```bash
git clone https://github.com/rokibulroni/Rosyst.git
cd Rosyst/windows
```

4. Spin up the Core Engine using Docker:

```bash
docker compose up -d
```

🎉 **You have successfully deployed Rosyst Phase 1 & 2!** 
You can now access your AdGuard Home setup wizard at `http://<windows-ip>:3000` and your ntopng dashboard at `http://<windows-ip>:3001` directly from your Mac's browser!

---

## 🛠️ Troubleshooting

If you encounter errors when running `docker compose up -d` over your SSH connection, here are the most common fixes:

### 1. "A specified logon session does not exist"
This occurs because Docker tries to use the Windows graphical credential manager over an invisible SSH tunnel. Since these are public images, you can safely bypass this by running:
```bash
sed -i '/"credsStore":/d' ~/.docker/config.json
```

### 2. "failed to resolve reference... not found"
If Docker Hub deprecates a specific image tag (like `:stable`), you can quickly update your `docker-compose.yml` to pull the `:latest` version by running:
```bash
sed -i 's/:stable/:latest/g' docker-compose.yml
```

### 3. API Connection Issues (ntopng or AdGuard)
- **ntopng Auth**: The `docker-compose.yml` explicitly passes the `-l 1` flag to the `ntopng` container (`ntopng --community -i any -l 1`). This disables the login prompt for API requests, allowing the Rosyst FastAPI backend to scrape traffic statistics without needing the default admin password.
- **AdGuard Rules**: The FastAPI backend (`api/services/adguard_client.py`) polls AdGuard for active filter rules to dynamically update the Next.js UI block buttons. If the AdGuard container resets, ensure you don't delete your `data/adguard` volume, or the custom sinkhole rules will be lost.
