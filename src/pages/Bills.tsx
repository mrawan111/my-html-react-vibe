import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Bills() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">فواتير الكروت</h1>
      <Button className="bg-primary text-primary-foreground">عمل فاتورة</Button>
      
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد فواتير حالياً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}