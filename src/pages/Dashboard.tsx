import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { TrendingUp, TrendingDown, Users, Wifi, DollarSign, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { useVouchers } from "@/hooks/useVouchers";
import { useRouters } from "@/hooks/useRouters";
import { useMemo } from "react";

const weeklyUsageData = [
  { name: "السبت", value: 45, sales: 12 },
  { name: "الأحد", value: 52, sales: 19 },
  { name: "الاثنين", value: 48, sales: 15 },
  { name: "الثلاثاء", value: 61, sales: 23 },
  { name: "الأربعاء", value: 55, sales: 18 },
  { name: "الخميس", value: 67, sales: 25 },
  { name: "الجمعة", value: 43, sales: 14 }
];

const salesTrendData = [
  { month: "يناير", sales: 150, revenue: 4500 },
  { month: "فبراير", sales: 180, revenue: 5400 },
  { month: "مارس", sales: 220, revenue: 6600 },
  { month: "أبريل", sales: 190, revenue: 5700 },
  { month: "مايو", sales: 240, revenue: 7200 },
  { month: "يونيو", sales: 280, revenue: 8400 }
];

const cardStatusData = [
  { name: "نشط", value: 450, color: "#4CAF50" },
  { name: "منتهي", value: 120, color: "#ff3366" },
  { name: "غير مستخدم", value: 230, color: "#ff7700" }
];

const activeUsersData = [
  {
    cardNumber: "KT-1001",
    macAddress: "62-25-81-5B-D8-4F",
    startTime: "منذ 29 دقيقة",
    data: "36.79",
    status: "نشط"
  },
  {
    cardNumber: "KT-1002", 
    macAddress: "A4-B2-39-7C-1E-8D",
    startTime: "منذ 45 دقيقة",
    data: "128.45",
    status: "نشط"
  },
  {
    cardNumber: "KT-1003",
    macAddress: "F8-32-E4-91-6A-2B", 
    startTime: "منذ ساعة",
    data: "89.23",
    status: "نشط"
  }
];

export default function Dashboard() {
  const { data: routers = [] } = useRouters();
  const { data: vouchers = [] } = useVouchers();

  const dashboardStats = useMemo(() => {
    const activeVouchers = vouchers.filter(v => v.status === 'active').length;
    const totalRevenue = vouchers.filter(v => v.status !== 'unused').length * 30; // Assuming avg 30 per voucher
    const todayVouchers = vouchers.filter(v => {
      const today = new Date().toDateString();
      return new Date(v.created_at).toDateString() === today;
    }).length;
    const monthlyVouchers = vouchers.filter(v => {
      const thisMonth = new Date().getMonth();
      return new Date(v.created_at).getMonth() === thisMonth;
    }).length;

    return {
      balance: totalRevenue,
      todaySales: todayVouchers,
      activeUsers: activeVouchers,
      monthlySales: monthlyVouchers
    };
  }, [vouchers]);

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold border-b-2 border-primary pb-2 inline-block">لوحة التحكم</h1>
        <Badge variant="outline" className="text-primary border-primary">KayanTeck System</Badge>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="kayantech-card border-border group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">الرصيد المتاح</div>
                <div className="text-foreground text-3xl font-semibold">{dashboardStats.balance.toLocaleString()}</div>
                <div className="text-success text-xs mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% من الأمس
                </div>
              </div>
              <div className="p-3 bg-primary/20 rounded-full">
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kayantech-card border-border group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">إجمالي مبيعات اليوم</div>
                <div className="text-foreground text-3xl font-semibold">{dashboardStats.todaySales}</div>
                <div className="text-muted-foreground text-xs mt-1">كارت واي فاي</div>
              </div>
              <div className="p-3 bg-success/20 rounded-full">
                <Wifi className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kayantech-card border-border group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">المستخدمون النشطون</div>
                <div className="text-foreground text-3xl font-semibold">{dashboardStats.activeUsers}</div>
                <div className="text-info text-xs mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  متصل الآن
                </div>
              </div>
              <div className="p-3 bg-info/20 rounded-full">
                <Users className="h-8 w-8 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kayantech-card border-border group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">إجمالي مبيعات الشهر</div>
                <div className="text-foreground text-3xl font-semibold">{dashboardStats.monthlySales}</div>
                <div className="text-warning text-xs mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3.2% من الشهر الماضي
                </div>
              </div>
              <div className="p-3 bg-warning/20 rounded-full">
                <BarChart className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="kayantech-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              اتجاه المبيعات الشهرية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
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
                  <Area 
                    type="monotone"
                    dataKey="sales" 
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card Status Distribution */}
        <Card className="kayantech-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-primary" />
              توزيع حالة الكروت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cardStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cardStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Expiring Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="kayantech-card border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              تنبيهات النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
              <span className="text-sm">كروت تنتهي خلال أسبوع</span>
              <Badge variant="destructive">23 كارت</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
              <span className="text-sm">اتصالات مشبوهة</span>
              <Badge className="bg-warning text-warning-foreground">5 اتصالات</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <span className="text-sm">تحديثات متوفرة</span>
              <Badge className="bg-info text-info-foreground">2 تحديثات</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="kayantech-card border-success/50 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              إحصائيات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <span className="text-sm">إجمالي الكروت المباعة</span>
              <span className="font-bold text-success">1,847</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm">متوسط الاستخدام اليومي</span>
              <span className="font-bold text-primary">67.5 GB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <span className="text-sm">نسبة الاستخدام</span>
              <span className="font-bold text-info">78.9%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Users Table */}
      <Card className="kayantech-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              المستخدمون النشطون
            </CardTitle>
            <Badge variant="outline" className="text-primary border-primary">
              {activeUsersData.length} مستخدم نشط
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-foreground border-separate border-spacing-0">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="py-3 px-4 text-right rounded-tr-lg font-semibold text-primary">رقم الكارت</th>
                  <th className="py-3 px-4 text-right font-semibold text-primary">عنوان MAC</th>
                  <th className="py-3 px-4 text-right font-semibold text-primary">وقت البدء</th>
                  <th className="py-3 px-4 text-right font-semibold text-primary">البيانات (MB)</th>
                  <th className="py-3 px-4 text-right rounded-tl-lg font-semibold text-primary">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {activeUsersData.map((row, index) => (
                  <tr key={index} className="border-b border-border hover:bg-accent/50 transition-colors duration-200">
                    <td className="py-3 px-4 text-center font-mono font-medium">{row.cardNumber}</td>
                    <td className="py-3 px-4 text-center font-mono text-muted-foreground">{row.macAddress}</td>
                    <td className="py-3 px-4 text-center">{row.startTime}</td>
                    <td className="py-3 px-4 text-center font-semibold">{row.data}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className="bg-success/20 text-success border-success">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center py-4">
            <select 
              aria-label="Select number" 
              className="bg-input rounded-lg text-foreground font-semibold px-4 py-2 border border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-all duration-200"
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Usage Chart */}
      <Card className="kayantech-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-center flex items-center justify-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            استخدام الإنترنت والمبيعات الأسبوعية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyUsageData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)"
                  }}
                  formatter={(value, name) => [
                    name === 'value' ? `${value} جيجا` : `${value} كارت`,
                    name === 'value' ? 'الاستخدام' : 'المبيعات'
                  ]}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  name="value"
                />
                <Bar 
                  dataKey="sales" 
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                  name="sales"
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