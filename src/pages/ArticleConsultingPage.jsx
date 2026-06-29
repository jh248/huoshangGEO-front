/**
 * [INPUT]: 依赖 react、framer-motion、layout/Header + landing/Footer、ui 原子件、lib/motion
 * [OUTPUT]: 默认导出 ArticleConsultingPage — 公开文章资讯列表页 (搜索 + 分类筛选 + 文章卡片)
 * [POS]: /article-consulting 路由，承接顶部导航「文章资讯」
 * [PROTOCOL]: 页面仅做前端原型编排，文章数据为 mock；后续接口接入时替换 ARTICLES
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Search,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  defaultViewport,
  hoverLift,
  pageTransition,
  staggerContainer,
  staggerItem,
  tapScale,
} from "@/lib/motion";

const CATEGORIES = ["全部", "GEO 入门", "品牌诊断", "内容策略", "案例拆解"];

const ARTICLES = [
  {
    title: "AI 搜索时代，品牌内容为什么要重写一遍",
    summary:
      "从关键词排名转向答案占位，品牌需要把产品信息整理成 AI 更容易引用的结构。",
    category: "GEO 入门",
    date: "2026-06-18",
    readTime: "6 分钟",
    image: "https://picsum.photos/seed/geo-search-content/960/640",
  },
  {
    title: "一次品牌诊断报告里，最该先看哪三个指标",
    summary:
      "提及率、引用来源和情感倾向共同决定品牌在生成式回答里的真实位置。",
    category: "品牌诊断",
    date: "2026-06-14",
    readTime: "5 分钟",
    image: "https://picsum.photos/seed/brand-diagnosis-report/960/640",
  },
  {
    title: "让 AI 引用你的官网，而不是引用二手信息",
    summary:
      "官网内容需要承担权威信息源角色，帮助模型找到稳定、可信、可复核的品牌答案。",
    category: "内容策略",
    date: "2026-06-11",
    readTime: "7 分钟",
    image: "https://picsum.photos/seed/official-brand-source/960/640",
  },
  {
    title: "从 0 次提及开始，如何规划第一批场景问题",
    summary:
      "场景问题不是简单问答清单，而是用户意图、业务优势和模型语料的交汇点。",
    category: "内容策略",
    date: "2026-06-07",
    readTime: "8 分钟",
    image: "https://picsum.photos/seed/scenario-prompts-plan/960/640",
  },
  {
    title: "竞品已经被 AI 推荐时，你还能做什么",
    summary:
      "先找出竞品被推荐的理由，再用可验证内容补齐模型回答中的品牌缺口。",
    category: "案例拆解",
    date: "2026-06-03",
    readTime: "6 分钟",
    image: "https://picsum.photos/seed/competitor-ai-recommendation/960/640",
  },
  {
    title: "GEO 内容不是多发文章，而是建立答案资产",
    summary:
      "把分散内容沉淀成可持续复用的答案资产，才能稳定提升生成式搜索可见性。",
    category: "GEO 入门",
    date: "2026-05-29",
    readTime: "4 分钟",
    image: "https://picsum.photos/seed/answer-assets-library/960/640",
  },
];

function ArticleConsultingPage() {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [query, setQuery] = useState("");

  const filteredArticles = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return ARTICLES.filter((article) => {
      const matchesCategory =
        activeCategory === "全部" || article.category === activeCategory;
      const matchesKeyword =
        !keyword ||
        [article.title, article.summary, article.category]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [activeCategory, query]);

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
        <section className="relative overflow-hidden px-4 pb-12 pt-28 sm:pb-16 sm:pt-32">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="max-w-3xl"
            >
              <motion.div variants={staggerItem}>
                <Badge variant="secondary" className="mb-5">
                  文章资讯
                </Badge>
              </motion.div>
              <motion.h1
                variants={staggerItem}
                className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
              >
                看懂 AI 搜索里的品牌增长
              </motion.h1>
              <motion.p
                variants={staggerItem}
                className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                汇总 GEO 方法、品牌诊断和内容策略，帮助团队把文章变成可被 AI 引用的答案资产。
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              initial="hidden"
              animate="visible"
              className="skeu-raised overflow-hidden rounded-3xl bg-card"
            >
              <img
                src="https://picsum.photos/seed/geo-editorial-library/1120/840"
                alt="文章资讯内容库"
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        <section id="article-list" className="px-4 pb-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="flex flex-col gap-4 border-y border-border py-5 md:flex-row md:items-center md:justify-between"
            >
              <motion.div variants={staggerItem} className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </motion.div>

              <motion.div variants={staggerItem} className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索文章标题或主题"
                  className="pl-9"
                  aria-label="搜索文章"
                />
              </motion.div>
            </motion.div>

            {filteredArticles.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredArticles.map((article) => (
                  <motion.article
                    key={article.title}
                    variants={staggerItem}
                    initial="rest"
                    whileHover="hover"
                    whileTap={tapScale}
                  >
                    <motion.div variants={hoverLift} className="h-full">
                      <Card className="h-full">
                        <div className="px-5 pt-5">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="aspect-[16/10] w-full rounded-md object-cover"
                            loading="lazy"
                          />
                        </div>
                        <CardHeader>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <Badge variant="outline">{article.category}</Badge>
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock3 className="size-3" />
                              {article.readTime}
                            </span>
                          </div>
                          <CardTitle className="text-lg">
                            {article.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                            {article.summary}
                          </p>
                        </CardContent>
                        <CardFooter className="mt-auto justify-between border-t border-border pt-4">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="size-3" />
                            {article.date}
                          </span>
                          <Button variant="ghost" size="sm">
                            阅读
                            <ArrowRight />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  </motion.article>
                ))}
              </motion.div>
            ) : (
              <Card className="mt-8 items-center p-8 text-center" variant="flat">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
                  <FileText className="size-5" />
                </div>
                <CardTitle>暂无匹配文章</CardTitle>
                <CardContent className="max-w-md px-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    换一个关键词或分类，稍后这里会接入更多 GEO 内容咨询文章。
                  </p>
                </CardContent>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveCategory("全部");
                    setQuery("");
                  }}
                >
                  清空筛选
                </Button>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
}

export default ArticleConsultingPage;
