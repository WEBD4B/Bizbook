import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Home,
  CreditCard as CreditCardIcon,
  Building2,
  Building,
  FileText,
  DollarSign,
  TrendingUp,
  Target,
  PieChart,
  BarChart3,
  Receipt,
  Wallet,
  Download,
  Plus,
  Trash2
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { LoanForm } from "@/components/loan-form";
import { BusinessExpenseForm } from "@/components/business-expense-form";

import { UpcomingPayments } from "@/components/upcoming-payments";
import { UpcomingIncomes } from "@/components/upcoming-incomes";
import { IncomeOverview } from "@/components/income-overview";
import { FinancialOverviewChart } from "@/components/financial-overview-chart";
import { PaymentDialog } from "@/components/payment-dialog";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseOverview } from "@/components/expense-overview";
import { NetWorthSummary } from "@/components/net-worth-summary";
import { SavingsGoals } from "@/components/savings-goals";
import { BudgetTracker } from "@/components/budget-tracker";
import { InvestmentTracker } from "@/components/investment-tracker";
import { ComprehensiveNetWorth } from "@/components/comprehensive-net-worth";
import type { CreditCard, Loan, MonthlyPayment, Income, BusinessCreditCard, BusinessLoan, BusinessExpense, BusinessRevenue } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { 
  formatCurrency, 
  calculateCreditUtilization
} from "@/lib/financial-calculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";


export default function ComprehensiveDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  const [businessProfileDialogOpen, setBusinessProfileDialogOpen] = useState(false);
  const [purchaseOrderDialogOpen, setPurchaseOrderDialogOpen] = useState(false);
  const [businessSettingsOpen, setBusinessSettingsOpen] = useState(false);

  const { data: creditCards = [], isLoading: creditCardsLoading } = useQuery<CreditCard[]>({
    queryKey: ["/api/credit-cards"],
  });

  const { data: loans = [], isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const { data: monthlyPayments = [], isLoading: monthlyPaymentsLoading } = useQuery<MonthlyPayment[]>({
    queryKey: ["/api/monthly-payments"],
  });

  const { data: incomes = [], isLoading: incomesLoading } = useQuery<Income[]>({
    queryKey: ["/api/income"],
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<any[]>({
    queryKey: ["/api/assets"],
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<any[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: businessProfiles = [], isLoading: businessProfilesLoading } = useQuery<any[]>({
    queryKey: ["/api/business-profiles"],
  });

  const { data: purchaseOrders = [], isLoading: purchaseOrdersLoading } = useQuery<any[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const { data: businessRevenue = [], isLoading: businessRevenueLoading } = useQuery<any[]>({
    queryKey: ["/api/business-revenue"],
  });

  const { data: businessExpenses = [], isLoading: businessExpensesLoading } = useQuery<any[]>({
    queryKey: ["/api/business-expenses"],
  });

  // Business credit cards and loans (separate from personal)
  const { data: businessCreditCards = [], isLoading: businessCreditCardsLoading } = useQuery<any[]>({
    queryKey: ["/api/business-credit-cards"],
  });

  const { data: businessLoans = [], isLoading: businessLoansLoading } = useQuery<any[]>({
    queryKey: ["/api/business-loans"],
  });

  // Vendor management
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery<any[]>({
    queryKey: ["/api/vendors"],
  });

  const isLoading = creditCardsLoading || loansLoading || monthlyPaymentsLoading || incomesLoading || assetsLoading || expensesLoading;

  // Business form components
  const BusinessRevenueForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      amount: '',
      description: '',
      source: '',
      category: '',
      customCategory: '',
      revenueType: '',
      frequency: '',
      date: new Date().toISOString().split('T')[0]
    });

    const revenueMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/business-revenue", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Business revenue added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/business-revenue"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add business revenue",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      revenueMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="revenue-amount">Amount</Label>
          <Input
            id="revenue-amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="revenue-description">Description</Label>
          <Input
            id="revenue-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="revenue-source">Source</Label>
          <Input
            id="revenue-source"
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            placeholder="e.g., Client payment, Product sales"
          />
        </div>
        <div>
          <Label htmlFor="revenue-type">Revenue Type</Label>
          <Select value={formData.revenueType} onValueChange={(value) => setFormData(prev => ({ ...prev, revenueType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select revenue type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="one-time">One-Time Payment</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.revenueType === 'subscription' && (
          <div>
            <Label htmlFor="revenue-frequency">Billing Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="revenue-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="services">Services</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
              <SelectItem value="saas">SaaS/Software</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.category === 'other' && (
          <div>
            <Label htmlFor="custom-revenue-category">Custom Category</Label>
            <Input
              id="custom-revenue-category"
              value={formData.customCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="revenue-date">Date</Label>
          <Input
            id="revenue-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={revenueMutation.isPending}>
            {revenueMutation.isPending ? "Adding..." : "Add Revenue"}
          </Button>
        </div>
      </form>
    );
  };

  const BusinessExpenseForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      amount: '',
      description: '',
      vendor: '',
      category: '',
      customCategory: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });

    const expenseMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/business-expenses", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Business expense added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/business-expenses"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add business expense",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      expenseMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="expense-amount">Amount</Label>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="expense-description">Description</Label>
          <Input
            id="expense-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="expense-vendor">Vendor</Label>
          <Input
            id="expense-vendor"
            value={formData.vendor}
            onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
            placeholder="e.g., Office supply store, Software company"
          />
        </div>
        <div>
          <Label htmlFor="expense-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="office-supplies">Office Supplies</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="meals">Meals & Entertainment</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.category === 'other' && (
          <div>
            <Label htmlFor="custom-expense-category">Custom Category</Label>
            <Input
              id="custom-expense-category"
              value={formData.customCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
              placeholder="Enter custom category"
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="expense-date">Date</Label>
          <Input
            id="expense-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="expense-notes">Notes</Label>
          <Textarea
            id="expense-notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes (optional)"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={expenseMutation.isPending}>
            {expenseMutation.isPending ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </form>
    );
  };

  // Business Profile Form
  const BusinessProfileForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      businessName: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      fax: '',
      email: '',
      logoUrl: ''
    });

    const profileMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/business-profiles", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Business profile created successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/business-profiles"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create business profile",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      profileMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              value={formData.businessName}
              onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-email">Email</Label>
            <Input
              id="business-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="business-address">Address</Label>
          <Input
            id="business-address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="business-city">City</Label>
            <Input
              id="business-city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-state">State</Label>
            <Input
              id="business-state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-zip">ZIP Code</Label>
            <Input
              id="business-zip"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-phone">Phone</Label>
            <Input
              id="business-phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="business-fax">Fax</Label>
            <Input
              id="business-fax"
              value={formData.fax}
              onChange={(e) => setFormData(prev => ({ ...prev, fax: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={profileMutation.isPending}>
            {profileMutation.isPending ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </form>
    );
  };

  // Purchase Order Form 
  const PurchaseOrderForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      businessProfileId: '',
      poNumber: `PO-${Date.now()}`,
      vendorName: '',
      vendorAddress: '',
      vendorPhone: '',
      shipToName: '',
      shipToAddress: '',
      shipToPhone: '',
      requisitioner: '',
      shipVia: '',
      fobPoint: '',
      shippingTerms: '',
      specialInstructions: '',
      items: [{ itemNumber: '', description: '', quantity: '', unitPrice: '', total: '' }]
    });

    const orderMutation = useMutation({
      mutationFn: async (data: any) => {
        const { items, ...orderData } = data;
        const subtotal = items.reduce((sum: number, item: any) => sum + parseFloat(item.total || '0'), 0);
        const salesTax = subtotal * 0.08; // 8% tax
        const totalDue = subtotal + salesTax;

        const orderResponse = await apiRequest("POST", "/api/purchase-orders", {
          ...orderData,
          subtotal: subtotal.toString(),
          salesTax: salesTax.toString(),
          shippingHandling: "0",
          totalDue: totalDue.toString()
        });
        const order = await orderResponse.json();

        // Create order items
        for (const item of items) {
          if (item.description) {
            await apiRequest("POST", "/api/purchase-order-items", {
              purchaseOrderId: order.id,
              ...item
            });
          }
        }

        // Automatically create business expense for the purchase order
        await apiRequest("POST", "/api/business-expenses", {
          amount: totalDue.toString(),
          description: `Purchase Order ${orderData.poNumber} - ${orderData.vendorName}`,
          vendor: orderData.vendorName,
          category: "Purchase Orders",
          expenseType: "operational",
          date: new Date().toISOString().split('T')[0],
          notes: `Auto-generated from PO ${orderData.poNumber}`,
          purchaseOrderId: order.id
        });

        return order;
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Purchase order created and added to business expenses"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/purchase-orders"] });
        queryClient.invalidateQueries({ queryKey: ["/api/business-expenses"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create purchase order",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.businessProfileId) {
        toast({
          title: "Error",
          description: "Please select a business profile first",
          variant: "destructive"
        });
        return;
      }
      orderMutation.mutate(formData);
    };

    const addItem = () => {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { itemNumber: '', description: '', quantity: '', unitPrice: '', total: '' }]
      }));
    };

    const updateItem = (index: number, field: string, value: string) => {
      const newItems = [...formData.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = parseFloat(newItems[index].quantity || '0');
        const unitPrice = parseFloat(newItems[index].unitPrice || '0');
        newItems[index].total = (quantity * unitPrice).toFixed(2);
      }
      
      setFormData(prev => ({ ...prev, items: newItems }));
    };

    const removeItem = (index: number) => {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-profile">Business Profile</Label>
            <Select value={formData.businessProfileId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessProfileId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select business profile" />
              </SelectTrigger>
              <SelectContent>
                {businessProfiles.map((profile: any) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="po-number">PO Number</Label>
            <Input
              id="po-number"
              value={formData.poNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, poNumber: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vendor Information</h3>
          <div>
            <Label htmlFor="vendor-name">Vendor Name</Label>
            <Input
              id="vendor-name"
              value={formData.vendorName}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="vendor-address">Vendor Address</Label>
            <Textarea
              id="vendor-address"
              value={formData.vendorAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="vendor-phone">Vendor Phone</Label>
            <Input
              id="vendor-phone"
              value={formData.vendorPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ship To Information</h3>
          <div>
            <Label htmlFor="ship-to-name">Ship To Name</Label>
            <Input
              id="ship-to-name"
              value={formData.shipToName}
              onChange={(e) => setFormData(prev => ({ ...prev, shipToName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ship-to-address">Ship To Address</Label>
            <Textarea
              id="ship-to-address"
              value={formData.shipToAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, shipToAddress: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="requisitioner">Requisitioner</Label>
            <Input
              id="requisitioner"
              value={formData.requisitioner}
              onChange={(e) => setFormData(prev => ({ ...prev, requisitioner: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="ship-via">Ship Via</Label>
            <Input
              id="ship-via"
              value={formData.shipVia}
              onChange={(e) => setFormData(prev => ({ ...prev, shipVia: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items</h3>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 items-end">
              <div>
                <Label>Item #</Label>
                <Input
                  value={item.itemNumber}
                  onChange={(e) => updateItem(index, 'itemNumber', e.target.value)}
                  placeholder="Item number"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description"
                />
              </div>
              <div>
                <Label>Qty</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  placeholder="Quantity"
                />
              </div>
              <div>
                <Label>Unit Price</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={item.total}
                  readOnly
                  placeholder="Total"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="special-instructions">Special Instructions</Label>
          <Textarea
            id="special-instructions"
            value={formData.specialInstructions}
            onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
            placeholder="Any special instructions or notes"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={orderMutation.isPending}>
            {orderMutation.isPending ? "Creating..." : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    );
  };

  // Tax form components
  const TaxDocumentForm = () => {
    const [formData, setFormData] = useState({
      taxYear: new Date().getFullYear().toString(),
      documentType: '1099-NEC',
      recipientName: '',
      recipientTin: '',
      recipientAddress: '',
      totalPayments: ''
    });

    const taxDocMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/tax-documents", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Tax document generated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tax-documents"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate tax document",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      taxDocMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="tax-year">Tax Year</Label>
          <Select value={formData.taxYear} onValueChange={(value) => setFormData(prev => ({ ...prev, taxYear: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={formData.documentType} onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1099-NEC">1099-NEC</SelectItem>
              <SelectItem value="1099-MISC">1099-MISC</SelectItem>
              <SelectItem value="Schedule C">Schedule C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="recipient-name">Recipient Name</Label>
          <Input
            id="recipient-name"
            value={formData.recipientName}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="recipient-tin">Tax ID Number</Label>
          <Input
            id="recipient-tin"
            value={formData.recipientTin}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientTin: e.target.value }))}
            placeholder="XXX-XX-XXXX or XX-XXXXXXX"
            required
          />
        </div>
        <div>
          <Label htmlFor="recipient-address">Address</Label>
          <Textarea
            id="recipient-address"
            value={formData.recipientAddress}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
            placeholder="Full address including zip code"
            required
          />
        </div>
        <div>
          <Label htmlFor="total-payments">Total Payments</Label>
          <Input
            id="total-payments"
            type="number"
            step="0.01"
            value={formData.totalPayments}
            onChange={(e) => setFormData(prev => ({ ...prev, totalPayments: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={taxDocMutation.isPending}>
            {taxDocMutation.isPending ? "Generating..." : "Generate Document"}
          </Button>
        </div>
      </form>
    );
  };

  const SalesTaxForm = () => {
    const [formData, setFormData] = useState({
      state: '',
      taxRate: '',
      locality: '',
      localTaxRate: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      nexusType: 'physical'
    });

    const salesTaxMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/sales-tax-settings", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Sales tax setting added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sales-tax-settings"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add sales tax setting",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      salesTaxMutation.mutate(formData);
    };

    const states = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Select value={formData.state} onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tax-rate">State Tax Rate (%)</Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.001"
            value={formData.taxRate}
            onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
            placeholder="e.g., 6.25"
            required
          />
        </div>
        <div>
          <Label htmlFor="locality">City/County (Optional)</Label>
          <Input
            id="locality"
            value={formData.locality}
            onChange={(e) => setFormData(prev => ({ ...prev, locality: e.target.value }))}
            placeholder="e.g., Los Angeles"
          />
        </div>
        <div>
          <Label htmlFor="local-tax-rate">Local Tax Rate (%) - Optional</Label>
          <Input
            id="local-tax-rate"
            type="number"
            step="0.001"
            value={formData.localTaxRate}
            onChange={(e) => setFormData(prev => ({ ...prev, localTaxRate: e.target.value }))}
            placeholder="e.g., 1.5"
          />
        </div>
        <div>
          <Label htmlFor="nexus-type">Nexus Type</Label>
          <Select value={formData.nexusType} onValueChange={(value) => setFormData(prev => ({ ...prev, nexusType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Physical Presence</SelectItem>
              <SelectItem value="economic">Economic Nexus</SelectItem>
              <SelectItem value="click-through">Click-through Nexus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="effective-date">Effective Date</Label>
          <Input
            id="effective-date"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={salesTaxMutation.isPending}>
            {salesTaxMutation.isPending ? "Adding..." : "Add Tax Setting"}
          </Button>
        </div>
      </form>
    );
  };

  // Business settings form components
  const BusinessInfoForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      businessName: '',
      businessType: '',
      taxId: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    });

    const businessInfoMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/business-info", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Business information updated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/business-info"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update business information",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      businessInfoMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="business-type">Business Type</Label>
          <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sole-proprietorship">Sole Proprietorship</SelectItem>
              <SelectItem value="llc">LLC</SelectItem>
              <SelectItem value="corporation">Corporation</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="s-corp">S-Corp</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tax-id">Tax ID / EIN</Label>
          <Input
            id="tax-id"
            value={formData.taxId}
            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
            placeholder="XX-XXXXXXX"
          />
        </div>
        <div>
          <Label htmlFor="address">Business Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Full business address"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="business@example.com"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://example.com"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={businessInfoMutation.isPending}>
            {businessInfoMutation.isPending ? "Saving..." : "Save Information"}
          </Button>
        </div>
      </form>
    );
  };

  const PaymentMethodForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      type: 'bank-account',
      accountName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      accountType: 'checking'
    });

    const paymentMethodMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/payment-methods", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment method added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/payment-methods"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add payment method",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      paymentMethodMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="payment-type">Payment Method Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank-account">Bank Account</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.type === 'bank-account' && (
          <>
            <div>
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                value={formData.accountName}
                onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="routing-number">Routing Number</Label>
              <Input
                id="routing-number"
                value={formData.routingNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="account-type">Account Type</Label>
              <Select value={formData.accountType} onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={paymentMethodMutation.isPending}>
            {paymentMethodMutation.isPending ? "Adding..." : "Add Payment Method"}
          </Button>
        </div>
      </form>
    );
  };

  // Additional tax form components
  const SalesTaxReturnForm = () => {
    const [formData, setFormData] = useState({
      quarter: 'Q1',
      year: new Date().getFullYear().toString(),
      grossSales: '',
      taxableAmount: '',
      taxRate: '',
      taxDue: '',
      previousBalance: '',
      penalties: '',
      interest: ''
    });

    const salesTaxReturnMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/sales-tax-returns", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Sales tax return generated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/sales-tax-returns"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate sales tax return",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      salesTaxReturnMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quarter">Quarter</Label>
            <Select value={formData.quarter} onValueChange={(value) => setFormData(prev => ({ ...prev, quarter: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="gross-sales">Gross Sales</Label>
          <Input
            id="gross-sales"
            type="number"
            step="0.01"
            value={formData.grossSales}
            onChange={(e) => setFormData(prev => ({ ...prev, grossSales: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="taxable-amount">Taxable Amount</Label>
          <Input
            id="taxable-amount"
            type="number"
            step="0.01"
            value={formData.taxableAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, taxableAmount: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={salesTaxReturnMutation.isPending}>
            {salesTaxReturnMutation.isPending ? "Generating..." : "Generate Return"}
          </Button>
        </div>
      </form>
    );
  };

  const ExpenseReportForm = () => {
    const [formData, setFormData] = useState({
      reportType: 'quarterly',
      startDate: '',
      endDate: '',
      categories: [] as string[],
      includeTaxDeductible: true,
      groupByCategory: true
    });

    const expenseReportMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/expense-reports", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Expense report generated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/expense-reports"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate expense report",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      expenseReportMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={formData.reportType} onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.reportType === 'custom' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={expenseReportMutation.isPending}>
            {expenseReportMutation.isPending ? "Generating..." : "Generate Report"}
          </Button>
        </div>
      </form>
    );
  };

  const ScheduleCForm = () => {
    const [formData, setFormData] = useState({
      businessName: '',
      businessCode: '',
      grossReceipts: '',
      totalExpenses: '',
      netProfit: '',
      employeeNumber: '0',
      accountingMethod: 'cash'
    });

    const scheduleCMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/schedule-c", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Schedule C form generated successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/schedule-c"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to generate Schedule C form",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      scheduleCMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="business-code">Business Code</Label>
          <Input
            id="business-code"
            value={formData.businessCode}
            onChange={(e) => setFormData(prev => ({ ...prev, businessCode: e.target.value }))}
            placeholder="6-digit NAICS code"
          />
        </div>
        <div>
          <Label htmlFor="gross-receipts">Gross Receipts</Label>
          <Input
            id="gross-receipts"
            type="number"
            step="0.01"
            value={formData.grossReceipts}
            onChange={(e) => setFormData(prev => ({ ...prev, grossReceipts: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="total-expenses">Total Expenses</Label>
          <Input
            id="total-expenses"
            type="number"
            step="0.01"
            value={formData.totalExpenses}
            onChange={(e) => setFormData(prev => ({ ...prev, totalExpenses: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="accounting-method">Accounting Method</Label>
          <Select value={formData.accountingMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, accountingMethod: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="accrual">Accrual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={scheduleCMutation.isPending}>
            {scheduleCMutation.isPending ? "Generating..." : "Generate Schedule C"}
          </Button>
        </div>
      </form>
    );
  };

  const ShopifyIntegrationForm = () => {
    const [activeTab, setActiveTab] = useState<'api' | 'csv'>('csv');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
      storeName: '',
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      syncFrequency: 'daily'
    });

    const shopifyMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/shopify-integration", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Shopify store connected successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/shopify-integration"] });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to connect Shopify store",
          variant: "destructive"
        });
      }
    });

    const csvImportMutation = useMutation({
      mutationFn: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/shopify-csv-import', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
      },
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: `Imported ${data.count} orders successfully`
        });
        queryClient.invalidateQueries({ queryKey: ["/api/shopify-orders"] });
        setCsvFile(null);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to import CSV file",
          variant: "destructive"
        });
      }
    });

    const downloadTemplate = () => {
      const csvContent = `Order ID,Customer Name,Customer Email,Order Date,Order Total,Sales Tax Amount,Tax Rate,State,City,Shipping Address,Product Names,Payment Status
#1001,John Smith,john.smith@email.com,2024-08-01,125.50,10.04,8.0%,CA,Los Angeles,"123 Main St Los Angeles CA 90210","Premium Widget, Standard Widget",paid
#1002,Sarah Johnson,sarah.j@email.com,2024-08-01,89.99,7.20,8.0%,CA,San Francisco,"456 Oak Ave San Francisco CA 94102",Deluxe Service Package,paid
#1003,Mike Brown,mike.brown@email.com,2024-08-02,45.00,0.00,0.0%,OR,Portland,"789 Pine St Portland OR 97201",Digital Download,paid`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shopify_orders_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    };

    const handleApiSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      shopifyMutation.mutate(formData);
    };

    const handleCsvSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (csvFile) {
        csvImportMutation.mutate(csvFile);
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'text/csv') {
        setCsvFile(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please select a CSV file",
          variant: "destructive"
        });
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'csv' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('csv')}
          >
            CSV Import
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'api' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('api')}
          >
            API Connection
          </button>
        </div>

        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">CSV Import Instructions</h4>
              <p className="text-sm text-blue-800 mb-3">
                Import your Shopify orders using our CSV template. The file should include customer info, order details, and sales tax data.
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={downloadTemplate}
                className="bg-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>

            <form onSubmit={handleCsvSubmit} className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  required
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-1">
                    Selected: {csvFile.name}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                <strong>Required columns:</strong> Order ID, Customer Name, Customer Email, Order Date, Order Total, Sales Tax Amount, Tax Rate, State, City
              </div>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={!csvFile || csvImportMutation.isPending}>
                  {csvImportMutation.isPending ? "Importing..." : "Import Orders"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'api' && (
          <form onSubmit={handleApiSubmit} className="space-y-4">
            <div>
              <Label htmlFor="store-name">Store Name</Label>
              <Input
                id="store-name"
                value={formData.storeName}
                onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                placeholder="your-store.myshopify.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="api-secret">API Secret</Label>
              <Input
                id="api-secret"
                type="password"
                value={formData.apiSecret}
                onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="access-token">Access Token</Label>
              <Input
                id="access-token"
                type="password"
                value={formData.accessToken}
                onChange={(e) => setFormData(prev => ({ ...prev, accessToken: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
              <Select value={formData.syncFrequency} onValueChange={(value) => setFormData(prev => ({ ...prev, syncFrequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" disabled={shopifyMutation.isPending}>
                {shopifyMutation.isPending ? "Connecting..." : "Connect Store"}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // Credit card and loan form components
  const CreditCardForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      balance: '',
      creditLimit: '',
      interestRate: '',
      minimumPayment: '',
      dueDate: 30
    });

    const createCreditCardMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/credit-cards", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Credit card added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add credit card",
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
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Chase Sapphire"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
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
              value={formData.creditLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="interest-rate">Interest Rate (%)</Label>
            <Input
              id="interest-rate"
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="min-payment">Minimum Payment</Label>
            <Input
              id="min-payment"
              type="number"
              step="0.01"
              value={formData.minimumPayment}
              onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createCreditCardMutation.isPending}>
            {createCreditCardMutation.isPending ? "Adding..." : "Add Card"}
          </Button>
        </div>
      </form>
    );
  };

  const LoanForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      balance: '',
      interestRate: '',
      monthlyPayment: '',
      termMonths: '',
      originalAmount: '',
      loanType: 'personal',
      dueDate: 30
    });

    const createLoanMutation = useMutation({
      mutationFn: async (data: any) => {
        return apiRequest("POST", "/api/loans", data);
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Loan added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
        onClose();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add loan",
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createLoanMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="loan-name">Loan Name</Label>
          <Input
            id="loan-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Auto Loan, Mortgage"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loan-balance">Current Balance</Label>
            <Input
              id="loan-balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="original-amount">Original Amount</Label>
            <Input
              id="original-amount"
              type="number"
              step="0.01"
              value={formData.originalAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, originalAmount: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loan-interest-rate">Interest Rate (%)</Label>
            <Input
              id="loan-interest-rate"
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="monthly-payment">Monthly Payment</Label>
            <Input
              id="monthly-payment"
              type="number"
              step="0.01"
              value={formData.monthlyPayment}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayment: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="term-months">Term (Months)</Label>
            <Input
              id="term-months"
              type="number"
              value={formData.termMonths}
              onChange={(e) => setFormData(prev => ({ ...prev, termMonths: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="loan-type">Loan Type</Label>
            <Select value={formData.loanType} onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Loan</SelectItem>
                <SelectItem value="auto">Auto Loan</SelectItem>
                <SelectItem value="mortgage">Mortgage</SelectItem>
                <SelectItem value="student">Student Loan</SelectItem>
                <SelectItem value="business">Business Loan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createLoanMutation.isPending}>
            {createLoanMutation.isPending ? "Adding..." : "Add Loan"}
          </Button>
        </div>
      </form>
    );
  };

  // Delete functions
  const deleteCreditCard = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/credit-cards/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Credit card deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/credit-cards"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete credit card",
        variant: "destructive"
      });
    }
  });

  const deleteLoan = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/loans/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Loan deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete loan",
        variant: "destructive"
      });
    }
  });

  // Calculate overview metrics
  const totalDebt = [...creditCards, ...loans].reduce(
    (sum, account) => sum + parseFloat(account.balance || "0"),
    0
  );

  const totalMonthlyPayments = [
    ...creditCards.map((card: CreditCard) => parseFloat(card.minimumPayment || "0")),
    ...loans.map((loan: Loan) => parseFloat(loan.monthlyPayment || "0"))
  ].reduce((sum, payment) => sum + payment, 0);

  const creditUtilization = calculateCreditUtilization(creditCards);

  // Calculate monthly income
  const calculateMonthlyIncome = (incomes: Income[]) => {
    return incomes.reduce((total, income) => {
      const amount = parseFloat(income.amount || "0");
      switch (income.frequency) {
        case "weekly": return total + (amount * 4.33);
        case "biweekly": return total + (amount * 2.17);
        case "monthly": return total + amount;
        case "annually": return total + (amount / 12);
        default: return total + amount;
      }
    }, 0);
  };

  const totalMonthlyIncome = calculateMonthlyIncome(incomes);

  // Calculate available cash and credit metrics
  const availableCash = assets
    .filter((asset: any) => ['cash', 'checking', 'savings'].includes(asset.category?.toLowerCase() || ''))
    .reduce((sum: number, asset: any) => sum + parseFloat(asset.value || asset.currentValue || "0"), 0);

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit || "0"), 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || "0"), 0);
  const availableCredit = totalCreditLimit - totalCreditUsed;
  const totalLiquidity = availableCash + availableCredit;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Personal Finance Center</h1>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2" data-testid="tab-personal">
                <Home className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2" data-testid="tab-business">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-8">
              {/* Full Width Visual Chart at Top */}
              <FinancialOverviewChart 
                creditCards={creditCards} 
                loans={loans} 
                incomes={incomes} 
                assets={assets} 
                expenses={expenses} 
              />

              {/* Net Worth Summary - Full Width */}
              <NetWorthSummary />

              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card data-testid="card-total-debt">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Debt</CardTitle>
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600" data-testid="text-total-debt">
                      {formatCurrency(totalDebt)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Credit cards and loans
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-monthly-payments">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Payments</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="text-monthly-payments">
                      {formatCurrency(totalMonthlyPayments)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All recurring payments
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-monthly-income">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-monthly-income">
                      {formatCurrency(totalMonthlyIncome)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {incomes.length} income source{incomes.length !== 1 ? 's' : ''}
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-available-cash">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Cash</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600" data-testid="text-available-cash">
                      {formatCurrency(availableCash)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Liquid assets
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-available-credit">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
                    <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-available-credit">
                      {formatCurrency(availableCredit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {creditUtilization.toFixed(1)}% utilization
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Total Liquidity Card - Full Width */}
              <Card data-testid="card-total-liquidity">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">Total Liquidity (Available Cash + Credit)</CardTitle>
                  <Target className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600" data-testid="text-total-liquidity">
                    {formatCurrency(totalLiquidity)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Cash: {formatCurrency(availableCash)}</span>
                    <span>•</span>
                    <span>Credit: {formatCurrency(availableCredit)}</span>
                    <span>•</span>
                    <span>Total buying power available</span>
                  </div>
                </CardContent>
              </Card>

              {/* Full Width Sections */}
              <div className="space-y-6">
                <IncomeOverview />
                <ExpenseOverview />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <UpcomingPayments />
                <UpcomingIncomes />
              </div>

              {/* Credit Management Section */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Credit Cards Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Credit Cards
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-credit-card">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Credit Card</DialogTitle>
                        </DialogHeader>
                        <CreditCardForm onClose={() => {}} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {creditCards.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <CreditCardIcon size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No credit cards added yet</p>
                        <p className="text-sm">Add your credit cards to track balances and payments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {creditCards.map((card: any) => (
                          <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{card.name}</h3>
                                <Badge variant="outline">
                                  {Math.round((parseFloat(card.balance) / parseFloat(card.creditLimit)) * 100)}% Used
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(card.balance))}</span></div>
                                <div>Limit: <span className="font-medium">{formatCurrency(parseFloat(card.creditLimit))}</span></div>
                                <div>Rate: {card.interestRate}% APR</div>
                                <div>Due: {new Date(Date.now() + card.dueDate * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(card);
                                  setSelectedAccountType('credit-card');
                                  setPaymentDialogOpen(true);
                                }}
                                data-testid={`button-pay-${card.id}`}
                              >
                                Pay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteCreditCard.mutate(card.id)}
                                data-testid={`button-delete-${card.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Loans Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Loans
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-loan">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Loan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Loan</DialogTitle>
                        </DialogHeader>
                        <LoanForm onClose={() => {}} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {loans.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No loans added yet</p>
                        <p className="text-sm">Add your loans to track balances and payments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {loans.map((loan: any) => (
                          <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{loan.name}</h3>
                                <Badge variant="outline">{loan.interestRate}% Rate</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(loan.balance))}</span></div>
                                <div>Monthly Payment: <span className="font-medium">{formatCurrency(parseFloat(loan.monthlyPayment))}</span></div>
                                <div>Term: {loan.termMonths} months</div>
                                <div>Due: {new Date(Date.now() + loan.dueDate * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(loan);
                                  setSelectedAccountType('loan');
                                  setPaymentDialogOpen(true);
                                }}
                                data-testid={`button-pay-loan-${loan.id}`}
                              >
                                Pay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteLoan.mutate(loan.id)}
                                data-testid={`button-delete-loan-${loan.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Credit Summary Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Credit Card Debt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(creditCards.reduce((sum, card) => sum + parseFloat(card.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Credit Limit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(creditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Credit Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {creditCards.length > 0 
                        ? Math.round(creditCards.reduce((sum, card) => 
                            sum + ((parseFloat(card.balance) / parseFloat(card.creditLimit)) * 100), 0
                          ) / creditCards.length)
                        : 0}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Loan Debt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(loans.reduce((sum, loan) => sum + parseFloat(loan.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6 mt-8">
              {/* Business Cost vs Revenue Analysis Chart - moved to top */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Business Cost vs Revenue Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        {
                          month: 'Current',
                          revenue: businessRevenue.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
                          expenses: businessExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0),
                          netProfit: businessRevenue.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) - 
                                    businessExpenses.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0)
                        }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, '']} />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        <Bar dataKey="netProfit" fill="#3b82f6" name="Net Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* Business Revenue Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Business Revenue
                    </CardTitle>
                    <Dialog open={revenueDialogOpen} onOpenChange={setRevenueDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-revenue">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Revenue
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Business Revenue</DialogTitle>
                        </DialogHeader>
                        <BusinessRevenueForm onClose={() => setRevenueDialogOpen(false)} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {businessRevenue.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <DollarSign size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No business revenue added yet</p>
                        <p className="text-sm">Track your business income and subscriptions</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {businessRevenue.map((revenue: any) => (
                          <div key={revenue.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{revenue.description}</h3>
                                <Badge variant="outline">{revenue.category}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Amount: <span className="font-medium text-green-600">{formatCurrency(parseFloat(revenue.amount))}</span></div>
                                <div>Source: <span className="font-medium">{revenue.source}</span></div>
                                <div>Date: {new Date(revenue.date).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-edit-revenue-${revenue.id}`}
                              >
                                Edit
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                data-testid={`button-delete-revenue-${revenue.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Loans Section */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Loans
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-loan">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Loan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Loan</DialogTitle>
                        </DialogHeader>
                        <LoanForm onClose={() => {}} />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {loans.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No loans added yet</p>
                        <p className="text-sm">Add your loans to track balances and payments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {loans.map((loan: any) => (
                          <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{loan.name}</h3>
                                <Badge variant="outline">{loan.interestRate}% Rate</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(loan.balance))}</span></div>
                                <div>Monthly Payment: <span className="font-medium">{formatCurrency(parseFloat(loan.monthlyPayment))}</span></div>
                                <div>Term: {loan.termMonths} months</div>
                                <div>Due: {new Date(Date.now() + loan.dueDate * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAccount(loan);
                                  setSelectedAccountType('loan');
                                  setPaymentDialogOpen(true);
                                }}
                                data-testid={`button-pay-loan-${loan.id}`}
                              >
                                Pay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => deleteLoan.mutate(loan.id)}
                                data-testid={`button-delete-loan-${loan.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Credit Card Debt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(creditCards.reduce((sum, card) => sum + parseFloat(card.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Loan Debt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(loans.reduce((sum, loan) => sum + parseFloat(loan.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(availableCredit)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {creditUtilization.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Credit Cards and Loans Section */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Business Credit Cards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCardIcon className="h-5 w-5" />
                      Business Credit Cards
                    </CardTitle>
                    <Button size="sm" data-testid="button-add-business-credit-card">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Card
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {businessCreditCards.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <CreditCardIcon size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No business credit cards added yet</p>
                        <p className="text-sm">Track your business credit cards separately from personal ones</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {businessCreditCards.map((card: any) => (
                          <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{card.name}</h3>
                                <Badge variant="outline">{card.interestRate}% APR</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(card.balance))}</span></div>
                                <div>Credit Limit: <span className="font-medium">{formatCurrency(parseFloat(card.creditLimit))}</span></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Business Loans */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Business Loans
                    </CardTitle>
                    <Button size="sm" data-testid="button-add-business-loan">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Loan
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {businessLoans.length === 0 ? (
                      <div className="text-center py-8 text-neutral-500">
                        <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                        <p className="mb-4">No business loans added yet</p>
                        <p className="text-sm">Track SBA loans, equipment financing, and business lines of credit</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {businessLoans.map((loan: any) => (
                          <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{loan.name}</h3>
                                <Badge variant="outline">{loan.interestRate}% APR</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(loan.balance))}</span></div>
                                <div>Monthly Payment: <span className="font-medium">{formatCurrency(parseFloat(loan.monthlyPayment || 0))}</span></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Vendor Management Section - Coming Soon */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Vendor Management
                  </CardTitle>
                  <Button size="sm" variant="outline" disabled>
                    Coming Soon
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-neutral-500">
                    <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                    <p className="mb-4">Vendor Management</p>
                    <p className="text-sm">Add vendors to create purchase orders and track business relationships</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>




          </Tabs>

          <PaymentDialog 
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            account={selectedAccount}
            accountType={selectedAccountType}
          />
        </div>
      </main>
    </div>
  );
}


