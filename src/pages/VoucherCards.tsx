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
import { useFiles } from "@/hooks/useFiles";
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
  const { addFile } = useFiles();
  const createVouchersMutation = useCreateVouchers();
  const activateVoucherMutation = useActivateVoucher();
  const sellVoucherMutation = useSellVoucher();
  const deleteVoucherMutation = useDeleteVoucher();
  const updateVoucherStatusMutation = useUpdateVoucherStatus();
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

const exportSelectedVouchersToPDF = async (voucherData?: any[]): Promise<Blob | null> => {
  let vouchersToPrint: any[] = [];

  if (voucherData && voucherData.length > 0) {
    // Use the provided voucher data (for automatic export after generation)
    vouchersToPrint = voucherData;
    console.log("Using provided voucher data:", vouchersToPrint);
  } else {
    // Use the selected vouchers from state (for manual export)
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

    // Get the actual voucher data for the selected IDs
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

    for (const voucher of vouchersToPrint) {
      console.log("Processing voucher:", voucher.code, "with logo URL:", selectedRouterData.logo_url);

      // Create voucher card element
      const tempDiv = document.createElement("div");
      tempDiv.style.width = `${cardWidth}px`;
      tempDiv.style.height = `${cardHeight}px`;
      tempDiv.style.padding = "5px";
      tempDiv.style.display = "flex";
      tempDiv.style.flexDirection = "column";
      tempDiv.style.alignItems = "center";
      tempDiv.style.justifyContent = "center";
      tempDiv.style.backgroundColor = "#1d1d1dff";
      tempDiv.style.border = "1px solid #ddd";
      tempDiv.style.borderRadius = "5px";
      tempDiv.style.fontFamily = "Arial, sans-serif";
      tempDiv.style.fontSize = "10px";
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";

      tempDiv.innerHTML = `
        <img src="${selectedRouterData.logo_url}" style="width: 30px; height: 30px; margin-bottom: 5px;" />
        <div style="font-weight: bold; font-size: 12px; margin-bottom: 3px;">${voucher.code}</div>
        <div style="font-size: 8px; color: #666;">${selectedRouterData.router_name}</div>
      `;

      document.body.appendChild(tempDiv);

      try {
        console.log("Creating canvas for voucher:", voucher.code);
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          backgroundColor: null,
          logging: true,
          useCORS: true,
          allowTaint: true
        });

        console.log("Canvas created successfully for voucher:", voucher.code);
        const imgData = canvas.toDataURL("image/png");
        console.log("Image data created, adding to PDF");
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
      } catch (error) {
        console.error("Error creating canvas for voucher:", voucher.code, error);
        // Try without the image if it fails
        try {
          console.log("Trying to create voucher without image");
          tempDiv.innerHTML = `
            <div style="font-weight: bold; font-size: 12px; margin-bottom: 3px;">${voucher.code}</div>
            <div style="font-size: 8px; color: #020202ff;">${selectedRouterData.router_name}</div>
          `;

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: true
          });

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
          console.log("Voucher added to PDF without image");
        } catch (fallbackError) {
          console.error("Fallback also failed for voucher:", voucher.code, fallbackError);
        }
      } finally {
        document.body.removeChild(tempDiv);
      }
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
    // Fix the duration calculation
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
                  <Label htmlFor="quantity">عدد القسائم</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="100"
                    value={voucherQuantity}
                    onChange={(e) => setVoucherQuantity(parseInt(e.currentTarget.value) || 1)}
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
                  <Label>طريقة الدفع</Label>
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
                    onChange={(e) => setSellNotes(e.currentTarget.value)}
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
  {voucher.remaining_time_minutes
    ? formatRemainingTimeFromMinutes(voucher.remaining_time_minutes)
    : '-'
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
