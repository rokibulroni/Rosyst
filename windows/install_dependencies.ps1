# Run this script as Administrator on your Windows machine

Write-Host "=================================================="
Write-Host "Installing Rosyst Dependencies via Winget"
Write-Host "=================================================="

# Install Git
Write-Host "`n[1/5] Installing Git..."
winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements --silent

# Install Node.js (For Next.js UI)
Write-Host "`n[2/5] Installing Node.js (For Next.js UI)..."
winget install -e --id OpenJS.NodeJS --accept-source-agreements --accept-package-agreements --silent

# Install Python (For FastAPI Backend)
Write-Host "`n[3/5] Installing Python (For FastAPI Backend)..."
winget install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements --silent

# Install Docker Desktop (Crucial for AdGuard, ntopng, Zeek)
Write-Host "`n[4/5] Installing Docker Desktop..."
Write-Host "Note: ntopng and Zeek are heavily Linux-based. Docker is required to run them on Windows."
winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements --silent

# Install WSL (Windows Subsystem for Linux)
Write-Host "`n[5/5] Enabling WSL (Windows Subsystem for Linux)..."
wsl --install

Write-Host "`n=================================================="
Write-Host "Installation Complete! ⚠️ IMPORTANT NEXT STEPS ⚠️"
Write-Host "=================================================="
Write-Host "1. You MUST restart your Windows machine for WSL and Docker to function properly."
Write-Host "2. After restarting, open 'Docker Desktop' from your Start Menu to accept the terms."
Write-Host "3. You can now use 'git', 'node', 'npm', 'python', and 'docker' from your terminal."
Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
