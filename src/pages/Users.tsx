import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Users() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">المستخدمين الدائمين</h1>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">قائمة بالمستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا يوجد مستخدمون دائمون حالياً</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}