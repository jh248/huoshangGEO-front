/**
 * [INPUT]: 依赖 framer-motion、ui/Accordion、lib/motion
 * [OUTPUT]: 默认导出 FAQ — 六问 Accordion 列表，化解决策疑虑
 * [POS]: components/landing 序号 08，转化前的最后一程
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, defaultViewport } from "@/lib/motion";

// ============================================================================
// 六问 · 差异化 / 模型覆盖 / 时效 / ROI / 安全 / 学习门槛
// ============================================================================
const FAQ_ITEMS = [
  {
    q: "火山 GEO 与传统 SEO 工具的区别？",
    a: "SEO 工具围绕搜索结果排名，火山 GEO 围绕 AI 答案中的引用份额。我们关注 LLM 如何理解、引用、推荐你的品牌，而不是 SERP 关键词位置。",
  },
  {
    q: "支持哪些大模型？",
    a: "目前支持豆包、DeepSeek、Kimi、文心一言、通义千问、元宝，我们还在不断努力增加其他模型厂商。",
  },
  {
    q: "没达到效果如何退费？",
    a: "在服务期内要是没有到达指定的官网浏览量和线索数，我们会通过剩余积分退回费用。",
  },
  {
    q: "官网如何搭建？",
    a: "我们提供了模板和定制化两种形式，您可以根据不同套餐情况进行官网搭建，只需要配合提供公司或个人信息，我们会帮您购买域名和服务器。",
  },
  {
    q: "网页端和手机端数据会有差别吗？",
    a: "会的，经过我们的数据观察，网页端和手机端的数据会有差别，所以我们提供给用户两种选择，可以选择网页端也可以选择手机端的品牌诊断方式。",
  },
];

function FAQ() {
  return (
    <section className="border-y border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:py-32">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="text-center"
        >
          <Badge variant="secondary" className="mb-4">
            FAQ
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            常见问题
          </h2>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="mt-12 rounded-md bg-card p-2 skeu-raised"
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="px-4">
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQ;
