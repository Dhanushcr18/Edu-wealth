# EduWealth Quick Start Script
# Run this script to get started quickly!

Write-Host "🎓 EduWealth Platform - Quick Start" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "🔍 Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>&1 | Select-String "Server Version"
if (!$dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running`n" -ForegroundColor Green

# Start Docker Compose
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run database migrations
Write-Host "`n📊 Setting up database..." -ForegroundColor Yellow
docker exec eduwealth-backend npx prisma migrate deploy

# Seed database
Write-Host "`n🌱 Seeding database with sample data..." -ForegroundColor Yellow
docker exec eduwealth-backend npx prisma db seed

Write-Host "`n✅ EduWealth is ready!" -ForegroundColor Green
Write-Host "`n📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Health:   http://localhost:4000/health" -ForegroundColor White

Write-Host "`n🔑 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Email:    demo@eduwealth.com" -ForegroundColor White
Write-Host "   Password: demo123456" -ForegroundColor White

Write-Host "`n📚 Useful Commands:" -ForegroundColor Cyan
Write-Host "   View logs:        docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop services:    docker-compose down" -ForegroundColor White
Write-Host "   Prisma Studio:    cd backend && npx prisma studio" -ForegroundColor White

Write-Host "`n🎉 Happy coding!" -ForegroundColor Green
