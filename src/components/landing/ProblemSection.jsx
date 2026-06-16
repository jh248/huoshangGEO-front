/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card、lib/motion
 * [OUTPUT]: 默认导出 ProblemSection — 三痛点卡片，引出价值主张
 * [POS]: components/landing 序号 03，承上启下到 FeaturesSection
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { EyeOff, TrendingDown, FileX } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  fadeInUp,
  staggerContainer,
  defaultViewport,
  springs,
} from "@/lib/motion";

// ============================================================================
// 三大痛点 · 顺序: 看不见 → 流量丢 → 内容废
// ============================================================================
const PROBLEMS = [
  {
    Icon: EyeOff,
    title: "AI 回答里看不见你",
    desc: "用户向豆包询问行业方案，竞品被引用而你的品牌从未出现，连一次曝光都拿不到。",
  },
  {
    Icon: TrendingDown,
    title: "SEO 流量正在被截断",
    desc: "AI 一句话答完，用户不再点击搜索结果。传统 SEO 漏斗顶端正在系统性崩塌。",
  },
  {
    Icon: FileX,
    title: "内容写了没有效果",
    desc: "深度长文无法被模型识别为权威源，投入的内容预算正在变成自我感动。",
  },
];

function ProblemSection() {
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
          搜索范式已经改变，你准备好了吗？
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          每天有 5 亿人在 AI 助手里提问，而绝大多数品牌在生成式答案中是隐形的。
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-16 grid gap-6 md:grid-cols-3"
      >
        {PROBLEMS.map(({ Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={fadeInUp}
            whileHover={{ y: -4, transition: springs.snappy }}
          >
            <Card variant="raised" className="h-full skeu-interactive">
              <CardHeader>
                <span
                  className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl text-destructive-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--destructive) 0%, color-mix(in srgb, var(--destructive) 80%, black) 100%)",
                    boxShadow:
                      "0 4px 12px color-mix(in srgb, var(--destructive) 32%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <CardTitle className="text-lg">{title}</CardTitle>
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
    </section>
  );
}

export default ProblemSection;
