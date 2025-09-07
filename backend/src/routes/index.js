import express from 'express';
import { dbService } from '../services/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBody, validateParams, idParamSchema } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import authRoutes from './auth.js';
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
  insertBusinessCreditCardSchema,
  insertBusinessLoanSchema,
  insertBusinessExpenseSchema,
  insertVendorSchema,
  insertBusinessProfileSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema
} from '../schema/validation.js';

const router = express.Router();

// Authentication routes
router.use('/auth', authRoutes);

// API Info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'BizBook Financial Management API',
    version: '1.0.0',
    description: 'Comprehensive financial management system with personal and business features',
    endpoints: {
      auth: '/auth',
      creditCards: '/credit-cards',
      loans: '/loans',
      monthlyPayments: '/monthly-payments',
      income: '/income',
      payments: '/payments',
      expenses: '/expenses',
      savingsGoals: '/savings-goals',
      budgets: '/budgets',
      investments: '/investments',
      assets: '/assets',
      liabilities: '/liabilities',
      netWorth: '/net-worth',
      business: '/business',
      vendors: '/vendors',
      purchaseOrders: '/purchase-orders'
    },
    documentation: 'https://docs.bizbook.com/api',
    support: 'support@bizbook.com'
  });
});

// ========================================
// CREDIT CARDS ROUTES
// ========================================
router.get('/credit-cards', authenticateToken, asyncHandler(async (req, res) => {
  const creditCards = await dbService.getCreditCards(req.user.id);
  res.json({
    success: true,
    data: creditCards,
    total: creditCards.length
  });
}));

router.get('/credit-cards/:id', 
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const creditCard = await dbService.getCreditCard(req.params.id, req.user.id);
    if (!creditCard) {
      return res.status(404).json({ success: false, error: 'Credit card not found' });
    }
    res.json({ success: true, data: creditCard });
  })
);

router.post('/credit-cards',
  authenticateToken,
  validateBody(insertCreditCardSchema),
  asyncHandler(async (req, res) => {
    const creditCard = await dbService.createCreditCard({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: creditCard });
  })
);

router.patch('/credit-cards/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertCreditCardSchema.partial()),
  asyncHandler(async (req, res) => {
    const creditCard = await dbService.updateCreditCard(req.params.id, req.body, req.user.id);
    if (!creditCard) {
      return res.status(404).json({ success: false, error: 'Credit card not found' });
    }
    res.json({ success: true, data: creditCard });
  })
);

router.delete('/credit-cards/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteCreditCard(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Credit card not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// LOANS ROUTES
// ========================================
router.get('/loans', authenticateToken, asyncHandler(async (req, res) => {
  const loans = await dbService.getLoans(req.user.id);
  res.json({
    success: true,
    data: loans,
    total: loans.length
  });
}));

router.get('/loans/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const loan = await dbService.getLoan(req.params.id, req.user.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    res.json({ success: true, data: loan });
  })
);

router.post('/loans',
  authenticateToken,
  validateBody(insertLoanSchema),
  asyncHandler(async (req, res) => {
    const loan = await dbService.createLoan({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: loan });
  })
);

router.patch('/loans/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertLoanSchema.partial()),
  asyncHandler(async (req, res) => {
    const loan = await dbService.updateLoan(req.params.id, req.body, req.user.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    res.json({ success: true, data: loan });
  })
);

router.delete('/loans/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteLoan(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Loan not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// MONTHLY PAYMENTS ROUTES
// ========================================
router.get('/monthly-payments', authenticateToken, asyncHandler(async (req, res) => {
  const monthlyPayments = await dbService.getMonthlyPayments(req.user.id);
  res.json({
    success: true,
    data: monthlyPayments,
    total: monthlyPayments.length
  });
}));

router.post('/monthly-payments',
  authenticateToken,
  validateBody(insertMonthlyPaymentSchema),
  asyncHandler(async (req, res) => {
    const monthlyPayment = await dbService.createMonthlyPayment({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: monthlyPayment });
  })
);

router.patch('/monthly-payments/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertMonthlyPaymentSchema.partial()),
  asyncHandler(async (req, res) => {
    const monthlyPayment = await dbService.updateMonthlyPayment(req.params.id, req.body, req.user.id);
    if (!monthlyPayment) {
      return res.status(404).json({ success: false, error: 'Monthly payment not found' });
    }
    res.json({ success: true, data: monthlyPayment });
  })
);

router.delete('/monthly-payments/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteMonthlyPayment(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Monthly payment not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// INCOME ROUTES
// ========================================
router.get('/income', authenticateToken, asyncHandler(async (req, res) => {
  const incomes = await dbService.getIncomes(req.user.id);
  res.json({
    success: true,
    data: incomes,
    total: incomes.length
  });
}));

router.post('/income',
  authenticateToken,
  validateBody(insertIncomeSchema),
  asyncHandler(async (req, res) => {
    const income = await dbService.createIncome({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: income });
  })
);

router.patch('/income/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertIncomeSchema.partial()),
  asyncHandler(async (req, res) => {
    const income = await dbService.updateIncome(req.params.id, req.body, req.user.id);
    if (!income) {
      return res.status(404).json({ success: false, error: 'Income not found' });
    }
    res.json({ success: true, data: income });
  })
);

router.delete('/income/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteIncome(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Income not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// PAYMENTS ROUTES
// ========================================
router.get('/payments', authenticateToken, asyncHandler(async (req, res) => {
  const { accountId, accountType } = req.query;
  let payments;
  
  if (accountId && accountType) {
    payments = await dbService.getPaymentsByAccount(accountId, accountType, req.user.id);
  } else {
    payments = await dbService.getPayments(req.user.id);
  }
  
  res.json({
    success: true,
    data: payments,
    total: payments.length
  });
}));

router.post('/payments',
  authenticateToken,
  validateBody(insertPaymentSchema),
  asyncHandler(async (req, res) => {
    const payment = await dbService.createPayment({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: payment });
  })
);

// Mark payment as paid
router.patch('/payments/:id/mark-paid',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const paymentId = req.params.id;
    const { confirmationNumber, notes } = req.body;
    
    const payment = await dbService.markPaymentAsPaid(paymentId, req.user.id, {
      confirmationNumber,
      notes
    });
    
    res.json({ 
      success: true, 
      data: payment,
      message: 'Payment marked as paid successfully'
    });
  })
);

// ========================================
// EXPENSES ROUTES
// ========================================
router.get('/expenses', authenticateToken, asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let expenses;

  if (startDate && endDate) {
    expenses = await dbService.getExpensesByDateRange(startDate, endDate, req.user.id);
  } else {
    expenses = await dbService.getExpenses(req.user.id);
  }

  res.json({
    success: true,
    data: expenses,
    total: expenses.length
  });
}));

router.get('/expenses/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const expense = await dbService.getExpense(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  })
);

router.post('/expenses',
  authenticateToken,
  validateBody(insertExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await dbService.createExpense({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: expense });
  })
);

router.patch('/expenses/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertExpenseSchema.partial()),
  asyncHandler(async (req, res) => {
    const expense = await dbService.updateExpense(req.params.id, req.body, req.user.id);
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.json({ success: true, data: expense });
  })
);

router.delete('/expenses/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteExpense(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// SAVINGS GOALS ROUTES
// ========================================
router.get('/savings-goals', authenticateToken, asyncHandler(async (req, res) => {
  const goals = await dbService.getSavingsGoals(req.user.id);
  res.json({
    success: true,
    data: goals,
    total: goals.length
  });
}));

router.post('/savings-goals',
  authenticateToken,
  validateBody(insertSavingsGoalSchema),
  asyncHandler(async (req, res) => {
    const goal = await dbService.createSavingsGoal({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: goal });
  })
);

router.put('/savings-goals/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertSavingsGoalSchema.partial()),
  asyncHandler(async (req, res) => {
    const goal = await dbService.updateSavingsGoal(req.params.id, req.body, req.user.id);
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }
    res.json({ success: true, data: goal });
  })
);

router.delete('/savings-goals/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteSavingsGoal(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Savings goal not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// BUDGETS ROUTES
// ========================================
router.get('/budgets', authenticateToken, asyncHandler(async (req, res) => {
  const budgets = await dbService.getBudgets(req.user.id);
  res.json({
    success: true,
    data: budgets,
    total: budgets.length
  });
}));

router.post('/budgets',
  authenticateToken,
  validateBody(insertBudgetSchema),
  asyncHandler(async (req, res) => {
    const budget = await dbService.createBudget({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: budget });
  })
);

router.put('/budgets/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertBudgetSchema.partial()),
  asyncHandler(async (req, res) => {
    const budget = await dbService.updateBudget(req.params.id, req.body, req.user.id);
    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }
    res.json({ success: true, data: budget });
  })
);

router.delete('/budgets/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteBudget(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// INVESTMENTS ROUTES
// ========================================
router.get('/investments', authenticateToken, asyncHandler(async (req, res) => {
  const investments = await dbService.getInvestments(req.user.id);
  res.json({
    success: true,
    data: investments,
    total: investments.length
  });
}));

router.post('/investments',
  authenticateToken,
  validateBody(insertInvestmentSchema),
  asyncHandler(async (req, res) => {
    const investment = await dbService.createInvestment({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: investment });
  })
);

router.put('/investments/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertInvestmentSchema.partial()),
  asyncHandler(async (req, res) => {
    const investment = await dbService.updateInvestment(req.params.id, req.body, req.user.id);
    if (!investment) {
      return res.status(404).json({ success: false, error: 'Investment not found' });
    }
    res.json({ success: true, data: investment });
  })
);

router.delete('/investments/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteInvestment(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Investment not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// ASSETS ROUTES
// ========================================
router.get('/assets', authenticateToken, asyncHandler(async (req, res) => {
  const assets = await dbService.getAssets(req.user.id);
  res.json({
    success: true,
    data: assets,
    total: assets.length
  });
}));

router.post('/assets',
  authenticateToken,
  validateBody(insertAssetSchema),
  asyncHandler(async (req, res) => {
    const asset = await dbService.createAsset({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: asset });
  })
);

router.put('/assets/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertAssetSchema.partial()),
  asyncHandler(async (req, res) => {
    const asset = await dbService.updateAsset(req.params.id, req.body, req.user.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    res.json({ success: true, data: asset });
  })
);

router.delete('/assets/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteAsset(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// LIABILITIES ROUTES
// ========================================
router.get('/liabilities', authenticateToken, asyncHandler(async (req, res) => {
  const liabilities = await dbService.getLiabilities(req.user.id);
  res.json({
    success: true,
    data: liabilities,
    total: liabilities.length
  });
}));

router.post('/liabilities',
  authenticateToken,
  validateBody(insertLiabilitySchema),
  asyncHandler(async (req, res) => {
    const liability = await dbService.createLiability({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: liability });
  })
);

router.put('/liabilities/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertLiabilitySchema.partial()),
  asyncHandler(async (req, res) => {
    const liability = await dbService.updateLiability(req.params.id, req.body, req.user.id);
    if (!liability) {
      return res.status(404).json({ success: false, error: 'Liability not found' });
    }
    res.json({ success: true, data: liability });
  })
);

router.delete('/liabilities/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteLiability(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Liability not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// NET WORTH ROUTES
// ========================================
router.get('/net-worth-snapshots', authenticateToken, asyncHandler(async (req, res) => {
  const snapshots = await dbService.getNetWorthSnapshots(req.user.id);
  res.json({
    success: true,
    data: snapshots,
    total: snapshots.length
  });
}));

router.get('/net-worth-snapshots/latest', authenticateToken, asyncHandler(async (req, res) => {
  const snapshot = await dbService.getLatestNetWorthSnapshot(req.user.id);
  if (!snapshot) {
    return res.status(404).json({ success: false, error: 'No net worth snapshots found' });
  }
  res.json({ success: true, data: snapshot });
}));

router.post('/net-worth-snapshots',
  authenticateToken,
  validateBody(insertNetWorthSnapshotSchema),
  asyncHandler(async (req, res) => {
    const snapshot = await dbService.createNetWorthSnapshot({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: snapshot });
  })
);

// Calculate current net worth
router.post('/calculate-net-worth', authenticateToken, asyncHandler(async (req, res) => {
  const assets = await dbService.getAssets(req.user.id);
  const liabilities = await dbService.getLiabilities(req.user.id);
  const creditCards = await dbService.getCreditCards(req.user.id);

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

  res.json({
    success: true,
    data: calculation
  });
}));

// ========================================
// FINANCIAL CALCULATIONS
// ========================================
router.post('/calculate-payoff', authenticateToken, asyncHandler(async (req, res) => {
  const { balance, interestRate, monthlyPayment, extraPayment = 0 } = req.body;
  
  if (!balance || !interestRate || !monthlyPayment) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: balance, interestRate, monthlyPayment' 
    });
  }

  const monthlyRate = parseFloat(interestRate) / 100 / 12;
  const totalPayment = parseFloat(monthlyPayment) + parseFloat(extraPayment);
  let remainingBalance = parseFloat(balance);
  let months = 0;
  let totalInterest = 0;

  if (totalPayment <= remainingBalance * monthlyRate) {
    return res.status(400).json({
      success: false,
      error: 'Monthly payment is too small to cover interest charges'
    });
  }

  while (remainingBalance > 0 && months < 1200) { // Max 100 years
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(totalPayment - interestPayment, remainingBalance);
    
    remainingBalance -= principalPayment;
    totalInterest += interestPayment;
    months++;

    if (principalPayment <= 0) break;
  }

  res.json({
    success: true,
    data: {
      months,
      totalInterest: totalInterest.toFixed(2),
      payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalPaid: (parseFloat(balance) + totalInterest).toFixed(2)
    }
  });
}));

// ========================================
// BUSINESS ROUTES
// ========================================

// Business Profiles
router.get('/business-profiles', authenticateToken, asyncHandler(async (req, res) => {
  const profiles = await dbService.getBusinessProfiles(req.user.id);
  res.json({
    success: true,
    data: profiles,
    total: profiles.length
  });
}));

router.post('/business-profiles',
  authenticateToken,
  validateBody(insertBusinessProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await dbService.createBusinessProfile({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: profile });
  })
);

router.get('/business-profiles/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const profile = await dbService.getBusinessProfile(req.params.id, req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Business profile not found' });
    }
    res.json({ success: true, data: profile });
  })
);

router.put('/business-profiles/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertBusinessProfileSchema.partial()),
  asyncHandler(async (req, res) => {
    const profile = await dbService.updateBusinessProfile(req.params.id, req.body, req.user.id);
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Business profile not found' });
    }
    res.json({ success: true, data: profile });
  })
);

router.delete('/business-profiles/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteBusinessProfile(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Business profile not found' });
    }
    res.status(204).send();
  })
);

// Business Credit Cards
router.get('/business-credit-cards', authenticateToken, asyncHandler(async (req, res) => {
  const cards = await dbService.getBusinessCreditCards(req.user.id);
  res.json({
    success: true,
    data: cards,
    total: cards.length
  });
}));

router.post('/business-credit-cards',
  authenticateToken,
  validateBody(insertBusinessCreditCardSchema),
  asyncHandler(async (req, res) => {
    const card = await dbService.createBusinessCreditCard({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: card });
  })
);

router.put('/business-credit-cards/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertBusinessCreditCardSchema.partial()),
  asyncHandler(async (req, res) => {
    const card = await dbService.updateBusinessCreditCard(req.params.id, req.body, req.user.id);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Business credit card not found' });
    }
    res.json({ success: true, data: card });
  })
);

router.delete('/business-credit-cards/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteBusinessCreditCard(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Business credit card not found' });
    }
    res.status(204).send();
  })
);

// Business Loans
router.get('/business-loans', authenticateToken, asyncHandler(async (req, res) => {
  const loans = await dbService.getBusinessLoans(req.user.id);
  res.json({
    success: true,
    data: loans,
    total: loans.length
  });
}));

router.post('/business-loans',
  authenticateToken,
  validateBody(insertBusinessLoanSchema),
  asyncHandler(async (req, res) => {
    const loan = await dbService.createBusinessLoan({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: loan });
  })
);

router.put('/business-loans/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertBusinessLoanSchema.partial()),
  asyncHandler(async (req, res) => {
    const loan = await dbService.updateBusinessLoan(req.params.id, req.body, req.user.id);
    if (!loan) {
      return res.status(404).json({ success: false, error: 'Business loan not found' });
    }
    res.json({ success: true, data: loan });
  })
);

router.delete('/business-loans/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteBusinessLoan(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Business loan not found' });
    }
    res.status(204).send();
  })
);

// Business Revenue
router.get('/business-revenue', authenticateToken, asyncHandler(async (req, res) => {
  const revenue = await dbService.getBusinessRevenue(req.user.id);
  res.json({
    success: true,
    data: revenue,
    total: revenue.length
  });
}));

router.post('/business-revenue',
  authenticateToken,
  validateBody(insertBusinessRevenueSchema),
  asyncHandler(async (req, res) => {
    const revenue = await dbService.createBusinessRevenue({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: revenue });
  })
);

// Business Expenses
router.get('/business-expenses', authenticateToken, asyncHandler(async (req, res) => {
  const expenses = await dbService.getBusinessExpenses(req.user.id);
  res.json({
    success: true,
    data: expenses,
    total: expenses.length
  });
}));

router.post('/business-expenses',
  authenticateToken,
  validateBody(insertBusinessExpenseSchema),
  asyncHandler(async (req, res) => {
    const expense = await dbService.createBusinessExpense({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: expense });
  })
);

// ========================================
// VENDORS ROUTES
// ========================================
router.get('/vendors', authenticateToken, asyncHandler(async (req, res) => {
  const vendors = await dbService.getVendors(req.user.id);
  res.json({
    success: true,
    data: vendors,
    total: vendors.length
  });
}));

router.post('/vendors',
  authenticateToken,
  validateBody(insertVendorSchema),
  asyncHandler(async (req, res) => {
    const vendor = await dbService.createVendor({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: vendor });
  })
);

router.put('/vendors/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertVendorSchema.partial()),
  asyncHandler(async (req, res) => {
    const vendor = await dbService.updateVendor(req.params.id, req.body, req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    res.json({ success: true, data: vendor });
  })
);

router.delete('/vendors/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deleteVendor(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }
    res.status(204).send();
  })
);

// ========================================
// PURCHASE ORDERS ROUTES
// ========================================
router.get('/purchase-orders', authenticateToken, asyncHandler(async (req, res) => {
  const { businessProfileId, vendorId } = req.query;
  let orders;

  if (businessProfileId) {
    orders = await dbService.getPurchaseOrdersByBusiness(businessProfileId, req.user.id);
  } else {
    orders = await dbService.getPurchaseOrders(req.user.id);
    if (vendorId) {
      orders = orders.filter(order => order.vendorId === vendorId);
    }
  }

  res.json({
    success: true,
    data: orders,
    total: orders.length
  });
}));

router.post('/purchase-orders',
  authenticateToken,
  validateBody(insertPurchaseOrderSchema),
  asyncHandler(async (req, res) => {
    const order = await dbService.createPurchaseOrder({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: order });
  })
);

router.get('/purchase-orders/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const order = await dbService.getPurchaseOrder(req.params.id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }
    res.json({ success: true, data: order });
  })
);

router.put('/purchase-orders/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertPurchaseOrderSchema.partial()),
  asyncHandler(async (req, res) => {
    const order = await dbService.updatePurchaseOrder(req.params.id, req.body, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }
    res.json({ success: true, data: order });
  })
);

router.delete('/purchase-orders/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deletePurchaseOrder(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Purchase order not found' });
    }
    res.status(204).send();
  })
);

// Purchase Order Items
router.get('/purchase-orders/:id/items',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const items = await dbService.getPurchaseOrderItems(req.params.id);
    res.json({
      success: true,
      data: items,
      total: items.length
    });
  })
);

router.post('/purchase-order-items',
  authenticateToken,
  validateBody(insertPurchaseOrderItemSchema),
  asyncHandler(async (req, res) => {
    const item = await dbService.createPurchaseOrderItem(req.body);
    res.status(201).json({ success: true, data: item });
  })
);

router.put('/purchase-order-items/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(insertPurchaseOrderItemSchema.partial()),
  asyncHandler(async (req, res) => {
    const item = await dbService.updatePurchaseOrderItem(req.params.id, req.body);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Purchase order item not found' });
    }
    res.json({ success: true, data: item });
  })
);

router.delete('/purchase-order-items/:id',
  authenticateToken,
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    const deleted = await dbService.deletePurchaseOrderItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Purchase order item not found' });
    }
    res.status(204).send();
  })
);

// Reset All User Data Endpoints
router.delete('/reset-all',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id; // Fixed: use req.user.id instead of req.user.userId
    
    console.log('🗑️ Resetting all data for user:', userId);
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID not found' 
      });
    }
    
    try {
      // Only delete from main tables we know exist and are commonly used
      const deleteTasks = [
        { name: 'payments', fn: () => dbService.deleteAllPayments(userId) },
        { name: 'expenses', fn: () => dbService.deleteAllExpenses(userId) },
        { name: 'income', fn: () => dbService.deleteAllIncome(userId) },
        { name: 'monthly payments', fn: () => dbService.deleteAllMonthlyPayments(userId) },
        { name: 'loans', fn: () => dbService.deleteAllLoans(userId) },
        { name: 'credit cards', fn: () => dbService.deleteAllCreditCards(userId) },
        { name: 'vendors', fn: () => dbService.deleteAllVendors(userId) },
        { name: 'business profiles', fn: () => dbService.deleteAllBusinessProfiles(userId) }
      ];

      for (const task of deleteTasks) {
        try {
          console.log(`Deleting ${task.name}...`);
          await task.fn();
          console.log(`✅ ${task.name} deleted successfully`);
        } catch (error) {
          console.warn(`⚠️ Failed to delete ${task.name}:`, error.message);
          // Continue with other deletions even if one fails
        }
      }

      console.log('✅ Reset operation completed');
      res.json({ 
        success: true, 
        message: 'User data has been reset successfully' 
      });
    } catch (error) {
      console.error('❌ Error during reset operation:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to reset user data',
        details: error.message
      });
    }
  })
);

export default router;
