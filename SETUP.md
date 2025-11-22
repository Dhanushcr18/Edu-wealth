# EduWealth Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Docker and Docker Compose (optional but recommended)
- PostgreSQL 15 (if not using Docker)

## Option 1: Docker Setup (Recommended)

### Step 1: Clone and Setup Environment Files

```powershell
# Navigate to project
cd c:\Eduwealth

# Backend environment
Copy-Item backend\.env.example backend\.env

# Frontend environment  
Copy-Item frontend\.env.example frontend\.env

# Crawler environment
Copy-Item crawler\.env.example crawler\.env
```

### Step 2: Start Services with Docker

```powershell
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d
```

### Step 3: Run Database Migrations

```powershell
# Open a new PowerShell terminal
cd backend
docker exec -it eduwealth-backend npx prisma migrate deploy
docker exec -it eduwealth-backend npx prisma db seed
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

### Demo Account
- Email: demo@eduwealth.com
- Password: demo123456

---

## Option 2: Local Development Setup

### Step 1: Database Setup

```powershell
# Install PostgreSQL 15
# Create database
psql -U postgres
CREATE DATABASE eduwealth;
CREATE USER edu WITH PASSWORD 'edupass';
GRANT ALL PRIVILEGES ON DATABASE eduwealth TO edu;
\q
```

### Step 2: Backend Setup

```powershell
cd backend

# Install dependencies
npm install

# Setup environment
Copy-Item .env.example .env
# Edit .env and set DATABASE_URL

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start backend server
npm run dev
```

Backend will run on http://localhost:4000

### Step 3: Frontend Setup

```powershell
cd frontend

# Install dependencies
npm install

# Setup environment
Copy-Item .env.example .env

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

### Step 4: Crawler Setup

```powershell
cd crawler

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Setup environment
Copy-Item .env.example .env
# Edit .env if needed

# Run crawler
python crawler.py --limit 50
```

---

## 🧪 Testing

### Backend Tests

```powershell
cd backend
npm test
npm run test:coverage
```

### API Testing with cURL

```powershell
# Health check
curl http://localhost:4000/health

# Register user
curl -X POST http://localhost:4000/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}'

# Login
$response = curl -X POST http://localhost:4000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"demo@eduwealth.com\",\"password\":\"demo123456\"}' | ConvertFrom-Json

$token = $response.accessToken

# Get user profile
curl http://localhost:4000/api/me `
  -H "Authorization: Bearer $token"

# Get courses
curl "http://localhost:4000/api/courses?limit=10" `
  -H "Authorization: Bearer $token"
```

---

## 📊 Database Management

### View Database

```powershell
cd backend
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555

### Reset Database

```powershell
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Create New Migration

```powershell
cd backend
npx prisma migrate dev --name your_migration_name
```

---

## 🔧 Troubleshooting

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Database Connection Issues

1. Check PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Check firewall settings
4. Test connection:

```powershell
psql -h localhost -U edu -d eduwealth
```

### Docker Issues

```powershell
# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Rebuild
docker-compose up --build
```

### Node Module Issues

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
```

---

## 🎯 Development Workflow

### Making Changes

1. **Backend Changes**: Server auto-restarts with nodemon
2. **Frontend Changes**: Vite hot-reloads automatically
3. **Database Changes**: Create migration, then apply

### Adding a New Feature

1. Create database migration if needed
2. Update Prisma schema
3. Generate Prisma Client: `npx prisma generate`
4. Add backend routes/controllers
5. Add frontend components/pages
6. Test thoroughly
7. Update documentation

---

## 📦 Building for Production

### Backend

```powershell
cd backend
npm run build
npm start
```

### Frontend

```powershell
cd frontend
npm run build
# Serve the dist folder with a static server
```

### Docker Production

```powershell
# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change JWT secrets in .env
- [ ] Use strong database passwords
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Review and test authentication
- [ ] Scan for vulnerabilities: `npm audit`
- [ ] Set NODE_ENV=production
- [ ] Disable Prisma Studio in production
- [ ] Set up proper logging and monitoring

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 💬 Support

For issues or questions:
1. Check this setup guide
2. Review the main README.md
3. Check existing issues on GitHub
4. Open a new issue with details

---

**Happy Coding! 🎉**
