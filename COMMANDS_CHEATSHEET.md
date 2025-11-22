# EduWealth - Command Cheatsheet

Quick reference for common commands while working with EduWealth.

## 🐳 Docker Commands

### Start & Stop

```powershell
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Build and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

### Container Management

```powershell
# List running containers
docker ps

# Execute command in container
docker exec -it eduwealth-backend sh
docker exec -it eduwealth-frontend sh
docker exec -it eduwealth-db psql -U edu -d eduwealth

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## 🗄️ Database Commands

### Prisma Commands

```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

### Direct PostgreSQL Access

```powershell
# Connect to database
psql -h localhost -U edu -d eduwealth

# Inside psql:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
SELECT * FROM courses LIMIT 10;
\q               # Quit
```

### Docker Database Access

```powershell
# Access database in Docker container
docker exec -it eduwealth-db psql -U edu -d eduwealth

# Backup database
docker exec eduwealth-db pg_dump -U edu eduwealth > backup.sql

# Restore database
docker exec -i eduwealth-db psql -U edu eduwealth < backup.sql
```

---

## 🖥️ Backend Commands

### Development

```powershell
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma commands
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed

# Linting & Formatting
npm run lint
npm run format

# Testing
npm test
npm run test:watch
npm run test:coverage
```

### Backend in Docker

```powershell
# Install packages in container
docker exec eduwealth-backend npm install package-name

# Run migrations
docker exec eduwealth-backend npx prisma migrate deploy

# Seed database
docker exec eduwealth-backend npx prisma db seed

# View logs
docker logs eduwealth-backend -f

# Restart backend
docker-compose restart backend
```

---

## 🎨 Frontend Commands

### Development

```powershell
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Frontend in Docker

```powershell
# Install packages in container
docker exec eduwealth-frontend npm install package-name

# View logs
docker logs eduwealth-frontend -f

# Restart frontend
docker-compose restart frontend
```

---

## 🕷️ Crawler Commands

### Setup

```powershell
cd crawler

# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate virtual environment (CMD)
.\venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Deactivate virtual environment
deactivate
```

### Running Crawler

```powershell
# Run with default limit (50 courses)
python crawler.py

# Run with custom limit
python crawler.py --limit 100

# Run with environment variables
$env:DATABASE_URL="postgresql://edu:edupass@localhost:5432/eduwealth"
python crawler.py --limit 20
```

---

## 🧪 Testing Commands

### API Testing with cURL

```powershell
# Health check
curl http://localhost:4000/health

# Signup
curl -X POST http://localhost:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}'

# Login
$response = curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo@eduwealth.com\",\"password\":\"demo123456\"}' | ConvertFrom-Json

$token = $response.accessToken

# Get user profile
curl http://localhost:4000/api/me `
  -H "Authorization: Bearer $token"

# Get interests
curl http://localhost:4000/api/interests

# Get courses
curl "http://localhost:4000/api/courses?limit=10" `
  -H "Authorization: Bearer $token"

# Update budget
curl -X PUT http://localhost:4000/api/me/budget `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{\"budgetAmount\":5000,\"currency\":\"INR\"}'
```

---

## 🔧 Troubleshooting Commands

### Port Issues

```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432

# Kill process (replace PID with actual process ID)
taskkill /PID 1234 /F
```

### Clean & Rebuild

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Docker complete reset
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### Check Logs

```powershell
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100
```

---

## 📦 Package Management

### Backend Packages

```powershell
cd backend

# Add new package
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Remove package
npm uninstall package-name

# Update packages
npm update

# Check for outdated packages
npm outdated

# Security audit
npm audit
npm audit fix
```

### Frontend Packages

```powershell
cd frontend

# Same commands as backend
npm install package-name
npm install --save-dev package-name
npm uninstall package-name
npm update
npm outdated
npm audit
```

### Python Packages

```powershell
cd crawler

# Install package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Install from requirements
pip install -r requirements.txt

# Update package
pip install --upgrade package-name

# List installed packages
pip list
```

---

## 🚀 Deployment Commands

### Build for Production

```powershell
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build

# Docker production build
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Setup

```powershell
# Copy and edit environment files
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
Copy-Item crawler\.env.example crawler\.env

# Edit files with notepad
notepad backend\.env
notepad frontend\.env
notepad crawler\.env
```

---

## 🔍 Monitoring Commands

### System Resources

```powershell
# Docker stats
docker stats

# Container resource usage
docker stats eduwealth-backend eduwealth-frontend eduwealth-db

# Disk usage
docker system df

# View container details
docker inspect eduwealth-backend
```

### Database Stats

```powershell
# Connect and run queries
docker exec -it eduwealth-db psql -U edu -d eduwealth

# Inside psql:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM interests;

# Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎯 Quick Workflows

### First Time Setup

```powershell
# 1. Clone repository (if from git)
git clone <repo-url>
cd eduwealth

# 2. Setup environment
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env

# 3. Start with Docker
docker-compose up --build

# 4. In new terminal - setup database
cd backend
docker exec -it eduwealth-backend npx prisma migrate deploy
docker exec -it eduwealth-backend npx prisma db seed

# 5. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

### Daily Development

```powershell
# Start all services
docker-compose up

# Or start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Make changes (hot reload enabled)
# Edit files in backend/src or frontend/src

# Stop when done
docker-compose down
```

### Add New Feature

```powershell
# 1. Update database schema
cd backend
# Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_new_feature

# 3. Generate Prisma Client
npx prisma generate

# 4. Update backend routes/controllers
# Edit src/routes/*.ts

# 5. Update frontend pages/components
# Edit frontend/src/pages/*.tsx

# 6. Test
npm run dev
```

---

## 📝 Git Commands

```powershell
# Initialize repo
git init
git add .
git commit -m "Initial commit"

# Create branches
git checkout -b feature/new-feature

# Stage changes
git add .
git status

# Commit
git commit -m "Add new feature"

# Push to remote
git push origin main

# Pull latest
git pull origin main
```

---

## 🎓 Learning Commands

### Explore Database

```powershell
# Open Prisma Studio
cd backend
npx prisma studio
# Visit http://localhost:5555
```

### Test API Endpoints

```powershell
# Install Thunder Client extension in VS Code
# Or use the curl commands above
# Or use Postman
```

### View Application

```powershell
# Start services
docker-compose up

# Access:
# - http://localhost:3000 (Frontend)
# - http://localhost:4000 (Backend)
# - http://localhost:4000/health (Health check)
```

---

**Pro Tip**: Save this cheatsheet as a bookmark for quick reference!

**Happy Coding! 🚀**
