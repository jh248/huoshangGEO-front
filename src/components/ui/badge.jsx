/**
 * [INPUT]: 依赖 react、class-variance-authority 的 cva、radix-ui 的 Slot、@/lib/utils 的 cn
 * [OUTPUT]: 默认导出 Badge + badgeVariants，微拟物渐变徽章
 * [POS]: components/ui 的标签原语，承载状态/分类/计数
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from "react"
import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// ============================================================================
// 徽章微拟物样式 · 与 Button 同源，缩减外投影
// ============================================================================
const BADGE_STYLES = {
  default: {
    background:
      "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
    boxShadow:
      "0 2px 6px color-mix(in srgb, var(--primary) 28%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.08)",
  },
  secondary: {
    background:
      "linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 92%, black) 50%, color-mix(in srgb, var(--secondary) 82%, black) 100%)",
    boxShadow:
      "0 1px 3px rgb(0 0 0 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.35), inset 0 -1px 0 rgb(0 0 0 / 0.04)",
  },
  accent: {
    background:
      "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 50%, color-mix(in srgb, var(--accent) 70%, black) 100%)",
    boxShadow:
      "0 2px 6px color-mix(in srgb, var(--accent) 28%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.08)",
  },
  destructive: {
    background:
      "linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 85%, black) 50%, color-mix(in srgb, var(--destructive) 70%, black) 100%)",
    boxShadow:
      "0 2px 6px color-mix(in srgb, var(--destructive) 28%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.08)",
  },
  outline: { background: "transparent", boxShadow: "none" },
  ghost: { background: "transparent", boxShadow: "none" },
  link: { background: "transparent", boxShadow: "none" },
}

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ease-out focus-visible:ring-3 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        secondary: "text-secondary-foreground",
        accent: "text-accent-foreground",
        destructive: "text-destructive-foreground",
        outline: "border border-border text-foreground",
        ghost: "text-muted-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"
  const skeu = BADGE_STYLES[variant] || BADGE_STYLES.default
  const isFlat =
    variant === "outline" || variant === "ghost" || variant === "link"
  const combinedStyle = isFlat
    ? style
    : { background: skeu.background, boxShadow: skeu.boxShadow, ...style }

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      style={combinedStyle}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
