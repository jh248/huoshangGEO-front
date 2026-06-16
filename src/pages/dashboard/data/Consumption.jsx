/**
 * [INPUT]: 依赖 ui/Badge+Button，lucide 图标，本地 _charts.MultiLineChart + _filters.DateFilter，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 Consumption — 消费明细页 (汇总数据 + 积分消耗趋势 + 消费明细列表)
 * [POS]: /dashboard/data/consumption 路由，数据中心积分消费明细
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色走 var(--token)/Tailwind 语义类；筛选复用 DateFilter
 */
import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Coins,
  ReceiptText,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PageShell, PageSectionCard } from '../_PageShell'
import { MultiLineChart } from './_charts'
import { DateFilter } from './_filters'

const TREND_LABELS = ['06-10', '06-11', '06-12', '06-13', '06-14', '06-15', '06-16']
const TOTAL_CONSUMPTION = [112, 136, 148, 172, 164, 188, 180]
const UV_CONSUMPTION = [72, 88, 92, 108, 102, 116, 112]
const LEAD_CONSUMPTION = [40, 48, 56, 64, 62, 72, 68]
const CONSUMPTION_SERIES = [
  { name: '消耗总积分', color: 'var(--primary)', values: TOTAL_CONSUMPTION },
  { name: 'UV消耗总积分', color: 'var(--chart-3)', values: UV_CONSUMPTION },
  { name: '线索消耗总积分', color: 'var(--chart-4)', values: LEAD_CONSUMPTION },
]

const SUMMARY_METRICS = [
  { label: '消耗总积分', value: '1,100', yesterday: '180', Icon: Coins },
  { label: 'UV消耗总积分', value: '690', yesterday: '112', Icon: UserRound },
  { label: '线索消耗总积分', value: '410', yesterday: '68', Icon: ReceiptText },
]

const DETAIL_PAGE_SIZE = 6
const DETAIL_ROWS = [
  { id: 1, type: 'consume', title: '品牌检测任务', time: '2026-06-16 09:26:12', points: -180, balance: 8 },
  { id: 2, type: 'recharge', title: '积分充值', time: '2026-06-15 18:50:25', points: 188, balance: 188 },
  { id: 3, type: 'consume', title: '官网 UV 数据同步', time: '2026-06-15 10:14:37', points: -112, balance: 0 },
  { id: 4, type: 'consume', title: '线索消耗统计', time: '2026-06-14 16:42:09', points: -68, balance: 112 },
  { id: 5, type: 'consume', title: '引用源分析任务', time: '2026-06-14 11:28:33', points: -96, balance: 180 },
  { id: 6, type: 'recharge', title: '积分充值', time: '2026-06-13 19:08:54', points: 300, balance: 276 },
  { id: 7, type: 'consume', title: '场景词分析任务', time: '2026-06-13 09:52:18', points: -84, balance: 24 },
  { id: 8, type: 'consume', title: '品牌诊断任务', time: '2026-06-12 15:20:41', points: -148, balance: 108 },
  { id: 9, type: 'recharge', title: '积分充值', time: '2026-06-12 10:31:06', points: 256, balance: 256 },
  { id: 10, type: 'consume', title: '数据大盘刷新', time: '2026-06-11 14:09:27', points: -72, balance: 0 },
]

function SummaryMetric({ label, value, yesterday, Icon }) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <p className="mt-6 text-4xl font-semibold leading-none tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">昨日消耗积分数</span>
        <span className="font-semibold tabular-nums text-foreground">{yesterday}</span>
      </div>
    </div>
  )
}

function LegendDot({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-sm', className)} />
      {label}
    </span>
  )
}

function ConsumptionDetailCard({ row }) {
  const isRecharge = row.type === 'recharge'
  const Icon = isRecharge ? ArrowUpRight : ArrowDownRight
  return (
    <div className="grid gap-4 rounded-md border border-border bg-background/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={isRecharge ? 'secondary' : 'outline'}
            className={cn(
              isRecharge ? 'text-primary' : 'text-destructive',
              'gap-1.5'
            )}
          >
            <span className={cn('size-2 rounded-full', isRecharge ? 'bg-primary' : 'bg-destructive')} />
            {isRecharge ? '充值' : '消费'}
          </Badge>
          <span className="text-sm tabular-nums text-muted-foreground">{row.time}</span>
        </div>
        <p className="truncate text-base font-semibold text-foreground">{row.title}</p>
      </div>
      <div className="grid grid-cols-2 gap-6 sm:min-w-56">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">积分</p>
          <p className={cn('flex items-center gap-1 text-2xl font-semibold tabular-nums', isRecharge ? 'text-primary' : 'text-destructive')}>
            <Icon className="size-4" />
            {row.points > 0 ? `+${row.points}` : row.points}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">变动后积分</p>
          <p className="flex items-center gap-1 text-2xl font-semibold tabular-nums text-foreground">
            <Coins className="size-4 text-primary" />
            {row.balance}
          </p>
        </div>
      </div>
    </div>
  )
}

function Consumption() {
  const [dateValue, setDateValue] = useState({ preset: '7d' })
  const [trendDateValue, setTrendDateValue] = useState({ preset: '7d' })
  const [detailDateValue, setDetailDateValue] = useState({ preset: '7d' })
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(DETAIL_ROWS.length / DETAIL_PAGE_SIZE)
  const pagedRows = useMemo(() => {
    const start = (page - 1) * DETAIL_PAGE_SIZE
    return DETAIL_ROWS.slice(start, start + DETAIL_PAGE_SIZE)
  }, [page])
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <PageShell>
      <PageSectionCard
        title="消费明细"
        desc="按时间范围统计积分消耗、UV 消耗与线索消耗。"
        actions={<DateFilter value={dateValue} onChange={setDateValue} />}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {SUMMARY_METRICS.map((metric) => (
            <SummaryMetric key={metric.label} {...metric} />
          ))}
        </div>
      </PageSectionCard>

      <PageSectionCard
        title="积分消耗趋势"
        desc="消耗总积分、UV 消耗与线索消耗随时间的变化。"
        actions={<DateFilter value={trendDateValue} onChange={setTrendDateValue} />}
      >
        <div className="rounded-md border border-border bg-background/40 p-4">
          <div className="mb-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
            <LegendDot className="bg-primary" label="消耗总积分" />
            <LegendDot className="bg-chart-3" label="UV消耗总积分" />
            <LegendDot className="bg-chart-4" label="线索消耗总积分" />
          </div>
          <MultiLineChart series={CONSUMPTION_SERIES} height={220} />
          <div className="relative mt-1.5 h-3.5">
            {TREND_LABELS.map((label, i) => {
              const left = (i / Math.max(TREND_LABELS.length - 1, 1)) * 100
              const tx = i === 0 ? '0' : i === TREND_LABELS.length - 1 ? '-100%' : '-50%'
              return (
                <span
                  key={label}
                  className="absolute top-0 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground"
                  style={{ left: `${left}%`, transform: `translateX(${tx})` }}
                >
                  {label}
                </span>
              )
            })}
          </div>
        </div>
      </PageSectionCard>

      <PageSectionCard
        title="消费明细列表"
        desc="展示积分消费、充值时间、积分变动与变动后余额。"
        actions={<DateFilter value={detailDateValue} onChange={setDetailDateValue} />}
      >
        <div className="space-y-3">
          {pagedRows.map((row) => (
            <ConsumptionDetailCard key={row.id} row={row} />
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>共 {DETAIL_ROWS.length} 条数据</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="消费明细首页" disabled={!canPrev} onClick={() => setPage(1)}>
              <ChevronsLeft />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="消费明细上一页" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft />
            </Button>
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium tabular-nums text-primary-foreground">
              {page}
            </span>
            <span className="px-1 tabular-nums">/ {totalPages}</span>
            <Button variant="ghost" size="icon-sm" aria-label="消费明细下一页" disabled={!canNext} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <ChevronRight />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="消费明细末页" disabled={!canNext} onClick={() => setPage(totalPages)}>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </PageSectionCard>
    </PageShell>
  )
}

export default Consumption
