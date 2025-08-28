import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { usePaymentMutation } from "@/lib/clerk-api-hooks";
import { formatCurrency } from "@/lib/financial-calculations";
import { PiggyBank } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";

const paymentSchema = z.object({
  amount: z.string().min(1, "Payment amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: any;
  accountType: string;
}

export function PaymentDialog({ open, onOpenChange, account, accountType }: PaymentDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const paymentMutation = usePaymentMutation();
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      // Use the Clerk-authenticated payment mutation
      const paymentData = {
        accountId: account.id,
        accountType: accountType,
        amount: data.amount,
        paymentDate: data.paymentDate,
        notes: data.notes || null,
      };
      
      // Record the payment using Clerk authentication
      await paymentMutation.mutateAsync(paymentData);

      // Update the account balance with proper token
      const token = await getToken();
      
      if (accountType === "credit-card") {
        const newBalance = Math.max(0, parseFloat(account.balance) - parseFloat(data.amount));
        await apiRequest(`/credit-cards/${account.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            balance: newBalance.toString(),
          })
        }, token);
      } else if (accountType === "loan") {
        const newBalance = Math.max(0, parseFloat(account.currentBalance) - parseFloat(data.amount));
        await apiRequest(`/loans/${account.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            currentBalance: newBalance.toString(),
          })
        }, token);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${accountType}s`] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ 
        title: "Payment Recorded", 
        description: `Payment of ${formatCurrency(parseFloat(form.getValues().amount))} has been recorded successfully.` 
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to record payment", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    recordPaymentMutation.mutate(data);
  };

  const accountName = account?.name || account?.cardName || account?.loanName || "Account";
  const currentBalance = accountType === "loan" 
    ? (account?.currentBalance ? parseFloat(account.currentBalance) : 0)
    : (account?.balance ? parseFloat(account.balance) : 0);
  const paymentAmount = form.watch("amount");
  const newBalance = paymentAmount ? Math.max(0, currentBalance - parseFloat(paymentAmount)) : currentBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-record-payment">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PiggyBank size={20} className="text-primary" />
            <span>Record Payment</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
          <div className="text-sm font-medium text-neutral-900">{accountName}</div>
          <div className="text-xs text-neutral-500 mt-1">
            Current Balance: {formatCurrency(currentBalance)}
          </div>
          {paymentAmount && (
            <div className="text-xs text-primary mt-1">
              New Balance: {formatCurrency(newBalance)}
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      {...field} 
                      data-testid="input-payment-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-payment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add notes about this payment..." 
                      {...field} 
                      data-testid="textarea-payment-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-payment"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-white hover:bg-blue-700" 
                disabled={recordPaymentMutation.isPending}
                data-testid="button-submit-payment"
              >
                {recordPaymentMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}