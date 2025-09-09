import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiWithAuth";
import { useToast } from "@/hooks/use-toast";

interface LoanFormProps {
  onClose?: () => void;
  initialData?: any;
  isEditing?: boolean;
}

export const LoanForm: React.FC<LoanFormProps> = ({ onClose, initialData, isEditing = false }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // React Query mutation for loan operations
  const loanMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      
      console.log('🔵 [LOAN-FORM] Form submission:', { data, isEditing, initialData });
      
      // Convert due date to proper date string format (YYYY-MM-DD)
      let dueDateValue = null;
      if (data.dueDate) {
        // If it's already a date string from the date input, use it directly
        dueDateValue = data.dueDate;
        console.log('🔵 [LOAN-FORM] Using date string:', dueDateValue);
      }
      
      // Calculate monthly payment using loan formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
      // where P = monthly payment, L = loan amount, c = monthly interest rate, n = number of months
      const amount = parseFloat(data.amount);
      let monthlyPayment = 0;
      
      // Use manually entered monthly payment if provided, otherwise calculate it
      if (data.monthlyPayment && parseFloat(data.monthlyPayment) > 0) {
        monthlyPayment = parseFloat(data.monthlyPayment);
        console.log('🔵 [LOAN-FORM] Using manually entered monthly payment:', monthlyPayment);
      } else {
        // Auto-calculate monthly payment
        const annualRate = parseFloat(data.interestRate) / 100;
        const termMonths = parseInt(data.termLength);
        
        if (amount > 0 && annualRate > 0 && termMonths > 0) {
          const monthlyRate = annualRate / 12;
          monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
        } else if (amount > 0 && termMonths > 0) {
          // If no interest rate, just divide principal by term
          monthlyPayment = amount / termMonths;
        }
        console.log('🔵 [LOAN-FORM] Auto-calculated monthly payment:', monthlyPayment);
      }
      
      const requestPayload = {
        loanName: data.name,
        originalAmount: amount.toString(),
        currentBalance: amount.toString(), // Initially, current balance equals original amount
        monthlyPayment: monthlyPayment.toString(),
        minimumPayment: monthlyPayment.toString(), // Set minimum payment same as monthly payment
        interestRate: data.interestRate,
        termLength: parseInt(data.termLength),
        dueDate: dueDateValue, // Send as date string, not timestamp
        loanType: data.loanType,
        description: data.description,
        ...(data.loanType === "business" && data.businessProfileId 
          ? { businessProfileId: data.businessProfileId } 
          : {})
      };
      
      console.log('🔵 [LOAN-FORM] Mapped payload:', requestPayload);
      
      const endpoint = isEditing ? `/loans/${initialData.id}` : "/loans";
      const method = isEditing ? 'PATCH' : 'POST';
      
      const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(requestPayload)
      }, token);
      
      console.log('🔵 [LOAN-FORM] API response:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log(`🟢 [LOAN-FORM] Loan ${isEditing ? 'updated' : 'created'} successfully:`, result);
      toast({
        title: "Success",
        description: `Loan ${isEditing ? 'updated' : 'added'} successfully`
      });
      // Invalidate all relevant queries that might display loan data
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["business-loans"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      queryClient.invalidateQueries({ queryKey: ["/api/net-worth-snapshots"] });
      if (onClose) {
        onClose();
      }
    },
    onError: (error: any) => {
      console.error(`❌ [LOAN-FORM] Loan ${isEditing ? 'update' : 'creation'} failed:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} loan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Helper function to safely convert date
  const initializeDueDate = (date: any): string => {
    console.log('🔍 [LOAN-FORM] initializeDueDate called with:', { date, type: typeof date });
    if (!date) return '';
    
    console.log('🔵 [LOAN-FORM] Raw due date:', { date, type: typeof date });
    
    if (typeof date === 'string') {
      // Handle ISO date strings by extracting just the date part
      if (date.includes('T')) {
        const result = date.split('T')[0];
        console.log('🔍 [LOAN-FORM] ISO string converted to date:', result);
        return result;
      }
      console.log('🔍 [LOAN-FORM] Simple date string, returning as-is:', date);
      return date;
    }
    if (typeof date === 'number') {
      const dateObj = new Date(date);
      const result = dateObj.toISOString().split('T')[0];
      console.log('🔍 [LOAN-FORM] Number date, converted to:', result);
      return result;
    }
    
    console.log('🔍 [LOAN-FORM] Unknown date format, returning empty');
    return '';
  };

  const [formData, setFormData] = useState({
    name: initialData?.loanName || initialData?.loan_name || initialData?.name || "",
    amount: initialData?.originalAmount || initialData?.original_amount || initialData?.currentBalance || initialData?.current_balance || initialData?.amount || "",
    interestRate: initialData?.interestRate || initialData?.interest_rate || "",
    termLength: initialData?.termLength || initialData?.term_length || "",
    monthlyPayment: initialData?.monthlyPayment || initialData?.monthly_payment || "",
    dueDate: initializeDueDate(initialData?.dueDate || initialData?.due_date),
    loanType: initialData?.loanType || initialData?.loan_type || "personal",
    description: initialData?.description || "",
    businessProfileId: initialData?.businessProfileId || initialData?.business_profile_id || ""
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('🔵 [LOAN-FORM] Initializing with data:', initialData);
      setFormData({
        name: initialData.loanName || initialData.loan_name || initialData.name || "",
        amount: initialData.originalAmount || initialData.original_amount || initialData.currentBalance || initialData.current_balance || initialData.amount || "",
        interestRate: initialData.interestRate || initialData.interest_rate || "",
        termLength: initialData.termLength || initialData.term_length || "",
        monthlyPayment: initialData.monthlyPayment || initialData.monthly_payment || "",
        dueDate: initializeDueDate(initialData.dueDate || initialData.due_date),
        loanType: initialData.loanType || initialData.loan_type || "personal",
        description: initialData.description || "",
        businessProfileId: initialData.businessProfileId || initialData.business_profile_id || ""
      });
    }
  }, [initialData]);

  // Fetch business profiles for business loans
  const { data: businessProfiles } = useQuery({
    queryKey: ["business-profiles"],
    queryFn: async () => {
      const token = await getToken();
      return apiRequest("/business-profiles", {}, token);
    },
    enabled: formData.loanType === "business"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loanMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loan-name">Loan Name</Label>
          <Input
            id="loan-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Car Loan, Mortgage"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-amount">Loan Amount</Label>
          <Input
            id="loan-amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="Enter loan amount"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="interest-rate">Interest Rate (%)</Label>
          <Input
            id="interest-rate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
            placeholder="e.g., 5.5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term-length">Term Length (months)</Label>
          <Input
            id="term-length"
            type="number"
            value={formData.termLength}
            onChange={(e) => setFormData(prev => ({ ...prev, termLength: e.target.value }))}
            placeholder="e.g., 60"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthly-payment">Monthly Payment</Label>
          <Input
            id="monthly-payment"
            type="number"
            step="0.01"
            value={formData.monthlyPayment}
            onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayment: e.target.value }))}
            placeholder="e.g., 250.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due-date">Next Payment Due Date *</Label>
          <Input
            id="due-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground">
            Required for loan to appear in upcoming payments
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-type">Loan Type</Label>
          <Select
            value={formData.loanType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.loanType === "business" && (
        <div className="space-y-2">
          <Label htmlFor="business-profile">Business Profile</Label>
          <Select
            value={formData.businessProfileId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, businessProfileId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business profile" />
            </SelectTrigger>
            <SelectContent>
              {businessProfiles?.data?.map((profile: any) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Additional notes about this loan"
          className="min-h-[80px]"
        />
      </div>

      <Button type="submit" disabled={loanMutation.isPending} className="w-full">
        {loanMutation.isPending ? "Processing..." : isEditing ? "Update Loan" : "Add Loan"}
      </Button>
    </form>
  );
};
