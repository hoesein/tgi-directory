# Directory App - Requirements & Architecture

## Overview
A full-stack Directory Application with React Native (mobile) frontend and Node.js backend.

---

## Tech Stack

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** express-validator
- **Environment:** dotenv
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React Native (Expo managed workflow)
- **Language:** JavaScript
- **Navigation:** React Navigation v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **UI Components:** React Native Paper
- **Storage:** AsyncStorage

---

## Architecture

### Backend Architecture (MVC Pattern)
```
backend/
├── src/
│   ├── config/         # Database, env config
│   ├── controllers/    # Route handlers
│   ├── middleware/      # Auth, error handling
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   └── utils/          # Helper functions
├── tests/              # API tests
├── .env.example        # Environment variables template
├── package.json
└── server.js           # Entry point
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── assets/         # Images, fonts
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom hooks
│   ├── navigation/     # React Navigation setup
│   ├── screens/        # Screen components
│   ├── services/       # API service layer
│   └── utils/          # Helper functions
├── __tests__/          # Component tests
├── App.js              # Root component
└── package.json
```

---

## API Endpoints (Planned)

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Directory Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

---

## Project Structure (Root)
```
Directory/
├── backend/            # Node.js/Express API
├── frontend/           # React Native app
├── .gitignore
├── REQUIREMENTS.md     # This file
└── README.md
```

---

## Development Rules
1. Follow MVC pattern for backend
2. Use functional components with hooks in React Native
3. Implement proper error handling on both ends
4. Write tests for critical paths
5. Use environment variables for sensitive data
6. Follow RESTful API design principles
