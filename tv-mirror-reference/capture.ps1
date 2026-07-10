$ErrorActionPreference = "Stop"

$CDP_PORT = 9223
$ScriptDir = $PSScriptRoot
$OutHTML  = Join-Path $ScriptDir "index.html"
$Remote   = "72.62.73.180"
$RemotePath = "/var/www/tv-mirror/index.html"

Write-Host "Capturing TradingView chart via CDP screenshot (port $CDP_PORT)..."
node (Join-Path $ScriptDir "cdp-screenshot.js")

if (-not (Test-Path $OutHTML)) {
  Write-Error "Capture failed: $OutHTML not created."
  exit 1
}

$size = (Get-Item $OutHTML).Length
Write-Host "Captured: $OutHTML ($([math]::Round($size/1KB)) KB)"

Write-Host "Uploading to $Remote`:$RemotePath ..."
scp $OutHTML "${Remote}:$RemotePath"
Write-Host "Done. Live at https://$Remote/astroneum/"
