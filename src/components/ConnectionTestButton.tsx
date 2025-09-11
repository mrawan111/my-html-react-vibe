import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTestRouterConnection } from "@/hooks/useRouters";
import { Router } from "@/hooks/useRouters";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionTestButtonProps {
  router: Router;
}

export const ConnectionTestButton = ({ router }: ConnectionTestButtonProps) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const testConnection = useTestRouterConnection();

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      await testConnection.mutateAsync(router);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusBadge = () => {
    switch (router.status) {
      case 'online':
        return (
          <Badge variant="default" className="bg-green-500 text-white">
            <Wifi className="w-3 h-3 mr-1" />
            متصل
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="secondary" className="bg-red-500 text-white">
            <WifiOff className="w-3 h-3 mr-1" />
            غير متصل
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge variant="outline" className="bg-yellow-500 text-white">
            صيانة
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            غير معروف
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge()}
      <Button
        onClick={handleTestConnection}
        disabled={isTestingConnection || !router.ip_address}
        size="sm"
        variant="outline"
      >
        {isTestingConnection ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <Wifi className="w-4 h-4 mr-1" />
        )}
        {isTestingConnection ? "جاري الاختبار..." : "اختبار الاتصال"}
      </Button>
    </div>
  );
};