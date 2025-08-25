import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Target, Plus, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useSavingsGoals } from "@/hooks/useApi";
import { z } from "zod";

// Basic types for savings goals
type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type InsertSavingsGoal = Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>;

const insertSavingsGoalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().min(0.01, "Target amount must be positive"),
  currentAmount: z.number().min(0, "Current amount cannot be negative").default(0),
  targetDate: z.string().min(1, "Target date is required"),
  monthlyContribution: z.number().min(0, "Monthly contribution cannot be negative").optional(),
  description: z.string().optional(),
});

export function SavingsGoals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: savingsGoals = [], isLoading } = useSavingsGoals();

  const form = useForm<InsertSavingsGoal>({
    resolver: zodResolver(insertSavingsGoalSchema),
    defaultValues: {
      goalName: "",
      targetAmount: "",
      currentAmount: "0",
      monthlyContribution: "0",
      goalType: "emergency_fund",
      isActive: true,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: (data: InsertSavingsGoal) => apiRequest("POST", "/api/savings-goals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<InsertSavingsGoal>) =>
      apiRequest("PUT", `/api/savings-goals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
    },
  });

  const onSubmit = (data: InsertSavingsGoal) => {
    createGoalMutation.mutate(data);
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(parseFloat(amount));
  };

  const calculateProgress = (current: string | null, target: string | null) => {
    if (!current || !target) return 0;
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    return targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  };

  const calculateTimeToGoal = (current: string | null, target: string | null, monthly: string | null) => {
    if (!current || !target || !monthly) return "N/A";
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    const monthlyContribution = parseFloat(monthly);
    
    if (monthlyContribution <= 0) return "N/A";
    
    const remaining = targetAmount - currentAmount;
    if (remaining <= 0) return "Goal reached!";
    
    const months = Math.ceil(remaining / monthlyContribution);
    return `${months} months`;
  };

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
          <Target className="h-6 w-6" />
          Savings Goals
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-goal">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="goalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Emergency Fund" data-testid="input-goal-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-goal-type">
                            <SelectValue placeholder="Select goal type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="emergency_fund">Emergency Fund</SelectItem>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="house">House Down Payment</SelectItem>
                          <SelectItem value="car">Car Purchase</SelectItem>
                          <SelectItem value="retirement">Retirement</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="10000" data-testid="input-target-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="0" data-testid="input-current-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="monthlyContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Contribution</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="500" data-testid="input-monthly-contribution" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-target-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createGoalMutation.isPending} data-testid="button-submit-goal">
                  {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {savingsGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
            <Target className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No savings goals yet</p>
            <p className="text-sm text-muted-foreground">Add your first goal to start tracking progress</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const timeToGoal = calculateTimeToGoal(goal.currentAmount, goal.targetAmount, goal.monthlyContribution);
            
            return (
              <Card key={goal.id} data-testid={`card-goal-${goal.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{goal.goalName}</span>
                    <span className="text-sm font-normal text-muted-foreground capitalize">
                      {goal.goalType.replace('_', ' ')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current</span>
                      <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Target</span>
                      <span className="font-medium">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly</span>
                      <span className="font-medium">{formatCurrency(goal.monthlyContribution)}</span>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Time to goal: {timeToGoal}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        const newAmount = prompt("Enter new current amount:", goal.currentAmount);
                        if (newAmount && !isNaN(parseFloat(newAmount))) {
                          updateGoalMutation.mutate({ id: goal.id, currentAmount: newAmount });
                        }
                      }}
                      data-testid={`button-update-${goal.id}`}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}