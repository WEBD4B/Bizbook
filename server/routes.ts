import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCreditCardSchema, 
  insertLoanSchema, 
  insertMonthlyPaymentSchema,
  insertIncomeSchema,
  insertPaymentSchema,
  insertExpenseSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
