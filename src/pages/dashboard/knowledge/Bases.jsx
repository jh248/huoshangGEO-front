/**
 * [INPUT]: 依赖 React state/memo，ui 原子组件，lucide，useAuth + canAction
 * [OUTPUT]: 默认导出 KnowledgeBases — WeKnora 参考流程的知识库管理页
 * [POS]: /dashboard/knowledge/bases 路由
 * [PROTOCOL]: mock 数据集中在模块顶部；接真后端时替换 INITIAL_BASES / INITIAL_DOCUMENTS / 提交逻辑
 */
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Database,
  FileEdit,
  FilePlus2,
  FileText,
  FolderPlus,
  FolderUp,
  Globe2,
  HelpCircle,
  Image,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { canAction } from "@/lib/mock-rbac";
import { cn } from "@/lib/utils";
import { PageShell } from "../_PageShell";
import { DocumentConfigDialog } from "./_documentConfig";
import {
  CHUNK_STRATEGY_LABEL,
  defaultDocConfig,
} from "./_documentConfigShared";

const TYPE_OPTIONS = [
  {
    value: "document",
    label: "文档",
    description: "适合产品手册、官网资料、政策说明等非结构化文档。",
    Icon: FileText,
  },
  {
    value: "qa",
    label: "FAQ",
    description: "适合标准问答、客服话术、销售答疑等结构化问答。",
    Icon: HelpCircle,
  },
  {
    value: "image",
    label: "图片",
    description: "适合图片素材、截图说明、OCR 识别和以图搜图。",
    Icon: Image,
  },
];

const ADD_CONTENT_OPTIONS = [
  {
    id: "upload",
    label: "上传文档",
    description: "PDF、Word、Markdown、TXT 等文件",
    Icon: Upload,
  },
  {
    id: "folder",
    label: "上传文件夹",
    description: "按目录批量导入并保留层级",
    Icon: FolderUp,
  },
  {
    id: "url",
    label: "导入 URL",
    description: "抓取网页内容并生成知识文档",
    Icon: Globe2,
  },
  {
    id: "editor",
    label: "在线编辑",
    description: "手动创建 Markdown 文档",
    Icon: FileEdit,
  },
];

const INITIAL_BASES = [
  {
    id: "kb-product",
    name: "火山 GEO 产品资料库",
    type: "document",
    description:
      "沉淀官网、产品介绍、功能规格与计费政策，供信息管理和内容创作调用。",
    itemCount: 4,
    chunkCount: 42,
    status: "ready",
    updatedAt: "2026/06/02",
  },
  {
    id: "kb-sales-qa",
    name: "销售问答库",
    type: "qa",
    description: "覆盖客户常见问题、竞品对比话术和销售顾问答疑。",
    itemCount: 1,
    chunkCount: 8,
    status: "ready",
    updatedAt: "2026/05/29",
  },
];

const INITIAL_DOCUMENTS = [
  {
    id: "doc-001",
    baseId: "kb-product",
    name: "火山 GEO 监测引擎产品说明.md",
    source: "本地",
    tags: ["产品资料"],
    size: "12.4 KB",
    type: "MD",
    status: "已完成",
    updatedAt: "2026-06-02 15:41",
    hitCount: 0,
    summary: "生成式搜索可见性监测、引用来源追踪、竞品同现分析和内容优化闭环。",
    segments: [
      {
        title: "产品信息",
        children: [
          {
            title: "基本信息",
            children: ["品牌名称：火山 GEO", "产品定位：生成式引擎优化平台"],
          },
          {
            title: "产品特点",
            children: [
              "核心功能：AI 搜索可见性监测",
              "数据来源：多模型问答样本",
            ],
          },
        ],
      },
      {
        title: "产品优势",
        children: [
          {
            title: "功能优势：全域监测",
            children: ["提及率、位次、引用来源统一追踪"],
          },
          { title: "性能优势", children: ["多平台采样，趋势按日聚合"] },
        ],
      },
    ],
    sections: [
      {
        title: "产品特点",
        body: `- 核心功能：火山 GEO 面向品牌方提供生成式搜索可见性监测，不止统计曝光，还能追踪模型回答中的品牌位置、引用来源和竞品同时出现情况。
- 技术规格：支持豆包、DeepSeek、通义千问、文心一言、Kimi、元宝等主流 AI 平台采样；按场景词、平台、时间维度聚合提及率、平均位次和引用份额。
- 数据处理：系统会对回答样本进行结构化抽取，识别品牌实体、产品实体、链接来源和正负向表述，沉淀为可检索知识块。
- 使用场景：品牌监测、内容优化、竞品对比、发布复盘、销售材料校准。`,
      },
      {
        title: "产品优势",
        body: `一、AI 搜索可见性一屏掌握
针对用户在 AI 平台中的真实提问场景，持续追踪品牌是否被提及、排在第几位、被哪些网页或内容引用。

二、知识库驱动的内容优化
系统把公司资料、产品信息、FAQ 和政策内容沉淀为结构化知识块，创作中心可以按场景词调用，减少人工反复整理。

三、从监测到发布闭环
数据中心发现问题后，可进入创作中心生成优化内容，再通过发布中心完成多渠道分发和复盘。`,
      },
    ],
  },
  {
    id: "doc-002",
    baseId: "kb-product",
    name: "生成式搜索优化实施手册.md",
    source: "本地",
    tags: ["产品资料"],
    size: "18.9 KB",
    type: "MD",
    status: "已完成",
    updatedAt: "2026-06-01 18:22",
    config: {
      ...defaultDocConfig(),
      chunkStrategy: "custom",
      custom: {
        separator: "newline",
        maxLength: 600,
        overlap: 15,
        normalizeWhitespace: true,
        stripUrls: false,
      },
    },
    hitCount: 0,
    summary: "围绕场景词梳理、知识补全、内容发布和复盘指标的落地手册。",
    segments: [
      { title: "实施步骤", children: ["场景词梳理", "知识补全", "内容发布"] },
      {
        title: "复盘指标",
        children: ["提及率变化", "平均位次变化", "引用来源变化"],
      },
    ],
    sections: [
      {
        title: "实施步骤",
        body: `- 场景词梳理：围绕用户真实搜索意图整理问题簇，覆盖品牌词、品类词、竞品词和解决方案词。
- 知识补全：把官网、产品手册、FAQ、案例、售后政策导入知识库，确保模型可引用的信息完整一致。
- 内容发布：针对低提及、低位次场景生成文章、问答和说明页，并通过发布中心分发。`,
      },
      {
        title: "复盘指标",
        body: "重点观察提及率、平均位次、引用来源数量、竞品同现率和负向表述数量。复盘周期建议按周执行，重大内容更新后单独建立观察窗口。",
      },
    ],
  },
  {
    id: "doc-003",
    baseId: "kb-product",
    name: "火山 GEO 品牌信息.md",
    source: "在线编辑",
    tags: ["品牌信息"],
    size: "4.8 KB",
    type: "MD",
    status: "已完成",
    updatedAt: "2026-05-30 11:06",
    hitCount: 0,
    summary: "品牌基础信息、定位、目标客户和核心价值。",
    segments: [
      { title: "品牌基础", children: ["品牌名称", "官网与介绍"] },
      { title: "品牌定位", children: ["目标客户", "核心价值"] },
    ],
    sections: [
      {
        title: "品牌基础",
        body: "火山 GEO 是面向品牌方的生成式引擎优化平台，帮助企业理解并提升品牌在 AI 搜索回答中的可见性、准确性和可信引用。",
      },
    ],
  },
  {
    id: "doc-004",
    baseId: "kb-product",
    name: "GEO 产品竞品分析.md",
    source: "URL",
    tags: ["竞品分析"],
    size: "9.7 KB",
    type: "MD",
    status: "解析中",
    updatedAt: "2026-05-29 17:13",
    config: {
      ...defaultDocConfig(),
      chunkStrategy: "hierarchical",
      hierarchical: { levels: 3, keepHierarchy: true },
    },
    hitCount: 0,
    summary: "监测平台、内容平台和 GEO 工作流差异分析。",
    segments: [
      { title: "竞品范围", children: ["监测平台", "内容平台"] },
      { title: "差异分析", children: ["数据闭环", "权限体系"] },
    ],
    sections: [
      {
        title: "差异分析",
        body: "火山 GEO 的优势在于把监测、知识库、创作、发布和权限管理放在同一工作流中，减少多系统切换和数据口径不一致。",
      },
    ],
  },
  {
    id: "doc-005",
    baseId: "kb-sales-qa",
    name: "销售高频问答.md",
    source: "本地",
    tags: ["销售话术"],
    size: "7.2 KB",
    type: "MD",
    status: "已完成",
    updatedAt: "2026-05-29 16:40",
    hitCount: 0,
    summary: "火山 GEO 常见价值、部署、计费和数据接入问题。",
    segments: [
      { title: "价格问题", children: ["计费方式", "试用策略"] },
      { title: "交付问题", children: ["部署周期", "数据接入"] },
    ],
    sections: [
      {
        title: "销售高频问答",
        body: `Q：火山 GEO 解决什么问题？
A：帮助品牌理解 AI 搜索如何回答用户问题，并通过知识库和内容优化提升品牌被正确提及的概率。`,
      },
    ],
  },
];

const EMPTY_FORM = {
  name: "",
  type: "document",
  description: "",
};

function nowDateText() {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}/${p(n.getMonth() + 1)}/${p(n.getDate())}`;
}

function optionByValue(options, value) {
  return options.find((item) => item.value === value);
}

function FieldCard({ children, className }) {
  return (
    <div
      className={cn("rounded-md border border-border bg-card p-4", className)}
    >
      {children}
    </div>
  );
}

function KnowledgeBaseFormBody({ mode, initialValue, onSubmit, onCancel }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() =>
    isEdit && initialValue ? { ...EMPTY_FORM, ...initialValue } : EMPTY_FORM,
  );

  const canSubmit = form.name.trim().length > 0;
  const descCount = form.description.length;
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (andImport) => {
    if (!canSubmit) return;
    const payload = {
      ...(isEdit && initialValue ? initialValue : {}),
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      updatedAt: nowDateText(),
    };
    onSubmit(
      isEdit
        ? payload
        : {
            id: `kb-${Date.now()}`,
            ...payload,
            itemCount: 0,
            chunkCount: 0,
            status: "empty",
          },
      andImport,
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(!isEdit);
  };

  const renderSection = () => (
    <div className="grid gap-5">
      <div className="grid gap-3">
        <Label>
          知识库类型
          <span className="ml-1 text-destructive">*</span>
        </Label>
        <RadioGroup
          value={form.type}
          onValueChange={(value) => update("type", value)}
          className="grid gap-3 sm:grid-cols-3"
        >
          {TYPE_OPTIONS.map(({ value, label, description, Icon }) => (
            <Label
              key={value}
              htmlFor={`kb-type-${value}`}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:bg-muted/50",
                form.type === value && "border-primary bg-primary/5",
              )}
            >
              <RadioGroupItem
                id={`kb-type-${value}`}
                value={value}
                className="mt-1"
              />
              <span className="grid gap-1">
                <span className="flex items-center gap-2 font-medium">
                  <Icon className="size-4 text-primary" />
                  {label}
                </span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {description}
                </span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <p className="text-xs leading-5 text-muted-foreground">
          类型决定文档的默认切分方式，导入后可对每个文档单独调整切分模式。
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kb-name">
          知识库名称
          <span className="ml-1 text-destructive">*</span>
        </Label>
        <Input
          id="kb-name"
          value={form.name}
          onChange={(e) => update("name", e.target.value.slice(0, 50))}
          placeholder="请输入知识库名称"
          required
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="kb-description">知识库描述</Label>
          <span className="text-xs tabular-nums text-muted-foreground">
            {descCount}/200
          </span>
        </div>
        <Textarea
          id="kb-description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="请输入知识库描述（可选）"
          rows={4}
          maxLength={200}
        />
      </div>
    </div>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "编辑知识库" : "新建知识库"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid min-h-0 gap-4">
        <div className="max-h-[70svh] min-h-0 overflow-auto pr-1">
          <FieldCard className="min-h-full">{renderSection()}</FieldCard>
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          {isEdit ? (
            <Button type="submit" leftIcon={<Pencil />} disabled={!canSubmit}>
              保存修改
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => submit(false)}
                disabled={!canSubmit}
              >
                完成创建
              </Button>
              <Button
                type="submit"
                leftIcon={<FolderPlus />}
                disabled={!canSubmit}
              >
                创建并导入
              </Button>
            </>
          )}
        </DialogFooter>
      </form>
    </>
  );
}

function KnowledgeBaseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  mode = "add",
  initialValue,
}) {
  const formKey =
    mode === "edit" && initialValue ? `edit-${initialValue.id}` : "add";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        {open && (
          <KnowledgeBaseFormBody
            key={formKey}
            mode={mode}
            initialValue={initialValue}
            onSubmit={(payload, andImport) => {
              onSubmit(payload, andImport);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function KnowledgeBaseDeleteDialog({ item, onOpenChange, onConfirm }) {
  if (!item) return null;
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除知识库</DialogTitle>
          <DialogDescription>
            将删除「{item.name}」及其索引配置。该操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            leftIcon={<Trash2 />}
            onClick={onConfirm}
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-md bg-muted/40 px-2.5 py-1.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function KnowledgeBaseCards({ items, permissions, onOpen, onDelete }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const type = optionByValue(TYPE_OPTIONS, item.type);
        const TypeIcon = type?.Icon ?? Database;
        return (
          <article
            key={item.id}
            className="flex min-h-36 flex-col rounded-md border border-border bg-card p-3.5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left"
                onClick={() => onOpen(item)}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <TypeIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-center text-base font-semibold text-foreground transition-colors hover:text-primary">
                    {item.name}
                  </span>
                </span>
              </button>
              <div className="flex shrink-0 gap-1">
                {permissions.canDelete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="删除知识库"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
              <StatPill label="文档数" value={item.itemCount} />
              <StatPill label="内容块" value={item.chunkCount} />
              <StatPill label="更新" value={item.updatedAt} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AddContentMenu({ onAdd, size = "lg" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} leftIcon={<Plus />} rightIcon={<ChevronDown />}>
          添加内容
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-md">
        {ADD_CONTENT_OPTIONS.map(({ id, label, description, Icon }) => (
          <DropdownMenuItem
            key={id}
            onSelect={() => onAdd(id)}
            className="items-start gap-3 p-2"
          >
            <Icon className="mt-0.5 size-4 text-primary" />
            <span className="grid gap-0.5">
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DetailHeader({ base, documents, onBack, onAdd }) {
  const chunks = documents.reduce((sum, doc) => sum + doc.segments.length, 0);
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="返回知识库列表"
          onClick={onBack}
        >
          <ArrowLeft />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate text-lg font-semibold">{base.name}</h1>
            <Button variant="ghost" size="icon-sm" aria-label="编辑知识库名称">
              <Pencil />
            </Button>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline" className="px-1.5 py-0 text-xs">
              {documents.length} 个文档
            </Badge>
            <Badge variant="outline" className="px-1.5 py-0 text-xs">
              {chunks} 组分段
            </Badge>
            <Badge variant="outline" className="px-1.5 py-0 text-xs">
              0 命中
            </Badge>
          </div>
        </div>
      </div>
      <AddContentMenu onAdd={onAdd} size="sm" />
    </header>
  );
}

function DocumentsSidebar({ documents, activeDoc, onSelectDocument }) {
  const [keyword, setKeyword] = useState("");
  const [treeOpen, setTreeOpen] = useState(true);
  const query = keyword.trim().toLowerCase();
  const visibleDocuments = query
    ? documents.filter((doc) => doc.name.toLowerCase().includes(query))
    : documents;

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col gap-4 border-border bg-card p-4 md:w-64 md:border-r">
      <div className="flex shrink-0 items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">文档列表</h2>
      </div>
      <div className="relative shrink-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索文档名称"
          className="h-9 pl-9"
        />
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-auto">
        {visibleDocuments.length > 0 ? (
          visibleDocuments.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelectDocument(doc)}
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                activeDoc?.id === doc.id && "bg-primary/10 text-primary",
              )}
            >
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{doc.name}</span>
            </button>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border px-3 py-8 text-center text-sm text-muted-foreground">
            暂无文档
          </div>
        )}
      </div>

      {activeDoc && activeDoc.segments.length > 0 && (
        <div className="flex max-h-[45%] shrink-0 flex-col gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setTreeOpen((value) => !value)}
            className="flex shrink-0 items-center justify-between gap-2 text-left text-sm font-semibold"
            aria-expanded={treeOpen}
          >
            <span>分段层级</span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                !treeOpen && "-rotate-90",
              )}
            />
          </button>
          {treeOpen && (
            <div className="min-h-0 flex-1 space-y-1 overflow-auto">
              {activeDoc.segments.map((segment) => (
                <SegmentTreeItem key={segment.title} item={segment} />
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function SegmentTreeItem({ item, depth = 0 }) {
  const isGroup = typeof item !== "string";
  const title = isGroup ? item.title : item;
  const children = isGroup ? item.children : [];
  const depthClass = ["pl-0", "pl-5", "pl-10", "pl-14"][Math.min(depth, 3)];
  const [open, setOpen] = useState(true);

  const rowClassName = cn(
    "flex w-full min-w-0 items-center gap-2 rounded-md py-1.5 text-left text-sm text-foreground",
    depthClass,
    depth === 0 ? "font-medium" : "text-muted-foreground",
    isGroup && "transition-colors hover:bg-muted",
  );

  return (
    <div className="space-y-1">
      {isGroup ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={rowClassName}
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              !open && "-rotate-90",
            )}
          />
          <span className="truncate">{title}</span>
        </button>
      ) : (
        <div className={rowClassName}>
          <span className="size-3.5 shrink-0" />
          <span className="truncate">{title}</span>
        </div>
      )}
      {isGroup &&
        open &&
        children.map((child) => (
          <SegmentTreeItem
            key={typeof child === "string" ? child : child.title}
            item={child}
            depth={depth + 1}
          />
        ))}
    </div>
  );
}

function DocumentsTab({ documents, onUpdateDoc }) {
  const [activeDocId, setActiveDocId] = useState(documents[0]?.id ?? null);
  const activeDoc =
    documents.find((doc) => doc.id === activeDocId) ?? documents[0] ?? null;

  return (
    <div className="flex min-h-[calc(100svh-17rem)] overflow-hidden rounded-md border border-border bg-card">
      <DocumentsSidebar
        documents={documents}
        activeDoc={activeDoc}
        onSelectDocument={(doc) => setActiveDocId(doc.id)}
      />
      <section className="flex min-w-0 flex-1 flex-col bg-background">
        {activeDoc ? (
          <DocumentReader doc={activeDoc} onUpdateDoc={onUpdateDoc} />
        ) : (
          <div className="grid flex-1 place-items-center p-4 text-center">
            <div className="grid max-w-sm justify-items-center gap-4">
              <span className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                <FilePlus2 className="size-7" />
              </span>
              <div className="grid gap-1">
                <h2 className="text-base font-semibold">暂无文档</h2>
                <p className="text-sm text-muted-foreground">
                  导入一个新文档开始构建知识库。
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function buildSourceMarkdown(doc) {
  return [
    `# ${doc.name}`,
    ...doc.sections.map((section) => `## ${section.title}\n\n${section.body}`),
  ].join("\n\n");
}

function ChunksList({ doc }) {
  return (
    <div className="grid gap-3">
      {doc.segments.map((segment, index) => (
        <FieldCard key={segment.title}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="font-semibold">
              分段 {index + 1}：{segment.title}
            </div>
            <Badge variant="outline">父块上下文</Badge>
          </div>
          <div className="rounded-md bg-muted/40 p-3">
            <SegmentTreeItem item={segment} />
          </div>
        </FieldCard>
      ))}
    </div>
  );
}

function DocumentReader({ doc, onUpdateDoc }) {
  const [previewRaw, setPreviewRaw] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const sourceMarkdown = useMemo(() => buildSourceMarkdown(doc), [doc]);
  const config = doc.config ?? defaultDocConfig();

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-2">
          <h2 className="truncate text-base font-semibold">{doc.name}</h2>
          <Badge variant="outline">{doc.source}</Badge>
          <Badge variant="outline">
            {CHUNK_STRATEGY_LABEL[config.chunkStrategy]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">预览原文</span>
          <Switch
            aria-label="预览原文"
            checked={previewRaw}
            onCheckedChange={setPreviewRaw}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="查看或调整配置"
            title="查看或调整配置"
            onClick={() => setConfigOpen(true)}
          >
            <SlidersHorizontal />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="删除文档">
            <Trash2 />
          </Button>
        </div>
      </header>

      <DocumentConfigDialog
        key={doc.id}
        open={configOpen}
        onOpenChange={setConfigOpen}
        doc={doc}
        onApply={(next) => onUpdateDoc?.(doc.id, { config: next })}
      />

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {previewRaw ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="size-4" />
                原始文档
              </div>
              <pre className="overflow-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-sm leading-7 whitespace-pre-wrap text-foreground">
                {sourceMarkdown}
              </pre>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                分块内容
              </div>
              <ChunksList doc={doc} />
            </div>
          </div>
        ) : (
          <ChunksList doc={doc} />
        )}
      </div>
    </>
  );
}

function KnowledgeBaseDetail({ base, onBack }) {
  const [documents, setDocuments] = useState(() =>
    INITIAL_DOCUMENTS.filter((doc) => doc.baseId === base.id),
  );

  const handleUpdateDoc = (docId, patch) =>
    setDocuments((current) =>
      current.map((doc) => (doc.id === docId ? { ...doc, ...patch } : doc)),
    );

  const handleAddContent = (source) => {
    const option = ADD_CONTENT_OPTIONS.find((item) => item.id === source);
    const sourceLabel = option?.label ?? "上传文档";
    const newDoc = {
      id: `doc-${Date.now()}`,
      baseId: base.id,
      name: `${sourceLabel}示例文档.md`,
      source: sourceLabel.replace("上传", "").replace("导入 ", "URL") || "本地",
      tags: ["待分类"],
      size: "2.1 KB",
      type: "MD",
      status: "解析中",
      updatedAt: "刚刚",
      hitCount: 0,
      summary: "新导入内容正在解析，解析完成后会生成分段、摘要和可检索知识块。",
      segments: [
        { title: "解析队列", children: ["等待文档解析", "等待向量化"] },
      ],
      sections: [
        {
          title: "解析中",
          body: "文档已进入解析队列，完成后可查看合并内容、分块内容和原文预览。",
        },
      ],
    };
    setDocuments((current) => [newDoc, ...current]);
  };

  return (
    <PageShell className="max-w-none gap-5">
      <DetailHeader
        base={base}
        documents={documents}
        onBack={onBack}
        onAdd={handleAddContent}
      />

      <DocumentsTab documents={documents} onUpdateDoc={handleUpdateDoc} />
    </PageShell>
  );
}

function EmptyState({ canCreate, onCreate, hasFilter }) {
  return (
    <div className="grid place-items-center rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="grid max-w-sm justify-items-center gap-4">
        <span className="grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
          <BookOpen className="size-7" />
        </span>
        <div className="grid gap-1">
          <h2 className="text-base font-semibold">
            {hasFilter ? "没有匹配的知识库" : "暂无知识库"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? "调整搜索关键词后再试。"
              : "创建第一个知识库后，即可继续导入文档并为每个文档设置切分方式。"}
          </p>
        </div>
        {!hasFilter && canCreate && (
          <Button leftIcon={<FolderPlus />} onClick={onCreate}>
            新建知识库
          </Button>
        )}
      </div>
    </div>
  );
}

function KnowledgeBases() {
  const { user } = useAuth();
  const [items, setItems] = useState(INITIAL_BASES);
  const [query, setQuery] = useState("");
  const [formState, setFormState] = useState({
    open: false,
    mode: "add",
    initial: null,
  });
  const [deleting, setDeleting] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const permissions = {
    canCreate: canAction(user, "knowledge.bases", "create"),
    canDelete: canAction(user, "knowledge.bases", "delete"),
  };

  const openAdd = () =>
    setFormState({ open: true, mode: "add", initial: null });
  const closeForm = (next) =>
    setFormState((current) => ({ ...current, open: next }));

  const handleSubmit = (item, andImport) => {
    setItems((current) => {
      const idx = current.findIndex((cur) => cur.id === item.id);
      if (idx === -1) return [item, ...current];
      const next = current.slice();
      next[idx] = item;
      return next;
    });
    if (formState.mode === "add" && andImport) {
      setSelectedId(item.id);
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    setItems((current) => current.filter((item) => item.id !== deleting.id));
    if (selectedId === deleting.id) setSelectedId(null);
    setDeleting(null);
  };

  const keyword = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (!keyword) return true;
        const type = optionByValue(TYPE_OPTIONS, item.type)?.label ?? item.type;
        return [item.name, item.description, type].some((field) =>
          field.toLowerCase().includes(keyword),
        );
      }),
    [items, keyword],
  );
  const selectedBase = selectedId
    ? items.find((item) => item.id === selectedId)
    : null;

  if (selectedBase) {
    return (
      <KnowledgeBaseDetail
        base={selectedBase}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索知识库名称"
              className="pl-9"
            />
          </div>
          <Button
            leftIcon={<Plus />}
            disabled={!permissions.canCreate}
            onClick={openAdd}
          >
            新建知识库
          </Button>
        </div>

        {filtered.length > 0 ? (
          <KnowledgeBaseCards
            items={filtered}
            permissions={permissions}
            onOpen={(item) => setSelectedId(item.id)}
            onDelete={setDeleting}
          />
        ) : (
          <EmptyState
            canCreate={permissions.canCreate}
            onCreate={openAdd}
            hasFilter={Boolean(keyword)}
          />
        )}
      </PageShell>

      <KnowledgeBaseFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
      />

      <KnowledgeBaseDeleteDialog
        item={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default KnowledgeBases;
