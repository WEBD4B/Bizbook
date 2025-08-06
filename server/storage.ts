import { 
  type User, type InsertUser, 
  type CreditCard, type InsertCreditCard, 
  type Loan, type InsertLoan,
  type MonthlyPayment, type InsertMonthlyPayment,
  type Income, type InsertIncome,
  type Payment, type InsertPayment,
  type Expense, type InsertExpense,
  type SavingsGoal, type InsertSavingsGoal,
  type Budget, type InsertBudget,
  type Investment, type InsertInvestment,
  type Asset, type InsertAsset,
  type Liability, type InsertLiability,
  type NetWorthSnapshot, type InsertNetWorthSnapshot
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Credit Cards
  getCreditCards(): Promise<CreditCard[]>;
  getCreditCard(id: string): Promise<CreditCard | undefined>;
  createCreditCard(creditCard: InsertCreditCard): Promise<CreditCard>;
  updateCreditCard(id: string, creditCard: Partial<InsertCreditCard>): Promise<CreditCard | undefined>;
  deleteCreditCard(id: string): Promise<boolean>;
  
  // Loans
  getLoans(): Promise<Loan[]>;
  getLoan(id: string): Promise<Loan | undefined>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoan(id: string, loan: Partial<InsertLoan>): Promise<Loan | undefined>;
  deleteLoan(id: string): Promise<boolean>;
  
  // Monthly Payments
  getMonthlyPayments(): Promise<MonthlyPayment[]>;
  getMonthlyPayment(id: string): Promise<MonthlyPayment | undefined>;
  createMonthlyPayment(payment: InsertMonthlyPayment): Promise<MonthlyPayment>;
  updateMonthlyPayment(id: string, payment: Partial<InsertMonthlyPayment>): Promise<MonthlyPayment | undefined>;
  deleteMonthlyPayment(id: string): Promise<boolean>;
  
  // Income
  getIncomes(): Promise<Income[]>;
  getIncome(id: string): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: string, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: string): Promise<boolean>;
  
  // Payments
  getPayments(): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByAccount(accountId: string, accountType: string): Promise<Payment[]>;
  
  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;

  // Savings Goals
  getSavingsGoals(): Promise<SavingsGoal[]>;
  getSavingsGoal(id: string): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal): Promise<SavingsGoal>;
  updateSavingsGoal(id: string, goal: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined>;
  deleteSavingsGoal(id: string): Promise<boolean>;

  // Budgets
  getBudgets(): Promise<Budget[]>;
  getBudget(id: string): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: string, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: string): Promise<boolean>;

  // Investments
  getInvestments(): Promise<Investment[]>;
  getInvestment(id: string): Promise<Investment | undefined>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, investment: Partial<InsertInvestment>): Promise<Investment | undefined>;
  deleteInvestment(id: string): Promise<boolean>;

  // Assets
  getAssets(): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<boolean>;

  // Liabilities
  getLiabilities(): Promise<Liability[]>;
  getLiability(id: string): Promise<Liability | undefined>;
  createLiability(liability: InsertLiability): Promise<Liability>;
  updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability | undefined>;
  deleteLiability(id: string): Promise<boolean>;

  // Net Worth Snapshots
  getNetWorthSnapshots(): Promise<NetWorthSnapshot[]>;
  getNetWorthSnapshot(id: string): Promise<NetWorthSnapshot | undefined>;
  createNetWorthSnapshot(snapshot: InsertNetWorthSnapshot): Promise<NetWorthSnapshot>;
  getLatestNetWorthSnapshot(): Promise<NetWorthSnapshot | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private creditCards: Map<string, CreditCard>;
  private loans: Map<string, Loan>;
  private monthlyPayments: Map<string, MonthlyPayment>;
  private incomes: Map<string, Income>;
  private payments: Map<string, Payment>;
  private expenses: Map<string, Expense>;
  private savingsGoals: Map<string, SavingsGoal>;
  private budgets: Map<string, Budget>;
  private investments: Map<string, Investment>;
  private assets: Map<string, Asset>;
  private liabilities: Map<string, Liability>;
  private netWorthSnapshots: Map<string, NetWorthSnapshot>;

  constructor() {
    this.users = new Map();
    this.creditCards = new Map();
    this.loans = new Map();
    this.monthlyPayments = new Map();
    this.incomes = new Map();
    this.payments = new Map();
    this.expenses = new Map();
    this.savingsGoals = new Map();
    this.budgets = new Map();
    this.investments = new Map();
    this.assets = new Map();
    this.liabilities = new Map();
    this.netWorthSnapshots = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Credit Cards
  async getCreditCards(): Promise<CreditCard[]> {
    return Array.from(this.creditCards.values());
  }

  async getCreditCard(id: string): Promise<CreditCard | undefined> {
    return this.creditCards.get(id);
  }

  async createCreditCard(insertCreditCard: InsertCreditCard): Promise<CreditCard> {
    const id = randomUUID();
    const creditCard: CreditCard = { ...insertCreditCard, id };
    this.creditCards.set(id, creditCard);
    return creditCard;
  }

  async updateCreditCard(id: string, updates: Partial<InsertCreditCard>): Promise<CreditCard | undefined> {
    const existing = this.creditCards.get(id);
    if (!existing) return undefined;
    
    const updated: CreditCard = { ...existing, ...updates };
    this.creditCards.set(id, updated);
    return updated;
  }

  async deleteCreditCard(id: string): Promise<boolean> {
    return this.creditCards.delete(id);
  }

  // Loans
  async getLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async getLoan(id: string): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = randomUUID();
    const loan: Loan = { ...insertLoan, id };
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoan(id: string, updates: Partial<InsertLoan>): Promise<Loan | undefined> {
    const existing = this.loans.get(id);
    if (!existing) return undefined;
    
    const updated: Loan = { ...existing, ...updates };
    this.loans.set(id, updated);
    return updated;
  }

  async deleteLoan(id: string): Promise<boolean> {
    return this.loans.delete(id);
  }

  // Monthly Payments
  async getMonthlyPayments(): Promise<MonthlyPayment[]> {
    return Array.from(this.monthlyPayments.values());
  }

  async getMonthlyPayment(id: string): Promise<MonthlyPayment | undefined> {
    return this.monthlyPayments.get(id);
  }

  async createMonthlyPayment(insertMonthlyPayment: InsertMonthlyPayment): Promise<MonthlyPayment> {
    const id = randomUUID();
    const monthlyPayment: MonthlyPayment = { 
      ...insertMonthlyPayment, 
      id,
      isRecurring: insertMonthlyPayment.isRecurring ?? true
    };
    this.monthlyPayments.set(id, monthlyPayment);
    return monthlyPayment;
  }

  async updateMonthlyPayment(id: string, updates: Partial<InsertMonthlyPayment>): Promise<MonthlyPayment | undefined> {
    const existing = this.monthlyPayments.get(id);
    if (!existing) return undefined;
    
    const updated: MonthlyPayment = { ...existing, ...updates };
    this.monthlyPayments.set(id, updated);
    return updated;
  }

  async deleteMonthlyPayment(id: string): Promise<boolean> {
    return this.monthlyPayments.delete(id);
  }

  // Income
  async getIncomes(): Promise<Income[]> {
    return Array.from(this.incomes.values());
  }

  async getIncome(id: string): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async createIncome(insertIncome: InsertIncome): Promise<Income> {
    const id = randomUUID();
    const income: Income = { ...insertIncome, id };
    this.incomes.set(id, income);
    return income;
  }

  async updateIncome(id: string, updates: Partial<InsertIncome>): Promise<Income | undefined> {
    const existing = this.incomes.get(id);
    if (!existing) return undefined;
    
    const updated: Income = { ...existing, ...updates };
    this.incomes.set(id, updated);
    return updated;
  }

  async deleteIncome(id: string): Promise<boolean> {
    return this.incomes.delete(id);
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = { 
      ...insertPayment, 
      id,
      notes: insertPayment.notes ?? null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByAccount(accountId: string, accountType: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      payment => payment.accountId === accountId && payment.accountType === accountType
    );
  }

  // Expenses
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = { 
      ...insertExpense, 
      id,
      paymentMethod: insertExpense.paymentMethod ?? null,
      notes: insertExpense.notes ?? null,
      isRecurring: insertExpense.isRecurring ?? false,
      createdAt: new Date()
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existing = this.expenses.get(id);
    if (!existing) return undefined;
    
    const updated: Expense = { ...existing, ...updates };
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => {
      const expenseDate = new Date(expense.expenseDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return expenseDate >= start && expenseDate <= end;
    });
  }

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    return Array.from(this.savingsGoals.values());
  }

  async getSavingsGoal(id: string): Promise<SavingsGoal | undefined> {
    return this.savingsGoals.get(id);
  }

  async createSavingsGoal(insertGoal: InsertSavingsGoal): Promise<SavingsGoal> {
    const id = randomUUID();
    const goal: SavingsGoal = { 
      ...insertGoal, 
      id,
      currentAmount: insertGoal.currentAmount ?? "0",
      monthlyContribution: insertGoal.monthlyContribution ?? "0",
      isActive: insertGoal.isActive ?? true,
      targetDate: insertGoal.targetDate ?? null,
      createdAt: new Date()
    };
    this.savingsGoals.set(id, goal);
    return goal;
  }

  async updateSavingsGoal(id: string, updates: Partial<InsertSavingsGoal>): Promise<SavingsGoal | undefined> {
    const existing = this.savingsGoals.get(id);
    if (!existing) return undefined;
    
    const updated: SavingsGoal = { ...existing, ...updates };
    this.savingsGoals.set(id, updated);
    return updated;
  }

  async deleteSavingsGoal(id: string): Promise<boolean> {
    return this.savingsGoals.delete(id);
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }

  async getBudget(id: string): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = randomUUID();
    const budget: Budget = { 
      ...insertBudget, 
      id,
      currentSpent: insertBudget.currentSpent ?? "0",
      alertThreshold: insertBudget.alertThreshold ?? "80",
      isActive: insertBudget.isActive ?? true
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: string, updates: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existing = this.budgets.get(id);
    if (!existing) return undefined;
    
    const updated: Budget = { ...existing, ...updates };
    this.budgets.set(id, updated);
    return updated;
  }

  async deleteBudget(id: string): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Investments
  async getInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async getInvestment(id: string): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const investment: Investment = { 
      ...insertInvestment, 
      id,
      contributionAmount: insertInvestment.contributionAmount ?? "0",
      contributionFrequency: insertInvestment.contributionFrequency ?? "monthly",
      employerMatch: insertInvestment.employerMatch ?? "0",
      riskLevel: insertInvestment.riskLevel ?? "moderate",
      expectedReturn: insertInvestment.expectedReturn ?? "7",
      lastUpdated: new Date()
    };
    this.investments.set(id, investment);
    return investment;
  }

  async updateInvestment(id: string, updates: Partial<InsertInvestment>): Promise<Investment | undefined> {
    const existing = this.investments.get(id);
    if (!existing) return undefined;
    
    const updated: Investment = { ...existing, ...updates, lastUpdated: new Date() };
    this.investments.set(id, updated);
    return updated;
  }

  async deleteInvestment(id: string): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Assets
  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const asset: Asset = { 
      ...insertAsset, 
      id,
      purchasePrice: insertAsset.purchasePrice ?? null,
      purchaseDate: insertAsset.purchaseDate ?? null,
      appreciationRate: insertAsset.appreciationRate ?? "0",
      depreciationRate: insertAsset.depreciationRate ?? "0",
      ownershipPercentage: insertAsset.ownershipPercentage ?? "100",
      isLiquid: insertAsset.isLiquid ?? false,
      institution: insertAsset.institution ?? null,
      accountNumber: insertAsset.accountNumber ?? null,
      maturityDate: insertAsset.maturityDate ?? null,
      expectedReturn: insertAsset.expectedReturn ?? null,
      riskLevel: insertAsset.riskLevel ?? null,
      marketValue: insertAsset.marketValue ?? null,
      notes: insertAsset.notes ?? null,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: string, updates: Partial<InsertAsset>): Promise<Asset | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;
    
    const updated: Asset = { ...existing, ...updates, lastUpdated: new Date() };
    this.assets.set(id, updated);
    return updated;
  }

  async deleteAsset(id: string): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Liabilities
  async getLiabilities(): Promise<Liability[]> {
    return Array.from(this.liabilities.values());
  }

  async getLiability(id: string): Promise<Liability | undefined> {
    return this.liabilities.get(id);
  }

  async createLiability(insertLiability: InsertLiability): Promise<Liability> {
    const id = randomUUID();
    const liability: Liability = { 
      ...insertLiability, 
      id,
      originalAmount: insertLiability.originalAmount ?? null,
      interestRate: insertLiability.interestRate ?? null,
      minimumPayment: insertLiability.minimumPayment ?? null,
      monthlyPayment: insertLiability.monthlyPayment ?? null,
      dueDate: insertLiability.dueDate ?? null,
      paymentFrequency: insertLiability.paymentFrequency ?? "monthly",
      lender: insertLiability.lender ?? null,
      accountNumber: insertLiability.accountNumber ?? null,
      loanTerm: insertLiability.loanTerm ?? null,
      remainingTerm: insertLiability.remainingTerm ?? null,
      payoffStrategy: insertLiability.payoffStrategy ?? null,
      isSecured: insertLiability.isSecured ?? false,
      collateral: insertLiability.collateral ?? null,
      taxDeductible: insertLiability.taxDeductible ?? false,
      creditLimit: insertLiability.creditLimit ?? null,
      notes: insertLiability.notes ?? null,
      lastUpdated: new Date(),
      createdAt: new Date()
    };
    this.liabilities.set(id, liability);
    return liability;
  }

  async updateLiability(id: string, updates: Partial<InsertLiability>): Promise<Liability | undefined> {
    const existing = this.liabilities.get(id);
    if (!existing) return undefined;
    
    const updated: Liability = { ...existing, ...updates, lastUpdated: new Date() };
    this.liabilities.set(id, updated);
    return updated;
  }

  async deleteLiability(id: string): Promise<boolean> {
    return this.liabilities.delete(id);
  }

  // Net Worth Snapshots
  async getNetWorthSnapshots(): Promise<NetWorthSnapshot[]> {
    return Array.from(this.netWorthSnapshots.values()).sort((a, b) => 
      new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
    );
  }

  async getNetWorthSnapshot(id: string): Promise<NetWorthSnapshot | undefined> {
    return this.netWorthSnapshots.get(id);
  }

  async createNetWorthSnapshot(insertSnapshot: InsertNetWorthSnapshot): Promise<NetWorthSnapshot> {
    const id = randomUUID();
    const snapshot: NetWorthSnapshot = { 
      ...insertSnapshot, 
      id,
      cashLiquidAssets: insertSnapshot.cashLiquidAssets ?? "0",
      investmentAssets: insertSnapshot.investmentAssets ?? "0",
      realEstateAssets: insertSnapshot.realEstateAssets ?? "0",
      vehicleAssets: insertSnapshot.vehicleAssets ?? "0",
      personalPropertyAssets: insertSnapshot.personalPropertyAssets ?? "0",
      businessAssets: insertSnapshot.businessAssets ?? "0",
      consumerDebt: insertSnapshot.consumerDebt ?? "0",
      vehicleLoans: insertSnapshot.vehicleLoans ?? "0",
      realEstateDebt: insertSnapshot.realEstateDebt ?? "0",
      educationDebt: insertSnapshot.educationDebt ?? "0",
      businessDebt: insertSnapshot.businessDebt ?? "0",
      taxesBills: insertSnapshot.taxesBills ?? "0",
      monthOverMonthChange: insertSnapshot.monthOverMonthChange ?? null,
      yearOverYearChange: insertSnapshot.yearOverYearChange ?? null,
      createdAt: new Date()
    };
    this.netWorthSnapshots.set(id, snapshot);
    return snapshot;
  }

  async getLatestNetWorthSnapshot(): Promise<NetWorthSnapshot | undefined> {
    const snapshots = await this.getNetWorthSnapshots();
    return snapshots.length > 0 ? snapshots[0] : undefined;
  }

  // Business Expense methods
  private businessExpenses = new Map<string, any>();
  
  async getBusinessExpenses(): Promise<any[]> {
    return Array.from(this.businessExpenses.values());
  }

  async createBusinessExpense(expense: any): Promise<any> {
    const newExpense = {
      id: randomUUID(),
      ...expense,
      createdAt: new Date().toISOString(),
    };
    this.businessExpenses.set(newExpense.id, newExpense);
    return newExpense;
  }

  async updateBusinessExpense(id: string, expense: any): Promise<any> {
    const existing = this.businessExpenses.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...expense };
    this.businessExpenses.set(id, updated);
    return updated;
  }

  async deleteBusinessExpense(id: string): Promise<void> {
    this.businessExpenses.delete(id);
  }

  // Business Revenue methods
  private businessRevenue = new Map<string, any>();
  
  async getBusinessRevenue(): Promise<any[]> {
    return Array.from(this.businessRevenue.values());
  }

  async createBusinessRevenue(revenue: any): Promise<any> {
    const newRevenue = {
      id: randomUUID(),
      ...revenue,
      createdAt: new Date().toISOString(),
    };
    this.businessRevenue.set(newRevenue.id, newRevenue);
    return newRevenue;
  }

  async updateBusinessRevenue(id: string, revenue: any): Promise<any> {
    const existing = this.businessRevenue.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...revenue };
    this.businessRevenue.set(id, updated);
    return updated;
  }

  async deleteBusinessRevenue(id: string): Promise<void> {
    this.businessRevenue.delete(id);
  }

  // Business Payout methods
  private businessPayouts = new Map<string, any>();
  
  async getBusinessPayouts(): Promise<any[]> {
    return Array.from(this.businessPayouts.values());
  }

  async createBusinessPayout(payout: any): Promise<any> {
    const newPayout = {
      id: randomUUID(),
      ...payout,
      createdAt: new Date().toISOString(),
    };
    this.businessPayouts.set(newPayout.id, newPayout);
    return newPayout;
  }

  async updateBusinessPayout(id: string, payout: any): Promise<any> {
    const existing = this.businessPayouts.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...payout };
    this.businessPayouts.set(id, updated);
    return updated;
  }

  async deleteBusinessPayout(id: string): Promise<void> {
    this.businessPayouts.delete(id);
  }

  // Tax document methods
  private taxDocuments = new Map<string, any>();
  
  async getTaxDocuments(): Promise<any[]> {
    return Array.from(this.taxDocuments.values());
  }

  async createTaxDocument(document: any): Promise<any> {
    const newDocument = {
      id: randomUUID(),
      ...document,
      createdAt: new Date().toISOString(),
    };
    this.taxDocuments.set(newDocument.id, newDocument);
    return newDocument;
  }

  async deleteTaxDocument(id: string): Promise<void> {
    this.taxDocuments.delete(id);
  }

  // Sales tax settings methods
  private salesTaxSettings = new Map<string, any>();
  
  async getSalesTaxSettings(): Promise<any[]> {
    return Array.from(this.salesTaxSettings.values());
  }

  async createSalesTaxSetting(setting: any): Promise<any> {
    const newSetting = {
      id: randomUUID(),
      ...setting,
      createdAt: new Date().toISOString(),
    };
    this.salesTaxSettings.set(newSetting.id, newSetting);
    return newSetting;
  }

  async updateSalesTaxSetting(id: string, setting: any): Promise<any> {
    const existing = this.salesTaxSettings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...setting };
    this.salesTaxSettings.set(id, updated);
    return updated;
  }

  async deleteSalesTaxSetting(id: string): Promise<void> {
    this.salesTaxSettings.delete(id);
  }

  // Business info methods
  private businessInfo = new Map<string, any>();
  
  async getBusinessInfo(): Promise<any[]> {
    return Array.from(this.businessInfo.values());
  }

  async createBusinessInfo(info: any): Promise<any> {
    const newInfo = {
      id: randomUUID(),
      ...info,
      createdAt: new Date().toISOString(),
    };
    this.businessInfo.set(newInfo.id, newInfo);
    return newInfo;
  }

  async updateBusinessInfo(id: string, info: any): Promise<any> {
    const existing = this.businessInfo.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...info };
    this.businessInfo.set(id, updated);
    return updated;
  }

  async deleteBusinessInfo(id: string): Promise<void> {
    this.businessInfo.delete(id);
  }

  // Payment methods methods
  private paymentMethods = new Map<string, any>();
  
  async getPaymentMethods(): Promise<any[]> {
    return Array.from(this.paymentMethods.values());
  }

  async createPaymentMethod(method: any): Promise<any> {
    const newMethod = {
      id: randomUUID(),
      ...method,
      createdAt: new Date().toISOString(),
    };
    this.paymentMethods.set(newMethod.id, newMethod);
    return newMethod;
  }

  async updatePaymentMethod(id: string, method: any): Promise<any> {
    const existing = this.paymentMethods.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...method };
    this.paymentMethods.set(id, updated);
    return updated;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    this.paymentMethods.delete(id);
  }

  // Additional tax management methods
  private salesTaxReturns = new Map<string, any>();
  private expenseReports = new Map<string, any>();
  private scheduleCForms = new Map<string, any>();
  private shopifyIntegrations = new Map<string, any>();

  async createSalesTaxReturn(returnData: any): Promise<any> {
    const newReturn = {
      id: randomUUID(),
      ...returnData,
      createdAt: new Date().toISOString(),
    };
    this.salesTaxReturns.set(newReturn.id, newReturn);
    return newReturn;
  }

  async createExpenseReport(reportData: any): Promise<any> {
    const newReport = {
      id: randomUUID(),
      ...reportData,
      createdAt: new Date().toISOString(),
    };
    this.expenseReports.set(newReport.id, newReport);
    return newReport;
  }

  async createScheduleC(scheduleCData: any): Promise<any> {
    const newScheduleC = {
      id: randomUUID(),
      ...scheduleCData,
      createdAt: new Date().toISOString(),
    };
    this.scheduleCForms.set(newScheduleC.id, newScheduleC);
    return newScheduleC;
  }

  async createShopifyIntegration(integrationData: any): Promise<any> {
    const newIntegration = {
      id: randomUUID(),
      ...integrationData,
      createdAt: new Date().toISOString(),
    };
    this.shopifyIntegrations.set(newIntegration.id, newIntegration);
    return newIntegration;
  }

  // Shopify CSV processing and order management
  private shopifyOrders = new Map<string, any>();

  async processShopifyCsv(csvData: any): Promise<any[]> {
    // Simulate CSV processing - in real implementation, parse the actual CSV file
    const sampleOrders = [
      {
        id: randomUUID(),
        orderId: "#1001",
        customerName: "John Smith",
        customerEmail: "john.smith@email.com",
        orderDate: "2024-08-01",
        orderTotal: 125.50,
        salesTaxAmount: 10.04,
        taxRate: "8.0%",
        state: "CA",
        city: "Los Angeles",
        shippingAddress: "123 Main St Los Angeles CA 90210",
        productNames: "Premium Widget, Standard Widget",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        orderId: "#1002",
        customerName: "Sarah Johnson",
        customerEmail: "sarah.j@email.com",
        orderDate: "2024-08-01",
        orderTotal: 89.99,
        salesTaxAmount: 7.20,
        taxRate: "8.0%",
        state: "CA",
        city: "San Francisco",
        shippingAddress: "456 Oak Ave San Francisco CA 94102",
        productNames: "Deluxe Service Package",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      },
      {
        id: randomUUID(),
        orderId: "#1003",
        customerName: "Mike Brown",
        customerEmail: "mike.brown@email.com",
        orderDate: "2024-08-02",
        orderTotal: 45.00,
        salesTaxAmount: 0.00,
        taxRate: "0.0%",
        state: "OR",
        city: "Portland",
        shippingAddress: "789 Pine St Portland OR 97201",
        productNames: "Digital Download",
        paymentStatus: "paid",
        createdAt: new Date().toISOString(),
      }
    ];

    // Store orders
    sampleOrders.forEach(order => {
      this.shopifyOrders.set(order.id, order);
    });

    return sampleOrders;
  }

  async getShopifyOrders(): Promise<any[]> {
    return Array.from(this.shopifyOrders.values());
  }

  async createShopifyOrder(orderData: any): Promise<any> {
    const newOrder = {
      id: randomUUID(),
      ...orderData,
      createdAt: new Date().toISOString(),
    };
    this.shopifyOrders.set(newOrder.id, newOrder);
    return newOrder;
  }

  async updateShopifyOrder(id: string, orderData: any): Promise<any> {
    const existing = this.shopifyOrders.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...orderData };
    this.shopifyOrders.set(id, updated);
    return updated;
  }

  async deleteShopifyOrder(id: string): Promise<void> {
    this.shopifyOrders.delete(id);
  }
}

export const storage = new MemStorage();
