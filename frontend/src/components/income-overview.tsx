import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Plus } from "lucide-react";
import { useIncomes } from "@/lib/clerk-api-hooks";
import { Income } from "@/types/schema";
import { formatCurrency } from "@/lib/financial-calculations";

interface IncomeOverviewProps {
  onAddIncome?: () => void;
}

export function IncomeOverview({ onAddIncome }: IncomeOverviewProps) {
  const { data: incomes = [], isLoading } = useIncomes();

  const calculateMonthlyIncome = (incomes: Income[]) => {
    return incomes.reduce((total, income) => {
      const amount = parseFloat(income.amount);
      switch (income.frequency) {
        case "weekly": return total + (amount * 4.33);
        case "biweekly": return total + (amount * 2.17);
        case "monthly": return total + amount;
        case "yearly": return total + (amount / 12);
        default: return total + amount;
      }
    }, 0);
  };

  const getNextPayDate = (income: Income) => {
    return new Date(income.nextPayDate);
  };

  const getDaysUntilPay = (income: Income) => {
    const nextPay = new Date(income.nextPayDate);
    const now = new Date();
    const diffTime = nextPay.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const monthlyIncome = calculateMonthlyIncome(incomes);
  const nextPayday = incomes.length > 0 
    ? incomes.reduce((earliest, income) => {
        const daysUntil = getDaysUntilPay(income);
        const earliestDays = getDaysUntilPay(earliest);
        return daysUntil < earliestDays ? income : earliest;
      })
    : null;

  if (isLoading) {
    return (
      <Card data-testid="card-income-overview">
        <CardHeader>
          <CardTitle>Income Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-32"></div>
            <div className="h-4 bg-neutral-200 rounded w-48"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-income-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="text-secondary" size={20} />
            <span>Income Overview</span>
          </CardTitle>
          {onAddIncome && (
            <Button variant="outline" size="sm" onClick={onAddIncome} data-testid="button-add-income">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {incomes.length === 0 ? (
          <div className="text-center py-6 text-neutral-500" data-testid="empty-state-income">
            <TrendingUp size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium mb-2">No income sources</p>
            <p className="text-sm mb-4">Add your income sources to track your cash flow</p>
            {onAddIncome && (
              <Button onClick={onAddIncome} data-testid="button-add-first-income">
                <Plus size={16} className="mr-2" />
                Add First Income Source
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Monthly Income Summary */}
            <div className="bg-secondary/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-neutral-500">Monthly Income</div>
                  <div className="text-2xl font-bold text-secondary" data-testid="text-monthly-income">
                    {formatCurrency(monthlyIncome)}
                  </div>
                </div>
                {nextPayday && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-neutral-500">Next Payday</div>
                    <div className="text-sm text-neutral-900" data-testid="text-next-payday">
                      {getNextPayDate(nextPayday).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {getDaysUntilPay(nextPayday) === 0 ? "Today" : 
                       getDaysUntilPay(nextPayday) === 1 ? "Tomorrow" :
                       `${getDaysUntilPay(nextPayday)} days`}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Income Sources List */}
            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900">Income Sources</h4>
              {incomes.map((income: Income) => (
                <div 
                  key={income.id} 
                  className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                  data-testid={`income-item-${income.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-secondary" size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900" data-testid={`income-name-${income.id}`}>
                        {income.name}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-neutral-500">
                        <span data-testid={`income-amount-${income.id}`}>
                          {formatCurrency(parseFloat(income.amount))}
                        </span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {income.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-500">Next Pay</div>
                    <div className="text-sm font-medium text-neutral-900">
                      {getNextPayDate(income).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}