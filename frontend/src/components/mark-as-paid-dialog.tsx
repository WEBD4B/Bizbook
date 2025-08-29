import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/financial-calculations";
import { CheckCircle, CreditCard } from "lucide-react";
import { Payment } from "@/types/schema";
import { useIncomes } from "@/lib/clerk-api-hooks";

interface MarkAsPaidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  accountName: string;
}

export function MarkAsPaidDialog({ open, onOpenChange, payment, accountName }: MarkAsPaidDialogProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIncomeId, setSelectedIncomeId] = useState<string>("");
  
  // Fetch income data for the dropdown
  const { data: incomes = [], isLoading: incomeLoading } = useIncomes();

  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      
      // First create the payment record
      const createPaymentData = {
        accountId: payment.accountId,
        accountType: payment.accountType,
        amount: payment.amount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'manual',
        notes: notes || undefined,
        incomeId: selectedIncomeId || undefined, // Include the selected income ID
      };

      const createResponse = await apiRequest('/payments', {
        method: 'POST',
        body: JSON.stringify(createPaymentData),
      }, token);

      // Then mark it as paid
      const markPaidData = {
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
        incomeId: selectedIncomeId || undefined, // Include in mark-as-paid data too
      };

      await apiRequest(`/payments/${createResponse.data.id}/mark-paid`, {
        method: 'PATCH',
        body: JSON.stringify(markPaidData),
      }, token);

      // If an income source was selected, create an expense to deduct from available cash
      if (selectedIncomeId) {
        const selectedIncome = incomes.find((income: any) => income.id === selectedIncomeId);
        if (selectedIncome) {
          const expenseData = {
            category: 'Bills & Utilities',
            description: `Payment for ${payment.accountType === 'credit_card' ? 'Credit Card' : 'Loan'} - ${confirmationNumber || 'Manual Payment'}`,
            amount: payment.amount,
            expenseDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'electronic',
            notes: `Paid from ${selectedIncome.source} income`,
            incomeId: selectedIncomeId,
          };

          await apiRequest('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData),
          }, token);
        }
      }
      
      return createResponse.data;
    },
    onSuccess: () => {
      // Invalidate the correct query keys used by Clerk hooks
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['creditCards'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyPayments'] });
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      
      // Force refetch of payments data
      queryClient.refetchQueries({ queryKey: ['payments'] });
      queryClient.refetchQueries({ queryKey: ['creditCards'] });
      
      toast({
        title: "Payment Marked as Paid",
        description: `Payment of ${formatCurrency(payment.amount.toString())} has been marked as paid. This account won't appear in upcoming payments for 30 days.`,
      });
      onOpenChange(false);
      setConfirmationNumber("");
      setNotes("");
      setSelectedIncomeId("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark payment as paid",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAsPaidMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-mark-payment-paid">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CheckCircle size={20} className="text-green-600" />
            <span>Mark Payment as Paid</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-3">
            <CreditCard size={20} className="text-green-600" />
            <div>
              <div className="text-sm font-medium text-green-900">{accountName}</div>
              <div className="text-sm text-green-700">
                Payment: {formatCurrency((payment?.amount || 0).toString())}
              </div>
              <div className="text-xs text-green-600">
                Due: {payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="incomeSource">Income Source Used to Pay (Optional)</Label>
            <Select value={selectedIncomeId} onValueChange={setSelectedIncomeId}>
              <SelectTrigger id="incomeSource" data-testid="select-income-source">
                <SelectValue placeholder={incomeLoading ? "Loading income sources..." : "Select income source"} />
              </SelectTrigger>
              <SelectContent>
                {incomes.map((income: any) => (
                  <SelectItem key={income.id} value={income.id}>
                    {income.source} - {formatCurrency(income.amount.toString())} ({income.frequency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {incomes.length === 0 && !incomeLoading && (
              <p className="text-sm text-gray-500 mt-1">No income sources available</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmationNumber">Confirmation Number (Optional)</Label>
            <Input
              id="confirmationNumber"
              type="text"
              placeholder="Enter confirmation number"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              data-testid="input-confirmation-number"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this payment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="textarea-payment-notes"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-mark-paid"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              disabled={markAsPaidMutation.isPending}
              data-testid="button-confirm-mark-paid"
            >
              {markAsPaidMutation.isPending ? "Marking as Paid..." : "Mark as Paid"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
