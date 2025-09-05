import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSalesStats } from "@/hooks/useSales";
import { useVouchers } from "@/hooks/useVouchers";

export default function Sales() {
  const { data: salesData, isLoading, error } = useSalesStats();
  const { data: vouchers, isLoading: vouchersLoading, error: vouchersError } = useVouchers();

  if (isLoading || vouchersLoading) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">مبيعات الكروت</h1>
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

  if (error || vouchersError) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">مبيعات الكروت</h1>
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

  // Filter vouchers with status 'active' or 'suspended' (used vouchers)
  const usedVouchers = vouchers?.filter(v => v.status === 'active' || v.status === 'suspended') || [];

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">مبيعات الكروت</h1>

      {/* Sales Stats Table */}
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
                {salesData && Array.isArray(salesData) && salesData.length > 0 ? (
                  salesData.map((sale: any, index: number) => (
                    <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                      <td className="py-3 px-2 text-center">{sale.cloudName}</td>
                      <td className="py-3 px-2 text-center">{sale.placeName}</td>
                      <td className="py-3 px-2 text-center">{sale.dailySales}</td>
                      <td className="py-3 px-2 text-center">{sale.weeklySales}</td>
                      <td className="py-3 px-2 text-center">{sale.monthlySales}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      لا توجد مبيعات متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Used Vouchers Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>معاينة الكروت المستخدمة</CardTitle>
          <CardDescription>عرض الكروت التي تم استخدامها أو بيعها</CardDescription>
        </CardHeader>
        <CardContent>
          {usedVouchers.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">لا توجد كروت مستخدمة حالياً</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {usedVouchers.map((voucher) => (
                <div key={voucher.id} className="border rounded p-4 bg-background shadow-sm">
                  <div className="mb-2 font-mono font-bold text-center">{voucher.code}</div>
                  <div className="flex justify-center">
                    <Badge variant={voucher.status === 'active' ? 'default' : 'outline'}>
                      {voucher.status === 'active' ? 'نشط' : 'مباع'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
