/**
 * [INPUT]: 依赖 react、lucide-react 图标、ui/Popover+Checkbox+Input+ScrollArea、@/lib/utils 的 cn
 * [OUTPUT]: 命名导出 MultiSelect — 多选下拉 (Trigger Pill + 全部主开关 + 选项 Pill 列表)
 * [POS]: components/ui，受控/非受控双模 (value/defaultValue + onValueChange)，搜索 optional
 *        视觉：全部行 = 反色 (bg-foreground / text-background) 强调主开关；
 *              选项行 = 常态淡 muted Pill + 勾选态加深，所有行带左 Checkbox
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

/* ============================================================================
 * MultiSelectTrigger · 触发器 Pill (Icon | label | value | ▾)
 * ========================================================================== */
function MultiSelectTrigger({ Icon, label, value, open, className }) {
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 text-sm transition-colors hover:bg-muted",
        className
      )}
    >
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="text-muted-foreground">{label}</span>
      <span className="h-4 w-px bg-border" />
      <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
        {value}
      </span>
      <Chevron className="size-3.5 text-muted-foreground" />
    </span>
  )
}

/* ============================================================================
 * MultiSelect · 多选下拉本体
 *   value: string[]  (受控)  · defaultValue: string[]  (非受控)
 *   options: { value, label, ... }[]  · renderItem(opt): JSX 替代默认 label
 *   allLabel: 全部行文案 (默认「全部」)
 *   placeholder: 未选择时触发器文案
 *   withSearch: 顶部搜索框
 * ========================================================================== */
function MultiSelect({
  Icon,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  renderItem,
  withSearch = false,
  allLabel = "全部",
  placeholder,
  contentClassName,
  triggerClassName,
  align = "start",
}) {
  const isControlled = Array.isArray(value)
  const [internal, setInternal] = useState(defaultValue ?? [])
  const selected = isControlled ? value : internal

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () =>
      withSearch && query
        ? options.filter((o) => o.label.includes(query))
        : options,
    [options, query, withSearch]
  )

  const allChecked = options.length > 0 && selected.length === options.length
  const noneChecked = selected.length === 0
  const triggerValue =
    noneChecked ? (placeholder ?? allLabel) : allChecked ? allLabel : `${selected.length} 项`

  const commit = (next) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  const handleRowKeyDown = (event, action) => {
    if (event.key !== "Enter" && event.key !== " ") return
    event.preventDefault()
    action()
  }

  const toggleAll = () =>
    commit(allChecked ? [] : options.map((o) => o.value))

  const toggleOne = (v) => {
    if (selected.includes(v)) {
      return commit(selected.filter((x) => x !== v))
    }
    return commit([...selected, v])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MultiSelectTrigger
            Icon={Icon}
            label={label}
            value={triggerValue}
            open={open}
            className={triggerClassName}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("w-72 rounded-md p-2", contentClassName)}
      >
        {withSearch && (
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`搜索${label ?? ""}`}
              className="h-9 pl-8"
            />
          </div>
        )}

        {/* 全部主开关 · 反色 Pill (与选项行视觉对比) */}
        <div
          role="button"
          tabIndex={0}
          onClick={toggleAll}
          onKeyDown={(event) => handleRowKeyDown(event, toggleAll)}
          className={cn(
            "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors",
            allChecked
              ? "bg-foreground/[0.06] ring-1 ring-inset ring-foreground/15 hover:bg-foreground/[0.09]"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <span className="flex items-center gap-2.5">
            <Checkbox checked={allChecked} className="pointer-events-none" />
            {allLabel}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {options.length}
          </span>
        </div>

        <hr className="my-2 border-border" />

        {/* 选项行 · 常态淡 Pill + 勾选态加深 */}
        <ScrollArea className="max-h-80">
          <div className="space-y-1 pr-1">
            {filtered.map((o) => {
              const checked = selected.includes(o.value)
              return (
                <div
                  key={o.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleOne(o.value)}
                  onKeyDown={(event) => handleRowKeyDown(event, () => toggleOne(o.value))}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    "bg-muted/60 text-foreground hover:bg-muted",
                    checked && "bg-muted"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    className="pointer-events-none shrink-0"
                  />
                  {renderItem ? (
                    renderItem(o)
                  ) : (
                    <span className="flex-1 truncate">{o.label}</span>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect, MultiSelectTrigger }
