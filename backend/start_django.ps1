# EduWealth Backend - Django Setup Script
# This script helps set up and run the Django backend

Write-Host "🚀 EduWealth Backend - Django Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if Django is installed
$djangoInstalled = python -c "import django; print('yes')" 2>$null
if ($djangoInstalled -ne "yes") {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from .env.example" -ForegroundColor Yellow
    exit 1
}

# Run migrations
Write-Host ""
Write-Host "🔄 Running database migrations..." -ForegroundColor Yellow
python manage.py migrate

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Django development server..." -ForegroundColor Cyan
Write-Host "📚 API: http://localhost:4000/api" -ForegroundColor White
Write-Host "💚 Health: http://localhost:4000/health" -ForegroundColor White
Write-Host "🔧 Admin: http://localhost:4000/admin" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Django server
python manage.py runserver 4000
