/**
 * [INPUT]: 依赖 lucide 图标，PageShell+PageSectionCard，本地 _filters.DateFilter
 * [OUTPUT]: 默认导出 Competitors — UV 数据分析页 (数据概览 + 日期筛选 + 3 指标卡 + 时间筛选流量趋势)
 * [POS]: /dashboard/data/competitors 路由，从竞品对比改为 UV 数据分析
 * [PROTOCOL]: 颜色、圆角、阴影一律走设计系统；日期控件为 Button 组合态，不使用 native date input；当前为第三方统计空态 mock
 */
import { useState } from 'react'
import {
  CircleHelp,
  Eye,
  Coins,
  UserRound,
} from 'lucide-react'
import { PageShell, PageSectionCard } from '../_PageShell'
import { MultiLineChart } from './_charts'
import { DateFilter } from './_filters'

const TREND_LABELS = ['06-09', '06-10', '06-11', '06-12', '06-13', '06-14', '06-15']
const UV_TREND = [128, 154, 142, 196, 218, 204, 236]
const PV_TREND = [312, 358, 331, 426, 486, 451, 512]
const CREDIT_TREND = [96, 118, 104, 142, 166, 151, 184]
const TRAFFIC_SERIES = [
  { name: '访客数(UV)', color: 'var(--primary)', values: UV_TREND },
  { name: '浏览量(PV)', color: 'var(--chart-3)', values: PV_TREND },
  { name: '积分消耗', color: 'var(--chart-4)', values: CREDIT_TREND },
]

const METRICS = [
  { label: '访客数(UV)', value: '236', Icon: UserRound },
  { label: '浏览量(PV)', value: '512', Icon: Eye },
  { label: '消耗总积分', value: '184', Icon: Coins },
]

function OverviewSection({ dateValue, onDateChange }) {
  return (
    <PageSectionCard
      title="数据来源于51La，真实、中立、权威"
      desc={
        <span className="inline-flex flex-wrap items-center gap-x-1 gap-y-0.5">
          <span>数据按 T+1 同步，当前展示截至昨日 24:00 的统计结果。</span>
          <span>您可点击</span>
          <a
            href="https://www.51.la/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            前往51La
          </a>
          <span>查看真实数据。</span>
        </span>
      }
      actions={<DateFilter value={dateValue} onChange={onDateChange} />}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
    </PageSectionCard>
  )
}

function MetricCard({ label, value, Icon }) {
  const isEmpty = value === '-'

  return (
    <div className="rounded-md border border-border bg-background/40 p-5">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span>{label}</span>
        <CircleHelp className="size-3.5" />
      </div>
      <div className="mt-7 flex items-end gap-1">
        {!isEmpty && <Icon className="mb-1 size-4 text-muted-foreground" />}
        <span className="text-4xl font-semibold leading-none tracking-tight">
          {value}
        </span>
      </div>
    </div>
  )
}

function TrendPanel({ dateValue, onDateChange }) {
  return (
    <PageSectionCard
      title="流量趋势"
      actions={<DateFilter value={dateValue} onChange={onDateChange} />}
    >
      <div className="rounded-md border border-border bg-background/40 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary" />
            访客数(UV)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-chart-3" />
            浏览量(PV)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-chart-4" />
            积分消耗
          </span>
        </div>
        <MultiLineChart series={TRAFFIC_SERIES} height={220} />
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
  )
}

function Competitors() {
  const [overviewDate, setOverviewDate] = useState({ preset: 'yesterday' })
  const [trendDate, setTrendDate] = useState({ preset: '7d' })

  return (
    <PageShell>
      <OverviewSection dateValue={overviewDate} onDateChange={setOverviewDate} />
      <TrendPanel dateValue={trendDate} onDateChange={setTrendDate} />
    </PageShell>
  )
}

export default Competitors
