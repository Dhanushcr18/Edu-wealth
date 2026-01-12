# 🚀 Quick Start - Django Backend

## For Existing Users (Migrating from TypeScript)

Your backend has been converted from TypeScript to Django (Python). **All functionality remains the same!**

### Step 1: Set up Python environment

```powershell
# Create virtual environment (one-time setup)
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1
```

### Step 2: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run migrations

Your existing MySQL database will work as-is!

```bash
python manage.py migrate
```

### Step 4: Start the server

```bash
python manage.py runserver 4000
```

**Or use the automated script:**

```powershell
.\start_django.ps1
```

## What Changed?

- ✅ **Language**: TypeScript → Python
- ✅ **Framework**: Express → Django
- ✅ **ORM**: Prisma → Django ORM
- ✅ **Same API**: All endpoints work exactly the same
- ✅ **Same Database**: Uses your existing MySQL database
- ✅ **Same .env**: Updated with Django-specific variables

## Your Frontend Doesn't Need Changes!

The API endpoints and responses are identical:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/courses`
- `POST /api/expenses`
- etc.

## Bonus: Admin Panel

Django includes a built-in admin interface!

1. Create an admin user:
   ```bash
   python manage.py createsuperuser
   ```

2. Access it at: http://localhost:4000/admin

## Troubleshooting

### "django not found"
```bash
pip install -r requirements.txt
```

### "virtual environment not activated"
```powershell
.\venv\Scripts\Activate.ps1
```

### "database connection error"
Check your `.env` file - make sure `DB_PASSWORD=2025@Dhanu` is correct

### "port already in use"
The old TypeScript server might still be running. Stop it first.

## Files You Can Delete (Optional)

The old TypeScript files are no longer needed:
- `src/` folder
- `node_modules/` folder
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `nodemon.json`

**But keep them if you want to reference the old code!**

## Need Help?

- See `MIGRATION_GUIDE.md` for detailed migration info
- See `README_DJANGO.md` for full Django documentation
- Check Django docs: https://docs.djangoproject.com/

---

**🎉 Your backend is now running on Django! Everything works the same, just faster and more Pythonic!**
