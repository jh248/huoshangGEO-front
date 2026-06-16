/**
 * [INPUT]: 依赖 react-router-dom Link/useLocation，ui/Sheet + Button，lib/dashboard-nav 权限导航
 * [OUTPUT]: 默认导出 DashboardTopbar — 控制台顶栏 (品牌 + RBAC 主导航 Tab · 移动端 Sheet 全量导航)
 * [POS]: components/layout DashboardLayout 顶部消费 · 主导航单一入口
 * [PROTOCOL]: 主导航点击跳转到该模块第一个有权限子项，激活态以 pathname 前缀匹配
 *             品牌块固定宽度，不跟随侧栏展开/收起变化，避免主导航位置跳动
 */
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/layout/BrandLogo'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  firstVisibleSectionItem,
  visibleSectionsFor,
  visibleSectionGroups,
} from '@/lib/dashboard-nav'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// RBAC：按 session permissions 过滤可见主导航
function useVisibleSections() {
  const { user } = useAuth()
  return visibleSectionsFor(user)
}

function useActiveSectionId() {
  const { pathname } = useLocation()
  return pathname.split('/')[2] ?? 'data'
}

function SectionTab({ section, active, user }) {
  const Icon = section.Icon
  return (
    <Link
      to={firstVisibleSectionItem(section, user).to}
      className={cn(
        'flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="size-4" />
      {section.label}
    </Link>
  )
}

function DashboardTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()
  const activeId = useActiveSectionId()
  const sections = useVisibleSections()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background">
      {/* ---------- 品牌块 (固定宽度 · 不随侧栏变化) ---------- */}
      <Link
        to="/dashboard"
        className="flex w-auto shrink-0 items-center px-4 text-foreground md:w-64 md:justify-start"
      >
        <BrandLogo
          variant="full"
          className="h-7 w-auto"
        />
      </Link>

      {/* ---------- 桌面主导航 Tab ---------- */}
      <nav className="hidden flex-1 items-center gap-1 px-4 md:flex md:px-6">
        {sections.map((section) => (
          <SectionTab
            key={section.id}
            section={section}
            user={user}
            active={activeId === section.id}
          />
        ))}
      </nav>

      {/* ---------- 右侧群：移动端 Sheet ---------- */}
      <div className="ml-auto flex items-center gap-2 pr-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="打开侧边栏">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border px-4 py-3">
              <SheetTitle className="flex items-center gap-2 text-foreground">
                <BrandLogo variant="mark" className="size-5" /> 火山 GEO 控制台
              </SheetTitle>
            </SheetHeader>
            <nav className="space-y-4 p-3">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <section.Icon className="size-3.5" /> {section.label}
                  </div>
                  {visibleSectionGroups(section, user).map((g, gi) => (
                    <div key={gi}>
                      {g.label && (
                        <p className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          {g.label}
                        </p>
                      )}
                      {g.items.map((it) => (
                        <Link
                          key={it.to}
                          to={it.to}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <it.Icon className="size-4" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default DashboardTopbar
