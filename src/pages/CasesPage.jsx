/**
 * [INPUT]: 依赖 framer-motion、recharts、lucide-react、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 CasesPage — 客户案例页，展示西屋大路灯 GEO 优化成果
 * [POS]: pages 序号，注册到 /cases 路由，走 Layout 包裹
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, Zap, Clock, ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp, defaultViewport, staggerContainer, staggerItem } from "@/lib/motion";
import { pageTransition } from "@/lib/motion";
import { useNavigate } from "react-router-dom";

// 模型表现数据
const MODEL_DATA = [
  { name: "豆包", rate: 21.22, level: "低" },
  { name: "DeepSeek", rate: 54.8, level: "中" },
  { name: "通义千问", rate: 25.4, level: "低" },
  { name: "元宝", rate: 28.6, level: "低" },
  { name: "文心一言", rate: 23.1, level: "低" },
  { name: "Kimi", rate: 11.3, level: "低" },
];

const BAR_COLORS = {
  高: "#22c55e",
  中: "#3b5bdb",
  低: "#d1d5db",
};

// 自定义 Tooltip
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          提及率：<span className="font-bold text-foreground">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
}

// 时间线步骤
const TIMELINE = [
  {
    period: "优化前",
    tag: "基线",
    title: "品牌几乎不可见",
    desc: "在主流 AI 大模型中，西屋大路灯的有效提及次数为 0，品牌在 AI 生成内容中完全缺席。",
    color: "bg-muted text-muted-foreground",
  },
  {
    period: "第 1 周",
    tag: "启动",
    title: "场景问题植入 & 知识库构建",
    desc: "梳理核心业务场景，提炼品牌差异化优势，系统构建深度场景问题库，完成首轮知识输入。",
    color: "bg-primary/10 text-primary",
  },
  {
    period: "第 2 周",
    tag: "提速",
    title: "多模型分发 & 权威内容覆盖",
    desc: "品牌内容向 DeepSeek、元宝、文心一言等主流模型全面分发，AI 引用开始出现并稳步增长。",
    color: "bg-primary/10 text-primary",
  },
  {
    period: "第 4 周",
    tag: "爆发",
    title: "提及率提升 27.40%，有效提及 674 次",
    desc: "一个月内提及率从 0 跃升至 27.40%，有效提及次数达到 674 次，DeepSeek 单模型表现达中位线以上。",
    color: "bg-green-500/10 text-green-600",
  },
];

function CasesPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-background text-foreground"
    >
      {/* ─────────────────────────── HERO ─────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-24 sm:pb-28 sm:pt-32">
        {/* 背景装饰 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
          }}
        />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div variants={staggerItem}>
            <Badge variant="secondary" className="mb-5">
              客户案例
            </Badge>
          </motion.div>
          <motion.h1
            variants={staggerItem}
            className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
          >
            真实客户，真实结果
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            我们用数据说话。每一个案例都是可验证的成果，而不是停留在 PPT 里的承诺。
          </motion.p>
        </motion.div>
      </section>

      {/* ─────────────────── 核心数据大字报 ─────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              value: "+27.40%",
              label: "提及率提升",
              sub: "一个月内",
              icon: TrendingUp,
              accent: "text-primary",
            },
            {
              value: "674",
              label: "有效提及次数",
              sub: "从 0 起步",
              icon: Zap,
              accent: "text-blue-500",
            },
            {
              value: "30天",
              label: "优化周期",
              sub: "全程托管服务",
              icon: Clock,
              accent: "text-green-500",
            },
          ].map(({ value, label, sub, icon: Icon, accent }) => (
            <motion.div
              key={label}
              variants={staggerItem}
              className="skeu-raised flex flex-col items-center gap-3 rounded-[32px] bg-card p-8 text-center"
            >
              <span
                className={`inline-flex size-11 items-center justify-center rounded-full bg-muted ${accent}`}
              >
                <Icon className="size-5" />
              </span>
              <p className={`text-5xl font-bold tracking-tighter ${accent}`}>{value}</p>
              <div>
                <p className="text-base font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─────────────────── 客户故事卡 ─────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-card shadow-[0_0_40px_rgba(0,0,0,0.07)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* 左：品牌信息 */}
            <div className="flex flex-col justify-between gap-6 bg-foreground p-10 text-background">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-background/50">
                  客户品牌
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">西屋大路灯</h2>
                <p className="mt-2 text-sm leading-relaxed text-background/60">
                  专注户外大型路灯产品，面向工程采购与终端消费双渠道，品类竞争激烈，决策场景高度依赖 AI 搜索推荐。
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["照明行业", "B2B 采购", "品牌 GEO", "AI 搜索优化"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-background/20 px-3 py-1 text-xs font-medium text-background/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-start gap-3">
                <Quote className="mt-0.5 size-5 shrink-0 text-background/30" />
                <p className="text-sm italic leading-relaxed text-background/60">
                  「一个月内，品牌在 AI 问答场景里从完全不存在，变成了行业里可被引用的权威声音。」
                </p>
              </div>
            </div>
            {/* 右：成果列表 */}
            <div className="flex flex-col justify-center gap-5 p-10">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                优化成果
              </p>
              {[
                "提及率 30 天内提升 27.40%",
                "有效提及次数从 0 增长至 674 次",
                "DeepSeek 模型表现达中位水平（50-60%）",
                "全面覆盖 6 大主流 AI 模型",
                "品牌核心场景问题库构建完成",
                "高权威内容资产沉淀，持续产生复利",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── 模型表现排行榜 ─────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-8 text-center">
            <Badge variant="secondary" className="mb-3">
              模型分布
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              模型表现排行榜
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
              优化后西屋大路灯在各主流 AI 大模型中的提及率分布，DeepSeek 已达中位水平（50–60%）
            </p>
          </div>

          {/* 图例 */}
          <div className="mb-6 flex justify-end gap-6">
            {Object.entries(BAR_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ background: color }}
                />
                <span className="text-xs text-muted-foreground">
                  {label === "高" ? "高 (≥60%)" : label === "中" ? "中 (50-60%)" : "低 (<50%)"}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-[32px] bg-card p-6 shadow-[0_0_30px_rgba(0,0,0,0.06)] sm:p-10">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={MODEL_DATA} barSize={52} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.5)", radius: 8 }} />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                  {MODEL_DATA.map((entry) => (
                    <Cell key={entry.name} fill={BAR_COLORS[entry.level]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── 优化时间线 ─────────────────── */}
      <section className="px-4 pb-20">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-5xl"
        >
          <div className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3">
              优化过程
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              30 天，从 0 到可见
            </h2>
          </div>

          <div className="relative">
            {/* 竖线 */}
            <div className="absolute left-[19px] top-6 hidden h-[calc(100%-48px)] w-px bg-border md:block" />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-col gap-6"
            >
              {TIMELINE.map(({ period, tag, title, desc, color }) => (
                <motion.div
                  key={period}
                  variants={staggerItem}
                  className="flex gap-5"
                >
                  {/* 圆点 */}
                  <div className="relative hidden shrink-0 md:flex">
                    <span className="mt-1 flex size-10 items-center justify-center rounded-full bg-card ring-1 ring-border">
                      <span className="size-3 rounded-full bg-primary" />
                    </span>
                  </div>
                  {/* 内容 */}
                  <div className="flex-1 rounded-[24px] bg-card p-6 shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">{period}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
                        {tag}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─────────────────── CTA ─────────────────── */}
      <section className="px-4 pb-28">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-2xl overflow-hidden rounded-[40px] bg-foreground px-8 py-14 text-center text-background"
        >
          <Badge className="mb-4 border-background/20 bg-background/10 text-background">
            立即开始
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight">
            你的品牌，也可以成为下一个案例
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-background/60">
            免费获取品牌 AI 可见度诊断报告，了解你的品牌在各大 AI 模型中的现状与提升空间。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full bg-background text-foreground hover:bg-background/90"
              onClick={() => navigate("/brand-diagnosis")}
            >
              免费获取诊断报告
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}

export default CasesPage;
