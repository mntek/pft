# Personal Financial Tracker

A mobile-first personal financial tracker web application with dark mode, supporting credit card management, asset tracking, and financial visualization.

## Overview

Personal Financial Tracker is a comprehensive tool designed to help users manage their financial lives. The application allows users to track credit cards, assets, income, and expenses in one place, with visual representations of their financial health.

## Features

- **User Authentication**: Secure email/password login with password reset functionality
- **Dashboard**: Visual overview of financial health with charts and key metrics
- **Credit Card Management**: Track credit cards, their balances, limits, and due dates
- **Asset Tracking**: Monitor different types of assets and their values
- **Income Tracking**: Record and categorize various income sources
- **Expense Management**: Track and categorize expenses
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Dark Mode**: Eye-friendly dark theme support

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd personal-financial-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/financialtracker
   SESSION_SECRET=your_session_secret
   SENDGRID_API_KEY=your_sendgrid_api_key (optional for password reset emails)
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and configurations
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main application component
├── server/             # Backend Express application
│   ├── auth.ts         # Authentication configuration
│   ├── db.ts           # Database connection
│   ├── routes.ts       # API routes
│   └── storage.ts      # Database interaction layer
└── shared/             # Shared code between client and server
    └── schema.ts       # Database schema definitions
```

## Technologies Used

### Frontend
- React.js with TypeScript
- TanStack Query for data fetching
- Tailwind CSS with shadcn/ui components
- React Hook Form for form handling
- Recharts for data visualization

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- SendGrid for email notifications (optional)

## Limitations and Future Enhancements

See [SPECIFICATIONS.md](./SPECIFICATIONS.md) for details on current limitations and planned future enhancements.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.