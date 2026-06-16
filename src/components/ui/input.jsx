/**
 * [INPUT]: 依赖 react、@/lib/utils 的 cn
 * [OUTPUT]: 默认导出 Input 组件，微拟物内凹输入框
 * [POS]: components/ui 的输入原语，被 Form/DesignSystem/Search 等消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // ---- 基础 ----
        "h-10 w-full min-w-0 rounded-md border border-border/60 px-4 py-2 text-sm text-foreground",
        "transition-all duration-200 ease-out outline-none",
        // ---- 内凹光影 ----
        "skeu-inset",
        // ---- 占位与禁用 ----
        "placeholder:text-muted-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // ---- 聚焦 + 错误 ----
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
