import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home,
  CreditCard as CreditCardIcon,
  Building2,
  DollarSign,
  Menu,
  TrendingUp,
  Target,
  PieChart,
  BarChart3,
  Receipt,
  Wallet
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { Sidebar } from "@/components/sidebar";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { UpcomingIncomes } from "@/components/upcoming-incomes";
import { IncomeOverview } from "@/components/income-overview";
import { FinancialOverviewChart } from "@/components/financial-overview-chart";
import { PaymentDialog } from "@/components/payment-dialog";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseOverview } from "@/components/expense-overview";
import { NetWorthSummary } from "@/components/net-worth-summary";
import { SavingsGoals } from "@/components/savings-goals";
import { BudgetTracker } from "@/components/budget-tracker";
import { InvestmentTracker } from "@/components/investment-tracker";
import { ComprehensiveNetWorth } from "@/components/comprehensive-net-worth";
import { CreditCard, Loan, MonthlyPayment, Income } from "@shared/schema";
import { 
  formatCurrency, 
  calculateCreditUtilization
} from "@/lib/financial-calculations";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function ComprehensiveDashboard() {
  const isMobile = useIsMobile();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");

  const { data: creditCards = [], isLoading: creditCardsLoading } = useQuery<CreditCard[]>({
    queryKey: ["/api/credit-cards"],
  });

  const { data: loans = [], isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const { data: monthlyPayments = [], isLoading: monthlyPaymentsLoading } = useQuery<MonthlyPayment[]>({
    queryKey: ["/api/monthly-payments"],
  });

  const { data: incomes = [], isLoading: incomesLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<any[]>({
    queryKey: ["/api/assets"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
  });

  const isLoading = creditCardsLoading || loansLoading || monthlyPaymentsLoading || incomesLoading || assetsLoading || expensesLoading;

  // Calculate overview metrics
  const totalDebt = [...creditCards, ...loans].reduce(
    (sum, account) => sum + parseFloat(account.balance || "0"),
    0
  );

  const totalMonthlyPayments = [
    ...creditCards.map((card: CreditCard) => parseFloat(card.minimumPayment || "0")),
    ...loans.map((loan: Loan) => parseFloat(loan.monthlyPayment || "0"))
  ].reduce((sum, payment) => sum + payment, 0);

  const creditUtilization = calculateCreditUtilization(creditCards);

  // Calculate monthly income
  const calculateMonthlyIncome = (incomes: Income[]) => {
    return incomes.reduce((total, income) => {
      const amount = parseFloat(income.amount || "0");
      switch (income.frequency) {
        case "weekly": return total + (amount * 4.33);
        case "biweekly": return total + (amount * 2.17);
        case "monthly": return total + amount;
        case "annually": return total + (amount / 12);
        default: return total + amount;
      }
    }, 0);
  };

  const totalMonthlyIncome = calculateMonthlyIncome(incomes);

  // Calculate available cash and credit metrics
  const availableCash = assets
    .filter((asset: any) => ['cash', 'checking', 'savings'].includes(asset.category?.toLowerCase() || ''))
    .reduce((sum: number, asset: any) => sum + parseFloat(asset.value || asset.currentValue || "0"), 0);

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit || "0"), 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || "0"), 0);
  const availableCredit = totalCreditLimit - totalCreditUsed;
  const totalLiquidity = availableCash + availableCredit;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {!isMobile ? (
        <Sidebar />
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Personal Finance Center</h1>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-7 lg:w-fit">
              <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                <Home className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="net-worth" className="flex items-center gap-2" data-testid="tab-net-worth">
                <TrendingUp className="h-4 w-4" />
                Net Worth
              </TabsTrigger>
              <TabsTrigger value="debt" className="flex items-center gap-2" data-testid="tab-debt">
                <CreditCardIcon className="h-4 w-4" />
                Debt
              </TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-2" data-testid="tab-expenses">
                <Receipt className="h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex items-center gap-2" data-testid="tab-budget">
                <PieChart className="h-4 w-4" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="savings" className="flex items-center gap-2" data-testid="tab-savings">
                <Target className="h-4 w-4" />
                Savings
              </TabsTrigger>
              <TabsTrigger value="investments" className="flex items-center gap-2" data-testid="tab-investments">
                <BarChart3 className="h-4 w-4" />
                Investments
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2" data-testid="tab-business">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="taxes" className="flex items-center gap-2" data-testid="tab-taxes">
                <Receipt className="h-4 w-4" />
                Taxes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Full Width Visual Chart at Top */}
              <FinancialOverviewChart 
                creditCards={creditCards} 
                loans={loans} 
                incomes={incomes} 
                assets={assets} 
                expenses={expenses} 
              />

              {/* Net Worth Summary - Full Width */}
              <NetWorthSummary />

              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card data-testid="card-total-debt">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-total-debt">
                      {formatCurrency(totalDebt)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Credit cards and loans
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-monthly-payments">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-monthly-payments">
                      {formatCurrency(totalMonthlyPayments)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All recurring payments
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-monthly-income">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-monthly-income">
                      {formatCurrency(totalMonthlyIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {incomes.length} income source{incomes.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-available-cash">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-available-cash">
                      {formatCurrency(availableCash)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Liquid assets
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-available-credit">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-available-credit">
                      {formatCurrency(availableCredit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {creditUtilization.toFixed(1)}% utilization
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Total Liquidity Card - Full Width */}
              <Card data-testid="card-total-liquidity">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Total Liquidity (Available Cash + Credit)</CardTitle>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600" data-testid="text-total-liquidity">
                    {formatCurrency(totalLiquidity)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Cash: {formatCurrency(availableCash)}</span>
                    <span>•</span>
                    <span>Credit: {formatCurrency(availableCredit)}</span>
                    <span>•</span>
                    <span>Total buying power available</span>
                  </div>
                </CardContent>
              </Card>

              {/* Full Width Sections */}
              <div className="space-y-6">
                <IncomeOverview />
                <ExpenseOverview />
                <UpcomingPayments />
                <UpcomingIncomes />
              </div>
            </TabsContent>

            <TabsContent value="net-worth" className="space-y-6">
              <ComprehensiveNetWorth />
            </TabsContent>

            <TabsContent value="debt" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <AccountForm />
                  <IncomeOverview />
                </div>
                <div className="space-y-6">
                  <DebtChart creditCards={creditCards} loans={loans} />
                  <UpcomingPayments />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <ExpenseForm />
                <ExpenseOverview />
              </div>
            </TabsContent>

            <TabsContent value="budget" className="space-y-6">
              <BudgetTracker />
            </TabsContent>

            <TabsContent value="savings" className="space-y-6">
              <SavingsGoals />
            </TabsContent>

            <TabsContent value="investments" className="space-y-6">
              <InvestmentTracker />
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Business Dashboard</h2>
                    <p className="text-muted-foreground">Manage business expenses, revenue, and payouts</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      Business Settings
                    </Button>
                  </div>
                </div>

                {/* Business Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card data-testid="card-business-revenue">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600" data-testid="text-business-revenue">$0.00</div>
                      <p className="text-xs text-muted-foreground">Sales & income</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-business-expenses">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Business Expenses</CardTitle>
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600" data-testid="text-business-expenses">$0.00</div>
                      <p className="text-xs text-muted-foreground">Deductible expenses</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-net-profit">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid="text-net-profit">$0.00</div>
                      <p className="text-xs text-muted-foreground">Revenue - expenses</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-sales-tax-owed">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sales Tax Owed</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600" data-testid="text-sales-tax-owed">$0.00</div>
                      <p className="text-xs text-muted-foreground">Quarterly estimate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Business Management Sections */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card data-testid="card-business-transactions">
                    <CardHeader>
                      <CardTitle>Recent Business Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-6 text-neutral-500" data-testid="empty-state-business-transactions">
                        <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No business transactions yet</p>
                        <div className="flex gap-2 justify-center">
                          <Button size="sm" data-testid="button-add-revenue">Add Revenue</Button>
                          <Button size="sm" variant="outline" data-testid="button-add-business-expense">Add Expense</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-business-reports">
                    <CardHeader>
                      <CardTitle>QuickBooks-Style Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start" data-testid="button-profit-loss">
                          <Receipt className="h-4 w-4 mr-2" />
                          Profit & Loss Statement
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-cash-flow-report">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Cash Flow Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-sales-tax-report">
                          <Target className="h-4 w-4 mr-2" />
                          Sales Tax Report
                        </Button>
                        <Button variant="outline" className="w-full justify-start" data-testid="button-1099-generation">
                          <DollarSign className="h-4 w-4 mr-2" />
                          1099 Generation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tax Management</h2>
                    <p className="text-muted-foreground">Sales tax tracking and document generation</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" data-testid="button-import-shopify">
                      <Receipt className="h-4 w-4 mr-2" />
                      Import from Shopify
                    </Button>
                  </div>
                </div>

                {/* Tax Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card data-testid="card-quarterly-sales-tax">
                    <CardHeader>
                      <CardTitle>Current Quarter Sales Tax</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-orange-600" data-testid="text-quarterly-sales-tax">$0.00</div>
                      <p className="text-sm text-muted-foreground mt-2">Q1 2024 - Due April 30</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-ytd-deductions">
                    <CardHeader>
                      <CardTitle>YTD Business Deductions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600" data-testid="text-ytd-deductions">$0.00</div>
                      <p className="text-sm text-muted-foreground mt-2">Tax-deductible expenses</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-estimated-tax-savings">
                    <CardHeader>
                      <CardTitle>Estimated Tax Savings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600" data-testid="text-estimated-tax-savings">$0.00</div>
                      <p className="text-sm text-muted-foreground mt-2">Based on 25% tax rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Sales Tax Management */}
                <Card data-testid="card-sales-tax-settings">
                  <CardHeader>
                    <CardTitle>Sales Tax Settings by State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-neutral-500" data-testid="empty-state-tax-settings">
                      <Target size={48} className="mx-auto mb-4 text-neutral-300" />
                      <p className="mb-4">Configure sales tax rates for each state you sell in</p>
                      <Button data-testid="button-add-tax-rate">Add Tax Rate</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Document Generation */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card data-testid="card-tax-documents">
                    <CardHeader>
                      <CardTitle>Generate Tax Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" data-testid="button-sales-tax-return">
                        <Receipt className="h-4 w-4 mr-2" />
                        Sales Tax Return (Quarterly)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-1099-forms">
                        <Building2 className="h-4 w-4 mr-2" />
                        1099-NEC Forms
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-expense-report">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Business Expense Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" data-testid="button-schedule-c">
                        <Target className="h-4 w-4 mr-2" />
                        Schedule C Preview
                      </Button>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-shopify-integration">
                    <CardHeader>
                      <CardTitle>Shopify Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Import sales data from Shopify to automatically calculate sales tax
                        </p>
                        <Button className="w-full" data-testid="button-connect-shopify">Connect Shopify Store</Button>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Or manually upload CSV</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <PaymentDialog 
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            account={selectedAccount}
            accountType={selectedAccountType}
          />
        </div>
      </main>
    </div>
  );
}