import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouters } from "@/hooks/useRouters";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Routers() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: routers = [], isLoading, error } = useRouters();

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
      <h1 className="text-foreground text-xl font-bold">بيانات الراوتر</h1>
      
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
                <th className="py-3 px-2">اسم السحابة</th>
                <th className="py-3 px-2">إسم الراوتر</th>
                <th className="py-3 px-2">الإسم التعريفي</th>
                <th className="py-3 px-2">الحالة</th>
                <th className="py-3 px-2">اخر الاتصال</th>
                <th className="py-3 px-2">العنوان الالكترونى</th>
                <th className="py-3 px-2">تعديل</th>
              </tr>
            </thead>
            <tbody>
              {filteredRouters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    لا توجد راوترات
                  </td>
                </tr>
              ) : (
                filteredRouters.map((router) => (
                  <tr key={router.id} className="border-b border-border">
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
                      {router.last_contact 
                        ? format(new Date(router.last_contact), "PPp", { locale: ar })
                        : "لا يوجد"
                      }
                    </td>
                    <td className="py-4 px-2">{router.ip_address || "لا يوجد"}</td>
                    <td className="py-4 px-2">
                      <Button variant="outline" size="sm" className="text-primary">تعديل</Button>
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