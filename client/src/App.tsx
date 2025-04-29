import { Switch, Route } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import { Providers } from "@/providers/providers";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import CreditCardsPage from "@/pages/credit-cards-page";
import AssetsPage from "@/pages/assets-page";
import IncomePage from "@/pages/income-page";
import ExpensesPage from "@/pages/expenses-page";
import SettingsPage from "@/pages/settings-page-sidemenu";
import RealTimePage from "@/pages/real-time-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import { CreditCardForm } from "@/components/credit-cards/credit-card-form";
import { AssetForm } from "@/components/assets/asset-form";
import { IncomeForm } from "@/components/income/income-form";
import { ExpenseForm } from "@/components/expenses/expense-form";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/credit-cards" component={CreditCardsPage} />
      <ProtectedRoute path="/credit-cards/new" component={() => <CreditCardForm />} />
      <ProtectedRoute path="/assets" component={AssetsPage} />
      <ProtectedRoute path="/assets/new" component={() => <AssetForm />} />
      <ProtectedRoute path="/income" component={IncomePage} />
      <ProtectedRoute path="/income/new" component={() => <IncomeForm />} />
      <ProtectedRoute path="/expenses" component={ExpensesPage} />
      <ProtectedRoute path="/expenses/new" component={() => <ExpenseForm />} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/real-time" component={RealTimePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Providers>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </Providers>
  );
}

export default App;
