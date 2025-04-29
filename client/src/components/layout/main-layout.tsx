import { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && <Sidebar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}