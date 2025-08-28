import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedQuery, useAuthenticatedMutation, useApiRequest } from "@/hooks/useAuthenticatedApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { 
  useCreditCards, 
  useLoans, 
  useMonthlyPayments, 
  useIncome, 
  useAssets, 
  useExpenses,
  useBusinessProfiles,
  useCreateBusinessProfile,
  usePurchaseOrders,
  useBusinessRevenue,
  useBusinessExpenses,
  useBusinessCreditCards,
  useBusinessLoans,
  useVendors,
  useCreateCreditCard,
  useCreateLoan,
  useDeleteCreditCard,
  useDeleteLoan,
  useDeleteIncome,
  useDeleteVendor,
  useCreateBusinessRevenue,
  useCreateBusinessExpense
} from "@/hooks/useApi";
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
  Trash2,
  Eye,
  CalendarDays
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { LoanForm } from "@/components/loan-form";
import { BusinessExpenseForm } from "@/components/business-expense-form";
import { IncomeForm } from "@/components/income-form";
import { VendorForm } from "@/components/vendor-form";
import { PurchaseOrderForm } from "@/components/purchase-order-form";
import { PurchaseOrderList } from "@/components/purchase-order-list";
import { VendorSearch } from "@/components/vendor-search";
import { useAuth, useUser } from "@clerk/clerk-react";

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
import { apiRequest } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";


export default function ComprehensiveDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>("");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [revenueDialogOpen, setRevenueDialogOpen] = useState(false);
  
  const [businessProfileDialogOpen, setBusinessProfileDialogOpen] = useState(false);
  const [purchaseOrderDialogOpen, setPurchaseOrderDialogOpen] = useState(false);
  const [businessSettingsOpen, setBusinessSettingsOpen] = useState(false);

  // Use authenticated API hooks
  const { data: creditCards = [], isLoading: creditCardsLoading } = useAuthenticatedQuery(
    ["credit-cards"],
    async (token) => {
      const response = await apiRequest("/credit-cards", {}, token);
      return response.data || [];
    }
  );
  
  const { data: loans = [], isLoading: loansLoading } = useAuthenticatedQuery(
    ["loans"],
    async (token) => {
      const response = await apiRequest("/loans", {}, token);
      return response.data || [];
    }
  );
  
  const { data: monthlyPayments = [], isLoading: monthlyPaymentsLoading } = useAuthenticatedQuery(
    ["monthly-payments"],
    async (token) => {
      const response = await apiRequest("/monthly-payments", {}, token);
      return response.data || [];
    }
  );
  
  const { data: incomes = [], isLoading: incomesLoading } = useAuthenticatedQuery(
    ["income"],
    async (token) => {
      const response = await apiRequest("/income", {}, token);
      return response.data || [];
    }
  );
  
  const { data: assets = [], isLoading: assetsLoading } = useAuthenticatedQuery(
    ["assets"],
    async (token) => {
      const response = await apiRequest("/assets", {}, token);
      return response.data || [];
    }
  );
  
  const { data: expenses = [], isLoading: expensesLoading } = useAuthenticatedQuery(
    ["expenses"],
    async (token) => {
      const response = await apiRequest("/expenses", {}, token);
      return response.data || [];
    }
  );
  
  const { data: businessProfiles = [], isLoading: businessProfilesLoading } = useBusinessProfiles();
  
  const { data: purchaseOrders = [], isLoading: purchaseOrdersLoading } = useAuthenticatedQuery(
    ["purchase-orders"],
    async (token) => {
      const response = await apiRequest("/purchase-orders", {}, token);
      return response.data || [];
    }
  );
  const { data: businessRevenue = [], isLoading: businessRevenueLoading } = useAuthenticatedQuery(
    ["business-revenue"],
    async (token) => {
      const response = await apiRequest("/business-revenue", {}, token);
      return response.data || [];
    }
  );
  
  const { data: businessExpenses = [], isLoading: businessExpensesLoading } = useAuthenticatedQuery(
    ["business-expenses"],
    async (token) => {
      const response = await apiRequest("/business-expenses", {}, token);
      return response.data || [];
    }
  );
  
  const { data: businessCreditCards = [], isLoading: businessCreditCardsLoading } = useAuthenticatedQuery(
    ["business-credit-cards"],
    async (token) => {
      const response = await apiRequest("/business-credit-cards", {}, token);
      return response.data || [];
    }
  );
  
  const { data: businessLoans = [], isLoading: businessLoansLoading } = useAuthenticatedQuery(
    ["business-loans"],
    async (token) => {
      const response = await apiRequest("/business-loans", {}, token);
      return response.data || [];
    }
  );
  
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();

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

    const revenueMutation = useAuthenticatedMutation(
      async (data: any, token: string | null) => {
        const response = await apiRequest("/business-revenue", {
          method: "POST",
          body: JSON.stringify(data)
        }, token);
        return response.data;
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Business revenue added successfully"
          });
          queryClient.invalidateQueries({ queryKey: ["business-revenue"] });
          onClose();
        },
        onError: (error: any) => {
          console.error('🔴 [BUSINESS REVENUE] Error:', error);
          toast({
            title: "Error",
            description: `Failed to add business revenue: ${error.message}`,
            variant: "destructive"
          });
        }
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Map frontend fields to backend schema requirements
      const mappedData = {
        amount: formData.amount,
        description: formData.description,
        source: formData.source,
        category: formData.category === 'other' ? formData.customCategory : formData.category,
        revenueDate: formData.date, // Map 'date' to 'revenueDate' for backend
        frequency: formData.frequency,
        isRecurring: formData.revenueType === 'subscription', // Map revenueType to isRecurring
        // businessProfileId is now optional, so we can omit it
      };
      
      console.log('🟢 [BUSINESS REVENUE] Submitting:', mappedData);
      
      revenueMutation.mutate(mappedData);
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

    const expenseMutation = useAuthenticatedMutation(
      async (data: any, token: string | null) => {
        const response = await apiRequest("/business-expenses", {
          method: "POST",
          body: JSON.stringify(data)
        }, token);
        return response.data;
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Business expense added successfully"
          });
          queryClient.invalidateQueries({ queryKey: ["business-expenses"] });
          onClose();
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to add business expense",
            variant: "destructive"
          });
        }
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Map frontend fields to backend schema requirements
      const mappedData = {
        amount: formData.amount,
        description: formData.description,
        vendor: formData.vendor,
        category: formData.category === 'other' ? formData.customCategory : formData.category,
        expenseDate: formData.date, // Map 'date' to 'expenseDate' for backend
        notes: formData.notes,
        // businessProfileId is now optional, so we can omit it
      };
      
      expenseMutation.mutate(mappedData);
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

    const profileMutation = useCreateBusinessProfile();

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      profileMutation.mutate(formData, {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Business profile created successfully"
          });
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
      vendorId: '',
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

        const token = await getToken();
        const orderResponse = await apiRequest("/purchase-orders", {
          method: "POST",
          body: JSON.stringify({
            ...orderData,
            subtotal: subtotal.toString(),
            salesTax: salesTax.toString(),
            shippingHandling: "0",
            totalDue: totalDue.toString()
          })
        }, token);
        const order = orderResponse.data;

        // Create order items
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.description) {
            await apiRequest("/purchase-order-items", {
              method: "POST",
              body: JSON.stringify({
                purchaseOrderId: order.id,
                lineNumber: i + 1, // Convert array index to 1-based line number
                description: item.description,
                quantity: item.quantity || '0',
                unitPrice: item.unitPrice || '0',
                totalPrice: item.total || '0', // Map 'total' to 'totalPrice'
                partNumber: item.itemNumber || '', // Map 'itemNumber' to 'partNumber'
                unitOfMeasure: 'each' // Default value
              })
            }, token);
          }
        }

        // Automatically create business expense for the purchase order
        await apiRequest("/business-expenses", {
          method: "POST",
          body: JSON.stringify({
            amount: totalDue.toString(),
            description: `Purchase Order ${orderData.poNumber} - ${orderData.vendorName}`,
            vendor: orderData.vendorName,
            category: "Purchase Orders",
            expenseType: "operational",
            date: new Date().toISOString().split('T')[0],
            notes: `Auto-generated from PO ${orderData.poNumber}`,
            purchaseOrderId: order.id
          })
        }, token);

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
      if (!formData.vendorId) {
        toast({
          title: "Error",
          description: "Please select a vendor first",
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
            <Label htmlFor="vendor-select">Select Vendor</Label>
            <Select 
              value={formData.vendorId} 
              onValueChange={(value) => {
                const selectedVendor = vendors.find(v => v.id === value);
                if (selectedVendor) {
                  setFormData(prev => ({ 
                    ...prev, 
                    vendorId: value,
                    vendorName: selectedVendor.companyName,
                    vendorAddress: selectedVendor.address || '',
                    vendorPhone: selectedVendor.phone || ''
                  }));
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={vendors.length === 0 ? "No vendors available" : "Select a vendor"} />
              </SelectTrigger>
              <SelectContent>
                {vendors.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No vendors available. Please add a vendor first.
                  </SelectItem>
                ) : (
                  vendors.map((vendor: any) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.companyName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {vendors.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                You need to add vendors before creating purchase orders. Go to the Office tab to add vendors.
              </p>
            )}
          </div>
          {formData.vendorId && (
            <>
              <div>
                <Label>Vendor Address (auto-filled)</Label>
                <Textarea
                  value={formData.vendorAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorAddress: e.target.value }))}
                  placeholder="Vendor address will be auto-filled when you select a vendor"
                />
              </div>
              <div>
                <Label>Vendor Phone (auto-filled)</Label>
                <Input
                  value={formData.vendorPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendorPhone: e.target.value }))}
                  placeholder="Vendor phone will be auto-filled when you select a vendor"
                />
              </div>
            </>
          )}
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
      paymentDate: '',
      dueDate: 30
    });

    const createCreditCardMutation = useMutation({
      mutationFn: async (data: any) => {
        console.log('🔵 [DASHBOARD] Starting credit card creation from dashboard...');
        console.log('🔵 [DASHBOARD] Form data:', data);
        
        console.log('🔵 [DASHBOARD] Getting Clerk token...');
        const token = await getToken();
        console.log('🔵 [DASHBOARD] Token received:', token ? 'Yes' : 'No');
        
        const requestPayload = {
          cardName: data.name, // Map 'name' to 'cardName' for backend
          balance: data.balance,
          creditLimit: data.creditLimit,
          interestRate: data.interestRate,
          minimumPayment: data.minimumPayment,
          paymentDate: data.paymentDate,
          dueDate: new Date(Date.now() + data.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Convert days to proper date format (YYYY-MM-DD)
        };
        
        console.log('🔵 [DASHBOARD] Mapped payload:', requestPayload);
        console.log('🔵 [DASHBOARD] Making API request...');
        
        const result = await apiRequest("/credit-cards", {
          method: 'POST',
          body: JSON.stringify(requestPayload)
        }, token);
        
        console.log('🔵 [DASHBOARD] API request successful:', result);
        return result;
      },
      onSuccess: (result) => {
        console.log('🟢 [DASHBOARD] Credit card created successfully:', result);
        toast({
          title: "Success",
          description: "Credit card added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
        onClose();
      },
      onError: (error: any) => {
        console.error('🔴 [DASHBOARD] Credit card creation failed:', error);
        console.error('🔴 [DASHBOARD] Error message:', error.message);
        toast({
          title: "Error",
          description: `Failed to add credit card: ${error.message}`,
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('🚀 [DASHBOARD] Form submitted with data:', formData);
      console.log('🚀 [DASHBOARD] Triggering credit card mutation...');
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
        <div>
          <Label htmlFor="payment-date">Payment Date</Label>
          <Input
            id="payment-date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            required
          />
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

  const BusinessCreditCardForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: '',
      balance: '',
      creditLimit: '',
      interestRate: '',
      minimumPayment: '',
      paymentDate: '',
      dueDate: 30,
      businessProfileId: ''
    });

    const createBusinessCreditCardMutation = useMutation({
      mutationFn: async (data: any) => {
        console.log('🔵 [DASHBOARD] Starting business credit card creation from dashboard...');
        console.log('🔵 [DASHBOARD] Form data:', data);
        
        console.log('🔵 [DASHBOARD] Getting Clerk token...');
        const token = await getToken();
        console.log('🔵 [DASHBOARD] Token received:', token ? 'Yes' : 'No');
        
        const requestPayload = {
          cardName: data.name, // Map 'name' to 'cardName' for backend
          balance: data.balance,
          creditLimit: data.creditLimit,
          interestRate: data.interestRate,
          minimumPayment: data.minimumPayment,
          paymentDate: data.paymentDate,
          dueDate: new Date(Date.now() + data.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Convert days to proper date format (YYYY-MM-DD)
          businessProfileId: data.businessProfileId
        };
        
        console.log('🔵 [DASHBOARD] Mapped payload:', requestPayload);
        console.log('🔵 [DASHBOARD] Making API request...');
        
        const result = await apiRequest("/business-credit-cards", {
          method: 'POST',
          body: JSON.stringify(requestPayload)
        }, token);
        
        console.log('🔵 [DASHBOARD] API request successful:', result);
        return result;
      },
      onSuccess: (result) => {
        console.log('🟢 [DASHBOARD] Business credit card created successfully:', result);
        toast({
          title: "Success",
          description: "Business credit card added successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["business-credit-cards"] });
        onClose();
      },
      onError: (error: any) => {
        console.error('🔴 [DASHBOARD] Business credit card creation failed:', error);
        console.error('🔴 [DASHBOARD] Error message:', error.message);
        toast({
          title: "Error",
          description: `Failed to add business credit card: ${error.message}`,
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('🚀 [DASHBOARD] Business credit card form submitted with data:', formData);
      console.log('🚀 [DASHBOARD] Triggering business credit card mutation...');
      createBusinessCreditCardMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="business-card-name">Card Name</Label>
          <Input
            id="business-card-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Chase Business Ink"
            required
          />
        </div>
        <div>
          <Label htmlFor="business-profile">Business Profile</Label>
          <Select 
            value={formData.businessProfileId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, businessProfileId: value }))}
          >
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="business-balance">Current Balance</Label>
            <Input
              id="business-balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-credit-limit">Credit Limit</Label>
            <Input
              id="business-credit-limit"
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
            <Label htmlFor="business-interest-rate">Interest Rate (%)</Label>
            <Input
              id="business-interest-rate"
              type="number"
              step="0.01"
              value={formData.interestRate}
              onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="business-min-payment">Minimum Payment</Label>
            <Input
              id="business-min-payment"
              type="number"
              step="0.01"
              value={formData.minimumPayment}
              onChange={(e) => setFormData(prev => ({ ...prev, minimumPayment: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="business-payment-date">Payment Date</Label>
          <Input
            id="business-payment-date"
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={createBusinessCreditCardMutation.isPending}>
            {createBusinessCreditCardMutation.isPending ? "Adding..." : "Add Card"}
          </Button>
        </div>
      </form>
    );
  };

  const LoanForm = ({ onClose, type = 'personal' }: { onClose: () => void; type?: 'personal' | 'business' }) => {
    const [formData, setFormData] = useState({
      name: '',
      balance: '',
      interestRate: '',
      monthlyPayment: '',
      termMonths: '',
      originalAmount: '',
      loanType: type === 'business' ? 'business' : 'personal',
      customLoanType: '',
      dueDate: 30,
      ...(type === 'business' && { businessProfileId: '' })
    });

    const createLoanMutation = useMutation({
      mutationFn: async (data: any) => {
        console.log('🔵 [DASHBOARD] Starting loan creation from dashboard...');
        console.log('🔵 [DASHBOARD] Form data:', data);
        
        console.log('🔵 [DASHBOARD] Getting Clerk token...');
        const token = await getToken();
        console.log('🔵 [DASHBOARD] Token received:', token ? 'Yes' : 'No');
        
        const requestPayload = {
          loanName: data.name, // Map 'name' to 'loanName' for backend
          currentBalance: data.balance, // Backend expects 'currentBalance' not 'balance'
          interestRate: data.interestRate,
          monthlyPayment: data.monthlyPayment,
          originalAmount: data.originalAmount,
          loanType: data.loanType === 'other' ? data.customLoanType : data.loanType,
          termLength: parseInt(data.termMonths), // Backend expects 'termLength' as number, not 'termMonths' as string
          dueDate: new Date(Date.now() + data.dueDate * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Convert days to proper date format (YYYY-MM-DD)
          ...(type === 'business' && { businessProfileId: data.businessProfileId })
        };
        
        console.log('🔵 [DASHBOARD] Mapped payload:', requestPayload);
        console.log('🔵 [DASHBOARD] Making API request...');
        
        const endpoint = type === 'business' ? "/business-loans" : "/loans";
        console.log('🔵 [DASHBOARD] Using endpoint:', endpoint);
        
        const result = await apiRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(requestPayload)
        }, token);
        
        console.log('🔵 [DASHBOARD] API request successful:', result);
        return result;
      },
      onSuccess: (result) => {
        console.log('🟢 [DASHBOARD] Loan created successfully:', result);
        toast({
          title: "Success",
          description: "Loan added successfully"
        });
        const queryKey = type === 'business' ? ["business-loans"] : ["loans"];
        queryClient.invalidateQueries({ queryKey });
        onClose();
      },
      onError: (error: any) => {
        console.error('🔴 [DASHBOARD] Loan creation failed:', error);
        console.error('🔴 [DASHBOARD] Error message:', error.message);
        toast({
          title: "Error",
          description: `Failed to add loan: ${error.message}`,
          variant: "destructive"
        });
      }
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('🚀 [DASHBOARD] Loan form submitted with data:', formData);
      
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
      
      console.log('🚀 [DASHBOARD] Triggering loan mutation...');
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
        {type === 'business' && (
          <div>
            <Label htmlFor="business-profile">Business Profile</Label>
            <Select value={formData.businessProfileId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessProfileId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder={businessProfiles.length === 0 ? "No business profiles available" : "Select business profile"} />
              </SelectTrigger>
              <SelectContent>
                {businessProfiles.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No business profiles found
                  </div>
                ) : (
                  businessProfiles.map((profile: any) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.businessName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {businessProfiles.length === 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  You need to create a business profile first before adding business loans.
                </p>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setBusinessProfileDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Business Profile
                </Button>
              </div>
            )}
          </div>
        )}
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
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formData.loanType === 'other' && (
              <div className="mt-2">
                <Label htmlFor="custom-loan-type">Custom Loan Type</Label>
                <Input
                  id="custom-loan-type"
                  value={formData.customLoanType}
                  onChange={(e) => setFormData(prev => ({ ...prev, customLoanType: e.target.value }))}
                  placeholder="e.g., Equipment Loan, Vacation Loan"
                  required
                />
              </div>
            )}
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
      const token = await getToken();
      return apiRequest(`/credit-cards/${id}`, { method: "DELETE" }, token);
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
      const token = await getToken();
      return apiRequest(`/loans/${id}`, { method: "DELETE" }, token);
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

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiRequest(`/income/${id}`, { method: "DELETE" }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete income",
        variant: "destructive"
      });
    }
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiRequest(`/vendors/${id}`, { method: "DELETE" }, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete vendor",
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
  const businessCreditUtilization = calculateCreditUtilization(businessCreditCards);

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

  // Calculate total income and expenses for available cash calculation
  const totalIncome = incomes.reduce((sum, income) => sum + parseFloat(income.amount || "0"), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);
  
  // Calculate available cash and credit metrics
  // Available Cash = Total Income - Total Expenses (real-time cash flow)
  const availableCash = Math.max(0, totalIncome - totalExpenses); // Prevent negative cash
  
  // Alternative: Include cash assets as starting balance
  // const cashAssets = assets
  //   .filter((asset: any) => ['cash', 'checking', 'savings'].includes(asset.category?.toLowerCase() || ''))
  //   .reduce((sum: number, asset: any) => sum + parseFloat(asset.value || asset.currentValue || "0"), 0);
  // const availableCash = Math.max(0, cashAssets + totalIncome - totalExpenses);

  const totalCreditLimit = creditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit || "0"), 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || "0"), 0);
  const availableCredit = totalCreditLimit - totalCreditUsed;
  const totalLiquidity = availableCash + availableCredit;

  // Add user authentication check
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        <p className="ml-4">Loading user data...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p>Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Personal Finance Center</h1>
              {user && (
                <p className="text-lg text-gray-600 mt-1">
                  Welcome back, {user.firstName || user.fullName?.split(' ')[0] || 'User'}! 👋
                </p>
              )}
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:w-fit mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2" data-testid="tab-personal">
                <Home className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2" data-testid="tab-business">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="office" className="flex items-center gap-2" data-testid="tab-office">
                <Building className="h-4 w-4" />
                Office
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
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Total Income:</span>
                        <span className="text-green-600">+{formatCurrency(totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
                      </div>
                      <div className="text-xs pt-1 border-t">Income - Expenses</div>
                    </div>
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
                      {formatCurrency(totalDebt)}
                    </div>
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

              {/* Upcoming Payments and Income - Full Width Accordions */}
              <div className="space-y-4">
                <Accordion type="multiple" defaultValue={["payments", "income"]} className="space-y-4">
                  <AccordionItem value="payments" className="border rounded-lg bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <CreditCardIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Payments</h3>
                            <p className="text-sm text-gray-500">Track and manage your upcoming financial obligations</p>
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <div className="text-xl font-bold text-red-600">$2,000.00</div>
                          <div className="text-sm text-gray-500">5 payments due</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <UpcomingPayments />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="income" className="border rounded-lg bg-white shadow-sm">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming Income</h3>
                            <p className="text-sm text-gray-500">Monitor your expected income and cash flow</p>
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <div className="text-xl font-bold text-green-600">$52,000.00</div>
                          <div className="text-sm text-gray-500">2 income sources</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <UpcomingIncomes />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                                <div>Due: {new Date(card.dueDate).toLocaleDateString()}</div>
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
                                <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(loan.currentBalance))}</span></div>
                                <div>Monthly Payment: <span className="font-medium">{formatCurrency(parseFloat(loan.monthlyPayment))}</span></div>
                                <div>Term: {loan.termLength} months</div>
                                <div>Due: {new Date(loan.dueDate).toLocaleDateString()}</div>
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

              {/* Personal Income Management Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Personal Income Management ({incomes.length})
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-income">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Income
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Personal Income</DialogTitle>
                        <DialogDescription>
                          Add salary, wages, freelance payments, or other personal income sources
                        </DialogDescription>
                      </DialogHeader>
                      <IncomeForm onClose={() => {}} />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {incomes.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <DollarSign size={48} className="mx-auto mb-4 text-neutral-300" />
                      <p className="mb-4">No personal income sources added yet</p>
                      <p className="text-sm">Add your salary, freelance payments, and other personal income</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {incomes.map((income: any) => (
                        <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{income.source}</h3>
                              <Badge variant={income.frequency === 'monthly' ? 'default' : 'secondary'}>
                                {income.frequency}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Amount: <span className="font-medium text-green-600">{formatCurrency(parseFloat(income.amount))}</span></div>
                              <div>Type: {income.type || 'Regular Income'}</div>
                              <div>Next Payment: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteIncome.mutate(income.id)}
                              data-testid={`button-delete-income-${income.id}`}
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
              </div>

              {/* Upcoming Business Payments and Revenue */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Upcoming Business Payments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5" />
                      Upcoming Business Payments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Filter upcoming business expenses and loan payments */}
                    {(() => {
                      const upcomingBusinessPayments = [
                        ...businessExpenses.filter(expense => {
                          const expenseDate = new Date(expense.dueDate || expense.date);
                          const today = new Date();
                          const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                          return expenseDate >= today && expenseDate <= thirtyDaysFromNow;
                        }).map(expense => ({
                          ...expense,
                          type: 'expense',
                          name: expense.description,
                          amount: expense.amount,
                          dueDate: expense.dueDate || expense.date
                        })),
                        ...businessLoans.filter(loan => {
                          const loanDueDate = new Date(loan.dueDate);
                          const today = new Date();
                          const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                          return loanDueDate >= today && loanDueDate <= thirtyDaysFromNow;
                        }).map(loan => ({
                          ...loan,
                          type: 'loan',
                          name: loan.loanName,
                          amount: loan.monthlyPayment,
                          dueDate: loan.dueDate
                        }))
                      ];
                      
                      return upcomingBusinessPayments.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          <CalendarDays size={48} className="mx-auto mb-4 text-neutral-300" />
                          <p className="mb-4">No upcoming business payments</p>
                          <p className="text-sm">Business expenses and loan payments will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingBusinessPayments.map((payment: any, index) => (
                            <div key={`${payment.type}-${payment.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{payment.name}</h4>
                                  <Badge variant="outline">{payment.type === 'expense' ? 'Expense' : 'Loan'}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <div>Amount: <span className="font-medium text-red-600">{formatCurrency(parseFloat(payment.amount))}</span></div>
                                  <div>Due: {new Date(payment.dueDate).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>

                {/* Upcoming Business Revenue */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Upcoming Business Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Filter upcoming business revenue */}
                    {(() => {
                      const upcomingBusinessRevenue = businessRevenue.filter(revenue => {
                        if (!revenue.expectedDate) return false;
                        const revenueDate = new Date(revenue.expectedDate);
                        const today = new Date();
                        const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                        return revenueDate >= today && revenueDate <= thirtyDaysFromNow;
                      });
                      
                      return upcomingBusinessRevenue.length === 0 ? (
                        <div className="text-center py-8 text-neutral-500">
                          <TrendingUp size={48} className="mx-auto mb-4 text-neutral-300" />
                          <p className="mb-4">No upcoming business revenue</p>
                          <p className="text-sm">Expected business income will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {upcomingBusinessRevenue.map((revenue: any) => (
                            <div key={revenue.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{revenue.description}</h4>
                                  <Badge variant="outline">{revenue.source}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <div>Amount: <span className="font-medium text-green-600">{formatCurrency(parseFloat(revenue.amount))}</span></div>
                                  <div>Expected: {new Date(revenue.expectedDate).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
                      {formatCurrency(businessCreditCards.reduce((sum, card) => sum + parseFloat(card.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Loan Debt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(businessLoans.reduce((sum, loan) => sum + parseFloat(loan.currentBalance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(businessCreditCards.reduce((sum, card) => sum + parseFloat(card.creditLimit) - parseFloat(card.balance), 0))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Credit Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {businessCreditUtilization.toFixed(1)}%
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" data-testid="button-add-business-credit-card">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Business Credit Card</DialogTitle>
                          <DialogDescription>
                            Add a new business credit card to track balances and payments.
                          </DialogDescription>
                        </DialogHeader>
                        <BusinessCreditCardForm onClose={() => {}} />
                      </DialogContent>
                    </Dialog>
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
            </TabsContent>

            <TabsContent value="office" className="space-y-6 mt-8">
              {/* All Purchase Orders Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    All Purchase Orders ({purchaseOrders.length})
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-view-all-pos">
                        <Eye className="h-4 w-4 mr-2" />
                        View All POs
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>All Purchase Orders</DialogTitle>
                        <DialogDescription>
                          View and manage all purchase orders across all vendors
                        </DialogDescription>
                      </DialogHeader>
                      <PurchaseOrderList />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Search Vendors & Purchase Orders */}
                  <VendorSearch />

                  {purchaseOrders.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <Receipt size={48} className="mx-auto mb-4 text-neutral-300" />
                      <p className="mb-4">No purchase orders created yet</p>
                      <p className="text-sm">Create purchase orders from vendor management section</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Recent purchase orders summary:
                      </div>
                      {purchaseOrders.slice(0, 3).map((po: any) => (
                        <div key={po.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{po.poNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              {po.vendorName} • {po.items?.length || 0} items
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={po.status === 'pending' ? 'secondary' : po.status === 'approved' ? 'default' : 'outline'}>
                              {po.status || 'Pending'}
                            </Badge>
                            <div className="text-sm font-medium mt-1">
                              ${parseFloat(po.totalAmount || '0').toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {purchaseOrders.length > 3 && (
                        <div className="text-center pt-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View {purchaseOrders.length - 3} more purchase orders
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh]">
                              <DialogHeader>
                                <DialogTitle>All Purchase Orders</DialogTitle>
                              </DialogHeader>
                              <PurchaseOrderList />
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vendor Management Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Vendor Management ({vendors.length})
                  </CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-vendor">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Vendor</DialogTitle>
                        <DialogDescription>
                          Add a new vendor to create purchase orders and manage business relationships
                        </DialogDescription>
                      </DialogHeader>
                      <VendorForm onClose={() => {}} />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {vendors.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      <Building2 size={48} className="mx-auto mb-4 text-neutral-300" />
                      <p className="mb-4">No vendors added yet</p>
                      <p className="text-sm">Add vendors to create purchase orders and track business relationships</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {vendors.map((vendor: any) => (
                        <div key={vendor.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{vendor.companyName}</h3>
                            <Badge variant="outline">{vendor.vendorType || 'General'}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1 mb-3">
                            <div>{vendor.contactPerson}</div>
                            <div>{vendor.email}</div>
                            <div>{vendor.phone}</div>
                            <div>Terms: {vendor.paymentTerms}</div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1">
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Create PO
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Create Purchase Order</DialogTitle>
                                  <DialogDescription>
                                    Create a new purchase order for {vendor.companyName}
                                  </DialogDescription>
                                </DialogHeader>
                                <PurchaseOrderForm 
                                  selectedVendorId={vendor.id}
                                  onClose={() => {}} 
                                />
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1" data-testid={`button-view-pos-${vendor.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View All POs
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-6xl max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>Purchase Orders for {vendor.companyName}</DialogTitle>
                                  <DialogDescription>
                                    View and manage all purchase orders for this vendor
                                  </DialogDescription>
                                </DialogHeader>
                                <PurchaseOrderList 
                                  vendorId={vendor.id}
                                  vendorName={vendor.companyName}
                                />
                              </DialogContent>
                            </Dialog>
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteVendor.mutate(vendor.id)}
                              data-testid={`button-delete-vendor-${vendor.id}`}
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
            </TabsContent>




          </Tabs>

          <PaymentDialog 
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
            account={selectedAccount}
            accountType={selectedAccountType}
          />

          <Dialog open={businessProfileDialogOpen} onOpenChange={setBusinessProfileDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Business Profile</DialogTitle>
              </DialogHeader>
              <BusinessProfileForm onClose={() => setBusinessProfileDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}


