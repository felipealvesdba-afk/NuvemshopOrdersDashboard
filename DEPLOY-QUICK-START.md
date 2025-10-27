# Quick Start: Deploy to Vercel

## ⚡ Quick Deploy (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect the configuration

### 3. Add Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

```bash
STORE_ID=your_nuvemshop_store_id
NUVEMSHOP_TOKEN=your_nuvemshop_token
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
```

**For Firebase key**: Copy entire JSON content and paste as one string.

### 4. Deploy
Click "Deploy" and wait ~2 minutes.

**Done!** 🎉 Your app will be live at `https://your-app.vercel.app`

## 📝 Detailed Instructions

See [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md) for complete guide.

## 🔧 Post-Deployment: Set Up Auto-Refresh

Since Vercel serverless can't run continuous background tasks, set up external cron:

### Option 1: Cron-Job.org (Free)
1. Sign up at https://cron-job.org
2. Create job:
   - **URL**: `https://your-app.vercel.app/api/refresh`
   - **Schedule**: Every 15 minutes
   - **Method**: POST

### Option 2: EasyCron
Similar setup at https://www.easycron.com

## ⚙️ Environment Variables Checklist

- [ ] `STORE_ID` - Your Nuvemshop store ID
- [ ] `NUVEMSHOP_TOKEN` - Your Nuvemshop API token
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` - Full Firebase JSON as string
- [ ] (Optional) `NODE_ENV=production`
- [ ] (Optional) `PORT=4000`

## 🎯 Testing Your Deployment

After deployment, test these URLs:

- Frontend: `https://your-app.vercel.app`
- Health Check: `https://your-app.vercel.app/api/status`
- API Status: `https://your-app.vercel.app/health`

Login with demo credentials:
- Email: `demo@nuvemshop.com`
- Password: `demo123`

## 🐛 Troubleshooting

**Build fails?**
- Check Vercel logs for errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version (needs 18+)

**API not working?**
- Check environment variables are set
- View function logs in Vercel dashboard
- Test with `/api/status` endpoint

**Firebase errors?**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is valid JSON (one line)
- Check Firebase project settings
- Ensure Firestore is enabled

## 📚 Need Help?

See detailed guide: [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md)

