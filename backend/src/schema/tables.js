import { pgTable, text, varchar, numeric, boolean, timestamp, uuid, date, integer } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Changed to varchar to support Clerk user IDs
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Credit Cards table
export const creditCards = pgTable('credit_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  cardName: varchar('card_name', { length: 255 }).notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }),
  minimumPayment: numeric('minimum_payment', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  statementBalance: numeric('statement_balance', { precision: 12, scale: 2 }),
  availableCredit: numeric('available_credit', { precision: 12, scale: 2 }),
  rewardsProgram: varchar('rewards_program', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Loans table
export const loans = pgTable('loans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  loanName: varchar('loan_name', { length: 255 }).notNull(),
  loanType: varchar('loan_type', { length: 50 }).notNull(),
  originalAmount: numeric('original_amount', { precision: 12, scale: 2 }),
  currentBalance: numeric('current_balance', { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }),
  monthlyPayment: numeric('monthly_payment', { precision: 10, scale: 2 }),
  minimumPayment: numeric('minimum_payment', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  lender: varchar('lender', { length: 255 }),
  termLength: integer('term_length'),
  remainingTerm: integer('remaining_term'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Monthly Payments table
export const monthlyPayments = pgTable('monthly_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  accountId: uuid('account_id').notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  paymentName: varchar('payment_name', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: date('due_date'),
  isRecurring: boolean('is_recurring').default(true),
  frequency: varchar('frequency', { length: 20 }).default('monthly'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Income table
export const income = pgTable('income', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  source: varchar('source', { length: 255 }).notNull(),
  incomeType: varchar('income_type', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  frequency: varchar('frequency', { length: 20 }).notNull(),
  nextPayDate: date('next_pay_date'),
  isActive: boolean('is_active').default(true),
  taxable: boolean('taxable').default(true),
  category: varchar('category', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  accountId: uuid('account_id').notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  confirmationNumber: varchar('confirmation_number', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending'), // pending, paid, failed, cancelled
  paidDate: timestamp('paid_date'), // When the payment was actually completed
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Expenses table
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  description: varchar('description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  expenseDate: date('expense_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  merchant: varchar('merchant', { length: 255 }),
  isRecurring: boolean('is_recurring').default(false),
  frequency: varchar('frequency', { length: 20 }),
  taxDeductible: boolean('tax_deductible').default(false),
  notes: text('notes'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Savings Goals table
export const savingsGoals = pgTable('savings_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  goalName: varchar('goal_name', { length: 255 }).notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric('current_amount', { precision: 12, scale: 2 }).default('0'),
  monthlyContribution: numeric('monthly_contribution', { precision: 10, scale: 2 }).default('0'),
  targetDate: date('target_date'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Budgets table
export const budgets = pgTable('budgets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  category: varchar('category', { length: 100 }).notNull(),
  budgetAmount: numeric('budget_amount', { precision: 10, scale: 2 }).notNull(),
  currentSpent: numeric('current_spent', { precision: 10, scale: 2 }).default('0'),
  period: varchar('period', { length: 20 }).default('monthly'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  alertThreshold: numeric('alert_threshold', { precision: 5, scale: 2 }).default('80'),
  isActive: boolean('is_active').default(true),
  rollover: boolean('rollover').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Investments table
export const investments = pgTable('investments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: varchar('account_type', { length: 50 }).notNull(),
  institution: varchar('institution', { length: 255 }),
  currentValue: numeric('current_value', { precision: 15, scale: 2 }).notNull(),
  contributionAmount: numeric('contribution_amount', { precision: 10, scale: 2 }).default('0'),
  contributionFrequency: varchar('contribution_frequency', { length: 20 }).default('monthly'),
  employerMatch: numeric('employer_match', { precision: 5, scale: 2 }).default('0'),
  vestingSchedule: varchar('vesting_schedule', { length: 255 }),
  riskLevel: varchar('risk_level', { length: 20 }).default('moderate'),
  expectedReturn: numeric('expected_return', { precision: 5, scale: 2 }).default('7'),
  maturityDate: date('maturity_date'),
  autoRebalance: boolean('auto_rebalance').default(false),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Assets table
export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  assetName: varchar('asset_name', { length: 255 }).notNull(),
  assetType: varchar('asset_type', { length: 50 }).notNull(),
  currentValue: numeric('current_value', { precision: 15, scale: 2 }).notNull(),
  purchasePrice: numeric('purchase_price', { precision: 15, scale: 2 }),
  purchaseDate: date('purchase_date'),
  appreciationRate: numeric('appreciation_rate', { precision: 5, scale: 2 }).default('0'),
  depreciationRate: numeric('depreciation_rate', { precision: 5, scale: 2 }).default('0'),
  ownershipPercentage: numeric('ownership_percentage', { precision: 5, scale: 2 }).default('100'),
  isLiquid: boolean('is_liquid').default(false),
  institution: varchar('institution', { length: 255 }),
  accountNumber: varchar('account_number', { length: 100 }),
  maturityDate: date('maturity_date'),
  expectedReturn: numeric('expected_return', { precision: 5, scale: 2 }),
  riskLevel: varchar('risk_level', { length: 20 }),
  marketValue: numeric('market_value', { precision: 15, scale: 2 }),
  notes: text('notes'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Liabilities table
export const liabilities = pgTable('liabilities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  liabilityName: varchar('liability_name', { length: 255 }).notNull(),
  liabilityType: varchar('liability_type', { length: 50 }).notNull(),
  currentBalance: numeric('current_balance', { precision: 15, scale: 2 }).notNull(),
  originalAmount: numeric('original_amount', { precision: 15, scale: 2 }),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }),
  minimumPayment: numeric('minimum_payment', { precision: 10, scale: 2 }),
  monthlyPayment: numeric('monthly_payment', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  paymentFrequency: varchar('payment_frequency', { length: 20 }).default('monthly'),
  lender: varchar('lender', { length: 255 }),
  accountNumber: varchar('account_number', { length: 100 }),
  loanTerm: integer('loan_term'),
  remainingTerm: integer('remaining_term'),
  payoffStrategy: varchar('payoff_strategy', { length: 50 }),
  isSecured: boolean('is_secured').default(false),
  collateral: text('collateral'),
  taxDeductible: boolean('tax_deductible').default(false),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }),
  notes: text('notes'),
  lastUpdated: timestamp('last_updated').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Net Worth Snapshots table
export const netWorthSnapshots = pgTable('net_worth_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  snapshotDate: date('snapshot_date').notNull(),
  totalAssets: numeric('total_assets', { precision: 15, scale: 2 }).notNull(),
  totalLiabilities: numeric('total_liabilities', { precision: 15, scale: 2 }).notNull(),
  netWorth: numeric('net_worth', { precision: 15, scale: 2 }).notNull(),
  cashLiquidAssets: numeric('cash_liquid_assets', { precision: 15, scale: 2 }).default('0'),
  investmentAssets: numeric('investment_assets', { precision: 15, scale: 2 }).default('0'),
  realEstateAssets: numeric('real_estate_assets', { precision: 15, scale: 2 }).default('0'),
  vehicleAssets: numeric('vehicle_assets', { precision: 15, scale: 2 }).default('0'),
  personalPropertyAssets: numeric('personal_property_assets', { precision: 15, scale: 2 }).default('0'),
  businessAssets: numeric('business_assets', { precision: 15, scale: 2 }).default('0'),
  consumerDebt: numeric('consumer_debt', { precision: 15, scale: 2 }).default('0'),
  vehicleLoans: numeric('vehicle_loans', { precision: 15, scale: 2 }).default('0'),
  realEstateDebt: numeric('real_estate_debt', { precision: 15, scale: 2 }).default('0'),
  educationDebt: numeric('education_debt', { precision: 15, scale: 2 }).default('0'),
  businessDebt: numeric('business_debt', { precision: 15, scale: 2 }).default('0'),
  taxesBills: numeric('taxes_bills', { precision: 15, scale: 2 }).default('0'),
  monthOverMonthChange: numeric('month_over_month_change', { precision: 5, scale: 2 }),
  yearOverYearChange: numeric('year_over_year_change', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Business Profiles table
export const businessProfiles = pgTable('business_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessType: varchar('business_type', { length: 100 }),
  ein: varchar('ein', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 50 }).default('US'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Vendors table
export const vendors = pgTable('vendors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactPerson: varchar('contact_person', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 50 }).default('US'),
  vendorType: varchar('vendor_type', { length: 100 }),
  paymentTerms: varchar('payment_terms', { length: 100 }),
  taxId: varchar('tax_id', { length: 20 }),
  isActive: boolean('is_active').default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Purchase Orders table
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessProfileId: uuid('business_profile_id').references(() => businessProfiles.id),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  poNumber: varchar('po_number', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending'),
  orderDate: date('order_date').defaultNow(),
  expectedDelivery: date('expected_delivery'),
  shipToAddress: text('ship_to_address'),
  billToAddress: text('bill_to_address'),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).default('0'),
  taxAmount: numeric('tax_amount', { precision: 10, scale: 2 }).default('0'),
  shippingAmount: numeric('shipping_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).default('0'),
  terms: varchar('terms', { length: 100 }),
  notes: text('notes'),
  requisitioner: varchar('requisitioner', { length: 255 }),
  approvedBy: varchar('approved_by', { length: 255 }),
  approvalDate: date('approval_date'),
  receivedDate: date('received_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Purchase Order Items table
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  purchaseOrderId: uuid('purchase_order_id').references(() => purchaseOrders.id),
  lineNumber: integer('line_number').notNull(),
  description: text('description').notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: numeric('total_price', { precision: 12, scale: 2 }).notNull(),
  unitOfMeasure: varchar('unit_of_measure', { length: 20 }).default('each'),
  partNumber: varchar('part_number', { length: 100 }),
  receivedQuantity: numeric('received_quantity', { precision: 10, scale: 2 }).default('0'),
  status: varchar('status', { length: 50 }).default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Business Credit Cards table
export const businessCreditCards = pgTable('business_credit_cards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessProfileId: uuid('business_profile_id').references(() => businessProfiles.id),
  cardName: varchar('card_name', { length: 255 }).notNull(),
  lastFourDigits: varchar('last_four_digits', { length: 4 }),
  creditLimit: numeric('credit_limit', { precision: 12, scale: 2 }),
  balance: numeric('balance', { precision: 12, scale: 2 }).default('0'),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }),
  minimumPayment: numeric('minimum_payment', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  statementBalance: numeric('statement_balance', { precision: 12, scale: 2 }),
  availableCredit: numeric('available_credit', { precision: 12, scale: 2 }),
  rewardsProgram: varchar('rewards_program', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Business Loans table
export const businessLoans = pgTable('business_loans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessProfileId: uuid('business_profile_id').references(() => businessProfiles.id),
  loanName: varchar('loan_name', { length: 255 }).notNull(),
  loanType: varchar('loan_type', { length: 50 }).notNull(),
  originalAmount: numeric('original_amount', { precision: 12, scale: 2 }),
  currentBalance: numeric('current_balance', { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }),
  monthlyPayment: numeric('monthly_payment', { precision: 10, scale: 2 }),
  minimumPayment: numeric('minimum_payment', { precision: 10, scale: 2 }),
  dueDate: date('due_date'),
  lender: varchar('lender', { length: 255 }),
  termLength: integer('term_length'),
  remainingTerm: integer('remaining_term'),
  purpose: varchar('purpose', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Business Revenue table
export const businessRevenue = pgTable('business_revenue', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessProfileId: uuid('business_profile_id').references(() => businessProfiles.id),
  source: varchar('source', { length: 255 }).notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  revenueDate: date('revenue_date').notNull(),
  category: varchar('category', { length: 100 }),
  taxable: boolean('taxable').default(true),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  customerId: varchar('customer_id', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  isRecurring: boolean('is_recurring').default(false),
  frequency: varchar('frequency', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Business Expenses table
export const businessExpenses = pgTable('business_expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: varchar('user_id', { length: 255 }).references(() => users.id),
  businessProfileId: uuid('business_profile_id').references(() => businessProfiles.id),
  description: varchar('description', { length: 255 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  subcategory: varchar('subcategory', { length: 100 }),
  expenseDate: date('expense_date').notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }),
  vendor: varchar('vendor', { length: 255 }),
  isRecurring: boolean('is_recurring').default(false),
  frequency: varchar('frequency', { length: 20 }),
  taxDeductible: boolean('tax_deductible').default(true),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
