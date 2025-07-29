import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Calendar, 
  Percent, 
  Target,
  CreditCard as CreditCardIcon,
  Building2,
  Edit,
  DollarSign,
  Menu
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { Sidebar } from "@/components/sidebar";
import { CreditCard, Loan } from "@shared/schema";
import { 
  formatCurrency, 
  calculateCreditUtilization, 
  formatDate, 
  getNextDueDate, 
  getDaysUntilDue 
} from "@/lib/financial-calculations";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [extraPayment, setExtraPayment] = useState("100");

  const { data: creditCards = [], isLoading: creditCardsLoading } = useQuery({
    queryKey: ["/api/credit-cards"],
  });

  const { data: loans = [], isLoading: loansLoading } = useQuery({
    queryKey: ["/api/loans"],
  });

  const isLoading = creditCardsLoading || loansLoading;

  // Calculate overview metrics
  const totalDebt = [...creditCards, ...loans].reduce(
    (sum, account) => sum + parseFloat(account.balance),
    0
  );

  const monthlyPayments = [
    ...creditCards.map((card: CreditCard) => parseFloat(card.minimumPayment)),
    ...loans.map((loan: Loan) => parseFloat(loan.monthlyPayment))
  ].reduce((sum, payment) => sum + payment, 0);

  const creditUtilization = calculateCreditUtilization(creditCards);

  // Calculate debt-free date (simplified)
  const averagePayment = monthlyPayments + parseFloat(extraPayment || "0");
  const estimatedMonths = totalDebt > 0 && averagePayment > 0 
    ? Math.ceil(totalDebt / averagePayment) 
    : 0;
  
  const debtFreeDate = new Date();
  debtFreeDate.setMonth(debtFreeDate.getMonth() + estimatedMonths);

  // Get next due date
  const allAccounts = [...creditCards, ...loans];
  const nextDueAccount = allAccounts.reduce((earliest, account) => {
    const daysUntil = getDaysUntilDue(account.dueDate);
    return !earliest || daysUntil < getDaysUntilDue(earliest.dueDate) ? account : earliest;
  }, null as CreditCard | Loan | null);

  const nextDueDate = nextDueAccount ? getNextDueDate(nextDueAccount.dueDate) : null;

  // Generate payment schedule for next 4 months
  const paymentSchedule = Array.from({ length: 4 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    
    return {
      month: formatDate(date),
      total: monthlyPayments,
      accounts: [
        ...creditCards.map((card: CreditCard) => ({
          name: card.name,
          payment: parseFloat(card.minimumPayment),
        })),
        ...loans.map((loan: Loan) => ({
          name: loan.name,
          payment: parseFloat(loan.monthlyPayment),
        })),
      ],
    };
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-neutral-200 rounded w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                      <Menu size={20} />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-64 p-0">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
              )}
              <h2 className="text-2xl font-semibold text-neutral-900" data-testid="heading-dashboard">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <AccountForm />
              <div className="w-8 h-8 bg-neutral-300 rounded-full" data-testid="avatar-user"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 overflow-y-auto h-full">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-total-debt">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Total Debt</span>
                  <AlertTriangle className="text-accent" size={20} />
                </div>
                <div className="text-2xl font-bold text-neutral-900" data-testid="text-total-debt">
                  {formatCurrency(totalDebt)}
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  Across {creditCards.length + loans.length} accounts
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-monthly-payments">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Monthly Payments</span>
                  <Calendar className="text-primary" size={20} />
                </div>
                <div className="text-2xl font-bold text-neutral-900" data-testid="text-monthly-payments">
                  {formatCurrency(monthlyPayments)}
                </div>
                <div className="text-sm text-secondary mt-1">
                  {nextDueDate ? `Next due: ${nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No accounts'}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-credit-utilization">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Credit Utilization</span>
                  <Percent className="text-secondary" size={20} />
                </div>
                <div className="text-2xl font-bold text-neutral-900" data-testid="text-credit-utilization">
                  {creditUtilization.toFixed(0)}%
                </div>
                <div className={`text-sm mt-1 ${creditUtilization > 70 ? 'text-accent' : creditUtilization > 30 ? 'text-orange-500' : 'text-secondary'}`}>
                  {creditUtilization > 70 ? 'High utilization' : creditUtilization > 30 ? 'Moderate utilization' : 'Good utilization'}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-payoff-date">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-500">Debt-Free Date</span>
                  <Target className="text-secondary" size={20} />
                </div>
                <div className="text-2xl font-bold text-neutral-900" data-testid="text-payoff-date">
                  {estimatedMonths > 0 ? formatDate(debtFreeDate) : 'N/A'}
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  {estimatedMonths > 0 ? `${estimatedMonths} months left` : 'No debt'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Debt Visualization */}
            <div className="lg:col-span-2">
              <Card data-testid="card-debt-chart">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Debt Distribution</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="default" size="sm" data-testid="button-chart-view">
                        Chart
                      </Button>
                      <Button variant="ghost" size="sm" data-testid="button-table-view">
                        Table
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <DebtChart creditCards={creditCards} loans={loans} />
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Payment Calculator */}
              <Card data-testid="card-payment-calculator">
                <CardHeader>
                  <CardTitle>Payment Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="extra-payment">Extra Payment</Label>
                    <Input
                      id="extra-payment"
                      type="number"
                      value={extraPayment}
                      onChange={(e) => setExtraPayment(e.target.value)}
                      placeholder="100.00"
                      data-testid="input-extra-payment"
                    />
                  </div>
                  <div className="text-sm text-neutral-600">
                    <div className="flex justify-between py-1">
                      <span>Time Saved:</span>
                      <span className="font-medium" data-testid="text-time-saved">
                        {Math.max(0, estimatedMonths - Math.ceil(totalDebt / (monthlyPayments + parseFloat(extraPayment || "0"))))} months
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Interest Saved:</span>
                      <span className="font-medium text-secondary" data-testid="text-interest-saved">
                        {formatCurrency(Math.max(0, totalDebt * 0.05))} {/* Simplified calculation */}
                      </span>
                    </div>
                  </div>
                  <Button className="w-full bg-secondary text-white hover:bg-green-700" data-testid="button-apply-extra-payment">
                    Apply Extra Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Accounts List */}
          <div className="mt-8">
            <Card data-testid="card-accounts-list">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Accounts</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" data-testid="button-filter">
                      Filter
                    </Button>
                    <Button variant="ghost" size="sm" data-testid="button-sort">
                      Sort
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allAccounts.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500" data-testid="empty-state-accounts">
                    <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
                      <CreditCardIcon size={32} className="text-neutral-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">No accounts yet</p>
                    <p className="text-sm mb-4">Add your first credit card or loan to get started</p>
                    <AccountForm />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
                        <div className="grid grid-cols-6 gap-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          <div>Account</div>
                          <div>Balance</div>
                          <div>Monthly Payment</div>
                          <div>Due Date</div>
                          <div>Payoff</div>
                          <div>Actions</div>
                        </div>
                      </div>
                      
                      <div className="divide-y divide-neutral-200">
                        {creditCards.map((card: CreditCard) => (
                          <div key={card.id} className="px-6 py-4 hover:bg-neutral-50" data-testid={`row-creditcard-${card.id}`}>
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <CreditCardIcon className="text-blue-600" size={20} />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-neutral-900" data-testid={`text-name-${card.id}`}>
                                    {card.name}
                                  </div>
                                  <div className="text-sm text-neutral-500">Credit Card</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900" data-testid={`text-balance-${card.id}`}>
                                  {formatCurrency(card.balance)}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {formatCurrency(card.creditLimit)} limit
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900" data-testid={`text-payment-${card.id}`}>
                                  {formatCurrency(card.minimumPayment)}
                                </div>
                                <div className="text-sm text-neutral-500">Minimum</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {getNextDueDate(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className={`text-sm ${getDaysUntilDue(card.dueDate) <= 3 ? 'text-accent' : 'text-neutral-500'}`}>
                                  {getDaysUntilDue(card.dueDate) <= 0 ? 'Overdue' : `Due in ${getDaysUntilDue(card.dueDate)} days`}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {/* Simplified payoff calculation */}
                                  {Math.ceil(parseFloat(card.balance) / parseFloat(card.minimumPayment))} months
                                </div>
                                <div className="text-sm text-neutral-500">Estimated</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" data-testid={`button-edit-${card.id}`}>
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-secondary" data-testid={`button-pay-${card.id}`}>
                                  Pay
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {loans.map((loan: Loan) => (
                          <div key={loan.id} className="px-6 py-4 hover:bg-neutral-50" data-testid={`row-loan-${loan.id}`}>
                            <div className="grid grid-cols-6 gap-4 items-center">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Building2 className="text-green-600" size={20} />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-neutral-900" data-testid={`text-name-${loan.id}`}>
                                    {loan.name}
                                  </div>
                                  <div className="text-sm text-neutral-500 capitalize">{loan.loanType} Loan</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900" data-testid={`text-balance-${loan.id}`}>
                                  {formatCurrency(loan.balance)}
                                </div>
                                <div className="text-sm text-neutral-500">
                                  {parseFloat(loan.interestRate)}% APR
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900" data-testid={`text-payment-${loan.id}`}>
                                  {formatCurrency(loan.monthlyPayment)}
                                </div>
                                <div className="text-sm text-neutral-500">Fixed</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {getNextDueDate(loan.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className={`text-sm ${getDaysUntilDue(loan.dueDate) <= 3 ? 'text-accent' : 'text-neutral-500'}`}>
                                  {getDaysUntilDue(loan.dueDate) <= 0 ? 'Overdue' : `Due in ${getDaysUntilDue(loan.dueDate)} days`}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-neutral-900">
                                  {loan.termMonths} months
                                </div>
                                <div className="text-sm text-neutral-500">Term</div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="ghost" size="sm" data-testid={`button-edit-${loan.id}`}>
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-secondary" data-testid={`button-pay-${loan.id}`}>
                                  Pay
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Schedule */}
          {allAccounts.length > 0 && (
            <div className="mt-8">
              <Card data-testid="card-payment-schedule">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Payment Schedule</CardTitle>
                    <Button variant="ghost" data-testid="button-view-all-schedule">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paymentSchedule.map((month, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg p-4" data-testid={`schedule-month-${index}`}>
                        <div className="text-sm font-medium text-neutral-500 mb-2" data-testid={`text-month-${index}`}>
                          {month.month}
                        </div>
                        <div className="text-xl font-bold text-neutral-900 mb-3" data-testid={`text-total-${index}`}>
                          {formatCurrency(month.total)}
                        </div>
                        <div className="space-y-2">
                          {month.accounts.slice(0, 3).map((account, accountIndex) => (
                            <div key={accountIndex} className="flex justify-between text-sm">
                              <span className="text-neutral-600 truncate mr-2">{account.name}</span>
                              <span className="font-medium">{formatCurrency(account.payment)}</span>
                            </div>
                          ))}
                          {month.accounts.length > 3 && (
                            <div className="text-sm text-neutral-500">
                              +{month.accounts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
