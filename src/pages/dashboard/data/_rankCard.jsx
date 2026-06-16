/**
 * [INPUT]: 依赖 ui/Badge+ScrollArea+Table
 * [OUTPUT]: 命名导出 RankCard — AI 生态排名表 (RankBadge 名次墩 + 目标产品高亮 + 滚动查看)
 * [POS]: pages/dashboard/data 私有共享层，被 Competitors / Scenarios 同源消费
 * [PROTOCOL]: 颜色一律走 var(--token)；列名 valueLabel 显式优先，缺省按 title 推断
 */
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function RankBadge({ rank }) {
  const colors = {
    1: 'var(--chart-3)',
    2: 'var(--muted-foreground)',
    3: 'var(--chart-5)',
  }
  if (rank > 3) {
    return (
      <span className="inline-flex w-6 justify-center text-sm tabular-nums text-muted-foreground">
        {rank}
      </span>
    )
  }
  return (
    <span
      className="flex size-6 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
      style={{
        background: `linear-gradient(135deg, ${colors[rank]} 0%, color-mix(in srgb, ${colors[rank]} 80%, black) 100%)`,
      }}
    >
      {rank}
    </span>
  )
}

export function RankCard({ title, rows, valueLabel }) {
  const colLabel =
    valueLabel ??
    (title.includes('位次') ? '平均提及位次' : title.includes('Top1') ? 'Top1提及率' : '提及率')
  return (
    <div className="flex flex-col rounded-md border border-border bg-background/40 p-4">
      <div className="mb-3 text-xs text-muted-foreground">{title}</div>
      <ScrollArea className="h-64 pr-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">产品名称</TableHead>
              <TableHead />
              <TableHead className="text-right">{colLabel}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name} className={row.highlight ? 'bg-muted/50' : undefined}>
                <TableCell className="w-10"><RankBadge rank={row.rank} /></TableCell>
                <TableCell className="font-medium">
                  <span className="flex items-center gap-2">
                    {row.name}
                    {row.target && (
                      <Badge variant="outline" className="px-1.5 py-0">目标产品</Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
