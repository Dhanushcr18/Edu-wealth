# Database Setup Instructions

The "Failed to create account" error occurs because the PostgreSQL database is not running.

## Option 1: Install Docker Desktop (Recommended)

1. **Download Docker Desktop for Windows**:
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download and install Docker Desktop

2. **Start Docker Desktop** and wait for it to fully start

3. **Start the database**:
   ```powershell
   cd c:\Eduwealth
   docker-compose up -d
   ```

4. **Run database migrations**:
   ```powershell
   cd backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Restart the backend** (Ctrl+C in the backend terminal, then run `npm run dev` again)

## Option 2: Install PostgreSQL Locally

1. **Download PostgreSQL**:
   - Visit: https://www.postgresql.org/download/windows/
   - Download and install PostgreSQL 15 or later
   - During installation, set password as `edupass` (or update `.env` file)

2. **Create the database**:
   ```powershell
   # Open PostgreSQL command prompt or use pgAdmin
   createdb -U postgres eduwealth
   ```

3. **Update the backend `.env` file**:
   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/eduwealth"
   ```

4. **Run migrations**:
   ```powershell
   cd c:\Eduwealth\backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Restart the backend**

## Option 3: Use a Cloud Database (Quick Test)

1. **Create a free PostgreSQL database** at:
   - Supabase: https://supabase.com/
   - Neon: https://neon.tech/
   - ElephantSQL: https://www.elephantsql.com/

2. **Copy the connection string** from your cloud provider

3. **Update `backend/.env`**:
   ```
   DATABASE_URL="your_cloud_database_connection_string"
   ```

4. **Run migrations**:
   ```powershell
   cd c:\Eduwealth\backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Restart the backend**

---

After completing any of these options, the signup should work! 🎉
