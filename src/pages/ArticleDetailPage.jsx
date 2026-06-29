/**
 * [INPUT]: 依赖 react-router-dom、framer-motion、layout/Header + landing/Footer、ui 原子件、lib/motion、lib/article-news
 * [OUTPUT]: 默认导出 ArticleDetailPage — 公开文章资讯详情页
 * [POS]: /article-consulting/:slug 路由，承接文章列表「阅读」跳转
 * [PROTOCOL]: 页面仅做前端原型编排，文章内容来自 lib/article-news mock 数据
 */
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  defaultViewport,
  pageTransition,
  staggerContainer,
  staggerItem,
} from "@/lib/motion";
import { getAdjacentArticles, getArticleBySlug } from "@/lib/article-news";

function ArticleDetailPage() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug);
  const { prev, next } = getAdjacentArticles(slug);

  if (!article) {
    return <Navigate to="/article-consulting" replace />;
  }

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
        <article className="px-4 pb-20 pt-28 sm:pt-32">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={staggerItem}>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/article-consulting">
                  <ArrowLeft />
                  返回文章资讯
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="skeu-raised mt-8 overflow-hidden rounded-3xl bg-card"
            >
              <img
                src={article.image}
                alt={article.title}
                className="aspect-[16/8] w-full object-cover"
              />
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Badge variant="secondary">{article.category}</Badge>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {article.date}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock3 className="size-4" />
                {article.readTime}
              </span>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              {article.title}
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground"
            >
              {article.summary}
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={defaultViewport}
              className="mx-auto mt-12 max-w-3xl space-y-6"
            >
              {article.paragraphs.map((paragraph) => (
                <motion.p
                  key={paragraph}
                  variants={staggerItem}
                  className="text-base leading-8 text-foreground/90"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>

            {(prev || next) && (
              <motion.nav
                variants={staggerItem}
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                aria-label="文章导航"
                className="mx-auto mt-16 grid max-w-3xl gap-4 border-t border-border pt-10 sm:grid-cols-2"
              >
                {prev ? (
                  <Link
                    to={`/article-consulting/${prev.slug}`}
                    className="skeu-raised skeu-interactive group flex items-center gap-4 rounded-2xl bg-card p-5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="skeu-knob flex size-9 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-transform duration-200 ease-out group-hover:-translate-x-0.5">
                      <ArrowLeft className="size-4" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-xs text-muted-foreground">上一篇</span>
                      <span className="line-clamp-2 text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                        {prev.title}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next ? (
                  <Link
                    to={`/article-consulting/${next.slug}`}
                    className="skeu-raised skeu-interactive group flex items-center justify-end gap-4 rounded-2xl bg-card p-5 text-right focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="flex min-w-0 flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">下一篇</span>
                      <span className="line-clamp-2 text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                        {next.title}
                      </span>
                    </span>
                    <span className="skeu-knob flex size-9 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5">
                      <ArrowRight className="size-4" />
                    </span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
              </motion.nav>
            )}
          </motion.div>
        </article>

      </main>
      <Footer />
    </motion.div>
  );
}

export default ArticleDetailPage;
