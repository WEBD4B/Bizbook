import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useExpenseMutation, useIncomes } from "@/lib/clerk-api-hooks";
import { Plus, Receipt, Repeat, CreditCard, Calendar } from "lucide-react";
import { insertExpenseSchema } from "@shared/schema";

const expenseFormSchema = insertExpenseSchema.extend({
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  expenseDate: z.string().min(1, "Date is required"),
  paymentType: z.enum(['subscription', 'one-time']).optional(),
  paidFromIncomeId: z.string().min(1, "Please select which account was used for payment"),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  onExpenseAdded?: () => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: incomes = [] } = useIncomes();

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      category: "",
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: "",
      paymentType: "one-time",
      paidFromIncomeId: "",
      notes: "",
      isRecurring: false,
    },
  });

  const createExpenseMutation = useExpenseMutation();

  const onSubmit = (data: ExpenseFormData) => {
    // Find the selected income source to include its name
    const selectedIncome = incomes.find((income: any) => income.id === data.paidFromIncomeId);
    const formData = {
      ...data,
      paidFromIncome: selectedIncome?.source || "",
    };
    
    createExpenseMutation.mutate(formData, {
      onSuccess: () => {
        toast({ 
          title: "Expense Added", 
          description: "Your expense has been recorded successfully." 
        });
        setOpen(false);
        form.reset();
        onExpenseAdded?.();
      },
      onError: () => {
        toast({ 
          title: "Error", 
          description: "Failed to add expense", 
          variant: "destructive" 
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="bg-primary text-white hover:bg-blue-700"
          data-testid="button-add-expense"
        >
          <Plus size={16} className="mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="dialog-add-expense">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt size={20} className="text-primary" />
            <span>Add Expense</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Electric bill, Groceries, Gas" 
                      {...field} 
                      data-testid="input-expense-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        data-testid="input-expense-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-expense-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="select-expense-category">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="utilities">🔌 Utilities</SelectItem>
                        <SelectItem value="groceries">🛒 Groceries</SelectItem>
                        <SelectItem value="bills">📄 Bills</SelectItem>
                        <SelectItem value="gas">⛽ Gas & Transportation</SelectItem>
                        <SelectItem value="dining">🍽️ Dining Out</SelectItem>
                        <SelectItem value="entertainment">🎬 Entertainment</SelectItem>
                        <SelectItem value="shopping">🛍️ Shopping</SelectItem>
                        <SelectItem value="healthcare">🏥 Healthcare</SelectItem>
                        <SelectItem value="insurance">🛡️ Insurance</SelectItem>
                        <SelectItem value="subscriptions">📱 Subscriptions</SelectItem>
                        <SelectItem value="home">🏠 Home & Garden</SelectItem>
                        <SelectItem value="education">📚 Education</SelectItem>
                        <SelectItem value="travel">✈️ Travel</SelectItem>
                        <SelectItem value="other">💰 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="select-payment-type">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="subscription">📱 Subscription</SelectItem>
                        <SelectItem value="one-time">📝 One-Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paidFromIncomeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paid From Account *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} data-testid="select-income-account">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Which account was used?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incomes.map((income: any) => (
                        <SelectItem key={income.id} value={income.id}>
                          💰 {income.source} ({income.incomeType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method (Optional)</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange} data-testid="select-payment-method">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you pay?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="credit-card">💳 Credit Card</SelectItem>
                      <SelectItem value="debit-card">💳 Debit Card</SelectItem>
                      <SelectItem value="check">📝 Check</SelectItem>
                      <SelectItem value="bank-transfer">🏦 Bank Transfer</SelectItem>
                      <SelectItem value="digital-wallet">📱 Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm flex items-center space-x-2">
                      <Repeat size={14} />
                      <span>Recurring Expense</span>
                    </FormLabel>
                    <div className="text-xs text-neutral-500">
                      Mark if this is a regular monthly bill
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-recurring-expense"
                    />
                  </FormControl>
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
                      placeholder="Additional details about this expense..." 
                      className="min-h-[60px]"
                      {...field} 
                      data-testid="textarea-expense-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => setOpen(false)}
                data-testid="button-cancel-expense"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary text-white hover:bg-blue-700" 
                disabled={createExpenseMutation.isPending}
                data-testid="button-submit-expense"
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}