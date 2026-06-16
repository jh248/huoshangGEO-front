/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 MonitorSection — 第二屏「可监测」: 左 4 指标统计卡 + 右真·迷你监测看板 (KPI + 各引擎提及率条)
 * [POS]: components/landing，紧随 Hero，兑现承诺「看得见」；数据取《GEO 品牌检测报告》样例
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md；看板为前端示意，颜色仅用 token
 */
import { motion } from "framer-motion";
import { LayoutDashboard, Percent, Quote, Smile, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, defaultViewport } from "@/lib/motion";

const TILE_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

// 左侧 4 指标 · 带样例数字
const STATS = [
  {
    Icon: Quote,
    value: "6",
    unit: "次",
    label: "提及次数",
    desc: "12 端对话中被命名提及",
  },
  {
    Icon: Percent,
    value: "50",
    unit: "%",
    label: "品牌提及率",
    desc: "高频提问中作为答案来源",
  },
  {
    Icon: Trophy,
    value: "#3",
    unit: "",
    label: "平均排名",
    desc: "同一问题下的平均位次",
  },
  {
    Icon: Smile,
    value: "100",
    unit: "%",
    label: "正面情感",
    desc: "正面 / 中性提及占比",
  },
];

// 看板顶部 KPI
const BOARD_KPIS = [
  { label: "GEO 得分", value: "43.4" },
  { label: "提及率", value: "50%" },
  { label: "平均排名", value: "#3" },
];

// 各引擎提及率
const ENGINES = [
  { name: "通义千问", mark: "千", rate: 100 },
  { name: "元宝", mark: "元", rate: 50 },
  { name: "DeepSeek", mark: "DS", rate: 50 },
  { name: "豆包", mark: "豆", rate: 33 },
  { name: "Kimi", mark: "Km", rate: 25 },
  { name: "文心一言", mark: "文", rate: 17 },
];

function StatCard({ Icon, value, unit, label, desc }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 skeu-raised">
      <span
        className="inline-flex size-10 items-center justify-center rounded-2xl text-primary-foreground"
        style={TILE_STYLE}
      >
        <Icon className="size-5" />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="ml-0.5 text-base text-muted-foreground">{unit}</span>
        )}
      </p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {desc}
      </p>
    </div>
  );
}

function EngineBar({ name, mark, rate }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold text-primary-foreground"
        style={TILE_STYLE}
      >
        {mark}
      </span>
      <span className="w-16 shrink-0 text-xs text-foreground">{name}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${rate}%`,
            background:
              "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, transparent) 100%)",
          }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {rate}%
      </span>
    </div>
  );
}

function MonitorBoard() {
  return (
    <div className="rounded-3xl bg-card p-5 skeu-raised">
      {/* 看板头 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-xl text-primary-foreground"
            style={TILE_STYLE}
          >
            <LayoutDashboard className="size-4" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">
              品牌监测看板
            </p>
            <p className="text-xs text-muted-foreground">西屋大路灯 · 6 引擎</p>
          </div>
        </div>
        <Badge variant="outline" className="rounded-xl">
          最近 7 天
        </Badge>
      </div>

      {/* KPI */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {BOARD_KPIS.map((k) => (
          <div
            key={k.label}
            className="rounded-md border border-border bg-background/60 px-3 py-2.5 text-center"
          >
            <p className="text-lg font-semibold tracking-tight text-foreground">
              {k.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      {/* 各引擎提及率 */}
      <div className="mt-4 space-y-2.5 rounded-md bg-muted/40 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          各引擎提及率
        </p>
        {ENGINES.map((e) => (
          <EngineBar key={e.name} {...e} />
        ))}
      </div>
    </div>
  );
}

function MonitorSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* 左：标题 + 指标统计卡 */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="secondary" className="mb-4">
              可监测
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            通过数据大屏量我们火山全域GEO优化之后的效果
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            className="mt-7 grid gap-4 sm:grid-cols-2"
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeInUp}>
                <StatCard {...s} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 右：迷你监测看板 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <MonitorBoard />
        </motion.div>
      </div>
    </section>
  );
}

export default MonitorSection;
