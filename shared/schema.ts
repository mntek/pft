import { pgTable, text, serial, integer, boolean, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Credit card schema
export const creditCards = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  bank: text("bank").notNull(),
  creditLimit: numeric("credit_limit").notNull(),
  statementDate: date("statement_date").notNull(),
  dueDate: date("due_date").notNull(),
  minPaymentPercent: numeric("min_payment_percent").notNull(),
  currentBalance: numeric("current_balance").notNull(),
  color: text("color").notNull(),
});

export const insertCreditCardSchema = createInsertSchema(creditCards).omit({
  id: true,
});

// Asset schema
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bank' or 'non-bank'
  assetType: text("asset_type").notNull(), // Checking, Savings, Time Deposit, Stocks, Cash, Crypto, etc.
  institution: text("institution"), // Bank name or location
  currency: text("currency").notNull(),
  amount: numeric("amount").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
});

// Income schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  source: text("source").notNull(),
  type: text("type").notNull(), // 'fixed' or 'additional'
  amount: numeric("amount").notNull(),
  date: date("date").notNull(),
});

export const insertIncomeSchema = createInsertSchema(incomes).omit({
  id: true,
});

// Expense schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount").notNull(),
  date: date("date").notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CreditCard = typeof creditCards.$inferSelect;
export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
