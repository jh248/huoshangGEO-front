/**
 * [INPUT]: 依赖 react、radix-ui 的 Slot、framer-motion 的 motion、class-variance-authority 的 cva、lucide-react 的 Loader2、@/lib/utils 的 cn、@/lib/motion 的 tapScale
 * [OUTPUT]: 默认导出 Button + buttonVariants，微拟物渐变 + 三层阴影 + Spring 物理回弹 (whileTap)，asChild 单子节点安全
 * [POS]: components/ui 的核心交互原语，所有按钮交互的唯一来源，被 layout 与 pages 全量消费
 *        点击反馈走 framer-motion Spring (stiffness 500 / damping 30)，Apple 级紧致手感
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import * as React from "react"
import { Slot } from "radix-ui"
import { motion } from "framer-motion"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { tapScale } from "@/lib/motion"

// ============================================================================
// 微拟物样式表 · 渐变背景 + 三层阴影
// 颜色全部派生自 CSS 变量，灰阶高光使用半透明白/黑作为环境光
// ============================================================================
const BUTTON_STYLES = {
  default: {
    background:
      "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
    boxShadow:
      "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
    hoverBoxShadow:
      "0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.15)",
  },
  primary: {
    background:
      "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
    boxShadow:
      "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
    hoverBoxShadow:
      "0 6px 20px color-mix(in srgb, var(--primary) 45%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.15)",
  },
  destructive: {
    background:
      "linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 85%, black) 50%, color-mix(in srgb, var(--destructive) 70%, black) 100%)",
    boxShadow:
      "0 4px 12px color-mix(in srgb, var(--destructive) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
    hoverBoxShadow:
      "0 6px 20px color-mix(in srgb, var(--destructive) 45%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.15)",
  },
  accent: {
    background:
      "linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 85%, black) 50%, color-mix(in srgb, var(--accent) 70%, black) 100%)",
    boxShadow:
      "0 4px 12px color-mix(in srgb, var(--accent) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
    hoverBoxShadow:
      "0 6px 20px color-mix(in srgb, var(--accent) 45%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.15)",
  },
  secondary: {
    background:
      "linear-gradient(135deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 92%, black) 50%, color-mix(in srgb, var(--secondary) 82%, black) 100%)",
    boxShadow:
      "0 2px 8px rgb(0 0 0 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.3), inset 0 -1px 0 rgb(0 0 0 / 0.05)",
    hoverBoxShadow:
      "0 4px 12px rgb(0 0 0 / 0.16), inset 0 1px 0 rgb(255 255 255 / 0.35), inset 0 -1px 0 rgb(0 0 0 / 0.08)",
  },
  outline: {
    background: "transparent",
    boxShadow:
      "0 1px 3px rgb(0 0 0 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.4)",
    hoverBoxShadow:
      "0 2px 6px rgb(0 0 0 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.5)",
  },
  ghost: { background: "transparent", boxShadow: "none", hoverBoxShadow: "none" },
  link: { background: "transparent", boxShadow: "none", hoverBoxShadow: "none" },
}

// ============================================================================
// 类名变体 · 排版 + 尺寸 + 微交互
// ============================================================================
const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "whitespace-nowrap text-sm font-medium",
    "rounded-2xl",
    "transition-all duration-200 ease-out",
    "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    "hover:scale-[1.02]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        primary: "text-primary-foreground",
        destructive: "text-destructive-foreground",
        accent: "text-accent-foreground",
        secondary: "text-secondary-foreground",
        outline:
          "border border-border bg-background text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-4 text-xs rounded-xl",
        default: "h-9 px-5 py-2 rounded-2xl",
        md: "h-10 px-6 py-2.5 rounded-2xl",
        lg: "h-12 px-10 rounded-2xl",
        xl: "h-14 px-12 py-4 text-lg rounded-3xl",
        icon: "h-10 w-10 rounded-2xl",
        "icon-sm": "h-8 w-8 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// ============================================================================
// 组件本体 · 内联 style 承载渐变与三层阴影
// hover 状态用 React 受控切换，避免 Tailwind 无法表达 color-mix 阴影
// ============================================================================
const Button = React.forwardRef(function Button(
  {
    className,
    variant = "default",
    size = "default",
    asChild = false,
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    disabled,
    ...props
  },
  ref
) {
  // asChild → Slot 保持 Radix 数据契约不变；常态 → motion.button 接管 whileTap Spring 回弹
  const Comp = asChild ? Slot.Root : motion.button
  const [hovered, setHovered] = React.useState(false)

  const skeu = BUTTON_STYLES[variant] || BUTTON_STYLES.default
  const isFlat = variant === "ghost" || variant === "link"

  const combinedStyle = isFlat
    ? style
    : {
        background: skeu.background,
        boxShadow: hovered ? skeu.hoverBoxShadow : skeu.boxShadow,
        ...style,
      }

  // motion.button 专属属性 (whileTap) 在 asChild 路径下不能传给 Slot.Root
  const motionProps = asChild ? {} : { whileTap: tapScale }
  const content = asChild ? (
    children
  ) : (
    <>
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </>
  )

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading || disabled}
      style={combinedStyle}
      onMouseEnter={(e) => {
        setHovered(true)
        onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        onMouseLeave?.(e)
      }}
      {...motionProps}
      {...props}
    >
      {content}
    </Comp>
  )
})

export { Button, buttonVariants }
