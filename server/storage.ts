import { 
  type User, type InsertUser, 
  type CreditCard, type InsertCreditCard, 
  type Loan, type InsertLoan,
  type MonthlyPayment, type InsertMonthlyPayment,
  type Income, type InsertIncome,
  type Payment, type InsertPayment,
  type Expense, type InsertExpense
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private creditCards: Map<string, CreditCard>;
  private loans: Map<string, Loan>;
  private monthlyPayments: Map<string, MonthlyPayment>;
  private incomes: Map<string, Income>;
  private payments: Map<string, Payment>;
  private expenses: Map<string, Expense>;

  constructor() {
    this.users = new Map();
    this.creditCards = new Map();
    this.loans = new Map();
    this.monthlyPayments = new Map();
    this.incomes = new Map();
    this.payments = new Map();
    this.expenses = new Map();
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
}

export const storage = new MemStorage();
