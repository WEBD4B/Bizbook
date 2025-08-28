export interface PayoffCalculation {
  months: number;
  totalInterest: number;
  payoffDate: Date;
  monthlySchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function calculatePayoff(
  balance: number,
  interestRate: number,
  monthlyPayment: number,
  extraPayment: number = 0
): PayoffCalculation {
  const monthlyRate = interestRate / 100 / 12;
  const totalPayment = monthlyPayment + extraPayment;
  let remainingBalance = balance;
  let months = 0;
  let totalInterest = 0;
  const monthlySchedule = [];

  while (remainingBalance > 0 && months < 1200) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = Math.min(totalPayment - interestPayment, remainingBalance);
    
    remainingBalance -= principalPayment;
    totalInterest += interestPayment;
    months++;

    monthlySchedule.push({
      month: months,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
    });

    if (principalPayment <= 0) break;
  }

  return {
    months,
    totalInterest,
    payoffDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
    monthlySchedule,
  };
}

export function calculateCreditUtilization(cards: Array<{ balance: string; creditLimit: string }>): number {
  const totalBalance = cards.reduce((sum, card) => sum + parseFloat(card.balance), 0);
  const totalLimit = cards.reduce((sum, card) => sum + parseFloat(card.creditLimit), 0);
  
  return totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
}

export function formatCurrency(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getNextDueDate(dayOfMonth: number): Date {
  const now = new Date();
  const nextDue = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  
  if (nextDue <= now) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }
  
  return nextDue;
}

export function getDaysUntilDue(dayOfMonth: number): number {
  const nextDue = getNextDueDate(dayOfMonth);
  const now = new Date();
  const diffTime = nextDue.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateAvailableCash(incomes: any[], expenses: any[], cashAssets: any[] = []): {
  totalIncome: number;
  totalExpenses: number;
  availableCash: number;
  cashFlow: number;
} {
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || "0"), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);
  const cashFromAssets = cashAssets.reduce((sum, asset) => sum + parseFloat(asset.value || asset.currentValue || "0"), 0);
  
  const cashFlow = totalIncome - totalExpenses;
  const availableCash = Math.max(0, cashFromAssets + cashFlow);
  
  return {
    totalIncome,
    totalExpenses,
    availableCash,
    cashFlow
  };
}
