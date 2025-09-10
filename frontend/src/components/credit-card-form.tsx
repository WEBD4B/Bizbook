import { useState, useEffect } from "react";
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
  
  console.log('🟡 [CREDIT-CARD-FORM] Component initializing with data:', initialData);
  
  // Handle dueDate conversion for initialization
  const initializeDueDateAsString = (dueDate: any): string => {
    console.log('🔍 [CREDIT-CARD-FORM] initializeDueDateAsString called with:', { dueDate, type: typeof dueDate });
    if (!dueDate) return '';
    
    if (typeof dueDate === 'string') {
      // Handle ISO strings by taking just the date part
      if (dueDate.includes('T')) {
        const result = dueDate.split('T')[0];
        console.log('🔍 [CREDIT-CARD-FORM] ISO string converted to date:', result);
        return result;
      }
      console.log('🔍 [CREDIT-CARD-FORM] Simple date string, returning as-is:', dueDate);
      return dueDate;
    }
    
    if (typeof dueDate === 'number') {
      const dateObj = new Date(dueDate);
      const result = dateObj.toISOString().split('T')[0];
      console.log('🔍 [CREDIT-CARD-FORM] Number date, converted to:', result);
      return result;
    }
    
    console.log('🔍 [CREDIT-CARD-FORM] Unknown date format, returning empty');
    return '';
  };
  
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.cardName || '',
    balance: initialData?.balance || '',
    creditLimit: initialData?.creditLimit || '',
    interestRate: initialData?.interestRate || '',
    minimumPayment: initialData?.minimumPayment || '',
    paymentDate: initializeDueDateAsString(initialData?.dueDate || initialData?.due_date)
  });

  console.log('🟡 [CREDIT-CARD-FORM] Initial form data:', formData);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('🔵 [CREDIT-CARD-FORM] Initializing with data:', initialData);
      setFormData({
        name: initialData.name || initialData.cardName || '',
        balance: initialData.balance || '',
        creditLimit: initialData.creditLimit || '',
        interestRate: initialData.interestRate || '',
        minimumPayment: initialData.minimumPayment || '',
        paymentDate: initializeDueDateAsString(initialData.dueDate || initialData.due_date)
      });
    }
  }, [initialData]);

  const isEditing = !!initialData?.id;

  const createCreditCardMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(`🔵 [CREDIT-CARD-FORM] Starting credit card ${isEditing ? 'update' : 'creation'}...`);
      console.log('🔵 [CREDIT-CARD-FORM] Form data:', data);
      console.log('🔵 [CREDIT-CARD-FORM] PaymentDate debug - type:', typeof data.paymentDate, 'value:', data.paymentDate);
      
      const token = await getToken();
      
      // Use the paymentDate directly since it's already in the correct YYYY-MM-DD format
      let dueDateValue = data.paymentDate || '';
      console.log('🔵 [CREDIT-CARD-FORM] Using payment date as due date:', dueDateValue);
      
      const requestPayload = {
        cardName: data.name, // Map 'name' to 'cardName' for backend
        balance: data.balance,
        creditLimit: data.creditLimit,
        interestRate: data.interestRate,
        minimumPayment: data.minimumPayment,
        dueDate: dueDateValue // Use the actual date from the date input
      };
      
      console.log('🔵 [CREDIT-CARD-FORM] Mapped payload:', requestPayload);
      
      const endpoint = isEditing ? `/credit-cards/${initialData.id}` : "/credit-cards";
      const method = isEditing ? 'PATCH' : 'POST';
      
      const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(requestPayload)
      }, token);
      
      console.log(`🔵 [CREDIT-CARD-FORM] API request successful:`, result);
      return result;
    },
    onSuccess: (result) => {
      console.log(`🟢 [CREDIT-CARD-FORM] Credit card ${isEditing ? 'updated' : 'created'} successfully:`, result);
      toast({
        title: "Success",
        description: `Credit card ${isEditing ? 'updated' : 'added'} successfully`
      });
      // Invalidate all relevant queries that might display credit card data
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["business-credit-cards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/calculate-net-worth"] });
      queryClient.invalidateQueries({ queryKey: ["/api/net-worth-snapshots"] });
      onClose();
    },
    onError: (error: any) => {
      console.error(`❌ [CREDIT-CARD-FORM] Credit card ${isEditing ? 'update' : 'creation'} failed:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} credit card: ${error.message}`,
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
          {createCreditCardMutation.isPending 
            ? (isEditing ? "Updating..." : "Adding...") 
            : (isEditing ? "Update Credit Card" : "Add Credit Card")}
        </Button>
      </div>
    </form>
  );
}
