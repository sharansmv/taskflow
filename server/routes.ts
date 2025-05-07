import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertGoalSchema, 
  insertTimeBlockSchema,
  insertDailyPlanSchema,
  insertIntegrationSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }
    next();
  };

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    const tasks = await storage.getTasksByUser(req.user.id);
    res.json(tasks);
  });

  app.get("/api/tasks/:status", requireAuth, async (req, res) => {
    const { status } = req.params;
    const tasks = await storage.getTasksByStatus(req.user.id, status);
    res.json(tasks);
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const task = await storage.getTask(parseInt(id));
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    try {
      const updatedTask = await storage.updateTask(parseInt(id), req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const task = await storage.getTask(parseInt(id));
    
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await storage.deleteTask(parseInt(id));
    res.status(204).end();
  });

  // Goal routes
  app.get("/api/goals", requireAuth, async (req, res) => {
    const goals = await storage.getGoalsByUser(req.user.id);
    res.json(goals);
  });

  app.get("/api/goals/:timeframe", requireAuth, async (req, res) => {
    const { timeframe } = req.params;
    const goals = await storage.getGoalsByTimeframe(req.user.id, timeframe);
    res.json(goals);
  });

  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/goals/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const goal = await storage.getGoal(parseInt(id));
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    if (goal.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    try {
      const updatedGoal = await storage.updateGoal(parseInt(id), req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const goal = await storage.getGoal(parseInt(id));
    
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }
    
    if (goal.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await storage.deleteGoal(parseInt(id));
    res.status(204).end();
  });

  // TimeBlock routes
  app.get("/api/timeblocks", requireAuth, async (req, res) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "startDate and endDate are required" });
    }
    
    try {
      const blocks = await storage.getTimeBlocksByUser(
        req.user.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      res.json(blocks);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/timeblocks", requireAuth, async (req, res) => {
    try {
      const timeBlockData = insertTimeBlockSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const timeBlock = await storage.createTimeBlock(timeBlockData);
      res.status(201).json(timeBlock);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/timeblocks/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const timeBlock = await storage.getTimeBlock(parseInt(id));
    
    if (!timeBlock) {
      return res.status(404).json({ error: "TimeBlock not found" });
    }
    
    if (timeBlock.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    try {
      const updatedTimeBlock = await storage.updateTimeBlock(parseInt(id), req.body);
      res.json(updatedTimeBlock);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/timeblocks/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const timeBlock = await storage.getTimeBlock(parseInt(id));
    
    if (!timeBlock) {
      return res.status(404).json({ error: "TimeBlock not found" });
    }
    
    if (timeBlock.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await storage.deleteTimeBlock(parseInt(id));
    res.status(204).end();
  });

  // DailyPlan routes
  app.get("/api/dailyplan/:date", requireAuth, async (req, res) => {
    const { date } = req.params;
    
    try {
      const plan = await storage.getDailyPlan(req.user.id, new Date(date));
      
      if (!plan) {
        return res.status(404).json({ error: "Daily plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/dailyplan", requireAuth, async (req, res) => {
    try {
      const dailyPlanData = insertDailyPlanSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const dailyPlan = await storage.createDailyPlan(dailyPlanData);
      res.status(201).json(dailyPlan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/dailyplan/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const dailyPlan = await storage.getDailyPlan(req.user.id, new Date(req.body.date));
    
    if (!dailyPlan) {
      return res.status(404).json({ error: "Daily plan not found" });
    }
    
    if (dailyPlan.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    try {
      const updatedDailyPlan = await storage.updateDailyPlan(parseInt(id), req.body);
      res.json(updatedDailyPlan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Integration routes
  app.get("/api/integrations/:type", requireAuth, async (req, res) => {
    const { type } = req.params;
    
    try {
      const integration = await storage.getIntegration(req.user.id, type);
      
      if (!integration) {
        return res.status(404).json({ error: "Integration not found" });
      }
      
      res.json(integration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/integrations", requireAuth, async (req, res) => {
    try {
      const integrationData = insertIntegrationSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const integration = await storage.createIntegration(integrationData);
      res.status(201).json(integration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/integrations/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const integration = await storage.getIntegration(req.user.id, req.body.type);
    
    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }
    
    if (integration.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    try {
      const updatedIntegration = await storage.updateIntegration(parseInt(id), req.body);
      res.json(updatedIntegration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/integrations/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    const integration = await storage.getIntegration(req.user.id, req.body.type);
    
    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }
    
    if (integration.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    await storage.deleteIntegration(parseInt(id));
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
