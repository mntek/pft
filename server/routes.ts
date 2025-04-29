import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { randomBytes } from "crypto";
import { 
  insertCreditCardSchema, 
  insertAssetSchema,
  insertIncomeSchema,
  insertExpenseSchema,
  insertPasswordResetTokenSchema,
  insertExchangeRateSchema
} from "@shared/schema";
import { z } from "zod";
import { sendPasswordResetEmail } from "./email-service";
import { fetchLatestRates } from "./exchange-rate-service";
import { initializeWebSocketServer } from "./websocket-service";

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

  // Notifications API
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications count" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNotification(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  
  // Generate credit card due notifications and send via WebSocket
  app.post("/api/notifications/generate-due-notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const newNotifications = await storage.generateCreditCardDueNotifications(userId);
      
      // Send each notification via WebSocket
      const { notifyNewNotification } = await import("./websocket-service");
      for (const notification of newNotifications) {
        notifyNewNotification(userId, notification);
      }
      
      res.json({ success: true, count: newNotifications.length, notifications: newNotifications });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate notifications" });
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
  
  // Update Default Currency
  app.put("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Validate incoming data
      const currencyUpdateSchema = z.object({
        defaultCurrency: z.string().min(3).max(3),
      });
      
      const validatedData = currencyUpdateSchema.parse(req.body);
      
      // Update user's default currency
      const updatedUser = await storage.updateUser(userId, {
        defaultCurrency: validatedData.defaultCurrency
      });
      
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
      res.status(500).json({ message: "Failed to update default currency" });
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

  // Forgot Password - Request Password Reset
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const schema = z.object({
        email: z.string().email(),
      });

      const { email } = schema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist
        return res.json({ 
          message: "If your email is registered with us, you will receive a password reset link." 
        });
      }
      
      // Generate a random token
      const token = randomBytes(32).toString('hex');
      const now = new Date();
      
      // Token expires in 1 hour
      const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Create password reset token
      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });
      
      // Send password reset email
      const appBaseUrl = `${req.protocol}://${req.get('host')}`;
      const emailSent = await sendPasswordResetEmail(email, token, appBaseUrl);
      
      if (!emailSent) {
        return res.status(500).json({ message: "Failed to send password reset email" });
      }
      
      // Return success message
      res.json({ 
        message: "If your email is registered with us, you will receive a password reset link." 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  
  // Reset Password with Token
  app.post("/api/reset-password", async (req, res) => {
    try {
      const schema = z.object({
        token: z.string().min(1),
        password: z.string().min(6),
      });
      
      const { token, password } = schema.parse(req.body);
      
      // Find and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Check if token is expired
      const now = new Date();
      if (resetToken.expiresAt < now) {
        return res.status(400).json({ message: "Reset token has expired" });
      }
      
      // Check if token has been used
      if (resetToken.used) {
        return res.status(400).json({ message: "Reset token has already been used" });
      }
      
      // Get the user
      const user = await storage.getUser(resetToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Import password functions
      const auth = await import("./auth");
      
      // Hash the new password
      const hashedPassword = await auth.hashPassword(password);
      
      // Update the user's password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Mark the token as used
      await storage.markPasswordResetTokenAsUsed(resetToken.id);
      
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Exchange Rate Routes
  app.get("/api/exchange-rates", async (req, res) => {
    try {
      let rates = await storage.getExchangeRates();
      
      // Seed default USD rate if none exist
      if (rates.length === 0) {
        // Only seed USD to USD conversion as a fallback
        await storage.createExchangeRate({
          fromCurrency: 'USD',
          toCurrency: 'USD',
          rate: '1.0',
          lastUpdated: new Date()
        });
        
        // Fetch the newly created rate
        rates = await storage.getExchangeRates();
        
        // Force a refresh of exchange rates
        fetchLatestRates();
      }
      
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rates" });
    }
  });

  app.get("/api/exchange-rates/:fromCurrency/:toCurrency", async (req, res) => {
    try {
      const { fromCurrency, toCurrency } = req.params;
      const rate = await storage.getExchangeRate(fromCurrency, toCurrency);
      
      if (!rate) {
        return res.status(404).json({ message: "Exchange rate not found" });
      }
      
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  app.post("/api/exchange-rates", isAuthenticated, async (req, res) => {
    try {
      // Only admin users should be able to create/update exchange rates
      // For simplicity, we're just checking if the user is authenticated
      const validatedData = insertExchangeRateSchema.parse(req.body);
      const rate = await storage.createExchangeRate(validatedData);
      res.status(201).json(rate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exchange rate" });
    }
  });

  app.put("/api/exchange-rates/:id", isAuthenticated, async (req, res) => {
    try {
      // Only admin users should be able to create/update exchange rates
      // For simplicity, we're just checking if the user is authenticated
      const id = parseInt(req.params.id);
      
      const validatedData = insertExchangeRateSchema.partial().parse(req.body);
      const updatedRate = await storage.updateExchangeRate(id, validatedData);
      
      if (!updatedRate) {
        return res.status(404).json({ message: "Exchange rate not found" });
      }
      
      res.json(updatedRate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update exchange rate" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = initializeWebSocketServer(httpServer);
  
  return httpServer;
}
