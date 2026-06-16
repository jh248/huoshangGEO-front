/**
 * [INPUT]: 依赖 framer-motion 的 motion、@/lib/motion 的 pageTransition、layout/Header + landing/ 九屏 Section + Footer
 * [OUTPUT]: 默认导出 LandingPage — 注册到 / 路由 (无 Layout 包裹，自带 chrome)
 *           顶层 motion.div 承载 pageTransition variants，与 App.jsx 的 AnimatePresence 配对
 * [POS]: pages 序号 01，访客第一落点，按"承诺 → 逐屏兑现"编排九屏 + 终极 CTA + Footer
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";
import Header from "@/components/layout/Header";
import Hero from "@/components/landing/Hero";
import CompanySection from "@/components/landing/CompanySection";
import RankingSection from "@/components/landing/RankingSection";
import BrandSiteSection from "@/components/landing/BrandSiteSection";
import EngineLoopSection from "@/components/landing/EngineLoopSection";
import AccountabilitySection from "@/components/landing/AccountabilitySection";
import CasesShowSection from "@/components/landing/CasesShowSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

function LandingPage() {
  return (
    <motion.div
      className="flex min-h-screen flex-col bg-background text-foreground"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header transparent />
      <main className="flex-1">
        {/* 01 抛出承诺 + 当场预演"看得见" */}
        <Hero />
        {/* 01.5 公司实力背书 · 盈匠数科 / 恒丰汇金 / 爱客宝 */}
        <CompanySection />
        {/* 02 兑现 对结果负责 */}
        <AccountabilitySection />
        {/* 03 品牌诊断报告 · GEO 火山全域GEO品牌诊断报告案例 */}
        <RankingSection />
        {/* 04 兑现 品牌官网 · 权威信息源 */}
        <BrandSiteSection />
        {/* 04 兑现 增长引擎 */}
        <EngineLoopSection />
        {/* 05 区别对手 */}
        <ComparisonSection />
        {/* 05.5 合作案例展示 */}
        <CasesShowSection />
        {/* 06 常见问题 · 转化前清障 */}
        <FAQ />
        {/* 底部 终极 CTA */}
        <FinalCTA />
      </main>
      <Footer />
    </motion.div>
  );
}

export default LandingPage;
