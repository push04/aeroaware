import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navigation } from "@/components/Navigation";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useKeyboardShortcuts } from "@/components/KeyboardShortcuts";
import Dashboard from "@/pages/Dashboard";
import Forecast from "@/pages/Forecast";
import Trends from "@/pages/Trends";
import Health from "@/pages/Health";
import Compare from "@/pages/Compare";
import Education from "@/pages/Education";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/forecast" component={Forecast} />
      <Route path="/trends" component={Trends} />
      <Route path="/health" component={Health} />
      <Route path="/compare" component={Compare} />
      <Route path="/education" component={Education} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useKeyboardShortcuts();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Navigation />
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
