/**
 * [INPUT]: 依赖 framer-motion、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 ComparisonSection — 第七屏「区别对手」: 火山 GEO vs 其他 六维逐行 VS 对垒表 (效果保障置顶)
 * [POS]: components/landing 序号 07，左排品牌墩 + 优势文案，右排对手缺口文案 + 暗色墩，中缝 VS 对垒
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  defaultViewport,
} from "@/lib/motion";

// 对垒数据 · ours=火山 GEO 优势 / theirs=对手缺口，效果保障恒置顶
const ROWS = [
  {
    ours: {
      title: "保官网点击率 · 电话线索",
      desc: "对效果负责，不达标按比例返费",
    },
    theirs: { title: "不承诺效果", desc: "只交工具，结果自负" },
  },
  {
    ours: {
      title: "数据来自真机实测",
      desc: "在真实设备上提问取数，用户看到什么就是什么",
    },
    theirs: { title: "数据失真", desc: "靠接口模拟取数，与真实回答有出入" },
  },
  {
    ours: {
      title: "APP 端同样看得见",
      desc: "手机 APP 里的 AI 回答也尽收眼底",
    },
    theirs: { title: "只看得到网页", desc: "移动端主战场完全缺位" },
  },
  {
    ours: { title: "全平台一网打尽", desc: "6 大 AI 平台、12 个终端同屏尽览" },
    theirs: { title: "视野受限", desc: "只盯三五个网页入口，看不到全貌" },
  },
  {
    ours: { title: "文章优化", desc: "AI 生成 + 持续调优，更易被 AI 引用" },
    theirs: { title: "不支持", desc: "只给监测报告，内容无从下手" },
  },
  {
    ours: { title: "文章发布", desc: "多渠道一键分发，全链路闭环" },
    theirs: { title: "不支持", desc: "需人工逐渠道发布" },
  },
];

// 品牌墩 · 微拟物公式: 渐变背景 + 外投影 + 顶部高光 + 底部暗边
const BRAND_BLOCK_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.2), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

// 对手墩 · 同公式取 foreground 派生暗色
const OTHER_BLOCK_STYLE = {
  background:
    "linear-gradient(135deg, var(--foreground) 0%, color-mix(in srgb, var(--foreground) 85%, black) 50%, color-mix(in srgb, var(--foreground) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--foreground) 25%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.15), inset 0 -1px 0 rgb(0 0 0 / 0.2)",
};

// 优势侧内容底 · primary 极淡渐变向 card 收束
const OURS_TINT_STYLE = {
  background:
    "linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, var(--card)) 0%, var(--card) 100%)",
};

function ComparisonSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge variant="secondary" className="mb-4">
          竞品对比
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          为什么选择火山全域 GEO
        </h2>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-16 flex flex-col gap-4 sm:gap-5"
      >
        {ROWS.map((row) => (
          <motion.div
            key={row.ours.title}
            variants={staggerItem}
            className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-4"
          >
            {/* 火山 GEO 侧 · 品牌墩 + 优势文案 */}
            <div className="flex min-h-24 flex-1 items-stretch overflow-hidden rounded-md skeu-raised">
              <div
                className="flex w-20 shrink-0 items-center justify-center text-sm font-bold text-primary-foreground sm:w-24 sm:text-base"
                style={BRAND_BLOCK_STYLE}
              >
                火山GEO
              </div>
              <div
                className="flex flex-1 flex-col items-center justify-center gap-1.5 px-5 py-4 text-center"
                style={OURS_TINT_STYLE}
              >
                <span className="text-base font-semibold text-primary sm:text-lg">
                  {row.ours.title}
                </span>
                <span className="text-xs text-primary/70 sm:text-sm">
                  {row.ours.desc}
                </span>
              </div>
            </div>

            {/* 中缝 VS */}
            <div
              className="flex items-center justify-center text-xl font-black italic tracking-tight text-foreground sm:w-10 sm:text-2xl"
              aria-hidden
            >
              VS
            </div>

            {/* 其他侧 · 缺口文案 + 暗色墩 */}
            <div className="flex min-h-24 flex-1 items-stretch overflow-hidden rounded-md skeu-raised">
              <div className="flex flex-1 flex-col items-center justify-center gap-1.5 bg-card px-5 py-4 text-center">
                <span className="text-base font-semibold text-foreground sm:text-lg">
                  {row.theirs.title}
                </span>
                <span className="text-xs text-muted-foreground sm:text-sm">
                  {row.theirs.desc}
                </span>
              </div>
              <div
                className="flex w-20 shrink-0 items-center justify-center text-sm font-bold text-background sm:w-24 sm:text-base"
                style={OTHER_BLOCK_STYLE}
              >
                其他
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default ComparisonSection;
