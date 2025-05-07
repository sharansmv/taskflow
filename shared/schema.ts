/**
 * Database Schema Definition
 * 
 * This file defines the database schema for the Taskflow application using Drizzle ORM.
 * It includes table definitions, validation schemas using Zod, and TypeScript types.
 */
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Users Table
 * Stores user account information and authentication details
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),                     // Unique identifier for the user
  username: text("username").notNull().unique(),     // Username for login (must be unique)
  password: text("password").notNull(),              // Hashed password for authentication
  email: text("email").notNull().unique(),           // User's email address (must be unique)
  googleId: text("google_id").unique(),              // Google OAuth ID for social login (optional)
  fullName: text("full_name"),                       // User's full name (optional)
  profilePicture: text("profile_picture"),           // URL to user's avatar image (optional)
  createdAt: timestamp("created_at").defaultNow().notNull(), // Account creation timestamp
});

/**
 * Goals Table
 * Stores user goals with hierarchy support and progress tracking
 */
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),                      // Unique identifier for the goal
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the goal
  title: text("title").notNull(),                     // Goal title
  description: text("description"),                   // Detailed description (optional)
  category: text("category").notNull(),               // Category (work, personal, health, etc.)
  timeframe: text("timeframe").notNull(),             // Timeframe (long-term, monthly, weekly, daily)
  progress: integer("progress").default(0),           // Progress percentage (0-100)
  deadline: timestamp("deadline"),                    // Goal deadline (optional)
  priority: text("priority").default("medium"),       // Priority level (low, medium, high)
  parentGoalId: integer("parent_goal_id").references(() => goals.id), // Parent goal for hierarchy
  completed: boolean("completed").default(false),     // Whether the goal is completed
  createdAt: timestamp("created_at").defaultNow().notNull(), // Goal creation timestamp
});

/**
 * Tasks Table
 * Stores actionable tasks that can be linked to goals
 */
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),                      // Unique identifier for the task
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the task
  title: text("title").notNull(),                     // Task title
  description: text("description"),                   // Detailed description (optional)
  estimatedDuration: integer("estimated_duration"),   // Estimated duration in minutes
  actualDuration: integer("actual_duration"),         // Actual time spent in minutes
  status: text("status").notNull().default("todo"),   // Status (todo, in-progress, done)
  source: text("source").default("manual"),           // Source of task (manual, import, etc.)
  externalId: text("external_id"),                    // ID from external system (for integrations)
  goalId: integer("goal_id").references(() => goals.id), // Associated goal (optional)
  priority: text("priority").default("medium"),       // Priority level (low, medium, high)
  completed: boolean("completed").default(false),     // Whether the task is completed
  createdAt: timestamp("created_at").defaultNow().notNull(), // Task creation timestamp
  dueDate: timestamp("due_date"),                     // Task due date (optional)
});

/**
 * Time Blocks Table
 * Stores scheduled time blocks for focused work and calendar integration
 */
export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),                      // Unique identifier for the time block
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the time block
  taskId: integer("task_id").references(() => tasks.id), // Associated task (optional)
  startTime: timestamp("start_time").notNull(),       // Start time of the block
  endTime: timestamp("end_time").notNull(),           // End time of the block
  calendarEventId: text("calendar_event_id"),         // ID from calendar service (for integrations)
  buffer: integer("buffer").default(0),               // Buffer time in minutes after the block
  createdAt: timestamp("created_at").defaultNow().notNull(), // Time block creation timestamp
});

/**
 * Daily Plans Table
 * Stores daily planning information and reflections
 */
export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),                      // Unique identifier for the daily plan
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the plan
  date: timestamp("date").notNull(),                  // Date of the plan
  notes: text("notes"),                               // Planning notes (optional)
  taskIds: jsonb("task_ids").default([]),             // Array of associated task IDs
  timeBlockIds: jsonb("time_block_ids").default([]),  // Array of associated time block IDs
  createdAt: timestamp("created_at").defaultNow().notNull(), // Plan creation timestamp
});

/**
 * Weekly Plans Table
 * Stores weekly planning information and goals
 */
export const weeklyPlans = pgTable("weekly_plans", {
  id: serial("id").primaryKey(),                      // Unique identifier for the weekly plan
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the plan
  startDate: timestamp("start_date").notNull(),       // Start date of the week
  endDate: timestamp("end_date").notNull(),           // End date of the week
  goalIds: jsonb("goal_ids").default([]),             // Array of goal IDs to focus on this week
  timeBudgets: jsonb("time_budgets").default({}),     // Time allocation per category
  priorityAreas: jsonb("priority_areas").default([]), // Focus areas for the week
  createdAt: timestamp("created_at").defaultNow().notNull(), // Plan creation timestamp
});

/**
 * Integrations Table
 * Stores third-party service integration settings
 */
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),                      // Unique identifier for the integration
  userId: integer("user_id").notNull().references(() => users.id), // User who owns the integration
  type: text("type").notNull(),                       // Integration type (google_calendar, todoist, etc.)
  credentials: jsonb("credentials").notNull(),        // OAuth tokens and other credentials (encrypted)
  syncStatus: text("sync_status").default("inactive"),// Sync status (active, inactive, error)
  lastSynced: timestamp("last_synced"),               // Last successful sync timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(), // Integration creation timestamp
});

/**
 * Zod schema for user creation
 * Used for validating user input when creating a new user
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  googleId: true,
  profilePicture: true,
});

/**
 * Zod schema for goal creation
 * Used for validating user input when creating a new goal
 */
export const insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
  timeframe: true,
  deadline: true,
  priority: true,
  parentGoalId: true,
});

/**
 * Zod schema for task creation
 * Used for validating user input when creating a new task
 */
export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  estimatedDuration: true,
  status: true,
  goalId: true,
  priority: true,
  dueDate: true,
});

/**
 * Zod schema for time block creation
 * Used for validating user input when creating a new time block
 */
export const insertTimeBlockSchema = createInsertSchema(timeBlocks).pick({
  userId: true,
  taskId: true,
  startTime: true,
  endTime: true,
  calendarEventId: true,
  buffer: true,
});

/**
 * Zod schema for daily plan creation
 * Used for validating user input when creating a new daily plan
 */
export const insertDailyPlanSchema = createInsertSchema(dailyPlans).pick({
  userId: true,
  date: true,
  notes: true,
  taskIds: true,
  timeBlockIds: true,
});

/**
 * Zod schema for integration creation
 * Used for validating user input when setting up a new integration
 */
export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  type: true,
  credentials: true,
});

/**
 * TypeScript types derived from schemas
 * These provide type safety throughout the application
 */
// User types
export type InsertUser = z.infer<typeof insertUserSchema>;  // Type for creating a new user
export type User = typeof users.$inferSelect;               // Type for user data from database

// Goal types
export type InsertGoal = z.infer<typeof insertGoalSchema>;  // Type for creating a new goal
export type Goal = typeof goals.$inferSelect;               // Type for goal data from database

// Task types
export type InsertTask = z.infer<typeof insertTaskSchema>;  // Type for creating a new task
export type Task = typeof tasks.$inferSelect;               // Type for task data from database

// Time block types
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>; // Type for creating a new time block
export type TimeBlock = typeof timeBlocks.$inferSelect;              // Type for time block data from database

// Daily plan types
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>; // Type for creating a new daily plan
export type DailyPlan = typeof dailyPlans.$inferSelect;              // Type for daily plan data from database

// Integration types
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>; // Type for creating a new integration
export type Integration = typeof integrations.$inferSelect;              // Type for integration data from database
