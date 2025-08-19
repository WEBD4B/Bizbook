import db from '../config/database.js';
import { 
  users, creditCards, loans, monthlyPayments, income, payments, expenses,
  savingsGoals, budgets, investments, assets, liabilities, netWorthSnapshots,
  businessProfiles, vendors, purchaseOrders, purchaseOrderItems,
  businessCreditCards, businessLoans, businessRevenue, businessExpenses
} from '../schema/tables.js';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';

export class DatabaseService {
  
  // Generic CRUD operations
  async create(table, data) {
    const [result] = await db.insert(table).values(data).returning();
    return result;
  }

  async findMany(table, where = null, orderBy = null, limit = null) {
    let query = db.select().from(table);
    
    if (where) query = query.where(where);
    if (orderBy) query = query.orderBy(orderBy);
    if (limit) query = query.limit(limit);
    
    return await query;
  }

  async findOne(table, where) {
    const [result] = await db.select().from(table).where(where).limit(1);
    return result;
  }

  async update(table, where, data) {
    const [result] = await db.update(table).set(data).where(where).returning();
    return result;
  }

  async delete(table, where) {
    const result = await db.delete(table).where(where);
    return result.rowCount > 0;
  }

  // User operations
  async getUserById(id) {
    return this.findOne(users, eq(users.id, id));
  }

  async getUserByEmail(email) {
    return this.findOne(users, eq(users.email, email));
  }

  async getUserByUsername(username) {
    return this.findOne(users, eq(users.username, username));
  }

  async createUser(userData) {
    return this.create(users, userData);
  }

  // Credit Cards
  async getCreditCards(userId = null) {
    const where = userId ? eq(creditCards.userId, userId) : null;
    return this.findMany(creditCards, where, desc(creditCards.createdAt));
  }

  async getCreditCard(id, userId = null) {
    const where = userId 
      ? and(eq(creditCards.id, id), eq(creditCards.userId, userId))
      : eq(creditCards.id, id);
    return this.findOne(creditCards, where);
  }

  async createCreditCard(data) {
    return this.create(creditCards, data);
  }

  async updateCreditCard(id, data, userId = null) {
    const where = userId 
      ? and(eq(creditCards.id, id), eq(creditCards.userId, userId))
      : eq(creditCards.id, id);
    return this.update(creditCards, where, { ...data, updatedAt: new Date() });
  }

  async deleteCreditCard(id, userId = null) {
    const where = userId 
      ? and(eq(creditCards.id, id), eq(creditCards.userId, userId))
      : eq(creditCards.id, id);
    return this.delete(creditCards, where);
  }

  // Loans
  async getLoans(userId = null) {
    const where = userId ? eq(loans.userId, userId) : null;
    return this.findMany(loans, where, desc(loans.createdAt));
  }

  async getLoan(id, userId = null) {
    const where = userId 
      ? and(eq(loans.id, id), eq(loans.userId, userId))
      : eq(loans.id, id);
    return this.findOne(loans, where);
  }

  async createLoan(data) {
    return this.create(loans, data);
  }

  async updateLoan(id, data, userId = null) {
    const where = userId 
      ? and(eq(loans.id, id), eq(loans.userId, userId))
      : eq(loans.id, id);
    return this.update(loans, where, { ...data, updatedAt: new Date() });
  }

  async deleteLoan(id, userId = null) {
    const where = userId 
      ? and(eq(loans.id, id), eq(loans.userId, userId))
      : eq(loans.id, id);
    return this.delete(loans, where);
  }

  // Monthly Payments
  async getMonthlyPayments(userId = null) {
    const where = userId ? eq(monthlyPayments.userId, userId) : null;
    return this.findMany(monthlyPayments, where, desc(monthlyPayments.createdAt));
  }

  async createMonthlyPayment(data) {
    return this.create(monthlyPayments, data);
  }

  async updateMonthlyPayment(id, data, userId = null) {
    const where = userId 
      ? and(eq(monthlyPayments.id, id), eq(monthlyPayments.userId, userId))
      : eq(monthlyPayments.id, id);
    return this.update(monthlyPayments, where, { ...data, updatedAt: new Date() });
  }

  async deleteMonthlyPayment(id, userId = null) {
    const where = userId 
      ? and(eq(monthlyPayments.id, id), eq(monthlyPayments.userId, userId))
      : eq(monthlyPayments.id, id);
    return this.delete(monthlyPayments, where);
  }

  // Income
  async getIncomes(userId = null) {
    const where = userId ? eq(income.userId, userId) : null;
    return this.findMany(income, where, desc(income.createdAt));
  }

  async createIncome(data) {
    return this.create(income, data);
  }

  async updateIncome(id, data, userId = null) {
    const where = userId 
      ? and(eq(income.id, id), eq(income.userId, userId))
      : eq(income.id, id);
    return this.update(income, where, { ...data, updatedAt: new Date() });
  }

  async deleteIncome(id, userId = null) {
    const where = userId 
      ? and(eq(income.id, id), eq(income.userId, userId))
      : eq(income.id, id);
    return this.delete(income, where);
  }

  // Payments
  async getPayments(userId = null) {
    const where = userId ? eq(payments.userId, userId) : null;
    return this.findMany(payments, where, desc(payments.createdAt));
  }

  async getPaymentsByAccount(accountId, accountType, userId = null) {
    const where = userId 
      ? and(eq(payments.accountId, accountId), eq(payments.accountType, accountType), eq(payments.userId, userId))
      : and(eq(payments.accountId, accountId), eq(payments.accountType, accountType));
    return this.findMany(payments, where, desc(payments.paymentDate));
  }

  async createPayment(data) {
    return this.create(payments, data);
  }

  // Expenses
  async getExpenses(userId = null) {
    const where = userId ? eq(expenses.userId, userId) : null;
    return this.findMany(expenses, where, desc(expenses.expenseDate));
  }

  async getExpensesByDateRange(startDate, endDate, userId = null) {
    let where = and(
      gte(expenses.expenseDate, startDate),
      lte(expenses.expenseDate, endDate)
    );
    
    if (userId) {
      where = and(where, eq(expenses.userId, userId));
    }
    
    return this.findMany(expenses, where, desc(expenses.expenseDate));
  }

  async getExpense(id, userId = null) {
    const where = userId 
      ? and(eq(expenses.id, id), eq(expenses.userId, userId))
      : eq(expenses.id, id);
    return this.findOne(expenses, where);
  }

  async createExpense(data) {
    return this.create(expenses, data);
  }

  async updateExpense(id, data, userId = null) {
    const where = userId 
      ? and(eq(expenses.id, id), eq(expenses.userId, userId))
      : eq(expenses.id, id);
    return this.update(expenses, where, { ...data, updatedAt: new Date() });
  }

  async deleteExpense(id, userId = null) {
    const where = userId 
      ? and(eq(expenses.id, id), eq(expenses.userId, userId))
      : eq(expenses.id, id);
    return this.delete(expenses, where);
  }

  // Savings Goals
  async getSavingsGoals(userId = null) {
    const where = userId ? eq(savingsGoals.userId, userId) : null;
    return this.findMany(savingsGoals, where, desc(savingsGoals.createdAt));
  }

  async createSavingsGoal(data) {
    return this.create(savingsGoals, data);
  }

  async updateSavingsGoal(id, data, userId = null) {
    const where = userId 
      ? and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId))
      : eq(savingsGoals.id, id);
    return this.update(savingsGoals, where, { ...data, updatedAt: new Date() });
  }

  async deleteSavingsGoal(id, userId = null) {
    const where = userId 
      ? and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId))
      : eq(savingsGoals.id, id);
    return this.delete(savingsGoals, where);
  }

  // Budgets
  async getBudgets(userId = null) {
    const where = userId ? eq(budgets.userId, userId) : null;
    return this.findMany(budgets, where, desc(budgets.createdAt));
  }

  async createBudget(data) {
    return this.create(budgets, data);
  }

  async updateBudget(id, data, userId = null) {
    const where = userId 
      ? and(eq(budgets.id, id), eq(budgets.userId, userId))
      : eq(budgets.id, id);
    return this.update(budgets, where, { ...data, updatedAt: new Date() });
  }

  async deleteBudget(id, userId = null) {
    const where = userId 
      ? and(eq(budgets.id, id), eq(budgets.userId, userId))
      : eq(budgets.id, id);
    return this.delete(budgets, where);
  }

  // Investments
  async getInvestments(userId = null) {
    const where = userId ? eq(investments.userId, userId) : null;
    return this.findMany(investments, where, desc(investments.lastUpdated));
  }

  async createInvestment(data) {
    return this.create(investments, data);
  }

  async updateInvestment(id, data, userId = null) {
    const where = userId 
      ? and(eq(investments.id, id), eq(investments.userId, userId))
      : eq(investments.id, id);
    return this.update(investments, where, { ...data, lastUpdated: new Date() });
  }

  async deleteInvestment(id, userId = null) {
    const where = userId 
      ? and(eq(investments.id, id), eq(investments.userId, userId))
      : eq(investments.id, id);
    return this.delete(investments, where);
  }

  // Assets
  async getAssets(userId = null) {
    const where = userId ? eq(assets.userId, userId) : null;
    return this.findMany(assets, where, desc(assets.lastUpdated));
  }

  async createAsset(data) {
    return this.create(assets, data);
  }

  async updateAsset(id, data, userId = null) {
    const where = userId 
      ? and(eq(assets.id, id), eq(assets.userId, userId))
      : eq(assets.id, id);
    return this.update(assets, where, { ...data, lastUpdated: new Date() });
  }

  async deleteAsset(id, userId = null) {
    const where = userId 
      ? and(eq(assets.id, id), eq(assets.userId, userId))
      : eq(assets.id, id);
    return this.delete(assets, where);
  }

  // Liabilities
  async getLiabilities(userId = null) {
    const where = userId ? eq(liabilities.userId, userId) : null;
    return this.findMany(liabilities, where, desc(liabilities.lastUpdated));
  }

  async createLiability(data) {
    return this.create(liabilities, data);
  }

  async updateLiability(id, data, userId = null) {
    const where = userId 
      ? and(eq(liabilities.id, id), eq(liabilities.userId, userId))
      : eq(liabilities.id, id);
    return this.update(liabilities, where, { ...data, lastUpdated: new Date() });
  }

  async deleteLiability(id, userId = null) {
    const where = userId 
      ? and(eq(liabilities.id, id), eq(liabilities.userId, userId))
      : eq(liabilities.id, id);
    return this.delete(liabilities, where);
  }

  // Net Worth Snapshots
  async getNetWorthSnapshots(userId = null) {
    const where = userId ? eq(netWorthSnapshots.userId, userId) : null;
    return this.findMany(netWorthSnapshots, where, desc(netWorthSnapshots.snapshotDate));
  }

  async getLatestNetWorthSnapshot(userId = null) {
    const where = userId ? eq(netWorthSnapshots.userId, userId) : null;
    const [result] = await this.findMany(netWorthSnapshots, where, desc(netWorthSnapshots.snapshotDate), 1);
    return result;
  }

  async createNetWorthSnapshot(data) {
    return this.create(netWorthSnapshots, data);
  }

  // Business Profiles
  async getBusinessProfiles(userId = null) {
    const where = userId ? eq(businessProfiles.userId, userId) : null;
    return this.findMany(businessProfiles, where, desc(businessProfiles.createdAt));
  }

  async getBusinessProfile(id, userId = null) {
    const where = userId 
      ? and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId))
      : eq(businessProfiles.id, id);
    return this.findOne(businessProfiles, where);
  }

  async createBusinessProfile(data) {
    return this.create(businessProfiles, data);
  }

  async updateBusinessProfile(id, data, userId = null) {
    const where = userId 
      ? and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId))
      : eq(businessProfiles.id, id);
    return this.update(businessProfiles, where, { ...data, updatedAt: new Date() });
  }

  async deleteBusinessProfile(id, userId = null) {
    const where = userId 
      ? and(eq(businessProfiles.id, id), eq(businessProfiles.userId, userId))
      : eq(businessProfiles.id, id);
    return this.delete(businessProfiles, where);
  }

  // Vendors
  async getVendors(userId = null) {
    const where = userId ? eq(vendors.userId, userId) : null;
    return this.findMany(vendors, where, asc(vendors.companyName));
  }

  async getVendor(id, userId = null) {
    const where = userId 
      ? and(eq(vendors.id, id), eq(vendors.userId, userId))
      : eq(vendors.id, id);
    return this.findOne(vendors, where);
  }

  async createVendor(data) {
    return this.create(vendors, data);
  }

  async updateVendor(id, data, userId = null) {
    const where = userId 
      ? and(eq(vendors.id, id), eq(vendors.userId, userId))
      : eq(vendors.id, id);
    return this.update(vendors, where, { ...data, updatedAt: new Date() });
  }

  async deleteVendor(id, userId = null) {
    const where = userId 
      ? and(eq(vendors.id, id), eq(vendors.userId, userId))
      : eq(vendors.id, id);
    return this.delete(vendors, where);
  }

  // Purchase Orders
  async getPurchaseOrders(userId = null) {
    const where = userId ? eq(purchaseOrders.userId, userId) : null;
    return this.findMany(purchaseOrders, where, desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrdersByBusiness(businessProfileId, userId = null) {
    const where = userId 
      ? and(eq(purchaseOrders.businessProfileId, businessProfileId), eq(purchaseOrders.userId, userId))
      : eq(purchaseOrders.businessProfileId, businessProfileId);
    return this.findMany(purchaseOrders, where, desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id, userId = null) {
    const where = userId 
      ? and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, userId))
      : eq(purchaseOrders.id, id);
    return this.findOne(purchaseOrders, where);
  }

  async createPurchaseOrder(data) {
    return this.create(purchaseOrders, data);
  }

  async updatePurchaseOrder(id, data, userId = null) {
    const where = userId 
      ? and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, userId))
      : eq(purchaseOrders.id, id);
    return this.update(purchaseOrders, where, { ...data, updatedAt: new Date() });
  }

  async deletePurchaseOrder(id, userId = null) {
    const where = userId 
      ? and(eq(purchaseOrders.id, id), eq(purchaseOrders.userId, userId))
      : eq(purchaseOrders.id, id);
    return this.delete(purchaseOrders, where);
  }

  // Purchase Order Items
  async getPurchaseOrderItems(purchaseOrderId) {
    return this.findMany(purchaseOrderItems, eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId), asc(purchaseOrderItems.lineNumber));
  }

  async createPurchaseOrderItem(data) {
    return this.create(purchaseOrderItems, data);
  }

  async updatePurchaseOrderItem(id, data) {
    return this.update(purchaseOrderItems, eq(purchaseOrderItems.id, id), data);
  }

  async deletePurchaseOrderItem(id) {
    return this.delete(purchaseOrderItems, eq(purchaseOrderItems.id, id));
  }

  // Business Credit Cards
  async getBusinessCreditCards(userId = null) {
    const where = userId ? eq(businessCreditCards.userId, userId) : null;
    return this.findMany(businessCreditCards, where, desc(businessCreditCards.createdAt));
  }

  async createBusinessCreditCard(data) {
    return this.create(businessCreditCards, data);
  }

  async updateBusinessCreditCard(id, data, userId = null) {
    const where = userId 
      ? and(eq(businessCreditCards.id, id), eq(businessCreditCards.userId, userId))
      : eq(businessCreditCards.id, id);
    return this.update(businessCreditCards, where, { ...data, updatedAt: new Date() });
  }

  async deleteBusinessCreditCard(id, userId = null) {
    const where = userId 
      ? and(eq(businessCreditCards.id, id), eq(businessCreditCards.userId, userId))
      : eq(businessCreditCards.id, id);
    return this.delete(businessCreditCards, where);
  }

  // Business Loans
  async getBusinessLoans(userId = null) {
    const where = userId ? eq(businessLoans.userId, userId) : null;
    return this.findMany(businessLoans, where, desc(businessLoans.createdAt));
  }

  async createBusinessLoan(data) {
    return this.create(businessLoans, data);
  }

  async updateBusinessLoan(id, data, userId = null) {
    const where = userId 
      ? and(eq(businessLoans.id, id), eq(businessLoans.userId, userId))
      : eq(businessLoans.id, id);
    return this.update(businessLoans, where, { ...data, updatedAt: new Date() });
  }

  async deleteBusinessLoan(id, userId = null) {
    const where = userId 
      ? and(eq(businessLoans.id, id), eq(businessLoans.userId, userId))
      : eq(businessLoans.id, id);
    return this.delete(businessLoans, where);
  }

  // Business Revenue
  async getBusinessRevenue(userId = null) {
    const where = userId ? eq(businessRevenue.userId, userId) : null;
    return this.findMany(businessRevenue, where, desc(businessRevenue.revenueDate));
  }

  async createBusinessRevenue(data) {
    return this.create(businessRevenue, data);
  }

  // Business Expenses
  async getBusinessExpenses(userId = null) {
    const where = userId ? eq(businessExpenses.userId, userId) : null;
    return this.findMany(businessExpenses, where, desc(businessExpenses.expenseDate));
  }

  async createBusinessExpense(data) {
    return this.create(businessExpenses, data);
  }
}

export const dbService = new DatabaseService();
