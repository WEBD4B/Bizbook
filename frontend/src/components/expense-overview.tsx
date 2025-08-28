import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Calendar, TrendingDown, DollarSign, Repeat, Clock } from "lucide-react";
import { useExpenses } from "@/lib/clerk-api-hooks";
import { Expense } from "@shared/schema";
import { formatCurrency } from "@/lib/financial-calculations";
import { ExpenseForm } from "@/components/expense-form";

interface ExpenseOverviewProps {
  onAddExpense?: () => void;
}

export function ExpenseOverview({ onAddExpense }: ExpenseOverviewProps) {
  // Get all expenses
  const { data: allExpenses = [], isLoading } = useExpenses();
  
  // Filter current month expenses on client side
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const monthlyExpenses = allExpenses.filter((expense: any) => {
    const expenseDate = new Date(expense.expenseDate || expense.expense_date);
    return expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth;
  });

  // Calculate monthly total
  const monthlyTotal = monthlyExpenses.reduce((sum: number, expense: Expense) => 
    sum + parseFloat(expense.amount), 0);

  // Separate subscription and one-time expenses
  const subscriptionExpenses = monthlyExpenses.filter((expense: Expense) => 
    expense.paymentType === 'subscription' || expense.isRecurring);
  const oneTimeExpenses = monthlyExpenses.filter((expense: Expense) => 
    expense.paymentType === 'one-time' || !expense.isRecurring);
  
  const subscriptionTotal = subscriptionExpenses.reduce((sum: number, expense: Expense) => 
    sum + parseFloat(expense.amount), 0);
  const oneTimeTotal = oneTimeExpenses.reduce((sum: number, expense: Expense) => 
    sum + parseFloat(expense.amount), 0);

  // Calculate spending by category this month
  const categorySpending = monthlyExpenses.reduce((acc: Record<string, number>, expense: Expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Get recent expenses (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentExpenses = allExpenses
    .filter((expense: Expense) => new Date(expense.expenseDate) >= sevenDaysAgo)
    .sort((a: Expense, b: Expense) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
    .slice(0, 5);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      utilities: "🔌",
      groceries: "🛒",
      bills: "📄",
      gas: "⛽",
      dining: "🍽️",
      entertainment: "🎬",
      shopping: "🛍️",
      healthcare: "🏥",
      insurance: "🛡️",
      subscriptions: "📱",
      home: "🏠",
      education: "📚",
      travel: "✈️",
    };
    return icons[category] || "💰";
  };

  if (isLoading) {
    return (
      <Card data-testid="card-expense-overview">
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-32"></div>
            <div className="h-4 bg-neutral-200 rounded w-48"></div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-expense-overview">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="text-primary" size={20} />
            <span>Monthly Expenses</span>
          </CardTitle>
          <ExpenseForm />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {monthlyExpenses.length === 0 ? (
          <div className="text-center py-6 text-neutral-500" data-testid="empty-state-expenses">
            <Receipt size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium mb-2">No expenses this month</p>
            <p className="text-sm mb-4">Start tracking your spending to see where your money goes</p>
            {onAddExpense && (
              <Button onClick={onAddExpense} data-testid="button-add-first-expense">
                Add First Expense
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Monthly Total with Breakdown */}
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-neutral-500">This Month</div>
                  <div className="text-2xl font-bold text-red-600" data-testid="text-monthly-expenses">
                    {formatCurrency(monthlyTotal)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-neutral-500">Transactions</div>
                  <div className="text-sm text-neutral-900" data-testid="text-expense-count">
                    {monthlyExpenses.length} expenses
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                  </div>
                </div>
              </div>
              
              {/* Recurring vs One-time Breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-red-200">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Repeat size={14} className="text-blue-600" />
                    <span className="text-xs font-medium text-neutral-600">Subscriptions</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-600" data-testid="text-subscription-total">
                    {formatCurrency(subscriptionTotal)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {subscriptionExpenses.length} monthly bills
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock size={14} className="text-green-600" />
                    <span className="text-xs font-medium text-neutral-600">One-time</span>
                  </div>
                  <div className="text-sm font-semibold text-green-600" data-testid="text-onetime-total">
                    {formatCurrency(oneTimeTotal)}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {oneTimeExpenses.length} purchases
                  </div>
                </div>
              </div>
            </div>

            {/* Top Spending Categories */}
            {topCategories.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900">Top Categories</h4>
                {topCategories.map(([category, amount]) => (
                  <div 
                    key={category} 
                    className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg"
                    data-testid={`category-item-${category}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCategoryIcon(category)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 capitalize" data-testid={`category-name-${category}`}>
                          {category.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {monthlyExpenses.filter((e: Expense) => e.category === category).length} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-600" data-testid={`category-amount-${category}`}>
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {((amount / monthlyTotal) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Expenses */}
            {recentExpenses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900">Recent Expenses</h4>
                {recentExpenses.map((expense: Expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded"
                    data-testid={`recent-expense-${expense.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-medium text-neutral-900" data-testid={`expense-description-${expense.id}`}>
                            {expense.description}
                          </div>
                          {(expense.paymentType === 'subscription' || expense.isRecurring) && (
                            <Repeat size={12} className="text-blue-500" title="Subscription/Recurring expense" />
                          )}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(expense.expenseDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {expense.paidFromIncome && (
                            <span className="ml-2">• Paid from: {expense.paidFromIncome}</span>
                          )}
                          {expense.paymentMethod && (
                            <span className="ml-2 capitalize">• {expense.paymentMethod.replace('-', ' ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-600" data-testid={`expense-amount-${expense.id}`}>
                      {formatCurrency(parseFloat(expense.amount))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}