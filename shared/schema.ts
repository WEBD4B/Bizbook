import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, date, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const creditCards = pgTable("credit_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }).notNull(),
  dueDate: integer("due_date").notNull(), // day of month (1-31)
});

export const loans = pgTable("loans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }).notNull(),
  termMonths: integer("term_months").notNull(),
  dueDate: integer("due_date").notNull(), // day of month (1-31)
  loanType: text("loan_type").notNull(), // 'personal', 'auto', 'student', 'mortgage'
});

export const monthlyPayments = pgTable("monthly_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: integer("due_date").notNull(), // day of month (1-31)
  paymentType: text("payment_type").notNull(), // 'auto_loan', 'insurance', 'utilities', 'other'
  isRecurring: boolean("is_recurring").default(true),
});

export const income = pgTable("income", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(), // 'weekly', 'biweekly', 'monthly', 'yearly'
  nextPayDate: date("next_pay_date").notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull(),
  accountType: text("account_type").notNull(), // 'credit_card', 'loan', 'monthly_payment'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: date("payment_date").notNull(),
  notes: text("notes"),
});

export const insertCreditCardSchema = createInsertSchema(creditCards).omit({
  id: true,
});

export const insertLoanSchema = createInsertSchema(loans).omit({
  id: true,
});

export const insertMonthlyPaymentSchema = createInsertSchema(monthlyPayments).omit({
  id: true,
});

export const insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
});

export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type CreditCard = typeof creditCards.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loans.$inferSelect;
export type InsertMonthlyPayment = z.infer<typeof insertMonthlyPaymentSchema>;
export type MonthlyPayment = typeof monthlyPayments.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof income.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Users table for future auth implementation
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Expense tracking for individual purchases and bills
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: text("amount").notNull(), // Store as string to preserve precision
  category: text("category").notNull(), // utilities, groceries, gas, entertainment, etc
  expenseDate: date("expense_date").notNull(),
  paymentMethod: text("payment_method"), // cash, credit-card, debit-card, check
  notes: text("notes"),
  isRecurring: boolean("is_recurring").default(false), // Track if this is a recurring expense
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
