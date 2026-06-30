# 💰 FinTrack — Personal Finance Tracker

A full-stack personal finance tracker with React dashboard, Node.js REST API, JWT auth, and MongoDB.

## Features

- **Dashboard** — Monthly overview, income vs expenses chart, recent transactions, budget status
- **Transactions** — Log income/expenses with categories, search & filter, pagination
- **Budget Management** — Set category budgets with configurable alert thresholds
- **Real-time Budget Alerts** — Get warned when adding a transaction that exceeds your budget threshold
- **Reports & Analytics** — Monthly trends (bar chart), daily spending (line chart), category breakdown (pie chart)
- **Export** — Download all transactions as CSV
- **JWT Authentication** — Secure register/login, persistent sessions
- **Multi-currency** — USD, EUR, GBP, JPY, PKR, INR, CAD, AUD

## Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Frontend  | React 18, React Router, Recharts, Axios |
| Backend   | Node.js, Express.js            |
| Database  | MongoDB + Mongoose             |
| Auth      | JWT (JSON Web Tokens)          |
| Styling   | Custom CSS Design System       |

## Project Structure

```
finance-tracker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   ├── budgetController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Expense.js
│   │   └── Budget.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── budgets.js
│   │   ├── categories.js
│   │   └── reports.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.js
    │   │   │   └── Register.js
    │   │   ├── dashboard/
    │   │   │   ├── Dashboard.js
    │   │   │   ├── Layout.js
    │   │   │   └── Settings.js
    │   │   ├── expenses/
    │   │   │   └── Expenses.js
    │   │   ├── budget/
    │   │   │   └── Budget.js
    │   │   └── reports/
    │   │       └── Reports.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── formatters.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/finance_tracker
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Run the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev     # development (nodemon)
# or
npm start       # production
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (paginated, filtered) |
| POST | `/api/expenses` | Create transaction |
| PUT | `/api/expenses/:id` | Update transaction |
| DELETE | `/api/expenses/:id` | Delete transaction |
| GET | `/api/expenses/summary` | Monthly summary |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | Get budgets with spent amounts |
| POST | `/api/budgets` | Create/update budget |
| DELETE | `/api/budgets/:id` | Delete budget |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/trends` | Monthly income/expense trends |
| GET | `/api/reports/categories` | Category breakdown |
| GET | `/api/reports/daily` | Daily spending for a month |
| GET | `/api/reports/export` | Export CSV |

## Expense Categories

Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Education, Travel, Personal Care, Investments, Income, Other

## Using MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string
3. Replace `MONGODB_URI` in `.env` with your Atlas connection string

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_tracker
```

## Production Build

```bash
cd frontend
npm run build
```

Serve the `build/` folder with a static server or configure Express to serve it.

## License

MIT
