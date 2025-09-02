import { Search, Bell, LogOut, User, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function AppNavbar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الخروج",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "شكراً لاستخدام النظام",
      });
      navigate("/");
    }
  };
  return (
    <header className="kayantech-header flex h-16 shrink-0 items-center gap-2 border-b border-border px-4 z-10 bg-secondary shadow-md">
      {/* Logo and Brand */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full transform hover:rotate-15 transition-transform duration-300">
          <Wifi className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="font-bold text-foreground text-lg hidden sm:block">KayanTeck</h2>
      </div>
      
      {/* Search Bar */}
      <div className="flex-1 px-4 max-w-md">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث في النظام..."
            className="w-full pr-10 pl-4 py-2 bg-input rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-200 hover:shadow-md"
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent transition-colors duration-200"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-9 h-9 rounded-full border border-border bg-gradient-to-br from-primary/20 to-primary/10 p-0 hover:scale-105 transition-transform duration-200"
            >
              <span className="text-sm font-semibold text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
            <DropdownMenuLabel className="text-foreground">
              {user?.email || "المستخدم"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
              <User className="w-4 h-4 ml-2" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              className="text-foreground hover:bg-accent cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <SidebarTrigger className="ml-2 text-primary hover:text-primary/80 hover:scale-110 transition-all duration-200" />
      </div>
    </header>
  );
}