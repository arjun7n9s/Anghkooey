# Start API + print QR sheet URL
Write-Host "Starting Anghkooey API on http://127.0.0.1:8787"
Write-Host "QR print sheet: http://127.0.0.1:8787/print/sheet"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\services\api'; npm run dev"
Write-Host "Run mobile: cd apps/mobile && npx expo start"
