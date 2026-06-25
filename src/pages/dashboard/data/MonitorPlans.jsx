/**
 * [INPUT]: 依赖 ui/Button+Badge+Table+Dialog+Input+Popover+ScrollArea+Checkbox，lucide 图标，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 MonitorPlans — 监测计划页 (增加监测计划表单 + 计划表 恢复/暂停/删除/修改)
 * [POS]: /dashboard/data/monitor 路由，数据中心子页
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)；状态/操作随行变化
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp, Minus, Plus, Search, Tags, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimePicker } from '@/components/ui/date-picker'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { PageShell, PageSectionCard } from '../_PageShell'

/* ============================================================================
 * Mock 数据
 * ========================================================================== */
const INITIAL_PLANS = [
  {
    id: 1,
    brand: '西屋大路灯',
    brandTerms: ['西屋大路灯'],
    source: '我的计划',
    scenarios: [],
    platforms: ['doubao', 'deepseek', 'kimi', 'chatgpt'],
    freq: '1天1次',
    cost: 0,
    updatedAt: '2026-05-16 14:20:39',
    status: 'paused',
  },
]

const STATUS_META = {
  running: { label: '监测中', variant: 'accent' },
  paused: { label: '已暂停', variant: 'secondary' },
}

const SCENARIO_TOPICS = [
  {
    id: 'purchase',
    label: '选购决策',
    scenarios: [
      { value: 'lighting-ranking', label: '照明选购推荐' },
      { value: 'price-compare', label: '价格对比' },
    ],
  },
  {
    id: 'reputation',
    label: '口碑体验',
    scenarios: [
      { value: 'usage-review', label: '使用体验评价' },
      { value: 'brand-compare', label: '品牌对比' },
    ],
  },
  {
    id: 'service',
    label: '安装售后',
    scenarios: [
      { value: 'installation', label: '安装维护' },
    ],
  },
]

const ALL_SCENARIOS = SCENARIO_TOPICS.flatMap((topic) => topic.scenarios)

const PLATFORM_OPTIONS = [
  { value: 'doubao', label: '豆包' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'kimi', label: 'Kimi' },
  { value: 'chatgpt', label: 'ChatGPT' },
]

const DEFAULT_FORM = {
  brand: '',
  brandTerms: [],
  frequencyDays: 1,
  startTime: '09:00:00',
  scenarios: [],
  platforms: [],
}

const getFrequencyLabel = (days) => `每${Math.max(1, days)}天1次`
const formatMinuteTime = (time) => time.slice(0, 5)

let seq = INITIAL_PLANS.length

/* ============================================================================
 * ScenarioTopicSelect · 话题 / 场景词级联选择
 * ========================================================================== */
function ScenarioTopicSelect({ value, onValueChange }) {
  const [open, setOpen] = useState(false)
  const [activeTopicId, setActiveTopicId] = useState(SCENARIO_TOPICS[0]?.id)
  const [query, setQuery] = useState('')

  const activeTopic = SCENARIO_TOPICS.find((topic) => topic.id === activeTopicId) ?? SCENARIO_TOPICS[0]
  const activeScenarios = activeTopic?.scenarios ?? []
  const visibleScenarios = query
    ? activeScenarios.filter((scenario) => scenario.label.includes(query))
    : activeScenarios
  const selectedCount = value.length
  const allSelected = ALL_SCENARIOS.length > 0 && selectedCount === ALL_SCENARIOS.length
  const triggerValue = selectedCount > 0 ? `${selectedCount} 项` : '请选择'
  const Chevron = open ? ChevronUp : ChevronDown

  const commit = (next) => onValueChange([...new Set(next)])

  const handleRowKeyDown = (event, action) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    action()
  }

  const toggleScenario = (scenarioValue) => {
    if (value.includes(scenarioValue)) {
      commit(value.filter((item) => item !== scenarioValue))
      return
    }
    commit([...value, scenarioValue])
  }

  const selectTopic = (topic) => {
    setActiveTopicId(topic.id)
    const topicValues = topic.scenarios.map((scenario) => scenario.value)
    const topicSelected = topicValues.every((scenarioValue) => value.includes(scenarioValue))
    if (topicSelected) return
    commit([...value, ...topicValues])
  }

  const toggleAll = () =>
    commit(allSelected ? [] : ALL_SCENARIOS.map((scenario) => scenario.value))

  const topicState = (topic) => {
    const topicValues = topic.scenarios.map((scenario) => scenario.value)
    const checkedCount = topicValues.filter((scenarioValue) => value.includes(scenarioValue)).length
    if (checkedCount === topicValues.length) return true
    if (checkedCount > 0) return 'indeterminate'
    return false
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border/60 bg-background px-3 text-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Tags className="size-4 text-muted-foreground" />
          <span className="text-muted-foreground">场景词</span>
          <span className="h-4 w-px bg-border" />
          <span className="font-medium text-foreground">{triggerValue}</span>
          <Chevron className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[34rem] p-0">
        <div className="grid max-h-96 grid-cols-[12rem_1fr] overflow-hidden rounded-lg">
          <div className="border-r border-border bg-muted/30 p-2">
            <div
              role="button"
              tabIndex={0}
              onClick={toggleAll}
              onKeyDown={(event) => handleRowKeyDown(event, toggleAll)}
              className="mb-2 flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <Checkbox checked={allSelected} className="pointer-events-none" />
                全部话题
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">{ALL_SCENARIOS.length}</span>
            </div>
            <div className="space-y-1">
              {SCENARIO_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectTopic(topic)}
                  onKeyDown={(event) => handleRowKeyDown(event, () => selectTopic(topic))}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                    activeTopicId === topic.id && 'bg-background shadow-sm',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Checkbox checked={topicState(topic)} className="pointer-events-none" />
                    <span className="truncate">{topic.label}</span>
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {topic.scenarios.length}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索场景词"
                className="h-9 pl-8"
              />
            </div>
            <ScrollArea className="h-72">
              <div className="space-y-1 pr-2">
                {visibleScenarios.map((scenario) => (
                  <div
                    key={scenario.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleScenario(scenario.value)}
                    onKeyDown={(event) => handleRowKeyDown(event, () => toggleScenario(scenario.value))}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={value.includes(scenario.value)}
                      className="pointer-events-none"
                    />
                    <span>{scenario.label}</span>
                  </div>
                ))}
                {visibleScenarios.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    没有匹配的场景词
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ============================================================================
 * MonitorPlans
 * ========================================================================== */
function MonitorPlans() {
  const [plans, setPlans] = useState(INITIAL_PLANS)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [brandTermDraft, setBrandTermDraft] = useState('')

  const toggleStatus = (id) =>
    setPlans((list) =>
      list.map((p) =>
        p.id === id ? { ...p, status: p.status === 'running' ? 'paused' : 'running' } : p,
      ),
    )

  const removePlan = (id) => setPlans((list) => list.filter((p) => p.id !== id))

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const togglePlatform = (value) =>
    setForm((current) => ({
      ...current,
      platforms: current.platforms.includes(value)
        ? current.platforms.filter((item) => item !== value)
        : [...current.platforms, value],
    }))

  const resetForm = () => setForm(DEFAULT_FORM)

  const addBrandTerm = (rawTerm = brandTermDraft || form.brand) => {
    const term = rawTerm.trim()
    if (!term || form.brandTerms.includes(term) || form.brandTerms.length >= 20) return
    updateForm('brandTerms', [...form.brandTerms, term])
    setBrandTermDraft('')
  }

  const removeBrandTerm = (term) =>
    updateForm('brandTerms', form.brandTerms.filter((item) => item !== term))

  const updateFrequencyDays = (nextValue) =>
    setForm((current) => ({
      ...current,
      frequencyDays: Math.max(1, Number(nextValue) || 1),
    }))

  const canSubmit =
    form.brand.trim() && form.scenarios.length > 0 && form.platforms.length > 0

  const addPlan = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    seq += 1
    setPlans((list) => [
      ...list,
      {
        id: seq,
        brand: form.brand.trim(),
        brandTerms: form.brandTerms,
        startAt: formatMinuteTime(form.startTime),
        source: '我的计划',
        scenarios: form.scenarios,
        platforms: form.platforms,
        freq: getFrequencyLabel(form.frequencyDays),
        cost: 0,
        updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        status: 'paused',
      },
    ])
    resetForm()
    setBrandTermDraft('')
    setOpen(false)
  }

  return (
    <PageShell>
      <PageSectionCard
        title="监测计划"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" leftIcon={<Plus />}>
                增加监测计划
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <form onSubmit={addPlan} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>增加监测计划</DialogTitle>
                  <DialogDescription>
                    设置品牌、监测周期、场景词和监测平台。
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="monitor-brand">监测品牌名称</Label>
                  <Input
                    id="monitor-brand"
                    value={form.brand}
                    onChange={(event) => updateForm('brand', event.target.value)}
                    placeholder="请输入品牌名称"
                  />
                </div>

                <div className="flex flex-col gap-2 rounded-md border border-border/60 p-3 sm:flex-row sm:items-center">
                  <Label className="shrink-0 text-sm text-foreground sm:w-24">
                    品牌词配置：
                  </Label>
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    {form.brandTerms.map((term) => (
                      <Badge key={term} variant="outline" className="h-8 gap-1 rounded-xl px-3">
                        {term}
                        <button
                          type="button"
                          onClick={() => removeBrandTerm(term)}
                          className="rounded-full text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`删除品牌词 ${term}`}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      value={brandTermDraft}
                      onChange={(event) => setBrandTermDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return
                        event.preventDefault()
                        addBrandTerm()
                      }}
                      placeholder="输入品牌词"
                      className="h-8 w-28 px-3"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addBrandTerm()}
                      disabled={form.brandTerms.length >= 20}
                    >
                      新增品牌词
                    </Button>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {form.brandTerms.length}/20
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Label className="shrink-0 text-base text-muted-foreground sm:w-24">
                    监测周期：
                  </Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex h-11 overflow-hidden rounded-md border border-border bg-background">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-full w-12 rounded-none border-r border-border text-muted-foreground hover:scale-100"
                        onClick={() => updateFrequencyDays(form.frequencyDays - 1)}
                        disabled={form.frequencyDays <= 1}
                        aria-label="减少监测周期天数"
                      >
                        <Minus />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        inputMode="numeric"
                        value={form.frequencyDays}
                        onChange={(event) => updateFrequencyDays(event.target.value)}
                        className="h-full w-16 rounded-none border-0 px-2 text-center text-base tabular-nums"
                        aria-label="监测周期天数"
                      />
                      <span className="flex h-full items-center border-l border-border px-4 text-sm text-foreground">
                        天
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="h-full w-12 rounded-none border-l border-border text-muted-foreground hover:scale-100"
                        onClick={() => updateFrequencyDays(form.frequencyDays + 1)}
                        aria-label="增加监测周期天数"
                      >
                        <Plus />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      系统将每隔 {form.frequencyDays} 天自动执行一次品牌监测
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Label className="shrink-0 text-base text-muted-foreground sm:w-24">
                    开始时间：
                  </Label>
                  <div className="flex flex-wrap items-center gap-4">
                    <TimePicker
                      value={form.startTime}
                      onChange={(time) => updateForm('startTime', time)}
                      precision="minute"
                      className="w-36"
                    />
                    <p className="text-sm text-muted-foreground">
                      建议尽量选择凌晨时段，减少对日间业务数据的影响
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>场景词</Label>
                  <ScenarioTopicSelect
                    value={form.scenarios}
                    onValueChange={(value) => updateForm('scenarios', value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>监测平台</Label>
                  <div className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const checked = form.platforms.includes(platform.value)
                      return (
                        <label
                          key={platform.value}
                          htmlFor={`monitor-platform-${platform.value}`}
                          className="flex cursor-pointer items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm transition-colors hover:bg-muted"
                        >
                          <Checkbox
                            id={`monitor-platform-${platform.value}`}
                            checked={checked}
                            onCheckedChange={() => togglePlatform(platform.value)}
                          />
                          <span>{platform.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={!canSubmit}>
                    保存计划
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* 计划表 */}
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">监测品牌</TableHead>
                <TableHead className="text-right">场景词</TableHead>
                <TableHead className="text-right">监测平台</TableHead>
                <TableHead>监测周期</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    暂无监测计划
                  </TableCell>
                </TableRow>
              )}
              {plans.map((p) => {
                const status = STATUS_META[p.status] ?? STATUS_META.paused
                return (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4 font-medium">{p.brand}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.scenarios.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.platforms.length}</TableCell>
                    <TableCell className="text-muted-foreground">{p.freq}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{p.updatedAt}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => toggleStatus(p.id)}>
                          {p.status === 'running' ? '暂停监测' : '恢复监测'}
                        </Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0">修改计划</Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => removePlan(p.id)}>删除监测</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </PageSectionCard>
    </PageShell>
  )
}

export default MonitorPlans
