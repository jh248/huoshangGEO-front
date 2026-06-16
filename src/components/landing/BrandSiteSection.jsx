/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、components/CardSwap、lib/motion
 * [OUTPUT]: 默认导出 BrandSiteSection — 「品牌官网」: 左 导语 + 4 能力要点卡，右 CardSwap 3D 官网案例卡轮换
 * [POS]: components/landing，兑现「打造企业官方权威信息源」
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md；案例卡体为占位，接入真实官网截图时替换卡内容为 <img>
 */
import { motion } from "framer-motion";
import { BookOpenCheck, Globe, Link2, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CardSwap, { Card as SwapCard } from "@/components/CardSwap/CardSwap";
import { fadeInUp, staggerContainer, defaultViewport } from "@/lib/motion";

// 图标墩 · 微拟物公式: 渐变背景 + 外投影 + 顶部高光 + 底部暗边
const TILE_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

// 官网能力 4 要点 · 自主阵地 / AI 信源 / 收录权重 / 内容底盘
const POINTS = [
  {
    Icon: Globe,
    title: "自有可控阵地",
    desc: "品牌介绍、产品资料、品牌荣誉、官方资讯自主采编发布，权威性不受第三方平台规则约束",
  },
  {
    Icon: BookOpenCheck,
    title: "AI 的原版权威素材",
    desc: "自有信源同步供给 AI 信息框架生成、全网舆情背书与全域分发，口径统一、真实可信",
  },
  {
    Icon: Link2,
    title: "原生源链接高权重",
    desc: "官网链接为优质原生信源，全平台推广收录权重更高，搜索引擎自然曝光持续提升",
  },
  {
    Icon: ShieldCheck,
    title: "源头筑牢内容底盘",
    desc: "配合全域媒体矩阵分发，夯实品牌公信力，助力舆情管控与长效获客",
  },
];

// 官网案例卡 mock · 接入真实截图后将卡体替换为 <img>
const SITE_CASES = [
  { title: "客户官网案例 · 智能照明", url: "lighting-brand.com" },
  { title: "客户官网案例 · 消费电子", url: "electronics-brand.com" },
  { title: "客户官网案例 · 美妆个护", url: "beauty-brand.com" },
];

function PointCard({ Icon, title, desc }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 skeu-raised">
      <span
        className="inline-flex size-10 items-center justify-center rounded-2xl text-primary-foreground"
        style={TILE_STYLE}
      >
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function BrandSiteSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* 左：标题 + 导语 + 能力要点卡 */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4">
              品牌官网
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            打造企业官方权威信息源
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-5 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            官网是品牌自有的可控阵地，也是 AI
            与搜索引擎眼中的第一权威信源。我们为企业打造品牌官网，从源头筑牢内容底盘。
          </motion.p>
          <motion.div
            variants={staggerContainer}
            className="mt-7 grid gap-4 sm:grid-cols-2"
          >
            {POINTS.map((p) => (
              <motion.div key={p.title} variants={fadeInUp}>
                <PointCard {...p} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 右：客户官网案例 · CardSwap 3D 卡片轮换 (截图待替换卡体) */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="relative h-96 overflow-hidden sm:h-[32rem]"
        >
          <CardSwap
            width={560}
            height={430}
            cardDistance={60}
            verticalDistance={72}
            delay={4500}
            pauseOnHover
            skewAmount={5}
          >
            {SITE_CASES.map((c) => (
              <SwapCard key={c.title} className="overflow-hidden">
                <div className="flex h-full flex-col">
                  {/* 浏览器条 */}
                  <div className="flex items-center gap-1.5 border-b border-border bg-muted/60 px-4 py-2.5">
                    <span className="size-2.5 rounded-full bg-destructive/60" />
                    <span className="size-2.5 rounded-full bg-chart-3" />
                    <span className="size-2.5 rounded-full bg-chart-4" />
                    <span className="ml-2 truncate text-xs text-muted-foreground">
                      {c.url}
                    </span>
                  </div>
                  {/* 截图占位体 */}
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 bg-muted/30">
                    <MonitorSmartphone className="size-9 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      官网截图待替换
                    </p>
                  </div>
                </div>
              </SwapCard>
            ))}
          </CardSwap>
        </motion.div>
      </div>
    </section>
  );
}

export default BrandSiteSection;
