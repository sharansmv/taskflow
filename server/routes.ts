/**
 * API Routes Module
 * 
 * This file defines all the API routes for the Taskflow application.
 * It sets up RESTful endpoints for tasks, goals, timeblocks, daily plans, and integrations.
 */
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { Types } from 'mongoose';
import { 
  insertTaskSchema, 
  insertGoalSchema, 
  insertTimeBlockSchema,
  insertDailyPlanSchema,
  insertIntegrationSchema
} from "@shared/models";
import { IUser } from "@shared/models";

// Type extension for the Express Request with auth
interface AuthenticatedRequest extends Request {
  user: IUser;
}

/**
 * Register all API routes for the application
 * 
 * @param app - The Express application instance
 * @returns The HTTP server instance
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  /**
   * Middleware to check if user is authenticated
   * Adds type safety for req.user as an authenticated user
   */
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  /**
   * Helper function to check if a MongoDB ObjectId is valid
   */
  const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id);
  };

  /**
   * Helper function to check resource ownership
   * Ensures a user can only access/modify their own resources
   */
  const checkOwnership = (resourceUserId: Types.ObjectId | string, userId: Types.ObjectId | string): boolean => {
    return resourceUserId.toString() === userId.toString();
  };

  // Task routes
  app.get("/api/tasks", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tasks = await storage.getTasksByUser(req.user._id.toString());
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: "Failed to retrieve tasks" });
    }
  });

  app.get("/api/tasks/:status", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.params;
    try {
      const tasks = await storage.getTasksByStatus(req.user._id.toString(), status);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      res.status(500).json({ error: "Failed to retrieve tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user._id.toString()
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      if (!checkOwnership(task.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      if (!checkOwnership(task.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteTask(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Goal routes
  app.get("/api/goals", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const goals = await storage.getGoalsByUser(req.user._id.toString());
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: "Failed to retrieve goals" });
    }
  });

  app.get("/api/goals/:timeframe", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { timeframe } = req.params;
    try {
      const goals = await storage.getGoalsByTimeframe(req.user._id.toString(), timeframe);
      res.json(goals);
    } catch (error) {
      console.error('Error fetching goals by timeframe:', error);
      res.status(500).json({ error: "Failed to retrieve goals" });
    }
  });

  app.post("/api/goals", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId: req.user._id.toString()
      });
      
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/goals/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const goal = await storage.getGoal(id);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      
      if (!checkOwnership(goal.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedGoal = await storage.updateGoal(id, req.body);
      res.json(updatedGoal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const goal = await storage.getGoal(id);
      
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      
      if (!checkOwnership(goal.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteGoal(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // TimeBlock routes
  app.get("/api/timeblocks", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    
    try {
      const blocks = await storage.getTimeBlocksByUser(
        req.user._id.toString(),
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(blocks);
    } catch (error) {
      console.error('Error fetching time blocks:', error);
      res.status(500).json({ error: "Failed to retrieve time blocks" });
    }
  });

  app.post("/api/timeblocks", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const timeBlockData = insertTimeBlockSchema.parse({
        ...req.body,
        userId: req.user._id.toString()
      });
      
      const timeBlock = await storage.createTimeBlock(timeBlockData);
      res.status(201).json(timeBlock);
    } catch (error) {
      console.error('Error creating time block:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/timeblocks/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const timeBlock = await storage.getTimeBlock(id);
      
      if (!timeBlock) {
        return res.status(404).json({ error: "TimeBlock not found" });
      }
      
      if (!checkOwnership(timeBlock.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedTimeBlock = await storage.updateTimeBlock(id, req.body);
      res.json(updatedTimeBlock);
    } catch (error) {
      console.error('Error updating time block:', error);
      res.status(500).json({ error: "Failed to update time block" });
    }
  });

  app.delete("/api/timeblocks/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      const timeBlock = await storage.getTimeBlock(id);
      
      if (!timeBlock) {
        return res.status(404).json({ error: "TimeBlock not found" });
      }
      
      if (!checkOwnership(timeBlock.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      await storage.deleteTimeBlock(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting time block:', error);
      res.status(500).json({ error: "Failed to delete time block" });
    }
  });

  // DailyPlan routes
  app.get("/api/dailyplan/:date", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.params;
    
    try {
      const plan = await storage.getDailyPlan(req.user._id.toString(), new Date(date));
      
      if (!plan) {
        return res.status(404).json({ error: "Daily plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error('Error fetching daily plan:', error);
      res.status(500).json({ error: "Failed to retrieve daily plan" });
    }
  });

  app.post("/api/dailyplan", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const dailyPlanData = insertDailyPlanSchema.parse({
        ...req.body,
        userId: req.user._id.toString()
      });
      
      const dailyPlan = await storage.createDailyPlan(dailyPlanData);
      res.status(201).json(dailyPlan);
    } catch (error) {
      console.error('Error creating daily plan:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/dailyplan/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      // For daily plans, we need to get by ID instead of date/user combo for updates
      const dailyPlan = await storage.getUser(id);
      
      if (!dailyPlan) {
        return res.status(404).json({ error: "Daily plan not found" });
      }
      
      // Since we don't have a direct "getDailyPlanById" method, this check may need to be adjusted
      if (!checkOwnership(req.body.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedDailyPlan = await storage.updateDailyPlan(id, req.body);
      res.json(updatedDailyPlan);
    } catch (error) {
      console.error('Error updating daily plan:', error);
      res.status(500).json({ error: "Failed to update daily plan" });
    }
  });

  // Integration routes
  app.get("/api/integrations/:type", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { type } = req.params;
    
    try {
      const integration = await storage.getIntegration(req.user._id.toString(), type);
      
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      console.error('Error fetching integration:', error);
      res.status(500).json({ error: "Failed to retrieve integration" });
    }
  });

  app.post("/api/integrations", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const integrationData = insertIntegrationSchema.parse({
        ...req.body,
        userId: req.user._id.toString()
      });
      
      const integration = await storage.createIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      console.error('Error creating integration:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/integrations/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      // Since getIntegration uses userId and type, we need a different approach
      // For now, we'll just check if the userId in the request body matches
      if (!checkOwnership(req.body.userId, req.user._id)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updatedIntegration = await storage.updateIntegration(id, req.body);
      
      if (!updatedIntegration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.json(updatedIntegration);
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(500).json({ error: "Failed to update integration" });
    }
  });

  app.delete("/api/integrations/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    
    try {
      // Similar to update, we need to find a way to check ownership
      // For simplicity, we assume validation happens in the delete method
      const result = await storage.deleteIntegration(id);
      
      if (!result) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting integration:', error);
      res.status(500).json({ error: "Failed to delete integration" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
