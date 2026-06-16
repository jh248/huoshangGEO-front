/**
 * [INPUT]: 依赖本地 PageShell + ui/Badge，lucide 图标
 * [OUTPUT]: 默认导出 StubPage (sections) — 通用占位骨架，新页面落地前的统一外观
 * [POS]: pages/dashboard 共享占位，被 14 个非数据总览的控制台页面消费
 * [PROTOCOL]: 仅占位，禁止塞业务逻辑；真页面就地替换、删除此引用
 */
import { Hammer } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PageShell, PageSectionCard } from './_PageShell'

function StubPage({ sections = ['筛选 / 检索', '主表格 / 列表', '详情 / 抽屉'] }) {
  return (
    <PageShell
      actions={
        <Badge variant="outline" className="gap-1.5">
          <Hammer className="size-3" />
          搭建中
        </Badge>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((s) => (
          <PageSectionCard key={s} title={s} desc="待接入真实数据">
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted-foreground">
              占位 · {s}
            </div>
          </PageSectionCard>
        ))}
      </div>
    </PageShell>
  )
}

export default StubPage
