/**
 * [INPUT]: 依赖 react children，lib/utils cn
 * [OUTPUT]: 命名导出 PageShell (actions/children) + PageSectionCard (title/desc/children)
 * [POS]: pages/dashboard 共享框架，所有 15 个控制台页面用 PageShell 起手；StubPage 也基于此
 * [PROTOCOL]: 只放排版骨架，不放业务；title/desc props 已废弃 (页面冗余感)，仅保留 actions 行
 *              所有卡片圆角统一 rounded-md 6px (设计系统铁律)
 */
import { cn } from '@/lib/utils'

export function PageShell({ actions, children, className }) {
  return (
    <div className={cn('mx-auto flex max-w-7xl flex-col gap-6', className)}>
      {actions && (
        <header className="flex flex-wrap items-center justify-end gap-2">
          {actions}
        </header>
      )}
      {children}
    </div>
  )
}

export function PageSectionCard({ title, desc, actions, children, className }) {
  return (
    <section
      className={cn(
        'rounded-md border border-border bg-card p-5 shadow-[0_1px_0_rgb(255_255_255/0.5)_inset,0_2px_8px_color-mix(in_srgb,var(--foreground)_5%,transparent)]',
        className
      )}
    >
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            {title && <h2 className="text-base font-semibold tracking-tight">{title}</h2>}
            {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
