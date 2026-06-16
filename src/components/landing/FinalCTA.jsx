/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/RainbowButton、lib/motion
 * [OUTPUT]: 默认导出 FinalCTA — 终极行动召唤 (大标题 + 单 CTA + 径向晕染)
 * [POS]: components/landing 序号 09，落地页最后一个转化入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Rays from "@/components/ui/light-rays";
import { fadeInUp, staggerContainer, defaultViewport } from "@/lib/motion";

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* ====== 顶部 light-rays · 由上至下淡出，适配白底 ====== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      >
        <Rays
          backgroundColor="transparent"
          raysColor={{ mode: "single", color: "#1a1a1a" }}
          intensity={8}
          rays={22}
          reach={10}
          position={50}
          style={{ zIndex: 0, opacity: 0.55 }}
        />
      </div>
      {/* ====== 单点径向晕染 · 与 Hero 呼应 ====== */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 20% 30%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
          >
            看看你的品牌，在 AI 眼里是什么样子
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground"
          >
            范式转移已经发生。谁先被生成式引擎看得见、被引用、被推荐，谁就赢得心智。
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <RainbowButton size="xl" asChild>
              <Link to="/brand-diagnosis">
                品牌诊断
                <ArrowRight />
              </Link>
            </RainbowButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCTA;
