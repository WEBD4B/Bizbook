import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";

interface BusinessExpenseFormProps {
  onClose: () => void;
  initialData?: any;
}

export function BusinessExpenseForm({ onClose, initialData }: BusinessExpenseFormProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    description: initialData?.description || "",
    amount: initialData?.amount || "",
    category: initialData?.category || "",
    date: initialData?.date || new Date().toISOString().split('T')[0],
    vendor: initialData?.vendor || ""
  });

  const createBusinessExpense = useMutation({
    mutationFn: async (data: any) => {
      console.log('Creating business expense with data:', data);
      const token = await getToken();
      const result = await apiRequest("/business-expenses", {
        method: "POST",
        body: JSON.stringify(data),
      }, token);
      console.log('Business expense creation result:', result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business expense added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
      onClose();
    },
    onError: (error) => {
      console.error('Business expense creation error:', error);
      toast({
        title: "Error",
        description: "Failed to add business expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBusinessExpense.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Business Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter expense description"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office-supplies">Office Supplies</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              placeholder="Enter vendor name"
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={createBusinessExpense.isPending}>
            {createBusinessExpense.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
