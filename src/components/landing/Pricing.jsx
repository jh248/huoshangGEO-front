/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card + ui/Badge + ui/Button、lib/motion
 * [OUTPUT]: 默认导出 Pricing — Starter / Pro / Enterprise 三档套餐
 * [POS]: components/landing 序号 07，转化决策核心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from 'framer-motion'
import { Check, Sparkles } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BorderBeam } from '@/components/ui/border-beam'
import { Button } from '@/components/ui/button'
import { fadeInUp, staggerContainer, defaultViewport, springs } from '@/lib/motion'

// ============================================================================
// 三档定价 · 中间 Pro 为推荐方案 (highlight=true 走 default 强调按钮)
// ============================================================================
const PLANS = [
  {
    name: 'Starter',
    price: '¥0',
    period: '/月',
    desc: '验证 AI 可见性概念，单站点起步。',
    cta: '免费开始',
    highlight: false,
    features: ['1 个站点', '10 个监控提问', '基础引用追踪', '每周邮件报告'],
  },
  {
    name: 'Pro',
    price: '¥1,980',
    period: '/月',
    desc: '正式投入 GEO 的增长团队首选。',
    cta: '开启 14 天试用',
    highlight: true,
    features: [
      '5 个站点',
      '100 个监控提问',
      '多模型对比 (5 个模型)',
      '智能编辑助手',
      '每日邮件 + 看板',
      '优先工单支持',
    ],
  },
  {
    name: 'Enterprise',
    price: '定制',
    period: '',
    desc: '集团级品牌矩阵 + 私有化部署。',
    cta: '联系我们',
    highlight: false,
    features: [
      '无限站点 / 提问',
      'API 与 Webhook 接入',
      'SSO + 权限矩阵',
      '专属客户成功经理',
      '私有部署可选',
    ],
  },
]

function Pricing() {
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
          按品牌规模选择套餐
        </h2>
        <p className="mt-4 text-base text-muted-foreground">
          所有套餐含基础诊断、引用追踪与每周报告，按需扩展模型对比与编辑助手。
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-16 grid gap-6 md:grid-cols-3"
      >
        {PLANS.map((plan) => (
          <motion.div
            key={plan.name}
            variants={fadeInUp}
            whileHover={{ y: -4, transition: springs.snappy }}
          >
            <Card
              variant="raised"
              className="relative h-full skeu-interactive"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.highlight && (
                    <Badge variant="accent" className="gap-1">
                      <Sparkles className="size-3" /> 推荐
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="pb-1 text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-6 flex flex-col gap-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
              {plan.highlight && (
                <>
                  <BorderBeam duration={16} size={240} borderWidth={2} />
                  <BorderBeam
                    duration={16}
                    delay={8}
                    size={240}
                    borderWidth={2}
                  />
                </>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

export default Pricing
