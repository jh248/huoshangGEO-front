/**
 * [INPUT]: 依赖 react、react-router-dom、framer-motion、layout/Header + landing/Footer、ui 原子件、lib/motion、lib/article-news
 * [OUTPUT]: 默认导出 ArticleConsultingPage — 公开文章资讯列表页 (搜索 + 分类筛选 + 文章卡片)
 * [POS]: /article-consulting 路由，承接顶部导航「文章资讯」
 * [PROTOCOL]: 页面仅做前端原型编排，文章数据为 mock；后续接口接入时替换 ARTICLES
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import articleConsultingBanner from "@/assets/article/article-consulting-banner.jpg";
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
import { ARTICLES, CATEGORIES } from "@/lib/article-news";

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
        <section className="relative overflow-hidden px-4 pb-6 pt-24 sm:pb-8 sm:pt-24">
          <motion.div
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            className="skeu-raised relative mx-auto flex min-h-44 max-w-6xl items-center overflow-hidden rounded-3xl sm:min-h-52 lg:aspect-[1920/340] lg:min-h-0"
          >
            <img
              src={articleConsultingBanner}
              alt="文章资讯内容库"
              className="absolute inset-0 size-full object-cover object-left lg:object-cover"
            />
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="relative max-w-2xl px-6 py-7 sm:px-10 lg:px-14 lg:py-0"
            >
              <motion.h1
                variants={staggerItem}
                className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
              >
                看懂 AI 搜索里的品牌增长
              </motion.h1>
              <motion.p
                variants={staggerItem}
                className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                盈匠火山 GEO 的一线实战洞察，汇集生成式引擎优化方法、品牌 AI 可见度诊断与内容策略，帮你的品牌进入 AI 的答案。
              </motion.p>
            </motion.div>
          </motion.div>
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
                      <Link
                        to={`/article-consulting/${article.slug}`}
                        aria-label={`阅读文章：${article.title}`}
                        className="block h-full rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                      <Card className="h-full cursor-pointer">
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
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                            阅读
                            <ArrowRight />
                          </span>
                        </CardFooter>
                      </Card>
                      </Link>
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
