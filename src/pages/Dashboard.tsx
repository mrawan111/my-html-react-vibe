import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const statsData = [
  { name: "السبت", value: 45 },
  { name: "الأحد", value: 52 },
  { name: "الاثنين", value: 48 },
  { name: "الثلاثاء", value: 61 },
  { name: "الأربعاء", value: 55 },
  { name: "الخميس", value: 67 },
  { name: "الجمعة", value: 43 }
];

const tableData = [
  {
    cardNumber: "670864",
    macAddress: "62-25-81-5B-D8-4F",
    startTime: "منذ 29 دقيقة",
    data: "36.79"
  }
];

export default function Dashboard() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">لوحة التحكم</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm mb-1">الرصيد المتاح</div>
            <div className="text-foreground text-3xl font-semibold">0</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm mb-1">إجمالي مبيعات اليوم</div>
            <div className="text-foreground text-3xl font-semibold">20</div>
            <div className="text-muted-foreground text-xs mt-1">كارت واي فاي</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm mb-1">إجمالي مبيعات الأسبوع</div>
            <div className="text-foreground text-3xl font-semibold">331</div>
            <div className="text-muted-foreground text-xs mt-1">كارت واي فاي</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-muted-foreground text-sm mb-1">إجمالي مبيعات الشهر</div>
            <div className="text-foreground text-3xl font-semibold">1,804</div>
            <div className="text-muted-foreground text-xs mt-1">كارت واي فاي</div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Cards Warning */}
      <Card className="bg-accent border-border">
        <CardContent className="p-4 space-y-1">
          <p className="text-sm text-muted-foreground">كروت تنتهي خلال أسبوع</p>
          <p className="text-4xl font-semibold text-foreground">0</p>
          <p className="text-primary font-semibold text-sm">تنتهي قريباً</p>
        </CardContent>
      </Card>

      {/* Active Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">المستخدمون النشطون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-foreground border-separate border-spacing-0">
              <thead className="bg-secondary">
                <tr>
                  <th className="py-2 px-3 text-right rounded-tr-lg">رقم الكارت</th>
                  <th className="py-2 px-3 text-right">عنوان MAC</th>
                  <th className="py-2 px-3 text-right">وقت البدء</th>
                  <th className="py-2 px-3 text-right rounded-tl-lg">البيانات</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="py-2 px-3 text-center">{row.cardNumber}</td>
                    <td className="py-2 px-3 text-center">{row.macAddress}</td>
                    <td className="py-2 px-3 text-center">{row.startTime}</td>
                    <td className="py-2 px-3 text-center">{row.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-3">
            <select 
              aria-label="Select number" 
              className="bg-secondary rounded-md text-foreground text-lg font-semibold px-4 py-1 cursor-pointer border border-border"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Usage Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-center">استخدام الإنترنت الأسبوعي (جيجابايت)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))"
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">تذكرة دعم</p>
            <p className="text-foreground text-3xl font-semibold">0</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">تذاكر مفتوحة</p>
            <p className="text-foreground text-3xl font-semibold">0</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-muted-foreground text-sm">تذاكر تم غلقها</p>
            <p className="text-foreground text-3xl font-semibold">0</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}