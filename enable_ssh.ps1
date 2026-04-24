# Run this script as Administrator on your Windows machine

Write-Host "Checking OpenSSH Server installation status..."

# Check if OpenSSH Server is installed
$sshInstalled = Get-WindowsCapability -Online | Where-Object Name -like 'OpenSSH.Server*'

if ($sshInstalled.State -ne 'Installed') {
    Write-Host "Installing OpenSSH Server... (This may take a minute)"
    Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
} else {
    Write-Host "OpenSSH Server is already installed."
}

# Start the sshd service
Write-Host "Starting SSH service (sshd)..."
Start-Service sshd

# Set the sshd service to start automatically on boot
Write-Host "Configuring SSH service to start automatically..."
Set-Service -Name sshd -StartupType 'Automatic'

# Confirm the Firewall rule is configured. It should be created automatically by setup.
$firewallRule = Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
if (!$firewallRule) {
    Write-Host "Creating Firewall Rule for SSH (Port 22)..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Host "Firewall Rule for SSH already exists."
}

# Get the IP address of the Windows machine to help with connection
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object InterfaceAlias -Match 'Wi-Fi|Ethernet' | Select-Object -First 1).IPAddress
$username = $env:USERNAME

Write-Host ""
Write-Host "=================================================="
Write-Host "SSH Server is successfully enabled and running!"
Write-Host "=================================================="
Write-Host "To connect from your Mac, run the following command in your Mac's terminal:"
Write-Host ""
Write-Host "ssh ${username}@${ipAddress}"
Write-Host ""
Write-Host "Note: You will be prompted for your Windows password."
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
