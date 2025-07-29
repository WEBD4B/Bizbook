import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCreditCardSchema, insertLoanSchema } from "@shared/schema";
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
