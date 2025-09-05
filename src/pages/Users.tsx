import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/useUsers";

export default function Users() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">المستخدمين الدائمين</h1>
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
        <h1 className="text-foreground text-xl font-bold">المستخدمين الدائمين</h1>
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
      <h1 className="text-foreground text-xl font-bold">المستخدمين الدائمين</h1>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">قائمة بالمستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-foreground text-sm border-collapse">
                <thead className="bg-secondary">
                  <tr>
                    <th className="py-3 px-4 font-semibold">الاسم الكامل</th>
                    <th className="py-3 px-4 font-semibold">الدور</th>
                    <th className="py-3 px-4 font-semibold">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                      <td className="py-3 px-4">{user.full_name || 'غير محدد'}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? 'مدير' : user.role === 'operator' ? 'مشغل' : 'مستخدم'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(user.created_at).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا يوجد مستخدمون دائمون حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}