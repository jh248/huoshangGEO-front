/**
 * [INPUT]: 依赖 ui/Select+Button+Table+Checkbox+Tooltip，lucide 图标，本地 _charts + _metrics + _filters，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 Scenarios — 场景词数据 4 段式 (提及率 + 提及次数 + 综合得分 + 场景词表置底 · 筛选 staged → 搜索按钮 commit 到 applied)
 * [POS]: /dashboard/data/scenarios 路由，从 stubs.jsx 拆出独立文件
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)；图表全部走 ./_charts；筛选 Pill 复用 ./_filters
 */
import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PageShell, PageSectionCard } from '../_PageShell'
import { BrandPlanFilter } from './_brandPlanFilter'
import {
  LineChart,
  MultiLineChart,
  PlatformBadge,
} from './_charts'
import { RankCard } from './_rankCard'
import { SectionTitle } from './_metrics'
import {
  DateFilter,
  PlatformFilter,
  TermFilter,
} from './_filters'

/* ============================================================================
 * Mock 数据
 * ========================================================================== */
const PAGE_SIZES = ['10', '20', '50']

const KEYWORDS = [
  { id: 1, term: '电动汽车品牌排行榜', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 2, term: '电动汽车推荐', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 3, term: '电动汽车质量排名前十名', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 4, term: '智能化体验好的电动汽车推荐?', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 5, term: '适合自驾旅行的电动汽车推荐?', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 6, term: '辅助驾驶做得好的电动汽车推荐?', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 7, term: '充电快的电动汽车推荐', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6', highlight: true },
  { id: 8, term: '续航时间长没有充电焦虑的电动汽车推荐', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 9, term: '冬天续航稳定的电动汽车推荐', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
  { id: 10, term: '二手保值率高的电动汽车推荐', rate: '0.0%', avgRank: '-', platforms: ['豆包', 'DeepSeek', '元宝', '文心'], updated: '2026/4/6' },
]

/* 趋势 X 轴日期 (近 7 天 · 对齐最近会话 04-06) */
const TREND_DATES = ['03-31', '04-01', '04-02', '04-03', '04-04', '04-05', '04-06']

/* 提及率 — 百分比 */
const RATE_TREND = [10.3, 10.8, 11.2, 11.6, 12.0, 12.3, 12.3, 12.3]

/* 提及次数 — 次数 */
const COUNT_TREND = [2, 3, 4, 5, 6, 6, 6]
const COUNT_RANK = [
  { rank: 1, name: '小米', value: '13 次' },
  { rank: 2, name: '小米 SU7', value: '11 次' },
  { rank: 3, name: '极氪 001', value: '9 次' },
  { rank: 4, name: '蔚来', value: '8 次' },
  { rank: 5, name: '问界 M9', value: '8 次' },
  { rank: 6, name: '特斯拉 Model Y', value: '7 次' },
  { rank: 7, name: '比亚迪汉', value: '7 次' },
  { rank: 8, name: '理想', value: '6 次', target: true },
  { rank: 9, name: '小鹏 G9', value: '5 次' },
  { rank: 10, name: '腾势 N7', value: '4 次' },
]

/* 平均提及位次 — 位次 (数字越小越好) */
const RANK_TREND = [7.0, 6.8, 6.7, 6.6, 6.5, 6.5, 6.5]

/* AI 生态排名表 (右侧 · 复用 _rankCard) */
const RATE_RANK = [
  { rank: 1, name: '小米', value: '16.7%' },
  { rank: 2, name: '小米 SU7', value: '16.7%' },
  { rank: 3, name: '极氪 001', value: '15.8%' },
  { rank: 4, name: '蔚来', value: '15.8%' },
  { rank: 5, name: '问界 M9', value: '14.2%' },
  { rank: 6, name: '特斯拉 Model Y', value: '13.5%' },
  { rank: 7, name: '比亚迪汉', value: '12.4%' },
  { rank: 8, name: '理想', value: '11.7%', target: true },
  { rank: 9, name: '小鹏 G9', value: '10.9%' },
  { rank: 10, name: '腾势 N7', value: '9.6%' },
]
const SCORE_RANK = [
  { rank: 1, name: '特斯拉', value: 'NO. 6.1' },
  { rank: 2, name: '比亚迪', value: 'NO. 6.1' },
  { rank: 3, name: '小米', value: 'NO. 6.2' },
  { rank: 4, name: '问界', value: 'NO. 6.3' },
  { rank: 5, name: '极氪', value: 'NO. 6.3' },
  { rank: 6, name: '蔚来', value: 'NO. 6.4' },
  { rank: 7, name: '小鹏', value: 'NO. 6.4' },
  { rank: 8, name: '理想', value: 'NO. 6.5', target: true },
  { rank: 9, name: '腾势', value: 'NO. 6.7' },
  { rank: 10, name: '智己', value: 'NO. 6.8' },
]

/* 竞品对比折线 (开关打开时叠加 · 目标产品「理想」由 trend 单独注入) */
const RATE_COMPARE = [
  { name: '小米', color: 'var(--chart-5)', values: [15, 15.5, 16, 16.3, 16.5, 16.6, 16.7, 16.7] },
  { name: '小米 SU7', color: 'var(--chart-4)', values: [13, 14, 15, 15.8, 16.3, 16.6, 16.7, 16.7] },
  { name: '极氪 001', color: 'var(--chart-1)', values: [16, 15.8, 15.5, 15.4, 15.6, 15.7, 15.8, 15.8] },
  { name: '蔚来', color: 'var(--chart-2)', values: [14, 14.5, 15, 15.3, 15.5, 15.7, 15.8, 15.8] },
]
const COUNT_COMPARE = [
  { name: '小米', color: 'var(--chart-5)', values: [9, 10, 11, 12, 13, 13, 13] },
  { name: '小米 SU7', color: 'var(--chart-4)', values: [7, 8, 9, 10, 11, 11, 11] },
  { name: '极氪 001', color: 'var(--chart-1)', values: [6, 7, 8, 8, 9, 9, 9] },
  { name: '蔚来', color: 'var(--chart-2)', values: [5, 6, 7, 7, 8, 8, 8] },
]
const SCORE_COMPARE = [
  { name: '特斯拉', color: 'var(--chart-5)', values: [6.3, 6.2, 6.2, 6.1, 6.1, 6.1, 6.1] },
  { name: '比亚迪', color: 'var(--chart-4)', values: [6.4, 6.3, 6.2, 6.2, 6.1, 6.1, 6.1] },
  { name: '小米', color: 'var(--chart-1)', values: [6.5, 6.4, 6.3, 6.3, 6.2, 6.2, 6.2] },
  { name: '问界', color: 'var(--chart-2)', values: [6.6, 6.5, 6.4, 6.4, 6.3, 6.3, 6.3] },
]

/* ============================================================================
 * 子组件
 * ========================================================================== */
function PlatformGroup({ names }) {
  return (
    <div className="flex -space-x-1.5">
      {names.map((n) => (
        <PlatformBadge key={n} name={n} size={20} />
      ))}
    </div>
  )
}

function DualChartCard({ trendTitle, trendValue, trend, rankTitle, rankRows, valueLabel, compareSeries, targetName = '理想' }) {
  const [compare, setCompare] = useState(false)
  const showCompare = compare && compareSeries?.length > 0
  const series = showCompare
    ? [...compareSeries, { name: targetName, color: 'var(--primary)', target: true, values: trend }]
    : null

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background/40 p-4">
        <div className="mb-1 text-xs text-muted-foreground">{trendTitle}</div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight">{trendValue}</p>
          {compareSeries?.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">竞品对比</span>
              <Switch checked={compare} onCheckedChange={setCompare} />
            </div>
          )}
        </div>
        {showCompare ? (
          <>
            <MultiLineChart series={series} height={180} />
            <div className="relative mt-1.5 h-3.5">
              {TREND_DATES.map((label, i) => {
                const left = (i / Math.max(TREND_DATES.length - 1, 1)) * 100
                const tx = i === 0 ? '0' : i === TREND_DATES.length - 1 ? '-100%' : '-50%'
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
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              {series.map((s) => (
                <span key={s.name} className="flex items-center gap-1.5">
                  <span className="size-3 rounded-sm" style={{ background: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  {s.target && <Badge variant="outline" className="px-1.5 py-0">目标产品</Badge>}
                </span>
              ))}
            </div>
          </>
        ) : (
          <LineChart values={trend} labels={TREND_DATES} />
        )}
      </div>
      <RankCard title={rankTitle} valueLabel={valueLabel} rows={rankRows} />
    </div>
  )
}

/* ============================================================================
 * 主体页面
 * ========================================================================== */
function Scenarios() {
  const [rateDateValue, setRateDateValue] = useState({ preset: '7d' })
  const [countDateValue, setCountDateValue] = useState({ preset: '7d' })
  const [scoreDateValue, setScoreDateValue] = useState({ preset: '7d' })
  const [platforms, setPlatforms] = useState([])
  const [terms, setTerms] = useState([])
  const [applied, setApplied] = useState({ platforms: [], terms: [] })
  const [pageSize, setPageSize] = useState('20')

  const termOptions = useMemo(
    () => KEYWORDS.map((k) => ({ value: String(k.id), label: k.term })),
    []
  )

  const rows = useMemo(() => {
    const { terms: appliedTerms, platforms: appliedPlatforms } = applied
    return KEYWORDS.filter((row) => {
      if (appliedTerms.length && !appliedTerms.includes(String(row.id))) return false
      if (appliedPlatforms.length && !row.platforms.some((p) => appliedPlatforms.includes(p))) return false
      return true
    })
  }, [applied])

  const onSearch = () => setApplied({ platforms, terms })

  return (
    <TooltipProvider delayDuration={150}>
      <PageShell actions={<BrandPlanFilter />}>
        {/* ====== 01 提及率 ====== */}
        <PageSectionCard
          title={<SectionTitle name="提及率" />}
          actions={<DateFilter value={rateDateValue} onChange={setRateDateValue} />}
        >
          <DualChartCard
            trendTitle="提及率随时间的变化趋势"
            trendValue="11.7%"
            trend={RATE_TREND}
            rankTitle="产品或品牌在 AI 生态中提及率排名"
            valueLabel="提及率"
            rankRows={RATE_RANK}
            compareSeries={RATE_COMPARE}
          />
        </PageSectionCard>

        {/* ====== 02 提及次数 ====== */}
        <PageSectionCard
          title={<SectionTitle name="提及次数" />}
          actions={<DateFilter value={countDateValue} onChange={setCountDateValue} />}
        >
          <DualChartCard
            trendTitle="提及次数随时间的变化趋势"
            trendValue="6 次"
            trend={COUNT_TREND}
            rankTitle="产品或品牌在 AI 生态中提及次数排名"
            valueLabel="提及次数"
            rankRows={COUNT_RANK}
            compareSeries={COUNT_COMPARE}
          />
        </PageSectionCard>

        {/* ====== 03 综合得分 ====== */}
        <PageSectionCard
          title={<SectionTitle name="综合得分" />}
          actions={<DateFilter value={scoreDateValue} onChange={setScoreDateValue} />}
        >
          <DualChartCard
            trendTitle="综合得分随时间的变化趋势"
            trendValue="NO. 6.5"
            trend={RANK_TREND}
            rankTitle="产品或品牌在 AI 生态中综合得分排名"
            valueLabel="综合得分"
            rankRows={SCORE_RANK}
            compareSeries={SCORE_COMPARE}
          />
        </PageSectionCard>

        {/* ====== 04 场景词表 ====== */}
        <PageSectionCard>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <PlatformFilter selected={platforms} onChange={setPlatforms} />
            <TermFilter options={termOptions} selected={terms} onChange={setTerms} />
            <Button size="sm" leftIcon={<Search />} onClick={onSearch} className="ml-auto">
              搜索
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox /></TableHead>
                  <TableHead className="w-12">序号</TableHead>
                  <TableHead>场景词</TableHead>
                  <TableHead>监测平台</TableHead>
                  <TableHead>最近更新时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      没有匹配的场景词
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={row.highlight ? 'bg-primary/5' : undefined}
                  >
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{row.id}</TableCell>
                    <TableCell className="max-w-xs truncate font-medium">{row.term}</TableCell>
                    <TableCell><PlatformGroup names={row.platforms} /></TableCell>
                    <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <Eye className="size-4" />
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>共 {rows.length} 条数据</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">每页行数</span>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger className="h-7 w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="首页" disabled><ChevronsLeft /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="上一页" disabled><ChevronLeft /></Button>
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">1</span>
              <Button variant="ghost" size="icon-sm" aria-label="下一页" disabled><ChevronRight /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="末页" disabled><ChevronsRight /></Button>
            </div>
          </div>
        </PageSectionCard>
      </PageShell>
    </TooltipProvider>
  )
}

export default Scenarios
