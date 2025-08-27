import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/financial-calculations";
import { CheckCircle, CreditCard } from "lucide-react";
import { Payment } from "@shared/schema";

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

  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      // First create the payment record
      const createPaymentData = {
        accountId: payment.accountId,
        accountType: payment.accountType,
        amount: payment.amount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'manual',
        notes: notes || undefined,
      };

      const createResponse = await apiRequest("POST", `/api/payments`, createPaymentData);

      // Then mark it as paid
      const markPaidData = {
        confirmationNumber: confirmationNumber || undefined,
        notes: notes || undefined,
      };

      await apiRequest("PATCH", `/api/payments/${createResponse.data.id}/mark-paid`, markPaidData);
      
      return createResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-payments"] });
      toast({
        title: "Payment Marked as Paid",
        description: `Payment of ${formatCurrency(payment.amount.toString())} has been marked as paid. This account won't appear in upcoming payments for 30 days.`,
      });
      onOpenChange(false);
      setConfirmationNumber("");
      setNotes("");
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
