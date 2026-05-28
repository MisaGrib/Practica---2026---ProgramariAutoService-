$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location -Path '$scriptDir\\Backend'; dotnet run"
)

Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location -Path '$scriptDir\\Frontend'; npm run dev -- --host 127.0.0.1"
)
