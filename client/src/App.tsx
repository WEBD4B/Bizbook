import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ComprehensiveDashboard from "@/pages/comprehensive-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ComprehensiveDashboard} />
      <Route path="/credit-cards" component={ComprehensiveDashboard} />
      <Route path="/loans" component={ComprehensiveDashboard} />
      <Route path="/schedule" component={ComprehensiveDashboard} />
      <Route path="/analytics" component={ComprehensiveDashboard} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
