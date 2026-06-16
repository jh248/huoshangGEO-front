/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、lib/motion、landing/MediaPlaceholder
 * [OUTPUT]: 默认导出 AttributionSection — 第三屏「可归因」: 展示 AI 流量的归因路径
 * [POS]: components/landing 序号 03，承接 MonitorSection，兑现承诺二"可追溯"
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { MessageSquare, Eye, MousePointerClick, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  fadeInUp,
  staggerContainer,
  defaultViewport,
  springs,
} from "@/lib/motion";
import MediaPlaceholder from "@/components/landing/MediaPlaceholder";

// 归因路径三段 · 用户在 AI 引擎提问 → 看到品牌 → 点击/转化
const PATH = [
  {
    Icon: MessageSquare,
    step: "01",
    title: "在 AI 引擎提问",
    desc: "用户向豆包 / DeepSeek 等提出行业问题",
  },
  {
    Icon: Eye,
    step: "02",
    title: "看到你的品牌",
    desc: "你的品牌作为答案来源被引用、被推荐",
  },
  {
    Icon: MousePointerClick,
    step: "03",
    title: "点击与转化",
    desc: "通过红包令牌或商品链接，落到转化",
  },
];

function AttributionSection() {
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
            可归因
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            不只是"多了流量"，而是"这笔流量，来自哪次 AI 引用"
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            每一笔来自 AI
            的流量都能追到源头
            <br />
            从用户提问、看到品牌，到点击转化，全程可追踪。
            这正面回应 B 端最大的疑虑：花的钱到底有没有效、效果怎么证明。
          </p>
        </motion.div>

        {/* 归因路径 · 三段连线 */}
        <motion.ol
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {PATH.map(({ Icon, step, title, desc }, i) => (
            <motion.li
              key={step}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
              className="relative flex flex-col rounded-md bg-card p-6 skeu-raised"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
                    boxShadow:
                      "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {step}
                </span>
                {i < PATH.length - 1 && (
                  <span className="ml-auto hidden text-muted-foreground md:inline">
                    →
                  </span>
                )}
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

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-10"
        >
          <MediaPlaceholder
            icon={Route}
            label="流量归因看板截图 / 路径示意图"
            hint="AI 引擎来源 · 引用语境 · UTM 链路 · 转化漏斗"
            ratio="aspect-[21/9]"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default AttributionSection;
