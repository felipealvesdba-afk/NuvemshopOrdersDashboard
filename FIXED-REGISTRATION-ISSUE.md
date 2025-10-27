# Fixed Registration Issue

## Problem
When trying to register a new user on Vercel, you were getting the error:
```
"Unexpected token 'A', "A server e"... is not valid JSON"
```

This happened because the backend was trying to load `serviceAccountKey.json` from the filesystem, which doesn't exist in Vercel's serverless environment.

## What I Fixed

### 1. Updated `backend/services/userService.js`
- Now supports both environment variables (for Vercel) and file-based credentials (for local development)
- Automatically detects if `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable is set
- Gracefully falls back if Firebase is not available

### 2. Enhanced Error Handling in `backend/server.js`
- Added middleware to ensure all responses are JSON
- Improved global error handler to always return JSON
- Better error logging for debugging

### 3. Updated Registration Error Handling
- More detailed error logging
- Better error messages in development mode

## How to Deploy the Fix

### 1. Commit the Changes
```bash
git add .
git commit -m "Fix registration: support Firebase env variables and improve error handling"
git push
```

### 2. Vercel will Auto-Deploy
- Vercel will automatically detect the push and redeploy
- Wait for deployment to complete (2-3 minutes)

### 3. Verify the Fix
- Try registering a new user
- It should work now!

## Environment Variables Check

Make sure these are set in Vercel:

✅ **Required:**
- `STORE_ID` - Your Nuvemshop store ID
- `NUVEMSHOP_TOKEN` - Your Nuvemshop API token
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Your Firebase JSON (as a string)

## How It Works Now

### Firebase Credentials
The app now supports **two methods** for Firebase credentials:

1. **Vercel/Production**: Read from `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable
2. **Local Development**: Read from `backend/serviceAccountKey.json` file

### Fallback Mode
If Firebase is not available, the app will:
- Continue to work without Firebase
- Store user data in memory (temporary)
- Show warnings in logs
- Users can still register and login

### Error Response
All API responses are now **guaranteed** to be JSON, even if there's an error.

## Testing

After redeploying, test:

1. **Registration**: Create a new account
2. **Login**: Login with the new account
3. **Orders**: Fetch orders
4. **Notes**: Save/update notes

All should work now!

## Troubleshooting

If you still see errors:

1. **Check Vercel Logs**: Go to your project → Functions → Click on a function → View logs
2. **Check Environment Variables**: Ensure all 3 variables are set
3. **Test API**: Visit `https://your-app.vercel.app/api/status`

## Firebase Setup

To get the Firebase service account key as an environment variable:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Copy the **entire contents** of the JSON
7. In Vercel, create environment variable `FIREBASE_SERVICE_ACCOUNT_KEY`
8. Paste the entire JSON as the value (it should be one long string)

**Example format** (abbreviated):
```
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

Make sure it's all on **one line** when pasting it into Vercel's environment variable field.

