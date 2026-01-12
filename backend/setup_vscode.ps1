# Quick Setup - Fix VS Code Errors

Write-Host "🔧 EduWealth Backend - Quick Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if in backend directory
if (-not (Test-Path "manage.py")) {
    Write-Host "❌ Error: Please run this from the backend directory" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor Yellow
    exit 1
}

# Create venv if doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
Write-Host "   This may take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

# Install requirements
& ".\venv\Scripts\pip.exe" install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some dependencies may have failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Select Python Interpreter in VS Code:" -ForegroundColor White
Write-Host "   • Press Ctrl+Shift+P" -ForegroundColor Gray
Write-Host "   • Type 'Python: Select Interpreter'" -ForegroundColor Gray
Write-Host "   • Choose: .\backend\venv\Scripts\python.exe" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Reload VS Code window:" -ForegroundColor White
Write-Host "   • Press Ctrl+Shift+P" -ForegroundColor Gray
Write-Host "   • Type 'Developer: Reload Window'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. All import errors should be gone! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "4. Start the server:" -ForegroundColor White
Write-Host "   • python manage.py migrate" -ForegroundColor Gray
Write-Host "   • python manage.py runserver 4000" -ForegroundColor Gray
Write-Host ""
