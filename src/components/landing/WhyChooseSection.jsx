/**
 * [INPUT]: 依赖 framer-motion、ui/Card + ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 WhyChooseSection — 火山 GEO 与其他方案的能力对比
 * [POS]: components/landing 序号 05，承接 FeaturesSection，进入 HowItWorks 前强化选择理由
 * [PROTOCOL]: 对比文案为前端展示数据；颜色、圆角、阴影仅使用设计系统 token 与组件
 */
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer, defaultViewport } from "@/lib/motion";

const COMPARISONS = [
  {
    advantage: "端侧真实数据",
    advantageDesc: "真实采集，还原用户所见",
    other: "非真实数据",
    otherDesc: "API 接口，数据偏离实际",
  },
  {
    advantage: "支持 APP 数据",
    advantageDesc: "全面覆盖移动端，流量不漏",
    other: "不支持",
    otherDesc: "仅限网页版，缺失核心场景",
  },
  {
    advantage: "电商数据支持",
    advantageDesc: "直击购物决策，看懂推荐理由",
    other: "不支持",
    otherDesc: "无电商语义，无法分析购买类问题",
  },
  {
    advantage: "平台覆盖更全",
    advantageDesc: "8 大平台 x 12 个端，一键全览",
    other: "覆盖不全",
    otherDesc: "仅 3-5 个网页版，视角不全",
  },
  {
    advantage: "自动化 GEO",
    advantageDesc: "全链路自动化，降本增效",
    other: "没自动化",
    otherDesc: "人工比对，无法规模化",
  },
];

function ComparisonRow({ item }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]"
    >
      <div className="grid overflow-hidden rounded-md border border-primary/20 bg-primary/10 sm:grid-cols-[7rem_1fr]">
        <div className="flex items-center justify-center bg-primary px-4 py-5 text-lg font-semibold text-primary-foreground">
          火山 GEO
        </div>
        <div className="flex flex-col justify-center px-5 py-5 text-center sm:text-left">
          <p className="text-xl font-semibold text-primary">{item.advantage}</p>
          <p className="mt-2 text-sm text-primary/80">{item.advantageDesc}</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-lg font-semibold text-muted-foreground">
          VS
        </span>
      </div>

      <div className="grid overflow-hidden rounded-md border border-border bg-card sm:grid-cols-[1fr_7rem]">
        <div className="flex flex-col justify-center px-5 py-5 text-center sm:text-left">
          <p className="text-xl font-semibold text-foreground">{item.other}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.otherDesc}</p>
        </div>
        <div className="flex items-center justify-center bg-muted px-4 py-5 text-lg font-semibold text-muted-foreground">
          其他
        </div>
      </div>
    </motion.div>
  );
}

function WhyChooseSection() {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-4">
            选择理由
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            为什么选择火山 GEO
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            不只看网页答案，而是从真实端侧、移动场景、电商决策到自动化执行形成完整闭环。
          </p>
        </motion.div>

        <Card variant="raised" className="mt-16 rounded-3xl py-0">
          <CardContent className="p-5 sm:p-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="grid gap-4"
            >
              {COMPARISONS.map((item) => (
                <ComparisonRow key={item.advantage} item={item} />
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default WhyChooseSection;
