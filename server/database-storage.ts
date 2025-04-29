import { eq, and, lt, gte, desc } from "drizzle-orm";
import { db } from "./db";
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
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { IStorage } from "./storage";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  // Credit card methods
  async getCreditCards(userId: number): Promise<CreditCard[]> {
    return await db.select().from(creditCards).where(eq(creditCards.userId, userId));
  }

  async getCreditCard(id: number): Promise<CreditCard | undefined> {
    const result = await db.select().from(creditCards).where(eq(creditCards.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createCreditCard(card: InsertCreditCard): Promise<CreditCard> {
    const result = await db.insert(creditCards).values(card).returning();
    return result[0];
  }

  async updateCreditCard(id: number, updates: Partial<InsertCreditCard>): Promise<CreditCard | undefined> {
    const result = await db
      .update(creditCards)
      .set(updates)
      .where(eq(creditCards.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteCreditCard(id: number): Promise<boolean> {
    const result = await db.delete(creditCards).where(eq(creditCards.id, id));
    return true; // Always return true as the delete operation succeeded even if no rows were deleted
  }

  // Asset methods
  async getAssets(userId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const result = await db.select().from(assets).where(eq(assets.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const result = await db.insert(assets).values(asset).returning();
    return result[0];
  }

  async updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const result = await db
      .update(assets)
      .set(updates)
      .where(eq(assets.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteAsset(id: number): Promise<boolean> {
    const result = await db.delete(assets).where(eq(assets.id, id));
    return true; // Always return true as the delete operation succeeded even if no rows were deleted
  }

  // Income methods
  async getIncomes(userId: number): Promise<Income[]> {
    return await db.select().from(incomes).where(eq(incomes.userId, userId));
  }

  async getIncome(id: number): Promise<Income | undefined> {
    const result = await db.select().from(incomes).where(eq(incomes.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    const result = await db.insert(incomes).values(income).returning();
    return result[0];
  }

  async updateIncome(id: number, updates: Partial<InsertIncome>): Promise<Income | undefined> {
    const result = await db
      .update(incomes)
      .set(updates)
      .where(eq(incomes.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteIncome(id: number): Promise<boolean> {
    const result = await db.delete(incomes).where(eq(incomes.id, id));
    return true; // Always return true as the delete operation succeeded even if no rows were deleted
  }

  // Expense methods
  async getExpenses(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const result = await db.select().from(expenses).where(eq(expenses.id, id));
    return result.length > 0 ? result[0] : undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const result = await db.insert(expenses).values(expense).returning();
    return result[0];
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const result = await db
      .update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return true; // Always return true as the delete operation succeeded even if no rows were deleted
  }

  // User methods for password reset
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : undefined;
  }

  // Password reset token methods
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const result = await db.insert(passwordResetTokens).values(token).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    
    return result.length > 0 ? result[0] : undefined;
  }

  async markPasswordResetTokenAsUsed(id: number): Promise<boolean> {
    const result = await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .returning();
    
    return true; // We always return true as the operation succeeded
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return true; // Always return true as the delete operation succeeded
  }

  // Credit card due date notifications
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
        const existingNotifications = await db
          .select()
          .from(notifications)
          .where(and(
            eq(notifications.userId, userId),
            eq(notifications.relatedTo, 'credit_card'),
            eq(notifications.relatedId, card.id)
          ));
        
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