import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCreditCardSchema, 
  insertLoanSchema, 
  insertMonthlyPaymentSchema,
  insertIncomeSchema,
  insertPaymentSchema,
  insertExpenseSchema,
  insertSavingsGoalSchema,
  insertBudgetSchema,
  insertInvestmentSchema,
  insertAssetSchema,
  insertLiabilitySchema,
  insertNetWorthSnapshotSchema,
  insertBusinessRevenueSchema,
  insertBusinessExpenseSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Credit Cards routes
  app.get("/api/credit-cards", async (req, res) => {
    try {
      const creditCards = await storage.getCreditCards();
      res.json(creditCards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit cards" });
    }
  });

  app.get("/api/credit-cards/:id", async (req, res) => {
    try {
      const creditCard = await storage.getCreditCard(req.params.id);
      if (!creditCard) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.json(creditCard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch credit card" });
    }
  });

  app.post("/api/credit-cards", async (req, res) => {
    try {
      const validatedData = insertCreditCardSchema.parse(req.body);
      const creditCard = await storage.createCreditCard(validatedData);
      res.status(201).json(creditCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create credit card" });
    }
  });

  app.patch("/api/credit-cards/:id", async (req, res) => {
    try {
      const partialData = insertCreditCardSchema.partial().parse(req.body);
      const creditCard = await storage.updateCreditCard(req.params.id, partialData);
      if (!creditCard) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.json(creditCard);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update credit card" });
    }
  });

  app.delete("/api/credit-cards/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCreditCard(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Credit card not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete credit card" });
    }
  });

  // Loans routes
  app.get("/api/loans", async (req, res) => {
    try {
      const loans = await storage.getLoans();
      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loans" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.getLoan(req.params.id);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loan" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const validatedData = insertLoanSchema.parse(req.body);
      const loan = await storage.createLoan(validatedData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create loan" });
    }
  });

  app.patch("/api/loans/:id", async (req, res) => {
    try {
      const partialData = insertLoanSchema.partial().parse(req.body);
      const loan = await storage.updateLoan(req.params.id, partialData);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.json(loan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update loan" });
    }
  });

  app.delete("/api/loans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLoan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Loan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete loan" });
    }
  });

  // Monthly Payments routes
  app.get("/api/monthly-payments", async (req, res) => {
    try {
      const monthlyPayments = await storage.getMonthlyPayments();
      res.json(monthlyPayments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly payments" });
    }
  });

  app.post("/api/monthly-payments", async (req, res) => {
    try {
      const validatedData = insertMonthlyPaymentSchema.parse(req.body);
      const monthlyPayment = await storage.createMonthlyPayment(validatedData);
      res.status(201).json(monthlyPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create monthly payment" });
    }
  });

  app.patch("/api/monthly-payments/:id", async (req, res) => {
    try {
      const partialData = insertMonthlyPaymentSchema.partial().parse(req.body);
      const monthlyPayment = await storage.updateMonthlyPayment(req.params.id, partialData);
      if (!monthlyPayment) {
        return res.status(404).json({ message: "Monthly payment not found" });
      }
      res.json(monthlyPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update monthly payment" });
    }
  });

  app.delete("/api/monthly-payments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMonthlyPayment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Monthly payment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete monthly payment" });
    }
  });

  // Income routes
  app.get("/api/income", async (req, res) => {
    try {
      const incomes = await storage.getIncomes();
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  app.post("/api/income", async (req, res) => {
    try {
      const validatedData = insertIncomeSchema.parse(req.body);
      const income = await storage.createIncome(validatedData);
      res.status(201).json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  app.patch("/api/income/:id", async (req, res) => {
    try {
      const partialData = insertIncomeSchema.partial().parse(req.body);
      const income = await storage.updateIncome(req.params.id, partialData);
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.json(income);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update income" });
    }
  });

  app.delete("/api/income/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteIncome(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Income not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Payments routes
  app.get("/api/payments", async (req, res) => {
    try {
      const { accountId, accountType } = req.query;
      if (accountId && accountType) {
        const payments = await storage.getPaymentsByAccount(accountId as string, accountType as string);
        res.json(payments);
      } else {
        const payments = await storage.getPayments();
        res.json(payments);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (startDate && endDate) {
        const expenses = await storage.getExpensesByDateRange(startDate as string, endDate as string);
        res.json(expenses);
      } else {
        const expenses = await storage.getExpenses();
        res.json(expenses);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(req.params.id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExpense(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Financial calculations endpoint
  app.post("/api/calculate-payoff", async (req, res) => {
    try {
      const { balance, interestRate, monthlyPayment, extraPayment = 0 } = req.body;
      
      if (!balance || !interestRate || !monthlyPayment) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const monthlyRate = parseFloat(interestRate) / 100 / 12;
      const totalPayment = parseFloat(monthlyPayment) + parseFloat(extraPayment);
      let remainingBalance = parseFloat(balance);
      let months = 0;
      let totalInterest = 0;

      while (remainingBalance > 0 && months < 1200) { // Max 100 years to prevent infinite loop
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = Math.min(totalPayment - interestPayment, remainingBalance);
        
        remainingBalance -= principalPayment;
        totalInterest += interestPayment;
        months++;

        if (principalPayment <= 0) break; // Prevent infinite loop if payment too small
      }

      res.json({
        months,
        totalInterest: totalInterest.toFixed(2),
        payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate payoff" });
    }
  });

  // Savings Goals routes
  app.get("/api/savings-goals", async (req, res) => {
    try {
      const goals = await storage.getSavingsGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch savings goals" });
    }
  });

  app.post("/api/savings-goals", async (req, res) => {
    try {
      const validatedData = insertSavingsGoalSchema.parse(req.body);
      const goal = await storage.createSavingsGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid savings goal data" });
    }
  });

  app.put("/api/savings-goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const goal = await storage.updateSavingsGoal(id, req.body);
      if (!goal) {
        return res.status(404).json({ error: "Savings goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ error: "Failed to update savings goal" });
    }
  });

  app.delete("/api/savings-goals/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSavingsGoal(id);
      if (!deleted) {
        return res.status(404).json({ error: "Savings goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete savings goal" });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getBudgets();
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const validatedData = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget(validatedData);
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ error: "Invalid budget data" });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const budget = await storage.updateBudget(id, req.body);
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      res.status(400).json({ error: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBudget(id);
      if (!deleted) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });

  // Investment routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch investments" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const validatedData = insertInvestmentSchema.parse(req.body);
      const investment = await storage.createInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      res.status(400).json({ error: "Invalid investment data" });
    }
  });

  app.put("/api/investments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const investment = await storage.updateInvestment(id, req.body);
      if (!investment) {
        return res.status(404).json({ error: "Investment not found" });
      }
      res.json(investment);
    } catch (error) {
      res.status(400).json({ error: "Failed to update investment" });
    }
  });

  app.delete("/api/investments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvestment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Investment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete investment" });
    }
  });

  // Asset routes
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Invalid asset data" });
    }
  });

  app.put("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.updateAsset(id, req.body);
      if (!asset) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(400).json({ error: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAsset(id);
      if (!deleted) {
        return res.status(404).json({ error: "Asset not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete asset" });
    }
  });

  // Liability routes
  app.get("/api/liabilities", async (req, res) => {
    try {
      const liabilities = await storage.getLiabilities();
      res.json(liabilities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liabilities" });
    }
  });

  app.post("/api/liabilities", async (req, res) => {
    try {
      const validatedData = insertLiabilitySchema.parse(req.body);
      const liability = await storage.createLiability(validatedData);
      res.status(201).json(liability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(400).json({ error: "Invalid liability data" });
    }
  });

  app.put("/api/liabilities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const liability = await storage.updateLiability(id, req.body);
      if (!liability) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.json(liability);
    } catch (error) {
      res.status(400).json({ error: "Failed to update liability" });
    }
  });

  app.delete("/api/liabilities/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLiability(id);
      if (!deleted) {
        return res.status(404).json({ error: "Liability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete liability" });
    }
  });

  // Net Worth Snapshot routes
  app.get("/api/net-worth-snapshots", async (req, res) => {
    try {
      const snapshots = await storage.getNetWorthSnapshots();
      res.json(snapshots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch net worth snapshots" });
    }
  });

  app.get("/api/net-worth-snapshots/latest", async (req, res) => {
    try {
      const snapshot = await storage.getLatestNetWorthSnapshot();
      if (!snapshot) {
        return res.status(404).json({ error: "No net worth snapshots found" });
      }
      res.json(snapshot);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest net worth snapshot" });
    }
  });

  app.post("/api/net-worth-snapshots", async (req, res) => {
    try {
      const validatedData = insertNetWorthSnapshotSchema.parse(req.body);
      const snapshot = await storage.createNetWorthSnapshot(validatedData);
      res.status(201).json(snapshot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(400).json({ error: "Invalid net worth snapshot data" });
    }
  });

  // Calculate Net Worth endpoint
  app.post("/api/calculate-net-worth", async (req, res) => {
    try {
      const assets = await storage.getAssets();
      const liabilities = await storage.getLiabilities();

      // Calculate total assets by category
      const assetsByCategory = assets.reduce((acc, asset) => {
        const value = parseFloat(asset.currentValue) || 0;
        const adjustedValue = value * (parseFloat(asset.ownershipPercentage || "100") / 100);
        
        switch (asset.assetType) {
          case 'cash_liquid':
            acc.cashLiquidAssets += adjustedValue;
            break;
          case 'investments':
            acc.investmentAssets += adjustedValue;
            break;
          case 'real_estate':
            acc.realEstateAssets += adjustedValue;
            break;
          case 'vehicles':
            acc.vehicleAssets += adjustedValue;
            break;
          case 'personal_property':
            acc.personalPropertyAssets += adjustedValue;
            break;
          case 'business':
            acc.businessAssets += adjustedValue;
            break;
        }
        return acc;
      }, {
        cashLiquidAssets: 0,
        investmentAssets: 0,
        realEstateAssets: 0,
        vehicleAssets: 0,
        personalPropertyAssets: 0,
        businessAssets: 0
      });

      // Calculate total liabilities by category
      const liabilitiesByCategory = liabilities.reduce((acc, liability) => {
        const balance = parseFloat(liability.currentBalance) || 0;
        
        switch (liability.liabilityType) {
          case 'consumer_debt':
            acc.consumerDebt += balance;
            break;
          case 'vehicle_loans':
            acc.vehicleLoans += balance;
            break;
          case 'real_estate':
            acc.realEstateDebt += balance;
            break;
          case 'education':
            acc.educationDebt += balance;
            break;
          case 'business':
            acc.businessDebt += balance;
            break;
          case 'taxes_bills':
            acc.taxesBills += balance;
            break;
        }
        return acc;
      }, {
        consumerDebt: 0,
        vehicleLoans: 0,
        realEstateDebt: 0,
        educationDebt: 0,
        businessDebt: 0,
        taxesBills: 0
      });

      const totalAssets = Object.values(assetsByCategory).reduce((sum, value) => sum + value, 0);
      const totalLiabilities = Object.values(liabilitiesByCategory).reduce((sum, value) => sum + value, 0);
      const netWorth = totalAssets - totalLiabilities;
      
      // Calculate buying power: liquid assets + available credit from credit cards
      const creditCards = await storage.getCreditCards();
      const availableCredit = creditCards.reduce((sum, card) => {
        const limit = parseFloat(card.creditLimit || "0");
        const balance = parseFloat(card.balance || "0");
        return sum + Math.max(0, limit - balance);
      }, 0);
      
      const buyingPower = assetsByCategory.cashLiquidAssets + availableCredit;

      const calculation = {
        totalAssets: totalAssets.toFixed(2),
        totalLiabilities: totalLiabilities.toFixed(2),
        netWorth: netWorth.toFixed(2),
        buyingPower: buyingPower.toFixed(2),
        liquidAssets: assetsByCategory.cashLiquidAssets.toFixed(2),
        availableCredit: availableCredit.toFixed(2),
        ...Object.fromEntries(
          Object.entries(assetsByCategory).map(([key, value]) => [key, value.toFixed(2)])
        ),
        ...Object.fromEntries(
          Object.entries(liabilitiesByCategory).map(([key, value]) => [key, value.toFixed(2)])
        )
      };

      res.json(calculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate net worth" });
    }
  });

  // Business expense routes
  app.get("/api/business-expenses", async (req, res) => {
    try {
      const expenses = await storage.getBusinessExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business expenses" });
    }
  });

  app.post("/api/business-expenses", async (req, res) => {
    try {
      const expense = await storage.createBusinessExpense(req.body);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business expense" });
    }
  });

  // Business revenue routes
  app.get("/api/business-revenue", async (req, res) => {
    try {
      const revenue = await storage.getBusinessRevenue();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business revenue" });
    }
  });

  app.post("/api/business-revenue", async (req, res) => {
    try {
      const validatedData = insertBusinessRevenueSchema.parse(req.body);
      const revenue = await storage.createBusinessRevenue(validatedData);
      res.status(201).json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ error: "Failed to create business revenue" });
    }
  });

  // Tax document routes
  app.get("/api/tax-documents", async (req, res) => {
    try {
      const documents = await storage.getTaxDocuments();
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tax documents" });
    }
  });

  app.post("/api/tax-documents", async (req, res) => {
    try {
      const document = await storage.createTaxDocument(req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to create tax document" });
    }
  });

  // Sales tax settings routes
  app.get("/api/sales-tax-settings", async (req, res) => {
    try {
      const settings = await storage.getSalesTaxSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales tax settings" });
    }
  });

  app.post("/api/sales-tax-settings", async (req, res) => {
    try {
      const setting = await storage.createSalesTaxSetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sales tax setting" });
    }
  });

  // Business info routes
  app.get("/api/business-info", async (req, res) => {
    try {
      const info = await storage.getBusinessInfo();
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business info" });
    }
  });

  app.post("/api/business-info", async (req, res) => {
    try {
      const info = await storage.createBusinessInfo(req.body);
      res.status(201).json(info);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business info" });
    }
  });

  // Payment methods routes
  app.get("/api/payment-methods", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", async (req, res) => {
    try {
      const method = await storage.createPaymentMethod(req.body);
      res.status(201).json(method);
    } catch (error) {
      res.status(500).json({ error: "Failed to create payment method" });
    }
  });

  // Additional tax routes
  app.post("/api/sales-tax-returns", async (req, res) => {
    try {
      const returnDoc = await storage.createSalesTaxReturn(req.body);
      res.status(201).json(returnDoc);
    } catch (error) {
      res.status(500).json({ error: "Failed to create sales tax return" });
    }
  });

  app.post("/api/expense-reports", async (req, res) => {
    try {
      const report = await storage.createExpenseReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to create expense report" });
    }
  });

  app.post("/api/schedule-c", async (req, res) => {
    try {
      const scheduleC = await storage.createScheduleC(req.body);
      res.status(201).json(scheduleC);
    } catch (error) {
      res.status(500).json({ error: "Failed to create Schedule C" });
    }
  });

  app.post("/api/shopify-integration", async (req, res) => {
    try {
      const integration = await storage.createShopifyIntegration(req.body);
      res.status(201).json(integration);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect Shopify store" });
    }
  });

  // CSV import route with multer support
  app.post("/api/shopify-csv-import", async (req, res) => {
    try {
      // In a real implementation, you'd use multer to handle file uploads
      // For now, we'll simulate processing the CSV data
      const orders = await storage.processShopifyCsv(req.body);
      res.status(201).json({ count: orders.length, orders });
    } catch (error) {
      res.status(500).json({ error: "Failed to import CSV file" });
    }
  });

  app.get("/api/shopify-orders", async (req, res) => {
    try {
      const orders = await storage.getShopifyOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch Shopify orders" });
    }
  });

  // Business Profile routes
  app.get("/api/business-profiles", async (req, res) => {
    try {
      const profiles = await storage.getBusinessProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business profiles" });
    }
  });

  app.post("/api/business-profiles", async (req, res) => {
    try {
      const profile = await storage.createBusinessProfile(req.body);
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create business profile" });
    }
  });

  app.get("/api/business-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business profile" });
    }
  });

  app.put("/api/business-profiles/:id", async (req, res) => {
    try {
      const profile = await storage.updateBusinessProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update business profile" });
    }
  });

  app.delete("/api/business-profiles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBusinessProfile(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete business profile" });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const { businessProfileId } = req.query;
      if (businessProfileId) {
        const orders = await storage.getPurchaseOrdersByBusiness(businessProfileId as string);
        res.json(orders);
      } else {
        const orders = await storage.getPurchaseOrders();
        res.json(orders);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase orders" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const order = await storage.createPurchaseOrder(req.body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create purchase order" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.getPurchaseOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order" });
    }
  });

  app.put("/api/purchase-orders/:id", async (req, res) => {
    try {
      const order = await storage.updatePurchaseOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update purchase order" });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrder(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order" });
    }
  });

  // Purchase Order Items routes
  app.get("/api/purchase-orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getPurchaseOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch purchase order items" });
    }
  });

  app.post("/api/purchase-order-items", async (req, res) => {
    try {
      const item = await storage.createPurchaseOrderItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to create purchase order item" });
    }
  });

  app.put("/api/purchase-order-items/:id", async (req, res) => {
    try {
      const item = await storage.updatePurchaseOrderItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update purchase order item" });
    }
  });

  app.delete("/api/purchase-order-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePurchaseOrderItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Purchase order item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete purchase order item" });
    }
  });

  // Business Revenue routes
  app.get("/api/business-revenue", async (req, res) => {
    try {
      const revenue = await storage.getAllBusinessRevenue();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business revenue" });
    }
  });

  app.post("/api/business-revenue", async (req, res) => {
    try {
      const validatedData = insertBusinessRevenueSchema.parse(req.body);
      const revenue = await storage.createBusinessRevenue(validatedData);
      res.status(201).json(revenue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business revenue" });
    }
  });

  // Business Expenses routes
  app.get("/api/business-expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllBusinessExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business expenses" });
    }
  });

  app.post("/api/business-expenses", async (req, res) => {
    try {
      const validatedData = insertBusinessExpenseSchema.parse(req.body);
      const expense = await storage.createBusinessExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business expense" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
