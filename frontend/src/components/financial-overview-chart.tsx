import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { useState } from "react";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  DollarSign,
  CreditCard as CreditCardIcon,
  Wallet,
  Target
} from "lucide-react";
import { CreditCard, Loan, Income, Asset } from "@/types/schema";
import { formatCurrency } from "@/lib/financial-calculations";

interface FinancialOverviewChartProps {
  creditCards: CreditCard[];
  loans: Loan[];
  incomes: Income[];
  assets: Asset[];
  expenses: any[];
}

type ChartType = "overview" | "debt" | "cashflow" | "assets";

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#F97316", "#EC4899", "#06B6D4"];

export function FinancialOverviewChart({ 
  creditCards, 
  loans, 
  incomes, 
  assets, 
  expenses 
}: FinancialOverviewChartProps) {
  const [chartType, setChartType] = useState<ChartType>("overview");

  // Calculate key metrics
  const totalDebt = creditCards.reduce((sum, card) => sum + (typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance), 0) +
                   loans.reduce((sum, loan) => sum + (typeof loan.currentBalance === 'string' ? parseFloat(loan.currentBalance) : loan.currentBalance), 0);
  const totalAssets = assets.reduce((sum, asset) => sum + (typeof asset.value === 'string' ? parseFloat(asset.value) : asset.value), 0);
  const totalIncome = incomes.reduce((sum, income) => sum + (typeof income.amount === 'string' ? parseFloat(income.amount) : income.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + (typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount), 0);
  const netWorth = totalAssets - totalDebt;
  const monthlyCashFlow = totalIncome - totalExpenses;
  
  // Available credit calculation
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + (typeof card.creditLimit === 'string' ? parseFloat(card.creditLimit) : card.creditLimit), 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + (typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance), 0);
  const availableCredit = totalCreditLimit - totalCreditUsed;
  const creditUtilization = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

  // Liquid assets (cash equivalents)
  const liquidAssets = assets
    .filter(asset => ['cash', 'checking', 'savings'].includes((asset.category || '').toLowerCase()))
    .reduce((sum, asset) => sum + (typeof asset.value === 'string' ? parseFloat(asset.value) : asset.value), 0);

  const buyingPower = liquidAssets + availableCredit;

  // Overview chart data
  const overviewData = [
    { name: "Total Assets", value: totalAssets, color: COLORS[2], type: "positive" },
    { name: "Total Debt", value: totalDebt, color: COLORS[1], type: "negative" },
    { name: "Net Worth", value: netWorth, color: netWorth >= 0 ? COLORS[2] : COLORS[1], type: netWorth >= 0 ? "positive" : "negative" },
    { name: "Monthly Income", value: totalIncome, color: COLORS[2], type: "positive" },
    { name: "Monthly Expenses", value: totalExpenses, color: COLORS[1], type: "negative" },
    { name: "Cash Flow", value: monthlyCashFlow, color: monthlyCashFlow >= 0 ? COLORS[2] : COLORS[1], type: monthlyCashFlow >= 0 ? "positive" : "negative" },
    { name: "Available Credit", value: availableCredit, color: COLORS[4], type: "neutral" },
  ];

  // Debt breakdown data
  const debtData = [
    ...creditCards.map((card, index) => ({
      name: card.cardName,
      value: typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance,
      color: COLORS[index % COLORS.length],
      type: "Credit Card",
      utilization: (typeof card.balance === 'string' ? parseFloat(card.balance) : card.balance) / (typeof card.creditLimit === 'string' ? parseFloat(card.creditLimit) : card.creditLimit) * 100
    })),
    ...loans.map((loan, index) => ({
      name: loan.loanName,
      value: typeof loan.currentBalance === 'string' ? parseFloat(loan.currentBalance) : loan.currentBalance,
      color: COLORS[(creditCards.length + index) % COLORS.length],
      type: loan.loanType,
      utilization: null
    })),
  ];

  // Cash flow data (monthly view)
  const cashFlowData = [
    { name: "Income", value: totalIncome, color: COLORS[2] },
    { name: "Expenses", value: totalExpenses, color: COLORS[1] },
    { name: "Debt Payments", value: [...creditCards, ...loans].reduce((sum, item) => {
      const payment = 'minimumPayment' in item ? item.minimumPayment : item.monthlyPayment;
      return sum + (typeof payment === 'string' ? parseFloat(payment) : payment);
    }, 0), color: COLORS[3] },
    { name: "Net Cash Flow", value: monthlyCashFlow, color: monthlyCashFlow >= 0 ? COLORS[2] : COLORS[1] },
  ];

  // Assets breakdown data
  const assetData = assets.map((asset, index) => ({
    name: asset.name,
    value: typeof asset.value === 'string' ? parseFloat(asset.value) : asset.value,
    color: COLORS[index % COLORS.length],
    category: asset.category
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name || label}</p>
          {data.type && <p className="text-sm text-gray-500 dark:text-gray-400">{data.type}</p>}
          {data.category && <p className="text-sm text-gray-500 dark:text-gray-400">{data.category}</p>}
          <p className="text-sm font-medium text-primary">
            {formatCurrency(data.value)}
          </p>
          {data.utilization && (
            <p className="text-xs text-gray-500">
              {data.utilization.toFixed(1)}% utilization
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (chartType) {
      case "overview":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={overviewData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {overviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "debt":
        if (debtData.length === 0) {
          return (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <CreditCardIcon className="mx-auto h-12 w-12 mb-4" />
                <p>No debt accounts found</p>
                <p className="text-sm">Add credit cards or loans to see debt breakdown</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={debtData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
              >
                {debtData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "cashflow":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrency(value, true)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value">
                {cashFlowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "assets":
        if (assetData.length === 0) {
          return (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Wallet className="mx-auto h-12 w-12 mb-4" />
                <p>No assets found</p>
                <p className="text-sm">Add assets to see your asset breakdown</p>
              </div>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={assetData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                dataKey="value"
              >
                {assetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case "overview": return "Financial Overview";
      case "debt": return "Debt Distribution";
      case "cashflow": return "Monthly Cash Flow";
      case "assets": return "Asset Allocation";
      default: return "Financial Data";
    }
  };

  const getChartStats = () => {
    switch (chartType) {
      case "overview":
        return `Net Worth: ${formatCurrency(netWorth)} • Cash Flow: ${formatCurrency(monthlyCashFlow)}`;
      case "debt":
        return `Total Debt: ${formatCurrency(totalDebt)} • Credit Utilization: ${creditUtilization.toFixed(1)}%`;
      case "cashflow":
        return `Monthly Income: ${formatCurrency(totalIncome)} • Monthly Expenses: ${formatCurrency(totalExpenses)}`;
      case "assets":
        return `Total Assets: ${formatCurrency(totalAssets)} • Liquid Assets: ${formatCurrency(liquidAssets)}`;
      default:
        return "";
    }
  };

  return (
    <Card className="col-span-full" data-testid="financial-overview-chart">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              {chartType === "overview" && <BarChart3 className="h-5 w-5" />}
              {chartType === "debt" && <CreditCardIcon className="h-5 w-5" />}
              {chartType === "cashflow" && <TrendingUp className="h-5 w-5" />}
              {chartType === "assets" && <Wallet className="h-5 w-5" />}
              {getChartTitle()}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getChartStats()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={chartType === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("overview")}
              data-testid="button-chart-overview"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={chartType === "debt" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("debt")}
              data-testid="button-chart-debt"
            >
              <PieChartIcon className="h-4 w-4 mr-1" />
              Debt
            </Button>
            <Button
              variant={chartType === "cashflow" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("cashflow")}
              data-testid="button-chart-cashflow"
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Cash Flow
            </Button>
            <Button
              variant={chartType === "assets" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartType("assets")}
              data-testid="button-chart-assets"
            >
              <Wallet className="h-4 w-4 mr-1" />
              Assets
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
