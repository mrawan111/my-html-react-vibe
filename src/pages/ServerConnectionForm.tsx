import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateRouter } from "@/hooks/useRouters";
import { toast } from "@/hooks/use-toast";

const ServerConnectionForm = () => {
  const [cloudName, setCloudName] = useState<string>("");
  const [routerName, setRouterName] = useState<string>("");
  const [identifier, setIdentifier] = useState<string>("");
  const [ipAddress, setIpAddress] = useState<string>("");
  const [apiPort, setApiPort] = useState<string>("8728");
  const [apiUsername, setApiUsername] = useState<string>("admin");
  const [apiPassword, setApiPassword] = useState<string>("");
  const [hotspotInterface, setHotspotInterface] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [connectionType, setConnectionType] = useState<string>("mikrotik-api");
  
  const createRouter = useCreateRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createRouter.mutateAsync({
        cloud_name: cloudName,
        router_name: routerName,
        identifier: identifier,
        ip_address: ipAddress,
        location: location,
        status: 'offline'
      });
      
      // Reset form
      setCloudName("");
      setRouterName("");
      setIdentifier("");
      setIpAddress("");
      setApiPort("8728");
      setApiUsername("admin");
      setApiPassword("");
      setHotspotInterface("");
      setLocation("");
      
    } catch (error) {
      console.error("Error adding router:", error);
    }
  };

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">إضافة راوتر MikroTik</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>بيانات الاتصال براوتر MikroTik</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cloudName">اسم السحابة</Label>
                <Input
                  id="cloudName"
                  type="text"
                  placeholder="اسم السحابة أو المكان"
                  value={cloudName}
                  onChange={(e) => setCloudName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routerName">اسم الراوتر</Label>
                <Input
                  id="routerName"
                  type="text"
                  placeholder="اسم الراوتر"
                  value={routerName}
                  onChange={(e) => setRouterName(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">المعرف الفريد</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="معرف فريد للراوتر"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">الموقع</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="موقع الراوتر"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ipAddress">عنوان IP</Label>
                <Input
                  id="ipAddress"
                  type="text"
                  placeholder="192.168.1.1"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiPort">منفذ API</Label>
                <Input
                  id="apiPort"
                  type="number"
                  placeholder="8728"
                  value={apiPort}
                  onChange={(e) => setApiPort(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apiUsername">اسم المستخدم</Label>
                <Input
                  id="apiUsername"
                  type="text"
                  placeholder="admin"
                  value={apiUsername}
                  onChange={(e) => setApiUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiPassword">كلمة المرور</Label>
                <Input
                  id="apiPassword"
                  type="password"
                  placeholder="كلمة مرور API"
                  value={apiPassword}
                  onChange={(e) => setApiPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="connectionType">نوع الاتصال</Label>
                <Select value={connectionType} onValueChange={setConnectionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الاتصال" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mikrotik-api">MikroTik API</SelectItem>
                    <SelectItem value="winbox">Winbox</SelectItem>
                    <SelectItem value="ssh">SSH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotspotInterface">واجهة الهوت سبوت</Label>
                <Input
                  id="hotspotInterface"
                  type="text"
                  placeholder="wlan1"
                  value={hotspotInterface}
                  onChange={(e) => setHotspotInterface(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createRouter.isPending}
            >
              {createRouter.isPending ? "جاري الإضافة..." : "إضافة الراوتر"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerConnectionForm;
