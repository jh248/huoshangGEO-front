/**
 * [INPUT]: 依赖 react state、lucide-react、ui/Dialog+Input+Textarea+Badge+Button+Collapsible、lib/utils cn
 * [OUTPUT]: 默认导出 BrandDiagnosisDialog — 品牌诊断大弹框 (头部积分余额胶囊 + 品牌设置 + AI 问题推荐 + 消耗积分提示 + 开始搜索)
 *           受控 props: { open, onOpenChange, defaultBrand }；品牌词/核心词行支持增删与展开
 * [POS]: components/landing 共享子件，被 Hero 与 AiSearchWorkspace 双入口消费
 * [PROTOCOL]: 前端原型 — 复制/重新生成/开始搜索为后端接口预留挂载点；颜色仅用 token，禁止 hex
 */
import { useState } from "react";
import { ChevronRight, CircleHelp, Coins, Copy, Plus, RefreshCw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CreditsPurchaseDialog from "@/components/landing/CreditsPurchaseDialog";
import { cn } from "@/lib/utils";

// 品牌词上限 · 与计数器 n/20 对应
const MAX_BRAND_WORDS = 20;

// 积分 mock · 余额与单次诊断消耗 (后端接入后替换)
const CREDIT_BALANCE = 17.8;
const CREDIT_COST = 51;

// 演示用品牌资料 · 输入为空时兜底展示 (对齐参考截图的小米示例)
const DEMO = {
  brand: "小米手机",
  site: "https://www.mi.com",
  intro:
    "小米手机隶属于消费电子及智能制造行业，是小米科技有限责任公司旗下的核心智能手机产品线。产品覆盖从入门到高端旗舰的全价位段，搭载小米澎湃OS 操作系统，部分机型联合徕卡研发影像系统，致力于构建“人车家全生态”。品牌定位面向全球大众及科技爱好者，秉持“感动人心、价格厚道”的理念，主打极致用户体验与高性价比。",
  words: ["小米", "小米手机", "小米澎湃OS"],
};

// AI 问题推荐 · 核心词 + 推荐问题 (mock，后端生成后替换)
const DEFAULT_TOPICS = [
  { word: "智能手机", questions: ["2026 年智能手机怎么选，哪个品牌综合体验最好？"] },
  { word: "旗舰手机", questions: ["国产旗舰手机推荐哪一款，拍照和性能都要强？"] },
  { word: "高性价比手机", questions: ["3000 元以内高性价比手机有哪些值得买？"] },
  { word: "AIoT 生态手机", questions: ["哪家手机的智能家居生态联动做得最好？"] },
  { word: "徕卡影像手机", questions: ["徕卡影像的手机值不值得买，成像风格如何？"] },
];

// 区块标题行 · 标题 + 说明 + 右侧动作位
function SectionHeader({ title, desc, children }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="flex-1 text-xs text-muted-foreground">{desc}</p>
      {children}
    </div>
  );
}

function BrandDiagnosisDialog({ open, onOpenChange, defaultBrand = "" }) {
  const [brand, setBrand] = useState(defaultBrand);
  const [site, setSite] = useState("");
  const [intro, setIntro] = useState("");
  const [words, setWords] = useState(DEMO.words);
  const [topics, setTopics] = useState(DEFAULT_TOPICS);
  const [buyOpen, setBuyOpen] = useState(false);

  // 每次打开重置为入口预填 (空则用演示资料) · 渲染期对齐 open 变化，避免 effect 级联渲染
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      const seed = defaultBrand.trim();
      setBrand(seed || DEMO.brand);
      setSite(seed ? "" : DEMO.site);
      setIntro(seed ? "" : DEMO.intro);
      setWords(seed ? [seed] : DEMO.words);
      setTopics(DEFAULT_TOPICS);
    }
  }

  const questionTotal = topics.reduce((n, t) => n + t.questions.length, 0);

  const handleStart = (e) => {
    e.preventDefault();
    // 前端原型：开始搜索为后端接口预留挂载点
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl">
        <DialogHeader className="relative border-b border-border px-6 py-4">
          <DialogTitle className="text-center text-lg font-semibold text-foreground">
            品牌诊断
          </DialogTitle>
          {/* 积分余额胶囊 · 紧贴关闭按钮左侧 */}
          <div className="absolute right-12 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-full bg-card py-1 pl-3 pr-1 skeu-raised sm:flex">
            <Coins className="size-4 text-primary" />
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {CREDIT_BALANCE}
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-6 px-2"
              onClick={() => setBuyOpen(true)}
            >
              购买
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleStart} className="flex min-h-0 flex-1 flex-col">
          {/* 中部滚动区 · 头尾固定 */}
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-6 py-6">
          {/* ====== 品牌设置 ====== */}
          <section className="flex flex-col gap-4 rounded-md border border-primary/40 bg-card p-4 skeu-raised sm:p-5">
            <SectionHeader
              title="品牌设置"
              desc="GEO 基础词库，品牌词即是结果，又是“权威信源”的构成一部分，多以公司名称、品牌名称为准"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="diag-brand"
                  className="w-16 shrink-0 justify-end text-sm text-foreground"
                >
                  品牌名称
                </Label>
                <Input
                  id="diag-brand"
                  name="brand"
                  spellCheck={false}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="如：小米手机…"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="diag-site"
                  className="w-16 shrink-0 justify-end text-sm text-foreground"
                >
                  官网地址
                </Label>
                <Input
                  id="diag-site"
                  name="site"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  spellCheck={false}
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Label
                htmlFor="diag-intro"
                className="mt-2 w-16 shrink-0 justify-end text-sm text-foreground"
              >
                品牌介绍
              </Label>
              <Textarea
                id="diag-intro"
                name="intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="一句话介绍品牌所属行业、产品线与定位…"
                className="min-h-24"
              />
            </div>
            <div className="flex items-center gap-3">
              <Label className="w-16 shrink-0 justify-end text-sm text-foreground">
                品牌词
              </Label>
              <div className="flex min-h-10 flex-1 flex-wrap items-center gap-2 rounded-md px-3 py-2 skeu-inset">
                {words.map((w) => (
                  <Badge key={w} variant="secondary" className="h-6 gap-1 rounded-xl pr-1.5">
                    {w}
                    <button
                      type="button"
                      aria-label={`移除品牌词 ${w}`}
                      onClick={() => setWords(words.filter((x) => x !== w))}
                      className="rounded-full p-0.5 text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                <Button type="button" variant="outline" size="sm" leftIcon={<Plus />}>
                  新增品牌词
                </Button>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {words.length}/{MAX_BRAND_WORDS}
                </span>
                <Button type="button" variant="ghost" size="sm" leftIcon={<RefreshCw />}>
                  重新生成
                </Button>
                <Button type="button" variant="ghost" size="sm" leftIcon={<Copy />}>
                  复制
                </Button>
              </div>
            </div>
          </section>

          {/* ====== AI 问题推荐 ====== */}
          <section className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 skeu-raised sm:p-5">
            <SectionHeader
              title="AI 问题推荐"
              desc="向 AI 咨询的问题，根据品牌信息与品牌词，结合用户搜索习惯生成"
            >
              <Button type="button" variant="ghost" size="sm" leftIcon={<Copy />}>
                全部复制
              </Button>
              <Button type="button" variant="outline" size="sm" leftIcon={<Plus />}>
                添加核心词
              </Button>
              <Button type="button" size="sm" leftIcon={<RefreshCw />}>
                重新生成
              </Button>
            </SectionHeader>

            {/* 表头 */}
            <div className="grid grid-cols-[2rem_2.5rem_1fr_10rem] items-center gap-2 border-b border-border pb-2 pl-1 text-xs font-medium text-muted-foreground sm:grid-cols-[2rem_2.5rem_1fr_1fr_10rem]">
              <span />
              <span>序号</span>
              <span>核心词</span>
              <span className="hidden sm:block">AI 问题 ({questionTotal}/50)</span>
              <span className="text-right">操作</span>
            </div>

            <div className="divide-y divide-border">
              {topics.map((t, i) => (
                <Collapsible key={t.word}>
                  <div className="grid grid-cols-[2rem_2.5rem_1fr_10rem] items-center gap-2 py-2.5 pl-1 sm:grid-cols-[2rem_2.5rem_1fr_1fr_10rem]">
                    <CollapsibleTrigger
                      className={cn(
                        "group flex size-7 items-center justify-center rounded-md text-muted-foreground",
                        "transition-colors duration-200 hover:bg-muted hover:text-foreground"
                      )}
                      aria-label={`展开 ${t.word} 的问题`}
                    >
                      <ChevronRight className="size-4 transition-transform duration-200 group-data-open:rotate-90" />
                    </CollapsibleTrigger>
                    <span className="text-sm text-muted-foreground">{i + 1}</span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {t.word}
                    </span>
                    <span className="hidden text-sm text-muted-foreground sm:block">
                      共计{t.questions.length}个问题
                    </span>
                    <span className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm">
                        复制
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        编辑
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setTopics(topics.filter((x) => x.word !== t.word))}
                      >
                        删除
                      </Button>
                    </span>
                  </div>
                  <CollapsibleContent>
                    <ul className="mb-2.5 ml-9 flex flex-col gap-1.5 rounded-md bg-muted/40 px-4 py-3">
                      {t.questions.map((q) => (
                        <li key={q} className="text-sm text-muted-foreground">
                          {q}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </section>

          </div>

          {/* ====== 固定底栏 · 消耗积分 + 开始搜索 ====== */}
          <div className="flex shrink-0 flex-col items-center gap-2 border-t border-border px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                <Coins className="size-4 text-primary" />
                <span className="font-semibold tabular-nums">{CREDIT_COST}</span>
                <span className="text-muted-foreground">积分 / 次</span>
                <CircleHelp
                  className="size-3.5 text-muted-foreground/70"
                  aria-label="积分消耗说明"
                />
              </span>
              <Button type="submit" size="lg" className="px-10">
                开始诊断
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              本次诊断将消耗 {CREDIT_COST} 积分，当前余额 {CREDIT_BALANCE}{" "}
              积分；诊断计算时间较长，请耐心等待
            </p>
          </div>
        </form>
      </DialogContent>

      {/* 充值积分弹窗 · 头部「购买」唤起 */}
      <CreditsPurchaseDialog
        open={buyOpen}
        onOpenChange={setBuyOpen}
        balance={CREDIT_BALANCE}
      />
    </Dialog>
  );
}

export default BrandDiagnosisDialog;
