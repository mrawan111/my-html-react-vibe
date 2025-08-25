import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppNavbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-card rounded-b-xl border-b border-border">
      <SidebarTrigger />
      
      <div className="relative flex-1 mx-3">
        <Input
          type="search"
          placeholder="بحث"
          className="w-full bg-secondary rounded-xl py-2 pr-10 pl-4 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Search className="absolute top-2.5 right-3 h-4 w-4 text-muted-foreground" />
      </div>
      
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full"></span>
        </Button>
        
        <div className="w-9 h-9 rounded-full border border-border bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">U</span>
        </div>
      </div>
    </nav>
  );
}