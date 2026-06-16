/**
 * [INPUT]: 依赖 ui 原子件 (Dialog/RadioGroup/Checkbox/Select/Input/Textarea/Label/Button/Progress)，lucide
 * [OUTPUT]: DocumentConfigDialog — 文档级「查看或调整配置」三步向导 (创建设置 / 分段预览 / 数据处理)
 *           defaultDocConfig / CHUNK_STRATEGY_LABEL — 供列表徽标与默认值复用
 * [POS]: knowledge/Bases.jsx 的 DocumentReader 消费，按文档单独配置解析 + 分段策略
 * [PROTOCOL]: 第一步 (创建设置) 已完整；分段预览消费当前文档 sections/segments；数据处理展示后台进度
 */
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  FileText,
  Info,
  Rows3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CHUNK_STRATEGY_LABEL,
  defaultDocConfig,
  SEGMENT_SEPARATORS,
} from "./_documentConfigShared";

const STEPS = ["创建设置", "分段预览", "数据处理"];

function InfoHint({ text }) {
  return (
    <span title={text} className="inline-flex cursor-help text-muted-foreground">
      <Info className="size-3.5" />
    </span>
  );
}

function Stepper({ step }) {
  return (
    <div className="flex items-center justify-center gap-4">
      {STEPS.map((label, index) => {
        const active = index === step;
        return (
          <div key={label} className="flex items-center gap-4">
            <div
              className="flex items-center gap-2"
              aria-current={active ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full text-xs font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <ArrowRight className="size-4 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ title, open, onToggle, children }) {
  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-left text-sm font-semibold"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
        {title}
      </button>
      {open && <div className="grid gap-3">{children}</div>}
    </div>
  );
}

function OptionCard({ selected, value, label, description, children }) {
  return (
    <Label
      htmlFor={`doc-cfg-${value}`}
      className={cn(
        "grid cursor-pointer gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/50",
        selected && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-start gap-3">
        <RadioGroupItem id={`doc-cfg-${value}`} value={value} className="mt-1" />
        <span className="grid gap-1">
          <span className="font-medium">{label}</span>
          <span className="text-xs leading-5 text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
      {selected && children}
    </Label>
  );
}

function CreateSettings({ config, setConfig }) {
  const [parseOpen, setParseOpen] = useState(true);
  const [chunkOpen, setChunkOpen] = useState(true);

  const update = (patch) => setConfig((cur) => ({ ...cur, ...patch }));
  const updateExtract = (key, checked) =>
    setConfig((cur) => ({
      ...cur,
      extract: { ...cur.extract, [key]: checked },
    }));
  const updateCustom = (key, value) =>
    setConfig((cur) => ({ ...cur, custom: { ...cur.custom, [key]: value } }));
  const updateHierarchical = (key, value) =>
    setConfig((cur) => ({
      ...cur,
      hierarchical: { ...cur.hierarchical, [key]: value },
    }));

  return (
    <div className="grid gap-6">
      <Section
        title="文档解析策略"
        open={parseOpen}
        onToggle={() => setParseOpen((v) => !v)}
      >
        <RadioGroup
          value={config.parseStrategy}
          onValueChange={(value) => update({ parseStrategy: value })}
          className="grid gap-3"
        >
          <OptionCard
            value="precise"
            selected={config.parseStrategy === "precise"}
            label="精准解析"
            description="将从文档中提取图片、表格等元素，需要耗费更长的时间"
          >
            <div className="grid gap-3 border-t border-border pt-3">
              <div className="grid gap-2">
                <span className="text-sm font-semibold">提取内容</span>
                {[
                  { key: "image", label: "图片元素", hint: "提取文档中的插图并保留引用" },
                  { key: "ocr", label: "扫描件（OCR）" },
                  { key: "table", label: "表格元素" },
                ].map(({ key, label, hint }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={config.extract[key]}
                      onCheckedChange={(checked) =>
                        updateExtract(key, !!checked)
                      }
                    />
                    {label}
                    {hint && <InfoHint text={hint} />}
                  </label>
                ))}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">内容过滤</span>
                  <span className="text-xs text-muted-foreground">
                    设置过滤内容
                  </span>
                </div>
                <Textarea
                  value={config.contentFilter}
                  onChange={(e) => update({ contentFilter: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="未设置任何过滤内容"
                  rows={3}
                />
              </div>
            </div>
          </OptionCard>
          <OptionCard
            value="fast"
            selected={config.parseStrategy === "fast"}
            label="快速解析"
            description="不会对文档提取图像、表格等元素，适用于纯文本"
          />
        </RadioGroup>
      </Section>

      <Section
        title="分段策略"
        open={chunkOpen}
        onToggle={() => setChunkOpen((v) => !v)}
      >
        <RadioGroup
          value={config.chunkStrategy}
          onValueChange={(value) => update({ chunkStrategy: value })}
          className="grid gap-3"
        >
          <OptionCard
            value="auto"
            selected={config.chunkStrategy === "auto"}
            label="自动分段与清洗"
            description="自动分段与预处理规则"
          />
          <OptionCard
            value="custom"
            selected={config.chunkStrategy === "custom"}
            label="自定义"
            description="自定义分段规则、分段长度及预处理规则"
          >
            <div
              className="grid gap-4 border-t border-border pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-2">
                <Label>
                  分段标识符<span className="ml-1 text-destructive">*</span>
                </Label>
                <Select
                  value={config.custom.separator}
                  onValueChange={(value) => updateCustom("separator", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEGMENT_SEPARATORS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>
                  分段最大长度<span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={config.custom.maxLength}
                  onChange={(e) =>
                    updateCustom("maxLength", Number(e.target.value))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  分段重叠度%<span className="ml-1 text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={config.custom.overlap}
                  onChange={(e) =>
                    updateCustom("overlap", Number(e.target.value))
                  }
                />
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-semibold">文本预处理规则</span>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={config.custom.normalizeWhitespace}
                    onCheckedChange={(checked) =>
                      updateCustom("normalizeWhitespace", !!checked)
                    }
                  />
                  替换掉连续的空格、换行符和制表符
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={config.custom.stripUrls}
                    onCheckedChange={(checked) =>
                      updateCustom("stripUrls", !!checked)
                    }
                  />
                  删除所有 URL 和电子邮箱地址
                </label>
              </div>
            </div>
          </OptionCard>
          <OptionCard
            value="hierarchical"
            selected={config.chunkStrategy === "hierarchical"}
            label="按层级分段"
            description="按照文档层级结构分段，将文档转化为有层级信息的树结构"
          >
            <div
              className="grid gap-4 border-t border-border pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid gap-2">
                <Label className="flex items-center gap-1.5">
                  分段层级<span className="text-destructive">*</span>
                  <InfoHint text="控制文档树的最大层级深度" />
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={config.hierarchical.levels}
                  onChange={(e) =>
                    updateHierarchical("levels", Number(e.target.value))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={config.hierarchical.keepHierarchy}
                  onCheckedChange={(checked) =>
                    updateHierarchical("keepHierarchy", !!checked)
                  }
                />
                检索切片保留层级信息
                <InfoHint text="命中子块时一并返回其所属的标题层级路径" />
              </label>
            </div>
          </OptionCard>
        </RadioGroup>
      </Section>
    </div>
  );
}

function buildSourceMarkdown(doc) {
  if (!doc?.sections?.length) return "暂无原始文档内容。";

  return [
    `# ${doc.name}`,
    ...doc.sections.map((section) => `## ${section.title}\n\n${section.body}`),
  ].join("\n\n");
}

function flattenSegmentLines(items, depth = 0) {
  return items.flatMap((item) => {
    if (typeof item === "string") return [`${"  ".repeat(depth)}- ${item}`];

    return [
      `${"  ".repeat(depth)}- ${item.title}`,
      ...flattenSegmentLines(item.children ?? [], depth + 1),
    ];
  });
}

function SegmentPreview({ doc, config }) {
  const sourceMarkdown = buildSourceMarkdown(doc);
  const segmentText = doc?.segments?.length
    ? flattenSegmentLines(doc.segments).join("\n")
    : "暂无分段内容。";
  const strategy = CHUNK_STRATEGY_LABEL[config.chunkStrategy];
  const maxLength =
    config.chunkStrategy === "custom"
      ? `${config.custom.maxLength} 字`
      : "自动";

  return (
    <div className="grid overflow-hidden rounded-md border border-border bg-card lg:grid-cols-2">
      <section className="grid min-h-0 border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="text-base font-semibold">原始文档预览</h3>
          </div>
          <Badge variant="outline">{doc?.type ?? "文档"}</Badge>
        </div>
        <pre className="max-h-[46svh] overflow-auto bg-background p-4 text-sm leading-7 whitespace-pre-wrap break-words text-foreground">
          {sourceMarkdown}
        </pre>
      </section>

      <section className="grid min-h-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Rows3 className="size-4 text-primary" />
            <h3 className="text-base font-semibold">分段预览</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline">{strategy}</Badge>
            <Badge variant="outline">{doc?.segments?.length ?? 0} 段</Badge>
            <Badge variant="outline">上限 {maxLength}</Badge>
          </div>
        </div>
        <div className="max-h-[46svh] overflow-auto bg-muted/30 p-4">
          <pre className="rounded-md border border-border bg-card p-4 text-sm leading-7 whitespace-pre-wrap break-words text-foreground">
            {segmentText}
          </pre>
        </div>
      </section>
    </div>
  );
}

function DataProcessing({ doc, config }) {
  const [progress, setProgress] = useState(18);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value;
        return Math.min(92, value + 7);
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="grid gap-4 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="text-base font-semibold">数据处理</h3>
          <p className="text-sm leading-6 text-muted-foreground">
            任务已进入后台处理，关闭弹窗后会继续执行。
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{doc?.name ?? "当前文档"}</Badge>
          <Badge variant="outline">
            {CHUNK_STRATEGY_LABEL[config.chunkStrategy]}
          </Badge>
        </div>
      </div>

      <div className="grid gap-2 rounded-md bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">处理进度</span>
          <span className="text-sm font-semibold tabular-nums">
            {progress}%
          </span>
        </div>
        <Progress value={progress} />
      </div>
    </div>
  );
}

export function DocumentConfigDialog({ open, onOpenChange, doc, onApply }) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState(() => doc?.config ?? defaultDocConfig());

  const handleApply = () => {
    onApply?.(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>查看或调整配置</DialogTitle>
        </DialogHeader>

        <div className="grid min-h-0 gap-5">
          <Stepper step={step} />

          <div className="max-h-[60svh] min-h-0 overflow-auto pr-1">
            {step === 0 && (
              <CreateSettings config={config} setConfig={setConfig} />
            )}
            {step === 1 && <SegmentPreview doc={doc} config={config} />}
            {step === 2 && <DataProcessing doc={doc} config={config} />}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:flex-row sm:justify-between">
          {step === STEPS.length - 1 ? (
            <span />
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
          )}
          <div className="flex gap-2">
            {step > 0 && step < STEPS.length - 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((s) => s - 1)}
              >
                上一步
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)}>
                下一步
              </Button>
            ) : (
              <Button type="button" onClick={handleApply}>
                关闭
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
