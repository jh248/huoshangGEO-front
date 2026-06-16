/**
 * [INPUT]: 依赖 ui/Popover+Checkbox+Button+MultiSelect，lucide 图标，本地 _charts PlatformBadge
 * [OUTPUT]: 命名导出 FilterPill (DateFilter 触发器) / DateFilter / PlatformFilter / TermFilter / MultiCheckFilter / TargetProductPill
 * [POS]: pages/dashboard/data 私有筛选层，数据中心 Overview / Scenarios / Diagnosis 共享消费
 * [PROTOCOL]: 多选筛选 (PlatformFilter / TermFilter / MultiCheckFilter) 一律走 ui/MultiSelect 原语；
 *             DateFilter = 预设 + FilterPill 触发器在此私有定制，日历网格复用 ui/date-picker 的 Calendar (range 模式)
 *             DateFilter value: { preset: 'yesterday'|'7d'|'30d'|'custom', start?: ymd, end?: ymd } · ymd: { year, month(0-11), day }
 *             非 custom preset 由 presetRange 派生时间段；custom 由用户在日历点两次划定 start/end (顺序自动纠正)
 */
import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Layers,
  ListChecks,
  Search,
} from 'lucide-react'
import { Calendar } from '@/components/ui/date-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useProduct } from '@/contexts/ProductContext'
import { cn } from '@/lib/utils'
import { PlatformBadge } from './_charts'

/* ============================================================================
 * FilterPill · 通用触发器 (label | value ▾)
 * ========================================================================== */
export function FilterPill({ Icon, label, value, open }) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 text-sm transition-colors hover:bg-muted">
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}</span>
      <span className="h-4 w-px bg-border" />
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">{value}</span>
      <Chevron className="size-3.5 text-muted-foreground" />
    </span>
  )
}

/* ============================================================================
 * DateFilter · 预设 + 日历区间 (value: { preset, start?, end? })
 * ========================================================================== */
const DATE_PRESETS = [
  { value: 'yesterday', label: '昨天' },
  { value: '7d', label: '最近 7 天' },
  { value: '30d', label: '最近 30 天' },
]

function toYmd(d) { return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() } }
function ymdToTs(ymd) { return new Date(ymd.year, ymd.month, ymd.day).getTime() }
function formatYmd(ymd) { return `${ymd.year}/${ymd.month + 1}/${ymd.day}` }

function presetRange(preset) {
  if (!preset || preset === 'custom') return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (preset === 'yesterday') {
    const y = new Date(today); y.setDate(y.getDate() - 1)
    const ymd = toYmd(y)
    return { start: ymd, end: ymd }
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : null
  if (!days) return null
  const s = new Date(today); s.setDate(s.getDate() - days + 1)
  return { start: toYmd(s), end: toYmd(today) }
}

export function DateFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)

  const effectiveRange = value.preset === 'custom'
    ? { start: value.start ?? null, end: value.end ?? null }
    : presetRange(value.preset)

  const preset = DATE_PRESETS.find((p) => p.value === value.preset)
  const triggerValue = value.preset === 'custom'
    ? (value.start && value.end
        ? `${formatYmd(value.start)} - ${formatYmd(value.end)}`
        : value.start
        ? `${formatYmd(value.start)} 起`
        : '选择日期')
    : (preset?.label ?? '最近 7 天')

  const handleSelect = (picked) => {
    const pending = value.preset === 'custom' && value.start && !value.end
    if (!pending) {
      onChange({ preset: 'custom', start: picked, end: null })
      return
    }
    const startTs = ymdToTs(value.start)
    const pickedTs = ymdToTs(picked)
    if (pickedTs < startTs) {
      onChange({ preset: 'custom', start: picked, end: value.start })
    } else {
      onChange({ preset: 'custom', start: value.start, end: picked })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
          <FilterPill Icon={CalendarDays} label="日期" value={triggerValue} open={open} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="space-y-1">
          {DATE_PRESETS.map((p) => {
            const checked = value.preset === p.value
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => onChange({ preset: p.value, start: null, end: null })}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                  checked ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Checkbox checked={checked} className="pointer-events-none" />
                {p.label}
              </button>
            )
          })}
        </div>
        <hr className="my-3 border-border" />
        <Calendar mode="range" range={effectiveRange} onSelect={handleSelect} />
        {value.preset === 'custom' && value.start && !value.end && (
          <p className="mt-2 text-center text-[10px] text-muted-foreground">已选起始日，请再点一次选择结束日</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ============================================================================
 * MultiCheckFilter · 通用多选 — 委托 ui/MultiSelect (筛选层唯一原语)
 *   selected ↔ value · onChange ↔ onValueChange (兼容历史调用方)
 * ========================================================================== */
export function MultiCheckFilter({ Icon, label, options, selected, onChange, withSearch = false, renderItem }) {
  return (
    <MultiSelect
      Icon={Icon}
      label={label}
      options={options}
      value={selected}
      onValueChange={onChange}
      withSearch={withSearch}
      renderItem={renderItem}
    />
  )
}

/* ============================================================================
 * PlatformFilter · 平台多选 (带 PlatformBadge 头像)
 * ========================================================================== */
export const PLATFORM_OPTIONS = [
  { value: 'DeepSeek', label: 'DeepSeek' },
  { value: '豆包', label: '豆包' },
  { value: '文心一言', label: '文心一言' },
  { value: '千问', label: '千问' },
  { value: 'Kimi', label: 'Kimi' },
]

export function PlatformFilter({ selected, onChange }) {
  return (
    <MultiCheckFilter
      Icon={Layers}
      label="平台"
      options={PLATFORM_OPTIONS}
      selected={selected}
      onChange={onChange}
      renderItem={(o) => (
        <>
          <PlatformBadge name={o.label} size={20} />
          <span className="flex-1 truncate">{o.label}</span>
        </>
      )}
    />
  )
}

/* ============================================================================
 * TermFilter · 场景词多选 (带搜索)
 * ========================================================================== */
export function TermFilter({ options, selected, onChange }) {
  return (
    <MultiCheckFilter
      Icon={ListChecks}
      label="场景词"
      withSearch
      options={options}
      selected={selected}
      onChange={onChange}
    />
  )
}

/* ============================================================================
 * TargetProductPill · 当前目标产品选择器 (FilterPill 触发器 · Popover · 搜索 · 单选 · 自消费 ProductContext)
 * ========================================================================== */
export function TargetProductPill() {
  const { products, current, switchTo } = useProduct()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    )
  }, [products, query])

  const pick = (id) => {
    switchTo(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <FilterPill Icon={Crown} label="目标产品" value={current.name} open={open} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-2xl p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索产品 / 品类"
            className="h-9 pl-8"
          />
        </div>
        <ScrollArea className="max-h-80">
          <div className="space-y-1 pr-1">
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                未找到匹配的产品
              </p>
            )}
            {filtered.map((p) => {
              const checked = p.id === current.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pick(p.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    'bg-muted/60 text-foreground hover:bg-muted',
                    checked && 'bg-foreground text-background hover:bg-foreground'
                  )}
                >
                  <p.Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate font-medium">{p.name}</span>
                  <span
                    className={cn(
                      'text-xs',
                      checked ? 'text-background/70' : 'text-muted-foreground'
                    )}
                  >
                    {p.category}
                  </span>
                  {checked && <Check className="size-4 shrink-0" />}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
