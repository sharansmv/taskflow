import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(),
  fullName: text("full_name"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Goals Table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  timeframe: text("timeframe").notNull(), // long-term, monthly, weekly, daily
  progress: integer("progress").default(0), // percentage (0-100)
  deadline: timestamp("deadline"),
  priority: text("priority").default("medium"),
  parentGoalId: integer("parent_goal_id").references(() => goals.id),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"), // in minutes
  actualDuration: integer("actual_duration"), // in minutes
  status: text("status").notNull().default("todo"), // todo, in-progress, done
  source: text("source").default("manual"), // manual, todoist, etc
  externalId: text("external_id"), // for integration with external services
  goalId: integer("goal_id").references(() => goals.id),
  priority: text("priority").default("medium"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueDate: timestamp("due_date"),
});

// Time Blocks Table
export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  calendarEventId: text("calendar_event_id"),
  buffer: integer("buffer").default(0), // buffer time in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Daily Plans Table
export const dailyPlans = pgTable("daily_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  taskIds: jsonb("task_ids").default([]), // Array of task IDs
  timeBlockIds: jsonb("time_block_ids").default([]), // Array of time block IDs
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weekly Plans Table
export const weeklyPlans = pgTable("weekly_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goalIds: jsonb("goal_ids").default([]), // Array of goal IDs
  timeBudgets: jsonb("time_budgets").default({}), // JSON of category -> minutes
  priorityAreas: jsonb("priority_areas").default([]), // Array of focus areas
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Integrations Table
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // google_calendar, todoist, gmail
  credentials: jsonb("credentials").notNull(),
  syncStatus: text("sync_status").default("inactive"),
  lastSynced: timestamp("last_synced"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema for user insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  googleId: true,
  profilePicture: true,
});

// Schema for goal insertion
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

// Schema for task insertion
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

// Schema for time block insertion
export const insertTimeBlockSchema = createInsertSchema(timeBlocks).pick({
  userId: true,
  taskId: true,
  startTime: true,
  endTime: true,
  calendarEventId: true,
  buffer: true,
});

// Schema for daily plan insertion
export const insertDailyPlanSchema = createInsertSchema(dailyPlans).pick({
  userId: true,
  date: true,
  notes: true,
  taskIds: true,
  timeBlockIds: true,
});

// Schema for integration insertion
export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  type: true,
  credentials: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;

export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;
export type DailyPlan = typeof dailyPlans.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
