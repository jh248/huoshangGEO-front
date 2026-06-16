/**
 * [INPUT]: 依赖 react createContext/useContext/useState/useMemo，localStorage 持久化
 * [OUTPUT]: ProductProvider 上下文 + useProduct() hook · 暴露 { products, productsByCategory, current, switchTo }
 * [POS]: contexts/ 单一「当前监测产品」状态来源，DashboardSidebar 顶部 ProductSwitcher 与未来数据页同源消费
 * [PROTOCOL]: mock 产品清单写在常量；switchTo(id) 切换并持久化；替换真实接口只改 PRODUCTS 与 fetch 逻辑
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Car, Cpu, Smartphone, Sparkles } from 'lucide-react'

const ProductContext = createContext(null)
const STORAGE_KEY = 'huoshan-geo-product-v2'

export const PRODUCTS = [
  { id: 'westinghouse-floor-lamp', category: '护眼照明', name: '西屋大路灯', Icon: Cpu },
  { id: 'lixiang', category: '电动汽车', name: '理想汽车', Icon: Car },
  { id: 'nio', category: '电动汽车', name: '蔚来', Icon: Car },
  { id: 'xpeng', category: '电动汽车', name: '小鹏', Icon: Car },
  { id: 'su7', category: '电动汽车', name: '小米 SU7', Icon: Car },
  { id: 'wenxin', category: 'AI 应用', name: '文心一言', Icon: Sparkles },
  { id: 'doubao', category: 'AI 应用', name: '豆包', Icon: Sparkles },
  { id: 'iphone', category: '智能硬件', name: '小米 14 Pro', Icon: Smartphone },
  { id: 'hisense', category: '智能硬件', name: '海信电视', Icon: Cpu },
]

export function ProductProvider({ children }) {
  const [currentId, setCurrentId] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw && PRODUCTS.some((p) => p.id === raw) ? raw : PRODUCTS[0].id
    } catch {
      return PRODUCTS[0].id
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, currentId) } catch { /* ignore */ }
  }, [currentId])

  const value = useMemo(() => {
    const current = PRODUCTS.find((p) => p.id === currentId) ?? PRODUCTS[0]
    const productsByCategory = PRODUCTS.reduce((acc, p) => {
      ;(acc[p.category] ??= []).push(p)
      return acc
    }, {})
    return {
      products: PRODUCTS,
      productsByCategory,
      current,
      switchTo: setCurrentId,
    }
  }, [currentId])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProduct() {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProduct must be used inside <ProductProvider>')
  return ctx
}
