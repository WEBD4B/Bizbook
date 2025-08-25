import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CreditCard as CreditCardIcon, 
  Building2, 
  Car, 
  Shield, 
  Zap, 
  DollarSign,
  Calendar,
  Edit,
  PiggyBank
} from "lucide-react";
import { CreditCard, Loan, MonthlyPayment } from "@shared/schema";
import { formatCurrency, getNextDueDate, getDaysUntilDue } from "@/lib/financial-calculations";
import { useCreditCards, useLoans } from "@/hooks/useApi";

type FilterType = "all" | "week" | "month";

interface UpcomingPaymentsProps {
  onEdit?: (account: any, type: string) => void;
  onPay?: (account: any, type: string) => void;
}

export function UpcomingPayments({ onEdit, onPay }: UpcomingPaymentsProps) {
  const [filter, setFilter] = useState<FilterType>("all");

  const { data: creditCards = [], isLoading: creditCardsLoading } = useCreditCards();
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  
  // For monthly payments, we can simulate or use a separate hook when implemented
  const monthlyPayments: MonthlyPayment[] = [];
  const monthlyPaymentsLoading = false;

  const isLoading = creditCardsLoading || loansLoading || monthlyPaymentsLoading;

  // Combine all payment accounts
  const allPayments = [
    ...creditCards.map((card: CreditCard) => ({
      ...card,
      type: "credit-card",
      payment: parseFloat(card.minimumPayment),
      daysUntilDue: getDaysUntilDue(card.dueDate),
      nextDueDate: getNextDueDate(card.dueDate),
    })),
    ...loans.map((loan: Loan) => ({
      ...loan,
      type: "loan",
      payment: parseFloat(loan.monthlyPayment),
      daysUntilDue: getDaysUntilDue(loan.dueDate),
      nextDueDate: getNextDueDate(loan.dueDate),
    })),
    ...monthlyPayments.map((payment: MonthlyPayment) => ({
      ...payment,
      type: "monthly-payment",
      payment: parseFloat(payment.amount),
      daysUntilDue: getDaysUntilDue(payment.dueDate),
      nextDueDate: getNextDueDate(payment.dueDate),
    })),
  ];

  // Filter payments based on selected filter
  const filteredPayments = allPayments.filter(payment => {
    if (filter === "all") return true;
    if (filter === "week") return payment.daysUntilDue <= 7;
    if (filter === "month") return payment.daysUntilDue <= 30;
    return true;
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const getAccountIcon = (type: string, subType?: string) => {
    if (type === "credit-card") return CreditCardIcon;
    if (type === "loan") return Building2;
    if (type === "monthly-payment") {
      switch (subType) {
        case "auto_loan": return Car;
        case "insurance": return Shield;
        case "utilities": return Zap;
        default: return DollarSign;
      }
    }
    return DollarSign;
  };

  const getTypeLabel = (type: string, subType?: string) => {
    if (type === "credit-card") return "Credit Card";
    if (type === "loan") return "Loan";
    if (type === "monthly-payment") {
      switch (subType) {
        case "auto_loan": return "Auto Loan";
        case "insurance": return "Insurance";
        case "utilities": return "Utilities";
        default: return "Other";
      }
    }
    return type;
  };

  const getDueBadgeColor = (daysUntil: number) => {
    if (daysUntil <= 3) return "destructive";
    if (daysUntil <= 7) return "default";
    return "secondary";
  };

  const totalUpcoming = filteredPayments.reduce((sum, payment) => sum + payment.payment, 0);

  if (isLoading) {
    return (
      <Card data-testid="card-upcoming-payments">
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-upcoming-payments">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Payments</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("all")}
              data-testid="filter-all"
            >
              All
            </Button>
            <Button 
              variant={filter === "week" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("week")}
              data-testid="filter-week"
            >
              This Week
            </Button>
            <Button 
              variant={filter === "month" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("month")}
              data-testid="filter-month"
            >
              This Month
            </Button>
          </div>
        </div>
        <div className="text-sm text-neutral-500">
          Total: {formatCurrency(totalUpcoming)} • {filteredPayments.length} payments
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-neutral-500" data-testid="empty-state-payments">
            <Calendar size={48} className="mx-auto mb-4 text-neutral-300" />
            <p className="text-lg font-medium mb-2">No upcoming payments</p>
            <p className="text-sm">
              {filter === "all" 
                ? "You don't have any payment accounts yet" 
                : `No payments due in the selected timeframe`}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const Icon = getAccountIcon(payment.type, payment.paymentType);
            return (
              <div
                key={`${payment.type}-${payment.id}`}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                data-testid={`payment-item-${payment.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-neutral-900" data-testid={`payment-name-${payment.id}`}>
                        {payment.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(payment.type, payment.paymentType)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm font-medium text-primary" data-testid={`payment-amount-${payment.id}`}>
                        {formatCurrency(payment.payment)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        Due: {payment.nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <Badge 
                        variant={getDueBadgeColor(payment.daysUntilDue)}
                        className="text-xs"
                        data-testid={`payment-due-badge-${payment.id}`}
                      >
                        {payment.daysUntilDue === 0 ? "Due Today" : 
                         payment.daysUntilDue === 1 ? "Due Tomorrow" :
                         `${payment.daysUntilDue} days`}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit?.(payment, payment.type)}
                    data-testid={`button-edit-${payment.id}`}
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => onPay?.(payment, payment.type)}
                    data-testid={`button-pay-${payment.id}`}
                  >
                    <PiggyBank size={16} className="mr-1" />
                    Pay
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}