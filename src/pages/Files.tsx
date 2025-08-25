import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Download } from "lucide-react";

const filesData = [
  {
    routerNumber: "024",
    quantity: 50,
    remaining: 10,
    fileName: "Frindes_Cafe_20240926_8",
    caption: "ملف اختبار أول",
    expiry: "2024-12-01",
    created: "2024-08-01"
  },
  {
    routerNumber: "025",
    quantity: 100,
    remaining: 25,
    fileName: "Frindes_Cafe_20241010_33",
    caption: "كارت كافيه",
    expiry: "2024-11-15",
    created: "2024-08-05"
  }
];

export default function Files() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-2xl font-bold mb-4">ملفات الكروت</h1>
      
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-foreground text-sm border-collapse">
              <thead className="bg-secondary">
                <tr>
                  <th className="py-3 px-4 font-semibold border-b border-border">رقم الراوتر</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">الكمية</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">المتبقي</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">اسم الملف</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">التسمية التوضيحية</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">تاريخ الانتهاء</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">خيارات</th>
                </tr>
              </thead>
              <tbody>
                {filesData.map((file, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                    <td className="py-3 px-4">{file.routerNumber}</td>
                    <td className="py-3 px-4">{file.quantity}</td>
                    <td className="py-3 px-4">{file.remaining}</td>
                    <td className="py-3 px-4">{file.fileName}</td>
                    <td className="py-3 px-4">{file.caption}</td>
                    <td className="py-3 px-4">{file.expiry}</td>
                    <td className="py-3 px-4">{file.created}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                        >
                          <Download className="h-4 w-4 ml-1" />
                          تحميل
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}