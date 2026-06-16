/**
 * [INPUT]: 纯 SVG 渲染，无第三方图表库 (AnimatedDonutChart 用 motion/react useInView 入场)；颜色仅取 var(--primary / chart-1..5 / muted)
 * [OUTPUT]: 命名导出 LineChart / MultiLineChart / PlatformBars / HBarChart / PlatformBadge / DonutChart / AnimatedDonutChart / GaugeRing / ScatterChart — 数据中心专用图表原子
 * [POS]: pages/dashboard/data 私有图表层 (下划线前缀表示模块内部)，被 Overview 等数据页消费
 * [PROTOCOL]: 视图字符内联 SVG · 容器自适应宽度 · 禁止硬编码 hex
 */
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'

/* ============================================================================
 * LineChart · 单线趋势 + 渐变面积
 * ========================================================================== */
export function LineChart({ values, color = 'var(--primary)', height = 180, withArea = true, id, labels }) {
  if (!values?.length) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const W = 600
  const H = height
  const pad = 6
  const pts = values.map((v, i) => [
    pad + (i / Math.max(values.length - 1, 1)) * (W - 2 * pad),
    pad + (1 - (v - min) / range) * (H - 2 * pad),
  ])
  const linePath = pts
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${H} L ${pad} ${H} Z`
  const gid = `lc-${id ?? Math.random().toString(36).slice(2, 8)}`

  const svg = (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={W - pad}
          y1={pad + t * (H - 2 * pad)}
          y2={pad + t * (H - 2 * pad)}
          stroke="var(--border)"
          strokeDasharray="2 3"
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}
      {withArea && <path d={areaPath} fill={`url(#${gid})`} />}
      <path
        d={linePath}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )

  if (!labels?.length) return svg

  /* X 轴日期 · 在 SVG 外用 HTML 渲染 (避免 preserveAspectRatio="none" 拉伸文字)，按数据点 x 定位 */
  return (
    <div className="w-full">
      {svg}
      <div className="relative mt-1.5 h-3.5">
        {labels.map((label, i) => {
          const left = (i / Math.max(labels.length - 1, 1)) * 100
          const tx = i === 0 ? '0' : i === labels.length - 1 ? '-100%' : '-50%'
          return (
            <span
              key={`${label}-${i}`}
              className="absolute top-0 whitespace-nowrap text-[10px] tabular-nums text-muted-foreground"
              style={{ left: `${left}%`, transform: `translateX(${tx})` }}
            >
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================================
 * MultiLineChart · 多线对比 (排名 / 竞品趋势)
 * ========================================================================== */
const SERIES_COLORS = [
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--accent)',
]

export function MultiLineChart({ series, height = 200, invert = false }) {
  if (!series?.length) return null
  const all = series.flatMap((s) => s.values)
  const max = Math.max(...all)
  const min = Math.min(...all)
  const range = max - min || 1
  const W = 600
  const H = height
  const pad = 8

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={W - pad}
          y1={pad + t * (H - 2 * pad)}
          y2={pad + t * (H - 2 * pad)}
          stroke="var(--border)"
          strokeDasharray="2 3"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}
      {series.map((s, idx) => {
        const pts = s.values.map((v, i) => [
          pad + (i / Math.max(s.values.length - 1, 1)) * (W - 2 * pad),
          pad + (invert ? (v - min) / range : 1 - (v - min) / range) * (H - 2 * pad),
        ])
        const d = pts
          .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(' ')
        return (
          <path
            key={s.name}
            d={d}
            stroke={s.color ?? SERIES_COLORS[idx % SERIES_COLORS.length]}
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

export const seriesColor = (i) => SERIES_COLORS[i % SERIES_COLORS.length]

/* ============================================================================
 * PlatformBars · 各 AI 平台对比 (垂直柱状图 + 底部平台标签)
 * ========================================================================== */
export function PlatformBars({ data, height = 200, suffix = '%', color = 'var(--primary)' }) {
  if (!data?.length) return null
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3 px-1" style={{ height }}>
        {data.map((d) => (
          <div key={d.platform} className="relative flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1 text-xs tabular-nums text-muted-foreground">{d.value}{suffix}</span>
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${(d.value / max) * 80}%`,
                minHeight: 6,
                background: `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 70%, transparent) 100%)`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-1">
        {data.map((d) => (
          <div key={d.platform} className="flex flex-1 flex-col items-center gap-1">
            <PlatformBadge name={d.platform} />
            <span className="text-xs text-muted-foreground">{d.platform}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================================
 * HBarChart · 横向条形图 (平台品牌得分 · 0-100 提及率)
 * ========================================================================== */
export function HBarChart({ data, max = 100, suffix = '%', color = 'var(--primary)', xLabel }) {
  if (!data?.length) return null
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1]
  return (
    <div className="flex gap-3">
      {/* 左侧 平台·端 标签列 */}
      <div className="flex shrink-0 flex-col">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex h-8 items-center justify-end whitespace-nowrap text-right text-xs text-muted-foreground"
          >
            {d.label}
          </span>
        ))}
        <span className="h-5" />
      </div>
      {/* 右侧 条形 + 网格 + X 轴 */}
      <div className="relative min-w-0 flex-1">
        {/* 纵向网格线 (覆盖条形区，避开底部 X 轴) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-5 flex justify-between">
          {ticks.map((t) => (
            <span key={t} className="w-px bg-border" style={{ opacity: 0.5 }} />
          ))}
        </div>
        {/* 条形 */}
        <div className="flex flex-col">
          {data.map((d) => (
            <div key={d.label} className="flex h-8 items-center">
              {d.value > 0 && (
                <div
                  className="h-3.5 rounded-r-sm"
                  style={{
                    width: `${(d.value / max) * 100}%`,
                    minWidth: 6,
                    background: `linear-gradient(90deg, color-mix(in srgb, ${color} 80%, transparent) 0%, ${color} 100%)`,
                  }}
                />
              )}
            </div>
          ))}
        </div>
        {/* X 轴刻度 */}
        <div className="flex h-5 items-center justify-between text-[10px] tabular-nums text-muted-foreground">
          {ticks.map((t) => (
            <span key={t}>{Math.round(t * max)}{suffix}</span>
          ))}
        </div>
        {xLabel && (
          <div className="mt-0.5 text-right text-[10px] text-muted-foreground">{xLabel}→</div>
        )}
      </div>
    </div>
  )
}

const PLATFORM_LETTER = {
  DeepSeek: 'DS',
  百度AI: '百',
  头条AI: '头',
  知乎AI: '知',
  豆包: '豆',
  Kimi: 'K',
  元宝: '宝',
  文心: '文',
  文心一言: '文',
  千问: '千',
  通义千问: '通',
  智谱清言: '智',
}

export function PlatformBadge({ name, size = 24 }) {
  const letter = PLATFORM_LETTER[name] ?? name.slice(0, 1)
  const color = SERIES_COLORS[(name.length * 7) % SERIES_COLORS.length]
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-primary-foreground"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color} 0%, color-mix(in srgb, ${color} 80%, black) 100%)`,
      }}
    >
      {letter}
    </span>
  )
}

/* ============================================================================
 * DonutChart · 引用来源分布 (分段环 + 中心 label)
 * ========================================================================== */
export function DonutChart({ segments, size = 180, centerLabel, centerValue }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = size / 2 - 14
  const c = Math.PI * 2 * r
  let acc = 0
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth="14"
        />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * c
          const offset = acc
          acc += len
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth="14"
              strokeDasharray={`${Math.max(len - 3, 0)} ${c - Math.max(len - 3, 0)}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
          {centerValue && <span className="text-base font-semibold tracking-tight">{centerValue}</span>}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * AnimatedDonutChart · 多段动画环 (各段 stroke-dasharray 进场逐段充能 + 中心 children 插槽)
 *   segments 归一化铺满整环；进入视口后各段依次充能 (appleEaseOut)
 * ========================================================================== */
export function AnimatedDonutChart({ segments, size = 200, strokeWidth = 14, children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px' })
  const [charged, setCharged] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setCharged(true), 120)
    return () => clearTimeout(t)
  }, [inView])

  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = size / 2 - strokeWidth
  const c = Math.PI * 2 * r
  const gap = 3
  // 纯计算各段弧长与起始偏移 (避免 render 期变量重赋值)
  const fulls = segments.map((seg) => (seg.value / total) * c)
  const offsetAt = (i) => fulls.slice(0, i).reduce((a, b) => a + b, 0)

  return (
    <div ref={ref} className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--foreground) 8%, transparent)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const len = Math.max(fulls[i] - gap, 0)
          const offset = offsetAt(i)
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color ?? SERIES_COLORS[i % SERIES_COLORS.length]}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{
                strokeDasharray: `${charged ? len : 0} ${c}`,
                strokeDashoffset: -offset,
                transition: 'stroke-dasharray 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                transitionDelay: `${i * 0.12}s`,
              }}
            />
          )
        })}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          {children}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * GaugeRing · 0-100 综合得分仪表环 (270° 弧 · 进入视口充能 · 中心 children 插槽)
 * ========================================================================== */
export function GaugeRing({ value, max = 100, size = 200, strokeWidth = 16, color = 'var(--primary)', children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px' })
  const [charged, setCharged] = useState(false)
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setCharged(true), 120)
    return () => clearTimeout(t)
  }, [inView])

  const r = size / 2 - strokeWidth
  const c = Math.PI * 2 * r
  const sweep = 0.75 // 270°
  const pct = Math.max(0, Math.min(1, value / max))

  return (
    <div ref={ref} className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="color-mix(in srgb, var(--foreground) 8%, transparent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${c * sweep} ${c}`}
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{
            strokeDasharray: `${(charged ? pct : 0) * c * sweep} ${c}`,
            transition: 'stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 text-center">
          {children}
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * ScatterChart · 竞争位置散点 (X=提及率% · Y=平均排名[1 最佳在上] · 点大小=提及次数)
 *   points: { name, x(0-xMax), y(rank), size, color?, target? }[]
 * ========================================================================== */
export function ScatterChart({ points, height = 320, xMax = 100, yMax, xLabel = '提及率', yLabel = '平均排名' }) {
  if (!points?.length) return null
  const W = 600
  const H = height
  const padL = 36
  const padR = 16
  const padT = 14
  const padB = 30
  const plotW = W - padL - padR
  const plotH = H - padT - padB
  const ymax = yMax ?? Math.max(2, Math.ceil(Math.max(...points.map((p) => p.y))))
  const smax = Math.max(...points.map((p) => p.size), 1)
  const sx = (x) => padL + (x / xMax) * plotW
  const sy = (y) => padT + ((y - 1) / (ymax - 1 || 1)) * plotH
  const radius = (s) => 6 + (s / smax) * 15
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * xMax))
  const yTicks = Array.from({ length: ymax }, (_, i) => i + 1)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {/* 横向网格 (排名) */}
      {yTicks.map((yv) => (
        <g key={`y${yv}`}>
          <line x1={padL} x2={W - padR} y1={sy(yv)} y2={sy(yv)} stroke="var(--border)" strokeDasharray="2 3" strokeWidth="0.5" opacity="0.5" />
          <text x={padL - 6} y={sy(yv) + 3} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">{yv}</text>
        </g>
      ))}
      {/* 纵向网格 (提及率) */}
      {xTicks.map((xv) => (
        <g key={`x${xv}`}>
          <line x1={sx(xv)} x2={sx(xv)} y1={padT} y2={H - padB} stroke="var(--border)" strokeDasharray="2 3" strokeWidth="0.5" opacity="0.35" />
          <text x={sx(xv)} y={H - padB + 14} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">{xv}%</text>
        </g>
      ))}
      {/* 轴标题 */}
      <text x={W - padR} y={padT + 2} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">{yLabel}↑越靠前</text>
      <text x={sx(xMax)} y={H - 4} textAnchor="end" fontSize="9" fill="var(--muted-foreground)">{xLabel}→</text>
      {/* 气泡 */}
      {points.map((p) => {
        const fill = p.color ?? 'var(--chart-2)'
        return (
          <g key={p.name}>
            <circle
              cx={sx(p.x)}
              cy={sy(p.y)}
              r={radius(p.size)}
              fill={fill}
              fillOpacity={p.target ? 0.9 : 0.45}
              stroke={p.target ? 'var(--primary)' : fill}
              strokeWidth={p.target ? 2.5 : 1}
            />
            <text
              x={sx(p.x)}
              y={sy(p.y) - radius(p.size) - 3}
              textAnchor="middle"
              fontSize="10"
              fontWeight={p.target ? 600 : 400}
              fill={p.target ? 'var(--primary)' : 'var(--foreground)'}
            >
              {p.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
