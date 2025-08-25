import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const usageData = [
  {
    cloudName: "Frindes_Cafe",
    placeName: "MESHdesk_frindes_cafe_mcp_490",
    dailyCards: 12,
    dailyData: 3.5
  },
  {
    cloudName: "Frindes_Cafe",
    placeName: "Mo_Salah",
    dailyCards: 7,
    dailyData: 2.1
  },
  {
    cloudName: "Frindes_Cafe",
    placeName: "Café_Time",
    dailyCards: 5,
    dailyData: 1.8
  }
];

export default function DailyUsage() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold mb-4">الاستهلاك اليومي</h1>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-foreground text-sm border-collapse">
              <thead className="bg-secondary">
                <tr>
                  <th className="py-3 px-2 font-semibold">اسم السحابة</th>
                  <th className="py-3 px-2 font-semibold">اسم المكان</th>
                  <th className="py-3 px-2 font-semibold">استهلاك اليوم للكروت</th>
                  <th className="py-3 px-2 font-semibold">استهلاك اليوم للنت (جيجابايت)</th>
                </tr>
              </thead>
              <tbody>
                {usageData.map((usage, index) => (
                  <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                    <td className="py-3 px-2">{usage.cloudName}</td>
                    <td className="py-3 px-2">{usage.placeName}</td>
                    <td className="py-3 px-2 text-center">{usage.dailyCards}</td>
                    <td className="py-3 px-2 text-center">{usage.dailyData}</td>
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