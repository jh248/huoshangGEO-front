/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card + ui/Avatar、lib/motion
 * [OUTPUT]: 默认导出 Testimonials — 6 张引用证言卡片
 * [POS]: components/landing 序号 06，社会证明
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { fadeInUp, staggerContainer, defaultViewport, springs } from '@/lib/motion'

// ============================================================================
// 客户证言 · 增长、内容、技术、市场、创始、SEO 六个视角覆盖
// ============================================================================
const QUOTES = [
  {
    name: '李哲翰',
    title: 'ByteSpace · 增长负责人',
    initials: 'LZ',
    text: '接入火山 GEO 三个月，我们在豆包关于"国产协作工具"的回答里从 0 引用做到了首位推荐。',
  },
  {
    name: 'Olivia Chen',
    title: 'NovaCloud · 内容总监',
    initials: 'OC',
    text: '它不是把 SEO 改成 GEO 那么简单，而是把内容重新塑造成模型愿意引用的结构。',
  },
  {
    name: '张维斌',
    title: 'OrbitAI · CTO',
    initials: 'ZW',
    text: '多模型对比是杀手锏，我们终于能像监控搜索排名一样监控被引用的情况。',
  },
  {
    name: '杉本绫香',
    title: 'KaizenLab · CMO',
    initials: 'SA',
    text: '搜索流量 12 个月下降 38%，AI 引用份额上升 6 倍，转化反而提升了。',
  },
  {
    name: '王远舟',
    title: 'PrismOS · 创始人',
    initials: 'WY',
    text: '所有市场预算重新做了分配，AI 渠道现在是我们 ROI 最高的一环。',
  },
  {
    name: '林若汐',
    title: 'PixelMind · SEO 主管',
    initials: 'LR',
    text: '从「优化关键词」到「优化语义片段」，火山 GEO 把整套方法论说清楚了。',
  },
]

function Testimonials() {
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
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            从增长团队到 CTO 都在用
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            500+ 团队用火山 GEO 让品牌在 AI 时代被持续提及。
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {QUOTES.map((q) => (
            <motion.div
              key={q.name}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
            >
              <Card variant="raised" className="h-full skeu-interactive">
                <CardContent className="flex flex-col gap-4 py-2">
                  <Quote className="size-5 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">
                    “{q.text}”
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{q.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {q.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {q.title}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
