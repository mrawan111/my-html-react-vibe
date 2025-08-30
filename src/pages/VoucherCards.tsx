import { useState } from "react";
import { Plus, Download, Eye, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useVouchers, useVoucherPackages, useCreateVouchers, useActivateVoucher } from "@/hooks/useVouchers";
import { useRouters } from "@/hooks/useRouters";
import { toast } from "@/hooks/use-toast";

export default function VoucherCards() {
  const [selectedRouter, setSelectedRouter] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [voucherQuantity, setVoucherQuantity] = useState<number>(1);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

  const { data: routers } = useRouters();
  const { data: packages } = useVoucherPackages();
  const { data: vouchers, refetch: refetchVouchers } = useVouchers(selectedRouter || undefined);
  const createVouchersMutation = useCreateVouchers();
  const activateVoucherMutation = useActivateVoucher();

  const getStatusBadge = (status: string) => {
    const variants = {
      unused: "secondary",
      active: "default",
      expired: "destructive",
      used: "outline"
    } as const;
    
    const labels = {
      unused: "غير مستخدم",
      active: "نشط",
      expired: "منتهي الصلاحية",
      used: "مستخدم"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleGenerateVouchers = async () => {
    if (!selectedRouter || !selectedPackage) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الراوتر والباقة",
        variant: "destructive"
      });
      return;
    }

    try {
      await createVouchersMutation.mutateAsync({
        packageId: selectedPackage,
        routerId: selectedRouter,
        quantity: voucherQuantity
      });
      setIsGenerateDialogOpen(false);
      refetchVouchers();
    } catch (error) {
      console.error("Error generating vouchers:", error);
    }
  };

  const handleActivateVoucher = async (voucherId: string, userMac: string) => {
    if (!selectedRouter) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الراوتر",
        variant: "destructive"
      });
      return;
    }

    try {
      await activateVoucherMutation.mutateAsync({
        voucherId,
        routerId: selectedRouter,
        userMac
      });
      refetchVouchers();
    } catch (error) {
      console.error("Error activating voucher:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">بيانات الكروت</h1>
            <p className="text-muted-foreground">إدارة وتوليد قسائم الواي فاي</p>
          </div>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                توليد قسائم جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>توليد قسائم جديدة</DialogTitle>
                <DialogDescription>
                  اختر الراوتر والباقة وعدد القسائم المطلوبة
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="router">الراوتر</Label>
                  <Select value={selectedRouter} onValueChange={setSelectedRouter}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الراوتر" />
                    </SelectTrigger>
                    <SelectContent>
                      {routers?.map((router) => (
                        <SelectItem key={router.id} value={router.id}>
                          {router.router_name} ({router.cloud_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">الباقة</Label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages?.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - {pkg.price} جنيه
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">عدد القسائم</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={voucherQuantity}
                    onChange={(e) => setVoucherQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <Button 
                  onClick={handleGenerateVouchers} 
                  className="w-full"
                  disabled={createVouchersMutation.isPending}
                >
                  {createVouchersMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      جاري التوليد...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 ml-2" />
                      توليد القسائم
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Router Selection */}
        <Card>
          <CardHeader>
            <CardTitle>اختر الراوتر</CardTitle>
            <CardDescription>اختر الراوتر لعرض قسائمه</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedRouter} onValueChange={setSelectedRouter}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="اختر الراوتر" />
              </SelectTrigger>
              <SelectContent>
                {routers?.map((router) => (
                  <SelectItem key={router.id} value={router.id}>
                    {router.router_name} ({router.cloud_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Vouchers Table */}
        {selectedRouter && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>قسائم الواي فاي</CardTitle>
                  <CardDescription>
                    إجمالي القسائم: {vouchers?.length || 0}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchVouchers()}>
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تحديث
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 ml-2" />
                    تصدير
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">كود القسيمة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الباقة</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">تاريخ الاستخدام</TableHead>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">الوقت المتبقي</TableHead>
                      <TableHead className="text-right">البيانات المتبقية</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vouchers?.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono font-medium">
                          {voucher.code}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(voucher.status)}
                        </TableCell>
                        <TableCell>
                          {/* You can join with package data here */}
                          باقة
                        </TableCell>
                        <TableCell>
                          {new Date(voucher.created_at).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>
                          {voucher.used_at ? 
                            new Date(voucher.used_at).toLocaleDateString('ar-EG') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {voucher.used_by || '-'}
                        </TableCell>
                        <TableCell>
                          {voucher.remaining_time_minutes ? 
                            `${voucher.remaining_time_minutes} دقيقة` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {voucher.remaining_data_gb ? 
                            `${voucher.remaining_data_gb} جيجا` : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {voucher.status === 'unused' && (
                              <Button variant="outline" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}