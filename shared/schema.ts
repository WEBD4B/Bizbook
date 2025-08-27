// Shared TypeScript types for BizBook application
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

// Schema validation objects (can be used with zod or similar)
export const insertCreditCardSchema = {} as any; // Placeholder for zod schema
export const insertLoanSchema = {} as any;
export const insertMonthlyPaymentSchema = {} as any;
export const insertIncomeSchema = {} as any;
export const insertPaymentSchema = {} as any;
export const insertExpenseSchema = {} as any;
export const insertSavingsGoalSchema = {} as any;
export const insertBudgetSchema = {} as any;
export const insertAssetSchema = {} as any;
export const insertInvestmentSchema = {} as any;
export const insertLiabilitySchema = {} as any;
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
