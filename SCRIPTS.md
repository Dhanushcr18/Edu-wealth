# 📜 Available Scripts

This document lists all the convenient scripts and commands available in the EduWealth project.

## 🚀 Quick Start Scripts

### PowerShell Quick Start (Windows)

```powershell
# From project root
.\start.ps1
```

This script will:
- Check if Docker is running
- Start all Docker containers
- Run database migrations
- Seed the database with sample data
- Display access URLs and demo credentials

---

## 📦 NPM Scripts

### Backend Scripts (`cd backend`)

```json
{
  "dev": "nodemon src/server.ts",              // Start development server with hot reload
  "build": "tsc",                               // Compile TypeScript to JavaScript
  "start": "node dist/server.js",               // Start production server
  "prisma:generate": "prisma generate",         // Generate Prisma Client
  "prisma:migrate": "prisma migrate dev",       // Create and apply migration
  "prisma:deploy": "prisma migrate deploy",     // Apply migrations (production)
  "prisma:seed": "ts-node prisma/seed.ts",     // Seed database
  "test": "jest --coverage",                    // Run tests with coverage
  "test:watch": "jest --watch",                 // Run tests in watch mode
  "lint": "eslint src --ext .ts",               // Lint TypeScript files
  "format": "prettier --write \"src/**/*.ts\""  // Format code with Prettier
}
```

**Usage:**
```powershell
cd backend
npm run dev          # Start development
npm run build        # Build for production
npm test             # Run tests
npm run prisma:seed  # Seed database
```

### Frontend Scripts (`cd frontend`)

```json
{
  "dev": "vite",                    // Start Vite development server
  "build": "tsc && vite build",     // Build for production
  "lint": "eslint . --ext ts,tsx",  // Lint TypeScript/React files
  "preview": "vite preview"         // Preview production build
}
```

**Usage:**
```powershell
cd frontend
npm run dev      # Start development
npm run build    # Build for production
npm run preview  # Preview build
```

---

## 🐳 Docker Compose Scripts

### Start Services

```powershell
# Start all services (attached - see logs)
docker-compose up

# Start all services (detached - run in background)
docker-compose up -d

# Build and start
docker-compose up --build

# Start specific service
docker-compose up backend
docker-compose up frontend
```

### Stop Services

```powershell
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Stop specific service
docker-compose stop backend
docker-compose stop frontend
```

### View Logs

```powershell
# All services
docker-compose logs

# Follow logs (live updates)
docker-compose logs -f

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Last 100 lines
docker-compose logs --tail=100
```

### Restart Services

```powershell
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## 🗄️ Database Scripts

### Prisma Commands

```powershell
cd backend

# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name migration_name

# Apply existing migrations
npx prisma migrate deploy

# Reset database (destructive!)
npx prisma migrate reset

# Seed database with sample data
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

### Direct Database Access

```powershell
# Connect via psql
docker exec -it eduwealth-db psql -U edu -d eduwealth

# Backup database
docker exec eduwealth-db pg_dump -U edu eduwealth > backup.sql

# Restore database
docker exec -i eduwealth-db psql -U edu eduwealth < backup.sql
```

---

## 🕷️ Crawler Scripts

### Setup Virtual Environment

```powershell
cd crawler

# Create virtual environment
python -m venv venv

# Activate (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (CMD)
.\venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Deactivate when done
deactivate
```

### Run Crawler

```powershell
# Default (50 courses)
python crawler.py

# Custom limit
python crawler.py --limit 100

# With specific environment
$env:DATABASE_URL="postgresql://edu:edupass@localhost:5432/eduwealth"
python crawler.py --limit 20
```

---

## 🧪 Testing Scripts

### Backend Testing

```powershell
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### API Testing

See `COMMANDS_CHEATSHEET.md` for curl commands to test API endpoints.

---

## 🔧 Utility Scripts

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

### Port Management

```powershell
# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID 1234 /F
```

---

## 📊 Monitoring Scripts

### Container Stats

```powershell
# View resource usage
docker stats

# View specific containers
docker stats eduwealth-backend eduwealth-frontend eduwealth-db

# View disk usage
docker system df

# Inspect container
docker inspect eduwealth-backend
```

### Database Stats

```powershell
# Connect to database
docker exec -it eduwealth-db psql -U edu -d eduwealth

# Inside psql, run:
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
SELECT COUNT(*) FROM interests;

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Exit psql
\q
```

---

## 🎯 Common Workflows

### Complete Setup (First Time)

```powershell
# Option 1: Use the quick start script
.\start.ps1

# Option 2: Manual steps
docker-compose up -d
docker exec eduwealth-backend npx prisma migrate deploy
docker exec eduwealth-backend npx prisma db seed
```

### Daily Development

```powershell
# Start
docker-compose up

# Make changes (hot reload is enabled)
# Edit files in backend/src or frontend/src

# Stop
docker-compose down
```

### Add New Database Field

```powershell
cd backend

# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_field

# 3. Generate Prisma Client
npx prisma generate

# 4. Restart backend
docker-compose restart backend
```

### Update Dependencies

```powershell
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix

# Crawler
cd crawler
pip install --upgrade -r requirements.txt
```

---

## 📝 Script Creation

### Create Custom Scripts

You can add custom scripts to `package.json`:

```json
{
  "scripts": {
    "custom": "your-command-here"
  }
}
```

Then run with:
```powershell
npm run custom
```

---

## 🔐 Environment Scripts

### Setup Environment Files

```powershell
# Copy templates
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
Copy-Item crawler\.env.example crawler\.env

# Edit files
notepad backend\.env
notepad frontend\.env
notepad crawler\.env
```

---

## 📚 Documentation Scripts

### Generate Docs

```powershell
# Backend API documentation (if configured)
cd backend
npm run docs

# Frontend component documentation (if configured)
cd frontend
npm run docs
```

---

## 🚀 Deployment Scripts

### Build for Production

```powershell
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build

# Docker production
docker-compose -f docker-compose.prod.yml up --build -d
```

---

## 💡 Tips

1. **Use `npm run` to see all available scripts** in any package.json directory
2. **Chain commands** with `&&` or `;` in PowerShell
3. **Create aliases** for frequently used commands
4. **Use `docker-compose logs -f`** to debug issues
5. **Keep `start.ps1`** up to date with project setup steps

---

## 📖 Additional Resources

- **COMMANDS_CHEATSHEET.md** - Detailed command reference
- **SETUP.md** - Full setup instructions
- **README.md** - Project overview
- **PROJECT_STRUCTURE.md** - Architecture details

---

**Quick Reference:**

| What | Command |
|------|---------|
| Start everything | `.\start.ps1` or `docker-compose up` |
| Stop everything | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Database GUI | `cd backend && npx prisma studio` |
| Run crawler | `cd crawler && python crawler.py` |
| Reset database | `cd backend && npx prisma migrate reset` |

---

**Happy scripting! 🎬**
