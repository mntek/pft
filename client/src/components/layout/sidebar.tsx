import React from "react";
import { useLocation, Link } from "wouter";
import { 
  Home, 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Receipt, 
  Settings
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { label: "Dashboard", icon: Home, path: "/" },
    { label: "Credit Cards", icon: CreditCard, path: "/credit-cards" },
    { label: "Assets", icon: Wallet, path: "/assets" },
    { label: "Income", icon: DollarSign, path: "/income" },
    { label: "Expenses", icon: Receipt, path: "/expenses" },
  ];

  return (
    <div className="w-64 h-full border-r border-border bg-background">
      <div className="h-full py-6 px-3 flex flex-col">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </a>
            </Link>
          ))}
        </div>

        <div className="mt-auto">
          <Link href="/settings">
            <a
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
