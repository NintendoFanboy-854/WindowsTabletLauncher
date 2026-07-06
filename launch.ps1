#Requires -PSEdition Core

$Root = $PSScriptRoot
$exe = "$Root\bin\Release\LauncherHost.exe"

if (-not (Test-Path $exe)) {
    Write-Error "Not built yet. Run .\build-release.ps1 first."
    exit 1
}

& $exe
