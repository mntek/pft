# Personal Financial Tracker - Specifications

This document outlines the current features, limitations, and planned future enhancements for the Personal Financial Tracker application.

## Current Features

### Authentication and User Management
- Email and password-based authentication
- User registration and login
- Password reset functionality with email verification
- User profile management

### Financial Management
- Dashboard with financial overview
- Credit card management (adding, editing, deleting)
- Asset tracking (adding, editing, deleting)
- Income tracking (adding, editing, deleting)
- Expense tracking (adding, editing, deleting)

### User Interface
- Mobile-first responsive design
- Dark mode support
- Interactive charts and visualizations
- Form validation and error handling

## Current Limitations and Future Enhancements

### 1. Notifications
- **Current State**: No notification system is integrated yet.
- **Limitations**: No alerts for upcoming credit card due dates or missed minimum payments.
- **Future Enhancement**: Implementation of push notifications or email reminders.

### 2. Multi-Currency Support
- **Current State**: System allows manual entry of asset values in different currencies (TRY, USD, EUR, etc.)
- **Limitations**: Automatic currency conversion to a single base currency (e.g., TRY) is not implemented yet.
- **Future Enhancement**: Real-time currency rate integration (e.g., using an open API).

### 3. Advanced Reporting and Filtering
- **Current State**: Dashboard provides basic summaries and charts.
- **Limitations**: Detailed reports with custom filters (e.g., by bank, by asset type, by period) are not available yet.
- **Future Enhancement**: Advanced filterable reports.

### 4. Security Features
- **Current State**: Only basic email/password authentication is implemented.
- **Limitations**: No two-factor authentication (2FA) or enhanced login security measures.
- **Future Enhancement**: Optional 2FA, session management enhancements.

### 5. Real-time Data Updates
- **Current State**: Data is saved and loaded upon user action (e.g., form submit).
- **Limitations**: No real-time updates (e.g., Firestore `onSnapshot` listeners) are implemented for dynamic live data changes.
- **Future Enhancement**: Real-time syncing across multiple devices.

### 6. Multi-Language Support
- **Current State**: The interface is currently only available in English.
- **Limitations**: No dynamic language switching or localization support.
- **Future Enhancement**: Turkish and other language options.

## Technical Stack

### Frontend
- React.js with TypeScript
- TanStack Query for data fetching
- React Hook Form for form handling
- Recharts for data visualization
- Tailwind CSS with shadcn/ui components

### Backend
- Node.js with Express
- PostgreSQL database with Drizzle ORM
- Passport.js for authentication
- SendGrid for email notifications (password reset)

### Deployment
- Hosted on Replit

## Database Schema
The application uses a relational database with the following main entities:
- Users
- Credit Cards
- Assets
- Incomes
- Expenses
- Password Reset Tokens

Each entity includes proper relationships and constraints to ensure data integrity.