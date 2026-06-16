/**
 * [INPUT]: 依赖 react、radix-ui 的 Switch、@/lib/utils 的 cn
 * [OUTPUT]: 默认导出 Switch 组件，内凹轨道 + 凸起旋钮 + 选中态渐变
 * [POS]: components/ui 的开关原语，二态切换的唯一入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({ className, size = "default", ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all duration-200 ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 skeu-switch-track",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-[size=default]:h-6 data-[size=default]:w-11 data-[size=default]:p-0.5",
        "data-[size=sm]:h-5 data-[size=sm]:w-9 data-[size=sm]:p-0.5",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-background transition-transform duration-200 ease-out skeu-knob",
          "group-data-[size=default]/switch:size-5",
          "group-data-[size=sm]/switch:size-4",
          "group-data-[size=default]/switch:data-[state=checked]:translate-x-[20px]",
          "group-data-[size=sm]/switch:data-[state=checked]:translate-x-[16px]",
          "data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
