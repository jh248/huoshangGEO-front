/**
 * [INPUT]: 依赖 react-router-dom 的 Link，@/components/ui 的 Separator，lucide-react 与 react-icons/si 图标
 * [OUTPUT]: 默认导出 Footer 组件，全站底部
 * [POS]: components/layout 的底部布局，被 Layout.jsx 消费，与 Header.jsx 对称
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/layout/BrandLogo'
import { SiGithub, SiX, SiDiscord } from 'react-icons/si'
import { Separator } from '@/components/ui/separator'

// ============================================================================
// 链接矩阵 · 数据驱动 · 渲染逻辑无分支
// ============================================================================
const LINK_GROUPS = [
  {
    title: '产品',
    links: [
      { label: '功能', href: '#' },
      { label: '价格', href: '#' },
      { label: '设计系统', href: '/design-system' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '文档', href: '#' },
      { label: '博客', href: '#' },
      { label: '案例', href: '#' },
    ],
  },
  {
    title: '公司',
    links: [
      { label: '关于', href: '#' },
      { label: '联系', href: '#' },
      { label: '招聘', href: '#' },
    ],
  },
]

const SOCIAL = [
  { Icon: SiGithub, label: 'GitHub', href: '#' },
  { Icon: SiX, label: 'X', href: '#' },
  { Icon: SiDiscord, label: 'Discord', href: '#' },
]

function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* ---------- 品牌列 ---------- */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center text-foreground">
              <BrandLogo className="h-8 w-auto" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              为生成式搜索时代而生的品牌可见性引擎。
            </p>
          </div>

          {/* ---------- 链接矩阵 ---------- */}
          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-foreground">
                {group.title}
              </h3>
              <ul className="mt-3 flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* ---------- 版权与社媒 ---------- */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} 火山 GEO. 保留所有权利。
          </p>
          <div className="flex items-center gap-4">
            {SOCIAL.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
