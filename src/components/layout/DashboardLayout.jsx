/**
 * [INPUT]: 依赖 react-router-dom Outlet，framer-motion motion，本地 DashboardSidebar + DashboardTopbar，lib/motion pageTransition
 * [OUTPUT]: 默认导出 DashboardLayout — 控制台两层结构 (顶 Topbar 含主导航 · 下 Sidebar 含子导航 + Main)
 * [POS]: components/layout 控制台路由根，所有 /dashboard/* 子路由共享，在 App.jsx 内由 RequireAuth 包裹
 * [PROTOCOL]: 仅做编排，业务页面在 pages/dashboard/ 沉淀；新增页面同步 lib/dashboard-nav.DASHBOARD_NAV
 *             侧栏宽度/收起态在此集中托管 (localStorage 持久化)，同源下发给 Topbar 品牌块与 Sidebar 保持对齐
 */
import { Outlet } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'
import { ProductProvider } from '@/contexts/ProductContext'
import { pageTransition } from '@/lib/motion'

// 侧栏宽度公约 (px)：展开区间 [MIN, MAX] · 收起轨 RAIL (仅图标) · 拖拽低于 COLLAPSE_AT 自动收起
const SIDEBAR_MIN = 208
const SIDEBAR_MAX = 360
const SIDEBAR_RAIL = 64
const SIDEBAR_DEFAULT = 256
const COLLAPSE_AT = 168
const STORE_KEY = 'dashboard-sidebar'

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max)
}

function readStored() {
  try {
    const v = JSON.parse(localStorage.getItem(STORE_KEY))
    return {
      collapsed: !!v?.collapsed,
      width: clamp(v?.width ?? SIDEBAR_DEFAULT, SIDEBAR_MIN, SIDEBAR_MAX),
    }
  } catch {
    return { collapsed: false, width: SIDEBAR_DEFAULT }
  }
}

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(() => readStored().collapsed)
  const [width, setWidth] = useState(() => readStored().width)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ collapsed, width }))
  }, [collapsed, width])

  const beginResize = useCallback(
    (e) => {
      e.preventDefault()
      const startX = e.clientX
      const startWidth = collapsed ? SIDEBAR_RAIL : width
      setDragging(true)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'

      const onMove = (ev) => {
        const next = startWidth + (ev.clientX - startX)
        if (next < COLLAPSE_AT) {
          setCollapsed(true)
        } else {
          setCollapsed(false)
          setWidth(clamp(next, SIDEBAR_MIN, SIDEBAR_MAX))
        }
      }
      const onUp = () => {
        setDragging(false)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    },
    [collapsed, width],
  )

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])

  const effectiveWidth = collapsed ? SIDEBAR_RAIL : width

  return (
    <ProductProvider>
      <div className="flex min-h-svh bg-muted/30 text-foreground">
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar />
          <div className="flex flex-1">
            <DashboardSidebar
              width={effectiveWidth}
              collapsed={collapsed}
              dragging={dragging}
              onResizeStart={beginResize}
              onToggle={toggleCollapsed}
            />
            <motion.main
              variants={pageTransition}
              initial="initial"
              animate="animate"
              exit="exit"
              className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8"
            >
              <Outlet />
            </motion.main>
          </div>
        </div>
      </div>
    </ProductProvider>
  )
}

export default DashboardLayout
