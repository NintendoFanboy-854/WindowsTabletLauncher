#Requires -PSEdition Core

$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot

Write-Host "=== Build ClockPlugin (Release) ===" -ForegroundColor Cyan

$pluginProj = "$Root\src\Plugins\ClockPlugin\ClockPlugin.csproj"
dotnet publish $pluginProj -c Release -p:DebugType=none -p:DebugSymbols=false

$pluginDll = "$Root\src\Plugins\ClockPlugin\bin\Release\net10.0-windows10.0.26100.0\ClockPlugin.dll"
if (-not (Test-Path $pluginDll)) {
    Write-Error "ClockPlugin build failed: DLL not found"
    exit 1
}

Write-Host "=== Build WeatherPlugin (Release) ===" -ForegroundColor Cyan

$weatherProj = "$Root\src\Plugins\WeatherPlugin\WeatherPlugin.csproj"
dotnet publish $weatherProj -c Release -p:DebugType=none -p:DebugSymbols=false

$weatherDll = "$Root\src\Plugins\WeatherPlugin\bin\Release\net10.0-windows10.0.26100.0\WeatherPlugin.dll"
if (-not (Test-Path $weatherDll)) {
    Write-Error "WeatherPlugin build failed: DLL not found"
    exit 1
}

$morePlugins = @(
    @{ Name = "PomodoroPlugin" },
    @{ Name = "SedentaryPlugin" },
    @{ Name = "TodoPlugin" }
)
$moreDlls = @()
foreach ($p in $morePlugins) {
    Write-Host "=== Build $($p.Name) (Release) ===" -ForegroundColor Cyan
    $proj = "$Root\src\Plugins\$($p.Name)\$($p.Name).csproj"
    dotnet publish $proj -c Release -p:DebugType=none -p:DebugSymbols=false
    $dll = "$Root\src\Plugins\$($p.Name)\bin\Release\net10.0-windows10.0.26100.0\$($p.Name).dll"
    if (-not (Test-Path $dll)) {
        Write-Error "$($p.Name) build failed: DLL not found"
        exit 1
    }
    $moreDlls += $dll
}

Write-Host "=== Publish LauncherHost (Release, self-contained) ===" -ForegroundColor Cyan

$hostProj = "$Root\src\LauncherHost\LauncherHost.csproj"
$output   = "$Root\bin\Release"

Remove-Item -Recurse -Force $output -ErrorAction SilentlyContinue

dotnet publish $hostProj `
    -c Release `
    -o $output `
    --self-contained true `
    -p:WindowsAppSDKSelfContained=true `
    -p:PublishTrimmed=false `
    -p:DebugType=none `
    -p:DebugSymbols=false

if (-not (Test-Path "$output\LauncherHost.exe")) {
    Write-Error "Publish failed: LauncherHost.exe not found in $output"
    exit 1
}

$pluginsDir = "$output\Plugins"
New-Item -ItemType Directory -Force -Path $pluginsDir | Out-Null
Copy-Item $pluginDll $pluginsDir -Force
Copy-Item $weatherDll $pluginsDir -Force
foreach ($dll in $moreDlls) { Copy-Item $dll $pluginsDir -Force }

Write-Host "=== Trim locale folders ===" -ForegroundColor Cyan
Get-ChildItem $output -Directory | Where-Object {
    $_.Name -match '^[a-z]{2,3}(-[A-Za-z0-9]+){1,2}$' -and $_.Name -notlike 'zh-CN' -and $_.Name -notlike 'en-US' -and $_.Name -notlike 'en-us'
} | Remove-Item -Recurse -Force

Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Exe: $output\LauncherHost.exe"
Get-ChildItem $pluginsDir -Filter *.dll | ForEach-Object { Write-Host "Plugin: $($_.FullName)" }
