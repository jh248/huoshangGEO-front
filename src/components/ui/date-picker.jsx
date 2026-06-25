/**
 * [INPUT]: 依赖 react、lucide-react、ui/Button+Popover、@/lib/utils 的 cn
 * [OUTPUT]: 命名导出 Calendar (月网格 · single|range) / DatePicker (单日) / DateTimePicker (日历+时分秒/时分滚轮+此刻/确定) / TimePicker (仅时分秒/时分滚轮)
 * [POS]: components/ui 设计系统原语；DateFilter (区间) 与 调度 (单日/日期时间/时间) 共同复用，消除日历复刻品
 * [PROTOCOL]: ymd = { year, month(0-11), day }；single 用 selected、range 用 {start,end}；fromToday 禁选过去
 *             变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from "react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"]

function tsOf(ymd) {
  return new Date(ymd.year, ymd.month, ymd.day).getTime()
}

function buildCells(year, month) {
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // 周一为 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) {
    cells.push({ day: prevMonthDays - startWeekday + 1 + i, muted: true })
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d })
  while (cells.length < 42) {
    cells.push({ day: cells.length - daysInMonth - startWeekday + 1, muted: true })
  }
  return cells
}

/* ============================================================================
 * Calendar · 月网格 (single | range)，自管当前视图月，对外只报 onSelect(ymd)
 * ========================================================================== */
export function Calendar({ mode = "single", selected = null, range = null, onSelect, fromToday = false }) {
  const base = selected ?? range?.start ?? null
  const now = new Date()
  const [view, setView] = useState(() => ({
    year: base?.year ?? now.getFullYear(),
    month: base?.month ?? now.getMonth(),
  }))

  const todayTs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const selTs = mode === "single" && selected ? tsOf(selected) : null
  const startTs = range?.start ? tsOf(range.start) : null
  const endTs = range?.end ? tsOf(range.end) : null

  const prevMonth = () =>
    setView((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }))
  const nextMonth = () =>
    setView((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }))

  const cells = buildCells(view.year, view.month)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={prevMonth} aria-label="上一月">
          <ChevronLeft />
        </Button>
        <span className="text-sm font-medium">
          {view.year} 年 {view.month + 1} 月
        </span>
        <Button variant="ghost" size="icon-sm" onClick={nextMonth} aria-label="下一月">
          <ChevronRight />
        </Button>
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">
        {WEEK_LABELS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (c.muted) {
            return (
              <span
                key={i}
                className="flex h-8 items-center justify-center rounded-lg text-sm tabular-nums text-muted-foreground/30"
              >
                {c.day}
              </span>
            )
          }
          const cellTs = new Date(view.year, view.month, c.day).getTime()
          const disabled = fromToday && cellTs < todayTs
          const isSel = selTs != null && cellTs === selTs
          const isStart = startTs != null && cellTs === startTs
          const isEnd = endTs != null && cellTs === endTs
          const inRange = startTs != null && endTs != null && cellTs > startTs && cellTs < endTs
          const isToday = cellTs === todayTs
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.({ year: view.year, month: view.month, day: c.day })}
              className={cn(
                "flex h-8 items-center justify-center rounded-lg text-sm tabular-nums transition-colors",
                isSel || isStart || isEnd
                  ? "bg-primary text-primary-foreground"
                  : inRange
                  ? "bg-primary/15 text-foreground"
                  : isToday
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "pointer-events-none opacity-30",
              )}
            >
              {c.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatDash(ymd) {
  return `${ymd.year}-${String(ymd.month + 1).padStart(2, "0")}-${String(ymd.day).padStart(2, "0")}`
}

const TRIGGER_CLS =
  "flex h-10 items-center justify-between gap-2 rounded-md border border-border/60 px-4 text-sm text-foreground transition-colors skeu-inset hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"

const pad2 = (n) => String(n).padStart(2, "0")
const HOUR_LIST = Array.from({ length: 24 }, (_, i) => pad2(i))
const MINSEC_LIST = Array.from({ length: 60 }, (_, i) => pad2(i))

function splitTime(t) {
  const [h = "00", m = "00", s = "00"] = (t || "").split(":")
  return [h, m, s]
}
function joinTime(parts, precision = "second") {
  return precision === "minute" ? `${parts[0]}:${parts[1]}:00` : parts.join(":")
}

function displayTime(parts, precision = "second") {
  return precision === "minute" ? `${parts[0]}:${parts[1]}` : parts.join(":")
}
function nowTime() {
  const d = new Date()
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

/* ============================================================================
 * TimeColumns · 时/分/秒 三列滚动选择 (内部复用)
 * ========================================================================== */
function TimeColumns({ parts, onSelect, precision = "second" }) {
  const cols = precision === "minute" ? [HOUR_LIST, MINSEC_LIST] : [HOUR_LIST, MINSEC_LIST, MINSEC_LIST]
  return (
    <div className="flex">
      {cols.map((options, idx) => (
        <div
          key={idx}
          className="max-h-56 w-14 overflow-auto border-l border-border py-1 first:border-l-0"
        >
          {options.map((opt) => {
            const active = parts[idx] === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(idx, opt)}
                className={cn(
                  "flex h-8 w-full items-center justify-center text-sm tabular-nums transition-colors",
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {opt}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function PickerFooter({ onNow, onOk }) {
  return (
    <div className="flex items-center justify-between border-t border-border px-3 py-2">
      <button
        type="button"
        onClick={onNow}
        className="text-sm font-medium text-primary hover:underline"
      >
        此刻
      </button>
      <Button type="button" size="sm" onClick={onOk}>
        确定
      </Button>
    </div>
  )
}

/* ============================================================================
 * DatePicker · 单日选择 (Pill 触发 + 弹层 Calendar)，value: ymd | null
 * ========================================================================== */
export function DatePicker({ value = null, onChange, placeholder = "选择日期", fromToday = false, className }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(TRIGGER_CLS, className)}>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className={cn(!value && "text-muted-foreground")}>
              {value ? formatDash(value) : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 rounded-md p-3">
        <Calendar
          mode="single"
          selected={value}
          fromToday={fromToday}
          onSelect={(ymd) => {
            onChange?.(ymd)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/* ============================================================================
 * DateTimePicker · 日历 + 时分秒/时分滚轮 + 此刻/确定，date: ymd|null · time: 'HH:MM:SS'
 * ========================================================================== */
export function DateTimePicker({ date = null, time = "00:00:00", onChange, placeholder = "选择日期时间", fromToday = false, className, precision = "second" }) {
  const [open, setOpen] = useState(false)
  const parts = splitTime(time)

  const pickDate = (ymd) => onChange?.(ymd, time)
  const pickTime = (idx, val) => {
    const next = splitTime(time)
    next[idx] = val
    onChange?.(date, joinTime(next, precision))
  }
  const setNow = () => {
    const d = new Date()
    const next = splitTime(nowTime())
    onChange?.({ year: d.getFullYear(), month: d.getMonth(), day: d.getDate() }, joinTime(next, precision))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(TRIGGER_CLS, "w-auto", className)}>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className={cn("tabular-nums", !date && "text-muted-foreground")}>
              {date ? `${formatDash(date)} ${displayTime(parts, precision)}` : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto max-w-none rounded-md p-0">
        <div className="flex">
          <div className="border-r border-border p-3">
            <Calendar mode="single" selected={date} fromToday={fromToday} onSelect={pickDate} />
          </div>
          <div className="flex flex-col">
            <div className="border-b border-border px-3 py-2 text-center text-sm font-medium tabular-nums">
              {displayTime(parts, precision)}
            </div>
            <TimeColumns parts={parts} onSelect={pickTime} precision={precision} />
          </div>
        </div>
        <PickerFooter onNow={setNow} onOk={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

/* ============================================================================
 * TimePicker · 仅时分秒/时分滚轮 + 此刻/确定，value: 'HH:MM:SS'
 * ========================================================================== */
export function TimePicker({ value = "00:00:00", onChange, className, precision = "second" }) {
  const [open, setOpen] = useState(false)
  const parts = splitTime(value)

  const pickTime = (idx, val) => {
    const next = splitTime(value)
    next[idx] = val
    onChange?.(joinTime(next, precision))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(TRIGGER_CLS, "w-32", className)}>
          <span className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <span className="tabular-nums">{displayTime(parts, precision)}</span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-md p-0">
        <div className="border-b border-border px-3 py-2 text-center text-sm font-medium tabular-nums">
          {displayTime(parts, precision)}
        </div>
        <TimeColumns parts={parts} onSelect={pickTime} precision={precision} />
        <PickerFooter
          onNow={() => onChange?.(joinTime(splitTime(nowTime()), precision))}
          onOk={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
