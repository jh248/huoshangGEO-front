/**
 * [INPUT]: 依赖 ui/Badge+Table+NumberTicker，lucide 图标，本地 _charts(GaugeRing/ScatterChart/PlatformBadge)，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 DataOverview — GEO 健康总览 (GEO 计分卡 + 3 KPI + 竞品 TOP10 + 舆情分析 + 竞争位置散点)
 * [POS]: /dashboard/data/overview 路由，登录后默认落地页；数据骨架对齐《GEO 品牌检测报告》
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)；图表全部走 ./_charts，不引第三方
 */
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NumberTicker } from '@/components/ui/number-ticker'
import { PageShell, PageSectionCard } from '../_PageShell'
import { BrandPlanFilter } from './_brandPlanFilter'
import { GaugeRing, ScatterChart, PlatformBadge } from './_charts'

/* ============================================================================
 * Mock 数据 (单一真相 · 对齐 GEO 品牌检测报告)
 * ========================================================================== */
/* GEO 得分 · delta = 最新一次检测 对比 上一次检测 */
const GEO = { score: 43.4, grade: '中等', rank: 5, total: 10, delta: { up: true, good: true, text: '+1.4' } }

/* KPI · value = 最新一次检测；delta = 对比上一次检测的变化 */
const KPIS = [
  { label: '综合得分排名', sub: '最新一次检测', value: 3, decimals: 0, prefix: '第 ', suffix: ' 名', judge: '靠前', trend: [6, 5.5, 5, 4.2, 3.6, 3.2, 3], delta: { up: true, good: true, text: '上升 1 名' } },
  { label: '品牌提及率', sub: '最新一次检测', value: 50, decimals: 0, suffix: '%', judge: '极高', trend: [20, 28, 35, 40, 45, 48, 50], delta: { up: true, good: true, text: '+5 个百分点' } },
  { label: '提及次数', sub: '累计总次数', value: 6, decimals: 0, suffix: ' 次', judge: '较多', trend: [0, 1, 2, 3, 4, 5, 6], delta: { up: true, good: true, text: '+2 次' } },
]

/* 竞争位置散点 · X=提及率 Y=平均排名(越小越靠前) 点大小=提及次数 */
const SCATTER = [
  { name: '孩视宝', x: 62.5, y: 4.6, size: 10 },
  { name: '书客', x: 62.5, y: 1.6, size: 13 },
  { name: '柏曼', x: 62.5, y: 3.4, size: 11 },
  { name: '霍尼韦尔', x: 50, y: 1.8, size: 8 },
  { name: '西屋大路灯', x: 50, y: 3.0, size: 6, target: true, color: 'var(--primary)' },
  { name: '漫书雨', x: 50, y: 2.8, size: 5 },
  { name: '琪朗', x: 37.5, y: 5.3, size: 6 },
  { name: '公牛', x: 37.5, y: 6.3, size: 3 },
  { name: '辰士达', x: 37.5, y: 3.3, size: 5 },
  { name: '月影', x: 25, y: 10.5, size: 4 },
]


/* 竞品 GEO 综合得分 TOP10 */
const COMPETITORS = [
  { rank: 1, brand: '孩视宝', score: 53.3, rate: '62.5%', count: 10, avgRank: 4.6, sentiment: '100%' },
  { rank: 2, brand: '书客', score: 53.3, rate: '62.5%', count: 13, avgRank: 1.6, sentiment: '100%' },
  { rank: 3, brand: '柏曼', score: 51.8, rate: '62.5%', count: 11, avgRank: 3.4, sentiment: '100%' },
  { rank: 4, brand: '霍尼韦尔', score: 43.6, rate: '50.0%', count: 8, avgRank: 1.8, sentiment: '100%' },
  { rank: 5, brand: '西屋大路灯', score: 43.4, rate: '50.0%', count: 6, avgRank: 3.0, sentiment: '100%', target: true },
  { rank: 6, brand: '漫书雨', score: 43.3, rate: '50.0%', count: 5, avgRank: 2.8, sentiment: '100%' },
  { rank: 7, brand: '琪朗', score: 38.0, rate: '37.5%', count: 6, avgRank: 5.3, sentiment: '100%' },
  { rank: 8, brand: '公牛', score: 36.5, rate: '37.5%', count: 3, avgRank: 6.3, sentiment: '100%' },
  { rank: 9, brand: '辰士达', score: 36.0, rate: '37.5%', count: 5, avgRank: 3.3, sentiment: '100%' },
  { rank: 10, brand: '月影', score: 28.0, rate: '25.0%', count: 4, avgRank: 10.5, sentiment: '100%' },
]

const SENTIMENT_PLATFORMS = ['豆包', 'DeepSeek', '通义千问', '元宝', '文心一言']
const SENTIMENT_DEVICES = ['网页', '手机']
const SENTIMENT_PAGE_SIZE = 5
const SENTIMENT_ROWS = [
  {
    scene: '店铺被美国法院 TRO 冻结资金，能快速解冻、不成功不收费的知产机构?',
    values: [0, 0, 0, 0, 0, 0, 0, 100, 0, 0],
  },
  {
    scene: '自有品牌被仿品泛滥，跨境知产哪家能全平台投诉、清理假货的?',
    values: [0, 0, 0, 0, 100, 0, 0, 0, 0, 0],
  },
  {
    scene: 'Temu 店铺因侵权被关，跨境知产哪家专做 Temu 申诉、成功率高?',
    values: [100, 0, 0, 100, 100, 100, 0, 0, 100, 0],
  },
  {
    scene: '欧盟商标注册哪家靠谱？要能查近似、包授权的',
    values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    scene: '收到 TRO 起诉，深圳哪家有美国律师团队、专做 TRO 应诉和解?',
    values: [0, 100, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    scene: '亚马逊链接被下架，哪家能做品牌申诉并恢复销售权限?',
    values: [0, 0, 100, 0, 0, 100, 0, 0, 0, 0],
  },
  {
    scene: '跨境店铺收到平台侵权警告，哪家机构能先评估风险?',
    values: [0, 0, 0, 0, 100, 0, 0, 100, 0, 0],
  },
  {
    scene: '美国商标被抢注，想找能做异议和无效的知产团队?',
    values: [100, 0, 0, 0, 0, 0, 100, 0, 0, 100],
  },
  {
    scene: '独立站图片被盗用，哪家能做版权取证和投诉下架?',
    values: [0, 100, 0, 100, 0, 0, 0, 0, 100, 0],
  },
  {
    scene: 'TikTok Shop 店铺被封，哪家跨境知产申诉经验更多?',
    values: [0, 0, 0, 0, 100, 0, 0, 0, 100, 0],
  },
  {
    scene: '品牌出海前要做商标检索和注册布局，哪家更稳妥?',
    values: [100, 0, 100, 0, 0, 0, 0, 100, 0, 0],
  },
  {
    scene: '被竞品恶意投诉侵权，哪家能快速出具反通知材料?',
    values: [0, 0, 0, 100, 0, 100, 0, 0, 0, 100],
  },
]

/* ============================================================================
 * 子组件
 * ========================================================================== */
/* 环比变化药丸 · 对比上一次检测 (good 走 primary / 反之 destructive) */
function DeltaTag({ delta, size = 'sm' }) {
  if (!delta) return null
  const Icon = delta.up ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold tabular-nums',
        size === 'lg' ? 'px-2.5 py-1 text-sm' : 'px-2 py-0.5 text-xs',
        delta.good ? 'text-primary' : 'text-destructive',
      )}
      style={{
        background: delta.good
          ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
          : 'color-mix(in srgb, var(--destructive) 12%, transparent)',
      }}
    >
      <Icon className={size === 'lg' ? 'size-4' : 'size-3.5'} />
      {delta.text}
    </span>
  )
}

function KpiCard({ k }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-background/40 p-5">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{k.label}</p>
        {k.sub && <p className="text-[11px] text-muted-foreground">{k.sub}</p>}
      </div>
      <div className="flex flex-1 items-center py-1">
        <p className="text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {k.prefix}
          <NumberTicker value={k.value} decimalPlaces={k.decimals} className="text-[2.75rem] font-semibold leading-none tracking-tight" />
          {k.suffix}
        </p>
      </div>
      {k.delta && (
        <div className="mt-auto flex items-center gap-1.5 pt-1">
          <DeltaTag delta={k.delta} />
          <span className="text-[11px] text-muted-foreground">较上次检测</span>
        </div>
      )}
    </div>
  )
}

function RankBadge({ rank }) {
  const top = rank <= 3
  return (
    <span
      className="inline-flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
      style={{
        color: top ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
        background: top
          ? 'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 75%, black) 100%)'
          : 'var(--muted)',
      }}
    >
      {rank}
    </span>
  )
}

function LatestDataHint() {
  return (
    <Badge variant="outline" className="h-7 rounded-xl px-3 text-xs text-muted-foreground">
      最新数据：2026-06-13
    </Badge>
  )
}

function SentimentCell({ value }) {
  const active = value >= 80
  return (
    <div
      className={cn(
        'flex h-14 min-w-24 items-center justify-center rounded-md text-sm font-semibold tabular-nums',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/40 text-muted-foreground'
      )}
    >
      {value}%
    </div>
  )
}

function SentimentHeatmap() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(SENTIMENT_ROWS.length / SENTIMENT_PAGE_SIZE)
  const start = (page - 1) * SENTIMENT_PAGE_SIZE
  const rows = SENTIMENT_ROWS.slice(start, start + SENTIMENT_PAGE_SIZE)
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-border">
        <div className="min-w-[58rem]">
          <div className="grid grid-cols-[15rem_repeat(10,minmax(6rem,1fr))] border-b border-border bg-muted/30">
            <div className="row-span-2 flex items-center justify-center border-r border-border p-4 text-sm font-medium text-foreground">
              问题场景
            </div>
            {SENTIMENT_PLATFORMS.map((platform) => (
              <div
                key={platform}
                className="col-span-2 flex items-center justify-center gap-2 border-r border-border p-3 text-sm font-medium text-foreground last:border-r-0"
              >
                <PlatformBadge name={platform} size={22} />
                {platform}
              </div>
            ))}
            {SENTIMENT_PLATFORMS.flatMap((platform) =>
              SENTIMENT_DEVICES.map((device) => (
                <div
                  key={`${platform}-${device}`}
                  className="border-r border-t border-border p-2 text-center text-xs text-muted-foreground last:border-r-0"
                >
                  {device}
                </div>
              ))
            )}
          </div>
          {rows.map((row) => (
            <div
              key={row.scene}
              className="grid grid-cols-[15rem_repeat(10,minmax(6rem,1fr))] border-b border-border last:border-b-0"
            >
              <div className="flex items-center border-r border-border p-4 text-sm font-medium leading-relaxed text-foreground">
                {row.scene}
              </div>
              {row.values.map((value, index) => (
                <div key={`${row.scene}-${index}`} className="border-r border-border p-2 last:border-r-0">
                  <SentimentCell value={value} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>共 {SENTIMENT_ROWS.length} 条数据</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="舆情分析首页" disabled={!canPrev} onClick={() => setPage(1)}>
            <ChevronsLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="舆情分析上一页" disabled={!canPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft />
          </Button>
          <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium tabular-nums text-primary-foreground">
            {page}
          </span>
          <span className="px-1 tabular-nums">/ {totalPages}</span>
          <Button variant="ghost" size="icon-sm" aria-label="舆情分析下一页" disabled={!canNext} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="舆情分析末页" disabled={!canNext} onClick={() => setPage(totalPages)}>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
 * 主体页面
 * ========================================================================== */
function DataOverview() {
  return (
    <PageShell actions={<BrandPlanFilter />}>
      {/* ====== 01 GEO 计分卡 (无外框 · 无标题 · 4 卡直接铺开) ====== */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* 得分卡 · 与右侧 KPI 同款结构 (标签 → 数值 → 较上次) */}
          <div className="flex flex-col gap-3 rounded-md border border-border bg-background/40 p-5">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">GEO 得分</p>
              <p className="text-[11px] text-muted-foreground">综合表现{GEO.grade} · 行业第 {GEO.rank} / {GEO.total}</p>
            </div>
            <div className="flex flex-1 items-center justify-center py-1">
              <GaugeRing value={GEO.score} size={148}>
                <span className="text-[2.5rem] font-semibold leading-none tracking-tight text-foreground">
                  <NumberTicker value={GEO.score} decimalPlaces={1} className="text-[2.5rem] font-semibold leading-none" />
                </span>
                <span className="text-[11px] text-muted-foreground">/ 100</span>
              </GaugeRing>
            </div>
            {GEO.delta && (
              <div className="mt-auto flex items-center gap-1.5 pt-1">
                <DeltaTag delta={GEO.delta} />
                <span className="text-[11px] text-muted-foreground">较上次检测</span>
              </div>
            )}
          </div>
          {KPIS.map((k) => (
            <KpiCard key={k.label} k={k} />
          ))}
        </div>
      </section>

      {/* ====== 04 竞品 GEO 得分 TOP10 ====== */}
      <PageSectionCard
        title="竞品 GEO 综合得分 TOP10"
        desc="竞品的 GEO 得分、提及率、提及次数、平均排名与情感倾向对比"
        actions={<LatestDataHint />}
      >
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="w-16 pl-4">排名</TableHead>
                <TableHead>品牌</TableHead>
                <TableHead className="w-52">GEO 得分</TableHead>
                <TableHead className="text-right">提及率</TableHead>
                <TableHead className="text-right">提及次数</TableHead>
                <TableHead className="text-right">平均排名</TableHead>
                <TableHead className="pr-4 text-right">正面/中性情感</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPETITORS.map((c) => (
                <TableRow key={c.brand} className={c.target ? 'bg-primary/5' : undefined}>
                  <TableCell className="pl-4"><RankBadge rank={c.rank} /></TableCell>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {c.brand}
                      {c.target && <Badge variant="outline" className="px-1.5 py-0">目标产品</Badge>}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.score}%`,
                            background: 'linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%)',
                          }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right text-sm tabular-nums">{c.score}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.rate}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.count}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.avgRank}</TableCell>
                  <TableCell className="pr-4 text-right tabular-nums text-muted-foreground">{c.sentiment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PageSectionCard>

      {/* ====== 06 舆情分析 ====== */}
      <PageSectionCard
        title="舆情分析"
        desc="问题场景 × 平台舆情热力图 · 展示不同场景下各平台网页与手机端的正面/中性提及率。深色单元格代表该维度形成高频正向共识。"
        actions={<LatestDataHint />}
      >
        <SentimentHeatmap />
      </PageSectionCard>

      {/* ====== 07 品牌竞争位置分布 (散点 · 置底) ====== */}
      <PageSectionCard
        title="品牌竞争位置分布"
        desc="提及率 × 平均排名散点图 · 越靠右上角竞争力越强 · 点大小代表提及次数"
        actions={<LatestDataHint />}
      >
        <div className="rounded-md border border-border bg-background/40 p-4">
          <ScatterChart points={SCATTER} xMax={70} yMax={11} />
        </div>
      </PageSectionCard>
    </PageShell>
  )
}

export default DataOverview
