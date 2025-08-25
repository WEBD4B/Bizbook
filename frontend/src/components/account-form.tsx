import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutatio      console.log('🟡 [LOAN] Loan creation result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/credit-cards"] });eQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCreditCardSchema, insertLoanSchema } from "@shared/schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

const accountFormSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("credit-card"),
    name: z.string().min(1, "Account name is required"),
    balance: z.string().min(1, "Balance is required"),
    creditLimit: z.string().min(1, "Credit limit is required"),
    interestRate: z.string().min(1, "Interest rate is required"),
    minimumPayment: z.string().min(1, "Minimum payment is required"),
    dueDate: z.string().min(1, "Due date is required"),
  }),
  z.object({
    type: z.literal("loan"),
    name: z.string().min(1, "Loan name is required"),
    balance: z.string().min(1, "Balance is required"),
    originalAmount: z.string().min(1, "Original amount is required"),
    interestRate: z.string().min(1, "Interest rate is required"),
    monthlyPayment: z.string().min(1, "Monthly payment is required"),
    termMonths: z.string().min(1, "Term is required"),
    dueDate: z.string().min(1, "Due date is required"),
    loanType: z.enum(["personal", "auto", "student", "mortgage"]),
  }),
  z.object({
    type: z.literal("monthly-payment"),
    name: z.string().min(1, "Payment name is required"),
    amount: z.string().min(1, "Amount is required"),
    dueDate: z.string().min(1, "Due date is required"),
    paymentType: z.enum(["auto_loan", "insurance", "utilities", "other"]),
    isRecurring: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("income"),
    name: z.string().min(1, "Income source is required"),
    amount: z.string().min(1, "Amount is required"),
    frequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]),
    nextPayDate: z.string().min(1, "Next pay date is required"),
  }),
]);

type AccountFormData = z.infer<typeof accountFormSchema>;

export function AccountForm() {
  const [open, setOpen] = useState(false);
  const [accountType, setAccountType] = useState<"credit-card" | "loan" | "monthly-payment" | "income">("credit-card");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      type: "credit-card",
      name: "",
      dueDate: "",
    },
  });

  const createCreditCardMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔵 [CREDIT CARD] Starting credit card creation process...');
      console.log('🔵 [CREDIT CARD] Raw form data:', data);
      
      console.log('🔵 [CREDIT CARD] Getting authentication token...');
      const token = await getToken();
      console.log('🔵 [CREDIT CARD] Token received:', token ? 'Yes' : 'No');
      
      const requestPayload = {
        cardName: data.name, // Map 'name' to 'cardName'
        balance: data.balance,
        creditLimit: data.creditLimit,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        dueDate: data.dueDate, // Keep as string, backend expects string
      };
      
      console.log('🔵 [CREDIT CARD] Mapped request payload:', requestPayload);
      
      const requestOptions = {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      };
      
      console.log('🔵 [CREDIT CARD] Request options:', requestOptions);
      console.log('🔵 [CREDIT CARD] Making API request to /credit-cards...');
      
      const result = await apiRequest("/credit-cards", requestOptions, token);
      
      console.log('🔵 [CREDIT CARD] API request completed successfully!');
      console.log('🔵 [CREDIT CARD] Result:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('🟢 [CREDIT CARD] Success! Credit card created:', result);
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      toast({ title: "Success", description: "Credit card added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      console.error('🔴 [CREDIT CARD] Error creating credit card:', error);
      console.error('🔴 [CREDIT CARD] Error message:', error.message);
      console.error('🔴 [CREDIT CARD] Error stack:', error.stack);
      toast({ 
        title: "Error", 
        description: `Failed to add credit card: ${error.message}`, 
        variant: "destructive" 
      });
    },
  });

  const createLoanMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating loan with data:', data);
      const token = await getToken();
      const result = await apiRequest("/loans", {
        method: 'POST',
        body: JSON.stringify({
          loanName: data.name, // Map 'name' to 'loanName'
          loanType: data.loanType,
          originalAmount: data.originalAmount,
          currentBalance: data.balance, // Map 'balance' to 'currentBalance'
          interestRate: data.interestRate,
          monthlyPayment: data.monthlyPayment,
          termLength: parseInt(data.termMonths), // Map 'termMonths' to 'termLength' and convert to number
          dueDate: data.dueDate, // Keep as string
        })
      }, token);
      console.log('Loan creation result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      toast({ title: "Success", description: "Loan added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Loan creation error:', error);
      toast({ title: "Error", description: "Failed to add loan", variant: "destructive" });
    },
  });

  const createMonthlyPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating monthly payment with data:', data);
      const token = await getToken();
      const result = await apiRequest("/monthly-payments", {
        method: 'POST',
        body: JSON.stringify({
          accountId: '00000000-0000-0000-0000-000000000001', // Placeholder for now
          accountType: data.paymentType, // Map 'paymentType' to 'accountType'
          paymentName: data.name, // Map 'name' to 'paymentName'
          amount: data.amount,
          dueDate: data.dueDate, // Keep as string
          isRecurring: data.isRecurring ?? true,
        })
      }, token);
      console.log('Monthly payment creation result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-payments"] });
      toast({ title: "Success", description: "Monthly payment added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Monthly payment creation error:', error);
      toast({ title: "Error", description: "Failed to add monthly payment", variant: "destructive" });
    },
  });

  const createIncomeMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating income with data:', data);
      const token = await getToken();
      const result = await apiRequest("/income", {
        method: 'POST',
        body: JSON.stringify({
          source: data.name, // Map 'name' to 'source'
          incomeType: 'regular', // Set default income type
          amount: data.amount,
          frequency: data.frequency,
          nextPayDate: data.nextPayDate,
        })
      }, token);
      console.log('Income creation result:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast({ title: "Success", description: "Income source added successfully" });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Income creation error:', error);
      toast({ title: "Error", description: "Failed to add income source", variant: "destructive" });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    console.log('🚀 [FORM] Form submitted with data:', data);
    console.log('🚀 [FORM] Account type:', data.type);
    
    if (data.type === "credit-card") {
      console.log('🔵 [FORM] Triggering credit card mutation...');
      createCreditCardMutation.mutate(data);
    } else if (data.type === "loan") {
      console.log('🟡 [FORM] Triggering loan mutation...');
      createLoanMutation.mutate(data);
    } else if (data.type === "monthly-payment") {
      console.log('🟠 [FORM] Triggering monthly payment mutation...');
      createMonthlyPaymentMutation.mutate(data);
    } else if (data.type === "income") {
      console.log('🟢 [FORM] Triggering income mutation...');
      createIncomeMutation.mutate(data);
    }
  };

  const isPending = createCreditCardMutation.isPending || createLoanMutation.isPending || 
                   createMonthlyPaymentMutation.isPending || createIncomeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-blue-700" data-testid="button-add-account">
          <Plus className="mr-2" size={16} />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-account">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value: "credit-card" | "loan" | "monthly-payment" | "income") => {
                        field.onChange(value);
                        setAccountType(value);
                        form.reset({ type: value });
                      }}
                      data-testid="select-account-type"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit Card</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="monthly-payment">Monthly Payment</SelectItem>
                        <SelectItem value="income">Income Source</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Chase Freedom Unlimited" 
                        {...field} 
                        data-testid="input-account-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Credit Card and Loan specific fields */}
            {(accountType === "credit-card" || accountType === "loan") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Balance</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          data-testid="input-balance"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {accountType === "credit-card" ? (
                  <FormField
                    control={form.control}
                    name="creditLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            data-testid="input-credit-limit"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="originalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Loan Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            data-testid="input-original-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Amount field for monthly payments and income */}
            {(accountType === "monthly-payment" || accountType === "income") && (
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{accountType === "income" ? "Income Amount" : "Payment Amount"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field} 
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Interest rate and payment fields for credit cards and loans */}
            {(accountType === "credit-card" || accountType === "loan") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0.00" 
                          {...field} 
                          data-testid="input-interest-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {accountType === "credit-card" ? (
                  <FormField
                    control={form.control}
                    name="minimumPayment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Payment</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field} 
                            data-testid="input-minimum-payment"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="monthlyPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Payment</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field} 
                              data-testid="input-monthly-payment"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="termMonths"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Term (Months)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="36" 
                              {...field} 
                              data-testid="input-term-months"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            {/* Due Date field for credit cards, loans, and monthly payments */}
            {(accountType === "credit-card" || accountType === "loan" || accountType === "monthly-payment") && (
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (Day of Month)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="31" 
                        placeholder="15" 
                        {...field} 
                        data-testid="input-due-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Income frequency and pay date */}
            {accountType === "income" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Frequency</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="select-frequency">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nextPayDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Pay Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-next-pay-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Loan type selector */}
            {accountType === "loan" && (
              <FormField
                control={form.control}
                name="loanType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="select-loan-type">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select loan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal Loan</SelectItem>
                        <SelectItem value="auto">Auto Loan</SelectItem>
                        <SelectItem value="student">Student Loan</SelectItem>
                        <SelectItem value="mortgage">Mortgage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Payment type selector */}
            {accountType === "monthly-payment" && (
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="select-payment-type">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="auto_loan">Auto Loan</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="border-t border-neutral-200 pt-6">
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary text-white hover:bg-blue-700" 
                  disabled={isPending}
                  data-testid="button-submit"
                >
                  {isPending ? "Adding..." : "Add Account"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
