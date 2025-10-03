import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MikroTikAPI, MikroTikConnection } from "@/lib/mikrotik-api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export const RouterTestForm = () => {
  const [connection, setConnection] = useState<MikroTikConnection>({
    ip: "",
    port: 8728,
    username: "admin",
    password: ""
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);

  const handleTest = async () => {
    if (!connection.ip || !connection.username || !connection.password) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const api = new MikroTikAPI(connection);
      const isConnected = await api.testConnection();

      if (isConnected) {
        setTestResult('success');
        toast({
          title: "نجح الاتصال",
          description: "تم الاتصال بالراوتر بنجاح",
        });

        // Try to get system info
        try {
          const systemInfo = await api.getSystemInfo();
          console.log("System Info:", systemInfo);
          toast({
            title: "معلومات النظام",
            description: `Router: ${systemInfo.identity?.name || 'Unknown'} - Version: ${systemInfo.resource?.version || 'Unknown'}`,
          });
        } catch (error) {
          console.log("Could not get system info, but connection was successful");
        }
      } else {
        setTestResult('failure');
        toast({
          title: "فشل الاتصال",
          description: "لم يتم الاتصال بالراوتر. تحقق من البيانات والشبكة",
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult('failure');
      console.error("Connection test error:", error);
      toast({
        title: "خطأ في الاتصال",
        description: error.message || "حدث خطأ أثناء اختبار الاتصال",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          اختبار الاتصال بالراوتر
          {testResult === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {testResult === 'failure' && <XCircle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testIp">عنوان IP للراوتر</Label>
            <Input
              id="testIp"
              type="text"
              placeholder="192.168.1.1"
              value={connection.ip}
              onChange={(e) => setConnection({ ...connection, ip: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testPort">منفذ API</Label>
            <Input
              id="testPort"
              type="number"
              placeholder="8728"
              value={connection.port}
              onChange={(e) => setConnection({ ...connection, port: parseInt(e.target.value) || 8728 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testUsername">اسم المستخدم</Label>
            <Input
              id="testUsername"
              type="text"
              placeholder="admin"
              value={connection.username}
              onChange={(e) => setConnection({ ...connection, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testPassword">كلمة المرور</Label>
            <Input
              id="testPassword"
              type="password"
              placeholder="كلمة مرور الراوتر"
              value={connection.password}
              onChange={(e) => setConnection({ ...connection, password: e.target.value })}
            />
          </div>
        </div>

        <Button 
          onClick={handleTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              جاري اختبار الاتصال...
            </>
          ) : (
            "اختبار الاتصال"
          )}
        </Button>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {testResult === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>تم الاتصال بالراوتر بنجاح!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                <span>فشل في الاتصال بالراوتر. تحقق من البيانات وإعدادات الشبكة.</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};