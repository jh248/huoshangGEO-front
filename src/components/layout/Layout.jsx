/**
 * [INPUT]: 依赖 react-router-dom 的 Outlet/ScrollRestoration，本地 Header/Footer
 * [OUTPUT]: 默认导出 Layout 组件，作为路由根布局
 * [POS]: components/layout 的容器，包裹所有路由子页面，Header + Outlet + Footer 三段式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function Layout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
