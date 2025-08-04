import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PieChart, Plus, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertBudgetSchema, type Budget, type InsertBudget, type Expense } from "@shared/schema";

const categories = [
  "Housing", "Transportation", "Food", "Utilities", "Healthcare", "Entertainment", 
  "Shopping", "Personal Care", "Education", "Insurance", "Savings", "Other"
];

export function BudgetTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  const { data: budgets = [], isLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const form = useForm<InsertBudget>({
    resolver: zodResolver(insertBudgetSchema),
    defaultValues: {
      category: "",
      monthlyAllocation: "",
      currentSpent: "0",
      budgetMonth: currentMonth,
      alertThreshold: "80",
      isActive: true,
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: InsertBudget) => apiRequest("POST", "/api/budgets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<InsertBudget>) =>
      apiRequest("PUT", `/api/budgets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
    },
  });

  const onSubmit = (data: InsertBudget) => {
    createBudgetMutation.mutate(data);
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(parseFloat(amount));
  };

  const calculateSpentFromExpenses = (category: string, budgetMonth: string) => {
    const monthStart = new Date(budgetMonth + "-01");
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.expenseDate);
        return expense.category.toLowerCase() === category.toLowerCase() &&
               expenseDate >= monthStart && expenseDate <= monthEnd;
      })
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const getCurrentMonthBudgets = () => {
    return budgets.filter(budget => budget.budgetMonth === currentMonth && budget.isActive);
  };

  const calculateProgress = (spent: number, allocated: string) => {
    const allocation = parseFloat(allocated);
    return allocation > 0 ? Math.min((spent / allocation) * 100, 100) : 0;
  };

  const isOverBudget = (spent: number, allocated: string, threshold: string) => {
    const allocation = parseFloat(allocated);
    const thresholdPercent = parseFloat(threshold);
    return allocation > 0 && (spent / allocation) * 100 > thresholdPercent;
  };

  const totalBudget = getCurrentMonthBudgets().reduce((sum, budget) => sum + parseFloat(budget.monthlyAllocation), 0);
  const totalSpent = getCurrentMonthBudgets().reduce((sum, budget) => {
    const actualSpent = calculateSpentFromExpenses(budget.category, budget.budgetMonth);
    return sum + actualSpent;
  }, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PieChart className="h-6 w-6" />
          Budget Tracker
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-budget">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Budget Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-budget-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="monthlyAllocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Budget</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="500" data-testid="input-monthly-allocation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alertThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alert Threshold (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" placeholder="80" data-testid="input-alert-threshold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Month</FormLabel>
                      <FormControl>
                        <Input {...field} type="month" data-testid="input-budget-month" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createBudgetMutation.isPending} data-testid="button-submit-budget">
                  {createBudgetMutation.isPending ? "Creating..." : "Create Budget"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-budget">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-budget">
              {formatCurrency(totalBudget.toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              For {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-spent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-spent">
              {formatCurrency(totalSpent.toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget` : "No budget set"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-remaining-budget">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency((totalBudget - totalSpent).toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudget - totalSpent >= 0 ? "Under budget" : "Over budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      {getCurrentMonthBudgets().length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
            <PieChart className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No budgets for this month</p>
            <p className="text-sm text-muted-foreground">Create your first budget to start tracking spending</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getCurrentMonthBudgets().map((budget) => {
            const actualSpent = calculateSpentFromExpenses(budget.category, budget.budgetMonth);
            const progress = calculateProgress(actualSpent, budget.monthlyAllocation);
            const overBudget = isOverBudget(actualSpent, budget.monthlyAllocation, budget.alertThreshold);
            const remaining = parseFloat(budget.monthlyAllocation) - actualSpent;
            
            return (
              <Card key={budget.id} data-testid={`card-budget-${budget.id}`} className={overBudget ? "border-red-500" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{budget.category}</span>
                    {overBudget && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className={progress > parseFloat(budget.alertThreshold) ? "text-red-600" : ""}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`h-2 ${progress > parseFloat(budget.alertThreshold) ? "[&>div]:bg-red-500" : ""}`} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budgeted</span>
                      <span className="font-medium">{formatCurrency(budget.monthlyAllocation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Spent</span>
                      <span className={`font-medium ${overBudget ? "text-red-600" : ""}`}>
                        {formatCurrency(actualSpent.toString())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className={`font-medium ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(remaining.toString())}
                      </span>
                    </div>
                  </div>

                  {overBudget && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      Over {budget.alertThreshold}% threshold
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const newAllocation = prompt("Enter new budget amount:", budget.monthlyAllocation);
                      if (newAllocation && !isNaN(parseFloat(newAllocation))) {
                        updateBudgetMutation.mutate({ id: budget.id, monthlyAllocation: newAllocation });
                      }
                    }}
                    data-testid={`button-update-budget-${budget.id}`}
                  >
                    Update Budget
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}