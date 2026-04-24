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

## Step 4: Connect from your Mac / Linux Machine

Once both scripts have run successfully, the Windows machine is ready to accept remote connections!

1. Find the IP address of your Windows machine (the `enable_ssh.ps1` script prints this out for you at the end).
2. Open your Terminal on your Mac.
3. Run the SSH command:

```bash
ssh your_windows_username@192.168.x.x
```
*(Replace `your_windows_username` with your actual Windows account username and `192.168.x.x` with the IP address).*

4. Enter your Windows password when prompted.

🎉 **You are now successfully connected to your Windows machine!**
