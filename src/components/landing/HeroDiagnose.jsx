/**
 * [INPUT]: 依赖 react state、react-router-dom、framer-motion、lucide-react、ui/Card+Input+Button+Badge、ui/NumberTicker、lib/motion
 * [OUTPUT]: 默认导出 HeroDiagnose — 首屏右侧速测件 (输品牌名 → 秒出 AI 提及率 mock 结果)
 * [POS]: components/landing，被 Hero 右栏单点消费，预演"看得见"这件事
 * [PROTOCOL]: 前端原型 — 提交后展示 mock 结果，真实接口由后端替换 onSubmit 逻辑；不触发跳转
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NumberTicker } from "@/components/ui/number-ticker";
import { springs } from "@/lib/motion";

// mock 结果 · 真实接入时由后端返回；此处仅为首屏"看得见"的即时预演
const MOCK_ENGINES = [
  { name: "豆包", mentioned: true },
  { name: "DeepSeek", mentioned: false },
  { name: "元宝", mentioned: true },
  { name: "Kimi", mentioned: false },
  { name: "通义", mentioned: false },
];

function HeroDiagnose() {
  const [brand, setBrand] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (brand.trim()) setSubmitted(true);
  };

  const mentionedCount = MOCK_ENGINES.filter((m) => m.mentioned).length;

  return (
    <Card variant="raised" className="rounded-3xl">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex size-11 items-center justify-center rounded-2xl text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 85%, black) 50%, color-mix(in srgb, var(--primary) 70%, black) 100%)",
              boxShadow:
                "0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)",
            }}
          >
            <Bot className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI 可见度速测
            </p>
            <p className="text-xs text-muted-foreground">
              输品牌名，秒出 AI 提及率
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            aria-label="品牌名称"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="输入品牌名，如：火山 GEO"
            className="h-11 flex-1"
          />
          <Button type="submit" size="lg">
            检测
          </Button>
        </form>

        {!submitted ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              覆盖 5 大主流引擎，实时返回提及与排名
            </p>
            <div className="flex flex-wrap gap-2">
              {MOCK_ENGINES.map((m) => (
                <Badge
                  key={m.name}
                  variant="outline"
                  className="h-6 rounded-xl text-muted-foreground"
                >
                  {m.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: springs.gentle }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-end justify-between rounded-md bg-muted/50 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">AI 提及率</p>
                <p className="text-3xl font-semibold tracking-tight text-primary">
                  <NumberTicker value={40} className="text-primary" />%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">行业排名</p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  #7
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_ENGINES.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">
                    {m.name}
                  </span>
                  {m.mentioned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                      <Check className="size-3.5" /> 已提及
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <X className="size-3.5" /> 未出现
                    </span>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{brand}</span> 在 5
              个引擎中被提及 {mentionedCount} 次 — 还有 {5 - mentionedCount}{" "}
              个引擎看不见你
            </p>

            <Button variant="outline" className="w-full" asChild>
              <Link to="/brand-diagnosis">
                查看完整诊断报告
                <ArrowRight />
              </Link>
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default HeroDiagnose;
