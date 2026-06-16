/**
 * [INPUT]: 依赖 react、radix-ui 的 Progress、@/lib/utils 的 cn
 * [OUTPUT]: 默认导出 Progress 组件，内凹轨道 + 渐变填充条
 * [POS]: components/ui 的进度指示原语，用于上传/索引/任务推进等场景
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({ className, value, ...props }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-2.5 w-full items-center overflow-hidden rounded-full skeu-inset-deep",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 skeu-bar transition-all duration-300 ease-out"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
