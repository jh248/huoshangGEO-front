/**
 * [INPUT]: 依赖 react-router-dom NavLink/Link，lucide 图标，ui/ScrollArea + Tooltip + Button，lib/utils cn
 * [OUTPUT]: 默认导出 DashboardSidebar — 左侧导航树 (按权限过滤)，可拖拽调宽 / 收起为图标轨
 * [POS]: components/layout DashboardLayout 左列消费 · 与 DashboardTopbar 配对 · 宽度/收起态由 Layout 下发
 * [PROTOCOL]: 导航源 lib/dashboard-nav.DASHBOARD_NAV 单一真相，新增页面同步导航 + App.jsx 注册路由
 *             收起态 (collapsed) 仅留图标 + Tooltip 复显标签；右缘把手拖拽调宽，双击切换收起，拖拽中才显现方向 chevron
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Settings,
  LogOut,
  Building2,
  UserRound,
  Layers,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import {
  DASHBOARD_NAV,
  visibleSectionsFor,
  visibleSectionGroups,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function NavItem({ item, collapsed }) {
  const { pathname } = useLocation();
  const isActive =
    pathname === item.to || pathname.startsWith(`${item.to}/`);

  // 用字符串 className 而非 NavLink 函数式 className：Tooltip 的 asChild(Slot)
  // 会把函数序列化成字符串，导致布局类失效，故自行计算 isActive
  const link = (
    <Link
      to={item.to}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center rounded-lg text-sm transition-colors",
        collapsed ? "mx-auto size-10 justify-center" : "gap-2 px-3 py-2",
        isActive
          ? "bg-primary/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <item.Icon className={cn("shrink-0", collapsed ? "size-5" : "size-4")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function DashboardSidebar({
  width = 256,
  collapsed = false,
  dragging = false,
  onResizeStart,
  onToggle,
}) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const segment = pathname.split("/")[2];
  const visibleSections = visibleSectionsFor(user);
  const current =
    visibleSections.find((s) => s.id === segment) ?? visibleSections[0] ?? DASHBOARD_NAV[0];
  const groups = visibleSectionGroups(current, user);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        style={{ width }}
        className={cn(
          "sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 flex-col border-r border-border bg-card md:flex",
          !dragging && "transition-[width] duration-200 ease-out",
        )}
      >
        {/* ---------- 子项导航 (支持分组) ---------- */}
        <ScrollArea className="flex-1 px-2 py-2">
          {groups.map((g, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : undefined}>
              {g.label && !collapsed && (
                <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {g.label}
                </p>
              )}
              <nav className="space-y-0.5">
                {g.items.map((item) => (
                  <NavItem key={item.to} item={item} collapsed={collapsed} />
                ))}
              </nav>
            </div>
          ))}
        </ScrollArea>

        {/* ---------- 底部用户卡 ---------- */}
        <UserCard collapsed={collapsed} />

        {/* ---------- 右缘拖拽把手 (拖拽调宽 · 双击切换收起 · 拖拽中显现方向 chevron) ---------- */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="拖拽调整侧边栏宽度"
          onMouseDown={onResizeStart}
          onDoubleClick={onToggle}
          className="group absolute inset-y-0 -right-1.5 z-30 hidden w-3 cursor-col-resize md:block"
        >
          <span
            className={cn(
              "absolute inset-y-0 right-1.5 w-0.5 transition-colors",
              dragging ? "bg-primary/40" : "bg-transparent group-hover:bg-primary/30",
            )}
          />
          {dragging && (
            <span className="absolute right-0 top-1/2 flex size-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
              {collapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronLeft className="size-3.5" />
              )}
            </span>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function UserCard({ collapsed = false }) {
  const { user, logout, switchCompany } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const companies = user.companyOptions ?? []
  const hasMultipleCompanies = companies.length > 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center border-t border-border py-3 text-left transition-colors hover:bg-muted focus:outline-none",
          collapsed ? "justify-center px-0" : "gap-3 px-3",
        )}
      >
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="text-sm font-medium">
            {user.avatar}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user.company}
              </p>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasMultipleCompanies && (
          <>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              切换公司
            </DropdownMenuLabel>
            {companies.map((company) => {
              const active = company.id === user.activeCompanyId
              return (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => switchCompany(company.id)}
                >
                  <Building2 className="size-4" />
                  <span className="min-w-0 flex-1 truncate">{company.name}</span>
                  {active && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => navigate("/")}>
          <UserRound className="size-4" />
          返回官网
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/design-system")}>
          <Layers className="size-4" />
          设计系统
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard/data/settings")}>
          <Settings className="size-4" />
          设置
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive">
          <LogOut className="size-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DashboardSidebar;
