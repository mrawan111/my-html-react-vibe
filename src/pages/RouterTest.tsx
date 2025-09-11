import { RouterTestForm } from "@/components/RouterTestForm";

export default function RouterTest() {
  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">اختبار الاتصال بالراوتر</h1>
      <RouterTestForm />
    </div>
  );
}