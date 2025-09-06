import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";

interface LoanFormProps {
  onClose: () => void;
  initialData?: any;
}

export function LoanForm({ onClose, initialData }: LoanFormProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    loanName: initialData?.loanName || "",
    loanAmount: initialData?.loanAmount || "",
    interestRate: initialData?.interestRate || "",
    term: initialData?.term || "",
    startDate: initialData?.startDate || ""
  });

  const createLoan = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating loan with data:', data);
      const token = await getToken();
      const result = await apiRequest("/loans", {
        method: "POST",
        body: JSON.stringify(data),
      }, token);
      console.log('Loan creation result:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      onClose();
    },
    onError: (error) => {
      console.error('Loan creation error:', error);
      toast({
        title: "Error",
        description: "Failed to add loan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLoan.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Loan</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              name="loanAmount"
              type="number"
              value={formData.loanAmount}
              onChange={handleChange}
              placeholder="Enter loan amount"
              required
            />
          </div>
          
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
            <Label htmlFor="term">Term (months)</Label>
            <Input
              id="term"
              name="term"
              type="number"
              value={formData.term}
              onChange={handleChange}
              placeholder="Enter loan term in months"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={createLoan.isPending}>
            {createLoan.isPending ? "Adding..." : "Add Loan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
