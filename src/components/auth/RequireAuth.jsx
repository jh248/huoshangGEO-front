/**
 * [INPUT]: 依赖 react-router-dom Navigate / useLocation，contexts/AuthContext useAuth
 * [OUTPUT]: 默认导出 RequireAuth — 未登录则重定向 / (Landing)，登录则透传 children/Outlet
 * [POS]: components/auth 路由守卫，在 App.jsx 包裹 /dashboard 子树
 * [PROTOCOL]: 仅做鉴权门禁，不渲染 UI；缓存登录尝试路径以便登录后回跳 (state.from)
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }
  return children ?? <Outlet />
}

export default RequireAuth
