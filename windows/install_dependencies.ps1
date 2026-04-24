# Run this script as Administrator on your Windows machine

Write-Host "=================================================="
Write-Host "Installing Rosyst Dependencies via Winget"
Write-Host "=================================================="

# Check and Install Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n[1/5] Git is already installed. Skipping..." -ForegroundColor Green
} else {
    Write-Host "`n[1/5] Installing Git..." -ForegroundColor Cyan
    winget install -e --id Git.Git --accept-source-agreements --accept-package-agreements --silent
}

# Check and Install Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "`n[2/5] Node.js is already installed. Skipping..." -ForegroundColor Green
} else {
    Write-Host "`n[2/5] Installing Node.js..." -ForegroundColor Cyan
    winget install -e --id OpenJS.NodeJS --accept-source-agreements --accept-package-agreements --silent
}

# Check and Install Python
# Windows has a stub python.exe that opens the Microsoft Store. We must check if it's real.
$pythonValid = $false
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pyVer = python --version 2>&1
    if ($pyVer -match "Python 3") {
        $pythonValid = $true
    }
}
if ($pythonValid) {
    Write-Host "`n[3/5] Python 3 is already installed. Skipping..." -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Installing Python 3..." -ForegroundColor Cyan
    winget install -e --id Python.Python.3.11 --accept-source-agreements --accept-package-agreements --silent
}

# Check and Install Docker Desktop
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "`n[4/5] Docker Desktop is already installed. Skipping..." -ForegroundColor Green
} else {
    Write-Host "`n[4/5] Installing Docker Desktop..." -ForegroundColor Cyan
    Write-Host "Note: ntopng and Zeek are heavily Linux-based. Docker is required to run them."
    winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements --silent
}

# Check and Enable WSL
$wslStatus = wsl -l -v 2>&1
if ($wslStatus -match "Ubuntu" -or $wslStatus -match "Default") {
    Write-Host "`n[5/5] WSL is already installed and configured. Skipping..." -ForegroundColor Green
} else {
    Write-Host "`n[5/5] Enabling WSL (Windows Subsystem for Linux)..." -ForegroundColor Cyan
    wsl --install
}

Write-Host "`n=================================================="
Write-Host "Installation Complete! ⚠️ IMPORTANT NEXT STEPS ⚠️"
Write-Host "=================================================="
Write-Host "A system restart is strongly recommended to apply Docker and WSL changes."
$restart = Read-Host "Would you like to restart your computer now? (Y/N)"

if ($restart -match "^[Yy]") {
    Write-Host "Restarting computer in 5 seconds... Save your work!" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Restart-Computer -Force
} else {
    Write-Host "You chose not to restart. Please restart manually before running Docker." -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
