# Vercel Deployment Guide

This guide will walk you through deploying the Nuvem Flow Dashboard to Vercel.

## 📋 Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your project pushed to GitHub
3. Your environment variables ready
4. Firebase service account JSON file

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Firebase Service Account Key

Since Vercel doesn't support file uploads directly, you'll need to convert your Firebase service account JSON to an environment variable.

1. Download your Firebase service account key from [Firebase Console](https://console.firebase.google.com/)
2. Copy the **entire contents** of the JSON file
3. Keep it ready for Step 3

### Step 2: Connect Your Repository to Vercel

1. Go to https://vercel.com and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will detect the configuration automatically

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables** and add:

#### Required Variables:

```bash
# Nuvemshop API Configuration
STORE_ID=your_store_id_here
NUVEMSHOP_TOKEN=your_nuvemshop_token_here

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...",...}
```

**Important**: For `FIREBASE_SERVICE_ACCOUNT_KEY`, you need to paste the **entire JSON object as a single line string**.

#### Optional Variables:

```bash
NODE_ENV=production
PORT=4000
CACHE_DURATION=15
```

### Step 4: Configure Build Settings

Vercel should auto-detect the frontend, but verify:

**Build Command:**
```bash
cd frontend && npm install && npm run build
```

**Output Directory:**
```bash
frontend/dist
```

**Install Command:**
```bash
npm install
```

### Step 5: Deploy

1. Click **"Deploy"** button
2. Wait for the deployment to complete
3. Vercel will provide you with a URL (e.g., `https://your-app.vercel.app`)

## 🔧 Post-Deployment Configuration

### Environment-Specific Settings

After deployment, you may need to update the following:

1. **Frontend API Configuration**: The frontend should automatically use the deployed API at the same domain
2. **CORS Settings**: These should already be configured in the backend

## ⚠️ Important Notes

### Cron Jobs
The automatic order refresh scheduler that runs every 15 minutes **will NOT work on Vercel's free tier** because:
- Serverless functions are stateless
- They only execute when an API request is made
- There's no persistent server to run background tasks

**Solutions:**
1. **Use Vercel Cron Jobs** (Pro plan required):
   - Add a `vercel.json` cron configuration
   - Or use a service like EasyCron or Cron-job.org to ping your API endpoint

2. **Manual Refresh**:
   - Your API already has a `/api/refresh` endpoint
   - You can call this manually or set up an external cron service

3. **External Cron Service** (Free):
   - Use https://cron-job.org or similar
   - Set it to call: `https://your-app.vercel.app/api/refresh` every 15 minutes

### Firebase Service Account

The Firebase service account key is now loaded from the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable, which supports Vercel's architecture.

## 🔍 Troubleshooting

### Issue: "Module not found"

**Solution:** Ensure all dependencies are listed in `package.json` files.

### Issue: "Firebase not working"

**Solution:** 
1. Check that `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
2. Make sure the entire JSON is on a single line
3. Verify the JSON is valid

### Issue: "API not responding"

**Solution:**
1. Check the function logs in Vercel dashboard
2. Verify environment variables are set
3. Check that API routes are returning `module.exports = app`

### Issue: "CORS errors"

**Solution:** 
- CORS is already configured in `backend/server.js`
- If issues persist, check the `cors` middleware is loaded before routes

## 📊 Monitoring

### View Logs
1. Go to your Vercel project dashboard
2. Click on **"Functions"** tab
3. Click on any deployment
4. View the logs for debugging

### Health Check
Visit `https://your-app.vercel.app/api/status` to check API health

## 🎯 Production Checklist

- [ ] All environment variables configured
- [ ] Firebase service account key added as environment variable
- [ ] Frontend builds successfully
- [ ] API endpoints responding correctly
- [ ] Test login with demo credentials
- [ ] Test order fetching
- [ ] Test note saving
- [ ] Set up external cron for order refresh (if needed)
- [ ] Custom domain configured (optional)

## 🔄 Alternative: Deploy Backend Separately

If you encounter issues with the combined deployment, consider:

1. **Deploy Frontend to Vercel** (free)
2. **Deploy Backend to Railway/Render** (free tiers available)
3. Update frontend API URL to point to separate backend

### Deploying Backend to Railway (Example)

```bash
# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "cd backend && npm start"
```

Then set environment variables in Railway dashboard.

## 📝 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/concepts/functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🆘 Support

If you encounter issues:
1. Check Vercel function logs
2. Test API endpoints using curl or Postman
3. Verify all environment variables are set correctly
4. Ensure Firebase service account key is properly formatted

## 💡 Tips

1. **Use Vercel CLI for local testing**: `npm i -g vercel && vercel dev`
2. **Enable preview deployments** to test before production
3. **Monitor function execution time** to optimize cold starts
4. **Use Vercel Analytics** to monitor performance

