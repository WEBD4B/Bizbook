import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Banknote, Target } from "lucide-react";
import { useAssets, useInvestments } from "@/hooks/useApi";
import { useCreditCards, useLoans } from "@/lib/clerk-api-hooks";
import type { Asset, Investment, CreditCard, Loan } from "@/types/schema";

export function NetWorthSummary() {
  const { data: assets = [] } = useAssets();
  const { data: investments = [] } = useInvestments();
  const { data: creditCards = [] } = useCreditCards();
  const { data: loans = [] } = useLoans();

  // Calculate total assets
  const totalAssets = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0) +
                     investments.reduce((sum, inv) => sum + parseFloat(inv.balance), 0);

  // Calculate total liabilities
  const totalLiabilities = creditCards.reduce((sum, cc) => sum + parseFloat(cc.balance), 0) +
                          loans.reduce((sum, loan) => sum + parseFloat(loan.currentBalance), 0);

  // Calculate net worth
  const netWorth = totalAssets - totalLiabilities;
  console.log('Total assets:', totalAssets);
  console.log('Total liabilities:', totalLiabilities);
  console.log('Net worth:', netWorth);

  // Calculate liquid vs non-liquid assets
  const liquidAssets = assets
    .filter(asset => asset.isLiquid)
    .reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
  
  const nonLiquidAssets = totalAssets - liquidAssets;

  // Calculate available credit and total liquidity
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit || "0"), 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || "0"), 0);
  const availableCredit = totalCreditLimit - totalCreditUsed;
  const totalLiquidity = liquidAssets + availableCredit;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card data-testid="card-net-worth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
          {netWorth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netWorth)}
          </div>
          <p className="text-xs text-muted-foreground">
            Assets minus liabilities
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-total-assets">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600" data-testid="text-total-assets">
            {formatCurrency(totalAssets)}
          </div>
          <p className="text-xs text-muted-foreground">
            Including investments
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-total-liabilities">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600" data-testid="text-total-liabilities">
            {formatCurrency(totalLiabilities)}
          </div>
          <p className="text-xs text-muted-foreground">
            Credit cards and loans
          </p>
        </CardContent>
      </Card>

      <Card data-testid="card-total-liquidity">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Cash + Credit</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600" data-testid="text-total-liquidity">
            {formatCurrency(totalLiquidity)}
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>Cash: {formatCurrency(liquidAssets)}</span>
            <span>•</span>
            <span>Credit: {formatCurrency(availableCredit)}</span>
            <span>•</span>
            <span>Total buying power available</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}