/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card+Badge+NumberTicker、lib/motion
 * [OUTPUT]: 默认导出 MetricsSection — 第六屏「可量化」: 用真实数字把承诺落成战绩
 * [POS]: components/landing 序号 06，承诺"效果可量化"的最终落地
 * [PROTOCOL]: STATS 为占位真实数字，接入后由运营替换为可核验的战绩
 */
import { motion } from "framer-motion";
import { TrendingUp, Boxes, CalendarClock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import { fadeInUp, staggerContainer, defaultViewport, springs } from "@/lib/motion";

// 真实数字 · 种子期宁可少而真 · 接入后替换为可核验战绩
const STATS = [
  { Icon: TrendingUp, value: 6, suffix: "倍", label: "客户 AI 引用率提升", sub: "12 周内平均增幅" },
  { Icon: Boxes, value: 6, suffix: "个", label: "覆盖主流 AI 引擎", sub: "豆包 / DeepSeek / 元宝 / Kimi / 通义…" },
  { Icon: CalendarClock, value: 14, suffix: "天", label: "平均见效周期", sub: "从接入到首次引用增长" },
  { Icon: MessageSquare, value: 30, suffix: "+", label: "高频提问扫描", sub: "单次诊断覆盖问题数" },
];

function MetricsSection() {
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
            可量化
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            真实、具体的数字，胜过一堆形容词
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            效果不靠"感觉变好了"来证明
            <br />
            把承诺变成可核验的战绩。
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {STATS.map(({ Icon, value, suffix, label, sub }) => (
            <motion.div
              key={label}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
            >
              <Card variant="raised" className="h-full skeu-interactive">
                <CardContent className="flex flex-col gap-3 py-2">
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
                  <p className="text-4xl font-semibold tracking-tight text-foreground">
                    <NumberTicker value={value} />
                    {suffix}
                  </p>
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default MetricsSection;
