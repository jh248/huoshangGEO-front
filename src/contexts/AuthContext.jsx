/**
 * [INPUT]: 依赖 react useState/useEffect/useContext，localStorage 持久化
 * [OUTPUT]: AuthProvider 上下文 + useAuth() hook · 暴露 { user, isAuthenticated, login, logout, switchCompany }
 * [POS]: contexts/ 单一鉴权状态来源，被 main.jsx 顶层 Provider 消费 · LoginDialog/RequireAuth/DashboardHeader 调用 useAuth
 * [PROTOCOL]: mock 鉴权，按账号命中演示用户并注入 RBAC 权限 · 替换真实接口时只改 login()
 */
import { createContext, useContext, useEffect, useState } from 'react'
import { buildSessionUser, companyOptions, isPermissionShapeCurrent } from '@/lib/mock-rbac'

const AuthContext = createContext(null)
const STORAGE_KEY = 'huoshan-geo-auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      return parsed && (!isPermissionShapeCurrent(parsed) || !parsed.companyOptions)
        ? buildSessionUser(parsed.account ?? parsed.email)
        : parsed
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = async (credentials) => {
    const mocked = buildSessionUser(credentials)
    setUser(mocked)
    return mocked
  }

  const logout = () => setUser(null)
  const switchCompany = (companyId) => {
    setUser((current) => {
      if (!current) return current
      const options = current.companyOptions ?? companyOptions(current.companyIds ?? [])
      const active = options.find((company) => company.id === companyId)
      if (!active) return current
      return {
        ...current,
        companyOptions: options,
        activeCompanyId: active.id,
        company: active.name,
      }
    })
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchCompany }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
