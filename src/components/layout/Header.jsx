/**
 * [INPUT]: 依赖 react-router-dom 的 Link/NavLink，@/components/ui 的 Button/Sheet/NavigationMenu，lucide-react 图标
 * [OUTPUT]: 默认导出 Header 组件，固定顶栏 + 桌面导航 + 移动端抽屉
 * [POS]: components/layout 的顶部布局，被 Layout.jsx 消费，与 Footer.jsx 对称
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Receipt } from 'lucide-react'
import BrandLogo from '@/components/layout/BrandLogo'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import LoginDialog from '@/components/auth/LoginDialog'
import ConsumptionDialog from '@/components/layout/ConsumptionDialog'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: '首页', to: '/' },
  { label: '品牌诊断', to: '/brand-diagnosis' },
  { label: '文章资讯', to: '/article-consulting' },
]

function Header({ transparent = false }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [consumptionOpen, setConsumptionOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  const isNavActive = (to) => {
    if (to === '/') return location.pathname === '/' && !location.hash
    if (to.includes('#')) return `${location.pathname}${location.hash}` === to
    return location.pathname === to
  }

  return (
    <header
      className={cn(
        'top-0 z-50 w-full',
        transparent
          ? 'absolute border-b border-transparent bg-transparent'
          : 'sticky border-b border-border bg-background shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_2px_8px_color-mix(in_srgb,var(--foreground)_6%,transparent)]'
      )}
    >
      <div className="mx-auto grid h-14 max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4">
        {/* ---------- 品牌 ---------- */}
        <Link to="/" className="flex items-center skeu-interactive text-foreground">
          <BrandLogo className="h-7 w-auto" />
        </Link>

        {/* ---------- 桌面导航 ---------- */}
        <nav className="hidden items-center rounded-3xl border border-border/60 bg-card/95 p-1 skeu-raised md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={cn(
                'inline-flex h-11 items-center justify-center rounded-2xl px-6 text-sm font-medium transition-[transform,color,background-color] duration-200 ease-out hover:scale-[1.02]',
                isNavActive(item.to)
                  ? 'bg-primary text-primary-foreground skeu-bar'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ---------- 桌面 CTA ---------- */}
        <div className="hidden items-center justify-end gap-2 md:flex">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="size-6">
                    <AvatarFallback className="text-[11px]">{user?.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="size-4" />
                  进入控制台
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConsumptionOpen(true)}>
                  <Receipt className="size-4" />
                  消费明细
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout} variant="destructive">
                  <LogOut className="size-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>登录</Button>
          )}
        </div>

        {/* ---------- 移动端抽屉 ---------- */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon-sm" aria-label="打开菜单">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>导航</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200',
                    isNavActive(item.to)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard />
                      进入控制台
                    </Button>
                    <Button variant="outline" onClick={() => setConsumptionOpen(true)}>
                      <Receipt />
                      消费明细
                    </Button>
                    <Button variant="outline" onClick={onLogout}>
                      <LogOut />
                      退出登录
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setLoginOpen(true)}>登录</Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <ConsumptionDialog open={consumptionOpen} onOpenChange={setConsumptionOpen} />
    </header>
  )
}

export default Header
