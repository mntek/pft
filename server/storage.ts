import { users, creditCards, assets, incomes, expenses, passwordResetTokens, notifications } from "@shared/schema";
import type { 
  User, InsertUser, 
  CreditCard, InsertCreditCard, 
  Asset, InsertAsset, 
  Income, InsertIncome, 
  Expense, InsertExpense,
  PasswordResetToken, InsertPasswordResetToken,
  Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Credit card methods
  getCreditCards(userId: number): Promise<CreditCard[]>;
  getCreditCard(id: number): Promise<CreditCard | undefined>;
  createCreditCard(card: InsertCreditCard): Promise<CreditCard>;
  updateCreditCard(id: number, card: Partial<InsertCreditCard>): Promise<CreditCard | undefined>;
  deleteCreditCard(id: number): Promise<boolean>;
  
  // Asset methods
  getAssets(userId: number): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Income methods
  getIncomes(userId: number): Promise<Income[]>;
  getIncome(id: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  
  // Expense methods
  getExpenses(userId: number): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Password reset methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Credit card due date notifications
  generateCreditCardDueNotifications(userId: number): Promise<Notification[]>;
  
  // Session store
  sessionStore: any; // Use any for session store to avoid TypeScript errors
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private creditCards: Map<number, CreditCard>;
  private assets: Map<number, Asset>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  
  sessionStore: any; // Use any for session store to avoid TypeScript errors
  
  // Counters for IDs
  private userIdCounter: number;
  private creditCardIdCounter: number;
  private assetIdCounter: number;
  private incomeIdCounter: number;
  private expenseIdCounter: number;

  constructor() {
    this.users = new Map();
    this.creditCards = new Map();
    this.assets = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    
    this.userIdCounter = 1;
    this.creditCardIdCounter = 1;
    this.assetIdCounter = 1;
    this.incomeIdCounter = 1;
    this.expenseIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Credit card methods
  async getCreditCards(userId: number): Promise<CreditCard[]> {
    return Array.from(this.creditCards.values()).filter(
      card => card.userId === userId
    );
  }

  async getCreditCard(id: number): Promise<CreditCard | undefined> {
    return this.creditCards.get(id);
  }

  async createCreditCard(card: InsertCreditCard): Promise<CreditCard> {
    const id = this.creditCardIdCounter++;
    const newCard: CreditCard = { ...card, id };
    this.creditCards.set(id, newCard);
    return newCard;
  }

  async updateCreditCard(id: number, updates: Partial<InsertCreditCard>): Promise<CreditCard | undefined> {
    const card = this.creditCards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...updates };
    this.creditCards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCreditCard(id: number): Promise<boolean> {
    return this.creditCards.delete(id);
  }

  // Asset methods
  async getAssets(userId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      asset => asset.userId === userId
    );
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = this.assetIdCounter++;
    // Make sure institution is never undefined to match the Asset type
    const newAsset: Asset = { 
      ...asset, 
      id,
      institution: asset.institution ?? null 
    };
    this.assets.set(id, newAsset);
    return newAsset;
  }

  async updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;
    
    const updatedAsset = { ...asset, ...updates };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Income methods
  async getIncomes(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      income => income.userId === userId
    );
  }

  async getIncome(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    const id = this.incomeIdCounter++;
    const newIncome: Income = { ...income, id };
    this.incomes.set(id, newIncome);
    return newIncome;
  }

  async updateIncome(id: number, updates: Partial<InsertIncome>): Promise<Income | undefined> {
    const income = this.incomes.get(id);
    if (!income) return undefined;
    
    const updatedIncome = { ...income, ...updates };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }

  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }

  // Expense methods
  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => expense.userId === userId
    );
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const newExpense: Expense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // New methods for password reset
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  // Password reset token methods
  private passwordResetTokens = new Map<number, PasswordResetToken>();
  private passwordResetTokenIdCounter = 1;
  
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const id = this.passwordResetTokenIdCounter++;
    const newToken: PasswordResetToken = { 
      ...token, 
      id, 
      createdAt: new Date(),
      used: token.used ?? false, // Ensure used is a boolean, not undefined
    };
    this.passwordResetTokens.set(id, newToken);
    return newToken;
  }
  
  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return Array.from(this.passwordResetTokens.values()).find(
      (resetToken) => resetToken.token === token && !resetToken.used
    );
  }
  
  async markPasswordResetTokenAsUsed(id: number): Promise<boolean> {
    const resetToken = this.passwordResetTokens.get(id);
    if (!resetToken) return false;
    
    const updatedToken = { ...resetToken, used: true };
    this.passwordResetTokens.set(id, updatedToken);
    return true;
  }

  // Notification methods
  private notifications = new Map<number, Notification>();
  private notificationIdCounter = 1;

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId && !notif.isRead)
      .length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return true;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(notif => notif.userId === userId && !notif.isRead);
    
    for (const notification of userNotifications) {
      this.notifications.set(notification.id, { ...notification, isRead: true });
    }
    
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async generateCreditCardDueNotifications(userId: number): Promise<Notification[]> {
    // Get the user's credit cards
    const cards = await this.getCreditCards(userId);
    const today = new Date();
    const createdNotifications: Notification[] = [];

    // Check each card for upcoming due dates
    for (const card of cards) {
      let dueDate = new Date(card.dueDate);
      
      // If the due date is in the past, adjust to the next month
      if (dueDate < today) {
        dueDate = new Date(dueDate);
        dueDate.setMonth(dueDate.getMonth() + 1);
      }
      
      // Calculate days until due date
      const diffTime = Math.abs(dueDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Create notification if due date is within 5 days
      if (diffDays <= 5) {
        // Check if a notification already exists for this card and due date
        const existingNotifications = Array.from(this.notifications.values())
          .filter(n => 
            n.userId === userId && 
            n.relatedTo === 'credit_card' && 
            n.relatedId === card.id
          );
        
        // Only create a new notification if one doesn't already exist for this card in the last 24 hours
        const lastDayNotification = existingNotifications.find(n => {
          const notifDate = new Date(n.createdAt);
          const dayDiff = Math.abs(today.getTime() - notifDate.getTime()) / (1000 * 60 * 60 * 24);
          return dayDiff < 1;
        });

        if (!lastDayNotification) {
          // Create a notification
          const notification: InsertNotification = {
            userId,
            title: 'Credit Card Payment Due Soon',
            message: `Your ${card.name} credit card payment is due in ${diffDays} day${diffDays === 1 ? '' : 's'}.`,
            type: 'warning',
            relatedTo: 'credit_card',
            relatedId: card.id,
            isRead: false
          };
          
          const newNotification = await this.createNotification(notification);
          createdNotifications.push(newNotification);
        }
      }
    }
    
    return createdNotifications;
  }
}

// Import DatabaseStorage
import { DatabaseStorage } from "./database-storage";

// Comment out MemStorage for now - keep as a fallback
// export const storage = new MemStorage();

// Use DatabaseStorage
export const storage = new DatabaseStorage();
