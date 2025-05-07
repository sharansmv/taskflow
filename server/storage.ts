/**
 * Storage Implementation for MongoDB
 * 
 * This file implements the storage interface using MongoDB and Mongoose models
 * to provide data persistence for the Taskflow application.
 */
import session from "express-session";
import { Types } from "mongoose";
import MongoStore from "connect-mongo";
import connectMongo from "connect-mongodb-session";

// Import Mongoose models and types
import {
  User, InsertUser, Goal, InsertGoal, Task, InsertTask,
  TimeBlock, InsertTimeBlock, DailyPlan, InsertDailyPlan,
  Integration, InsertIntegration, IUser, IGoal, ITask,
  ITimeBlock, IDailyPlan, IIntegration
} from "@shared/models";

// MongoDB session store
const MongoDBStore = connectMongo(session);

/**
 * Storage interface defining all database operations
 * This interface remains consistent while the implementation can change
 */
export interface IStorage {
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByUsername(username: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  getUserByGoogleId(googleId: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;
  
  // Task operations
  getTask(id: string): Promise<ITask | undefined>;
  getTasksByUser(userId: string): Promise<ITask[]>;
  getTasksByStatus(userId: string, status: string): Promise<ITask[]>;
  createTask(task: InsertTask): Promise<ITask>;
  updateTask(id: string, task: Partial<ITask>): Promise<ITask | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Goal operations
  getGoal(id: string): Promise<IGoal | undefined>;
  getGoalsByUser(userId: string): Promise<IGoal[]>;
  getGoalsByTimeframe(userId: string, timeframe: string): Promise<IGoal[]>;
  createGoal(goal: InsertGoal): Promise<IGoal>;
  updateGoal(id: string, goal: Partial<IGoal>): Promise<IGoal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // TimeBlock operations
  getTimeBlock(id: string): Promise<ITimeBlock | undefined>;
  getTimeBlocksByUser(userId: string, startDate: Date, endDate: Date): Promise<ITimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<ITimeBlock>;
  updateTimeBlock(id: string, timeBlock: Partial<ITimeBlock>): Promise<ITimeBlock | undefined>;
  deleteTimeBlock(id: string): Promise<boolean>;
  
  // DailyPlan operations
  getDailyPlan(userId: string, date: Date): Promise<IDailyPlan | undefined>;
  createDailyPlan(dailyPlan: InsertDailyPlan): Promise<IDailyPlan>;
  updateDailyPlan(id: string, dailyPlan: Partial<IDailyPlan>): Promise<IDailyPlan | undefined>;
  
  // Integration operations
  getIntegration(userId: string, type: string): Promise<IIntegration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<IIntegration>;
  updateIntegration(id: string, integration: Partial<IIntegration>): Promise<IIntegration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

/**
 * MongoDB implementation of the storage interface
 * Uses Mongoose models to interact with the database
 */
export class MongoStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    // Create MongoDB session store for Express
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    
    this.sessionStore = MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: 'sessions',
      ttl: 86400 // 1 day in seconds
    });
  }

  // ==================== User Methods ====================
  
  /**
   * Get a user by their ID
   * @param id - The MongoDB ObjectId of the user
   */
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  /**
   * Get a user by their username
   * @param username - The username to search for
   */
  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  /**
   * Get a user by their email address
   * @param email - The email address to search for
   */
  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  /**
   * Get a user by their Google ID (for OAuth)
   * @param googleId - The Google ID to search for
   */
  async getUserByGoogleId(googleId: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ googleId });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by Google ID:', error);
      return undefined;
    }
  }

  /**
   * Create a new user in the database
   * @param userData - The user data to insert
   */
  async createUser(userData: InsertUser): Promise<IUser> {
    try {
      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // ==================== Task Methods ====================
  
  /**
   * Get a task by its ID
   * @param id - The MongoDB ObjectId of the task
   */
  async getTask(id: string): Promise<ITask | undefined> {
    try {
      const task = await Task.findById(id);
      return task || undefined;
    } catch (error) {
      console.error('Error getting task by ID:', error);
      return undefined;
    }
  }

  /**
   * Get all tasks for a specific user
   * @param userId - The user's ID
   */
  async getTasksByUser(userId: string): Promise<ITask[]> {
    try {
      return await Task.find({ userId: new Types.ObjectId(userId) });
    } catch (error) {
      console.error('Error getting tasks by user:', error);
      return [];
    }
  }

  /**
   * Get tasks for a specific user filtered by status
   * @param userId - The user's ID
   * @param status - The task status to filter by
   */
  async getTasksByStatus(userId: string, status: string): Promise<ITask[]> {
    try {
      return await Task.find({ 
        userId: new Types.ObjectId(userId),
        status 
      });
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return [];
    }
  }

  /**
   * Create a new task in the database
   * @param taskData - The task data to insert
   */
  async createTask(taskData: InsertTask): Promise<ITask> {
    try {
      // Convert string IDs to ObjectIds
      const task = new Task({
        ...taskData,
        userId: new Types.ObjectId(taskData.userId),
        goalId: taskData.goalId ? new Types.ObjectId(taskData.goalId) : undefined
      });
      
      await task.save();
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param id - The task ID to update
   * @param taskUpdate - The updated task data
   */
  async updateTask(id: string, taskUpdate: Partial<ITask>): Promise<ITask | undefined> {
    try {
      // Handle potential ObjectId conversions
      if (taskUpdate.goalId && typeof taskUpdate.goalId === 'string') {
        taskUpdate.goalId = new Types.ObjectId(taskUpdate.goalId);
      }
      
      const task = await Task.findByIdAndUpdate(
        id,
        { $set: taskUpdate },
        { new: true }
      );
      
      return task || undefined;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  /**
   * Delete a task from the database
   * @param id - The task ID to delete
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const result = await Task.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // ==================== Goal Methods ====================
  
  /**
   * Get a goal by its ID
   * @param id - The MongoDB ObjectId of the goal
   */
  async getGoal(id: string): Promise<IGoal | undefined> {
    try {
      const goal = await Goal.findById(id);
      return goal || undefined;
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      return undefined;
    }
  }

  /**
   * Get all goals for a specific user
   * @param userId - The user's ID
   */
  async getGoalsByUser(userId: string): Promise<IGoal[]> {
    try {
      return await Goal.find({ userId: new Types.ObjectId(userId) });
    } catch (error) {
      console.error('Error getting goals by user:', error);
      return [];
    }
  }

  /**
   * Get goals for a specific user filtered by timeframe
   * @param userId - The user's ID
   * @param timeframe - The timeframe to filter by
   */
  async getGoalsByTimeframe(userId: string, timeframe: string): Promise<IGoal[]> {
    try {
      return await Goal.find({ 
        userId: new Types.ObjectId(userId),
        timeframe 
      });
    } catch (error) {
      console.error('Error getting goals by timeframe:', error);
      return [];
    }
  }

  /**
   * Create a new goal in the database
   * @param goalData - The goal data to insert
   */
  async createGoal(goalData: InsertGoal): Promise<IGoal> {
    try {
      // Convert string IDs to ObjectIds
      const goal = new Goal({
        ...goalData,
        userId: new Types.ObjectId(goalData.userId),
        parentGoalId: goalData.parentGoalId ? new Types.ObjectId(goalData.parentGoalId) : undefined
      });
      
      await goal.save();
      return goal;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  /**
   * Update an existing goal
   * @param id - The goal ID to update
   * @param goalUpdate - The updated goal data
   */
  async updateGoal(id: string, goalUpdate: Partial<IGoal>): Promise<IGoal | undefined> {
    try {
      // Handle potential ObjectId conversions
      if (goalUpdate.parentGoalId && typeof goalUpdate.parentGoalId === 'string') {
        goalUpdate.parentGoalId = new Types.ObjectId(goalUpdate.parentGoalId);
      }
      
      const goal = await Goal.findByIdAndUpdate(
        id,
        { $set: goalUpdate },
        { new: true }
      );
      
      return goal || undefined;
    } catch (error) {
      console.error('Error updating goal:', error);
      return undefined;
    }
  }

  /**
   * Delete a goal from the database
   * @param id - The goal ID to delete
   */
  async deleteGoal(id: string): Promise<boolean> {
    try {
      const result = await Goal.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting goal:', error);
      return false;
    }
  }

  // ==================== TimeBlock Methods ====================
  
  /**
   * Get a timeblock by its ID
   * @param id - The MongoDB ObjectId of the timeblock
   */
  async getTimeBlock(id: string): Promise<ITimeBlock | undefined> {
    try {
      const timeBlock = await TimeBlock.findById(id);
      return timeBlock || undefined;
    } catch (error) {
      console.error('Error getting time block by ID:', error);
      return undefined;
    }
  }

  /**
   * Get timeblocks for a specific user within a date range
   * @param userId - The user's ID
   * @param startDate - The start date range
   * @param endDate - The end date range
   */
  async getTimeBlocksByUser(userId: string, startDate: Date, endDate: Date): Promise<ITimeBlock[]> {
    try {
      return await TimeBlock.find({ 
        userId: new Types.ObjectId(userId),
        startTime: { $gte: startDate },
        endTime: { $lte: endDate }
      });
    } catch (error) {
      console.error('Error getting time blocks by user and date range:', error);
      return [];
    }
  }

  /**
   * Create a new timeblock in the database
   * @param timeBlockData - The timeblock data to insert
   */
  async createTimeBlock(timeBlockData: InsertTimeBlock): Promise<ITimeBlock> {
    try {
      // Convert string IDs to ObjectIds
      const timeBlock = new TimeBlock({
        ...timeBlockData,
        userId: new Types.ObjectId(timeBlockData.userId),
        taskId: timeBlockData.taskId ? new Types.ObjectId(timeBlockData.taskId) : undefined
      });
      
      await timeBlock.save();
      return timeBlock;
    } catch (error) {
      console.error('Error creating time block:', error);
      throw error;
    }
  }

  /**
   * Update an existing timeblock
   * @param id - The timeblock ID to update
   * @param timeBlockUpdate - The updated timeblock data
   */
  async updateTimeBlock(id: string, timeBlockUpdate: Partial<ITimeBlock>): Promise<ITimeBlock | undefined> {
    try {
      // Handle potential ObjectId conversions
      if (timeBlockUpdate.taskId && typeof timeBlockUpdate.taskId === 'string') {
        timeBlockUpdate.taskId = new Types.ObjectId(timeBlockUpdate.taskId);
      }
      
      const timeBlock = await TimeBlock.findByIdAndUpdate(
        id,
        { $set: timeBlockUpdate },
        { new: true }
      );
      
      return timeBlock || undefined;
    } catch (error) {
      console.error('Error updating time block:', error);
      return undefined;
    }
  }

  /**
   * Delete a timeblock from the database
   * @param id - The timeblock ID to delete
   */
  async deleteTimeBlock(id: string): Promise<boolean> {
    try {
      const result = await TimeBlock.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting time block:', error);
      return false;
    }
  }

  // ==================== DailyPlan Methods ====================
  
  /**
   * Get a daily plan for a specific user and date
   * @param userId - The user's ID
   * @param date - The date to find the plan for
   */
  async getDailyPlan(userId: string, date: Date): Promise<IDailyPlan | undefined> {
    try {
      // Create a date range for the specific day (start and end of the day)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dailyPlan = await DailyPlan.findOne({
        userId: new Types.ObjectId(userId),
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      return dailyPlan || undefined;
    } catch (error) {
      console.error('Error getting daily plan:', error);
      return undefined;
    }
  }

  /**
   * Create a new daily plan in the database
   * @param dailyPlanData - The daily plan data to insert
   */
  async createDailyPlan(dailyPlanData: InsertDailyPlan): Promise<IDailyPlan> {
    try {
      // Convert string IDs to ObjectIds
      const dailyPlan = new DailyPlan({
        ...dailyPlanData,
        userId: new Types.ObjectId(dailyPlanData.userId),
        taskIds: Array.isArray(dailyPlanData.taskIds) 
          ? dailyPlanData.taskIds.map(id => new Types.ObjectId(id)) 
          : [],
        timeBlockIds: Array.isArray(dailyPlanData.timeBlockIds)
          ? dailyPlanData.timeBlockIds.map(id => new Types.ObjectId(id))
          : []
      });
      
      await dailyPlan.save();
      return dailyPlan;
    } catch (error) {
      console.error('Error creating daily plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing daily plan
   * @param id - The daily plan ID to update
   * @param dailyPlanUpdate - The updated daily plan data
   */
  async updateDailyPlan(id: string, dailyPlanUpdate: Partial<IDailyPlan>): Promise<IDailyPlan | undefined> {
    try {
      // Handle array of ObjectIds
      if (dailyPlanUpdate.taskIds && Array.isArray(dailyPlanUpdate.taskIds)) {
        dailyPlanUpdate.taskIds = dailyPlanUpdate.taskIds.map(id => 
          typeof id === 'string' ? new Types.ObjectId(id) : id
        );
      }
      
      if (dailyPlanUpdate.timeBlockIds && Array.isArray(dailyPlanUpdate.timeBlockIds)) {
        dailyPlanUpdate.timeBlockIds = dailyPlanUpdate.timeBlockIds.map(id => 
          typeof id === 'string' ? new Types.ObjectId(id) : id
        );
      }
      
      const dailyPlan = await DailyPlan.findByIdAndUpdate(
        id,
        { $set: dailyPlanUpdate },
        { new: true }
      );
      
      return dailyPlan || undefined;
    } catch (error) {
      console.error('Error updating daily plan:', error);
      return undefined;
    }
  }

  // ==================== Integration Methods ====================
  
  /**
   * Get an integration by user ID and type
   * @param userId - The user's ID
   * @param type - The integration type
   */
  async getIntegration(userId: string, type: string): Promise<IIntegration | undefined> {
    try {
      const integration = await Integration.findOne({
        userId: new Types.ObjectId(userId),
        type
      });
      
      return integration || undefined;
    } catch (error) {
      console.error('Error getting integration:', error);
      return undefined;
    }
  }

  /**
   * Create a new integration in the database
   * @param integrationData - The integration data to insert
   */
  async createIntegration(integrationData: InsertIntegration): Promise<IIntegration> {
    try {
      const integration = new Integration({
        ...integrationData,
        userId: new Types.ObjectId(integrationData.userId)
      });
      
      await integration.save();
      return integration;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  /**
   * Update an existing integration
   * @param id - The integration ID to update
   * @param integrationUpdate - The updated integration data
   */
  async updateIntegration(id: string, integrationUpdate: Partial<IIntegration>): Promise<IIntegration | undefined> {
    try {
      const integration = await Integration.findByIdAndUpdate(
        id,
        { $set: integrationUpdate },
        { new: true }
      );
      
      return integration || undefined;
    } catch (error) {
      console.error('Error updating integration:', error);
      return undefined;
    }
  }

  /**
   * Delete an integration from the database
   * @param id - The integration ID to delete
   */
  async deleteIntegration(id: string): Promise<boolean> {
    try {
      const result = await Integration.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting integration:', error);
      return false;
    }
  }
}

// Create and export a storage instance
export const storage = new MongoStorage();
