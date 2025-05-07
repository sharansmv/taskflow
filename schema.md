# Taskflow Database Schema

This document outlines the database schema for the Taskflow application, detailing the structure of all tables, their relationships, and data types.

## Overview

Taskflow uses a relational database structure with PostgreSQL, managed through Drizzle ORM. The schema is designed to support the core features of the application: user management, task tracking, goal setting, and calendar scheduling.

## Tables

### users

The `users` table stores user account information.

| Column       | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| id           | integer   | Primary key, auto-incremented            |
| username     | text      | Unique username for login                |
| email        | text      | User's email address                     |
| password     | text      | Hashed password                          |
| displayName  | text      | User's display name                      |
| createdAt    | timestamp | When the account was created             |
| googleId     | text      | ID for Google OAuth (optional)           |
| avatar       | text      | URL to user's avatar image (optional)    |

### tasks

The `tasks` table stores individual tasks created by users.

| Column       | Type      | Description                                    |
|--------------|-----------|------------------------------------------------|
| id           | integer   | Primary key, auto-incremented                  |
| userId       | integer   | Foreign key to users.id                        |
| title        | text      | Task title                                     |
| description  | text      | Task description (optional)                    |
| status       | text      | Task status (todo, in-progress, done)          |
| priority     | text      | Task priority (low, medium, high)              |
| dueDate      | timestamp | When the task is due (optional)                |
| completed    | boolean   | Whether the task is completed                  |
| completedAt  | timestamp | When the task was completed (optional)         |
| createdAt    | timestamp | When the task was created                      |
| category     | text      | Task category (work, personal, etc.)           |
| estimatedTime| integer   | Estimated time in minutes (optional)           |
| goalId       | integer   | Foreign key to goals.id (optional)             |

### goals

The `goals` table stores user goals, which can be hierarchical.

| Column       | Type      | Description                                   |
|--------------|-----------|-----------------------------------------------|
| id           | integer   | Primary key, auto-incremented                 |
| userId       | integer   | Foreign key to users.id                       |
| title        | text      | Goal title                                    |
| description  | text      | Goal description (optional)                   |
| timeframe    | text      | Timeframe (daily, weekly, monthly, long-term) |
| progress     | integer   | Progress percentage (0-100)                   |
| completed    | boolean   | Whether the goal is completed                 |
| deadline     | timestamp | Goal deadline (optional)                      |
| createdAt    | timestamp | When the goal was created                     |
| category     | text      | Goal category (work, personal, etc.)          |
| priority     | text      | Goal priority (low, medium, high)             |
| parentGoalId | integer   | Foreign key to goals.id for hierarchy         |

### time_blocks

The `time_blocks` table stores scheduled time blocks in the calendar.

| Column       | Type      | Description                                |
|--------------|-----------|-------------------------------------------|
| id           | integer   | Primary key, auto-incremented             |
| userId       | integer   | Foreign key to users.id                   |
| title        | text      | Time block title                          |
| startTime    | timestamp | Start time                                |
| endTime      | timestamp | End time                                  |
| createdAt    | timestamp | When the time block was created           |
| taskId       | integer   | Associated task (optional)                |
| color        | text      | Display color (optional)                  |
| recurrence   | text      | Recurrence pattern (optional)             |
| buffer       | integer   | Buffer time in minutes (optional)         |

### daily_plans

The `daily_plans` table stores daily planning information.

| Column       | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | integer   | Primary key, auto-incremented        |
| userId       | integer   | Foreign key to users.id              |
| date         | timestamp | Date of the plan                     |
| notes        | text      | Planning notes                       |
| createdAt    | timestamp | When the plan was created            |
| reflection   | text      | End-of-day reflection (optional)     |
| energy       | integer   | Energy level rating (1-10) (optional)|
| mood         | text      | Mood indicator (optional)            |

### integrations

The `integrations` table stores user integration settings.

| Column       | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| id           | integer   | Primary key, auto-incremented            |
| userId       | integer   | Foreign key to users.id                  |
| type         | text      | Integration type (google, todoist, etc.) |
| config       | jsonb     | Configuration JSON                       |
| createdAt    | timestamp | When the integration was created         |
| lastSync     | timestamp | Last successful sync                     |
| active       | boolean   | Whether the integration is active        |

## Relationships

### One-to-Many Relationships

- A user can have many tasks
- A user can have many goals
- A user can have many time blocks
- A user can have many daily plans
- A user can have many integrations
- A goal can have many tasks

### Self-Referential Relationships

- Goals can have parent-child relationships (hierarchy)

## Schema Definition

The schema is defined using Drizzle ORM in the `shared/schema.ts` file:

```typescript
// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  googleId: text("google_id"),
  avatar: text("avatar"),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo").notNull(),
  priority: text("priority").default("medium").notNull(),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  category: text("category").default("work").notNull(),
  estimatedTime: integer("estimated_time"),
  goalId: integer("goal_id").references(() => goals.id),
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timeframe: text("timeframe").notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  category: text("category").default("work").notNull(),
  priority: text("priority").default("medium").notNull(),
  parentGoalId: integer("parent_goal_id").references(() => goals.id),
});

// Time blocks table
export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  taskId: integer("task_id").references(() => tasks.id),
  color: text("color"),
  recurrence: text("recurrence"),
  buffer: integer("buffer").default(0),
});

// Daily plans table
export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  reflection: text("reflection"),
  energy: integer("energy"),
  mood: text("mood"),
});

// Integrations table
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSync: timestamp("last_sync"),
  active: boolean("active").default(true).notNull(),
});
```

## Data Validation

Data validation is performed using Zod schemas derived from the Drizzle table definitions. For each table, there's a corresponding insert schema that defines the required fields and validation rules for creating new records.

Example:

```typescript
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  googleId: true,
  avatar: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
```

## Storage Implementation

The application supports two storage implementations:

1. **MemStorage**: An in-memory implementation for development purposes
2. **DatabaseStorage**: A PostgreSQL implementation for production use

The storage interface ensures consistent data access regardless of the underlying implementation:

```typescript
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  // ... other methods
  
  // Session storage
  sessionStore: session.SessionStore;
}
```