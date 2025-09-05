import { Card, CardContent } from "@/components/ui/card";
import { useDailyUsage } from "@/hooks/useDailyStats";

export default function DailyUsage() {
  const { data: usageData, isLoading, error } = useDailyUsage();

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
                {usageData && usageData.length > 0 ? (
                  usageData.map((usage, index) => (
                    <tr key={index} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                      <td className="py-3 px-2">{usage.cloudName}</td>
                      <td className="py-3 px-2">{usage.placeName}</td>
                      <td className="py-3 px-2 text-center">{usage.dailyCards}</td>
                      <td className="py-3 px-2 text-center">{usage.dailyData.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">
                      لا توجد بيانات استهلاك متاحة لليوم
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}