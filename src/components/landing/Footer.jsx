/**
 * [INPUT]: 依赖 react-router-dom
 * [OUTPUT]: 默认导出 Footer — Landing 专属页脚 (品牌 + 四列链接矩阵)
 * [POS]: components/landing 序号 10，承接 FinalCTA 收束页面
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from 'react-router-dom'
import BrandLogo from '@/components/layout/BrandLogo'

// ============================================================================
// 链接矩阵 · 数据驱动 · 渲染逻辑无分支
// ============================================================================
const LINK_GROUPS = [
  {
    title: '产品',
    links: [
      { label: '免费品牌检测', href: '/brand-diagnosis' },
      { label: '预约演示', href: '/brand-diagnosis' },
      { label: '控制台', href: '/dashboard' },
      { label: '设计系统', href: '/design-system' },
    ],
  },
  {
    title: '资源',
    links: [
      { label: '文章资讯', href: '/article-consulting' },
      { label: '案例研究', href: '#' },
      { label: '博客', href: '#' },
      { label: '更新日志', href: '#' },
    ],
  },
  {
    title: '公司',
    links: [
      { label: '关于我们', href: '#' },
      { label: '招聘', href: '#' },
      { label: '联系销售', href: '#' },
      { label: '媒体资源', href: '#' },
    ],
  },
  {
    title: '法律',
    links: [
      { label: '隐私协议', href: '#' },
      { label: '服务条款', href: '#' },
      { label: '数据安全', href: '#' },
      { label: 'ICP 备案', href: '#' },
    ],
  },
]

function Footer() {
  return (
    <footer id="about" className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          {/* ---------- 品牌 ---------- */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center skeu-interactive text-foreground"
            >
              <BrandLogo className="h-8 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              为生成式搜索时代而生的品牌可见性引擎，让 AI 主动推荐你。
            </p>
          </div>

          {/* ---------- 四列链接矩阵 ---------- */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {LINK_GROUPS.map((g) => (
              <div key={g.title}>
                <h3 className="text-sm font-medium text-foreground">
                  {g.title}
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {g.links.map((l) =>
                    l.href === '#' ? (
                      <li key={l.label}>
                        <span
                          aria-disabled="true"
                          title="即将上线"
                          className="cursor-not-allowed text-sm text-muted-foreground/50"
                        >
                          {l.label}
                        </span>
                      </li>
                    ) : (
                      <li key={l.label}>
                        <Link
                          to={l.href}
                          className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        >
                          {l.label}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
