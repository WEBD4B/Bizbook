import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedQuery, useAuthenticatedMutation, useApiRequest } from "@/hooks/useAuthenticatedApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
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
  useCreateBusinessExpense,
  usePayments
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
  Edit,
  CalendarDays
} from "lucide-react";
import { DebtChart } from "@/components/debt-chart";
import { AccountForm } from "@/components/account-form";
import { LoanForm } from "@/components/loan-form";
import { CreditCardForm } from "@/components/credit-card-form";
import { BusinessExpenseForm } from "@/components/business-expense-form";
import { IncomeForm } from "@/components/income-form";
import { VendorForm } from "@/components/vendor-form";
import { PurchaseOrderForm } from "@/components/purchase-order-form";
import { PurchaseOrderFormComprehensive } from "@/components/purchase-order-form-comprehensive";
import { PurchaseOrderList } from "@/components/purchase-order-list";
import { VendorSearch } from "@/components/vendor-search";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useIncomes } from "@/lib/clerk-api-hooks";
import { apiRequest } from "@/lib/api";

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
import type { CreditCard, Loan, MonthlyPayment, Income, BusinessCreditCard, BusinessLoan, BusinessExpense, BusinessRevenue } from "@/types/schema";
import { Badge } from "@/components/ui/badge";
import { 
  formatCurrency, 
  calculateCreditUtilization,
  getDaysUntilDate
} from "@/lib/financial-calculations";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useEffect } from "react";


function UpcomingPaymentsSummary() {
  const { data: creditCards = [], isLoading: creditCardsLoading } = useCreditCards();
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();
  const isLoading = creditCardsLoading || loansLoading || paymentsLoading;

  // Calculate current week boundaries
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter payments due this week
  const thisWeekCreditCards = creditCards.filter(card => {
    if (!card.dueDate) return false;
    const dueDate = new Date(card.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });
  
  const thisWeekLoans = loans.filter(loan => {
    if (!loan.dueDate) return false;
    const dueDate = new Date(loan.dueDate);
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
  });

  // Combine this week's payments
  const thisWeekPayments = [
    ...thisWeekCreditCards,
    ...thisWeekLoans,
    ...(payments || []).filter(payment => {
      if (!payment.dueDate) return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate >= startOfWeek && dueDate <= endOfWeek;
    })
  ];
  
  const totalThisWeek = thisWeekPayments.reduce((sum, item) => sum + (item.minimumPayment || item.monthlyPayment || item.amount || 0), 0);
  const count = thisWeekPayments.length;

  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>;
  return (
    <>
      <div className="text-sm text-gray-500">This Week</div>
      <div className="text-xl font-bold text-red-600">{formatCurrency(totalThisWeek)}</div>
      <div className="text-sm text-gray-500">{count} payment{count !== 1 ? 's' : ''} due</div>
    </>
  );
}

function UpcomingIncomesSummary() {
  const { data: incomes = [], isLoading } = useIncomes();
  
  // Calculate current week boundaries
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter incomes for this week (if they have a next income date)
  const thisWeekIncomes = incomes.filter(income => {
    if (!income.nextIncomeDate) return false;
    const incomeDate = new Date(income.nextIncomeDate);
    return incomeDate >= startOfWeek && incomeDate <= endOfWeek;
  });
  
  const totalThisWeekIncome = thisWeekIncomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  const count = thisWeekIncomes.length;
  
  if (isLoading) return <div className="text-sm text-gray-400">Loading...</div>;
  return (
    <>
      <div className="text-sm text-gray-500">This Week</div>
      <div className="text-xl font-bold text-green-600">{formatCurrency(totalThisWeekIncome)}</div>
      <div className="text-sm text-gray-500">{count} income source{count !== 1 ? 's' : ''}</div>
    </>
  );
}

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
  const [activeSection, setActiveSection] = useState('overview');
  const [currentTab, setCurrentTab] = useState('personal');
  
  const [businessProfileDialogOpen, setBusinessProfileDialogOpen] = useState(false);
  const [purchaseOrderDialogOpen, setPurchaseOrderDialogOpen] = useState(false);
  const [selectedVendorForPO, setSelectedVendorForPO] = useState<string | null>(null);
  const [businessSettingsOpen, setBusinessSettingsOpen] = useState(false);

  // Modal dialog states for forms

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [creditCardDialogOpen, setCreditCardDialogOpen] = useState(false);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [businessCreditCardDialogOpen, setBusinessCreditCardDialogOpen] = useState(false);
  const [businessLoanDialogOpen, setBusinessLoanDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  // Editing states for form pre-population
  const [editingCreditCard, setEditingCreditCard] = useState<any>(null);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [editingBusinessRevenue, setEditingBusinessRevenue] = useState<any>(null);

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
  const BusinessRevenueForm = ({ onClose, initialData }: { onClose: () => void; initialData?: any }) => {
    const [formData, setFormData] = useState({
      amount: initialData?.amount || '',
      description: initialData?.description || '',
      source: initialData?.source || '',
      category: initialData?.category || '',
      customCategory: initialData?.customCategory || '',
      revenueType: initialData?.revenueType || '',
      frequency: initialData?.frequency || '',
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : 
            (initialData?.revenueDate ? new Date(initialData.revenueDate).toISOString().split('T')[0] : 
            new Date().toISOString().split('T')[0])
    });

    const revenueMutation = useAuthenticatedMutation(
      async (data: any, token: string | null) => {
        const url = initialData ? `/business-revenue/${initialData.id}` : "/business-revenue";
        const method = initialData ? "PUT" : "POST";
        const response = await apiRequest(url, {
          method,
          body: JSON.stringify(data)
        }, token);
        return response.data;
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: initialData ? "Business revenue updated successfully" : "Business revenue added successfully"
          });
          queryClient.invalidateQueries({ queryKey: ["business-revenue"] });
          onClose();
        },
        onError: (error: any) => {
          console.error('🔴 [BUSINESS REVENUE] Error:', error);
          toast({
            title: "Error",
            description: `Failed to ${initialData ? 'update' : 'add'} business revenue: ${error.message}`,
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
          queryClient.invalidateQueries({ queryKey: ["business-profiles"] });
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

  // Business Loan Form
  const BusinessLoanForm = ({ onClose }: { onClose: () => void }) => {
    const [formData, setFormData] = useState({
      loanName: '',
      currentBalance: '',
      interestRate: '',
      monthlyPayment: '',
      loanType: '',
      lender: '',
      dueDate: new Date().toISOString().split('T')[0],
      businessProfileId: businessProfiles.length > 0 ? businessProfiles[0].id : ''
    });

    const loanMutation = useAuthenticatedMutation(
      async (data: any, token: string | null) => {
        const response = await apiRequest("/business-loans", {
          method: "POST",
          body: JSON.stringify(data)
        }, token);
        return response.data;
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Business loan added successfully"
          });
          queryClient.invalidateQueries({ queryKey: ["business-loans"] });
          onClose();
        },
        onError: (error: any) => {
          console.error('🔴 [BUSINESS LOAN] Error:', error);
          toast({
            title: "Error",
            description: `Failed to add business loan: ${error.message}`,
            variant: "destructive"
          });
        }
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      loanMutation.mutate(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {businessProfiles.length > 0 && (
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
        )}
        <div>
          <Label htmlFor="loan-name">Loan Name</Label>
          <Input
            id="loan-name"
            value={formData.loanName}
            onChange={(e) => setFormData(prev => ({ ...prev, loanName: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current-balance">Current Balance</Label>
            <Input
              id="current-balance"
              type="number"
              step="0.01"
              value={formData.currentBalance}
              onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
              required
            />
          </div>
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
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <Label htmlFor="loan-type">Loan Type</Label>
            <Select value={formData.loanType} onValueChange={(value) => setFormData(prev => ({ ...prev, loanType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sba">SBA Loan</SelectItem>
                <SelectItem value="equipment">Equipment Financing</SelectItem>
                <SelectItem value="line-of-credit">Line of Credit</SelectItem>
                <SelectItem value="term-loan">Term Loan</SelectItem>
                <SelectItem value="real-estate">Real Estate Loan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="lender">Lender</Label>
          <Input
            id="lender"
            value={formData.lender}
            onChange={(e) => setFormData(prev => ({ ...prev, lender: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="due-date">Next Payment Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            required
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loanMutation.isPending}>
            {loanMutation.isPending ? "Adding..." : "Add Loan"}
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

  // Business credit card form component
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
      queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
    },
    onError: (error: any) => {
      // If it's a 404, the item was already deleted, so invalidate cache
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Credit card removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete credit card",
          variant: "destructive"
        });
      }
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
      queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
    onError: (error: any) => {
      // If it's a 404, the item was already deleted, so invalidate cache
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Loan removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["loans"] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete loan",
          variant: "destructive"
        });
      }
    }
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiRequest(`/income/${id}`, { method: "DELETE" }, token);
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["income"] });
      
      // Snapshot the previous value
      const previousIncomes = queryClient.getQueryData(["income"]);
      
      // Optimistically update to remove the income
      queryClient.setQueryData(["income"], (old: any[]) => 
        old ? old.filter((income: any) => income.id !== id) : []
      );
      
      // Return a context with the previous and new data
      return { previousIncomes };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
    onError: (error: any, id: string, context: any) => {
      // If it's a 404, the item was already deleted, keep the optimistic update
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Income removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["income"] });
      } else {
        // Rollback the optimistic update
        if (context?.previousIncomes) {
          queryClient.setQueryData(["income"], context.previousIncomes);
        }
        toast({
          title: "Error",
          description: "Failed to delete income",
          variant: "destructive"
        });
      }
    }
  });

  const deleteBusinessRevenue = useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken();
      return apiRequest(`/business-revenue/${id}`, { method: "DELETE" }, token);
    },
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["business-revenue"] });
      
      // Snapshot the previous value
      const previousRevenues = queryClient.getQueryData(["business-revenue"]);
      
      // Optimistically update to remove the revenue
      queryClient.setQueryData(["business-revenue"], (old: any[]) => 
        old ? old.filter((revenue: any) => revenue.id !== id) : []
      );
      
      return { previousRevenues };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Business revenue deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["business-revenue"] });
    },
    onError: (error: any, id: string, context: any) => {
      // If it's a 404, the item was already deleted, keep the optimistic update
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Business revenue removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["business-revenue"] });
      } else {
        // Rollback the optimistic update
        if (context?.previousRevenues) {
          queryClient.setQueryData(["business-revenue"], context.previousRevenues);
        }
        toast({
          title: "Error",
          description: "Failed to delete business revenue",
          variant: "destructive"
        });
      }
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
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
    onError: (error: any) => {
      // If it's a 404, the item was already deleted, so invalidate cache
      if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
        toast({
          title: "Success",
          description: "Vendor removed successfully"
        });
        queryClient.invalidateQueries({ queryKey: ["vendors"] });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete vendor",
          variant: "destructive"
        });
      }
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

  // Intersection Observer for tracking active section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          // Notify header about section change
          window.dispatchEvent(new CustomEvent('dashboard-section-change', {
            detail: { section: entry.target.id }
          }));
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all sections with IDs
    const sectionIds = [
      'overview', 'income-overview', 'expenses', 'upcoming-payments', 'upcoming-income', 
      'income-management', 'credit-cards', 'loans', 'business-overview', 'business-profile',
      'business-revenue', 'business-payments', 'business-revenue-week', 'business-credit-cards',
      'business-loans', 'office-overview', 'purchase-orders', 'vendors'
    ];
    
    sectionIds.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [currentTab]);

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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Personal Finance Center</h1>
              {user && (
                <p className="text-lg text-gray-600 mt-1">
                  Welcome back, {user.firstName || user.fullName?.split(' ')[0] || 'User'}! 👋
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Unified Add Button with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary text-white hover:bg-blue-700 w-full sm:w-auto" data-testid="unified-add-button">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Financial Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem 
                    onClick={() => setIncomeDialogOpen(true)}
                    className="cursor-pointer"
                    data-testid="add-income-option"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Income
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setExpenseDialogOpen(true)}
                    className="cursor-pointer"
                    data-testid="add-expense-option"
                  >
                    <Receipt className="h-4 w-4 mr-2" />
                    Add Expense
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setCreditCardDialogOpen(true)}
                    className="cursor-pointer"
                    data-testid="add-credit-card-option"
                  >
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Add Credit Card
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLoanDialogOpen(true)}
                    className="cursor-pointer"
                    data-testid="add-loan-option"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Add Loan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setVendorDialogOpen(true)}
                    className="cursor-pointer"
                    data-testid="add-vendor-option"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Vendor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Reset All Data Button */}
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full" onValueChange={(value) => {
            setCurrentTab(value);
            // Notify header about tab change
            window.dispatchEvent(new CustomEvent('dashboard-tab-change', {
              detail: { tab: value }
            }));
          }}>
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
              <div id="overview">
                <FinancialOverviewChart 
                  creditCards={creditCards} 
                  loans={loans} 
                  incomes={incomes} 
                  assets={assets} 
                  expenses={expenses} 
                />
              </div>

              {/* Net Worth Summary - Full Width */}
              <NetWorthSummary />

              {/* Financial Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5" id="income-overview">
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

              {/* Full Width Sections - Now in Accordion Format */}
              <div className="space-y-4">
                <Accordion type="multiple" defaultValue={["income-overview", "expenses", "payments", "income", "income-management", "credit-cards", "loans"]} className="space-y-4">
                  
                  {/* Income Overview Accordion */}
                  <AccordionItem id="income-overview" value="income-overview" className="border rounded-lg bg-white shadow-sm">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Income Overview</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track your income sources and monthly earnings</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">Monthly Income</div>
                          <div className="text-lg font-semibold text-green-600">{formatCurrency(totalMonthlyIncome)}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <IncomeOverview />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Monthly Expenses Accordion */}
                  <AccordionItem id="expenses" value="expenses" className="border rounded-lg bg-white shadow-sm">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Monthly Expenses</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Monitor your spending and expense categories</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">This Month</div>
                          <div className="text-lg font-semibold text-red-600">{formatCurrency(totalExpenses)}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <ExpenseOverview />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="payments" className="border rounded-lg bg-white shadow-sm">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <CreditCardIcon className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">This Week's Payments</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track and manage your financial obligations due this week</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          {/* Show live summary from UpcomingPayments */}
                          <UpcomingPaymentsSummary />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <UpcomingPayments 
                        onEdit={(account, type) => {
                          if (type === 'credit-card') {
                            setEditingCreditCard(account);
                            setCreditCardDialogOpen(true);
                          } else if (type === 'loan') {
                            setEditingLoan(account);
                            setLoanDialogOpen(true);
                          }
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="income" className="border rounded-lg bg-white shadow-sm" id="upcoming-income">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">This Week's Income</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Monitor your expected income and cash flow for this week</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          {/* Show live summary from UpcomingIncomes */}
                          <UpcomingIncomesSummary />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <UpcomingIncomes />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Personal Income Management Accordion */}
                  <AccordionItem value="income-management" className="border rounded-lg bg-white shadow-sm" id="income-management">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Personal Income Management</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Manage your income sources and payment schedules</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">{incomes.length} source{incomes.length !== 1 ? 's' : ''}</div>
                          <div className="text-lg font-semibold text-blue-600">{formatCurrency(totalMonthlyIncome)}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Income Sources</h4>
                        <Button 
                          size="sm" 
                          onClick={() => setIncomeDialogOpen(true)}
                          data-testid="button-add-income"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Income
                        </Button>
                      </div>
                      
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
                                  <div className="flex items-center gap-2">
                                    Next Payment: {income.nextPayDate ? new Date(income.nextPayDate).toLocaleDateString() : 'Not scheduled'}
                                    {income.nextPayDate && (
                                      <Badge variant="secondary" className="text-xs">
                                        {(() => {
                                          const days = getDaysUntilDate(income.nextPayDate);
                                          return days === 0 ? "Today" : 
                                                 days === 1 ? "Tomorrow" :
                                                 days < 0 ? `${Math.abs(days)} days late` :
                                                 `${days} days`;
                                        })()}
                                      </Badge>
                                    )}
                                  </div>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Credit Cards Accordion */}
                  <AccordionItem value="credit-cards" className="border rounded-lg bg-white shadow-sm" id="credit-cards">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <CreditCardIcon className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Credit Cards</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track your credit card balances and payments</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">{creditCards.length} card{creditCards.length !== 1 ? 's' : ''}</div>
                          <div className="text-lg font-semibold text-purple-600">
                            {formatCurrency(creditCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0))}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Your Credit Cards</h4>
                        <Button 
                          size="sm" 
                          onClick={() => setCreditCardDialogOpen(true)}
                          data-testid="button-add-credit-card"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </Button>
                      </div>
                      
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
                                  <h3 className="font-medium">{card.cardName}</h3>
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
                                    console.log('🔍 [EDIT-CREDIT-CARD] Card data:', card);
                                    console.log('🔍 [EDIT-CREDIT-CARD] Due date:', card.dueDate, typeof card.dueDate);
                                    setEditingCreditCard(card);
                                    setCreditCardDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-${card.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Loans Accordion */}
                  <AccordionItem value="loans" className="border rounded-lg bg-white shadow-sm" id="loans">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Loans</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Manage your loan balances and payment schedules</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">{loans.length} loan{loans.length !== 1 ? 's' : ''}</div>
                          <div className="text-lg font-semibold text-orange-600">
                            {formatCurrency(loans.reduce((sum, loan) => sum + parseFloat(loan.currentBalance || 0), 0))}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Your Loans</h4>
                        <Button 
                          size="sm" 
                          onClick={() => setLoanDialogOpen(true)}
                          data-testid="button-add-loan"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Loan
                        </Button>
                      </div>
                      
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
                                  <h3 className="font-medium">{loan.loanName}</h3>
                                  <Badge variant="outline">{loan.interestRate}% APR</Badge>
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
                                    console.log('🔍 [EDIT-LOAN] Loan data:', loan);
                                    console.log('🔍 [EDIT-LOAN] Due date:', loan.dueDate, typeof loan.dueDate);
                                    setEditingLoan(loan);
                                    setLoanDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-loan-${loan.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
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
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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

              {/* Business Debt Summary Stats - moved below chart */}
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
                      {formatCurrency(businessLoans.reduce((sum, loan) => sum + parseFloat(loan.currentBalance || loan.balance || 0), 0))}
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

              {/* Business Sections - Accordion Format */}
              <div className="space-y-6">
                <Accordion type="multiple" defaultValue={["business-profile", "business-revenue", "upcoming-business-payments", "upcoming-business-revenue", "business-credit-cards", "business-loans"]} className="w-full space-y-4">
                  
                  {/* Business Profile Section */}
                  <AccordionItem value="business-profile" className="border rounded-lg bg-white shadow-sm" id="business-profile">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Business Profile</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Manage your business information and settings</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">Profile Setup</div>
                          <div className="text-lg font-semibold text-indigo-600">Manage</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Business Information</h4>
                        <Dialog open={businessProfileDialogOpen} onOpenChange={setBusinessProfileDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Business Profile</DialogTitle>
                            </DialogHeader>
                            <BusinessProfileForm onClose={() => setBusinessProfileDialogOpen(false)} />
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {businessProfiles.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                          <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                            <Building size={32} className="text-indigo-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Set up your business profile</h4>
                          <p className="text-sm text-gray-500 mb-4">Add business details, tax information, and preferences</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {businessProfiles.map((profile: any) => (
                            <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{profile.businessName}</h3>
                                  <Badge variant="outline">{profile.businessType}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>EIN: {profile.ein}</div>
                                  <div>Address: {profile.address}</div>
                                  <div>Phone: {profile.phone}</div>
                                  <div>Email: {profile.email}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    console.log('🔍 [EDIT-BUSINESS-PROFILE] Profile data:', profile);
                                    // setEditingProfile(profile);
                                    // setBusinessProfileDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Business Revenue Section */}
                  <AccordionItem value="business-revenue" className="border rounded-lg bg-white shadow-sm" id="business-revenue">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Business Revenue</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track your business income and revenue streams</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">Total Revenue</div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(businessRevenue.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Revenue Sources</h4>
                        <Dialog open={revenueDialogOpen} onOpenChange={(open) => {
                          setRevenueDialogOpen(open);
                          if (!open) setEditingBusinessRevenue(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-add-revenue">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Revenue
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{editingBusinessRevenue ? 'Edit Business Revenue' : 'Add Business Revenue'}</DialogTitle>
                            </DialogHeader>
                            <BusinessRevenueForm 
                              onClose={() => {
                                setRevenueDialogOpen(false);
                                setEditingBusinessRevenue(null);
                              }}
                              initialData={editingBusinessRevenue}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      {businessRevenue.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <DollarSign size={32} className="text-green-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No business revenue added yet</h4>
                          <p className="text-sm text-gray-500 mb-4">Track your business income and revenue streams</p>
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
                                  <div>Date: {(() => {
                                    const dateField = revenue.date || revenue.revenueDate;
                                    return dateField ? (isNaN(new Date(dateField).getTime()) ? 'Invalid Date' : new Date(dateField).toLocaleDateString()) : 'No Date';
                                  })()}</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setEditingBusinessRevenue(revenue);
                                    setRevenueDialogOpen(true);
                                  }}
                                  data-testid={`button-edit-revenue-${revenue.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this revenue entry?')) {
                                      deleteBusinessRevenue.mutate(revenue.id);
                                    }
                                  }}
                                  data-testid={`button-delete-revenue-${revenue.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Upcoming Business Payments Section */}
                  <AccordionItem value="upcoming-business-payments" className="border rounded-lg bg-white shadow-sm" id="business-payments">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-red-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">This Week's Business Payments</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track business expenses and loan payments due this week</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">This Week</div>
                          <div className="text-lg font-semibold text-red-600">
                            {(() => {
                              const today = new Date();
                              const currentDay = today.getDay();
                              const startOfWeek = new Date(today);
                              startOfWeek.setDate(today.getDate() - currentDay);
                              startOfWeek.setHours(0, 0, 0, 0);
                              
                              const endOfWeek = new Date(startOfWeek);
                              endOfWeek.setDate(startOfWeek.getDate() + 6);
                              endOfWeek.setHours(23, 59, 59, 999);
                              
                              const thisWeekPayments = [
                                ...businessExpenses.filter(expense => {
                                  const expenseDate = new Date(expense.dueDate || expense.date || expense.expenseDate);
                                  return expenseDate >= startOfWeek && expenseDate <= endOfWeek && !isNaN(expenseDate.getTime());
                                }),
                                ...businessLoans.filter(loan => {
                                  const loanDueDate = new Date(loan.dueDate);
                                  return loanDueDate >= startOfWeek && loanDueDate <= endOfWeek && !isNaN(loanDueDate.getTime());
                                })
                              ];
                              const total = thisWeekPayments.reduce((sum, payment) => {
                                return sum + parseFloat(payment.amount || payment.monthlyPayment || 0);
                              }, 0);
                              return formatCurrency(total);
                            })()}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      {/* Filter business payments for this week */}
                      {(() => {
                        const today = new Date();
                        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - currentDay); // Start of week (Sunday)
                        startOfWeek.setHours(0, 0, 0, 0);
                        
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
                        endOfWeek.setHours(23, 59, 59, 999);
                        
                        console.log('🔍 [DEBUG] This week:', startOfWeek.toLocaleDateString(), 'to', endOfWeek.toLocaleDateString());
                        console.log('🔍 [DEBUG] Business Expenses Data:', businessExpenses);
                        console.log('🔍 [DEBUG] Business Loans Data:', businessLoans);
                        
                        const thisWeekBusinessPayments = [
                          ...businessExpenses.filter(expense => {
                            const expenseDate = new Date(expense.dueDate || expense.date || expense.expenseDate);
                            const isThisWeek = expenseDate >= startOfWeek && expenseDate <= endOfWeek && !isNaN(expenseDate.getTime());
                            console.log('🔍 [DEBUG] Expense:', expense.description, 'Date:', expenseDate.toLocaleDateString(), 'Is this week:', isThisWeek);
                            return isThisWeek;
                          }).map(expense => ({
                            ...expense,
                            type: 'expense',
                            name: expense.description,
                            amount: expense.amount,
                            dueDate: expense.dueDate || expense.date || expense.expenseDate
                          })),
                          ...businessLoans.filter(loan => {
                            const loanDueDate = new Date(loan.dueDate);
                            const isThisWeek = loanDueDate >= startOfWeek && loanDueDate <= endOfWeek && !isNaN(loanDueDate.getTime());
                            console.log('🔍 [DEBUG] Loan:', loan.loanName, 'Due date:', loanDueDate.toLocaleDateString(), 'Is this week:', isThisWeek);
                            return isThisWeek;
                          }).map(loan => ({
                            ...loan,
                            type: 'loan',
                            name: loan.loanName,
                            amount: loan.monthlyPayment,
                            dueDate: loan.dueDate
                          }))
                        ];
                        console.log('🔍 [DEBUG] Total this week business payments:', thisWeekBusinessPayments.length);
                        
                        return thisWeekBusinessPayments.length === 0 ? (
                          <div className="text-center py-8 text-neutral-500">
                            <CalendarDays size={48} className="mx-auto mb-4 text-neutral-300" />
                            <p className="mb-4">No business payments this week</p>
                            <p className="text-sm">Business expenses and loan payments will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {thisWeekBusinessPayments.map((payment: any, index) => (
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Upcoming Business Revenue Section */}
                  <AccordionItem value="upcoming-business-revenue" className="border rounded-lg bg-white shadow-sm" id="business-revenue-week">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">This Week's Business Revenue</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Monitor expected business income and cash flow for this week</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">This Week's Income</div>
                          <div className="text-lg font-semibold text-green-600">
                            {(() => {
                              const today = new Date();
                              const currentDay = today.getDay();
                              const startOfWeek = new Date(today);
                              startOfWeek.setDate(today.getDate() - currentDay);
                              startOfWeek.setHours(0, 0, 0, 0);
                              
                              const endOfWeek = new Date(startOfWeek);
                              endOfWeek.setDate(startOfWeek.getDate() + 6);
                              endOfWeek.setHours(23, 59, 59, 999);
                              
                              const thisWeekRevenue = businessRevenue.filter(revenue => {
                                const dateField = revenue.date || revenue.revenueDate;
                                if (!dateField) return false;
                                const revenueDate = new Date(dateField);
                                return revenueDate >= startOfWeek && revenueDate <= endOfWeek && !isNaN(revenueDate.getTime());
                              });
                              const total = thisWeekRevenue.reduce((sum, revenue) => sum + parseFloat(revenue.amount || 0), 0);
                              return formatCurrency(total);
                            })()}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      {/* Filter business revenue for this week */}
                      {(() => {
                        const today = new Date();
                        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
                        const startOfWeek = new Date(today);
                        startOfWeek.setDate(today.getDate() - currentDay); // Start of week (Sunday)
                        startOfWeek.setHours(0, 0, 0, 0);
                        
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
                        endOfWeek.setHours(23, 59, 59, 999);
                        
                        console.log('🔍 [DEBUG] Business Revenue Data:', businessRevenue);
                        const thisWeekBusinessRevenue = businessRevenue.filter(revenue => {
                          const dateField = revenue.date || revenue.revenueDate;
                          console.log('🔍 [DEBUG] Revenue item:', revenue.description, 'Date field:', dateField);
                          if (!dateField) return false;
                          const revenueDate = new Date(dateField);
                          const isThisWeek = revenueDate >= startOfWeek && revenueDate <= endOfWeek && !isNaN(revenueDate.getTime());
                          console.log('🔍 [DEBUG] Revenue date:', revenueDate.toLocaleDateString(), 'Is this week:', isThisWeek);
                          return isThisWeek;
                        });
                        console.log('🔍 [DEBUG] This week business revenue count:', thisWeekBusinessRevenue.length);
                        
                        return thisWeekBusinessRevenue.length === 0 ? (
                          <div className="text-center py-8 text-neutral-500">
                            <TrendingUp size={48} className="mx-auto mb-4 text-neutral-300" />
                            <p className="mb-4">No business revenue this week</p>
                            <p className="text-sm">Expected business income will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {thisWeekBusinessRevenue.map((revenue: any) => (
                              <div key={revenue.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{revenue.description}</h4>
                                    <Badge variant="outline">{revenue.source}</Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    <div>Amount: <span className="font-medium text-green-600">{formatCurrency(parseFloat(revenue.amount))}</span></div>
                                    <div>Expected: {(() => {
                                      const dateField = revenue.date || revenue.revenueDate;
                                      return dateField ? new Date(dateField).toLocaleDateString() : 'No Date';
                                    })()}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Business Credit Cards Section */}
                  <AccordionItem value="business-credit-cards" className="border rounded-lg px-6 bg-white">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCardIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Business Credit Cards</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Manage your business credit cards and track utilization</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">Total Balance</div>
                          <div className="text-lg font-semibold text-red-600">
                            {formatCurrency(businessCreditCards.reduce((sum, card) => sum + parseFloat(card.balance), 0))}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Business Credit Cards</h4>
                        <Dialog open={businessCreditCardDialogOpen} onOpenChange={setBusinessCreditCardDialogOpen}>
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
                            <BusinessCreditCardForm onClose={() => setBusinessCreditCardDialogOpen(false)} />
                          </DialogContent>
                        </Dialog>
                      </div>
                      {businessCreditCards.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <CreditCardIcon size={32} className="text-blue-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No business credit cards added yet</h4>
                          <p className="text-sm text-gray-500 mb-4">Track your business credit cards separately from personal ones</p>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Business Loans Section */}
                  <AccordionItem value="business-loans" className="border rounded-lg px-6 bg-white">
                    <AccordionTrigger className="px-4 sm:px-6 py-4 hover:no-underline">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="text-lg font-semibold text-gray-900">Business Loans</h3>
                            <p className="text-sm text-gray-500 hidden sm:block">Track SBA loans, equipment financing, and business lines of credit</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right sm:mr-6">
                          <div className="text-sm text-gray-500">Total Balance</div>
                          <div className="text-lg font-semibold text-red-600">
                            {formatCurrency(businessLoans.reduce((sum, loan) => sum + parseFloat(loan.currentBalance || loan.balance || 0), 0))}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 sm:px-6 pb-6">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-medium">Business Loans</h4>
                        <Dialog open={businessLoanDialogOpen} onOpenChange={setBusinessLoanDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-add-business-loan">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Loan
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Business Loan</DialogTitle>
                              <DialogDescription>
                                Add a new business loan to track payments and balances.
                              </DialogDescription>
                            </DialogHeader>
                            <BusinessLoanForm onClose={() => setBusinessLoanDialogOpen(false)} />
                          </DialogContent>
                        </Dialog>
                      </div>
                      {businessLoans.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                          <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                            <Building2 size={32} className="text-purple-600" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">No business loans added yet</h4>
                          <p className="text-sm text-gray-500 mb-4">Track SBA loans, equipment financing, and business lines of credit</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {businessLoans.map((loan: any) => (
                            <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{loan.loanName}</h3>
                                  <Badge variant="outline">{loan.interestRate}% APR</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div>Balance: <span className="font-medium text-red-600">{formatCurrency(parseFloat(loan.currentBalance || 0))}</span></div>
                                  <div>Monthly Payment: <span className="font-medium">{formatCurrency(parseFloat(loan.monthlyPayment || 0))}</span></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>

            </TabsContent>

            <TabsContent value="office" className="space-y-6 mt-8">
              {/* All Purchase Orders Section */}
              <Card id="office-overview">
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
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                              <DialogHeader className="flex-shrink-0">
                                <DialogTitle>All Purchase Orders</DialogTitle>
                              </DialogHeader>
                              <div className="flex-1 overflow-y-auto pr-2">
                                <PurchaseOrderList />
                              </div>
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
                  <Button 
                    size="sm" 
                    onClick={() => setVendorDialogOpen(true)}
                    data-testid="button-add-vendor"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
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
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => {
                                setSelectedVendorForPO(vendor.id);
                                setPurchaseOrderDialogOpen(true);
                              }}
                            >
                              <Receipt className="h-4 w-4 mr-2" />
                              Create PO
                            </Button>
                            
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

          <Dialog open={purchaseOrderDialogOpen} onOpenChange={setPurchaseOrderDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
                <DialogDescription>
                  Create a new purchase order for the selected vendor
                </DialogDescription>
              </DialogHeader>
              <PurchaseOrderFormComprehensive 
                selectedVendorId={selectedVendorForPO}
                onClose={() => setPurchaseOrderDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          {/* Unified Add Button Modal Dialogs */}
          <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Personal Income</DialogTitle>
                <DialogDescription>
                  Add salary, wages, freelance payments, or other personal income sources
                </DialogDescription>
              </DialogHeader>
              <IncomeForm onClose={() => setIncomeDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Personal Expense</DialogTitle>
                <DialogDescription>
                  Track your personal expenses and spending
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm onClose={() => setExpenseDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={creditCardDialogOpen} onOpenChange={(open) => {
            setCreditCardDialogOpen(open);
            if (!open) setEditingCreditCard(null);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCreditCard ? 'Edit Credit Card' : 'Add Credit Card'}</DialogTitle>
                <DialogDescription>
                  {editingCreditCard ? 'Update your credit card information' : 'Add a new credit card to track balances and payments'}
                </DialogDescription>
              </DialogHeader>
              <CreditCardForm 
                onClose={() => {
                  setCreditCardDialogOpen(false);
                  setEditingCreditCard(null);
                }} 
                initialData={editingCreditCard}
                isEditing={!!editingCreditCard}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={loanDialogOpen} onOpenChange={(open) => {
            setLoanDialogOpen(open);
            if (!open) setEditingLoan(null);
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLoan ? 'Edit Loan' : 'Add Loan'}</DialogTitle>
                <DialogDescription>
                  {editingLoan ? 'Update your loan information' : 'Add a personal loan, mortgage, or other debt'}
                </DialogDescription>
              </DialogHeader>
              <LoanForm 
                onClose={() => {
                  setLoanDialogOpen(false);
                  setEditingLoan(null);
                }} 
                initialData={editingLoan}
                isEditing={!!editingLoan}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Vendor</DialogTitle>
                <DialogDescription>
                  Add a new business vendor or supplier
                </DialogDescription>
              </DialogHeader>
              <VendorForm onClose={() => setVendorDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}


