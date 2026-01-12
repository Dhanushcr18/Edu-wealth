# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for EduWealth.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "EduWealth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a workspace)
3. Click "Create"
4. Fill in the required information:
   - **App name**: EduWealth
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Add or Remove Scopes"
7. Add these scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
8. Click "Save and Continue"
9. Add test users (your email) if in testing mode
10. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Configure the client:
   - **Name**: EduWealth Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:4000`
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:4000/api/auth/google/callback`
5. Click "Create"
6. Copy the **Client ID** and **Client Secret** (you'll need these next)

## Step 5: Configure Environment Variables

Add the following to your `backend/.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here
```

**Important**: Replace the placeholder values with your actual credentials.

### Generate a Session Secret

You can generate a secure random session secret using:

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Update Frontend Configuration (if needed)

If your backend is running on a different URL in production, update the `VITE_API_URL` in your `frontend/.env` file:

```env
VITE_API_URL=http://localhost:4000/api
```

## Step 7: Restart Your Application

After configuring the environment variables:

1. Stop the backend server (if running)
2. Restart it with `npm run dev` or your start command
3. The frontend should automatically connect to the backend

## Testing Google OAuth

1. Navigate to the login page: `http://localhost:3000/login`
2. Click the "Continue with Google" button
3. You should be redirected to Google's sign-in page
4. Sign in with your Google account
5. After successful authentication, you'll be redirected back to the dashboard

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in your Google Cloud Console exactly matches: `http://localhost:4000/api/auth/google/callback`
- Check that there are no trailing slashes or extra characters

### Error: "Invalid client"
- Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly copied from Google Cloud Console
- Make sure there are no extra spaces or quotes around the values

### Error: "Session not found"
- Ensure `SESSION_SECRET` is set in your `.env` file
- Restart your backend server after adding the session secret

### Database Errors
- Ensure your PostgreSQL database is running
- The `googleId` field in the User model should allow null values
- Run migrations if needed: `npm run prisma:migrate`

## Production Setup

When deploying to production:

1. Update the OAuth consent screen to "Production" status
2. Add your production URLs to:
   - Authorized JavaScript origins
   - Authorized redirect URIs
3. Update environment variables:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```
4. Use strong, randomly generated secrets for `SESSION_SECRET`
5. Set `NODE_ENV=production`

## Security Notes

- **Never commit** your `.env` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your `SESSION_SECRET`
- Keep your `GOOGLE_CLIENT_SECRET` secure and private
- Consider implementing rate limiting on OAuth endpoints in production

## Additional Features

The implemented Google OAuth:
- Automatically creates a new user account if one doesn't exist
- Links Google account to existing email if user already registered
- Allows users to sign in without a password
- Stores user's name and email from Google profile
- Generates JWT tokens for session management

## Support

For issues or questions:
- Check the backend logs for detailed error messages
- Verify all environment variables are correctly set
- Ensure Google Cloud project is properly configured
- Review the Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
