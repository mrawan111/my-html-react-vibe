import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const routersData = [
  { cloudName: "Frindes_Cafe", routerName: "MokaCafe", identifier: "mcp_125", lastContact: "12/08/2025", ip: "192.168.1.1" },
  { cloudName: "Frindes_Cafe", routerName: "Iop", identifier: "mcp_189", lastContact: "13/08/2025", ip: "192.168.1.2" },
  { cloudName: "Frindes_Cafe", routerName: "AboAdham_Cafe", identifier: "mcp_117", lastContact: "14/08/2025", ip: "192.168.1.3" },
];

export default function Routers() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">بيانات الراوتر</h1>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="relative">
            <Input type="search" placeholder="بحث" className="w-full" />
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-center text-foreground text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="py-3 px-2">اسم السحابة</th>
                <th className="py-3 px-2">إسم الراوتر</th>
                <th className="py-3 px-2">الإسم التعريفي</th>
                <th className="py-3 px-2">اخر الاتصال</th>
                <th className="py-3 px-2">العنوان الالكترونى</th>
                <th className="py-3 px-2">تعديل</th>
              </tr>
            </thead>
            <tbody>
              {routersData.map((router, index) => (
                <tr key={index} className="border-b border-border">
                  <td className="py-4 px-2">{router.cloudName}</td>
                  <td className="py-4 px-2">{router.routerName}</td>
                  <td className="py-4 px-2">{router.identifier}</td>
                  <td className="py-4 px-2">{router.lastContact}</td>
                  <td className="py-4 px-2">{router.ip}</td>
                  <td className="py-4 px-2">
                    <Button variant="outline" size="sm" className="text-primary">تعديل</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}