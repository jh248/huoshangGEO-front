/**
 * [INPUT]: 依赖 framer-motion、lib/motion、components/Marquee
 * [OUTPUT]: 默认导出 LogoBar — 客户品牌 Marquee，建立信任锚点
 * [POS]: components/landing 序号 02，紧随 Hero
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { fadeInUp, defaultViewport } from "@/lib/motion";
import { Marquee } from "@/components/marquee";

// ============================================================================
// 品牌列 · 文字 placeholder · 真实接入时可替换为 SVG logo
// ============================================================================
const BRANDS = [
  "ByteSpace",
  "NovaCloud",
  "PixelMind",
  "OrbitAI",
  "KaizenLab",
  "PrismOS",
];

function LogoBar() {
  return (
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            他们都在使用火山 GEO 提升 AI 可见性
          </p>
          <Marquee
            duration={24}
            pauseOnHover
            fade
            fadeAmount={8}
            className="w-full"
          >
            {BRANDS.map((b) => (
              <span
                key={b}
                className="mx-8 inline-flex min-w-32 justify-center text-base font-semibold tracking-tight text-muted-foreground/70 transition-colors duration-200 hover:text-foreground"
              >
                {b}
              </span>
            ))}
          </Marquee>
        </motion.div>
      </div>
    </section>
  );
}

export default LogoBar;
