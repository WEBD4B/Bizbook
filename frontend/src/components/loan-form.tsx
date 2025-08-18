import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function LoanForm() {
  const [formData, setFormData] = useState({
    loanName: "",
    loanAmount: "",
    interestRate: "",
    term: "",
    startDate: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Loan form submitted:", formData);
    // Handle form submission here
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
          
          <Button type="submit" className="w-full">
            Add Loan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
