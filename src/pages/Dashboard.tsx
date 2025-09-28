

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
import { useSalesStats } from "@/hooks/useSales";
import { useUsers} from "@/hooks/useUsers";
import { useWeeklyStats, useMonthlyStats } from "@/hooks/useDailyStats";
import { useActiveUsers, ActiveUser } from "@/hooks/useUsageLogs";
import { SalesStats } from "@/hooks/useSales";
import { useMemo } from "react";


export default function Dashboard() {
  const { data: routers = [] } = useRouters();
  const { data: vouchers = [] } = useVouchers();
  const { data: salesStats = [] } = useSalesStats();
  const { data: weeklyStats = [] } = useWeeklyStats();
  const { data: monthlyStats = [] } = useMonthlyStats();
  const { data: activeUsersData = [] } = useActiveUsers() as { data: ActiveUser[] };

  // Calculate voucher status counts for cardStatusData
  const cardStatusData = useMemo(() => {
    const statusCounts = { active: 0, expired: 0, unused: 0, suspended: 0 };
    vouchers.forEach(v => {
      if (v.status === "active") statusCounts.active++;
      else if (v.status === "expired") statusCounts.expired++;
      else if (v.status === "unused") statusCounts.unused++;
      else if (v.status === "suspended") statusCounts.suspended++;
    });
    return [
      { name: "نشط", value: statusCounts.active, color: "#4CAF50" },
      { name: "منتهي", value: statusCounts.expired, color: "#ff3366" },
      { name: "غير مستخدم", value: statusCounts.unused, color: "#ff7700" },
      { name: "مباع", value: statusCounts.suspended, color: "#8884d8" },
    ];
  }, [vouchers]);

  // Prepare weekly usage data from weeklyStats
  const weeklyUsageData = useMemo(() => {
    return weeklyStats.length > 0 ? weeklyStats : [];
  }, [weeklyStats]);

  // Prepare sales trend data from monthlyStats
  const salesTrendData = useMemo(() => {
    return monthlyStats.length > 0 ? monthlyStats : [];
  }, [monthlyStats]);

  // Calculate dashboard stats dynamically
  const dashboardStats = useMemo(() => {
    // Filter only 'used' vouchers for revenue calculations
    const usedVouchers = vouchers.filter(v => v.status === 'active'|| v.status === 'unused'|| v.status === 'suspended'|| v.status === 'expired');

    // Calculate total revenue from used vouchers
    const totalRevenue = usedVouchers.reduce((sum, voucher) => {
      return sum + (voucher.voucher_packages?.price || 0);
    }, 0);

    // Calculate today's sales from used vouchers created today
    const today = new Date().toDateString();
    const todaySales = usedVouchers.filter(v => new Date(v.created_at).toDateString() === today).length;

    // Active users count
    const activeUsersCount = Users.length;

    // Used vouchers count
    const usedVouchersCount = usedVouchers.length;

    // Monthly sales: total revenue from used vouchers created in the last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const monthlySales = usedVouchers
      .filter(v => new Date(v.created_at) >= lastMonth)
      .reduce((sum, voucher) => sum + (voucher.voucher_packages?.price || 0), 0);

    return {
      balance: totalRevenue,
      todaySales: todaySales,
      activeUsers: activeUsersCount,
      soldVouchers: usedVouchersCount,
      monthlySales: monthlySales,
    };
  }, [vouchers, salesStats]);

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
              </div>
              <div className="p-3 bg-warning/20 rounded-full">
                <BarChart className="h-8 w-8 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="kayantech-card border-border group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-muted-foreground text-sm mb-1">إجمالي الكروت المصدرة</div>
                <div className="text-foreground text-3xl font-semibold">{dashboardStats.soldVouchers}</div>
                <div className="text-success text-xs mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  تم تصديرها
                </div>
              </div>
              <div className="p-3 bg-success/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-success" />
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
              <span className="font-bold text-success">{vouchers.length.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
              <span className="text-sm">متوسط الاستخدام اليومي</span>
              <span className="font-bold text-primary">{weeklyUsageData.length > 0 ? weeklyUsageData.reduce((acc, item) => acc + item.value, 0) / weeklyUsageData.length : 0} GB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
              <span className="text-sm">نسبة الاستخدام</span>
              <span className="font-bold text-info">{weeklyUsageData.length > 0 ? ((weeklyUsageData.reduce((acc, item) => acc + item.value, 0) / (weeklyUsageData.length * 100)) * 100).toFixed(1) : 0}%</span>
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
