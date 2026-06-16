/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card + ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 FeaturesSection — 6 单元 Bento Grid 能力矩阵
 * [POS]: components/landing 序号 04，方案展示主战场
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from 'framer-motion'
import {
  Activity,
  Brain,
  Eye,
  FileSearch,
  Network,
  GitCompare,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fadeInUp, staggerContainer, defaultViewport, springs } from '@/lib/motion'

// ============================================================================
// Bento 布局 · 3 列栅格 · 6 单元跨度: 2-1-1-2-2-1 = 9 列 ÷ 3 行
// 顺序: 诊断 → 重写 → 追踪 → 助手 → 图谱 → 对比
// ============================================================================
const FEATURES = [
  {
    Icon: Activity,
    title: 'AI 可见性诊断',
    span: 'md:col-span-2',
    badge: '核心',
    desc: '一键扫描 30+ 高频提问，量化品牌在豆包 / DeepSeek / Kimi 中的引用份额、情感倾向与排名。',
  },
  {
    Icon: Brain,
    title: '内容意图重写',
    span: 'md:col-span-1',
    desc: '基于 LLM 抓取偏好的结构化重写引擎，让既有页面被模型识别为答案级权威。',
  },
  {
    Icon: Eye,
    title: '引用追踪监控',
    span: 'md:col-span-1',
    desc: '每日轮询关键提问，记录你的链接被哪些模型在何种语境下引用。',
  },
  {
    Icon: FileSearch,
    title: '智能编辑助手',
    span: 'md:col-span-2',
    badge: '新',
    desc: '内嵌写作侧栏：实时打分、补全 FAQ schema、生成 LLM-friendly 摘要。一边写一边面向 AI 优化。',
  },
  {
    Icon: Network,
    title: '知识图谱构建',
    span: 'md:col-span-2',
    desc: '从官网与文档自动抽取实体关系，输出 schema.org 与 RDF，让模型一次性理解整个品牌。',
  },
  {
    Icon: GitCompare,
    title: '多模型对比',
    span: 'md:col-span-1',
    desc: '横向比较 DeepSeek / 豆包 / Kimi / 文心一言 / 通义千问 在同一问题上的答案差异。',
  },
]

function FeaturesSection() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-4">
            能力矩阵
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            为 AI 而设计的全链路工具栈
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            从诊断、改写、追踪到对比 — 一个工作台覆盖生成式优化全流程。
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {FEATURES.map(({ Icon, title, span, badge, desc }) => (
            <motion.div
              key={title}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
              className={span}
            >
              <Card variant="raised" className="h-full skeu-interactive">
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                    {badge && (
                      <Badge variant="accent" className="h-5 text-[10px]">
                        {badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturesSection
