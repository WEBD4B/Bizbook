import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";
import { useAuthenticatedQuery } from "@/hooks/useAuthenticatedApi";

interface LoanFormProps {
  onClose: () => void;
  type?: 'personal' | 'business';
  initialData?: any;
}

export function LoanForm({ onClose, type = 'personal', initialData }: LoanFormProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    loanName: initialData?.loanName || "",
    currentBalance: initialData?.currentBalance || "",
    originalAmount: initialData?.originalAmount || "",
    interestRate: initialData?.interestRate || "",
    monthlyPayment: initialData?.monthlyPayment || "",
    termLength: initialData?.termLength || "",
    loanType: initialData?.loanType || (type === 'business' ? 'business' : 'personal'),
    customLoanType: initialData?.customLoanType || "",
    dueDate: initialData?.dueDate || 30,
    ...(type === 'business' && { businessProfileId: initialData?.businessProfileId || '' })
  });

  // Fetch business profiles for business loans
  const { data: businessProfiles = [] } = useAuthenticatedQuery(
    ["business-profiles"],
    async (token) => {
      const response = await apiRequest("/business-profiles", {}, token);
      return response.data || [];
    },
    { enabled: type === 'business' }
  );

  const createLoan = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating loan with data:', data);
      const token = await getToken();
      
      const requestPayload = {
        loanName: data.loanName,
        currentBalance: data.currentBalance,
        originalAmount: data.originalAmount,
        interestRate: data.interestRate,
        monthlyPayment: data.monthlyPayment,
        termLength: parseInt(data.termLength),
        loanType: data.loanType === 'other' ? data.customLoanType : data.loanType,
        dueDate: new Date(Date.now() + data.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ...(type === 'business' && { businessProfileId: data.businessProfileId })
      };
      
      const endpoint = type === 'business' ? "/business-loans" : "/loans";
      const result = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(requestPayload),
      }, token);
      console.log('Loan creation result:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan added successfully",
      });
      const queryKey = type === 'business' ? ["business-loans"] : ["loans"];
      queryClient.invalidateQueries({ queryKey });
      onClose();
    },
    onError: (error) => {
      console.error('Loan creation error:', error);
      toast({
        title: "Error",
        description: `Failed to add loan: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate business profile selection for business loans
    if (type === 'business' && !formData.businessProfileId) {
      toast({
        title: "Error",
        description: "Please select a business profile first",
        variant: "destructive"
      });
      return;
    }
    
    // Validate custom loan type when "Other" is selected
    if (formData.loanType === 'other' && !formData.customLoanType.trim()) {
      toast({
        title: "Error",
        description: "Please enter a custom loan type",
        variant: "destructive"
      });
      return;
    }
    
    createLoan.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="loanName">Loan Name</Label>
          <Input
            id="loanName"
            name="loanName"
            value={formData.loanName}
            onChange={handleChange}
            placeholder="e.g., Home Mortgage"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="loanType">Loan Type</Label>
          <Select 
            value={formData.loanType} 
            onValueChange={(value) => setFormData({ ...formData, loanType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto Loan</SelectItem>
              <SelectItem value="home">Home Loan</SelectItem>
              <SelectItem value="personal">Personal Loan</SelectItem>
              <SelectItem value="student">Student Loan</SelectItem>
              <SelectItem value="business">Business Loan</SelectItem>
              <SelectItem value="credit-line">Credit Line</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {formData.loanType === 'other' && (
        <div>
          <Label htmlFor="customLoanType">Custom Loan Type</Label>
          <Input
            id="customLoanType"
            name="customLoanType"
            type="text"
            value={formData.customLoanType}
            onChange={handleChange}
            placeholder="Enter custom loan type"
            required
          />
        </div>
      )}

      {type === 'business' && (
        <div>
          <Label htmlFor="businessProfileId">Business Profile</Label>
          <Select 
            value={formData.businessProfileId} 
            onValueChange={(value) => setFormData({ ...formData, businessProfileId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business profile" />
            </SelectTrigger>
            <SelectContent>
              {businessProfiles?.map((profile: any) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currentBalance">Current Balance</Label>
          <Input
            id="currentBalance"
            name="currentBalance"
            type="number"
            value={formData.currentBalance}
            onChange={handleChange}
            placeholder="Enter current balance"
            required
          />
        </div>

        <div>
          <Label htmlFor="originalAmount">Original Amount</Label>
          <Input
            id="originalAmount"
            name="originalAmount"
            type="number"
            value={formData.originalAmount}
            onChange={handleChange}
            placeholder="Enter original loan amount"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            name="interestRate"
            type="number"
            step="0.01"
            value={formData.interestRate}
            onChange={handleChange}
            placeholder="Enter interest rate"
            required
          />
        </div>

        <div>
          <Label htmlFor="monthlyPayment">Monthly Payment</Label>
          <Input
            id="monthlyPayment"
            name="monthlyPayment"
            type="number"
            step="0.01"
            value={formData.monthlyPayment}
            onChange={handleChange}
            placeholder="Enter monthly payment amount"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="termLength">Term (months)</Label>
          <Input
            id="termLength"
            name="termLength"
            type="number"
            value={formData.termLength}
            onChange={handleChange}
            placeholder="Enter loan term in months"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="dueDate">Days Until Due</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="number"
          value={formData.dueDate}
          onChange={handleChange}
          placeholder="Enter days until next payment due"
          required
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createLoan.isPending}>
          {createLoan.isPending ? "Adding..." : "Add Loan"}
        </Button>
      </div>
    </form>
  );
}
