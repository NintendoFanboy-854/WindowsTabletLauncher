<#
.SYNOPSIS
  用 Edge headless 给本地页面截图（不弹窗口、不抓屏）。

.EXAMPLE
  # 先起预览服务（后台）
  .\scripts\shot.ps1 -Serve

.EXAMPLE
  .\scripts\shot.ps1 -Url http://localhost:4173/ -Out shots/desktop-1440x960.png

.EXAMPLE
  # 竖屏
  .\scripts\shot.ps1 -Width 960 -Height 1440 -Out shots/desktop-portrait.png
#>
param(
  [string]$Url = 'http://localhost:4173/',
  [string]$Out = 'shots/shot.png',
  [int]$Width = 1440,
  [int]$Height = 960,
  [int]$BudgetMs = 12000,
  [int]$WaitSec = 120,
  [switch]$Serve,
  [int]$Port = 4173
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
if (-not (Test-Path $edge)) { throw "找不到 Edge: $edge" }

$outPath = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path $root $Out }
$outDir = Split-Path $outPath -Parent
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

if ($Serve) {
  $env:Path = 'C:\Program Files\nodejs;' + $env:Path
  $vite = Join-Path $root 'node_modules\vite\bin\vite.js'
  if (-not (Test-Path $vite)) { throw "找不到 vite，先 npm install" }
  Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList @($vite, 'preview', '--port', $Port, '--strictPort') -WorkingDirectory $root -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 3
}

$profile = Join-Path $env:TEMP ('edge-shot-' + [guid]::NewGuid().ToString('N').Substring(0, 8))
if (Test-Path $outPath) { Remove-Item $outPath -Force }

$args = @(
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  "--user-data-dir=$profile", "--window-size=$Width,$Height", "--virtual-time-budget=$BudgetMs",
  "--screenshot=$outPath", $Url
)
Start-Process -FilePath $edge -ArgumentList $args -WindowStyle Hidden | Out-Null

$deadline = (Get-Date).AddSeconds($WaitSec)
while (-not (Test-Path $outPath) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 500 }

# 等文件写稳定（Edge 有时先建空文件）
if (Test-Path $outPath) {
  $last = -1
  while ((Get-Item $outPath).Length -ne $last -and (Get-Date) -lt $deadline) {
    $last = (Get-Item $outPath).Length
    Start-Sleep -Milliseconds 300
  }
}

if (-not (Test-Path $outPath)) { throw '截图失败：没有生成文件' }
"截图: $outPath ($((Get-Item $outPath).Length) bytes, ${Width}x${Height})"

