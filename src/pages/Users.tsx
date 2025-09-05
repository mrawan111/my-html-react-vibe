import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuthUsers, useCreateUser, useUpdateUserRole, useDeleteUser } from "@/hooks/useAuthUsers";
import { useState } from "react";
import { Plus, Edit, Trash2, UserPlus } from "lucide-react";

export default function Users() {
  const { data: users, isLoading, error } = useAuthUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user' as 'admin' | 'operator' | 'user'
  });

  const [editForm, setEditForm] = useState({
    full_name: '',
    role: 'user' as 'admin' | 'operator' | 'user'
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserMutation.mutateAsync(createForm);
      setCreateForm({ email: '', password: '', full_name: '', role: 'user' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: editingUser.id,
        role: editForm.role,
        full_name: editForm.full_name
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      role: user.role
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">إدارة المستخدمين</h1>
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
      <div className="flex-1 px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 overflow-auto">
        <h1 className="text-foreground text-xl font-bold">إدارة المستخدمين</h1>
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
    <div className="flex-1 px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-xl font-bold">إدارة المستخدمين</h1>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات المستخدم الجديد
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="col-span-1 sm:col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    كلمة المرور
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="col-span-1 sm:col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="full_name" className="text-right">
                    الاسم الكامل
                  </Label>
                  <Input
                    id="full_name"
                    value={createForm.full_name}
                    onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                    className="col-span-1 sm:col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    الدور
                  </Label>
                  <Select value={createForm.role} onValueChange={(value: 'admin' | 'operator' | 'user') => setCreateForm({ ...createForm, role: value })}>
                    <SelectTrigger className="col-span-1 sm:col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">مستخدم</SelectItem>
                      <SelectItem value="operator">مشغل</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">قائمة المستخدمين</CardTitle>
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
                    <th className="py-3 px-4 font-semibold">تاريخ التحديث</th>
                    <th className="py-3 px-4 font-semibold">الإجراءات</th>
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
                      <td className="py-3 px-4">
                        {new Date(user.updated_at).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {/* Edit User Dialog */}
                          <Dialog open={isEditDialogOpen && editingUser?.id === user.id} onOpenChange={(open) => {
                            if (!open) {
                              setIsEditDialogOpen(false);
                              setEditingUser(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>تعديل المستخدم</DialogTitle>
                                <DialogDescription>
                                  تعديل بيانات المستخدم
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleUpdateUser}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_full_name" className="text-right">
                                      الاسم الكامل
                                    </Label>
                                    <Input
                                      id="edit_full_name"
                                      value={editForm.full_name}
                                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                      className="col-span-1 sm:col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit_role" className="text-right">
                                      الدور
                                    </Label>
                                    <Select value={editForm.role} onValueChange={(value: 'admin' | 'operator' | 'user') => setEditForm({ ...editForm, role: value })}>
                                      <SelectTrigger className="col-span-1 sm:col-span-3">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">مستخدم</SelectItem>
                                        <SelectItem value="operator">مشغل</SelectItem>
                                        <SelectItem value="admin">مدير</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button type="submit" disabled={updateUserMutation.isPending}>
                                    {updateUserMutation.isPending ? 'جاري التحديث...' : 'تحديث'}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {/* Delete User Alert Dialog */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا يوجد مستخدمون حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
