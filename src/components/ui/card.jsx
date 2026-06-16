/**
 * [INPUT]: 依赖 react、class-variance-authority 的 cva、@/lib/utils 的 cn
 * [OUTPUT]: 默认导出 Card 系列 (Card/Header/Title/Description/Action/Content/Footer) + cardVariants
 * [POS]: components/ui 的容器原语，承载内容分组与立体层级，variant=raised|inset|flat
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

// ============================================================================
// 卡片变体 · 三种立体语义
// raised  — 凸起，承载主要内容，默认
// inset   — 内凹，承载次级信息或输入区域
// flat    — 平面，仅边框分割，无阴影
// ============================================================================
const cardVariants = cva(
  "group/card relative flex flex-col gap-4 overflow-hidden rounded-md text-sm text-card-foreground py-5 transition-all duration-200 ease-out has-data-[slot=card-footer]:pb-0 data-[size=sm]:gap-3 data-[size=sm]:py-3",
  {
    variants: {
      variant: {
        raised: "bg-card skeu-raised hover:skeu-raised-hover",
        inset: "skeu-inset",
        flat: "bg-card border border-border",
      },
    },
    defaultVariants: { variant: "raised" },
  }
)

function Card({ className, variant = "raised", size = "default", ...props }) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-size={size}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min items-start gap-1 px-5 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 px-5 pb-5 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:pb-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
