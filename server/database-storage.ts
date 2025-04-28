import { eq } from "drizzle-orm";
import { db } from "./db";
import { users, creditCards, assets, incomes, expenses, passwordResetTokens } from "@shared/schema";
import type { 
  User, InsertUser, 
  CreditCard, InsertCreditCard, 
  Asset, InsertAsset, 
  Income, InsertIncome, 
  Expense, InsertExpense,
  PasswordResetToken, InsertPasswordResetToken
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
}