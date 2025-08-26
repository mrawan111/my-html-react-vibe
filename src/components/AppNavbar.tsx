import { Search, Bell, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-9 h-9 rounded-full border border-border bg-gradient-to-br from-primary/20 to-primary/10 p-0"
            >
              <span className="text-sm font-semibold text-primary">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuLabel className="text-foreground">
              {user?.email || "المستخدم"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-foreground hover:bg-accent">
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
      </div>
    </nav>
  );
}