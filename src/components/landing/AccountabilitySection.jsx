/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge、lib/motion
 * [OUTPUT]: 默认导出 AccountabilitySection — 「对结果负责」: 三机制卡走 sticky 覆盖堆叠 (效果对赌 / 获客策略 / 认知体系)
 * [POS]: components/landing 序号 02，用机制接住"对结果负责"这句最重的承诺
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Handshake, ScanEye, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, defaultViewport } from "@/lib/motion";

// 三张机制卡 · 让"负责"是合同与机制，而非形容词
const MECHANISMS = [
  {
    Icon: Handshake,
    title: "承诺没达到效果按比例返费",
    desc: "官网点击率和电话线索未达约定目标，按比例返费。把承诺写进合同，而不是停留在话术。",
  },
  {
    Icon: ScanEye,
    title: "专家级获客策略定制",
    desc: "专家团队基于核心业务, 量身定制深度场景问题, 全面覆盖客户决策前的搜索行为, 精准拦截潜在需求",
  },
  {
    Icon: ShieldCheck,
    title: "品牌核心认知体系构建",
    desc: "整合行业地位、权威荣誉、竞品对比等核心品牌资产输入系统，确保AI生成内容100%贴合品牌调性与高度",
  },
];

function AccountabilitySection() {
  const sceneRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start 20%", "end 35%"],
  });
  const titleY = useTransform(scrollYProgress, [0, 0.72, 1], [0, 0, -260]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <div ref={sceneRef} className="relative mx-auto max-w-6xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="sticky top-[12vh] z-20 mx-auto h-0 max-w-2xl overflow-visible text-center"
          style={{ y: titleY }}
        >
          <Badge variant="secondary" className="mb-4">
            对结果负责
          </Badge>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            不止于优化，更对结果负责
          </h2>
        </motion.div>

        {/* 三机制卡 · sticky 覆盖堆叠: 标题定住，后卡同位覆盖前卡 */}
        <div className="relative pt-[20vh]">
          {MECHANISMS.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="sticky top-[32vh] flex h-80 w-full flex-col justify-center gap-5 rounded-[40px] bg-white p-12 shadow-[0_0_30px_rgba(0,0,0,0.1)] mb-10"
              style={{ zIndex: i + 1 }}
            >
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-black text-white shadow-lg">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="text-xs font-medium tabular-nums text-neutral-500">
                  0{i + 1} / 0{MECHANISMS.length}
                </p>
                <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-base">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AccountabilitySection;
