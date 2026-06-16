/**
 * [INPUT]: 依赖 framer-motion、layout/Header+landing/Footer、landing/AiSearchWorkspace、lib/motion
 * [OUTPUT]: 默认导出 BrandDiagnosisPage — 公开品牌诊断 / 实时搜索页面
 * [POS]: /brand-diagnosis 路由，承载首页拆出的诊断工作区
 * [PROTOCOL]: 页面仅做前端原型编排，按钮不提交；后续接口接入工作区组件
 */
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/landing/Footer";
import AiSearchWorkspace from "@/components/landing/AiSearchWorkspace";
import { pageTransition } from "@/lib/motion";

function BrandDiagnosisPage() {
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
        <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-14 sm:py-16">
          <AiSearchWorkspace />
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}

export default BrandDiagnosisPage;
