import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface CreditCard {
  id: string;
  name: string;
  balance: string;
  creditLimit: string;
  minimumPayment: string;
}

interface Loan {
  id: string;
  name: string;
  balance: string;
  monthlyPayment: string;
}

interface Income {
  id: string;
  amount: string;
  frequency: string;
}

export default function OptimizedDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [enableSecondaryQueries, setEnableSecondaryQueries] = useState(false);

  // Primary queries (load first)
  const { data: creditCards = [], isLoading: creditCardsLoading, error: creditCardsError } = useQuery<CreditCard[]>({
    queryKey: ["/api/credit-cards"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: loans = [], isLoading: loansLoading, error: loansError } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: incomes = [], isLoading: incomesLoading, error: incomesError } = useQuery<Income[]>({
    queryKey: ["/api/income"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Secondary queries (load after primary ones complete)
  const { data: monthlyPayments = [], isLoading: monthlyPaymentsLoading } = useQuery<any[]>({
    queryKey: ["/api/monthly-payments"],
    enabled: enableSecondaryQueries,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<any[]>({
    queryKey: ["/api/assets"],
    enabled: enableSecondaryQueries,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
    enabled: enableSecondaryQueries,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Enable secondary queries when primary ones are done
  useEffect(() => {
    if (!creditCardsLoading && !loansLoading && !incomesLoading) {
      const timer = setTimeout(() => {
        setEnableSecondaryQueries(true);
      }, 100); // Small delay to prevent simultaneous calls
      return () => clearTimeout(timer);
    }
  }, [creditCardsLoading, loansLoading, incomesLoading]);

  // Handle errors
  useEffect(() => {
    if (creditCardsError || loansError || incomesError) {
      toast({
        title: "Error loading data",
        description: "Some financial data could not be loaded. Please try refreshing the page.",
        variant: "destructive"
      });
    }
  }, [creditCardsError, loansError, incomesError, toast]);

  const isMainLoading = creditCardsLoading || loansLoading || incomesLoading;
  const isSecondaryLoading = monthlyPaymentsLoading || assetsLoading || expensesLoading;

  // Calculate basic metrics
  const totalDebt = [...creditCards, ...loans].reduce(
    (sum, account) => sum + parseFloat(account.balance || "0"),
    0
  );

  const totalMonthlyPayments = [
    ...creditCards.map((card: CreditCard) => parseFloat(card.minimumPayment || "0")),
    ...loans.map((loan: Loan) => parseFloat(loan.monthlyPayment || "0"))
  ].reduce((sum, payment) => sum + payment, 0);

  const totalMonthlyIncome = incomes.reduce((sum, income) => {
    const amount = parseFloat(income.amount || "0");
    switch (income.frequency) {
      case 'weekly': return sum + (amount * 4.33);
      case 'bi-weekly': return sum + (amount * 2.17);
      case 'monthly': return sum + amount;
      case 'yearly': return sum + (amount / 12);
      default: return sum + amount;
    }
  }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        {(isMainLoading || isSecondaryLoading) && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="text-sm text-gray-600">
              {isMainLoading ? "Loading essential data..." : "Loading additional data..."}
            </span>
          </div>
        )}
      </div>

      {/* Main Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
          </CardHeader>
          <CardContent>
            {isMainLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${totalDebt.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isMainLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${totalMonthlyPayments.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            {isMainLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">${totalMonthlyIncome.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
          </CardHeader>
          <CardContent>
            {enableSecondaryQueries && !assetsLoading ? (
              <div className="text-2xl font-bold">
                ${assets
                  .filter((asset: any) => ['cash', 'checking', 'savings'].includes(asset.category?.toLowerCase() || ''))
                  .reduce((sum: number, asset: any) => sum + parseFloat(asset.value || asset.currentValue || "0"), 0)
                  .toLocaleString()}
              </div>
            ) : (
              <Skeleton className="h-8 w-24" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credit-cards">Credit Cards</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Credit Cards Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isMainLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : creditCards.length > 0 ? (
                  <div className="space-y-2">
                    {creditCards.slice(0, 3).map((card) => (
                      <div key={card.id} className="flex justify-between">
                        <span className="truncate">{card.name}</span>
                        <span className="font-medium">${parseFloat(card.balance || "0").toLocaleString()}</span>
                      </div>
                    ))}
                    {creditCards.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{creditCards.length - 3} more cards
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No credit cards found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loans Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {isMainLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : loans.length > 0 ? (
                  <div className="space-y-2">
                    {loans.slice(0, 3).map((loan) => (
                      <div key={loan.id} className="flex justify-between">
                        <span className="truncate">{loan.name}</span>
                        <span className="font-medium">${parseFloat(loan.balance || "0").toLocaleString()}</span>
                      </div>
                    ))}
                    {loans.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{loans.length - 3} more loans
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No loans found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="credit-cards">
          <Card>
            <CardHeader>
              <CardTitle>Credit Cards</CardTitle>
            </CardHeader>
            <CardContent>
              {isMainLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : creditCards.length > 0 ? (
                <div className="space-y-4">
                  {creditCards.map((card) => (
                    <div key={card.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{card.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-sm text-gray-600">Balance:</span>
                          <div className="font-medium">${parseFloat(card.balance || "0").toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Credit Limit:</span>
                          <div className="font-medium">${parseFloat(card.creditLimit || "0").toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No credit cards found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {isMainLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : loans.length > 0 ? (
                <div className="space-y-4">
                  {loans.map((loan) => (
                    <div key={loan.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{loan.name}</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-sm text-gray-600">Balance:</span>
                          <div className="font-medium">${parseFloat(loan.balance || "0").toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Monthly Payment:</span>
                          <div className="font-medium">${parseFloat(loan.monthlyPayment || "0").toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No loans found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
            </CardHeader>
            <CardContent>
              {isMainLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : incomes.length > 0 ? (
                <div className="space-y-4">
                  {incomes.map((income) => (
                    <div key={income.id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Amount:</span>
                          <div className="font-medium">${parseFloat(income.amount || "0").toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Frequency:</span>
                          <div className="font-medium capitalize">{income.frequency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No income sources found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
