import { pgTable, text, serial, integer, boolean, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  defaultCurrency: text("default_currency").default("USD").notNull(),
});

// Relations will be defined after all tables

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  defaultCurrency: true,
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
  currency: text("currency").default("USD").notNull(),
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
  currency: text("currency").default("USD").notNull(),
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
  currency: text("currency").default("USD").notNull(),
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

// Password reset token schema
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Define relations after all tables are declared
export const usersRelations = relations(users, ({ many }) => ({
  creditCards: many(creditCards),
  assets: many(assets),
  incomes: many(incomes),
  expenses: many(expenses),
  passwordResetTokens: many(passwordResetTokens),
}));

export const creditCardsRelations = relations(creditCards, ({ one }) => ({
  user: one(users, {
    fields: [creditCards.userId],
    references: [users.id],
  }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
  user: one(users, {
    fields: [incomes.userId],
    references: [users.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'success', 'error'
  relatedTo: text("related_to"), // 'credit_card', 'asset', 'income', 'expense'
  relatedId: integer("related_id"), // ID of the related item
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Exchange rates schema
export const exchangeRates = pgTable("exchange_rates", {
  id: serial("id").primaryKey(),
  fromCurrency: text("from_currency").notNull(),
  toCurrency: text("to_currency").notNull(),
  rate: numeric("rate").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
});

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
