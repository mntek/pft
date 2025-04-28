import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCreditCardSchema, 
  insertAssetSchema,
  insertIncomeSchema,
  insertExpenseSchema
} from "@shared/schema";
import { z } from "zod";

// Middleware to ensure user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Credit Card Routes
  app.get("/api/credit-cards", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const creditCards = await storage.getCreditCards(userId);
      res.json(creditCards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit cards" });
    }
  });

  app.post("/api/credit-cards", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertCreditCardSchema.parse({ ...req.body, userId });
      const creditCard = await storage.createCreditCard(validatedData);
      res.status(201).json(creditCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit card" });
    }
  });

  app.put("/api/credit-cards/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify card belongs to user
      const card = await storage.getCreditCard(id);
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      
      const validatedData = insertCreditCardSchema.partial().parse(req.body);
      const updatedCard = await storage.updateCreditCard(id, validatedData);
      if (!updatedCard) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.json(updatedCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit card" });
    }
  });

  app.delete("/api/credit-cards/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify card belongs to user
      const card = await storage.getCreditCard(id);
      if (!card || card.userId !== userId) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      
      const success = await storage.deleteCreditCard(id);
      if (!success) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit card" });
    }
  });

  // Asset Routes
  app.get("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const assets = await storage.getAssets(userId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertAssetSchema.parse({ ...req.body, userId });
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.put("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify asset belongs to user
      const asset = await storage.getAsset(id);
      if (!asset || asset.userId !== userId) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const validatedData = insertAssetSchema.partial().parse(req.body);
      const updatedAsset = await storage.updateAsset(id, validatedData);
      if (!updatedAsset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(updatedAsset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify asset belongs to user
      const asset = await storage.getAsset(id);
      if (!asset || asset.userId !== userId) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const success = await storage.deleteAsset(id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Income Routes
  app.get("/api/incomes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const incomes = await storage.getIncomes(userId);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });

  app.post("/api/incomes", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertIncomeSchema.parse({ ...req.body, userId });
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  app.put("/api/incomes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify income belongs to user
      const income = await storage.getIncome(id);
      if (!income || income.userId !== userId) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      const validatedData = insertIncomeSchema.partial().parse(req.body);
      const updatedIncome = await storage.updateIncome(id, validatedData);
      if (!updatedIncome) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.json(updatedIncome);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update income" });
    }
  });

  app.delete("/api/incomes/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify income belongs to user
      const income = await storage.getIncome(id);
      if (!income || income.userId !== userId) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      const success = await storage.deleteIncome(id);
      if (!success) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense Routes
  app.get("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const expenses = await storage.getExpenses(userId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertExpenseSchema.parse({ ...req.body, userId });
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify expense belongs to user
      const expense = await storage.getExpense(id);
      if (!expense || expense.userId !== userId) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(id, validatedData);
      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Verify expense belongs to user
      const expense = await storage.getExpense(id);
      if (!expense || expense.userId !== userId) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Dashboard summary endpoint
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Get all necessary data
      const [creditCards, assets, incomes, expenses] = await Promise.all([
        storage.getCreditCards(userId),
        storage.getAssets(userId),
        storage.getIncomes(userId),
        storage.getExpenses(userId)
      ]);
      
      // Calculate totals
      const totalDebt = creditCards.reduce((sum, card) => sum + Number(card.currentBalance), 0);
      const totalAssets = assets.reduce((sum, asset) => sum + Number(asset.amount), 0);
      
      const fixedIncome = incomes
        .filter(income => income.type === 'fixed')
        .reduce((sum, income) => sum + Number(income.amount), 0);
      
      const additionalIncome = incomes
        .filter(income => income.type === 'additional')
        .reduce((sum, income) => sum + Number(income.amount), 0);
      
      const totalIncome = fixedIncome + additionalIncome;
      
      // Get recent expenses (last 5)
      const recentExpenses = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      res.json({
        totalDebt,
        totalAssets,
        fixedIncome,
        additionalIncome,
        totalIncome,
        creditCards,
        recentExpenses
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  
  // User Profile Update
  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate incoming data
      const userUpdateSchema = z.object({
        username: z.string().min(3).optional(),
        email: z.string().email().optional(),
      });
      
      const validatedData = userUpdateSchema.parse(req.body);
      
      // If username is being updated, check if it's already taken
      if (validatedData.username) {
        const existingUser = await storage.getUserByUsername(validatedData.username);
        if (existingUser && existingUser.id !== userId) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Password Update
  app.post("/api/user/password", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate incoming data
      const passwordUpdateSchema = z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      });
      
      const validatedData = passwordUpdateSchema.parse(req.body);
      
      // Get current user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Import password functions
      const auth = await import("./auth");
      
      // Verify current password
      const isPasswordValid = await auth.comparePasswords(validatedData.currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await auth.hashPassword(validatedData.newPassword);
      
      // Update password
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
