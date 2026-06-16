/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Card+Badge+Button、lib/motion、landing/MediaPlaceholder
 * [OUTPUT]: 默认导出 ContentHubSection — 第九屏「内容/知识中心」: GEO 白皮书 + 行业观点入口
 * [POS]: components/landing 序号 09，建立专业权威，是长期获客的复利
 * [PROTOCOL]: ARTICLES 为占位，接入真实文章后替换标题与链接
 */
import { motion } from "framer-motion";
import { ArrowRight, BookText, Download, Newspaper } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, defaultViewport, springs } from "@/lib/motion";
import MediaPlaceholder from "@/components/landing/MediaPlaceholder";

// 行业观点 · 占位文章，接入后替换
const ARTICLES = [
  { tag: "方法论", title: "GEO 与 SEO 的根本区别：从关键词到语义片段" },
  { tag: "实战", title: "如何让你的内容被大模型识别为权威引用源" },
  { tag: "趋势", title: "AI 搜索时代，B 端品牌的可见度争夺战" },
];

function ContentHubSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mx-auto max-w-2xl text-center"
      >
        <Badge variant="secondary" className="mb-4">
          内容 / 知识中心
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          关于 GEO，我们把方法论写出来
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          GEO 白皮书与行业观点，既是专业权威的证明，也是长期获客的复利。
        </p>
      </motion.div>

      <div className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* 白皮书主入口 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
        >
          <Card variant="raised" className="h-full rounded-3xl skeu-interactive">
            <CardHeader>
              <span
                className="mb-4 inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground"
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
                  boxShadow:
                    "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
                }}
              >
                <BookText className="size-5" />
              </span>
              <CardTitle className="text-xl">《生成式引擎优化白皮书》</CardTitle>
              <CardDescription>
                系统拆解 GEO 的原理、方法与落地路径
                <br />
                从可见度诊断到知识库工程，一份说清楚。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaPlaceholder
                icon={BookText}
                label="白皮书封面 / 内页示意图"
                ratio="aspect-[16/9]"
              />
            </CardContent>
            <CardFooter>
              <Button size="lg">
                <Download />
                免费下载白皮书
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* 行业观点列表 */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="flex flex-col gap-4"
        >
          {ARTICLES.map((a) => (
            <motion.div
              key={a.title}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: springs.snappy }}
            >
              <Card variant="raised" className="skeu-interactive">
                <CardContent className="flex items-center gap-4 py-2">
                  <span
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
                      boxShadow:
                        "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <Newspaper className="size-5" />
                  </span>
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-1.5 h-5 rounded-xl text-[10px]">
                      {a.tag}
                    </Badge>
                    <p className="text-sm font-medium leading-snug text-foreground">
                      {a.title}
                    </p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default ContentHubSection;
