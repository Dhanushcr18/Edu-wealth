# Quick Database Setup Guide

## Get Your Database Running in 2 Minutes! 🚀

### Step 1: Create Free Database (No Credit Card Required)

1. Go to: **https://neon.tech/**
2. Click **"Sign Up"** (use your GitHub or Google account)
3. Click **"Create a project"**
4. Name it: **eduwealth**
5. Select region: **US East (or closest to you)**
6. Click **"Create Project"**

### Step 2: Copy Connection String

After creating the project, you'll see a connection string like:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

### Step 3: Update Your Backend

1. Open: `backend\.env`
2. Replace the DATABASE_URL line with your connection string:
   ```
   DATABASE_URL="postgresql://your-username:your-password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Save the file

### Step 4: Setup Database Tables

Open a NEW PowerShell terminal and run:

```powershell
cd c:\Eduwealth\backend
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 5: Restart Backend

1. Go to the terminal running your backend (shows "Server running on port 4000")
2. Press `Ctrl+C` to stop it
3. Run: `npm run dev`

### Done! 🎉

Now try signing up again - it should work!

---

## Alternative: Supabase (Also Free)

1. Go to: **https://supabase.com/**
2. Sign up and create a new project
3. Go to **Settings → Database**
4. Copy the **Connection String** (URI format)
5. Follow Steps 3-5 above

---

**Need help?** The error happens because there's no database. Once you complete these steps, everything will work!
