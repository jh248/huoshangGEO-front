/**
 * [INPUT]: 由 shadcnblocks 注册表 hero238 抽取，依赖 lib/utils cn() 与 index.css 的 @keyframes aurora-background
 * [OUTPUT]: 命名导出 AuroraBackground — 极光纹理装饰层 (absolute inset-0 · 不占布局 · aria-hidden)
 * [POS]: components/landing 装饰层，被 Hero 单点消费作为首屏背景
 * [PROTOCOL]: 着色层不可改 (mask + invert + animate 公式)，仅可调 props
 */
import { cn } from '@/lib/utils'

export function AuroraBackground({ className, showRadialGradient = true, ...props }) {
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{
        '--aurora':
          'repeating-linear-gradient(100deg,#000_10%,#666_15%,#ccc_20%,#fff_25%,#333_30%)',
        '--dark-gradient':
          'repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)',
        '--white-gradient':
          'repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)',
        '--gray-200': '#ccc',
        '--gray-400': '#666',
        '--gray-800': '#333',
        '--black': '#000',
        '--white': '#fff',
        '--transparent': 'transparent',
      }}
      {...props}
    >
      <div
        className={cn(
          `pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--black)_10%,var(--gray-400)_15%,var(--gray-200)_20%,var(--white)_25%,var(--gray-800)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:animate-aurora-background after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
          showRadialGradient &&
            '[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]'
        )}
      />
    </div>
  )
}

export default AuroraBackground
