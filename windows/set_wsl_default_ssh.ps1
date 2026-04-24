# Run this script as Administrator on your Windows machine

Write-Host "Configuring Windows OpenSSH to drop directly into WSL..."

# Set the default SSH shell in the Windows Registry to wsl.exe
New-ItemProperty -Path "HKLM:\SOFTWARE\OpenSSH" -Name DefaultShell -Value "C:\Windows\System32\wsl.exe" -PropertyType String -Force

Write-Host ""
Write-Host "=================================================="
Write-Host "Success! WSL is now your default SSH environment."
Write-Host "=================================================="
Write-Host "From now on, when you run this on your Mac:"
Write-Host "ssh your_username@192.168.x.x"
Write-Host ""
Write-Host "You will bypass PowerShell and land instantly inside Ubuntu!"
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
