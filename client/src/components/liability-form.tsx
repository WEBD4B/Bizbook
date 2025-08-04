import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLiabilitySchema, type InsertLiability } from "@shared/schema";
import { z } from "zod";

const formSchema = insertLiabilitySchema.extend({
  currentBalance: z.string().min(1, "Current balance is required"),
  originalAmount: z.string().optional(),
  interestRate: z.string().optional(),
  minimumPayment: z.string().optional(),
  monthlyPayment: z.string().optional(),
  creditLimit: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface LiabilityFormProps {
  onSuccess?: () => void;
  liability?: InsertLiability & { id: string };
}

const LIABILITY_TYPES = [
  { value: "consumer_debt", label: "Consumer Debt" },
  { value: "vehicle_loans", label: "Vehicle Loans" },
  { value: "real_estate", label: "Real Estate Loans" },
  { value: "education", label: "Education Debt" },
  { value: "business", label: "Business Debt" },
  { value: "taxes_bills", label: "Taxes & Bills" }
];

const SUBCATEGORIES = {
  consumer_debt: ["credit_card", "personal_loan", "bnpl", "payday_loan", "line_of_credit"],
  vehicle_loans: ["auto_loan", "motorcycle_loan", "boat_loan", "rv_loan"],
  real_estate: ["mortgage", "heloc", "home_equity_loan", "second_mortgage"],
  education: ["student_loan", "parent_plus", "private_education_loan"],
  business: ["business_loan", "business_line_of_credit", "equipment_financing", "merchant_cash_advance"],
  taxes_bills: ["unpaid_taxes", "medical_bills", "legal_fees", "utility_bills"]
};

const PAYMENT_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "bi_weekly", label: "Bi-weekly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" }
];

const PAYOFF_STRATEGIES = [
  { value: "minimum", label: "Minimum Payments" },
  { value: "avalanche", label: "Debt Avalanche (Highest Interest First)" },
  { value: "snowball", label: "Debt Snowball (Smallest Balance First)" }
];

export function LiabilityForm({ onSuccess, liability }: LiabilityFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(liability?.liabilityType || "");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liabilityName: liability?.liabilityName || "",
      liabilityType: liability?.liabilityType || "",
      subcategory: liability?.subcategory || "",
      currentBalance: liability?.currentBalance || "",
      originalAmount: liability?.originalAmount || "",
      interestRate: liability?.interestRate || "",
      minimumPayment: liability?.minimumPayment || "",
      monthlyPayment: liability?.monthlyPayment || "",
      dueDate: liability?.dueDate || "",
      paymentFrequency: liability?.paymentFrequency || "monthly",
      lender: liability?.lender || "",
      accountNumber: liability?.accountNumber || "",
      loanTerm: liability?.loanTerm || undefined,
      remainingTerm: liability?.remainingTerm || undefined,
      payoffStrategy: liability?.payoffStrategy || "",
      isSecured: liability?.isSecured ?? false,
      collateral: liability?.collateral || "",
      taxDeductible: liability?.taxDeductible ?? false,
      creditLimit: liability?.creditLimit || "",
      notes: liability?.notes || ""
    }
  });

  const createLiabilityMutation = useMutation({
    mutationFn: (data: InsertLiability) => apiRequest("POST", "/api/liabilities", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      toast({
        title: "Success",
        description: "Liability created successfully"
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create liability",
        variant: "destructive"
      });
    }
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: (data: InsertLiability) => apiRequest("PUT", `/api/liabilities/${liability?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      toast({
        title: "Success",
        description: "Liability updated successfully"
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update liability",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    const liabilityData: InsertLiability = {
      ...data,
      originalAmount: data.originalAmount || null,
      interestRate: data.interestRate || null,
      minimumPayment: data.minimumPayment || null,
      monthlyPayment: data.monthlyPayment || null,
      dueDate: data.dueDate || null,
      lender: data.lender || null,
      accountNumber: data.accountNumber || null,
      loanTerm: data.loanTerm || null,
      remainingTerm: data.remainingTerm || null,
      payoffStrategy: data.payoffStrategy || null,
      collateral: data.collateral || null,
      creditLimit: data.creditLimit || null,
      notes: data.notes || null
    };

    if (liability) {
      updateLiabilityMutation.mutate(liabilityData);
    } else {
      createLiabilityMutation.mutate(liabilityData);
    }
  };

  const isPending = createLiabilityMutation.isPending || updateLiabilityMutation.isPending;
  const availableSubcategories = selectedType ? SUBCATEGORIES[selectedType as keyof typeof SUBCATEGORIES] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{liability ? "Edit Liability" : "Add New Liability"}</CardTitle>
        <CardDescription>
          {liability ? "Update liability information" : "Enter details for your new debt or liability"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="liabilityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liability Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chase Credit Card" {...field} data-testid="input-liability-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liabilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Liability Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedType(value);
                        form.setValue("subcategory", "");
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-liability-type">
                          <SelectValue placeholder="Select liability type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LIABILITY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {availableSubcategories.length > 0 && (
                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-liability-subcategory">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableSubcategories.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="currentBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Balance ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="5000.00" {...field} data-testid="input-current-balance" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Loan Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="originalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10000.00" {...field} data-testid="input-original-amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (% APR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="18.99" {...field} data-testid="input-interest-rate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Limit ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="15000.00" {...field} data-testid="input-credit-limit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Information */}
            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="minimumPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Payment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="125.00" {...field} data-testid="input-minimum-payment" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Payment ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="250.00" {...field} data-testid="input-monthly-payment" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-due-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lender and Account Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="lender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lender/Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Chase Bank" {...field} data-testid="input-lender" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number (last 4 digits)</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" maxLength={4} {...field} data-testid="input-account-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Loan Terms */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="loanTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Term (months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="60" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-loan-term"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remainingTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remaining Term (months)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="48" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        data-testid="input-remaining-term"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payoffStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payoff Strategy</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payoff-strategy">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYOFF_STRATEGIES.map((strategy) => (
                          <SelectItem key={strategy.value} value={strategy.value}>
                            {strategy.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Security and Tax Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="isSecured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Secured Debt</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Is this debt secured by collateral?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-is-secured"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxDeductible"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Tax Deductible</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Is the interest tax deductible?
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-tax-deductible"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collateral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Collateral (if secured)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2020 Honda Civic" {...field} data-testid="input-collateral" />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes about this liability..."
                      className="resize-none"
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-save-liability"
              >
                {isPending ? "Saving..." : liability ? "Update Liability" : "Save Liability"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}