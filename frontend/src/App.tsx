import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ComprehensiveDashboard from "@/pages/comprehensive-dashboard";
import OptimizedDashboard from "@/pages/optimized-dashboard";
import TestDashboard from "@/pages/test-dashboard";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { ApiProvider } from "@/contexts/ApiContext";

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
              <header className="flex items-center justify-between p-4 border-b bg-white">
                <h1 className="text-xl font-semibold">BizBook</h1>
                <UserButton />
              </header>
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
