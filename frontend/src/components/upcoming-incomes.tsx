import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign,
  Calendar,
  Edit,
  TrendingUp,
  Building2,
  Briefcase
} from "lucide-react";
import { Income } from "@/types/schema";
import { formatCurrency } from "@/lib/financial-calculations";
import { useIncomes } from "@/lib/clerk-api-hooks";

type FilterType = "all" | "week" | "month";

interface UpcomingIncomesProps {
  onEdit?: (income: any) => void;
}

interface TransformedIncome {
  id: string;
  name: string;
  source?: string;
  amount: number;
  frequency: string;
  description?: string;
  nextIncomeDate: Date;
  daysUntilIncome: number;
  category?: string;
}

function getDaysUntilIncome(nextPayDate: string): number {
  const nextDate = new Date(nextPayDate);
  const today = new Date();
  
  // Set both dates to start of day to avoid time zone issues
  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);
  
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function UpcomingIncomes({ onEdit }: UpcomingIncomesProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: incomes = [], isLoading: incomesLoading } = useIncomes();

  const isLoading = incomesLoading;

  // Transform incomes with next income date calculations
  const upcomingIncomes: TransformedIncome[] = (incomes as any[]).map((income: any) => ({
    ...income,
    name: income.name || income.source || "Unknown Income",
    nextIncomeDate: new Date(income.nextPayDate || new Date()),
    daysUntilIncome: getDaysUntilIncome(income.nextPayDate || new Date().toISOString()),
    amount: parseFloat(income.amount || "0"),
  }));

  // Filter incomes based on selected filter
  const filteredIncomes = upcomingIncomes.filter((income: TransformedIncome) => {
    if (filter === "all") return true;
    if (filter === "week") {
      // Filter by current calendar week (Sunday to Saturday)
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);
      
      const incomeDate = income.nextIncomeDate;
      return incomeDate >= startOfWeek && incomeDate <= endOfWeek;
    }
    if (filter === "month") {
      // Filter by current calendar month
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const incomeMonth = income.nextIncomeDate.getMonth();
      const incomeYear = income.nextIncomeDate.getFullYear();
      
      return incomeMonth === currentMonth && incomeYear === currentYear;
    }
    return true;
  }).sort((a: TransformedIncome, b: TransformedIncome) => a.daysUntilIncome - b.daysUntilIncome);

  const totalUpcomingIncome = filteredIncomes.reduce((sum: number, income: TransformedIncome) => sum + income.amount, 0);

  const getIncomeIcon = (name: string | undefined) => {
    if (!name) return DollarSign;
    const lowerName = name.toLowerCase();
    if (lowerName.includes('salary') || lowerName.includes('job') || lowerName.includes('work')) {
      return Building2;
    }
    if (lowerName.includes('business') || lowerName.includes('freelance') || lowerName.includes('contract')) {
      return Briefcase;
    }
    return DollarSign;
  };

  const getBadgeVariant = (days: number) => {
    if (days <= 3) return "default";
    if (days <= 7) return "secondary";
    return "outline";
  };

  const getBadgeColor = (days: number) => {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-blue-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Upcoming Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Upcoming Income
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              data-testid="filter-all-incomes"
              className="flex-1 sm:flex-initial"
            >
              All
            </Button>
            <Button
              variant={filter === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("week")}
              data-testid="filter-week-incomes"
              className="flex-1 sm:flex-initial"
            >
              This Week
            </Button>
            <Button
              variant={filter === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("month")}
              data-testid="filter-month-incomes"
              className="flex-1 sm:flex-initial"
            >
              This Month
            </Button>
          </div>
        </div>
        {filteredIncomes.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalUpcomingIncome)} • {filteredIncomes.length} income{filteredIncomes.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {filteredIncomes.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No upcoming income</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all" ? "Add income sources to track upcoming payments." : `No income scheduled for ${filter === "week" ? "this week" : "this month"}.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncomes.map((income: TransformedIncome) => {
              const IconComponent = getIncomeIcon(income.name);
              return (
                <div
                  key={income.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3"
                  data-testid={`income-${income.name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                      <IconComponent className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{income.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Expected: {income.nextIncomeDate.toLocaleDateString()}</span>
                        <Badge variant={getBadgeVariant(income.daysUntilIncome)} className={getBadgeColor(income.daysUntilIncome)}>
                          {income.daysUntilIncome === 0 ? "Today" : 
                           income.daysUntilIncome === 1 ? "Tomorrow" : 
                           income.daysUntilIncome < 0 ? `${Math.abs(income.daysUntilIncome)} days late` :
                           `${income.daysUntilIncome} days`}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-green-600" data-testid={`text-income-amount-${income.name.replace(/\s+/g, '-').toLowerCase()}`}>
                        {formatCurrency(income.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {income.frequency}
                      </div>
                    </div>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(income)}
                        data-testid={`button-edit-income-${income.name.replace(/\s+/g, '-').toLowerCase()}`}
                        className="flex-shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}