/**
 * [INPUT]: 依赖 react、lucide-react 图标、ui/Popover+Input+ScrollArea、@/lib/utils 的 cn
 * [OUTPUT]: 命名导出 SingleSelect — 单选下拉 (Trigger Pill + 选项 Pill 列表 · 单选)
 * [POS]: components/ui，受控/非受控双模 (value/defaultValue + onValueChange)，搜索 optional
 *        视觉：与 MultiSelect 同源 — 触发器 Pill (可选 Icon|label|value|▾)；
 *              选项行 = 常态淡 muted Pill + 选中态加深 + 右侧 Check 图标
 *              弹层 flex 列 + overflow-hidden，ScrollArea 加 max-h-72 + overflow-hidden 确保长列表正常滚动
 *        差异：无「全部」主开关；点击同一项不取消选择 (单选语义)
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

/* ============================================================================
 * SingleSelectTrigger · 触发器 Pill
 *   有 label  → Icon | label | 分隔 | value pill | ▾  (筛选风格)
 *   无 label  → ▾ | value                          (表单风格 · chevron 前置)
 * ========================================================================== */
function SingleSelectTrigger({ Icon, label, value, placeholder, open, className }) {
  const Chevron = open ? ChevronUp : ChevronDown
  const display = value ?? placeholder
  const isPlaceholder = value == null

  if (label) {
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
        <span
          className={cn(
            "rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium",
            isPlaceholder ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {display}
        </span>
        <Chevron className="size-3.5 text-muted-foreground" />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 text-sm transition-colors hover:bg-muted",
        className
      )}
    >
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <Chevron className="size-3.5 shrink-0 text-muted-foreground" />
      <span
        className={cn(
          "font-medium",
          isPlaceholder ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {display}
      </span>
    </span>
  )
}

/* ============================================================================
 * SingleSelect · 单选下拉本体
 *   value: string  (受控)  · defaultValue: string  (非受控)
 *   options: { value, label, ... }[]  · renderItem(opt): JSX 替代默认 label
 *   placeholder: 未选中时触发器显示文案
 *   withSearch: 顶部搜索框
 * ========================================================================== */
function SingleSelect({
  Icon,
  label,
  placeholder = "请选择",
  options,
  value,
  defaultValue,
  onValueChange,
  renderItem,
  withSearch = false,
  contentClassName,
  triggerClassName,
  align = "start",
}) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue)
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

  const selectedOption = options.find((o) => o.value === selected)
  const triggerValue = selectedOption?.label

  const commit = (next) => {
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }

  const pick = (v) => {
    commit(v)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <SingleSelectTrigger
            Icon={Icon}
            label={label}
            value={triggerValue}
            placeholder={placeholder}
            open={open}
            className={triggerClassName}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "flex w-72 flex-col gap-2 overflow-hidden rounded-md p-2",
          contentClassName
        )}
      >
        {withSearch && (
          <div className="relative shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`搜索${label ?? ""}`}
              className="h-9 pl-8"
            />
          </div>
        )}

        {/* 选项行 · 常态淡 Pill + 选中态加深 + 右侧 Check */}
        <ScrollArea className="max-h-72 overflow-hidden">
          <div className="space-y-1 pr-1">
            {filtered.map((o) => {
              const checked = selected === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pick(o.value)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                    "bg-muted/60 text-foreground hover:bg-muted",
                    checked && "bg-foreground text-background hover:bg-foreground"
                  )}
                >
                  {renderItem ? (
                    renderItem(o)
                  ) : (
                    <span className="flex-1 truncate">{o.label}</span>
                  )}
                  {checked && <Check className="size-4 shrink-0" />}
                </button>
              )
            })}
            {filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                没有匹配项
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { SingleSelect, SingleSelectTrigger }
