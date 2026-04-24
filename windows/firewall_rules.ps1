# Run this script as Administrator on your Windows machine

Write-Host "Configuring Windows Firewall rules for Ping and SSH..."

# Allow ICMP (Ping) so the machine can be pinged from the network
$pingRule = Get-NetFirewallRule -Name "Allow-Ping-In" -ErrorAction SilentlyContinue
if (!$pingRule) {
    Write-Host "Creating Firewall Rule for Ping (ICMPv4)..."
    New-NetFirewallRule -Name "Allow-Ping-In" -DisplayName "Allow Ping (ICMPv4-In)" -Enabled True -Direction Inbound -Protocol ICMPv4 -IcmpType 8 -Action Allow
} else {
    Write-Host "Firewall Rule for Ping already exists."
}

# Allow SSH (Port 22) so the machine can be connected via SSH
$sshRule = Get-NetFirewallRule -Name "OpenSSH-Server-In-TCP" -ErrorAction SilentlyContinue
if (!$sshRule) {
    Write-Host "Creating Firewall Rule for SSH (Port 22)..."
    New-NetFirewallRule -Name 'OpenSSH-Server-In-TCP' -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
} else {
    Write-Host "Firewall Rule for SSH already exists."
}

Write-Host ""
Write-Host "=================================================="
Write-Host "Firewall rules successfully configured!"
Write-Host "=================================================="
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
