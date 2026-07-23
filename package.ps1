#Requires -PSEdition Core
param([switch]$Build)

$ErrorActionPreference = "Stop"
Push-Location $PSScriptRoot

$isccPaths = @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 7\ISCC.exe",
    "C:\Program Files\Inno Setup 7\ISCC.exe",
    "C:\InnoSetup\ISCC.exe"
)

$iscc = $null
foreach ($p in $isccPaths) {
    if (Test-Path $p) { $iscc = $p; break }
}

if (-not $iscc) {
    Write-Error "Inno Setup not found. Install it: winget install JRSoftware.InnoSetup"
    Pop-Location
    exit 1
}

if ($Build) {
    Write-Host "=== Building ===" -ForegroundColor Cyan
    & "$PSScriptRoot\build-release.ps1"
    if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
}

$exe = "$PSScriptRoot\bin\Release\LauncherHost.exe"
if (-not (Test-Path $exe)) {
    Write-Error "LauncherHost.exe not found. Run with -Build or build first."
    Pop-Location
    exit 1
}

Write-Host "=== Packaging with Inno Setup ===" -ForegroundColor Cyan
& $iscc "$PSScriptRoot\installer.iss"

if ($LASTEXITCODE -eq 0) {
    $setup = Resolve-Path "$PSScriptRoot\bin\LauncherSetup.exe"
    Write-Host "=== Done ===" -ForegroundColor Green
    Write-Host "Installer: $setup"
} else {
    Write-Error "Packaging failed"
}

Pop-Location
