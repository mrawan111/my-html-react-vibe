import { useState } from "react";
import { Plus, Download, Eye, Trash2, RefreshCw, DollarSign, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useVouchers, useVoucherPackages, useCreateVouchers, useActivateVoucher, useSellVoucher, useDeleteVoucher, useUpdateVoucherStatus } from "@/hooks/useVouchers";
import { useRouters } from "@/hooks/useRouters";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function VoucherCards() {
  const [selectedRouter, setSelectedRouter] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [voucherQuantity, setVoucherQuantity] = useState<number>(1);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [selectedVoucherForSell, setSelectedVoucherForSell] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [sellNotes, setSellNotes] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucherForDelete, setSelectedVoucherForDelete] = useState<string>("");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedVouchersForPrint, setSelectedVouchersForPrint] = useState<Set<string>>(new Set());
  const [exportDescription, setExportDescription] = useState<string>("");

  const { data: routers } = useRouters();
  const { data: packages } = useVoucherPackages();
  const { data: vouchers, refetch: refetchVouchers } = useVouchers(selectedRouter || undefined);
  const createVouchersMutation = useCreateVouchers();
  const activateVoucherMutation = useActivateVoucher();
  const sellVoucherMutation = useSellVoucher();
  const deleteVoucherMutation = useDeleteVoucher();
  const updateVoucherStatusMutation = useUpdateVoucherStatus();

  const getStatusBadge = (status: string) => {
    const variants = {
      unused: "secondary",
      active: "default",
      expired: "destructive",
      suspended: "outline"
    } as const;

    const labels = {
      unused: "غير مستخدم",
      active: "نشط",
      expired: "منتهي الصلاحية",
      suspended: "مباع"
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

  const handleSellVoucher = async () => {
    if (!selectedVoucherForSell || !paymentMethod) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار طريقة الدفع",
        variant: "destructive"
      });
      return;
    }

    try {
      await sellVoucherMutation.mutateAsync({
        voucherId: selectedVoucherForSell,
        paymentMethod,
        notes: sellNotes
      });
      setIsSellDialogOpen(false);
      setSelectedVoucherForSell("");
      setPaymentMethod("");
      setSellNotes("");
      refetchVouchers();
    } catch (error) {
      console.error("Error selling voucher:", error);
    }
  };

  const openSellDialog = (voucherId: string) => {
    setSelectedVoucherForSell(voucherId);
    setIsSellDialogOpen(true);
  };

  const handleDeleteVoucher = async () => {
    if (!selectedVoucherForDelete) return;

    try {
      await deleteVoucherMutation.mutateAsync(selectedVoucherForDelete);
      setIsDeleteDialogOpen(false);
      setSelectedVoucherForDelete("");
    } catch (error) {
      console.error("Error deleting voucher:", error);
    }
  };

  const openDeleteDialog = (voucherId: string) => {
    setSelectedVoucherForDelete(voucherId);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusToggle = async (voucherId: string, currentStatus: string) => {
    let newStatus: 'unused' | 'suspended';
    if (currentStatus === 'unused') {
      newStatus = 'suspended';
    } else if (currentStatus === 'suspended') {
      newStatus = 'unused';
    } else {
      return;
    }
    try {
      await updateVoucherStatusMutation.mutateAsync({
        voucherId,
        status: newStatus
      });
    } catch (error) {
      console.error("Error updating voucher status:", error);
    }
  };

  const toggleVoucherSelection = (voucherId: string) => {
    setSelectedVouchersForPrint((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(voucherId)) {
        newSet.delete(voucherId);
      } else {
        newSet.add(voucherId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const allVoucherIds = vouchers?.map(v => v.id) || [];
    const allSelected = allVoucherIds.every(id => selectedVouchersForPrint.has(id));

    if (allSelected) {
      setSelectedVouchersForPrint(new Set());
    } else {
      setSelectedVouchersForPrint(new Set(allVoucherIds));
    }
  };



  const removeSelectedVoucher = (voucherId: string) => {
    setSelectedVouchersForPrint(prev => {
      const newSet = new Set(prev);
      newSet.delete(voucherId);
      return newSet;
    });
  };
const exportSelectedVouchersToPDF = async () => {
  if (selectedVouchersForPrint.size === 0) {
    toast({
      title: "خطأ",
      description: "يرجى اختيار قسائم للطباعة",
      variant: "destructive"
    });
    return;
  }

  const selectedRouterData = routers?.find(r => r.id === selectedRouter);
  if (!selectedRouterData?.logo_url) {
    toast({
      title: "خطأ",
      description: "لا يوجد شعار للراوتر المحدد. يرجى رفع شعار للراوتر أولاً",
      variant: "destructive"
    });
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const vouchersToPrint =
      vouchers?.filter(v => selectedVouchersForPrint.has(v.id)) || [];

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // القيم المقترحة للكارت
    const cardWidth = 100;
    const cardHeight = 60;
    const cardMargin = 15;

    let x = 40; // بداية من اليسار
    let y = 40; // بداية من فوق

    toast({
      title: "جاري التصدير",
      description: `يتم الآن تصدير ${vouchersToPrint.length} قسيمة`
    });

    for (const voucher of vouchersToPrint) {
      const tempDiv = document.createElement("div");
      tempDiv.style.width = `${cardWidth}px`;
      tempDiv.style.height = `${cardHeight}px`;
      tempDiv.style.display = "flex";
      tempDiv.style.alignItems = "center";
      tempDiv.style.justifyContent = "center";
      tempDiv.style.flexDirection = "column";
      tempDiv.style.background = "#1f1f1fff";
      tempDiv.style.border = "1px solid #d1d5db";
      tempDiv.style.borderRadius = "5px";
      tempDiv.style.fontFamily = "monospace";
      tempDiv.style.fontSize = "10pt";
      tempDiv.style.fontWeight = "bold";
      tempDiv.style.textAlign = "center";
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";

      tempDiv.innerHTML = `
        <img src="${selectedRouterData.logo_url}" style="width: 40px; height: 40px; margin-bottom: 2pt;" />
        <p style="margin:0; font-size: 10pt;margin-bottom:8px;">${voucher.code}</p>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);

      // تحريك المؤشر للكارت التالي في نفس الصف
      x += cardWidth + cardMargin;

      // لو وصلنا لنهاية الصف → ننزل سطر جديد
      if (x + cardWidth > pageWidth) {
        x = 40;
        y += cardHeight + cardMargin;

        // لو الصفحة خلصت → صفحة جديدة
        if (y + cardHeight > pageHeight) {
          doc.addPage();
          x = 40;
          y = 40;
        }
      }
    }

    doc.save("vouchers.pdf");

    toast({
      title: "تم التصدير بنجاح",
      description: `تم تصدير ${vouchersToPrint.length} قسيمة إلى PDF`
    });
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast({
      title: "خطأ",
      description: "فشل في تصدير الملف. يرجى المحاولة مرة أخرى.",
      variant: "destructive"
    });
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
          
          <div className="flex gap-2">
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={() => setIsExportDialogOpen(true)}>
                  <Download className="h-4 w-4" />
                  تصدير الكروت
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl" dir="rtl">
                <DialogHeader>
                  <DialogTitle>تصدير كروت القسائم</DialogTitle>
                  <DialogDescription>
                    أدخل وصف الكروت المطلوبة
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exportDescription">وصف الكارت</Label>
                    <Input
                      id="exportDescription"
                      value={exportDescription}
                      onChange={(e) => setExportDescription(e.target.value)}
                      placeholder="أدخل وصف الكارت"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>القسائم المحددة ({selectedVouchersForPrint.size})</Label>
                    <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                      {vouchers
                        ?.filter(v => selectedVouchersForPrint.has(v.id))
                        .map(voucher => (
                          <div key={voucher.id} className="flex justify-between items-center py-1">
                            <span className="font-mono">{voucher.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSelectedVoucher(voucher.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-medium mb-2">معاينة الكارت:</h4>
                    <div className="flex gap-4 items-start">
                      {selectedRouter && routers?.find(r => r.id === selectedRouter)?.logo_url && (
                        <div className="w-1/3 border rounded-md overflow-hidden">
                          <img
                            src={routers?.find(r => r.id === selectedRouter)?.logo_url}
                            alt="شعار الراوتر"
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm mb-2">{exportDescription || "وصف الكارت سيظهر هنا"}</p>
                        <div className="bg-background p-2 rounded border">
                          <p className="font-mono text-center text-lg font-bold">
                            {selectedVouchersForPrint.size > 0
                              ? vouchers?.find(v => selectedVouchersForPrint.has(v.id))?.code
                              : "كود القسيمة"
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={exportSelectedVouchersToPDF}
                    className="w-full"
                    disabled={selectedVouchersForPrint.size === 0}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تصدير {selectedVouchersForPrint.size} كارت
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

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

          {/* Sell Voucher Dialog */}
          <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>بيع القسيمة</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل البيع
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">طريقة الدفع</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="mobile_wallet">محفظة إلكترونية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sell-notes">ملاحظات (اختياري)</Label>
                  <Textarea
                    id="sell-notes"
                    placeholder="أدخل أي ملاحظات إضافية..."
                    value={sellNotes}
                    onChange={(e) => setSellNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSellVoucher}
                  className="w-full"
                  disabled={sellVoucherMutation.isPending}
                >
                  {sellVoucherMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      جاري البيع...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 ml-2" />
                      بيع القسيمة
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Voucher Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>حذف القسيمة</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من حذف هذه القسيمة؟ هذا الإجراء لا يمكن التراجع عنه.
                </DialogDescription>
              </DialogHeader>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteVoucher}
                  disabled={deleteVoucherMutation.isPending}
                >
                  {deleteVoucherMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 ml-2" />
                      حذف
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
                    {selectedVouchersForPrint.size > 0 && ` | المحددة: ${selectedVouchersForPrint.size}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchVouchers()}>
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تحديث
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={vouchers?.length > 0 && vouchers.every(v => selectedVouchersForPrint.has(v.id))}
                            onChange={toggleSelectAll}
                            className="ml-2"
                          />
                          <span>تحديد الكل</span>
                        </div>
                      </TableHead>
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
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedVouchersForPrint.has(voucher.id)}
                            onChange={() => toggleVoucherSelection(voucher.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {voucher.code}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={voucher.status === 'suspended'}
                              onChange={() => {
                                if (voucher.status === 'unused' || voucher.status === 'suspended') {
                                  handleStatusToggle(voucher.id, voucher.status);
                                }
                              }}
                              disabled={updateVoucherStatusMutation.isPending || (voucher.status !== 'unused' && voucher.status !== 'suspended')}
                              className="ml-2"
                            />
                            {getStatusBadge(voucher.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {packages?.find(p => p.id === voucher.package_id)?.name || 'باقة'}
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
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openSellDialog(voucher.id)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                              onClick={() => openDeleteDialog(voucher.id)}
                            >
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