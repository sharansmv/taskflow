import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "@/pages/dashboard-page";
import AuthPage from "@/pages/auth-page";
import CalendarPage from "@/pages/calendar-page";
import TasksPage from "@/pages/tasks-page";
import GoalsPage from "@/pages/goals-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/goals" component={GoalsPage} />
      <Route path="/auth" component={AuthPage} />
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
