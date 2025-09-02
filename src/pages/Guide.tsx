import { useState } from "react";
import { Search, ArrowRight, PlayCircle, Wifi, Wallet, Settings, Book, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "getting-started",
    title: "بدء الاستخدام",
    description: "تعرف على كيفية بدء استخدام النظام خطوة بخطوة",
    icon: PlayCircle,
    color: "text-primary"
  },
  {
    id: "wifi-cards",
    title: "كروت الواي فاي",
    description: "إدارة كروت الواي فاي والمبيعات والتقارير",
    icon: Wifi,
    color: "text-success"
  },
  {
    id: "balance",
    title: "إدارة الرصيد",
    description: "كيفية إيداع وسحب الأموال ومتابعة الحركات المالية",
    icon: Wallet,
    color: "text-warning"
  },
  {
    id: "router",
    title: "إعدادات الراوتر",
    description: "تهيئة الراوتر والتأكد من الاتصال الصحيح",
    icon: Settings,
    color: "text-info"
  }
];

const articles = [
  {
    id: "article1",
    title: "كيفية إضافة مستخدم جديد",
    description: "خطوات إضافة مستخدم دائم إلى النظام",
    category: "getting-started",
    content: `
      <h3>خطوات إضافة مستخدم جديد</h3>
      <ol>
        <li>اذهب إلى قسم "المستخدمين الدائمين" من القائمة الجانبية</li>
        <li>اضغط على زر "إضافة مستخدم جديد"</li>
        <li>املأ البيانات المطلوبة (الاسم، البريد الإلكتروني، كلمة المرور)</li>
        <li>حدد صلاحيات المستخدم</li>
        <li>اضغط على "حفظ" لإنشاء المستخدم</li>
      </ol>
    `
  },
  {
    id: "article2",
    title: "طريقة بيع كارت وايرلس",
    description: "كيفية إتمام عملية بيع كارت وايرلس لعميل",
    category: "wifi-cards",
    content: `
      <h3>خطوات بيع كارت وايرلس</h3>
      <ol>
        <li>اذهب إلى قسم "بيانات الكروت"</li>
        <li>اختر الكارت المطلوب بيعه من القائمة</li>
        <li>تأكد من أن الكارت غير مستخدم</li>
        <li>اضغط على "بيع الكارت"</li>
        <li>أدخل بيانات العميل</li>
        <li>اطبع فاتورة البيع</li>
      </ol>
    `
  },
  {
    id: "article3",
    title: "حل مشاكل الاتصال بالراوتر",
    description: "خطوات استكشاف الأخطاء وإصلاحها في اتصال الراوتر",
    category: "router",
    content: `
      <h3>حل مشاكل الاتصال بالراوتر</h3>
      <ol>
        <li>تحقق من اتصال الإنترنت</li>
        <li>تأكد من صحة عنوان IP للراوتر</li>
        <li>تحقق من اسم المستخدم وكلمة المرور</li>
        <li>أعد تشغيل الراوتر</li>
        <li>تحقق من إعدادات الجدار الناري</li>
        <li>استخدم زر "اختبار الاتصال" في إعدادات السيرفر</li>
      </ol>
    `
  }
];

export default function Guide() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryArticles = selectedCategory
    ? articles.filter(article => article.category === selectedCategory)
    : [];

  const currentArticle = selectedArticle
    ? articles.find(article => article.id === selectedArticle)
    : null;

  if (selectedArticle && currentArticle) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedArticle(null)}
            className="flex items-center"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            رجوع
          </Button>
          <Badge variant="outline" className="text-primary border-primary">
            دليل المستخدم
          </Badge>
        </div>

        <Card className="kayantech-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary" />
              {currentArticle.title}
            </CardTitle>
            <CardDescription>{currentArticle.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: currentArticle.content }}
            />
            <div className="mt-6 pt-6 border-t border-border">
              <Button variant="outline">
                طباعة المقال
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            رجوع
          </Button>
          <Badge variant="outline" className="text-primary border-primary">
            دليل المستخدم
          </Badge>
        </div>

        <Card className="kayantech-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {categories.find(cat => cat.id === selectedCategory)?.title}
            </CardTitle>
            <CardDescription>
              {categories.find(cat => cat.id === selectedCategory)?.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryArticles.map((article) => (
                <div
                  key={article.id}
                  className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                  onClick={() => setSelectedArticle(article.id)}
                >
                  <h4 className="font-semibold text-foreground">{article.title}</h4>
                  <p className="text-muted-foreground text-sm mt-1">{article.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground text-2xl font-bold border-b-2 border-primary pb-2 inline-block">دليل المستخدم</h1>
        <Badge variant="outline" className="text-primary border-primary">
          KayanTeck Help Center
        </Badge>
      </div>

      {/* Search Box */}
      <Card className="kayantech-card border-border">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث في الدليل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-input border-border focus:border-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className="kayantech-card border-border cursor-pointer group"
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <IconComponent className={`h-8 w-8 ${category.color}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm">{category.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Search Results or All Articles */}
      <Card className="kayantech-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-primary" />
            {searchTerm ? "نتائج البحث" : "المقالات المتاحة"}
          </CardTitle>
          <CardDescription>
            {searchTerm ? `${filteredArticles.length} نتيجة للبحث "${searchTerm}"` : "جميع المقالات المتاحة"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(searchTerm ? filteredArticles : articles).map((article) => (
              <div
                key={article.id}
                className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedArticle(article.id)}
              >
                <h4 className="font-semibold text-foreground">{article.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{article.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}