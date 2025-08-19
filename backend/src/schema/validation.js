import { z } from 'zod';

// User schemas
export const insertUserSchema = z.object({
  username: z.string().min(3).max(255),
  email: z.string().email(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  passwordHash: z.string().min(6),
  isActive: z.boolean().default(true),
});

// Credit Card schemas
export const insertCreditCardSchema = z.object({
  userId: z.string().uuid().optional(),
  cardName: z.string().min(1).max(255),
  lastFourDigits: z.string().length(4).optional(),
  creditLimit: z.string().optional(),
  balance: z.string().default('0'),
  interestRate: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDate: z.string().optional(),
  statementBalance: z.string().optional(),
  availableCredit: z.string().optional(),
  rewardsProgram: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
});

// Loan schemas
export const insertLoanSchema = z.object({
  userId: z.string().uuid().optional(),
  loanName: z.string().min(1).max(255),
  loanType: z.string().min(1).max(50),
  originalAmount: z.string().optional(),
  currentBalance: z.string(),
  interestRate: z.string().optional(),
  monthlyPayment: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDate: z.string().optional(),
  lender: z.string().max(255).optional(),
  termLength: z.number().int().optional(),
  remainingTerm: z.number().int().optional(),
  isActive: z.boolean().default(true),
});

// Monthly Payment schemas
export const insertMonthlyPaymentSchema = z.object({
  userId: z.string().uuid().optional(),
  accountId: z.string().uuid(),
  accountType: z.string().min(1).max(50),
  paymentName: z.string().min(1).max(255),
  amount: z.string(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().default(true),
  frequency: z.string().max(20).default('monthly'),
  isActive: z.boolean().default(true),
});

// Income schemas
export const insertIncomeSchema = z.object({
  userId: z.string().uuid().optional(),
  source: z.string().min(1).max(255),
  incomeType: z.string().min(1).max(50),
  amount: z.string(),
  frequency: z.string().min(1).max(20),
  nextPayDate: z.string().optional(),
  isActive: z.boolean().default(true),
  taxable: z.boolean().default(true),
  category: z.string().max(100).optional(),
  notes: z.string().optional(),
});

// Payment schemas
export const insertPaymentSchema = z.object({
  userId: z.string().uuid().optional(),
  accountId: z.string().uuid(),
  accountType: z.string().min(1).max(50),
  amount: z.string(),
  paymentDate: z.string(),
  paymentMethod: z.string().max(50).optional(),
  confirmationNumber: z.string().max(100).optional(),
  notes: z.string().optional(),
});

// Expense schemas
export const insertExpenseSchema = z.object({
  userId: z.string().uuid().optional(),
  description: z.string().min(1).max(255),
  amount: z.string(),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  expenseDate: z.string(),
  paymentMethod: z.string().max(50).optional(),
  merchant: z.string().max(255).optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.string().max(20).optional(),
  taxDeductible: z.boolean().default(false),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
});

// Savings Goal schemas
export const insertSavingsGoalSchema = z.object({
  userId: z.string().uuid().optional(),
  goalName: z.string().min(1).max(255),
  targetAmount: z.string(),
  currentAmount: z.string().default('0'),
  monthlyContribution: z.string().default('0'),
  targetDate: z.string().optional(),
  priority: z.string().max(20).default('medium'),
  category: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

// Budget schemas
export const insertBudgetSchema = z.object({
  userId: z.string().uuid().optional(),
  category: z.string().min(1).max(100),
  budgetAmount: z.string(),
  currentSpent: z.string().default('0'),
  period: z.string().max(20).default('monthly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  alertThreshold: z.string().default('80'),
  isActive: z.boolean().default(true),
  rollover: z.boolean().default(false),
});

// Investment schemas
export const insertInvestmentSchema = z.object({
  userId: z.string().uuid().optional(),
  accountName: z.string().min(1).max(255),
  accountType: z.string().min(1).max(50),
  institution: z.string().max(255).optional(),
  currentValue: z.string(),
  contributionAmount: z.string().default('0'),
  contributionFrequency: z.string().max(20).default('monthly'),
  employerMatch: z.string().default('0'),
  vestingSchedule: z.string().max(255).optional(),
  riskLevel: z.string().max(20).default('moderate'),
  expectedReturn: z.string().default('7'),
  maturityDate: z.string().optional(),
  autoRebalance: z.boolean().default(false),
});

// Asset schemas
export const insertAssetSchema = z.object({
  userId: z.string().uuid().optional(),
  assetName: z.string().min(1).max(255),
  assetType: z.string().min(1).max(50),
  currentValue: z.string(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().optional(),
  appreciationRate: z.string().default('0'),
  depreciationRate: z.string().default('0'),
  ownershipPercentage: z.string().default('100'),
  isLiquid: z.boolean().default(false),
  institution: z.string().max(255).optional(),
  accountNumber: z.string().max(100).optional(),
  maturityDate: z.string().optional(),
  expectedReturn: z.string().optional(),
  riskLevel: z.string().max(20).optional(),
  marketValue: z.string().optional(),
  notes: z.string().optional(),
});

// Liability schemas
export const insertLiabilitySchema = z.object({
  userId: z.string().uuid().optional(),
  liabilityName: z.string().min(1).max(255),
  liabilityType: z.string().min(1).max(50),
  currentBalance: z.string(),
  originalAmount: z.string().optional(),
  interestRate: z.string().optional(),
  minimumPayment: z.string().optional(),
  monthlyPayment: z.string().optional(),
  dueDate: z.string().optional(),
  paymentFrequency: z.string().max(20).default('monthly'),
  lender: z.string().max(255).optional(),
  accountNumber: z.string().max(100).optional(),
  loanTerm: z.number().int().optional(),
  remainingTerm: z.number().int().optional(),
  payoffStrategy: z.string().max(50).optional(),
  isSecured: z.boolean().default(false),
  collateral: z.string().optional(),
  taxDeductible: z.boolean().default(false),
  creditLimit: z.string().optional(),
  notes: z.string().optional(),
});

// Net Worth Snapshot schemas
export const insertNetWorthSnapshotSchema = z.object({
  userId: z.string().uuid().optional(),
  snapshotDate: z.string(),
  totalAssets: z.string(),
  totalLiabilities: z.string(),
  netWorth: z.string(),
  cashLiquidAssets: z.string().default('0'),
  investmentAssets: z.string().default('0'),
  realEstateAssets: z.string().default('0'),
  vehicleAssets: z.string().default('0'),
  personalPropertyAssets: z.string().default('0'),
  businessAssets: z.string().default('0'),
  consumerDebt: z.string().default('0'),
  vehicleLoans: z.string().default('0'),
  realEstateDebt: z.string().default('0'),
  educationDebt: z.string().default('0'),
  businessDebt: z.string().default('0'),
  taxesBills: z.string().default('0'),
  monthOverMonthChange: z.string().optional(),
  yearOverYearChange: z.string().optional(),
});

// Business Profile schemas
export const insertBusinessProfileSchema = z.object({
  userId: z.string().uuid().optional(),
  businessName: z.string().min(1).max(255),
  businessType: z.string().max(100).optional(),
  ein: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(50).default('US'),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

// Vendor schemas
export const insertVendorSchema = z.object({
  userId: z.string().uuid().optional(),
  companyName: z.string().min(1).max(255),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(50).default('US'),
  vendorType: z.string().max(100).optional(),
  paymentTerms: z.string().max(100).optional(),
  taxId: z.string().max(20).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

// Purchase Order schemas
export const insertPurchaseOrderSchema = z.object({
  userId: z.string().uuid().optional(),
  businessProfileId: z.string().uuid(),
  vendorId: z.string().uuid(),
  poNumber: z.string().min(1).max(100),
  status: z.string().max(50).default('pending'),
  orderDate: z.string().optional(),
  expectedDelivery: z.string().optional(),
  shipToAddress: z.string().optional(),
  billToAddress: z.string().optional(),
  subtotal: z.string().default('0'),
  taxAmount: z.string().default('0'),
  shippingAmount: z.string().default('0'),
  totalAmount: z.string().default('0'),
  terms: z.string().max(100).optional(),
  notes: z.string().optional(),
  requisitioner: z.string().max(255).optional(),
  approvedBy: z.string().max(255).optional(),
  approvalDate: z.string().optional(),
  receivedDate: z.string().optional(),
});

// Purchase Order Item schemas
export const insertPurchaseOrderItemSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  lineNumber: z.number().int(),
  description: z.string().min(1),
  quantity: z.string(),
  unitPrice: z.string(),
  totalPrice: z.string(),
  unitOfMeasure: z.string().max(20).default('each'),
  partNumber: z.string().max(100).optional(),
  receivedQuantity: z.string().default('0'),
  status: z.string().max(50).default('pending'),
  notes: z.string().optional(),
});

// Business Credit Card schemas
export const insertBusinessCreditCardSchema = z.object({
  userId: z.string().uuid().optional(),
  businessProfileId: z.string().uuid(),
  cardName: z.string().min(1).max(255),
  lastFourDigits: z.string().length(4).optional(),
  creditLimit: z.string().optional(),
  balance: z.string().default('0'),
  interestRate: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDate: z.string().optional(),
  statementBalance: z.string().optional(),
  availableCredit: z.string().optional(),
  rewardsProgram: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
});

// Business Loan schemas
export const insertBusinessLoanSchema = z.object({
  userId: z.string().uuid().optional(),
  businessProfileId: z.string().uuid(),
  loanName: z.string().min(1).max(255),
  loanType: z.string().min(1).max(50),
  originalAmount: z.string().optional(),
  currentBalance: z.string(),
  interestRate: z.string().optional(),
  monthlyPayment: z.string().optional(),
  minimumPayment: z.string().optional(),
  dueDate: z.string().optional(),
  lender: z.string().max(255).optional(),
  termLength: z.number().int().optional(),
  remainingTerm: z.number().int().optional(),
  purpose: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
});

// Business Revenue schemas
export const insertBusinessRevenueSchema = z.object({
  userId: z.string().uuid().optional(),
  businessProfileId: z.string().uuid(),
  source: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.string(),
  revenueDate: z.string(),
  category: z.string().max(100).optional(),
  taxable: z.boolean().default(true),
  invoiceNumber: z.string().max(100).optional(),
  customerId: z.string().max(100).optional(),
  paymentMethod: z.string().max(50).optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.string().max(20).optional(),
});

// Business Expense schemas
export const insertBusinessExpenseSchema = z.object({
  userId: z.string().uuid().optional(),
  businessProfileId: z.string().uuid(),
  description: z.string().min(1).max(255),
  amount: z.string(),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(100).optional(),
  expenseDate: z.string(),
  paymentMethod: z.string().max(50).optional(),
  vendor: z.string().max(255).optional(),
  isRecurring: z.boolean().default(false),
  frequency: z.string().max(20).optional(),
  taxDeductible: z.boolean().default(true),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
  invoiceNumber: z.string().max(100).optional(),
});
