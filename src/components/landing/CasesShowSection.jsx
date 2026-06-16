/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 CasesShowSection — 合作案例展示，双层镶边大卡 (左品牌墩 / 右成果)
 * [POS]: components/landing，LandingPage 序号 05.5，编排于 ComparisonSection 之后
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { TrendingUp, Zap, Bot, LayoutGrid, BookOpenCheck, Repeat2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, defaultViewport, staggerContainer, staggerItem, springs } from "@/lib/motion";

// 合作案例数据
const CASES = [
  {
    brand: "西屋大路灯",
    tags: ["照明行业", "B2B 采购", "品牌 GEO", "AI 搜索优化"],
    desc: "专注户外大型路灯产品，面向工程采购与终端消费双渠道，品类竞争激烈，决策场景高度依赖 AI 搜索推荐。",
    // 大数字卡
    bigStats: [
      { value: "+27.40%", label: "提及率提升", sub: "30 天内", icon: TrendingUp },
      { value: "674次", label: "有效提及", sub: "从 0 起步", icon: Zap },
    ],
    // 其他成果
    items: [
      { icon: Bot, text: "DeepSeek 提及率达中位水平（50–60%）" },
      { icon: LayoutGrid, text: "全面覆盖 6 大主流 AI 模型" },
      { icon: BookOpenCheck, text: "品牌核心场景问题库构建完成" },
      { icon: Repeat2, text: "高权威内容资产沉淀，持续产生复利" },
    ],
  },
];

function CasesShowSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      {/* 标题 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge variant="secondary" className="mb-4">合作案例</Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          他们都在使用火山全域GEO
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          真实品牌、真实数据 —— 看看 GEO 如何把「0 提及」变成 AI 答案里的常客。
        </p>
      </motion.div>

      {/* 案例列表 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-14 flex flex-col gap-6"
      >
        {CASES.map((c) => (
          <motion.div
            key={c.brand}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            transition={springs.snappy}
            // 双层镶边：外层托盘 (p-2 凸起) + 内核圆角内收
            className="rounded-3xl bg-card p-2 skeu-raised"
          >
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-2">

              {/* 左：品牌信息深色墩 */}
              <div className="flex flex-col justify-between gap-8 bg-foreground p-8 text-background sm:p-10">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-background/45">客户品牌</p>
                  <h3 className="mt-3 text-4xl font-bold tracking-tight">{c.brand}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-background/60">{c.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-background/15 bg-background/5 px-3 py-1 text-xs font-medium text-background/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 右：成果展示 */}
              <div className="flex flex-col justify-center gap-6 p-8 sm:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">优化成果</p>

                {/* 大数字双卡 · 双层镶边 (内凹托盘 + 凸起亮面) */}
                <div className="grid grid-cols-2 gap-3">
                  {c.bigStats.map(({ value, label, sub, icon: Icon }) => (
                    <div key={label} className="rounded-2xl p-1.5 skeu-inset">
                      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 skeu-raised">
                        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-card text-primary skeu-knob">
                          <Icon className="size-4" />
                        </span>
                        <p className="text-4xl font-bold leading-none tracking-tighter tabular-nums text-primary sm:text-5xl">
                          {value}
                        </p>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 其他成果列表 · 内凹托盘承托 */}
                <div className="flex flex-col gap-1 rounded-2xl p-2 skeu-inset">
                  {c.items.map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-200 hover:bg-card"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-card text-primary skeu-knob">
                        <Icon className="size-3.5" />
                      </span>
                      <p className="text-sm text-foreground">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default CasesShowSection;
