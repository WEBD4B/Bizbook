import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@clerk/clerk-react";

interface CreditCardFormProps {
  onClose: () => void;
  initialData?: any;
}

export function CreditCardForm({ onClose, initialData }: CreditCardFormProps) {
  const { toast } = useToast();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.cardName || '',
    balance: initialData?.balance || '',
    creditLimit: initialData?.creditLimit || '',
    interestRate: initialData?.interestRate || '',
    minimumPayment: initialData?.minimumPayment || '',
    paymentDate: initialData?.paymentDate || '',
    dueDate: initialData?.dueDate || 30
  });

  const createCreditCardMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔵 [CREDIT-CARD-FORM] Starting credit card creation...');
      console.log('🔵 [CREDIT-CARD-FORM] Form data:', data);
      
      const token = await getToken();
      
      const requestPayload = {
        cardName: data.name, // Map 'name' to 'cardName' for backend
        balance: data.balance,
        creditLimit: data.creditLimit,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        paymentDate: data.paymentDate,
        dueDate: new Date(Date.now() + data.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Convert days to proper date format (YYYY-MM-DD)
      };
      
      console.log('🔵 [CREDIT-CARD-FORM] Mapped payload:', requestPayload);
      
      const result = await apiRequest("/credit-cards", {
        method: 'POST',
        body: JSON.stringify(requestPayload)
      }, token);
      
      console.log('🔵 [CREDIT-CARD-FORM] API request successful:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('🟢 [CREDIT-CARD-FORM] Credit card created successfully:', result);
      toast({
        title: "Success",
        description: "Credit card added successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ [CREDIT-CARD-FORM] Credit card creation failed:', error);
      toast({
        title: "Error",
        description: `Failed to add credit card: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCreditCardMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="card-name">Card Name</Label>
        <Input
          id="card-name"
          type="text"
          placeholder="e.g., Chase Sapphire"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="current-balance">Current Balance</Label>
        <Input
          id="current-balance"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.balance}
          onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="credit-limit">Credit Limit</Label>
        <Input
          id="credit-limit"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.creditLimit}
          onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="interest-rate">Interest Rate (%)</Label>
        <Input
          id="interest-rate"
          type="number"
          step="0.01"
          placeholder="18.99"
          value={formData.interestRate}
          onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="minimum-payment">Minimum Payment</Label>
        <Input
          id="minimum-payment"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.minimumPayment}
          onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="payment-date">Payment Date</Label>
        <Input
          id="payment-date"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createCreditCardMutation.isPending}>
          {createCreditCardMutation.isPending ? "Adding..." : "Add Credit Card"}
        </Button>
      </div>
    </form>
  );
}
