import { useState } from "react";
import { Plus, Download, Eye, Trash2, RefreshCw, DollarSign, X, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useVouchers, useVoucherPackages, useCreateVouchers, useActivateVoucher, useSellVoucher, useDeleteVoucher, useUpdateVoucherStatus, useDeleteAllVouchers } from "@/hooks/useVouchers-enhanced";
import { useRouters } from "@/hooks/useRouters";
import { useFiles } from "@/hooks/useFiles";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);

  const { data: routers } = useRouters();
  const { data: packages } = useVoucherPackages();
  const { data: vouchers, refetch: refetchVouchers } = useVouchers(selectedRouter || undefined);
  const { addFile } = useFiles();
  const createVouchersMutation = useCreateVouchers();
  const activateVoucherMutation = useActivateVoucher();
  const sellVoucherMutation = useSellVoucher();
  const deleteVoucherMutation = useDeleteVoucher();
  const updateVoucherStatusMutation = useUpdateVoucherStatus();
  const deleteAllVouchersMutation = useDeleteAllVouchers();

  // Helper function to format remaining time
  function formatRemainingTimeFromMinutes(totalMinutes: number): string {
    if (totalMinutes <= 0) return "منتهي";

    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const parts = [];
    if (days > 0) parts.push(`${days} يوم`);
    if (hours > 0) parts.push(`${hours} ساعة`);
    if (minutes > 0) parts.push(`${minutes} دقيقة`);

    return parts.join(' و ');
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      unused: "secondary",
      active: "default",
      expired: "destructive",
      suspended: "outline",
      used: "default"
    } as const;

    const labels = {
      unused: "غير مستخدم",
      active: "نشط",
      expired: "منتهي الصلاحية",
      suspended: "مباع",
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

    if (voucherQuantity > 1000) {
      toast({
        title: "خطأ",
        description: "لا يمكن إنشاء أكثر من 1000 قسيمة في المرة الواحدة",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Create the vouchers and get the returned data directly
      const newVouchersData = await createVouchersMutation.mutateAsync({
        packageId: selectedPackage,
        routerId: selectedRouter,
        quantity: voucherQuantity
      });

      console.log("New vouchers created:", newVouchersData);

      if (newVouchersData && newVouchersData.length > 0) {
        // Select the new vouchers for printing using the returned data
        const newVoucherIds = new Set(newVouchersData.map(v => v.id));
        setSelectedVouchersForPrint(newVoucherIds);

        // Export immediately with the voucher data
        console.log("Starting PDF export for", newVouchersData.length, "vouchers");
        const pdfBlob = await exportSelectedVouchersToPDF(newVouchersData);

        if (pdfBlob) {
          console.log("PDF created successfully, saving to files");
          const selectedRouterData = routers?.find(r => r.id === selectedRouter);
          const fileName = `vouchers_${selectedRouterData?.router_name || 'router'}_${new Date().toISOString().split('T')[0]}_${newVouchersData.length}`;

          addFile({
            routerNumber: selectedRouterData?.router_name || selectedRouter,
            quantity: newVouchersData.length,
            remaining: newVouchersData.length,
            fileName,
            caption: "قسائم مولدة تلقائياً",
            expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            pdfBlob
          });

          toast({
            title: "تم التصدير التلقائي",
            description: `تم تصدير ${newVouchersData.length} قسيمة جديدة وحفظها في الملفات`
          });

          // Clear selection after export
          setSelectedVouchersForPrint(new Set());
        } else {
          console.error("PDF export failed");
        }
      } else {
        console.log("No new vouchers data returned");
      }

      setIsGenerateDialogOpen(false);
    } catch (error) {
      console.error("Error generating vouchers:", error);
      toast({
        title: "خطأ",
        description: "فشل في توليد القسائم",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
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

  const handleDeleteAllVouchers = async () => {
    try {
      await deleteAllVouchersMutation.mutateAsync(selectedRouter || undefined);
      setIsDeleteAllDialogOpen(false);
      setSelectedVouchersForPrint(new Set());
      refetchVouchers();
    } catch (error) {
      console.error("Error deleting all vouchers:", error);
    }
  };

  const handleStatusToggle = async (voucherId: string, currentStatus: string) => {
    let newStatus: 'unused' | 'used' | 'suspended';
    if (currentStatus === 'unused') {
      newStatus = 'used';
    } else if (currentStatus === 'used') {
      newStatus = 'unused';
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

  // Optimized PDF export function with direct canvas API
  const exportSelectedVouchersToPDF = async (voucherData?: any[]): Promise<Blob | null> => {
    let vouchersToPrint: any[] = [];

    if (voucherData && voucherData.length > 0) {
      vouchersToPrint = voucherData;
      console.log("Using provided voucher data:", vouchersToPrint);
    } else {
      const selectedVoucherIds = Array.from(selectedVouchersForPrint);
      console.log("Selected voucher IDs:", selectedVoucherIds);

      if (selectedVoucherIds.length === 0) {
        console.error("No vouchers selected for export");
        toast({
          title: "خطأ",
          description: "يرجى اختيار قسائم للطباعة",
          variant: "destructive"
        });
        return null;
      }

      vouchersToPrint = vouchers?.filter(v => selectedVouchersForPrint.has(v.id)) || [];
      console.log("Vouchers to print from state:", vouchersToPrint);

      if (vouchersToPrint.length === 0) {
        console.error("No vouchers found in state for selected IDs");
        toast({
          title: "خطأ",
          description: "لا توجد قسائم متاحة للتصدير",
          variant: "destructive"
        });
        return null;
      }
    }

    const selectedRouterData = routers?.find(r => r.id === selectedRouter);
    console.log("Selected router data:", selectedRouterData);

    if (!selectedRouterData?.logo_url) {
      console.error("No logo URL found for router:", selectedRouter);
      toast({
        title: "خطأ",
        description: "لا يوجد شعار للراوتر المحدد. يرجى رفع شعار للراوتر أولاً",
        variant: "destructive"
      });
      return null;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Card dimensions and spacing
      const cardWidth = 100;
      const cardHeight = 60;
      const cardMargin = 15;

      let x = 40;
      let y = 40;

      // Process vouchers in batches for better performance
      const batchSize = 50;
      for (let batchStart = 0; batchStart < vouchersToPrint.length; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, vouchersToPrint.length);
        const batch = vouchersToPrint.slice(batchStart, batchEnd);

        console.log(`Processing batch ${Math.floor(batchStart / batchSize) + 1}/${Math.ceil(vouchersToPrint.length / batchSize)}`);

        for (const voucher of batch) {
          console.log("Processing voucher:", voucher.code, "with logo URL:", selectedRouterData.logo_url);

          // Create voucher card using direct canvas API
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error("Could not get canvas context");
            continue;
          }

          canvas.width = cardWidth * 2; // Higher resolution
          canvas.height = cardHeight * 2;

          // Set background
          ctx.fillStyle = '#1d1d1dff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Load and draw logo
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = selectedRouterData.logo_url;
            });

            // Draw logo
            const logoSize = 60;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = 20;
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          } catch (error) {
            console.warn("Could not load logo, continuing without it:", error);
          }

          // Draw voucher code
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(voucher.code, canvas.width / 2, canvas.height - 30);

          // Draw router name
          ctx.font = '16px Arial';
          ctx.fillStyle = '#cccccc';
          ctx.fillText(selectedRouterData.router_name, canvas.width / 2, canvas.height - 10);

          // Convert canvas to image and add to PDF
          const imgData = canvas.toDataURL("image/png");
          doc.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);

          // Move to next position
          x += cardWidth + cardMargin;
          if (x + cardWidth > pageWidth) {
            x = 40;
            y += cardHeight + cardMargin;
            if (y + cardHeight > pageHeight) {
              doc.addPage();
              x = 40;
              y = 40;
            }
          }
          console.log("Voucher added to PDF successfully");
        }

        // Update progress
        const progress = ((batchStart + batch.length) / vouchersToPrint.length) * 100;
        setGenerationProgress(progress);
      }

      // Return the PDF as a blob
      const pdfBlob = doc.output('blob');
      return pdfBlob;
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "خطأ",
        description: "فشل في تصدير الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleExportAndSave = async () => {
    const pdfBlob = await exportSelectedVouchersToPDF();
    if (pdfBlob) {
      const selectedRouterData = routers?.find(r => r.id === selectedRouter);
      const fileName = `vouchers_${selectedRouterData?.router_name || 'router'}_${new Date().toISOString().split('T')[0]}_${selectedVouchersForPrint.size}`;

      addFile({
        routerNumber: selectedRouterData?.router_name || selectedRouter,
        quantity: selectedVouchersForPrint.size,
        remaining: selectedVouchersForPrint.size,
        fileName,
        caption: exportDescription || "ملف قسائم",
        expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        pdfBlob
      });

      setIsExportDialogOpen(false);
      setSelectedVouchersForPrint(new Set());
      setExportDescription("");

      toast({
        title: "تم الحفظ",
        description: `تم حفظ ${selectedVouchersForPrint.size} قسيمة في الملفات`
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
                    onChange={(e) => setExportDescription(e.currentTarget.value)}
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
                    onClick={handleExportAndSave}
                    className="w-full"
                    disabled={selectedVouchersForPrint.size === 0}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تصدير وحفظ {selectedVouchersForPrint.size} كارت
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
                  <Label>الراوتر</Label>
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
                  <Label>الباقة</Label>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الباقة" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages
                        ?.filter((pkg) =>
                          [
                            "0695e968-ae70-4a23-a86a-eec7ef07af0e",
                            "5b396187-1dde-48ca-bf99-b72acaa7ec87",
                            "6b7407e5-43d9-4fd1-a286-6534e939abf8",
                            "943e4eed-53c5-48e3-9734-e7fcfcbe253c"
                          ].includes(pkg.id)
                        )
                        .map((pkg) => {
                          let durationText = '';
                          if (pkg.duration_days) {
                            durationText = `${pkg.duration_days} يوم`;
                          } else if (pkg.duration_hours) {
                            durationText = `${pkg.duration_hours} ساعة`;
                          } else if (pkg.duration_minutes) {
                            durationText = `${pkg.duration_minutes} دقيقة`;
                          } else {
                            durationText = 'غير محدد';
                          }

                          const dataText = pkg.data_limit_gb
                            ? `${pkg.data_limit_gb} جيجا`
                            : 'غير محدود';

                          return (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{pkg.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {pkg.price} جنيه • {dataText} • {durationText}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  </div>

                  <div className="space-y-2">
                  <Label htmlFor="quantity">عدد القسائم (1-1000)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="1000"
                    value={voucherQuantity}
                    onChange={(e) => setVoucherQuantity(parseInt(e.currentTarget.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground">
                    {voucherQuantity > 50 ? "سيتم استخدام الوضع المجمع للأداء الأفضل" : "سيتم إنشاء القسائم بشكل فردي"}
                  </p>
                  </div>

                  {isGenerating && (
                    <div className="space-y-2">
                      <Label>التقدم</Label>
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        جاري إنشاء القسائم... {Math.round(generationProgress)}%
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateVouchers}
                    className="w-full"
                    disabled={createVouchersMutation.isPending || isGenerating}
                  >
                    {createVouchersMutation.isPending || isGenerating ? (
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
        </div>

        {/* Router Selection */}
        <Card>
          <CardHeader>
            <CardTitle>اختيار الراوتر</CardTitle>
            <CardDescription>اختر الراوتر لعرض قسائمه</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Vouchers Table */}
        {selectedRouter && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>قسائم الراوتر</CardTitle>
                  <CardDescription>
                    {vouchers?.length || 0} قسيمة متاحة
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                  >
                    {vouchers?.every(v => selectedVouchersForPrint.has(v.id)) ? "إلغاء تحديد الكل" : "تحديد الكل"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportDialogOpen(true)}
                    disabled={selectedVouchersForPrint.size === 0}
                  >
                    <Download className="h-4 w-4 ml-2" />
                    تصدير ({selectedVouchersForPrint.size})
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                    disabled={!vouchers || vouchers.length === 0}
                  >
                    <Trash className="h-4 w-4 ml-2" />
                    حذف الكل
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={vouchers?.every(v => selectedVouchersForPrint.has(v.id)) || false}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>كود القسيمة</TableHead>
                    <TableHead>الباقة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الوقت المتبقي</TableHead>
                    <TableHead>البيانات المتبقية</TableHead>
                    <TableHead>الإجراءات</TableHead>
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
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {voucher.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{voucher.voucher_packages.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {voucher.voucher_packages.price} جنيه
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(voucher.status)}
                      </TableCell>
                      <TableCell>
                        {voucher.remaining_time_minutes
                          ? formatRemainingTimeFromMinutes(voucher.remaining_time_minutes)
                          : "غير محدود"
                        }
                      </TableCell>
                      <TableCell>
                        {voucher.remaining_data_gb
                          ? `${voucher.remaining_data_gb} جيجا`
                          : "غير محدود"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {voucher.status === 'unused' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActivateVoucher(voucher.id, 'user-mac')}
                            >
                              تفعيل
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openSellDialog(voucher.id)}
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(voucher.id, voucher.status)}
                          >
                            {voucher.status === 'unused' ? 'تعليق' : 'إعادة تفعيل'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
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
            </CardContent>
          </Card>
        )}

        {/* Sell Dialog */}
        <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>بيع القسيمة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل عملية البيع
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقداً</SelectItem>
                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
                    <SelectItem value="transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="vodafone_cash">فودافون كاش</SelectItem>
                    <SelectItem value="etisalat_cash">اتصالات كاش</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellNotes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="sellNotes"
                  value={sellNotes}
                  onChange={(e) => setSellNotes(e.currentTarget.value)}
                  placeholder="أدخل أي ملاحظات إضافية"
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
                    تأكيد البيع
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
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

        {/* Delete All Dialog */}
        <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>حذف جميع القسائم</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من حذف جميع القسائم؟ هذا الإجراء لا يمكن التراجع عنه.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteAllDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllVouchers}
                disabled={deleteAllVouchersMutation.isPending}
              >
                {deleteAllVouchersMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4
