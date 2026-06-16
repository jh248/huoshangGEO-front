/**
 * [INPUT]: 依赖 react useId，lib/utils cn
 * [OUTPUT]: 默认导出 BrandLogo — 火山 GEO 品牌 lockup (full 使用 public/logo1.svg · mark 内联 SVG)
 *           variant="full" (mark + wordmark · 默认) | "mark" (仅 pictogram · viewBox 130×108)
 * [POS]: components/layout 共享品牌资产，被 Header / DashboardTopbar / Footer / landing/Footer 同源消费
 * [PROTOCOL]: full 变体使用品牌固定 SVG 资产；mark 颜色为品牌固定 (#064BBC 深蓝 + #0596FF 蓝)，不参与主题 token
 */
import { useId } from 'react'
import { cn } from '@/lib/utils'

const MARK_DARK = '#064BBC'
const MARK_BRIGHT = '#0596FF'
const MARK_TRIANGLE_D =
  'M84.3222,8.348 C83.4742,3.165 74.2132,0 74.2132,0 L56.6652,0 L22.7602,77.71 C31.2052,82.365 47.2152,79.851 47.2152,79.851 L67.9662,29.669 L83.3172,70.541 L104.0682,58.344 C104.0682,58.344 86.7082,13.158 84.3222,8.348 L84.3222,8.348 Z M108.6212,72.529 L89.0562,89.369 L95.1272,104.875 L121.1022,104.709 L108.6212,72.529 Z'
const MARK_SWOOP_D =
  'M38.2999,47.669 C5.1489,47.824 17.4069,29.615 30.3909,22.1 L30.9449,20.358 C24.4529,22.713 0.1569,36.931 -0.000325700987,54.993 C-0.0621,62.752 12.6519,72.372 35.0979,68.338 C67.1499,62.597 114.1139,36.372 128.9949,0 C128.1469,1.304 100.2389,43.386 38.2999,47.669'

function MarkPaths({ maskId }) {
  return (
    <>
      <path fill={MARK_DARK} d={MARK_TRIANGLE_D} />
      <g transform="translate(0, 38.6993)">
        <mask id={maskId} fill="white">
          <polygon points="0 0 128.9949 0 128.9949 69.2894998 0 69.2894998" />
        </mask>
        <path
          fill={MARK_BRIGHT}
          mask={`url(#${maskId})`}
          d={MARK_SWOOP_D}
        />
      </g>
    </>
  )
}

export default function BrandLogo({ variant = 'full', className, title = '火山 GEO', ...props }) {
  const uid = useId().replace(/:/g, '')
  const maskId = `brand-logo-mask-${uid}`

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 130 108"
        fill="none"
        role="img"
        aria-label={title}
        className={cn('block', className)}
        {...props}
      >
        <title>{title}</title>
        <MarkPaths maskId={maskId} />
      </svg>
    )
  }

  return (
    <img
      src="/logo1.svg"
      alt={title}
      className={cn('block', className)}
      {...props}
    />
  )
}
