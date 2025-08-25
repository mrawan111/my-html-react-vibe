import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Users,
  File,
  ShoppingCart,
  Router,
  Receipt,
  CreditCard,
  BarChart3,
  Monitor,
  HelpCircle,
  ChevronDown,
  Bell,
  Wifi
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  { title: "لوحة التحكم", url: "/dashboard", icon: Home },
  { title: "سجل الرصيد", url: "/balance", icon: FileText },
];

const wifiCardItems = [
  { title: "المستخدمين الدائمين", url: "/users", icon: Users },
  { title: "ملفات الكروت", url: "/files", icon: File },
  { title: "مبيعات الكروت", url: "/sales", icon: ShoppingCart },
  { title: "بيانات الراوتر", url: "/routers", icon: Router },
  { title: "فواتير الكروت", url: "/bills", icon: Receipt },
  { title: "بيانات الكروت", url: "/cards", icon: CreditCard },
  { title: "الاستهلاك اليومي", url: "/daily-usage", icon: BarChart3 },
];

const softwareItems = [
  { title: "قائمة البرامج", url: "/apps", icon: Monitor },
];

const supportItems = [
  { title: "الشروحات", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const [openSections, setOpenSections] = useState({
    wifi: true,
    software: false,
    support: false,
  });

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/20 text-primary border-r-4 border-primary" : "hover:bg-accent/50 text-muted-foreground hover:text-foreground";

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-l border-border bg-sidebar transition-all duration-300`}>
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {!collapsed && (
              <>
                <Wifi className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-foreground">eTechValley</span>
              </>
            )}
            {collapsed && <Wifi className="h-6 w-6 text-primary mx-auto" />}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {/* Main Menu Items */}
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink to={item.url} className={getNavCls}>
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span className="mr-3">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* WiFi Cards Section */}
        <SidebarGroup>
          <Collapsible open={openSections.wifi} onOpenChange={() => toggleSection('wifi')}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                <div className="flex items-center">
                  <Wifi className="h-5 w-5" />
                  {!collapsed && <span className="mr-3">كروت الواي فاي</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.wifi ? 'rotate-180' : ''}`} />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              <SidebarMenu>
                {wifiCardItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={`${getNavCls} ${collapsed ? 'justify-center' : 'pr-8'}`}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="mr-3 text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Software Services Section */}
        <SidebarGroup>
          <Collapsible open={openSections.software} onOpenChange={() => toggleSection('software')}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                <div className="flex items-center">
                  <Monitor className="h-5 w-5" />
                  {!collapsed && <span className="mr-3">خدمات البرامج</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.software ? 'rotate-180' : ''}`} />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              <SidebarMenu>
                {softwareItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={`${getNavCls} ${collapsed ? 'justify-center' : 'pr-8'}`}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="mr-3 text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Technical Support Section */}
        <SidebarGroup>
          <Collapsible open={openSections.support} onOpenChange={() => toggleSection('support')}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between hover:bg-accent/50">
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5" />
                  {!collapsed && <span className="mr-3">الدعم الفني</span>}
                </div>
                {!collapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${openSections.support ? 'rotate-180' : ''}`} />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              <SidebarMenu>
                {supportItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={`${getNavCls} ${collapsed ? 'justify-center' : 'pr-8'}`}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="mr-3 text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}