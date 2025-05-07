# Taskflow Architecture

This document provides a detailed explanation of the architecture for the Taskflow application.

## High-Level Architecture

Taskflow follows a client-server architecture with a React frontend and an Express.js backend. The application uses a PostgreSQL database for data persistence.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│             │     │              │     │             │
│  React UI   │────▶│  Express.js  │────▶│ PostgreSQL  │
│  Frontend   │◀────│  Backend     │◀────│ Database    │
│             │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

## Frontend Architecture

The frontend is built with React and TypeScript, using a component-based architecture with hooks for state management.

### Key Technologies

- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Shadcn UI**: Component library built on Radix UI primitives
- **TanStack Query**: Data fetching and state management
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form handling with Zod validation

### Frontend Structure

```
client/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── calendar/     # Calendar-related components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── goals/        # Goal-related components
│   │   ├── layout/       # Layout components (header, sidebar)
│   │   ├── tasks/        # Task-related components
│   │   └── ui/           # Base UI components (shadcn)
│   ├── hooks/            # Custom React hooks
│   │   ├── use-auth.tsx  # Authentication hook
│   │   ├── use-calendar.tsx # Calendar data hook
│   │   ├── use-goals.tsx # Goals data hook
│   │   └── use-tasks.tsx # Tasks data hook
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global styles
│   └── main.tsx          # Application entry point
└── index.html            # HTML template
```

### State Management

The application uses TanStack Query (React Query) for server state management and React's Context API for global application state.

- **Auth Context**: Manages user authentication state
- **Theme Context**: Manages light/dark theme preferences
- **Goals Context**: Manages goals data and operations
- **Tasks Context**: Manages tasks data and operations
- **Calendar Context**: Manages calendar events and time blocks

### Routing

Routing is handled with the Wouter library. Key routes include:

- `/`: Dashboard page (protected)
- `/auth`: Authentication page
- `/goals`: Goals management page (protected)
- `/tasks`: Tasks management page (protected)
- `/calendar`: Calendar page (protected)

## Backend Architecture

The backend is built with Express.js and Node.js, providing a REST API for the frontend.

### Key Technologies

- **Express.js**: Web framework
- **Passport.js**: Authentication middleware
- **Drizzle ORM**: Database ORM
- **TypeScript**: Type-safe JavaScript

### Backend Structure

```
server/
├── auth.ts           # Authentication logic
├── index.ts          # Server entry point
├── routes.ts         # API routes
├── storage.ts        # Data access layer
└── vite.ts           # Vite integration
```

### API Endpoints

#### Authentication

- `POST /api/register`: Create a new user account
- `POST /api/login`: Authenticate a user
- `POST /api/logout`: Log out a user
- `GET /api/user`: Get the current user's data

#### Tasks

- `GET /api/tasks`: Get tasks for the current user
- `POST /api/tasks`: Create a new task
- `GET /api/tasks/:id`: Get a specific task
- `PATCH /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task

#### Goals

- `GET /api/goals`: Get goals for the current user
- `POST /api/goals`: Create a new goal
- `GET /api/goals/:id`: Get a specific goal
- `PATCH /api/goals/:id`: Update a goal
- `DELETE /api/goals/:id`: Delete a goal

#### Calendar

- `GET /api/timeblocks`: Get time blocks for the current user
- `POST /api/timeblocks`: Create a new time block
- `GET /api/timeblocks/:id`: Get a specific time block
- `PATCH /api/timeblocks/:id`: Update a time block
- `DELETE /api/timeblocks/:id`: Delete a time block

## Database Architecture

The application uses a PostgreSQL database with Drizzle ORM for data modeling and migrations.

### Storage Implementation

The application supports two storage implementations:

1. **MemStorage**: In-memory implementation for development
2. **DatabaseStorage**: PostgreSQL implementation for production

## Authentication Flow

1. User submits login credentials
2. Server validates credentials against stored hashed password
3. On successful validation, a session is created
4. Session ID is stored in a secure cookie
5. Subsequent requests include the cookie for authentication
6. Protected routes check for valid session

## Data Flow

1. User interactions trigger API calls via TanStack Query
2. API calls are made to the Express.js backend
3. Backend validates requests and interacts with the database
4. Data is returned to the frontend
5. TanStack Query caches data and updates the UI

## Security Considerations

- **Password Storage**: Passwords are hashed using scrypt with unique salts
- **Session Management**: Secure, HTTP-only cookies for session storage
- **Input Validation**: Zod schemas for request validation
- **Authentication Middleware**: Protected routes with Passport.js

## Performance Optimization

- **Data Caching**: TanStack Query caches server responses
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Optimistic Updates**: UI updates optimistically for better UX

## Deployment Architecture

The application is designed to be deployed as a single service, with the Express.js server serving both the API and the static frontend assets.

```
┌─────────────────────────────┐
│                             │
│          Replit             │
│                             │
│  ┌───────────┐ ┌─────────┐  │
│  │           │ │         │  │
│  │ Express.js│ │ React   │  │
│  │ Backend   │ │ Frontend│  │
│  │           │ │         │  │
│  └───────────┘ └─────────┘  │
│                             │
└─────────────────────────────┘
```