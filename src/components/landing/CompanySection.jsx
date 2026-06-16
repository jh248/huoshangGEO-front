/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 CompanySection — 公司实力背书 (简介 + 4 数字墩 + 爱客宝标杆深色墩 + TOP 合作平台)
 * [POS]: components/landing，LandingPage 序号 01.5，编排于 Hero 之后
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { Users, TrendingUp, ShoppingBag, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, defaultViewport, staggerContainer, staggerItem, springs } from "@/lib/motion";

// 实力数字墩
const STATS = [
  { value: "2000万+", label: "注册会员", sub: "爱客宝平台", icon: Users },
  { value: "25亿+", label: "高峰月交易额", sub: "全渠道 GMV", icon: TrendingUp },
  { value: "7年", label: "电商推广深耕", sub: "恒丰汇金集团", icon: ShoppingBag },
  { value: "10年", label: "技术积累", sub: "自研源码到产品", icon: Cpu },
];

// TOP 合作平台
const PARTNERS = ["淘宝", "京东", "拼多多", "美团", "抖音"];

function CompanySection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      {/* 标题 + 简介 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mx-auto max-w-3xl text-center"
      >
        <Badge variant="secondary" className="mb-4">关于盈匠数科</Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          承袭集团十年积累，自研技术构建 GEO 商业闭环
        </h2>
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          深圳市盈匠数字科技有限公司（盈匠数科）成立于 2025 年，专注 AI 搜索排名优化（GEO）与全域推客营销（CPS）。公司脱胎于恒丰汇金投资集团，承袭集团在电商与推广领域 7 年深耕与 10 年技术积累，以自研技术为核心，构建了从源码到产品到市场的完整商业闭环。
        </p>
      </motion.div>

      {/* 实力数字墩 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {STATS.map(({ value, label, sub, icon: Icon }) => (
          <motion.div
            key={label}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            transition={springs.snappy}
            className="flex flex-col gap-3 rounded-2xl bg-card p-5 skeu-raised skeu-interactive"
          >
            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-card text-primary skeu-knob">
              <Icon className="size-5" />
            </span>
            <p className="text-4xl font-bold leading-none tracking-tighter tabular-nums text-primary sm:text-5xl">
              {value}
            </p>
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 爱客宝标杆项目 + TOP 合作平台 · 深色墩 */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-6 rounded-3xl bg-card p-2 skeu-raised"
      >
        <div className="flex flex-col gap-8 rounded-2xl bg-foreground p-8 text-background sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-background/45">集团标杆项目</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">爱客宝</h3>
            <p className="mt-4 text-sm leading-relaxed text-background/60">
              注册会员 2000 万+，高峰月交易额 25 亿+，是淘宝、京东、拼多多、美团、抖音等头部电商与本地生活平台的 TOP 合作伙伴。
            </p>
          </div>
          <div className="shrink-0">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-background/45">TOP 合作平台</p>
            <div className="flex flex-wrap gap-2">
              {PARTNERS.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-background/15 bg-background/5 px-4 py-1.5 text-sm font-medium text-background/80"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default CompanySection;
