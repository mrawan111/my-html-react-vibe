import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouters, useTestRouterConnection, useUpdateRouter } from "@/hooks/useRouters";
import { ConnectionTestButton } from "@/components/ConnectionTestButton";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Wifi, WifiOff, Settings, Upload, Image, Plus } from "lucide-react";

export default function Routers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: routers = [], isLoading, error } = useRouters();
  const testConnection = useTestRouterConnection();
  const updateRouter = useUpdateRouter();

  const filteredRouters = routers.filter(router =>
    router.cloud_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    router.router_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    router.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">بيانات الراوتر</h1>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">بيانات الراوتر</h1>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center py-12">
              <p className="text-destructive">حدث خطأ أثناء تحميل البيانات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-foreground text-xl font-bold">بيانات الراوتر</h1>
        <Button 
          onClick={() => window.location.href = '/#/server-connection'}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة راوتر جديد
        </Button>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="relative">
            <Input 
              type="search" 
              placeholder="بحث في الراوترات..." 
              className="w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-center text-foreground text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="py-3 px-2">الشعار</th>
                <th className="py-3 px-2">اسم السحابة</th>
                <th className="py-3 px-2">إسم الراوتر</th>
                <th className="py-3 px-2">الإسم التعريفي</th>
                <th className="py-3 px-2">الحالة</th>
                <th className="py-3 px-2">نوع الاتصال</th>
                <th className="py-3 px-2">الموقع</th>
                <th className="py-3 px-2">العنوان الالكترونى</th>
                <th className="py-3 px-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredRouters.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد راوترات
                  </td>
                </tr>
              ) : (
                filteredRouters.map((router) => (
                  <tr key={router.id} className="border-b border-border">
                    <td className="py-4 px-2">
                      {router.logo_url ? (
                        <img src={router.logo_url} alt="Logo" className="w-10 h-10 object-contain mx-auto" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded">
                          <Image size={20} />
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-2">{router.cloud_name}</td>
                    <td className="py-4 px-2">{router.router_name}</td>
                    <td className="py-4 px-2">{router.identifier}</td>
                    <td className="py-4 px-2">
                      <Badge 
                        variant={router.status === 'online' ? 'default' : 'destructive'}
                        className={router.status === 'online' ? 'bg-green-600' : ''}
                      >
                        {router.status === 'online' ? 'متصل' : 'غير متصل'}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">
                      <Badge variant="outline">
                        {router.connection_type || 'mikrotik-api'}
                      </Badge>
                    </td>
                    <td className="py-4 px-2">{router.location || "لا يوجد"}</td>
                    <td className="py-4 px-2">{router.ip_address || "لا يوجد"}</td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2 justify-center items-center">
                        <ConnectionTestButton router={router} />
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <Settings size={14} />
                          تعديل
                        </Button>
                        <label htmlFor={`upload-logo-${router.id}`} className="cursor-pointer flex items-center gap-1 px-2 py-1 border rounded text-sm hover:bg-gray-100">
                          <Upload size={14} />
                          رفع شعار
                        </label>
                        <input
                          type="file"
                          id={`upload-logo-${router.id}`}
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            console.log("Uploading logo for router:", router.id, router.router_name);

                            // Upload logic here - for now, simulate upload and get URL
                            // You should replace this with actual upload to server or cloud storage
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              const logoUrl = reader.result as string;
                              console.log("Logo URL generated:", logoUrl.substring(0, 50) + "...");

                              try {
                                await updateRouter.mutateAsync({ id: router.id, logo_url: logoUrl });
                                console.log("Logo update successful for router:", router.id);
                              } catch (error) {
                                console.error("Failed to update logo for router:", router.id, error);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}