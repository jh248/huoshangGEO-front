/**
 * [INPUT]: 依赖 react、framer-motion、@/lib/utils 的 cn、@/lib/motion 的 circularTextSpin
 * [OUTPUT]: 默认导出 CircularText — token 驱动的圆周字符排版原语，适合徽章 / 圆形 CTA / 指标章
 * [POS]: components/ui 原子件，由 Hero 圆形提交按钮与 DesignSystem 展厅消费
 * [PROTOCOL]: 来源于 @react-bits/CircularText-JS-CSS registry，已移除写死颜色 / 固定尺寸；循环动效集中于 lib/motion
 */
import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { circularTextSpin } from "@/lib/motion"
import { cn } from "@/lib/utils"

function CircularText({
  text,
  spin = true,
  className,
  characterClassName,
  "aria-label": ariaLabel,
  ...props
}) {
  const letters = React.useMemo(() => Array.from(text), [text])
  const shouldReduceMotion = useReducedMotion()
  const step = 360 / Math.max(letters.length, 1)

  return (
    <motion.span
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      animate={spin && !shouldReduceMotion ? circularTextSpin : undefined}
      className={cn(
        "pointer-events-none absolute inset-0 block rounded-full text-center font-semibold uppercase text-current",
        className
      )}
      {...props}
    >
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={cn(
            "absolute left-1/2 top-0 flex h-1/2 w-4 origin-bottom items-start justify-center pt-1 leading-none",
            characterClassName
          )}
          style={{ transform: `translateX(-50%) rotate(${index * step}deg)` }}
        >
          {letter}
        </span>
      ))}
    </motion.span>
  )
}

export { CircularText }
