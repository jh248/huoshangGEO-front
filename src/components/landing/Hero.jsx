/**
 * [INPUT]: 依赖 react state、framer-motion、lucide-react、ui/Button+Input+CircularText、lib/motion、landing/BrandDiagnosisDialog
 * [OUTPUT]: 默认导出 Hero — Landing 首屏单列居中 (主标题 + 副文 + 实时搜索输入 → 品牌诊断弹框)
 * [POS]: components/landing 序号 01，被 pages/LandingPage 顶部消费，承接品牌诊断首屏
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, BotMessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CircularText } from "@/components/ui/circular-text";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer, defaultViewport } from "@/lib/motion";
import { AuroraBackground } from "@/components/landing/AuroraBackground";
import BrandDiagnosisDialog from "@/components/landing/BrandDiagnosisDialog";
import { GradientWaveText } from "@/components/gradient-wave-text";

function Hero() {
  const [question, setQuestion] = useState("");
  const [diagnoseOpen, setDiagnoseOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setDiagnoseOpen(true);
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* ====== Aurora 极光背景 (顶部纹理浓 · 底部融入 background) ====== */}
      <div className="absolute inset-0 z-0 bg-background">
        <AuroraBackground />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--background) 50%, transparent) 60%, var(--background) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="flex w-full max-w-6xl flex-col items-center text-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="max-w-6xl text-balance text-3xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl xl:text-6xl"
          >
            <GradientWaveText
              inView
              repeat
              nowrap
              speed={0.333}
              bottomOffset={12}
              ariaLabel="在 AI 的回答里，有没有你？"
            >
              在 AI 的回答里，有没有你？
            </GradientWaveText>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-4xl text-pretty text-base font-normal leading-relaxed text-muted-foreground sm:text-xl"
          >
            究竟是哪些品牌的内容，成了主流AI的“标准答案”？
          </motion.p>

          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit}
            className="mt-10 flex h-20 w-full max-w-5xl cursor-text items-center gap-4 rounded-full bg-card py-0 pl-6 pr-2 skeu-raised sm:h-24 sm:pl-8 sm:pr-2"
          >
            <BotMessageSquare className="size-9 shrink-0 text-primary sm:size-11" />
            <Input
              aria-label="实时搜索问题"
              name="q"
              enterKeyHint="search"
              autoComplete="off"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="输入任意问题，如：火山全域 GEO…"
              className="h-full flex-1 border-0 bg-transparent px-0 text-lg font-medium shadow-none placeholder:text-muted-foreground focus-visible:ring-0 sm:text-2xl"
              style={{ background: "transparent", boxShadow: "none" }}
            />
            <Button
              type="submit"
              size="icon"
              aria-label="开始实时搜索"
              className="relative isolate ml-auto h-16 w-16 overflow-hidden rounded-full p-0 [&_svg]:size-6 sm:h-24 sm:w-24 sm:[&_svg]:size-8"
            >
              <CircularText
                text="AI GEO · BRAND DIAGNOSIS · "
                className="inset-0.5 text-[0.5rem] text-primary-foreground/70 sm:inset-1 sm:text-[0.625rem]"
              />
              <ArrowUpRight className="relative z-10 text-primary-foreground" />
            </Button>
          </motion.form>

          <motion.div variants={fadeInUp} className="h-10" aria-hidden />
        </motion.div>

        {/* ====== 下滑引导箭头 ====== */}
        <motion.button
          type="button"
          aria-label="向下浏览"
          onClick={() =>
            window.scrollBy({
              top: window.innerHeight * 0.9,
              behavior: "smooth",
            })
          }
          className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 0.8, duration: 0.4 },
            y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <ChevronDown className="size-7" />
        </motion.button>
      </div>

      <BrandDiagnosisDialog
        open={diagnoseOpen}
        onOpenChange={setDiagnoseOpen}
        defaultBrand={question}
      />
    </section>
  );
}

export default Hero;
