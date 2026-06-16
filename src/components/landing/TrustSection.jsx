/**
 * [INPUT]: 依赖 framer-motion、components/Marquee、lib/motion
 * [OUTPUT]: 默认导出 TrustSection — 第八屏「信任背书」: 真实客户名称 Marquee
 * [POS]: components/landing 序号 08，尽调客户在此找"还有谁信了它"，宁可少而真
 * [PROTOCOL]: CUSTOMERS 为真实客户，名称如有出入直接改此常量；具名客户不编造证言
 */
import { motion } from "framer-motion";
import { Marquee } from "@/components/marquee";
import { fadeInUp, defaultViewport } from "@/lib/motion";

// 真实客户 · 名称横列
const CUSTOMERS = ["西屋大路灯", "澄心优租", "西屋个护"];

function TrustSection() {
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
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            已经有人，先一步被 AI 推荐
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            覆盖电商、租赁、律师等行业，客户已正式运营，被 AI 持续提及。
          </p>
        </motion.div>

        {/* 客户名称横列 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-12"
        >
          <Marquee duration={24} pauseOnHover fade fadeAmount={8} className="w-full">
            {CUSTOMERS.map((name) => (
              <span
                key={name}
                className="mx-8 inline-flex min-w-32 justify-center text-base font-semibold tracking-tight text-muted-foreground/70 transition-colors duration-200 hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </motion.div>
      </div>
    </section>
  );
}

export default TrustSection;
