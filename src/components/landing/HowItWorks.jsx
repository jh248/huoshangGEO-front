/**
 * [INPUT]: 依赖 framer-motion、lucide-react、lib/motion
 * [OUTPUT]: 默认导出 HowItWorks — 4 步流程时间轴
 * [POS]: components/landing 序号 05，方案具象化
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from 'framer-motion'
import { Link2, ScanSearch, Wand2, LineChart } from 'lucide-react'
import { fadeInUp, staggerContainer, defaultViewport, springs } from '@/lib/motion'

// ============================================================================
// 四步流程 · 接入 → 诊断 → 优化 → 追踪
// ============================================================================
const STEPS = [
  {
    n: '01',
    Icon: Link2,
    title: '接入官网',
    desc: '粘贴 URL 或上传 sitemap，3 秒同步全站结构。',
  },
  {
    n: '02',
    Icon: ScanSearch,
    title: 'AI 诊断',
    desc: '对 30+ 高频提问扫描，生成可见性与引用基线。',
  },
  {
    n: '03',
    Icon: Wand2,
    title: '内容优化',
    desc: '智能助手指引重写，结构化 + 引用化双重提升。',
  },
  {
    n: '04',
    Icon: LineChart,
    title: '持续追踪',
    desc: '每日监控引用变化，对比竞品份额波动趋势。',
  },
]

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          四步搞定生成式优化
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          从接入到看到首次引用增长，平均 14 天。
        </p>
      </motion.div>

      <motion.ol
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-16 grid gap-6 md:grid-cols-4"
      >
        {STEPS.map(({ n, Icon, title, desc }) => (
          <motion.li
            key={n}
            variants={fadeInUp}
            whileHover={{ y: -4, transition: springs.snappy }}
            className="relative flex flex-col rounded-md bg-card p-6 skeu-raised"
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground"
                style={{
                  background:
                    'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)',
                  boxShadow:
                    '0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)',
                }}
              >
                <Icon className="size-5" />
              </span>
              <span className="font-mono text-xs font-medium text-muted-foreground">
                {n}
              </span>
            </div>
            <h3 className="mt-5 text-base font-medium text-foreground">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {desc}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  )
}

export default HowItWorks
