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
  PiggyBank,
  CheckCircle
} from "lucide-react";
import { CreditCard, Loan, MonthlyPayment } from "@/types/schema";
import { formatCurrency, getNextDueDate, getDaysUntilDue, getDaysUntilDate } from "@/lib/financial-calculations";
import { useCreditCards, useLoans, usePayments } from "@/lib/clerk-api-hooks";
import { MarkAsPaidDialog } from "./mark-as-paid-dialog";

type FilterType = "all" | "week" | "month";

interface UpcomingPaymentsProps {
  onEdit?: (account: any, type: string) => void;
  onPay?: (account: any, type: string) => void;
}

export function UpcomingPayments({ onEdit, onPay }: UpcomingPaymentsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const { data: creditCards = [], isLoading: creditCardsLoading } = useCreditCards();
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  
  // For monthly payments, we can simulate or use a separate hook when implemented
  const monthlyPayments: MonthlyPayment[] = [];
  const monthlyPaymentsLoading = false;

  const isLoading = creditCardsLoading || loansLoading || monthlyPaymentsLoading || paymentsLoading;

  // Helper function to check if an account has been paid recently (within 30 days)
  const hasRecentPayment = (accountId: string, accountType: string) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Normalize account type formats (credit-card vs credit_card)  
    const normalizedAccountType = accountType === 'credit-card' ? 'credit_card' : accountType;
    
    // Get all account IDs that belong to the current user
    const currentUserAccountIds = [
      ...creditCards.map(card => card.id),
      ...loans.map(loan => loan.id)
    ];
    
    // Filter payments to only include recent ones for this specific account
    // AND only consider payments for accounts that belong to the current user
    const recentPayments = Array.isArray(payments) ? payments.filter((payment: any) => 
      payment.accountId === accountId && 
      currentUserAccountIds.includes(payment.accountId) && // Only consider payments for current user's accounts
      (payment.accountType === normalizedAccountType || payment.accountType === accountType) &&
      payment.status === 'paid' &&
      payment.paidDate &&
      new Date(payment.paidDate) > thirtyDaysAgo
    ) : [];
    
    // Add debug logging for the Chase Bank card specifically
    if (accountId === 'db6d4a8a-57f6-427b-8878-62de904dc053') {
      console.log('🔍 Checking Chase Bank card payment status:', {
        accountId,
        accountType,
        normalizedAccountType,
        paymentsCount: Array.isArray(payments) ? payments.length : 0,
        currentUserAccountIds: currentUserAccountIds.slice(0, 3), // Show first 3 IDs
        recentPayments: recentPayments.length,
        recentPaymentDetails: recentPayments.map(p => ({
          id: p.id,
          status: p.status,
          paidDate: p.paidDate,
          accountId: p.accountId
        }))
      });
    }
    
    return recentPayments.length > 0;
  };

  // Combine all payment accounts and filter out recently paid ones
  const allPayments = [
    ...creditCards
      .filter((card: CreditCard) => !hasRecentPayment(card.id, 'credit_card'))
      .map((card: CreditCard) => ({
        ...card,
        type: "credit-card",
        payment: card.minimumPayment || 0,
        daysUntilDue: card.dueDate ? getDaysUntilDate(card.dueDate) : 0,
        nextDueDate: card.dueDate ? new Date(card.dueDate) : new Date(),
      })),
    ...loans
      .filter((loan: Loan) => !hasRecentPayment(loan.id, 'loan'))
      .map((loan: Loan) => ({
        ...loan,
        type: "loan",
        payment: loan.monthlyPayment || 0,
        daysUntilDue: loan.dueDate ? getDaysUntilDate(loan.dueDate) : 0,
        nextDueDate: loan.dueDate ? new Date(loan.dueDate) : new Date(),
      })),
    ...monthlyPayments
      .filter((payment: MonthlyPayment) => !hasRecentPayment(payment.id, 'monthly_payment'))
      .map((payment: MonthlyPayment) => ({
        ...payment,
        type: "monthly-payment",
        payment: payment.amount || 0,
        daysUntilDue: payment.dueDate ? getDaysUntilDate(payment.dueDate) : 0,
        nextDueDate: payment.dueDate ? new Date(payment.dueDate) : new Date(),
      })),
  ];

  // Filter payments based on selected filter
  const filteredPayments = allPayments.filter(payment => {
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
      
      const paymentDate = payment.nextDueDate;
      return paymentDate >= startOfWeek && paymentDate <= endOfWeek;
    }
    if (filter === "month") {
      // Only show payments due in the current calendar month
      const now = new Date();
      const paymentDate = payment.nextDueDate;
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }
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

  const handleMarkAsPaid = (payment: any) => {
    // Create a payment object for the dialog
    const paymentData = {
      id: payment.id,
      userId: payment.userId,
      accountId: payment.id,
      accountType: payment.type === 'credit-card' ? 'credit_card' : payment.type,
      amount: payment.payment,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    };
    setSelectedPayment({ ...paymentData, payment });
    setMarkAsPaidDialogOpen(true);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>Upcoming Payments</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === "all" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("all")}
              data-testid="filter-all"
              className="flex-1 sm:flex-initial"
            >
              All
            </Button>
            <Button 
              variant={filter === "week" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("week")}
              data-testid="filter-week"
              className="flex-1 sm:flex-initial"
            >
              This Week
            </Button>
            <Button 
              variant={filter === "month" ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter("month")}
              data-testid="filter-month"
              className="flex-1 sm:flex-initial"
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
                ? "You don't have any payment accounts due, or they've been paid recently" 
                : `No payments due in the selected timeframe`}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const Icon = getAccountIcon(payment.type);
            const accountName = payment.type === 'credit-card' ? (payment as any).cardName : 
                              payment.type === 'loan' ? (payment as any).loanName : 
                              (payment as any).paymentName || 'Payment';
            return (
              <div
                key={`${payment.type}-${payment.id}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors gap-3"
                data-testid={`payment-item-${payment.id}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-neutral-900" data-testid={`payment-name-${payment.id}`}>
                        {accountName}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(payment.type)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:space-x-4 mt-1">
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
                         payment.daysUntilDue < 0 ? `${Math.abs(payment.daysUntilDue)} days overdue` :
                         `${payment.daysUntilDue} days`}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex sm:space-x-2 w-full sm:w-auto">
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleMarkAsPaid(payment)}
                    data-testid={`button-pay-${payment.id}`}
                    className="w-full sm:w-auto"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Mark as Paid
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
      
      {selectedPayment && (
        <MarkAsPaidDialog
          open={markAsPaidDialogOpen}
          onOpenChange={setMarkAsPaidDialogOpen}
          payment={selectedPayment}
          accountName={selectedPayment.payment?.type === 'credit-card' ? 
                      selectedPayment.payment?.cardName : 
                      selectedPayment.payment?.loanName || 'Payment'}
        />
      )}
    </Card>
  );
}