import { Card, CardContent } from "@/components/ui/card";
import { useVouchers } from "@/hooks/useVouchers";
import { useVoucherPackages } from "@/hooks/useVouchers";
import { useRouters } from "@/hooks/useRouters";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

interface DailyUsageData {
  cloudName: string;
  placeName: string;
  dailyCards: number;
  dailyData: number;
  usedHours: number;
  packageName: string;
}

export default function DailyUsage() {
  const { data: vouchers, isLoading, error } = useVouchers();
  const { data: packages } = useVoucherPackages();
  const { data: routers } = useRouters();

  const [dailyUsageData, setDailyUsageData] = useState<DailyUsageData[]>([]);
  const [usedHoursData, setUsedHoursData] = useState<{ name: string; usedHours: number }[]>([]);

  // Function to calculate total hours from package duration
  const calculatePackageHours = (pkg: any): number => {
    if (!pkg) return 0;
    
    const hoursFromDays = (pkg.duration_days || 0) * 24;
    const hoursFromHours = pkg.duration_hours || 0;
    const hoursFromMinutes = (pkg.duration_minutes || 0) / 60;
    
    return hoursFromDays + hoursFromHours + hoursFromMinutes;
  };

  useEffect(() => {
    if (!vouchers || !packages || !routers) return;

    // Calculate today's date for filtering - resets every 24 hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group usage by router and package
    const usageMap: Record<string, DailyUsageData> = {};
    const packageHoursMap: Record<string, number> = {};

    vouchers.forEach((voucher) => {
      const router = routers.find(r => r.id === voucher.router_id);
      const pkg = packages.find(p => p.id === voucher.package_id);
      
      if (!router || !pkg) return;

      const routerKey = `${router.router_name}-${pkg.name}`;

      if (!usageMap[routerKey]) {
        usageMap[routerKey] = {
          cloudName: router.cloud_name,
          placeName: router.location || "غير محدد",
          dailyCards: 0,
          dailyData: pkg.data_limit_gb || 0,
          usedHours: calculatePackageHours(pkg),
          packageName: pkg.name
        };
      }

      // Count used vouchers for today
      if (voucher.used_at) {
        const usedDate = new Date(voucher.used_at);
        if (usedDate >= today) {
          usageMap[routerKey].dailyCards++;
        }
      }

      // Track package usage for chart
      if (voucher.used_at) {
        const usedDate = new Date(voucher.used_at);
        if (usedDate >= today) {
          packageHoursMap[pkg.name] = (packageHoursMap[pkg.name] || 0) + calculatePackageHours(pkg);
        }
      }
    });

    setDailyUsageData(Object.values(usageMap));

    // Prepare data for the chart - group by package
    const hoursData = Object.entries(packageHoursMap).map(([name, usedHours]) => ({
      name,
      usedHours: parseFloat(usedHours.toFixed(2))
    }));

    setUsedHoursData(hoursData);

  }, [vouchers, packages, routers]);

  if (isLoading) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold mb-4">الاستهلاك اليومي</h1>
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
        <h1 className="text-foreground text-xl font-bold mb-4">الاستهلاك اليومي</h1>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="text-center py-12">
              <p className="text-destructive">حدث خطأ في تحميل البيانات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold mb-4">الاستهلاك اليومي</h1>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-right text-foreground text-sm border-collapse">
              <thead className="bg-secondary">
                <tr>
                  <th className="py-3 px-2 font-semibold">اسم السحابة</th>
                  <th className="py-3 px-2 font-semibold">اسم المكان</th>
                  <th className="py-3 px-2 font-semibold">الباقة</th>
                  <th className="py-3 px-2 font-semibold">الكروت المستخدمة اليوم</th>
                  <th className="py-3 px-2 font-semibold">ساعات الباقة</th>
                  <th className="py-3 px-2 font-semibold">استهلاك البيانات (جيجابايت)</th>
                </tr>
              </thead>
              <tbody>
                {dailyUsageData.length > 0 ? (
                  dailyUsageData.map((usage, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                      <td className="py-3 px-2">{usage.cloudName}</td>
                      <td className="py-3 px-2">{usage.placeName}</td>
                      <td className="py-3 px-2">{usage.packageName}</td>
                      <td className="py-3 px-2 text-center">{usage.dailyCards}</td>
                      <td className="py-3 px-2 text-center">
                        {usage.usedHours === 1 ? 'ساعة واحدة' : `${usage.usedHours} ساعات`}
                      </td>
                      <td className="py-3 px-2 text-center">{usage.dailyData.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      لا توجد بيانات استهلاك متاحة لليوم
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Chart for used hours by package */}
          {usedHoursData.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-center">ساعات الاستخدام حسب الباقة (اليوم)</h3>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={usedHoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => {
                        if (value === 1) return ['ساعة واحدة', 'الساعات'];
                        return [`${value} ساعات`, 'الساعات'];
                      }}
                      labelFormatter={(label) => `الباقة: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="usedHours" 
                      fill="#8884d8" 
                      name="ساعات الاستخدام"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="text-sm font-medium text-muted-foreground">إجمالي الكروت المستخدمة اليوم</h4>
                <p className="text-2xl font-bold">
                  {dailyUsageData.reduce((sum, item) => sum + item.dailyCards, 0)}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="text-sm font-medium text-muted-foreground">إجمالي ساعات الاستخدام اليوم</h4>
                <p className="text-2xl font-bold">
                  {(() => {
                    const totalHours = dailyUsageData.reduce((sum, item) => sum + (item.usedHours * item.dailyCards), 0);
                    return totalHours === 1 ? 'ساعة واحدة' : `${totalHours.toFixed(0)} ساعات`;
                  })()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <h4 className="text-sm font-medium text-muted-foreground">إجمالي استهلاك البيانات اليوم</h4>
                <p className="text-2xl font-bold">
                  {dailyUsageData.reduce((sum, item) => sum + (item.dailyData * item.dailyCards), 0).toFixed(2)} جيجابايت
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Show message if no data for chart */}
          {usedHoursData.length === 0 && (
            <div className="mt-8 text-center text-muted-foreground">
              <p>لا توجد بيانات للرسم البياني اليوم</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}