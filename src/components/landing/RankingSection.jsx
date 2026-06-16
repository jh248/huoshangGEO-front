/**
 * [INPUT]: 依赖 framer-motion、lucide-react、ui/Badge+Button+Card+Table、lib/motion
 * [OUTPUT]: 默认导出 RankingSection — 「火山全域GEO品牌诊断报告案例」: 榜单表 (品牌/提及率/次数/平均提及排名/情感/得分)
 * [POS]: components/landing，编排于 AccountabilitySection 之后，用真实感榜单演示监测能力；数据为前端 mock
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md；颜色仅用 token
 */
import { motion } from "framer-motion";
import { ChevronDown, CircleHelp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fadeInUp, defaultViewport } from "@/lib/motion";

// 行业榜单 mock · 汽车行业 · 全平台口径
const ROWS = [
  { brand: "比亚迪", rate: 67, count: 3220, avgRank: 4.0, score: 67 },
  { brand: "吉利", rate: 46, count: 1301, avgRank: 5.6, score: 51 },
  { brand: "丰田", rate: 44, count: 1190, avgRank: 5.9, score: 49 },
  { brand: "大众", rate: 37, count: 987, avgRank: 6.6, score: 44 },
  { brand: "本田", rate: 31, count: 782, avgRank: 7.2, score: 39 },
];

// 表头 · help 为 ? 提示位，sorted 为当前排序列
const COLUMNS = [
  { key: "brand", label: "品牌" },
  { key: "rate", label: "品牌提及率", help: true },
  { key: "count", label: "品牌提及次数", help: true },
  { key: "avgRank", label: "平均提及排名", help: true },
  { key: "sentiment", label: "正面/中性情感倾向", help: true },
  { key: "score", label: "品牌得分", help: true, sorted: true },
  { key: "action", label: "操作" },
];

// 品牌字符墩 · primary 派生
const BRAND_TILE_STYLE = {
  background:
    "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
  boxShadow:
    "0 2px 8px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
};

// 正向语义小签 · chart-4(绿) 派生
function PositiveTag({ children }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: "color-mix(in srgb, var(--chart-4) 22%, transparent)",
        color: "color-mix(in srgb, var(--chart-4) 45%, var(--foreground))",
      }}
    >
      {children}
    </span>
  );
}

function RankingSection() {
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
          品牌诊断报告
        </Badge>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          火山全域GEO品牌诊断报告案例
        </h2>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={defaultViewport}
        className="mt-10"
      >
        {/* 榜单表 */}
        <Card variant="raised" className="rounded-md py-0">
          <CardContent className="overflow-x-auto p-2 sm:p-4">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {COLUMNS.map((c) => (
                    <TableHead
                      key={c.key}
                      className="h-12 text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.help && (
                          <CircleHelp
                            className="size-3.5 opacity-60"
                            aria-label={`${c.label} 说明`}
                          />
                        )}
                        {c.label}
                        {c.sorted && (
                          <ChevronDown className="size-3 text-primary" />
                        )}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.brand} className="h-16">
                    <TableCell>
                      <span className="inline-flex items-center gap-2.5">
                        <span
                          className="flex size-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground"
                          style={BRAND_TILE_STYLE}
                        >
                          {r.brand.slice(0, 1)}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {r.brand}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-sm font-semibold tabular-nums text-foreground">
                      {r.rate}%
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-foreground">
                      {r.count}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm tabular-nums text-foreground">
                        {r.avgRank}
                        <PositiveTag>
                          {r.avgRank <= 7 ? "靠前" : "中等"}
                        </PositiveTag>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm tabular-nums text-foreground">
                        100%
                        <PositiveTag>非常正面</PositiveTag>
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold tabular-nums text-foreground">
                        {r.score}
                        <PositiveTag>豆包最佳</PositiveTag>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm" className="px-0">
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}

export default RankingSection;
