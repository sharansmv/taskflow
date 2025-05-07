import { users, tasks, goals, timeBlocks, dailyPlans, weeklyPlans, integrations } from "@shared/schema";
import type { User, InsertUser, Task, InsertTask, Goal, InsertGoal, TimeBlock, InsertTimeBlock, DailyPlan, InsertDailyPlan, Integration, InsertIntegration } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUser(userId: number): Promise<Task[]>;
  getTasksByStatus(userId: number, status: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Goal operations
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUser(userId: number): Promise<Goal[]>;
  getGoalsByTimeframe(userId: number, timeframe: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // TimeBlock operations
  getTimeBlock(id: number): Promise<TimeBlock | undefined>;
  getTimeBlocksByUser(userId: number, startDate: Date, endDate: Date): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock | undefined>;
  deleteTimeBlock(id: number): Promise<boolean>;
  
  // DailyPlan operations
  getDailyPlan(userId: number, date: Date): Promise<DailyPlan | undefined>;
  createDailyPlan(dailyPlan: InsertDailyPlan): Promise<DailyPlan>;
  updateDailyPlan(id: number, dailyPlan: Partial<DailyPlan>): Promise<DailyPlan | undefined>;
  
  // Integration operations
  getIntegration(userId: number, type: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private goals: Map<number, Goal>;
  private timeBlocks: Map<number, TimeBlock>;
  private dailyPlans: Map<number, DailyPlan>;
  private integrations: Map<number, Integration>;
  
  private userIdCounter: number;
  private taskIdCounter: number;
  private goalIdCounter: number;
  private timeBlockIdCounter: number;
  private dailyPlanIdCounter: number;
  private integrationIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.goals = new Map();
    this.timeBlocks = new Map();
    this.dailyPlans = new Map();
    this.integrations = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.goalIdCounter = 1;
    this.timeBlockIdCounter = 1;
    this.dailyPlanIdCounter = 1;
    this.integrationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // One day in ms
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByUser(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.status === status
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: now,
      completed: false,
      actualDuration: null,
      externalId: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Goal methods
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUser(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGoalsByTimeframe(userId: number, timeframe: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId && goal.timeframe === timeframe
    );
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const now = new Date();
    const goal: Goal = { 
      ...insertGoal, 
      id, 
      progress: 0, 
      completed: false,
      createdAt: now
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, goalUpdate: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updatedGoal = { ...goal, ...goalUpdate };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // TimeBlock methods
  async getTimeBlock(id: number): Promise<TimeBlock | undefined> {
    return this.timeBlocks.get(id);
  }

  async getTimeBlocksByUser(userId: number, startDate: Date, endDate: Date): Promise<TimeBlock[]> {
    return Array.from(this.timeBlocks.values()).filter(
      (block) => block.userId === userId && 
                 block.startTime >= startDate && 
                 block.endTime <= endDate
    );
  }

  async createTimeBlock(insertTimeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const id = this.timeBlockIdCounter++;
    const now = new Date();
    const timeBlock: TimeBlock = { ...insertTimeBlock, id, createdAt: now };
    this.timeBlocks.set(id, timeBlock);
    return timeBlock;
  }

  async updateTimeBlock(id: number, timeBlockUpdate: Partial<TimeBlock>): Promise<TimeBlock | undefined> {
    const timeBlock = this.timeBlocks.get(id);
    if (!timeBlock) return undefined;
    
    const updatedTimeBlock = { ...timeBlock, ...timeBlockUpdate };
    this.timeBlocks.set(id, updatedTimeBlock);
    return updatedTimeBlock;
  }

  async deleteTimeBlock(id: number): Promise<boolean> {
    return this.timeBlocks.delete(id);
  }

  // DailyPlan methods
  async getDailyPlan(userId: number, date: Date): Promise<DailyPlan | undefined> {
    // Set hours, minutes, seconds, and milliseconds to 0 to match just the date
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.dailyPlans.values()).find(plan => {
      const planDate = new Date(plan.date);
      planDate.setHours(0, 0, 0, 0);
      return plan.userId === userId && planDate.getTime() === targetDate.getTime();
    });
  }

  async createDailyPlan(insertDailyPlan: InsertDailyPlan): Promise<DailyPlan> {
    const id = this.dailyPlanIdCounter++;
    const now = new Date();
    const dailyPlan: DailyPlan = { ...insertDailyPlan, id, createdAt: now };
    this.dailyPlans.set(id, dailyPlan);
    return dailyPlan;
  }

  async updateDailyPlan(id: number, dailyPlanUpdate: Partial<DailyPlan>): Promise<DailyPlan | undefined> {
    const dailyPlan = this.dailyPlans.get(id);
    if (!dailyPlan) return undefined;
    
    const updatedDailyPlan = { ...dailyPlan, ...dailyPlanUpdate };
    this.dailyPlans.set(id, updatedDailyPlan);
    return updatedDailyPlan;
  }

  // Integration methods
  async getIntegration(userId: number, type: string): Promise<Integration | undefined> {
    return Array.from(this.integrations.values()).find(
      (integration) => integration.userId === userId && integration.type === type
    );
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.integrationIdCounter++;
    const now = new Date();
    const integration: Integration = { 
      ...insertIntegration, 
      id,
      syncStatus: "inactive",
      lastSynced: null,
      createdAt: now
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: number, integrationUpdate: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;
    
    const updatedIntegration = { ...integration, ...integrationUpdate };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    return this.integrations.delete(id);
  }
}

export const storage = new MemStorage();
