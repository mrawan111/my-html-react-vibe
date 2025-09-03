import { useState, useRef } from "react";
import { Search, Download, Eye, Edit2, Trash2, Filter, RefreshCw, BarChart3, Printer, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell 
} from "recharts";
import { useVouchers, useVoucherPackages } from "@/hooks/useVouchers";
import { useRouters } from "@/hooks/useRouters";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const chartData = [
  { name: "يومي", value: 45, color: "#ff7700" },
  { name: "أسبوعي", value: 30, color: "#2196F3" },
  { name: "شهري", value: 25, color: "#4CAF50" }
];

const salesStats = [
  { month: "يناير", daily: 45, weekly: 30, monthly: 25 },
  { month: "فبراير", daily: 52, weekly: 35, monthly: 28 },
  { month: "مارس", daily: 48, weekly: 32, monthly: 30 },
  { month: "أبريل", daily: 55, weekly: 38, monthly: 32 }
];

export default function CardData() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRouter, setSelectedRouter] = useState("");
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: routers = [] } = useRouters();
  const { data: vouchers = [] } = useVouchers(selectedRouter);
  const { data: packages = [] } = useVoucherPackages();

  const getStatusBadge = (status: string) => {
    const variants = {
      "active": "bg-success/20 text-success border-success",
      "expired": "bg-destructive/20 text-destructive border-destructive", 
      "unused": "bg-warning/20 text-warning border-warning",
      "used": "bg-info/20 text-info border-info"
    };
    
    const arabicStatus = {
      "active": "نشط",
      "expired": "منتهي",
      "unused": "غير مستخدم", 
      "used": "مستخدم"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-accent/20 text-accent border-accent"}>
        {arabicStatus[status as keyof typeof arabicStatus] || status}
      </Badge>
    );
  };

  const filteredData = vouchers.filter(voucher => {
    const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || voucher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', voucherId);

      if (error) throw error;

      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف القسيمة بنجاح",
      });
      
      // Refresh the vouchers list
      window.location.reload();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف القسيمة",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (!selectedRouter) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار راوتر أولاً",
        variant: "destructive",
      });
      return;
    }
    setShowPrintDialog(true);
  };

  const generatePDF = async () => {
    if (!printRef.current) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`كروت-واي-فاي-${new Date().toISOString().split('T')[0]}.pdf`);
      setShowPrintDialog(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      });
    }
  };

  const printCards = () => {
    window.print();
  };

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold border-b-2 border-primary pb-2 inline-block">بيانات الكروت</h1>
        <Badge variant="outline" className="text-primary border-primary">
          إجمالي: {vouchers.length} كارت
        </Badge>
      </div>

      {/* Router Selection */}
      <Card className="kayantech-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">اختيار الراوتر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الراوتر:</Label>
              <Select value={selectedRouter} onValueChange={setSelectedRouter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="اختر راوتر" />
                </SelectTrigger>
                <SelectContent>
                  {routers.map((router) => (
                    <SelectItem key={router.id} value={router.id}>
                      {router.router_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handlePrint} disabled={!selectedRouter} className="w-full">
                <Printer className="h-4 w-4 mr-2" />
                طباعة الكروت
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      {selectedRouter && (
        <Card className="kayantech-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Search className="h-5 w-5 mr-2 text-primary" />
              بحث وتصفية الكروت
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="card-search">ابحث برقم الكارت:</Label>
                <Input
                  id="card-search"
                  placeholder="أدخل رقم الكارت"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-input border-border focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card-status">الحالة:</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">الكل</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="expired">منتهي</SelectItem>
                    <SelectItem value="unused">غير مستخدم</SelectItem>
                    <SelectItem value="used">مستخدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    بحث
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Charts */}
      {selectedRouter && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="kayantech-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                توزيع أنواع الكروت
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="kayantech-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                إحصائيات المبيعات الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                    />
                    <Bar dataKey="daily" fill="#ff7700" name="يومي" />
                    <Bar dataKey="weekly" fill="#2196F3" name="أسبوعي" />
                    <Bar dataKey="monthly" fill="#4CAF50" name="شهري" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cards Table */}
      {selectedRouter && (
        <Card className="kayantech-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">نتائج البحث</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  تصدير النتائج
                </Button>
              </div>
            </div>
            <CardDescription>
              عرض {filteredData.length} من إجمالي {vouchers.length} كارت
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الكارت</TableHead>
                    <TableHead className="text-right">الحزمة</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">البيانات المتبقية</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((voucher) => {
                    const voucherPackage = packages.find(p => p.id === voucher.package_id);
                    return (
                      <TableRow key={voucher.id} className="hover:bg-accent/50 transition-colors duration-200">
                        <TableCell className="font-mono font-medium">{voucher.code}</TableCell>
                        <TableCell>{voucherPackage?.name || 'غير محدد'}</TableCell>
                        <TableCell>{new Date(voucher.created_at).toLocaleDateString('ar-EG')}</TableCell>
                        <TableCell>{voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString('ar-EG') : '-'}</TableCell>
                        <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                        <TableCell className="font-semibold">30 GB</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="hover:bg-primary/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="hover:bg-info/10">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="hover:bg-destructive/10 text-destructive"
                              onClick={() => handleDeleteVoucher(voucher.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>طباعة كروت الواي فاي</DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-4 mb-4">
            <Button onClick={printCards} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              طباعة
            </Button>
            <Button onClick={generatePDF} variant="outline" className="flex-1">
              <FileDown className="h-4 w-4 mr-2" />
              تصدير PDF
            </Button>
          </div>

          <div ref={printRef} className="print-content bg-white p-8">
            <div className="text-center mb-8">
              <img src="/lovable-uploads/07b7006c-ca9b-4351-9586-0d082ed88656.png" alt="كيان" className="mx-auto w-24 h-24 mb-4" />
              <h1 className="text-2xl font-bold text-black mb-2">كيان</h1>
              <p className="text-lg text-gray-600">لكروت نت الكافيهات</p>
              <p className="text-sm text-gray-500">للتواصل: 01009270752</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {filteredData.slice(0, 8).map((voucher) => {
                const voucherPackage = packages.find(p => p.id === voucher.package_id);
                return (
                  <div key={voucher.id} className="border-2 border-gray-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-orange-50">
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <img src="/lovable-uploads/07b7006c-ca9b-4351-9586-0d082ed88656.png" alt="كيان" className="w-12 h-12" />
                      </div>
                      <h3 className="text-lg font-bold text-black mb-2">كارت واي فاي</h3>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                        <p className="text-sm text-gray-600 mb-1">اسم المستخدم:</p>
                        <p className="text-xl font-mono font-bold text-black">{voucher.code}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-gray-200 mb-3">
                        <p className="text-sm text-gray-600 mb-1">كلمة المرور:</p>
                        <p className="text-xl font-mono font-bold text-black">{voucher.code}</p>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>الحجم: <span className="font-semibold text-black">30 GB</span></p>
                        <p>النوع: <span className="font-semibold text-black">{voucherPackage?.name || 'باقة أساسية'}</span></p>
                        {voucher.expires_at && (
                          <p>تنتهي: <span className="font-semibold text-black">{new Date(voucher.expires_at).toLocaleDateString('ar-EG')}</span></p>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">للتواصل: 01009270752</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media print {
          .print-content {
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}