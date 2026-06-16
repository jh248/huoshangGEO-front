/**
 * [INPUT]: 依赖 react Fragment、framer-motion、lucide-react、ui/Card+Badge、lib/motion
 * [OUTPUT]: 默认导出 EngineLoopSection — 第四屏「增长引擎」: 五步横向流程 (诊断→沉淀→生成→分发→监测) + 持续回流自循环
 * [POS]: components/landing，兑现"引擎"二字 — 引擎一直转，服务做完就停
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Database,
  PenLine,
  SearchCheck,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, defaultViewport, springs } from "@/lib/motion";

// 五步增长链路 · 顺序即流向
const STEPS = [
  {
    Icon: SearchCheck,
    title: "品牌诊断",
    desc: "先看清品牌在主流 AI 答案里的提及、引用与竞争位置。",
  },
  {
    Icon: Database,
    title: "知识库沉淀",
    desc: "品牌事实与语义结构化入库，成为模型愿意引用的权威源。",
  },
  {
    Icon: PenLine,
    title: "内容生成",
    desc: "基于知识库批量生产 LLM-friendly 内容，面向引用而写。",
  },
  {
    Icon: Send,
    title: "分发",
    desc: "一键分发到多终端媒体，让内容进入模型的抓取范围。",
  },
  {
    Icon: Activity,
    title: "数据监测",
    desc: "多引擎可见度、引用、归因实时回流，定义下一轮优化方向。",
  },
];

const TILE_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

function StepCard({ Icon, title, desc, n }) {
  return (
    <Card variant="raised" className="h-full skeu-interactive">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground"
            style={TILE_STYLE}
          >
            <Icon className="size-5" />
          </span>
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {`0${n}`}
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </CardContent>
    </Card>
  );
}

function EngineLoopSection() {
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
          增长引擎
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          一个持续自循环的系统
        </h2>
      </motion.div>

      {/* 横向流程 · 桌面 (卡片 + 箭头) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-14 hidden items-stretch gap-3 lg:flex"
      >
        {STEPS.map(({ Icon, title, desc }, i) => (
          <Fragment key={title}>
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
              className="flex-1"
            >
              <StepCard Icon={Icon} title={title} desc={desc} n={i + 1} />
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.div
                variants={fadeInUp}
                className="flex shrink-0 items-center text-muted-foreground"
              >
                <ChevronRight className="size-5" />
              </motion.div>
            )}
          </Fragment>
        ))}
      </motion.div>

      {/* 纵向流程 · 小屏 (卡片 + 向下箭头) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-10 grid gap-3 lg:hidden"
      >
        {STEPS.map(({ Icon, title, desc }, i) => (
          <Fragment key={title}>
            <motion.div variants={fadeInUp}>
              <StepCard Icon={Icon} title={title} desc={desc} n={i + 1} />
            </motion.div>
            {i < STEPS.length - 1 && (
              <ChevronDown className="mx-auto size-5 text-muted-foreground" />
            )}
          </Fragment>
        ))}
      </motion.div>

    </section>
  );
}

export default EngineLoopSection;
