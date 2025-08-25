import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const salesData = [
  {
    cloudName: "Frindes_Cafe",
    placeName: "MESHdesk_frindes_cafe_mcp_490",
    dailySales: 2,
    weeklySales: 15,
    monthlySales: 60
  },
  {
    cloudName: "Frindes_Cafe",
    placeName: "Mo_Salah",
    dailySales: 7,
    weeklySales: 40,
    monthlySales: 170
  },
  {
    cloudName: "Frindes_Cafe",
    placeName: "Café_Time",
    dailySales: 5,
    weeklySales: 25,
    monthlySales: 100
  },
  {
    cloudName: "Frindes_Cafe",
    placeName: "Star_Net",
    dailySales: 9,
    weeklySales: 50,
    monthlySales: 210
  }
];

export default function Sales() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">مبيعات الكروت</h1>
      
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-foreground text-sm border-collapse">
              <thead className="bg-secondary">
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 font-semibold">
                    إسم السحابة
                    <ChevronDown className="inline-block mr-1 h-3 w-3" />
                  </th>
                  <th className="pb-2 pr-4 font-semibold">
                    إسم المكان
                    <ChevronDown className="inline-block mr-1 h-3 w-3" />
                  </th>
                  <th className="pb-2 pr-4 font-semibold">
                    مبيعات اليوم
                    <ChevronDown className="inline-block mr-1 h-3 w-3" />
                  </th>
                  <th className="pb-2 pr-4 font-semibold">
                    مبيعات الاسبوع
                    <ChevronDown className="inline-block mr-1 h-3 w-3" />
                  </th>
                  <th className="pb-2 pr-4 font-semibold">
                    مبيعات الشهر
                    <ChevronDown className="inline-block mr-1 h-3 w-3" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                    <td className="py-3 px-2 text-center">{sale.cloudName}</td>
                    <td className="py-3 px-2 text-center">{sale.placeName}</td>
                    <td className="py-3 px-2 text-center">{sale.dailySales}</td>
                    <td className="py-3 px-2 text-center">{sale.weeklySales}</td>
                    <td className="py-3 px-2 text-center">{sale.monthlySales}</td>
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