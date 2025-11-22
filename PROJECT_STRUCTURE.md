# EduWealth Project Structure

```
eduwealth/
│
├── backend/                          # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema definition
│   │   └── seed.ts                  # Database seeding script
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts             # App configuration
│   │   │   └── database.ts          # Prisma client instance
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication middleware
│   │   │   └── errorHandler.ts     # Global error handling
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # Auth endpoints (signup/login/refresh)
│   │   │   ├── user.routes.ts       # User profile endpoints
│   │   │   ├── interests.routes.ts  # Interest management endpoints
│   │   │   └── courses.routes.ts    # Course recommendation endpoints
│   │   ├── utils/
│   │   │   ├── jwt.ts               # JWT token generation/verification
│   │   │   └── password.ts          # Password hashing utilities
│   │   └── server.ts                # Express app entry point
│   ├── .env.example                 # Environment variables template
│   ├── .dockerignore
│   ├── Dockerfile                   # Backend container definition
│   ├── package.json
│   ├── tsconfig.json                # TypeScript configuration
│   └── nodemon.json                 # Nodemon configuration
│
├── frontend/                         # React + Vite + Tailwind Frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # Axios instance with interceptors
│   │   ├── components/
│   │   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global auth state management
│   │   ├── pages/
│   │   │   ├── Landing.tsx          # Landing/home page
│   │   │   ├── Login.tsx            # Login page
│   │   │   ├── Signup.tsx           # Registration page
│   │   │   └── Dashboard.tsx        # Main dashboard with courses
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript type definitions
│   │   ├── App.tsx                  # Root component with routing
│   │   ├── main.tsx                 # React DOM entry point
│   │   ├── index.css                # Tailwind directives & global styles
│   │   └── vite-env.d.ts            # Vite environment types
│   ├── .env.example                 # Environment variables template
│   ├── .dockerignore
│   ├── Dockerfile                   # Frontend container definition
│   ├── index.html                   # HTML entry point
│   ├── package.json
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tsconfig.node.json           # Node-specific TS config
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   └── postcss.config.js            # PostCSS configuration
│
├── crawler/                          # Python Web Crawler
│   ├── .env.example                 # Environment variables template
│   ├── crawler.py                   # Main crawler script
│   └── requirements.txt             # Python dependencies
│
├── docker-compose.yml               # Multi-container orchestration
├── .gitignore                       # Git ignore rules
├── README.md                        # Main project documentation
└── SETUP.md                         # Detailed setup instructions
```

## Key Files Explained

### Backend

#### `prisma/schema.prisma`
- Defines database schema for PostgreSQL
- Tables: users, interests, user_interests, courses, user_saved_courses, refresh_tokens
- Prisma generates type-safe client from this schema

#### `src/server.ts`
- Express application entry point
- Configures middleware (CORS, helmet, rate limiting)
- Mounts API routes
- Error handling

#### `src/routes/*.routes.ts`
- RESTful API endpoint definitions
- Request validation with Zod
- Business logic for each domain

#### `src/middleware/auth.ts`
- JWT token verification
- Attaches user info to request object
- Protects routes requiring authentication

### Frontend

#### `src/context/AuthContext.tsx`
- Global authentication state
- Login/signup/logout functions
- Token management
- User session persistence

#### `src/api/client.ts`
- Axios instance configuration
- Request interceptor (adds auth token)
- Response interceptor (handles token refresh)
- Centralized error handling

#### `src/pages/*.tsx`
- React components for each route
- Form handling with Formik
- Validation with Yup
- Tailwind CSS styling

### Crawler

#### `crawler.py`
- Respects robots.txt
- Implements polite delays
- Generates unique hashes for deduplication
- Saves courses to PostgreSQL
- Currently uses sample data (extend for real scraping)

### Configuration

#### `docker-compose.yml`
- Defines 3 services: db, backend, frontend
- Networking between containers
- Volume persistence for database
- Health checks

#### `.env.example` files
- Templates for environment variables
- Never commit actual .env files
- Different configs for each service

## Data Flow

### Authentication Flow
1. User submits credentials → Frontend (Login.tsx)
2. POST /api/auth/login → Backend (auth.routes.ts)
3. Verify password → utils/password.ts
4. Generate JWT tokens → utils/jwt.ts
5. Return tokens + user data → Frontend
6. Store tokens in localStorage → AuthContext
7. Auto-attach to requests → api/client.ts

### Course Recommendation Flow
1. User sets interests + budget → Frontend
2. GET /api/courses?params → Backend (courses.routes.ts)
3. Query database with filters → Prisma
4. Apply scoring algorithm → courses.routes.ts
5. Sort and return ranked courses → Frontend
6. Display in card grid → Dashboard.tsx

### Crawler Flow
1. Run python crawler.py --limit 50
2. Check robots.txt
3. Fetch course data (sample or real HTML)
4. Parse metadata
5. Generate source_hash for deduplication
6. INSERT or UPDATE in courses table

## API Endpoints

### Authentication
- POST /api/auth/signup - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/refresh - Refresh access token
- POST /api/auth/logout - Logout user

### User Management
- GET /api/me - Get current user
- PUT /api/me - Update user profile
- PUT /api/me/budget - Update budget

### Interests
- GET /api/interests - List all interests (public)
- GET /api/interests/me - Get user's interests (protected)
- POST /api/interests/me - Update user's interests (protected)

### Courses
- GET /api/courses - Get recommended courses (protected)
  - Query params: interest, max_price, limit, offset, search
- GET /api/courses/:id - Get course details (public)
- POST /api/me/saved-courses - Save a course (protected)
- GET /api/me/saved-courses - Get saved courses (protected)
- DELETE /api/me/saved-courses/:id - Remove saved course (protected)

## Database Schema

### users
- id (UUID, PK)
- email (unique)
- password_hash
- name
- budget_amount (Decimal)
- currency (VARCHAR)
- created_at, updated_at

### interests
- id (Serial, PK)
- name (VARCHAR, unique)
- slug (VARCHAR, unique)
- created_at

### user_interests (junction table)
- id (Serial, PK)
- user_id (UUID, FK → users)
- interest_id (INT, FK → interests)
- created_at
- UNIQUE(user_id, interest_id)

### courses
- id (UUID, PK)
- title (TEXT)
- provider_name (VARCHAR)
- provider_slug (VARCHAR)
- url (TEXT)
- price (Decimal, nullable)
- currency (VARCHAR)
- rating (Decimal)
- duration (VARCHAR)
- categories (JSONB)
- thumbnail_url (TEXT)
- description (TEXT)
- source_hash (VARCHAR, unique)
- scraped_at, updated_at

### user_saved_courses (junction table)
- id (Serial, PK)
- user_id (UUID, FK → users)
- course_id (UUID, FK → courses)
- added_at
- UNIQUE(user_id, course_id)

### refresh_tokens
- id (UUID, PK)
- token (TEXT, unique)
- user_id (UUID, FK → users)
- expires_at (TIMESTAMP)
- created_at

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Security**: helmet, cors, bcrypt
- **Dev Tools**: nodemon, ts-node

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Forms**: Formik + Yup
- **HTTP Client**: Axios
- **UI Components**: Headless UI
- **Icons**: Heroicons

### Crawler
- **Language**: Python 3.10+
- **HTTP**: requests
- **Parsing**: BeautifulSoup4
- **Database**: psycopg2
- **Config**: python-dotenv

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL 15 (Alpine)

## Environment Variables

### Backend (.env)
```
NODE_ENV=development|production
PORT=4000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000
```

### Crawler (.env)
```
DATABASE_URL=postgresql://user:pass@host:port/db
USER_AGENT=EduWealth Course Crawler Bot
REQUEST_DELAY=2
```

## Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- Docker
- Thunder Client (API testing)
- GitLens

## Next Steps for Enhancement

1. **Frontend**:
   - Onboarding flow (interests + budget setup)
   - Profile page (edit interests, budget, saved courses)
   - Course detail modal
   - Filters and search
   - Pagination
   - Dark mode

2. **Backend**:
   - Admin routes for crawler management
   - Course analytics
   - User activity tracking
   - Email notifications
   - Password reset flow
   - OAuth integration (Google, GitHub)

3. **Crawler**:
   - Real HTML parsing for Udemy, Coursera, edX
   - Scheduled jobs with cron
   - Better error handling and retries
   - Proxy rotation
   - Headless browser for JS-rendered pages

4. **Testing**:
   - Jest unit tests for backend
   - React Testing Library for frontend
   - E2E tests with Playwright
   - API integration tests

5. **DevOps**:
   - CI/CD pipeline (GitHub Actions)
   - Production docker-compose
   - Environment-specific configs
   - Monitoring and logging
   - Database backups

6. **Performance**:
   - Redis caching
   - Database query optimization
   - Image CDN
   - Code splitting
   - Lazy loading

---

This structure provides a solid foundation for building and scaling the EduWealth platform!
