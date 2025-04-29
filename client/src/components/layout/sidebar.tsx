import { Link, useLocation } from "wouter";
import { 
  CreditCard, 
  BarChart3, 
  DollarSign, 
  Wallet, 
  Coins,
  Menu,
  Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  count?: number;
}

function NavItem({ icon, label, href, isActive, count }: NavItemProps) {
  return (
    <Link href={href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2", 
          isActive && "font-semibold"
        )}
      >
        {icon}
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  interface NavItemData {
    icon: React.ReactNode;
    label: string;
    href: string;
    count?: number;
  }
  
  const navItems: NavItemData[] = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Credit Cards",
      href: "/credit-cards",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Assets",
      href: "/assets",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Income",
      href: "/income",
    },
    {
      icon: <Coins className="h-5 w-5" />,
      label: "Expenses",
      href: "/expenses",
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      label: "Real-Time",
      href: "/real-time",
    }
  ];
  
  const sidebarContent = (
    <div className="flex h-full flex-col gap-4 py-4">
      <div className="px-4 font-semibold text-lg md:hidden">
        FinTrack
      </div>
      <nav className="flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isActive={location === item.href}
            count={item.count}
          />
        ))}
      </nav>
    </div>
  );
  
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <div className="h-full w-64 border-r bg-background hidden md:block">
      {sidebarContent}
    </div>
  );
}