# Course-Selling-Application

- A MERN stack-based web application for selling and purchasing online courses. This platform allows instructors to create and manage courses, while students can explore, purchase, and learn through a secure and user-friendly interface. The application also includes a payment gateway for handling transactions.


## Features

- User Authentication & Authorization (JWT-based)
- Instructor Dashboard – Create, update, and manage courses
- Student Dashboard – Browse, purchase, and track enrolled courses
- Payment Integration – Secure payment gateway (Stripe/Razorpay/PayPal)
- Admin Panel – Manage users, courses, and platform data
- Responsive UI – Modern design optimized for desktop & mobile
- RESTful APIs for seamless communication between frontend & backend

### Tech Stack

#### Frontend:
- React.js
- Redux / Context API (state management)
- TailwindCSS / Material UI

### Backend:
- Node.js
- Express.js

### Database:
- MongoDB with Mongoose ORM

### Other Tools:
- JWT Authentication
- Stripe / Razorpay / PayPal Integration


```text
Course-Selling-Application/
│── backend/                   # Backend (Node.js + Express)
│   │── src/                   # Source code
│   │   │── models/            # Mongoose schemas
│   │   │── routes/            # API routes
│   │   │── controllers/       # Business logic
│   │   │── middleware/        # Auth & other middlewares
│   │   │── config/            # DB & environment configuration
│   │   │── utils/             # Helper functions
│   │   └── server.js          # Entry point for Express app
│   │
│   │── package.json           # Backend dependencies
│   │── .env                   # Backend environment variables
│
│── frontend/                  # Frontend (React.js)
│   │── public/                # Static files
│   │── src/                   # React source code
│   │   │── components/        # Reusable UI components
│   │   │── pages/             # Page-level components
│   │   │── hooks/             # Custom React hooks
│   │   │── context/           # Context API / State management
│   │   │── services/          # API calls to backend
│   │   └── App.js             # Main React component
│   │
│   │── package.json           # Frontend dependencies
│   │── .env                   # Frontend environment variables
│
│── README.md                  # Project documentation
│── package.json               # Root package.json (optional, for scripts to run both FE & BE)
│── .gitignore                 # Git ignore file

```