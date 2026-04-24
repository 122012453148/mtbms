# Smart Material Tracking & Business Management System (SMTBMS)

A comprehensive MERN stack enterprise solution for integrated business management.

## Features

- **Material Tracking:** Real-time inventory management with movement history.
- **HRMS:** Employee performance and attendance tracking.
- **ERP:** Procurement system with vendor and purchase order management.
- **CRM:** Sales pipeline and lead status tracking.
- **Authentication:** Role-based access control (Admin, HR, Manager, Sales, Employee).
- **Dashboard:** Rich analytics and statistical visualizations.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Recharts, Framer Motion, Lucide-react.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **Security:** JWT Authentication, Bcrypt password hashing.

## Setup Instructions

### 1. Backend Setup
```bash
cd server
npm install
# Create a .env file with your specific MONGODB_URI and JWT_SECRET
node seed.js  # To populate initial data
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Admin Credentials (if seeded)
- **Email:** admin@smtbm.com
- **Password:** password123

## Project Structure

```
/server
  /models       - Mongoose schemas
  /controllers  - Business logic
  /routes       - Express API endpoints
  /middleware   - Auth & Error handlers
  server.js     - Entry point

/client
  /src/components - Reusable UI elements
  /src/pages      - Main feature pages
  /src/context    - Auth state management
  /src/services   - API axios configuration
  /src/layouts    - Sidebar & Navbar layout
```
