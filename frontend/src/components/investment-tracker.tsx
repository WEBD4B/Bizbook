import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TrendingUp, Plus, BarChart3, DollarSign, Target, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertInvestmentSchema, type Investment, type InsertInvestment } from "@shared/schema";
import { useInvestments } from "@/hooks/useApi";

export function InvestmentTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: investments = [], isLoading } = useInvestments();

  const form = useForm<InsertInvestment>({
    resolver: zodResolver(insertInvestmentSchema),
    defaultValues: {
      accountName: "",
      accountType: "brokerage",
      balance: "",
      contributionAmount: "0",
      contributionFrequency: "monthly",
      employerMatch: "0",
      riskLevel: "moderate",
      expectedReturn: "7",
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: (data: InsertInvestment) => apiRequest("POST", "/api/investments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateInvestmentMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<InsertInvestment>) =>
      apiRequest("PUT", `/api/investments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
    },
  });

  const onSubmit = (data: InsertInvestment) => {
    createInvestmentMutation.mutate(data);
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0 
    }).format(parseFloat(amount));
  };

  const calculateAnnualContribution = (amount: string | null, frequency: string | null) => {
    if (!amount || !frequency) return 0;
    const monthlyAmount = parseFloat(amount);
    switch (frequency) {
      case "weekly": return monthlyAmount * 52;
      case "biweekly": return monthlyAmount * 26;
      case "monthly": return monthlyAmount * 12;
      case "quarterly": return monthlyAmount * 4;
      case "annually": return monthlyAmount;
      default: return monthlyAmount * 12;
    }
  };

  const calculateProjectedValue = (balance: string | null, contribution: string | null, frequency: string | null, returnRate: string | null, years: number = 10) => {
    if (!balance || !contribution || !returnRate) return 0;
    
    const currentBalance = parseFloat(balance);
    const annualContribution = calculateAnnualContribution(contribution, frequency);
    const rate = parseFloat(returnRate) / 100;
    
    // Future value with compound interest and regular contributions
    const futureValue = currentBalance * Math.pow(1 + rate, years) + 
                       annualContribution * ((Math.pow(1 + rate, years) - 1) / rate);
    
    return futureValue;
  };

  const getTotalPortfolioValue = () => {
    return investments.reduce((sum, inv) => sum + parseFloat(inv.balance || "0"), 0);
  };

  const getTotalAnnualContributions = () => {
    return investments.reduce((sum, inv) => 
      sum + calculateAnnualContribution(inv.contributionAmount, inv.contributionFrequency), 0);
  };

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "conservative": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "aggressive": return "text-red-600";
      default: return "text-gray-600";
    }
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
          <BarChart3 className="h-6 w-6" />
          Investment Portfolio
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-investment">
              <Plus className="h-4 w-4 mr-2" />
              Add Investment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Investment Account</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Fidelity 401k" data-testid="input-account-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-account-type">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="401k">401(k)</SelectItem>
                          <SelectItem value="ira">Traditional IRA</SelectItem>
                          <SelectItem value="roth_ira">Roth IRA</SelectItem>
                          <SelectItem value="brokerage">Brokerage</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="25000" data-testid="input-balance" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contributionAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contribution Amount</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.01" placeholder="500" data-testid="input-contribution-amount" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contributionFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-contribution-frequency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="riskLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-risk-level">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedReturn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Return (%)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.1" placeholder="7" data-testid="input-expected-return" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="employerMatch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employer Match (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.1" placeholder="4" data-testid="input-employer-match" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={createInvestmentMutation.isPending} data-testid="button-submit-investment">
                  {createInvestmentMutation.isPending ? "Adding..." : "Add Investment"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-portfolio">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-total-portfolio">
              {formatCurrency(getTotalPortfolioValue().toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {investments.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-annual-contributions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600" data-testid="text-annual-contributions">
              {formatCurrency(getTotalAnnualContributions().toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              Total yearly investment
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-projected-growth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">10-Year Projection</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600" data-testid="text-projected-growth">
              {formatCurrency(
                investments.reduce((sum, inv) => 
                  sum + calculateProjectedValue(inv.balance, inv.contributionAmount, inv.contributionFrequency, inv.expectedReturn), 0
                ).toString()
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              With current contributions
            </p>
          </CardContent>
        </Card>
      </div>

      {investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No investment accounts yet</p>
            <p className="text-sm text-muted-foreground">Add your first investment account to start tracking</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => {
            const annualContribution = calculateAnnualContribution(investment.contributionAmount, investment.contributionFrequency);
            const projectedValue = calculateProjectedValue(investment.balance, investment.contributionAmount, investment.contributionFrequency, investment.expectedReturn);
            
            return (
              <Card key={investment.id} data-testid={`card-investment-${investment.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{investment.accountName}</span>
                    <span className="text-sm font-normal text-muted-foreground capitalize">
                      {investment.accountType.replace('_', ' ')}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-medium">{formatCurrency(investment.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Annual Contribution</span>
                      <span className="font-medium">{formatCurrency(annualContribution.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Expected Return</span>
                      <span className="font-medium">{investment.expectedReturn}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level</span>
                      <span className={`font-medium capitalize ${getRiskColor(investment.riskLevel)}`}>
                        {investment.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">10-Year Projection</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(projectedValue.toString())}
                      </span>
                    </div>
                  </div>

                  {parseFloat(investment.employerMatch || "0") > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      {investment.employerMatch}% employer match
                    </div>
                  )}

                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      const newBalance = prompt("Enter new balance:", investment.balance || "");
                      if (newBalance && !isNaN(parseFloat(newBalance))) {
                        updateInvestmentMutation.mutate({ id: investment.id, balance: newBalance });
                      }
                    }}
                    data-testid={`button-update-investment-${investment.id}`}
                  >
                    Update Balance
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