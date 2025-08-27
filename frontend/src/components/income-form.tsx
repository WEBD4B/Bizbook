import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";

interface IncomeFormProps {
  onClose: () => void;
  initialData?: any;
}

export function IncomeForm({ onClose, initialData }: IncomeFormProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    source: initialData?.source || "",
    amount: initialData?.amount || "",
    frequency: initialData?.frequency || "monthly",
    incomeType: initialData?.incomeType || initialData?.type || "salary", // Use incomeType instead of type
    nextPayDate: initialData?.nextPayDate || new Date().toISOString().split('T')[0], // Default to today
    isActive: initialData?.isActive ?? true,
  });

  const createIncome = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating income from income-form with data:', data);
      const token = await getToken();
      const result = await apiRequest("/income", {
        method: "POST",
        body: JSON.stringify(data),
      }, token);
      console.log('Income creation result:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal income source added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["income"] });
      onClose();
    },
    onError: (error) => {
      console.error('Income creation error:', error);
      toast({
        title: "Error",
        description: "Failed to add income source",
        variant: "destructive",
      });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async (data: any) => {
      const token = await getToken();
      return apiRequest(`/income/${initialData.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Personal income source updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["income"] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update income source",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = initialData ? updateIncome : createIncome;
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="source">Income Source</Label>
        <Input
          id="source"
          placeholder="e.g., Main Job, Freelance, Side Business"
          value={formData.source}
          onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
          required
          data-testid="input-income-source"
        />
      </div>

      <div>
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="e.g., 5000.00"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
          data-testid="input-income-amount"
        />
      </div>

      <div>
        <Label htmlFor="frequency">Payment Frequency</Label>
        <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
          <SelectTrigger data-testid="select-income-frequency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annually">Annually</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="nextPayDate">Next Payment Date</Label>
        <Input
          id="nextPayDate"
          type="date"
          value={formData.nextPayDate}
          onChange={(e) => setFormData(prev => ({ ...prev, nextPayDate: e.target.value }))}
          required
          data-testid="input-income-payment-date"
        />
      </div>

      <div>
        <Label htmlFor="incomeType">Income Type</Label>
        <Select value={formData.incomeType} onValueChange={(value) => setFormData(prev => ({ ...prev, incomeType: value }))}>
          <SelectTrigger data-testid="select-income-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="salary">Salary</SelectItem>
            <SelectItem value="wages">Hourly Wages</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
            <SelectItem value="contract">Contract Work</SelectItem>
            <SelectItem value="commission">Commission</SelectItem>
            <SelectItem value="bonus">Bonus</SelectItem>
            <SelectItem value="investment">Investment Income</SelectItem>
            <SelectItem value="rental">Rental Income</SelectItem>
            <SelectItem value="pension">Pension</SelectItem>
            <SelectItem value="social_security">Social Security</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createIncome.isPending || updateIncome.isPending}
          data-testid="button-submit-income"
        >
          {(createIncome.isPending || updateIncome.isPending) 
            ? "Saving..." 
            : initialData ? "Update Income" : "Add Income"
          }
        </Button>
      </div>
    </form>
  );
}