# Deployment Guide

This guide will help you deploy My Fintrack to production using Vercel (frontend) and Convex (backend).

## Prerequisites

1. A GitHub account
2. A Vercel account (free tier is fine)
3. A Convex account (free tier is fine)
4. Git installed locally

## Step 1: Push to GitHub

If you haven't already:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
\`\`\`

## Step 2: Deploy Backend to Convex

1. Make sure you have the Convex CLI installed:
\`\`\`bash
npm install -g convex
\`\`\`

2. If you've been using \`npx convex dev\` during development, you already have a deployment. Otherwise, initialize Convex:
\`\`\`bash
npx convex dev
\`\`\`

3. Deploy to production:
\`\`\`bash
npx convex deploy --prod
\`\`\`

4. This will give you a production deployment URL. Note this down - you'll need it for Vercel.

5. The output will include:
   - Production deployment URL (e.g., \`https://your-app.convex.cloud\`)
   - Deployment name (e.g., \`your-deployment-123\`)

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in

2. Click "Add New Project"

3. Import your GitHub repository

4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: ./
   - **Build Command**: \`npm run build\` (default)
   - **Output Directory**: \`.next\` (default)

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     - \`NEXT_PUBLIC_CONVEX_URL\` = Your Convex production URL
     - \`CONVEX_DEPLOYMENT\` = Your Convex deployment name

6. Click "Deploy"

7. Wait for the deployment to complete (usually 2-3 minutes)

8. Your app will be live at \`https://your-app.vercel.app\`

## Step 4: Configure Custom Domain (Optional)

### In Vercel:

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS instructions provided by Vercel

### In Convex (if using custom domain):

1. Update your Convex Auth settings to whitelist your custom domain
2. Add the domain in your Convex dashboard under Settings

## Step 5: Post-Deployment Checks

1. **Test Authentication**:
   - Try signing up with a new account
   - Verify email/password login works

2. **Test Core Features**:
   - Add an account
   - Seed categories
   - Create a transaction
   - Set a budget
   - Add a recurring transaction

3. **Check Cron Jobs**:
   - In Convex dashboard, verify the cron job is scheduled
   - Check logs to ensure it's running daily

4. **Test on Mobile**:
   - Open your deployed app on a mobile device
   - Verify responsive design works correctly

## Environment Variables Reference

Make sure these are set in Vercel:

\`\`\`
NEXT_PUBLIC_CONVEX_URL=https://your-production-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-name
\`\`\`

## Continuous Deployment

Once set up, any push to your \`main\` branch will:
1. Automatically deploy to Vercel (frontend)
2. You'll need to run \`npx convex deploy --prod\` manually for backend changes

### Optional: Auto-deploy Convex

You can set up GitHub Actions to auto-deploy Convex:

Create \`.github/workflows/convex-deploy.yml\`:

\`\`\`yaml
name: Deploy Convex
on:
  push:
    branches: [main]
    paths:
      - 'convex/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: \${{ secrets.CONVEX_DEPLOY_KEY }}
\`\`\`

Get your CONVEX_DEPLOY_KEY from the Convex dashboard and add it as a GitHub secret.

## Monitoring & Maintenance

### Convex Dashboard

- Monitor function calls and errors
- Check cron job execution logs
- View database usage
- Monitor authentication metrics

### Vercel Dashboard

- Check deployment logs
- Monitor bandwidth and function execution
- View analytics
- Check error logs

### Regular Maintenance

1. **Weekly**: Check error logs in both platforms
2. **Monthly**: Review database growth and clean up old data if needed
3. **Quarterly**: Review and update dependencies
4. **As needed**: Add new features and improvements

## Troubleshooting

### Common Issues

**Problem**: \`NEXT_PUBLIC_CONVEX_URL is undefined\`
**Solution**: Make sure the environment variable is set in Vercel and redeploy

**Problem**: Authentication not working in production
**Solution**: Check that your production URL is whitelisted in Convex Auth settings

**Problem**: Cron jobs not running
**Solution**: Verify in Convex dashboard that crons are enabled for production deployment

**Problem**: Charts not loading
**Solution**: Check browser console for errors; ensure Recharts is properly installed

## Scaling Considerations

As your app grows:

1. **Database**: Convex scales automatically, but consider:
   - Archiving old transactions (> 2 years)
   - Implementing data pagination for large transaction lists

2. **Functions**: Consider adding caching for frequently-accessed data

3. **Frontend**: 
   - Implement route-based code splitting
   - Add image optimization if you add file uploads later

## Security Best Practices

1. **Keep dependencies updated**: Run \`npm audit\` regularly
2. **Environment variables**: Never commit \`.env.local\` to git
3. **API keys**: Rotate Convex deploy keys periodically
4. **User data**: All user data is already isolated by userId in queries
5. **HTTPS**: Enabled by default on Vercel and Convex

## Cost Estimation

### Free Tiers

- **Vercel**: 
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Usually sufficient for personal use

- **Convex**:
  - 1M function calls/month
  - 1 GB database storage
  - Good for up to ~1000 active users

### When to Upgrade

Consider upgrading when:
- You exceed free tier limits
- You need custom domains without Vercel branding
- You need priority support
- Your app becomes business-critical

## Backup Strategy

Convex handles backups automatically, but you can also:

1. **Export data periodically**: Create a Convex function to export all your data
2. **Version control**: Your schema and functions are backed up in Git
3. **Snapshots**: Convex Pro plan includes point-in-time recovery

## Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

Need help? Open an issue on GitHub or consult the documentation links above.

