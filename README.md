# EduWealth — Smart Student Finance & Course Recommendation Platform

![EduWealth Logo](https://via.placeholder.com/150?text=EduWealth)

## 🎯 Overview

**EduWealth** is a full-stack web application designed to help students discover and invest in affordable online courses. The platform aggregates courses from multiple providers (Udemy, Coursera, edX), matches them with user interests and budgets, and provides motivational messages to encourage learning investments.

**Tagline:** *"Skip one burger this month — invest in a course that pays back with skills."*

## ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 🎨 **Interest-Based Matching** - Select interests and get personalized recommendations
- 💰 **Budget-Conscious** - Set your budget and find courses within your means
- 🤖 **Automated Course Aggregation** - Web crawler collects courses from multiple providers
- 📊 **Smart Recommendations** - Algorithm matches courses based on interests, budget, and ratings
- 💡 **Motivational Insights** - Encouraging messages about learning investments
- 📱 **Responsive Design** - Beautiful UI built with React and Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Formik + Yup** for form validation
- **Headless UI** for accessible components
- **Axios** for API calls

### Backend
- **Node.js + Express** with TypeScript
- **Prisma ORM** for database management
- **PostgreSQL** for data storage
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for request validation

### Crawler
- **Python** with requests + BeautifulSoup
- **APScheduler** for scheduled crawls
- **Robots.txt compliance** and rate limiting

### DevOps
- **Docker & Docker Compose** for containerization
- **PostgreSQL 15** database
- Environment-based configuration

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker** and Docker Compose
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/eduwealth.git
cd eduwealth
```

### 2. Environment Setup

Create environment files:

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://edu:edupass@localhost:5432/eduwealth

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
```

### 3. Run with Docker Compose (Recommended)

```bash
# From the root directory
docker-compose up --build
```

This will start:
- PostgreSQL on port 5432
- Backend on port 4000
- Frontend on port 3000

### 4. Database Setup

In a new terminal, run migrations:

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma db seed
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Docs:** http://localhost:4000/api/docs

## 🔧 Development Setup (Without Docker)

### Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Crawler Setup

```bash
cd crawler
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python udemy_scraper.py --limit 50
```

## 📊 Database Schema

### Users Table
```sql
- id (UUID, primary key)
- email (unique)
- password_hash
- name
- budget_amount (numeric)
- currency (varchar, default: 'INR')
- created_at, updated_at
```

### Interests Table
```sql
- id (serial)
- name (varchar, unique)
- created_at
```

### User Interests (Junction Table)
```sql
- id
- user_id (foreign key -> users.id)
- interest_id (foreign key -> interests.id)
- created_at
```

### Courses Table
```sql
- id (UUID, primary key)
- title
- provider_name
- provider_slug
- url
- price (numeric, nullable)
- currency
- rating (numeric)
- duration
- categories (jsonb)
- thumbnail_url
- source_hash (unique)
- scraped_at
```

### User Saved Courses
```sql
- id
- user_id (foreign key -> users.id)
- course_id (foreign key -> courses.id)
- added_at
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Profile
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile
- `PUT /api/me/budget` - Update user budget

### Interests
- `GET /api/interests` - List all interests
- `POST /api/me/interests` - Update user interests
- `GET /api/me/interests` - Get user interests

### Courses
- `GET /api/courses` - Get course recommendations
  - Query params: `interest`, `max_price`, `limit`, `offset`
- `GET /api/courses/:id` - Get course details
- `POST /api/me/saved-courses` - Save a course
- `GET /api/me/saved-courses` - Get saved courses
- `DELETE /api/me/saved-courses/:id` - Remove saved course

### Admin (Protected)
- `POST /api/admin/scrape` - Trigger crawler job

## 🤖 Crawler Details

The crawler respects robots.txt and implements:
- Rate limiting (1-2s delay between requests)
- User-Agent identification
- Polite crawling practices
- Source deduplication via hash
- Error handling and retry logic

**Run manually:**
```bash
cd crawler
python udemy_scraper.py --limit 100
python coursera_scraper.py --limit 100
```

**Schedule automatic crawls:**
```bash
python scheduler.py
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🎨 UI/UX Features

- Clean, modern card-based design
- Responsive layout (mobile, tablet, desktop)
- Loading states and error handling
- Toast notifications for user feedback
- Accessible components with keyboard navigation
- Dark mode support (coming soon)

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT with short-lived access tokens (15 min)
- Refresh token rotation
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Rate limiting on sensitive endpoints
- SQL injection prevention via Prisma

## 📈 Recommendation Algorithm

```javascript
Score = (interest_match_count × 10) 
      + (rating × 2) 
      - price_weight(price / user_budget)
```

Courses are filtered by:
1. Interest match (any category intersection)
2. Price ≤ user budget (with fallback suggestions)
3. Sorted by calculated score (descending)

## 🚀 Deployment

### Docker Production Build

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

Remember to set secure values for:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `DATABASE_URL`
- CORS allowed origins

### Recommended Hosting

- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** Railway, Render, Heroku, or AWS ECS
- **Database:** AWS RDS, Supabase, or Railway Postgres
- **Crawler:** AWS Lambda, Heroku scheduler, or cron job

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Course data aggregated from public sources (Udemy, Coursera, edX)
- All crawling activities respect robots.txt and TOS
- Metadata used for educational and recommendation purposes only

## 📧 Contact

For questions or support, please open an issue or contact:
- Email: support@eduwealth.com
- Twitter: @eduwealth

---

**Built with ❤️ for students who want to invest in their future through learning.**

*"Education is the most powerful investment you can make in yourself."*
