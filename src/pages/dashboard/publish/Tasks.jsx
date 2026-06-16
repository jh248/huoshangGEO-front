/**
 * [INPUT]: 依赖 react state/effect，ui/Button+Badge+Dialog+Input+Label+Tabs+Select+DatePicker+Checkbox+ScrollArea+Progress+Table，lucide 图标，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 Tasks — 发布任务管理 (任务列表 运行/停止/删除 + 添加任务 Dialog · 固定时间/每天/每周/每月调度 · 多选文章+媒体 · 单次仅一篇 · 每次触发发一篇直到发完自动停止)
 * [POS]: /dashboard/publish/tasks 路由，从 stubs.jsx 拆出独立文件
 * [PROTOCOL]: mock 数据写在模块顶部；颜色一律走 var(--token) 语义类；运行态由页面级 setInterval 模拟逐篇发布
 */
import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DateTimePicker, TimePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { cn } from '@/lib/utils'
import { PageShell, PageSectionCard } from '../_PageShell'

/* ============================================================================
 * Mock 数据与调度常量
 * ========================================================================== */
const ARTICLE_POOL = [
  { id: 'a1', title: '2026 年中型 SUV 选购指南：理想 L8 对比深度评测' },
  { id: 'a2', title: '增程式电动车原理与车型推荐' },
  { id: 'a3', title: '家庭用车七座 SUV 横评：空间与续航解析' },
  { id: 'a4', title: '智能驾驶辅助系统能力对比' },
  { id: 'a5', title: '高速续航实测：城市通勤一周能耗报告' },
  { id: 'a6', title: '冬季续航稳定的电动车怎么选' },
  { id: 'a7', title: '理想 L9 与蔚来 ES8 全面对比' },
  { id: 'a8', title: '充电快没有焦虑的电动车推荐' },
]

const MEDIA_POOL = [
  { id: 'baijiahao', name: '百家号' },
  { id: 'toutiao', name: '今日头条' },
  { id: 'zhihu', name: '知乎' },
  { id: 'sohu', name: '搜狐号' },
  { id: 'juejin', name: '掘金' },
]

const SCHEDULE_TYPES = [
  { value: 'once', label: '固定时间' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
]

const WEEKDAYS = [
  { value: '1', label: '周一' },
  { value: '2', label: '周二' },
  { value: '3', label: '周三' },
  { value: '4', label: '周四' },
  { value: '5', label: '周五' },
  { value: '6', label: '周六' },
  { value: '7', label: '周日' },
]


const MONTH_DAYS = Array.from({ length: 28 }, (_, i) => String(i + 1))

const DATE_OPTIONS = Array.from({ length: 14 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const label = i === 0 ? `今天 ${value}` : i === 1 ? `明天 ${value}` : value
  return { value, label }
})

const INITIAL_TASKS = [
  {
    id: 't1',
    name: '理想 L8 评测·每周推送',
    scheduleType: 'weekly',
    weekday: '1',
    time: '09:00:00',
    articleIds: ['a1', 'a2', 'a3'],
    mediaIds: ['baijiahao', 'toutiao'],
    status: 'running',
    publishedCount: 1,
  },
  {
    id: 't2',
    name: '增程车科普·固定发布',
    scheduleType: 'once',
    date: DATE_OPTIONS[2].value,
    time: '10:00:00',
    articleIds: ['a4'],
    mediaIds: ['zhihu'],
    status: 'stopped',
    publishedCount: 0,
  },
]

/* ============================================================================
 * 工具
 * ========================================================================== */
function scheduleSummary(task) {
  const t = task.time
  if (task.scheduleType === 'once') return `${task.date} ${t} · 单次`
  if (task.scheduleType === 'daily') return `每天 ${t}`
  if (task.scheduleType === 'weekly') {
    const wd = WEEKDAYS.find((w) => w.value === task.weekday)?.label ?? '周一'
    return `每${wd} ${t}`
  }
  return `每月 ${task.monthday} 号 ${t}`
}

const STATUS_META = {
  running: { label: '运行中', variant: 'default' },
  stopped: { label: '已停止', variant: 'outline' },
  completed: { label: '已完成', variant: 'secondary' },
}

// 'YYYY-MM-DD' ↔ ymd { year, month(0-11), day }（DateTimePicker 用 ymd，调度数据存字符串）
function strToYmd(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}
function ymdToStr(v) {
  return `${v.year}-${String(v.month + 1).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`
}

function emptyForm() {
  return {
    name: '',
    scheduleType: 'once',
    date: DATE_OPTIONS[0].value,
    time: '09:00:00',
    weekday: '1',
    monthday: '1',
    articleIds: [],
    mediaIds: [],
  }
}

/* ============================================================================
 * 添加任务 Dialog
 * ========================================================================== */
function TaskFormDialog({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(emptyForm)
  const isOnce = form.scheduleType === 'once'

  const set = (patch) => setForm((cur) => ({ ...cur, ...patch }))

  const changeType = (type) => {
    setForm((cur) => ({
      ...cur,
      scheduleType: type,
      // 单次只能保留一篇文章
      articleIds: type === 'once' ? cur.articleIds.slice(0, 1) : cur.articleIds,
    }))
  }

  const toggleArticle = (id) => {
    setForm((cur) => {
      if (cur.scheduleType === 'once') return { ...cur, articleIds: [id] }
      const has = cur.articleIds.includes(id)
      return {
        ...cur,
        articleIds: has ? cur.articleIds.filter((x) => x !== id) : [...cur.articleIds, id],
      }
    })
  }

  const toggleMedia = (id) => {
    setForm((cur) => {
      const has = cur.mediaIds.includes(id)
      return {
        ...cur,
        mediaIds: has ? cur.mediaIds.filter((x) => x !== id) : [...cur.mediaIds, id],
      }
    })
  }

  const valid =
    form.name.trim() &&
    form.articleIds.length > 0 &&
    form.mediaIds.length > 0 &&
    (!isOnce || form.articleIds.length === 1)

  const submit = () => {
    if (!valid) return
    onSubmit({ ...form, name: form.name.trim() })
    setForm(emptyForm())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加发布任务</DialogTitle>
          <DialogDescription>
            配置定时发布规则，选择文章与发布媒体。单次任务仅发布一篇，周期任务每次触发发布一篇，发完自动停止。
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[60vh] gap-5 overflow-y-auto px-1 py-1">
          <div className="grid gap-2">
            <Label htmlFor="task-name">任务名称</Label>
            <Input
              id="task-name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="例如：理想 L8 评测·每周推送"
            />
          </div>

          <div className="grid gap-2">
            <Label>调度方式</Label>
            <Tabs value={form.scheduleType} onValueChange={changeType}>
              <TabsList>
                {SCHEDULE_TYPES.map((s) => (
                  <TabsTrigger key={s.value} value={s.value}>{s.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-2">
              {isOnce ? (
                <DateTimePicker
                  date={strToYmd(form.date)}
                  time={form.time}
                  onChange={(ymd, t) =>
                    set({ date: ymd ? ymdToStr(ymd) : form.date, time: t })
                  }
                  fromToday
                />
              ) : (
                <>
                  {form.scheduleType === 'weekly' && (
                    <Select value={form.weekday} onValueChange={(v) => set({ weekday: v })}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {WEEKDAYS.map((w) => (
                          <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {form.scheduleType === 'monthly' && (
                    <Select value={form.monthday} onValueChange={(v) => set({ monthday: v })}>
                      <SelectTrigger className="w-28"><SelectValue placeholder="日期" /></SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {MONTH_DAYS.map((d) => (
                          <SelectItem key={d} value={d}>{d} 号</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <TimePicker value={form.time} onChange={(t) => set({ time: t })} />
                </>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>选择文章</Label>
              <span className="text-xs text-muted-foreground">
                {isOnce ? '单次任务仅可选择 1 篇' : `已选 ${form.articleIds.length} 篇`}
              </span>
            </div>
            <ScrollArea className="h-44 rounded-md border border-border">
              <div className="grid gap-1 p-2">
                {ARTICLE_POOL.map((a) => {
                  const checked = form.articleIds.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleArticle(a.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted',
                        checked && 'bg-primary/10',
                      )}
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span className="truncate">{a.title}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>发布媒体</Label>
              <span className="text-xs text-muted-foreground">
                已选 {form.mediaIds.length} 个
              </span>
            </div>
            <ScrollArea className="h-40 rounded-md border border-border">
              <div className="grid gap-1 p-2">
                {MEDIA_POOL.map((m) => {
                  const checked = form.mediaIds.includes(m.id)
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMedia(m.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted',
                        checked && 'bg-primary/10',
                      )}
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span className="truncate">{m.name}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit} disabled={!valid}>创建任务</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================================
 * 主体页面
 * ========================================================================== */
function Tasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [adding, setAdding] = useState(false)

  // 模拟调度触发：每 2.5s 让运行中的任务发布一篇，发完自动停止
  useEffect(() => {
    const timer = setInterval(() => {
      setTasks((cur) =>
        cur.map((task) => {
          if (task.status !== 'running') return task
          const total = task.articleIds.length
          const next = Math.min(task.publishedCount + 1, total)
          return {
            ...task,
            publishedCount: next,
            status: next >= total ? 'completed' : 'running',
          }
        }),
      )
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const runningCount = useMemo(
    () => tasks.filter((t) => t.status === 'running').length,
    [tasks],
  )

  const toggleRun = (id) => {
    setTasks((cur) =>
      cur.map((task) => {
        if (task.id !== id) return task
        if (task.status === 'running') return { ...task, status: 'stopped' }
        // 已完成的任务重新运行 → 从头开始
        const reset = task.status === 'completed' ? 0 : task.publishedCount
        return { ...task, status: 'running', publishedCount: reset }
      }),
    )
  }

  const remove = (id) => setTasks((cur) => cur.filter((t) => t.id !== id))

  const addTask = (form) => {
    setTasks((cur) => [
      {
        id: `t${Date.now()}`,
        ...form,
        status: 'stopped',
        publishedCount: 0,
      },
      ...cur,
    ])
  }

  return (
    <PageShell className="gap-5">
      <PageSectionCard className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            共 {tasks.length} 个任务 · {runningCount} 个运行中
          </div>
          <Button leftIcon={<Plus />} onClick={() => setAdding(true)}>添加任务</Button>
        </div>
      </PageSectionCard>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">任务名称</TableHead>
              <TableHead className="w-44">调度方式</TableHead>
              <TableHead className="w-56">文章进度</TableHead>
              <TableHead className="w-48">发布媒体</TableHead>
              <TableHead className="w-24">状态</TableHead>
              <TableHead className="w-28 text-right pr-4">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                  暂无任务，点击「添加任务」创建定时发布。
                </TableCell>
              </TableRow>
            )}
            {tasks.map((task) => {
              const total = task.articleIds.length
              const done = task.publishedCount
              const status = STATUS_META[task.status]
              return (
                <TableRow key={task.id}>
                  <TableCell className="pl-4 font-medium">{task.name}</TableCell>
                  <TableCell className="text-muted-foreground">{scheduleSummary(task)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={(done / total) * 100} className="h-1.5 flex-1" />
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {done}/{total}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.mediaIds.map((mid) => (
                        <Badge key={mid} variant="outline" className="px-1.5 py-0">
                          {MEDIA_POOL.find((m) => m.id === mid)?.name ?? mid}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={task.status === 'running' ? '停止' : '运行'}
                        onClick={() => toggleRun(task.id)}
                      >
                        {task.status === 'running' ? <Pause /> : <Play />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="删除任务"
                        onClick={() => remove(task.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <TaskFormDialog open={adding} onOpenChange={setAdding} onSubmit={addTask} />
    </PageShell>
  )
}

export default Tasks
