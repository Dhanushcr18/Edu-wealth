# EduWealth Backend - Django/Python

This is the Django backend for the EduWealth platform, migrated from TypeScript/Node.js.

## Features

- ✅ User authentication (signup, login, JWT tokens)
- ✅ Google OAuth integration
- ✅ User profile management
- ✅ Interest selection and tracking
- ✅ Course recommendations
- ✅ Expense tracking with smart analysis
- ✅ Course suggestions for non-essential expenses

## Technology Stack

- **Framework**: Django 4.2 + Django REST Framework
- **Database**: MySQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **OAuth**: Google OAuth 2.0

## Setup

### 1. Create a virtual environment

```bash
python -m venv venv
```

### 2. Activate virtual environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 5. Run migrations

```bash
python manage.py migrate
```

### 6. Create a superuser (optional)

```bash
python manage.py createsuperuser
```

### 7. Run the development server

```bash
python manage.py runserver 4000
```

The API will be available at `http://localhost:4000/api`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/google` - Google OAuth authentication

### User
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile
- `PUT /api/me/budget` - Update user budget

### Interests
- `GET /api/interests` - Get all available interests (public)
- `GET /api/interests/me` - Get user's interests
- `POST /api/interests/me` - Save user's interests

### Courses
- `GET /api/courses` - Get course recommendations
- `POST /api/courses/save` - Save a course
- `GET /api/courses/saved` - Get saved courses
- `DELETE /api/courses/save/:courseId` - Remove saved course

### Expenses
- `POST /api/expenses` - Add expense with smart analysis
- `GET /api/expenses` - Get user's expenses
- `GET /api/expenses/:id` - Get single expense
- `DELETE /api/expenses/:id` - Delete expense

## Database Schema

The Django ORM models are defined in `api/models.py` and include:
- User
- Interest
- UserInterest
- Course
- UserSavedCourse
- RefreshToken
- Expense

## Docker

Build and run using Docker:

```bash
docker build -t eduwealth-backend .
docker run -p 4000:4000 eduwealth-backend
```

## Admin Panel

Django includes a built-in admin panel. After creating a superuser, access it at:

```
http://localhost:4000/admin
```

## Migration from TypeScript

This backend has been fully migrated from TypeScript/Node.js to Python/Django while maintaining:
- ✅ All existing functionality
- ✅ Same API endpoints and response formats
- ✅ Same database schema (MySQL)
- ✅ Compatible with existing frontend
- ✅ Same authentication flow
- ✅ All business logic (expense analysis, course recommendations)
