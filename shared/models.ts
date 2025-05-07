/**
 * MongoDB Model Definitions
 * 
 * This file defines the Mongoose models for the Taskflow application.
 * It maps our data schema to MongoDB collections and provides type definitions.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { z } from 'zod';

// ==================== User Model ====================
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  googleId?: string;
  fullName?: string;
  profilePicture?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  fullName: { type: String },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', userSchema);

// ==================== Goal Model ====================
export interface IGoal extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  timeframe: string; // long-term, monthly, weekly, daily
  progress: number; // percentage (0-100)
  deadline?: Date;
  priority: string;
  parentGoalId?: Types.ObjectId;
  completed: boolean;
  createdAt: Date;
}

const goalSchema = new Schema<IGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  timeframe: { type: String, required: true },
  progress: { type: Number, default: 0 },
  deadline: { type: Date },
  priority: { type: String, default: 'medium' },
  parentGoalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Goal = model<IGoal>('Goal', goalSchema);

// ==================== Task Model ====================
export interface ITask extends Document {
  userId: Types.ObjectId;
  title: string;
  description?: string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  status: string; // todo, in-progress, done
  source: string; // manual, todoist, etc
  externalId?: string; // for integration with external services
  goalId?: Types.ObjectId;
  priority: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  estimatedDuration: { type: Number },
  actualDuration: { type: Number },
  status: { type: String, required: true, default: 'todo' },
  source: { type: String, default: 'manual' },
  externalId: { type: String },
  goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
  priority: { type: String, default: 'medium' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  dueDate: { type: Date }
});

export const Task = model<ITask>('Task', taskSchema);

// ==================== TimeBlock Model ====================
export interface ITimeBlock extends Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  calendarEventId?: string;
  buffer: number; // buffer time in minutes
  createdAt: Date;
}

const timeBlockSchema = new Schema<ITimeBlock>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  calendarEventId: { type: String },
  buffer: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const TimeBlock = model<ITimeBlock>('TimeBlock', timeBlockSchema);

// ==================== DailyPlan Model ====================
export interface IDailyPlan extends Document {
  userId: Types.ObjectId;
  date: Date;
  notes?: string;
  taskIds: Types.ObjectId[];
  timeBlockIds: Types.ObjectId[];
  createdAt: Date;
}

const dailyPlanSchema = new Schema<IDailyPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  notes: { type: String },
  taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  timeBlockIds: [{ type: Schema.Types.ObjectId, ref: 'TimeBlock' }],
  createdAt: { type: Date, default: Date.now }
});

export const DailyPlan = model<IDailyPlan>('DailyPlan', dailyPlanSchema);

// ==================== WeeklyPlan Model ====================
export interface IWeeklyPlan extends Document {
  userId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  goalIds: Types.ObjectId[];
  timeBudgets: Record<string, number>;
  priorityAreas: string[];
  createdAt: Date;
}

const weeklyPlanSchema = new Schema<IWeeklyPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  goalIds: [{ type: Schema.Types.ObjectId, ref: 'Goal' }],
  timeBudgets: { type: Map, of: Number, default: {} },
  priorityAreas: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const WeeklyPlan = model<IWeeklyPlan>('WeeklyPlan', weeklyPlanSchema);

// ==================== Integration Model ====================
export interface IIntegration extends Document {
  userId: Types.ObjectId;
  type: string; // google_calendar, todoist, gmail
  credentials: Record<string, any>;
  syncStatus: string;
  lastSynced?: Date;
  createdAt: Date;
}

const integrationSchema = new Schema<IIntegration>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  credentials: { type: Schema.Types.Mixed, required: true },
  syncStatus: { type: String, default: 'inactive' },
  lastSynced: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Integration = model<IIntegration>('Integration', integrationSchema);

// ==================== Zod Validation Schemas ====================
// These match the MongoDB models but are used for validation

// User validation schema
export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  email: z.string().email(),
  fullName: z.string().optional(),
  googleId: z.string().optional(),
  profilePicture: z.string().optional()
});

// Goal validation schema
export const insertGoalSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  timeframe: z.string(),
  deadline: z.date().optional(),
  priority: z.string().default('medium'),
  parentGoalId: z.string().optional()
});

// Task validation schema
export const insertTaskSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  estimatedDuration: z.number().optional(),
  status: z.string().default('todo'),
  goalId: z.string().optional(),
  priority: z.string().default('medium'),
  dueDate: z.date().optional()
});

// TimeBlock validation schema
export const insertTimeBlockSchema = z.object({
  userId: z.string(),
  taskId: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  calendarEventId: z.string().optional(),
  buffer: z.number().default(0)
});

// DailyPlan validation schema
export const insertDailyPlanSchema = z.object({
  userId: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  taskIds: z.array(z.string()).default([]),
  timeBlockIds: z.array(z.string()).default([])
});

// Integration validation schema
export const insertIntegrationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  credentials: z.record(z.any())
});

// ==================== TypeScript Types ====================
export type User = Document & IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Goal = Document & IGoal;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type Task = Document & ITask;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeBlock = Document & ITimeBlock;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;

export type DailyPlan = Document & IDailyPlan;
export type InsertDailyPlan = z.infer<typeof insertDailyPlanSchema>;

export type WeeklyPlan = Document & IWeeklyPlan;

export type Integration = Document & IIntegration;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;