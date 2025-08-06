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
  paymentFrequency: text("payment_frequency").default("monthly"), // monthly, biweekly, weekly
  accountOpeningDate: date("account_opening_date"),
  introAprEndDate: date("intro_apr_end_date"),
  annualFee: decimal("annual_fee", { precision: 10, scale: 2 }).default("0"),
  lateFees: decimal("late_fees", { precision: 10, scale: 2 }).default("0"),
  promotionalOffers: text("promotional_offers"),
  utilizationThreshold: decimal("utilization_threshold", { precision: 5, scale: 2 }).default("30"), // recommended utilization %
  lastPaymentDate: date("last_payment_date"),
  interestAccrued: decimal("interest_accrued", { precision: 10, scale: 2 }).default("0"),
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
  paymentFrequency: text("payment_frequency").default("monthly"), // monthly, biweekly, weekly
  accountOpeningDate: date("account_opening_date"),
  targetPayoffDate: date("target_payoff_date"),
  payoffStrategy: text("payoff_strategy").default("standard"), // snowball, avalanche, custom
  earlyPayoffPenalty: boolean("early_payoff_penalty").default(false),
  lastPaymentDate: date("last_payment_date"),
  interestAccrued: decimal("interest_accrued", { precision: 10, scale: 2 }).default("0"),
  principalPaid: decimal("principal_paid", { precision: 10, scale: 2 }).default("0"),
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
  incomeType: text("income_type").default("active"), // active, passive, side_hustle, investments
  grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  taxWithheld: decimal("tax_withheld", { precision: 10, scale: 2 }).default("0"),
  isRecurring: boolean("is_recurring").default(true),
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
  tags: text("tags"), // JSON string of tags like "Business", "Medical", "Pet", "Vacation"
  taxDeductible: boolean("tax_deductible").default(false),
  businessExpense: boolean("business_expense").default(false),
  receiptUrl: text("receipt_url"), // For storing receipt images/documents
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Savings Goals and Financial Targets
export const savingsGoals = pgTable("savings_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalName: text("goal_name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  targetDate: date("target_date"),
  goalType: text("goal_type").notNull(), // emergency_fund, vacation, house, car, retirement
  monthlyContribution: decimal("monthly_contribution", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Budget Categories and Allocation
export const budgets = pgTable("budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  monthlyAllocation: decimal("monthly_allocation", { precision: 10, scale: 2 }).notNull(),
  currentSpent: decimal("current_spent", { precision: 10, scale: 2 }).default("0"),
  budgetMonth: text("budget_month").notNull(), // YYYY-MM format
  alertThreshold: decimal("alert_threshold", { precision: 5, scale: 2 }).default("80"), // % of budget
  isActive: boolean("is_active").default(true),
});

// Investment Accounts and Holdings
export const investments = pgTable("investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // 401k, ira, roth_ira, brokerage, crypto
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  contributionAmount: decimal("contribution_amount", { precision: 10, scale: 2 }).default("0"),
  contributionFrequency: text("contribution_frequency").default("monthly"),
  employerMatch: decimal("employer_match", { precision: 5, scale: 2 }).default("0"), // % match
  riskLevel: text("risk_level").default("moderate"), // conservative, moderate, aggressive
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).default("7"), // % annual
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Comprehensive Assets for Net Worth Calculation
export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetName: text("asset_name").notNull(),
  assetType: text("asset_type").notNull(), // cash_liquid, investments, real_estate, vehicles, personal_property, business, receivables
  subcategory: text("subcategory"), // checking, savings, emergency_fund, stocks, crypto, primary_home, rental_property, auto, jewelry, etc.
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 15, scale: 2 }),
  purchaseDate: date("purchase_date"),
  appreciationRate: decimal("appreciation_rate", { precision: 5, scale: 2 }).default("0"), // % annual
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }).default("0"), // % annual for vehicles
  ownershipPercentage: decimal("ownership_percentage", { precision: 5, scale: 2 }).default("100"),
  isLiquid: boolean("is_liquid").default(false),
  institution: text("institution"), // bank name, brokerage, etc.
  accountNumber: text("account_number"),
  maturityDate: date("maturity_date"), // for CDs, bonds
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }), // % annual
  riskLevel: text("risk_level"), // conservative, moderate, aggressive
  marketValue: decimal("market_value", { precision: 15, scale: 2 }), // current market value if different from book value
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comprehensive Liabilities for Net Worth Calculation
export const liabilities = pgTable("liabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liabilityName: text("liability_name").notNull(),
  liabilityType: text("liability_type").notNull(), // consumer_debt, vehicle_loans, real_estate, education, business, taxes_bills
  subcategory: text("subcategory"), // credit_card, bnpl, auto_loan, mortgage, heloc, student_loan, business_loan, unpaid_taxes, medical_bills
  currentBalance: decimal("current_balance", { precision: 15, scale: 2 }).notNull(),
  originalAmount: decimal("original_amount", { precision: 15, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }),
  monthlyPayment: decimal("monthly_payment", { precision: 10, scale: 2 }),
  dueDate: date("due_date"),
  paymentFrequency: text("payment_frequency").default("monthly"),
  lender: text("lender"), // institution name
  accountNumber: text("account_number"),
  loanTerm: integer("loan_term"), // total months
  remainingTerm: integer("remaining_term"), // months left
  payoffStrategy: text("payoff_strategy"), // minimum, avalanche, snowball
  isSecured: boolean("is_secured").default(false),
  collateral: text("collateral"), // what secures the loan
  taxDeductible: boolean("tax_deductible").default(false),
  creditLimit: decimal("credit_limit", { precision: 15, scale: 2 }), // for credit cards/lines of credit
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Net Worth Snapshots for historical tracking
export const netWorthSnapshots = pgTable("net_worth_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  snapshotDate: date("snapshot_date").notNull(),
  totalAssets: decimal("total_assets", { precision: 15, scale: 2 }).notNull(),
  totalLiabilities: decimal("total_liabilities", { precision: 15, scale: 2 }).notNull(),
  netWorth: decimal("net_worth", { precision: 15, scale: 2 }).notNull(),
  buyingPower: decimal("buying_power", { precision: 15, scale: 2 }).notNull().default("0"),
  // Asset category breakdowns
  cashLiquidAssets: decimal("cash_liquid_assets", { precision: 15, scale: 2 }).default("0"),
  investmentAssets: decimal("investment_assets", { precision: 15, scale: 2 }).default("0"),
  realEstateAssets: decimal("real_estate_assets", { precision: 15, scale: 2 }).default("0"),
  vehicleAssets: decimal("vehicle_assets", { precision: 15, scale: 2 }).default("0"),
  personalPropertyAssets: decimal("personal_property_assets", { precision: 15, scale: 2 }).default("0"),
  businessAssets: decimal("business_assets", { precision: 15, scale: 2 }).default("0"),
  // Liability category breakdowns
  consumerDebt: decimal("consumer_debt", { precision: 15, scale: 2 }).default("0"),
  vehicleLoans: decimal("vehicle_loans", { precision: 15, scale: 2 }).default("0"),
  realEstateDebt: decimal("real_estate_debt", { precision: 15, scale: 2 }).default("0"),
  educationDebt: decimal("education_debt", { precision: 15, scale: 2 }).default("0"),
  businessDebt: decimal("business_debt", { precision: 15, scale: 2 }).default("0"),
  taxesBills: decimal("taxes_bills", { precision: 15, scale: 2 }).default("0"),
  // Changes over time
  monthOverMonthChange: decimal("month_over_month_change", { precision: 15, scale: 2 }),
  yearOverYearChange: decimal("year_over_year_change", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSavingsGoalSchema = createInsertSchema(savingsGoals).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
  lastUpdated: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertLiabilitySchema = createInsertSchema(liabilities).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertNetWorthSnapshotSchema = createInsertSchema(netWorthSnapshots).omit({
  id: true,
  createdAt: true,
});

export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertLiability = z.infer<typeof insertLiabilitySchema>;
export type Liability = typeof liabilities.$inferSelect;
export type InsertNetWorthSnapshot = z.infer<typeof insertNetWorthSnapshotSchema>;
export type NetWorthSnapshot = typeof netWorthSnapshots.$inferSelect;
