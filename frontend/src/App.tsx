import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ComprehensiveDashboard from "@/pages/comprehensive-dashboard";
import OptimizedDashboard from "@/pages/optimized-dashboard";
import TestDashboard from "@/pages/test-dashboard";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser, useAuth, useClerk } from "@clerk/clerk-react";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ApiProvider } from "@/contexts/ApiContext";
import { Wallet, Menu, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/apiWithAuth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/dashboard" component={ComprehensiveDashboard} />
      <Route path="/test" component={TestDashboard} />
      <Route path="/optimized" component={OptimizedDashboard} />
      <Route path="/full-dashboard" component={ComprehensiveDashboard} />
      <Route path="/credit-cards" component={ComprehensiveDashboard} />
      <Route path="/loans" component={ComprehensiveDashboard} />
      <Route path="/schedule" component={ComprehensiveDashboard} />
      <Route path="/analytics" component={ComprehensiveDashboard} />
      <Route path="/" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function HeaderWithUser() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { signOut, openUserProfile } = useClerk();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState('personal');
  const [activeSection, setActiveSection] = useState('overview');
  
  // Reset all user data function
  const handleResetAllData = async () => {
    if (!window.confirm("⚠️ WARNING: This will permanently delete ALL your financial data including income, expenses, credit cards, loans, assets, and payments. This action cannot be undone. Are you absolutely sure?")) {
      return;
    }

    try {
      const token = await getToken();
      
      // Call the reset endpoint
      await apiRequest('/reset-all', {
        method: 'DELETE'
      }, token);

      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
      
      toast({
        title: "Account Reset Complete",
        description: "All financial data has been deleted from your account.",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset account data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Navigation sections data
  const navigationSections = {
    personal: [
      { id: 'overview', label: 'Overview' },
      { id: 'income-overview', label: 'Income Overview' },
      { id: 'expenses', label: 'Monthly Expenses' },
      { id: 'upcoming-payments', label: "This Week's Payments" },
      { id: 'upcoming-income', label: "This Week's Income" },
      { id: 'income-management', label: 'Income Management' },
      { id: 'credit-cards', label: 'Credit Cards' },
      { id: 'loans', label: 'Loans' },
    ],
    business: [
      { id: 'business-overview', label: 'Business Overview' },
      { id: 'business-profile', label: 'Business Profile' },
      { id: 'business-revenue', label: 'Business Revenue' },
      { id: 'business-payments', label: "This Week's Payments" },
      { id: 'business-revenue-week', label: "This Week's Revenue" },
      { id: 'business-credit-cards', label: 'Business Credit Cards' },
      { id: 'business-loans', label: 'Business Loans' },
    ],
    office: [
      { id: 'office-overview', label: 'Office Overview' },
      { id: 'purchase-orders', label: 'Purchase Orders' },
      { id: 'vendors', label: 'Vendors' },
    ]
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Listen for tab changes from dashboard
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      setCurrentTab(event.detail.tab);
    };
    
    const handleSectionChange = (event: CustomEvent) => {
      setActiveSection(event.detail.section);
    };

    window.addEventListener('dashboard-tab-change', handleTabChange as EventListener);
    window.addEventListener('dashboard-section-change', handleSectionChange as EventListener);
    
    return () => {
      window.removeEventListener('dashboard-tab-change', handleTabChange as EventListener);
      window.removeEventListener('dashboard-section-change', handleSectionChange as EventListener);
    };
  }, []);
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-2 py-3 sm:px-4 sm:py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-xl shadow-lg">
            <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
              KashGrip
            </span>
            {user && (
              <span className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">
                Welcome, {user.firstName || user.fullName?.split(' ')[0] || 'User'}!
              </span>
            )}
          </div>
        </div>
        
        {/* Navigation Links - Large Desktop */}
        <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center mx-4">
          {navigationSections[currentTab as keyof typeof navigationSections]?.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        {/* Navigation Dropdown - Mobile and Tablet */}
        <div className="lg:hidden flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <Menu className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Navigate</span>
                <span className="sm:hidden">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              {/* User Info */}
              {user && (
                <>
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName || user.fullName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </>
              )}
              
              {/* Navigation Sections */}
              {navigationSections[currentTab as keyof typeof navigationSections]?.map((section) => (
                <DropdownMenuItem
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`cursor-pointer text-sm ${
                    activeSection === section.id ? 'bg-emerald-50 text-emerald-600' : ''
                  }`}
                >
                  {section.label}
                </DropdownMenuItem>
              ))}
              
              {/* Separator */}
              <div className="border-t my-1" />
              
              {/* User Actions */}
              <DropdownMenuItem
                onClick={() => openUserProfile()}
                className="cursor-pointer text-sm"
              >
                Manage Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleResetAllData}
                className="cursor-pointer text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Account Data
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="cursor-pointer text-sm"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* UserButton - Desktop Only */}
        <div className="hidden lg:block flex-shrink-0">
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label="manageAccount" />
              <UserButton.Action
                label="Reset Account Data"
                labelIcon={<RotateCcw className="h-4 w-4" />}
                onClick={handleResetAllData}
              />
              <UserButton.Action label="signOut" />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </div>
    </header>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={ComprehensiveDashboard} />
      <Route path="/test" component={TestDashboard} />
      <Route path="/optimized" component={OptimizedDashboard} />
      <Route path="/full-dashboard" component={ComprehensiveDashboard} />
      <Route path="/credit-cards" component={ComprehensiveDashboard} />
      <Route path="/loans" component={ComprehensiveDashboard} />
      <Route path="/schedule" component={ComprehensiveDashboard} />
      <Route path="/analytics" component={ComprehensiveDashboard} />
      <Route path="/auth" component={() => <Redirect to="/dashboard" />} />
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function UnauthenticatedRouter() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={LandingPage} />
      <Route component={() => <Redirect to="/auth" />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SignedOut>
          <UnauthenticatedRouter />
        </SignedOut>
        <SignedIn>
          <ApiProvider>
            <div className="min-h-screen bg-gray-50">
              <HeaderWithUser />
              <main>
                <AuthenticatedRouter />
              </main>
            </div>
          </ApiProvider>
        </SignedIn>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
