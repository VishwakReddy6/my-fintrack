# Quick Start Guide

Get My Fintrack up and running in minutes!

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)

## Setup Steps

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Convex Backend

Run this command and follow the prompts:

\`\`\`bash
npx convex dev
\`\`\`

This will:
- Create a Convex account (if you don't have one)
- Set up a new project
- Generate your \`.env.local\` file with the deployment URL
- Push the database schema
- Start watching for changes

**Keep this terminal running!**

### 3. Start the Next.js Dev Server

In a **new terminal window**:

\`\`\`bash
npm run dev
\`\`\`

### 4. Open the App

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## First-Time User Flow

1. **Sign Up**: Click "Sign Up" and create an account with your email and password
2. **Seed Categories**: On the dashboard, click "Seed Categories" to add default expense/income categories
3. **Add Your First Account**: Click "Add Account" and set up your first bank account or credit card
4. **Add a Transaction**: Click "Add Transaction" to record your first expense or income
5. **Explore**: Check out the Transactions, Budgets, Recurring, and Reports pages!

## Development Workflow

### Making Backend Changes

Edit files in the `convex/` directory. Convex will automatically:
- Type-check your functions
- Push schema changes
- Hot-reload functions

### Making Frontend Changes

Edit files in `app/` or `components/`. Next.js will:
- Hot-reload your changes instantly
- Show errors in the browser

## Common Commands

\`\`\`bash
# Development
npm run dev                    # Start Next.js dev server
npx convex dev                 # Start Convex (keep running in separate terminal)

# Build for production
npm run build                  # Build Next.js app
npx convex deploy --prod       # Deploy Convex to production

# Linting
npm run lint                   # Run ESLint
\`\`\`

## Project Structure Overview

\`\`\`
My Fintrack/
├── app/                    # Next.js pages and layouts
│   ├── (auth)/            # Login & signup pages
│   └── (app)/             # Protected app pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── finance/          # Custom finance components
├── convex/               # Backend (database + functions)
│   ├── schema.ts         # Database schema
│   ├── accounts.ts       # Account operations
│   ├── transactions.ts   # Transaction operations
│   ├── budgets.ts        # Budget operations
│   └── ...               # More backend files
└── lib/                  # Utilities and helpers
\`\`\`

## Key Features to Try

### 1. Accounts
- Add different account types (Savings, Current, Credit Card, Cash)
- Mark accounts as Personal or Business
- See real-time balance updates

### 2. Transactions
- Record income and expenses
- Categorize each transaction
- Add notes and tags
- Filter by date, category, or account

### 3. Budgets
- Set monthly spending limits per category
- See visual progress bars
- Get warnings when approaching limits
- Copy last month's budgets forward

### 4. Recurring Transactions
- Set up monthly subscriptions (Netflix, Spotify, etc.)
- Automate regular bills
- System creates transactions automatically via cron job

### 5. Reports & Analytics
- View cash flow trends over time
- See spending breakdown by category
- Compare personal vs business finances
- Interactive charts and visualizations

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
\`\`\`bash
# Kill the process using port 3000
npx kill-port 3000

# Or run Next.js on a different port
npm run dev -- -p 3001
\`\`\`

### Convex Connection Issues

If you see "Cannot connect to Convex":
1. Make sure \`npx convex dev\` is running
2. Check that \`.env.local\` has \`NEXT_PUBLIC_CONVEX_URL\`
3. Restart both servers

### Missing Categories

If no categories appear:
1. Click "Seed Categories" button on the dashboard
2. Wait a few seconds
3. Refresh the page

### Build Errors

If you get TypeScript or build errors:
\`\`\`bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
\`\`\`

## Next Steps

Once you're comfortable with the basics:

1. **Customize Categories**: Add your own custom categories in the dashboard
2. **Set Budgets**: Set realistic monthly budgets for your spending
3. **Add Recurring Items**: Set up all your subscriptions and regular bills
4. **Check Reports**: Review your spending patterns in the Reports page
5. **Deploy**: Follow `DEPLOYMENT.md` to deploy your app to production

## Need Help?

- **Documentation**: Check `README.md` for detailed info
- **Deployment**: See `DEPLOYMENT.md` for production deployment
- **Convex Docs**: https://docs.convex.dev
- **Next.js Docs**: https://nextjs.org/docs

---

Happy tracking! 💰📊

