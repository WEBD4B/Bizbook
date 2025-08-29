// Shared TypeScript types for KashGrip application
// This file defines the types that are shared between frontend and backend

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreditCard {
  id: string;
  userId: string;
  cardName: string;
  lastFourDigits?: string;
  creditLimit?: number;
  balance?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  statementBalance?: number;
  availableCredit?: number;
  rewardsProgram?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Loan {
  id: string;
  userId: string;
  loanName: string;
  loanType: string;
  originalAmount?: number;
  currentBalance: number;
  interestRate?: number;
  monthlyPayment?: number;
  minimumPayment?: number;
  dueDate?: string;
  lender?: string;
  termLength?: number;
  remainingTerm?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlyPayment {
  id: string;
  userId: string;
  accountId: string;
  accountType: string;
  paymentName: string;
  amount: number;
  dueDate?: string;
  isRecurring?: boolean;
  frequency?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Income {
  id: string;
  userId: string;
  source: string;
  incomeType: string;
  amount: number;
  frequency: string;
  nextPayDate?: string;
  isActive?: boolean;
  taxable?: boolean;
  category?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  id: string;
  userId: string;
  accountId: string;
  accountType: string;
  amount: number;
  paymentDate: string;
  paymentMethod?: string;
  confirmationNumber?: string;
  status?: 'pending' | 'paid' | 'failed' | 'cancelled';
  paidDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  expenseDate: string;
  paymentMethod?: string;
  merchant?: string;
  isRecurring?: boolean;
  frequency?: string;
  paymentType?: 'subscription' | 'one-time';
  paidFromIncomeId?: string;
  paidFromIncome?: string;
  taxDeductible?: boolean;
  notes?: string;
  receiptUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  monthlyContribution?: number;
  targetDate?: string;
  priority?: string;
  category?: string;
  isActive?: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  budgetAmount: number;
  currentSpent?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  rollover?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Asset {
  id: string;
  userId: string;
  assetName: string;
  assetType: string;
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Investment {
  id: string;
  userId: string;
  investmentName: string;
  investmentType: string;
  symbol?: string;
  shares?: number;
  pricePerShare?: number;
  currentValue: number;
  purchasePrice?: number;
  purchaseDate?: string;
  maturityDate?: string;
  dividendYield?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Liability {
  id: string;
  userId: string;
  liabilityName: string;
  liabilityType: string;
  currentBalance: number;
  originalAmount?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NetWorthSnapshot {
  id: string;
  userId: string;
  snapshotDate: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  createdAt?: Date;
}

export interface BusinessCreditCard {
  id: string;
  userId: string;
  cardName: string;
  lastFourDigits?: string;
  creditLimit?: number;
  balance?: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: string;
  statementBalance?: number;
  availableCredit?: number;
  rewardsProgram?: string;
  businessName?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessLoan {
  id: string;
  userId: string;
  loanName: string;
  loanType: string;
  originalAmount?: number;
  currentBalance: number;
  interestRate?: number;
  monthlyPayment?: number;
  minimumPayment?: number;
  dueDate?: string;
  lender?: string;
  termLength?: number;
  remainingTerm?: number;
  businessName?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  expenseDate: string;
  paymentMethod?: string;
  merchant?: string;
  isRecurring?: boolean;
  frequency?: string;
  taxDeductible?: boolean;
  notes?: string;
  receiptUrl?: string;
  businessName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BusinessRevenue {
  id: string;
  userId: string;
  source: string;
  amount: number;
  revenueDate: string;
  category?: string;
  description?: string;
  businessName?: string;
  taxable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Insert types for creating new records
export type InsertCreditCard = Omit<CreditCard, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertLoan = Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertMonthlyPayment = Omit<MonthlyPayment, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertIncome = Omit<Income, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertPayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertExpense = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertSavingsGoal = Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBudget = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertAsset = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertInvestment = Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertLiability = Omit<Liability, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertNetWorthSnapshot = Omit<NetWorthSnapshot, 'id' | 'createdAt'>;
export type InsertBusinessCreditCard = Omit<BusinessCreditCard, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBusinessLoan = Omit<BusinessLoan, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBusinessExpense = Omit<BusinessExpense, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBusinessRevenue = Omit<BusinessRevenue, 'id' | 'createdAt' | 'updatedAt'>;

// Import Zod for validation - This will work since zod is in frontend package.json
import { z } from 'zod';

// Schema validation objects
export const insertCreditCardSchema = z.object({
  userId: z.string().uuid().optional(),
  cardName: z.string().min(1, "Card name is required"),
  lastFourDigits: z.string().optional(),
  creditLimit: z.number().optional(),
  balance: z.number().optional(),
  interestRate: z.number().optional(),
  minimumPayment: z.number().optional(),
  dueDate: z.string().optional(),
  statementBalance: z.number().optional(),
  availableCredit: z.number().optional(),
  rewardsProgram: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertLoanSchema = z.object({
  userId: z.string().uuid().optional(),
  loanName: z.string().min(1, "Loan name is required"),
  loanType: z.string().min(1, "Loan type is required"),
  originalAmount: z.number().optional(),
  currentBalance: z.number().min(0, "Current balance must be non-negative"),
  interestRate: z.number().optional(),
  monthlyPayment: z.number().optional(),
  minimumPayment: z.number().optional(),
  dueDate: z.string().optional(),
  lender: z.string().optional(),
  termLength: z.number().optional(),
  remainingTerm: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertExpenseSchema = z.object({
  userId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  expenseDate: z.string().min(1, "Date is required"),
  paymentMethod: z.string().optional(),
  merchant: z.string().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.string().optional(),
  paymentType: z.enum(['subscription', 'one-time']).optional(),
  paidFromIncomeId: z.string().uuid().optional(),
  paidFromIncome: z.string().optional(),
  taxDeductible: z.boolean().optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

export const insertAssetSchema = z.object({
  userId: z.string().uuid().optional(),
  assetName: z.string().min(1, "Asset name is required"),
  assetType: z.string().min(1, "Asset type is required"),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertInvestmentSchema = z.object({
  userId: z.string().uuid().optional(),
  investmentName: z.string().min(1, "Investment name is required"),
  investmentType: z.string().min(1, "Investment type is required"),
  symbol: z.string().optional(),
  shares: z.number().optional(),
  pricePerShare: z.number().optional(),
  currentValue: z.number().min(0, "Current value must be non-negative"),
  purchasePrice: z.number().optional(),
  purchaseDate: z.string().optional(),
  maturityDate: z.string().optional(),
  dividendYield: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const insertLiabilitySchema = z.object({
  userId: z.string().uuid().optional(),
  liabilityName: z.string().min(1, "Liability name is required"),
  liabilityType: z.string().min(1, "Liability type is required"),
  currentBalance: z.number().min(0, "Current balance must be non-negative"),
  originalAmount: z.number().optional(),
  interestRate: z.number().optional(),
  minimumPayment: z.number().optional(),
  dueDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const insertBudgetSchema = z.object({
  userId: z.string().uuid().optional(),
  category: z.string().min(1, "Category is required"),
  budgetAmount: z.number().min(0, "Budget amount must be non-negative"),
  currentSpent: z.number().optional(),
  period: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  rollover: z.boolean().optional(),
});

// Other placeholder schemas
export const insertMonthlyPaymentSchema = {} as any;
export const insertIncomeSchema = {} as any;
export const insertPaymentSchema = {} as any;
export const insertSavingsGoalSchema = {} as any;
export const insertNetWorthSnapshotSchema = {} as any;
export const insertBusinessCreditCardSchema = {} as any;
export const insertBusinessLoanSchema = {} as any;
export const insertBusinessExpenseSchema = {} as any;
export const insertBusinessRevenueSchema = {} as any;

// Payment status enum
export const PaymentStatus = {
  PENDING: 'pending' as const,
  PAID: 'paid' as const,
  FAILED: 'failed' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];
