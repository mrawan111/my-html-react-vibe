import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { Search, Bell, LogOut, User, Wifi } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة التحكم",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] w-full max-w-md p-8 relative border border-border">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full border-4 border-primary shadow-[var(--shadow-glow)] bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Wifi className="h-5 w-5 text-primary-foreground" />
          Kayan
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground text-center mb-6">
          قم بتسجيل الدخول للمتابعة إلى لوحة التحكم
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@etechvalley.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
              required
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-[var(--shadow-soft)] transition-[var(--transition-smooth)]"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm space-y-3 sm:space-y-0">
          <button className="text-primary hover:underline transition-[var(--transition-smooth)]">
            نسيت كلمة المرور؟
          </button>
          <button className="text-primary hover:underline transition-[var(--transition-smooth)]">
            إنشاء حساب جديد
          </button>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 bg-muted rounded-lg text-xs text-muted-foreground text-center">
          <strong>للتجربة:</strong> admin@etechvalley.com / 123456
        </div>
      </div>
    </div>
  );
};

export default Login;