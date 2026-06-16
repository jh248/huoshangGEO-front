/**
 * [INPUT]: 依赖 ui/Button+Checkbox+Input+Tooltip，lucide 图标，本地 _charts PlatformBadge + _filters DateFilter，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 Diagnosis — 品牌诊断 2 段式 (诊断配置 + 诊断记录)
 * [POS]: /dashboard/data/diagnosis 路由 · 由 stubs.jsx 拆出独立文件
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)；不引第三方；时间筛选一律使用 ./_filters DateFilter
 */
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PageShell, PageSectionCard } from '../_PageShell'
import { PlatformBadge } from './_charts'
import { DateFilter } from './_filters'
import { cn } from '@/lib/utils'

/* ============================================================================
 * Mock 数据
 * ========================================================================== */
const PLATFORMS = [
  { id: 'doubao', name: '豆包' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'qianwen', name: '通义千问' },
  { id: 'yuanbao', name: '元宝' },
  { id: 'wenxin', name: '文心一言' },
  { id: 'kimi', name: 'Kimi' },
]

const METRIC_HINTS = {
  score: '综合各项指标计算得到的品牌总分 (0-100)',
  rate: '品牌在对话中被命名提及的覆盖比例',
  rank: '品牌在多品牌列举中的平均排名 (越小越靠前)',
  count: '品牌在所有对话中被命名提及的总次数',
  sentiment: '正面与中性提及合计占比',
}

const RECORDS = [
  { id: 1, brand: 'PUMA', time: '2026-05-30 14:23:43', status: 'searching' },
  { id: 2, brand: 'iPhone', time: '2026-05-30 11:56:40', status: 'done',
    score: '95.09', rate: '82.98', rank: '1.13', count: '280', sentiment: '94.87' },
  { id: 3, brand: '小米手机', time: '2026-05-30 11:20:05', status: 'done',
    score: '48.17', rate: '55.56', rank: '1', count: '14', sentiment: '100' },
  { id: 4, brand: 'oppo手机', time: '2026-05-29 16:54:46', status: 'done',
    score: '67.4', rate: '80', rank: '1', count: '23', sentiment: '100' },
  { id: 5, brand: '三只松鼠', time: '2026-05-29 15:23:50', status: 'done',
    score: '72.93', rate: '87.5', rank: '1', count: '22', sentiment: '100' },
  { id: 6, brand: '三只松鼠', time: '2026-05-29 15:16:26', status: 'searching' },
  { id: 7, brand: '西屋大路灯', time: '2026-05-28 18:40:52', status: 'done',
    score: '20.2', rate: '20', rank: '1', count: '1', sentiment: '100' },
  { id: 8, brand: '西屋大路灯', time: '2026-05-28 16:29:35', status: 'searching' },
]

/* ============================================================================
 * 子组件
 * ========================================================================== */
function MetricHintIcon({ k }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground/70 hover:text-foreground">
          <HelpCircle className="size-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{METRIC_HINTS[k]}</TooltipContent>
    </Tooltip>
  )
}

function MetricCell({ k, label, value, unit, valueClass }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-baseline gap-0.5">
        <span className={cn('text-2xl font-semibold tabular-nums', valueClass)}>{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        <MetricHintIcon k={k} />
      </p>
    </div>
  )
}

function DeepChip({ pressed, onToggle }) {
  return (
    <Button
      variant="outline"
      size="sm"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cn(
        'h-5 rounded-full px-2 text-[10px] font-normal',
        pressed
          ? 'border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/15'
          : 'text-muted-foreground'
      )}
    >
      深度
    </Button>
  )
}

function PlatformOption({ platform, value, onChange }) {
  const toggle = (key) => onChange({ ...value, [key]: !value[key] })
  return (
    <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-3 pb-3 pt-7">
      <div className="absolute -top-4">
        <PlatformBadge name={platform.name} size={36} />
      </div>
      <span className="text-sm font-medium">{platform.name}</span>
      <div className="flex w-full flex-col gap-1.5">
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5">
            <Checkbox checked={value.web} onCheckedChange={() => toggle('web')} />
            网页
          </span>
          <DeepChip pressed={value.webDeep} onToggle={() => toggle('webDeep')} />
        </label>
        <label className="flex items-center justify-between gap-2 text-xs">
          <span className="flex items-center gap-1.5">
            <Checkbox checked={value.mobile} onCheckedChange={() => toggle('mobile')} />
            手机
          </span>
          <DeepChip pressed={value.mobileDeep} onToggle={() => toggle('mobileDeep')} />
        </label>
      </div>
    </div>
  )
}

function BrandAvatar({ name }) {
  const letter = name.slice(0, 1).toUpperCase()
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
      style={{
        background:
          'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 78%, black) 100%)',
        boxShadow:
          '0 2px 4px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25)',
      }}
    >
      {letter}
    </span>
  )
}

function RecordCard({ r }) {
  const isSearching = r.status === 'searching'
  return (
    <article className="rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:bg-muted/30">
      <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,12rem)_1fr_minmax(0,12rem)]">
        {/* 左：品牌 + 操作 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BrandAvatar name={r.brand} />
            <span className="truncate text-sm font-medium">{r.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">查看结果</Button>
            <Button variant="ghost" size="sm">重新搜索</Button>
          </div>
        </div>

        {/* 中：指标 / 搜索中占位 */}
        {isSearching ? (
          <div className="flex items-center justify-center rounded-xl bg-muted/40 py-6 text-sm text-muted-foreground">
            正在搜索中…
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
            <MetricCell k="score" label="品牌得分" value={r.score} unit="/100" valueClass="text-destructive" />
            <MetricCell k="rate" label="品牌提及率" value={r.rate} unit="%" />
            <MetricCell k="rank" label="平均提及排名" value={r.rank} unit="名" />
            <MetricCell k="count" label="品牌提及次数" value={r.count} unit="次" />
            <MetricCell k="sentiment" label="正面/中性情感倾向" value={r.sentiment} unit="%" />
          </div>
        )}

        {/* 右：时间 + 删除 */}
        <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end">
          <span className="text-xs tabular-nums text-muted-foreground">{r.time}</span>
          <Button variant="outline" size="sm" leftIcon={<Trash2 />}>删除</Button>
        </div>
      </div>
    </article>
  )
}

/* ============================================================================
 * 主体页面
 * ========================================================================== */
function Diagnosis() {
  const [brand, setBrand] = useState('小米')
  const initial = Object.fromEntries(
    PLATFORMS.map((p) => [p.id, { web: true, webDeep: false, mobile: true, mobileDeep: false }])
  )
  const [selection, setSelection] = useState(initial)
  const [allChecked, setAllChecked] = useState(true)
  const [deepChecked, setDeepChecked] = useState(true)

  const [searchBrand, setSearchBrand] = useState('')
  const [dateValue, setDateValue] = useState({ preset: '30d' })

  const setOne = (id, v) => setSelection((s) => ({ ...s, [id]: v }))
  const toggleAll = (checked) => {
    setAllChecked(checked)
    setSelection(
      Object.fromEntries(
        PLATFORMS.map((p) => [p.id, { web: checked, webDeep: false, mobile: checked, mobileDeep: false }])
      )
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <PageShell>
        {/* ====== 01 诊断配置 ====== */}
        <PageSectionCard>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-sm text-muted-foreground">品牌名称</span>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="max-w-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3 lg:grid-cols-6">
              {PLATFORMS.map((p) => (
                <PlatformOption
                  key={p.id}
                  platform={p}
                  value={selection[p.id]}
                  onChange={(v) => setOne(p.id, v)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={allChecked} onCheckedChange={(c) => toggleAll(Boolean(c))} />
                全选
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={deepChecked} onCheckedChange={(c) => setDeepChecked(Boolean(c))} />
                深度思考
              </label>
              <Button leftIcon={<Search />}>搜索一下</Button>
            </div>
          </div>
        </PageSectionCard>

        {/* ====== 02 诊断记录 ====== */}
        <PageSectionCard
          title="诊断记录"
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  placeholder="品牌"
                  className="h-9 w-40 pl-8"
                />
              </div>
              <DateFilter value={dateValue} onChange={setDateValue} />
              <Button size="sm">搜索</Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3">
            {RECORDS.map((r) => <RecordCard key={r.id} r={r} />)}
          </div>

          {/* 分页 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>共 {RECORDS.length} 条</span>
            <Button variant="ghost" size="icon-sm" aria-label="上一页" disabled><ChevronLeft /></Button>
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">1</span>
            <Button variant="ghost" size="icon-sm" aria-label="下一页" disabled><ChevronRight /></Button>
            <span className="ml-2">10 条/页</span>
          </div>
        </PageSectionCard>
      </PageShell>
    </TooltipProvider>
  )
}

export default Diagnosis
