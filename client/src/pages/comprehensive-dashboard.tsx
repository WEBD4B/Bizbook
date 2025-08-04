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
  Receipt
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { Sidebar } from "@/components/sidebar";
import { UpcomingPayments } from "@/components/upcoming-payments";
import { IncomeOverview } from "@/components/income-overview";
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

  const isLoading = creditCardsLoading || loansLoading || monthlyPaymentsLoading || incomesLoading;

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
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Net Worth Summary */}
              <NetWorthSummary />

              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                <Card data-testid="card-credit-utilization">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${creditUtilization > 30 ? 'text-red-600' : 'text-green-600'}`} data-testid="text-credit-utilization">
                      {creditUtilization.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {creditUtilization > 30 ? 'Above recommended' : 'Good utilization'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Overview */}
              <div className="grid gap-6 md:grid-cols-2">
                <DebtChart creditCards={creditCards} loans={loans} />
                <UpcomingPayments />
              </div>

              {/* Recent Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                <IncomeOverview />
                <ExpenseOverview />
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