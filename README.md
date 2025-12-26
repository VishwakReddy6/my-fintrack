# My Fintrack - Personal Finance Tracking

A modern, full-featured personal and business finance tracking web application built with Next.js and Convex.

## Features

- 📊 **Dashboard** - Get a quick overview of your financial health with KPIs and recent transactions
- 💰 **Multiple Accounts** - Track savings, current accounts, credit cards, and cash
- 📝 **Transaction Management** - Add, edit, and delete income and expense transactions
- 🎯 **Budgets** - Set monthly budgets by category and track spending
- 🔄 **Recurring Transactions** - Automate subscriptions and regular expenses
- 📈 **Analytics & Reports** - Visualize your finances with interactive charts
- 🏢 **Business & Personal** - Separate tracking for personal and business finances
- 💱 **INR Currency** - Optimized for Indian Rupees with proper formatting
- 📱 **Mobile-First Design** - Beautiful responsive UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Convex (Database + Auth + Serverless Functions)
- **Charts**: Recharts
- **Validation**: Zod
- **Authentication**: Convex Auth with email/password

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd "My Fintrack"
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up Convex:
\`\`\`bash
npx convex dev
\`\`\`

This will:
- Create a new Convex project (or link to existing)
- Generate your deployment URL
- Set up the database schema
- Start the development server

4. Copy the environment variables:

The \`.env.local\` file should be automatically created with your Convex deployment URL.

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### First-Time Setup

1. Sign up for a new account
2. Click "Seed Categories" to add default expense and income categories
3. Add your first account (bank account, credit card, etc.)
4. Start tracking your transactions!

## Project Structure

\`\`\`
My Fintrack/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, signup)
│   ├── (app)/               # Protected app pages
│   │   ├── dashboard/       # Main dashboard
│   │   ├── transactions/    # Transaction management
│   │   ├── budgets/         # Budget tracking
│   │   ├── recurring/       # Recurring transactions
│   │   └── reports/         # Analytics and charts
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── finance/             # Finance-specific components
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema
│   ├── auth.ts              # Authentication
│   ├── accounts.ts          # Account functions
│   ├── transactions.ts      # Transaction functions
│   ├── categories.ts        # Category functions
│   ├── budgets.ts           # Budget functions
│   ├── recurring.ts         # Recurring transaction functions
│   ├── analytics.ts         # Analytics queries
│   ├── crons.ts             # Scheduled jobs
│   └── recurringProcessor.ts # Process recurring transactions
├── lib/                     # Utility functions
│   ├── utils.ts             # General utilities
│   └── validations.ts       # Zod schemas
└── README.md               # This file
\`\`\`

## Key Features Explained

### Accounts
- Support for multiple account types: Savings, Current, Credit Card, Cash
- Track both personal and business accounts
- Real-time balance updates based on transactions

### Transactions
- Add one-time income or expense transactions
- Categorize transactions
- Add notes and tags for better organization
- Edit or delete existing transactions
- Filter by date, account, category, or scope

### Budgets
- Set monthly budgets for each expense category
- Visual progress bars showing budget usage
- Warnings when approaching or exceeding budgets
- Copy budgets from previous months
- Separate budgets for personal and business

### Recurring Transactions
- Set up subscriptions and regular payments
- Support for daily, weekly, monthly, or yearly frequencies
- Automatic transaction creation via cron jobs
- Pause or delete recurring transactions
- Optional end dates for time-limited subscriptions

### Reports & Analytics
- Cash flow trends over time
- Expense and income breakdowns by category
- Account balance distribution
- Personal vs business comparisons
- Interactive charts with Recharts

## Database Schema

The app uses Convex with the following main tables:

- **users** - User profiles and authentication
- **accounts** - Bank accounts, credit cards, cash
- **categories** - Expense and income categories
- **transactions** - Individual financial transactions
- **budgets** - Monthly budget allocations
- **recurringTransactions** - Templates for recurring payments

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js and configure build settings
4. Add environment variables from \`.env.local\`
5. Deploy!

### Backend (Convex)

Convex is automatically deployed when you run \`npx convex dev\` or \`npx convex deploy\`.

For production:
\`\`\`bash
npx convex deploy
\`\`\`

This will:
- Deploy your backend functions
- Set up the production database
- Enable the cron jobs
- Provide a production deployment URL

## Environment Variables

Required environment variables:

\`\`\`
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
CONVEX_DEPLOYMENT=<your-convex-deployment-name>
\`\`\`

These are automatically generated by Convex CLI.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Convex

