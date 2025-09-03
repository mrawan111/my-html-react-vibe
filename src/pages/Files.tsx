import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash2 } from "lucide-react";
import { useFiles } from "@/hooks/useFiles";
import { toast } from "@/hooks/use-toast";

export default function Files() {
  const { files, removeFile } = useFiles();

  const handleDownload = (file: any) => {
    if (file.pdfBlob) {
      const url = URL.createObjectURL(file.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (file.pdfUrl) {
      const a = document.createElement('a');
      a.href = file.pdfUrl;
      a.download = `${file.fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      toast({
        title: "خطأ",
        description: "لا يمكن العثور على ملف PDF",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (fileId: string) => {
    removeFile(fileId);
    toast({
      title: "تم الحذف",
      description: "تم حذف الملف بنجاح"
    });
  };

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-2xl font-bold mb-4">ملفات الكروت</h1>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-foreground text-sm border-collapse">
              <thead className="bg-secondary">
                <tr>
                  <th className="py-3 px-4 font-semibold border-b border-border">رقم الراوتر</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">الكمية</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">المتبقي</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">اسم الملف</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">التسمية التوضيحية</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">تاريخ الانتهاء</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 font-semibold border-b border-border">خيارات</th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      لا توجد ملفات متاحة
                    </td>
                  </tr>
                ) : (
                  files.map((file, index) => (
                    <tr key={file.id} className={`${index % 2 === 0 ? 'bg-accent/50' : 'bg-card'} hover:bg-accent transition-colors`}>
                      <td className="py-3 px-4">{file.routerNumber}</td>
                      <td className="py-3 px-4">{file.quantity}</td>
                      <td className="py-3 px-4">{file.remaining}</td>
                      <td className="py-3 px-4">{file.fileName}</td>
                      <td className="py-3 px-4">{file.caption}</td>
                      <td className="py-3 px-4">{file.expiry}</td>
                      <td className="py-3 px-4">{file.created}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 ml-1" />
                            تعديل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4 ml-1" />
                            تحميل
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                            onClick={() => handleDelete(file.id)}
                          >
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
