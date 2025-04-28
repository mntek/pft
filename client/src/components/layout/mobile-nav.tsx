import React from "react";
import { useLocation, Link } from "wouter";
import { Home, CreditCard, Wallet, DollarSign, Receipt } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-card border-t border-border z-10">
      <div className="grid grid-cols-5 h-16">
        <Link href="/">
          <a className={`flex flex-col items-center justify-center ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/credit-cards">
          <a className={`flex flex-col items-center justify-center ${isActive('/credit-cards') ? 'text-primary' : 'text-muted-foreground'}`}>
            <CreditCard className="h-6 w-6" />
            <span className="text-xs mt-1">Cards</span>
          </a>
        </Link>
        
        <Link href="/assets">
          <a className={`flex flex-col items-center justify-center ${isActive('/assets') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Wallet className="h-6 w-6" />
            <span className="text-xs mt-1">Assets</span>
          </a>
        </Link>
        
        <Link href="/income">
          <a className={`flex flex-col items-center justify-center ${isActive('/income') ? 'text-primary' : 'text-muted-foreground'}`}>
            <DollarSign className="h-6 w-6" />
            <span className="text-xs mt-1">Income</span>
          </a>
        </Link>
        
        <Link href="/expenses">
          <a className={`flex flex-col items-center justify-center ${isActive('/expenses') ? 'text-primary' : 'text-muted-foreground'}`}>
            <Receipt className="h-6 w-6" />
            <span className="text-xs mt-1">Expenses</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
