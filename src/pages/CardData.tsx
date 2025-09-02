import { useState } from "react";
import { Search, Download, Eye, Edit2, Trash2, Filter, RefreshCw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

const cardData = [
  {
    id: "KT-1001",
    type: "يومي",
    password: "123456",
    saleDate: "2024-01-15",
    expiryDate: "2024-01-16",
    status: "منتهي",
    price: 25
  },
  {
    id: "KT-1002", 
    type: "أسبوعي",
    password: "789012",
    saleDate: "2024-01-20",
    expiryDate: "2024-01-27",
    status: "نشط",
    price: 150
  },
  {
    id: "KT-1003",
    type: "شهري",
    password: "345678",
    saleDate: "2024-01-10",
    expiryDate: "2024-02-10",
    status: "نشط",
    price: 450
  },
  {
    id: "KT-1004",
    type: "يومي",
    password: "901234",
    saleDate: "",
    expiryDate: "",
    status: "غير مستخدم",
    price: 25
  }
];

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
  const [typeFilter, setTypeFilter] = useState("");

  const getStatusBadge = (status: string) => {
    const variants = {
      "نشط": "bg-success/20 text-success border-success",
      "منتهي": "bg-destructive/20 text-destructive border-destructive",
      "غير مستخدم": "bg-warning/20 text-warning border-warning"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-accent/20 text-accent border-accent"}>
        {status}
      </Badge>
    );
  };

  const filteredData = cardData.filter(card => {
    const matchesSearch = card.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || card.status === statusFilter;
    const matchesType = !typeFilter || card.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold border-b-2 border-primary pb-2 inline-block">بيانات الكروت</h1>
        <Badge variant="outline" className="text-primary border-primary">
          إجمالي: {cardData.length} كارت
        </Badge>
      </div>

      {/* Search and Filters */}
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
                  <SelectItem value="نشط">نشط</SelectItem>
                  <SelectItem value="منتهي">منتهي</SelectItem>
                  <SelectItem value="غير مستخدم">غير مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="card-type">نوع الكارت:</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">الكل</SelectItem>
                  <SelectItem value="يومي">يومي</SelectItem>
                  <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                  <SelectItem value="شهري">شهري</SelectItem>
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

      {/* Statistics Charts */}
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

      {/* Cards Table */}
      <Card className="kayantech-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">نتائج البحث</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير النتائج
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                طباعة
              </Button>
            </div>
          </div>
          <CardDescription>
            عرض {filteredData.length} من إجمالي {cardData.length} كارت
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الكارت</TableHead>
                  <TableHead className="text-right">نوع الكارت</TableHead>
                  <TableHead className="text-right">كلمة المرور</TableHead>
                  <TableHead className="text-right">تاريخ البيع</TableHead>
                  <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((card) => (
                  <TableRow key={card.id} className="hover:bg-accent/50 transition-colors duration-200">
                    <TableCell className="font-mono font-medium">{card.id}</TableCell>
                    <TableCell>{card.type}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{card.password}</TableCell>
                    <TableCell>{card.saleDate || '-'}</TableCell>
                    <TableCell>{card.expiryDate || '-'}</TableCell>
                    <TableCell>{getStatusBadge(card.status)}</TableCell>
                    <TableCell className="font-semibold">{card.price} جنيه</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-info/10">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="hover:bg-destructive/10 text-destructive">
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
    </div>
  );
}