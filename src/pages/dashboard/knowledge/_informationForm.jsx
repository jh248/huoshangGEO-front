/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Input+Label+Textarea+ScrollArea+Badge+SingleSelect+MultiSelect+Progress+Tabs+Separator，lucide 图标
 *          本地 _knowledgeMock (切块 / 去重 mock 层)
 * [OUTPUT]: 命名导出 InformationFormDialog — 添加(向导 4 步) / 编辑(ChunkEditor) 共享壳
 *           内部：SourcePicker / UploadStep / PreviewStep / ProcessingStep / ChunkEditor / FileRow / TagMultiSelect
 *           暴露 ChunkRow 供详情弹窗复用
 * [POS]: pages/dashboard/knowledge 私有，仅 Information.jsx 消费
 * [PROTOCOL]: 上传进度 / 解析 / 入库均为 mock；接真后端时替换 simulateUpload + simulateIndex + _knowledgeMock
 *             信息条目 = { id, title, companyId, companyName, tagIds, chunks, updatedAt }
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Tags as TagsIcon,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SingleSelect } from '@/components/ui/single-select'
import { MultiSelect } from '@/components/ui/multi-select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { dedupeChunks, mockChunkFile, mockChunkText } from './_knowledgeMock'

/* ============================================================================
 * TagMultiSelect · 信息打标签 (全局标签多选)
 * ========================================================================== */
function TagMultiSelect({ tags, value, onChange }) {
  return (
    <MultiSelect
      Icon={TagsIcon}
      label="标签"
      value={value}
      onValueChange={onChange}
      options={tags.map((t) => ({ value: t.id, label: t.name }))}
      allLabel="未选标签"
      withSearch
      triggerClassName="h-10 w-full rounded-md"
      contentClassName="w-[min(22rem,calc(100vw-3rem))]"
    />
  )
}

/* 标签 chip · 颜色取标签自身 chart token（color-mix 派生，无 hex） */
export function TagChip({ tag }) {
  if (!tag) return null
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
      style={{
        color: `color-mix(in srgb, ${tag.color} 72%, var(--foreground))`,
        borderColor: `color-mix(in srgb, ${tag.color} 35%, transparent)`,
        background: `color-mix(in srgb, ${tag.color} 12%, transparent)`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tag.color }} />
      {tag.name}
    </span>
  )
}

const ACCEPTED_EXTS = ['.pdf', '.doc', '.docx', '.md', '.markdown', '.txt']
const ACCEPTED_LABEL = 'PDF · Word · Markdown · TXT'

const STEPS = [
  { id: 1, label: '选择来源' },
  { id: 2, label: '基本信息' },
  { id: 3, label: '切分预览' },
  { id: 4, label: '入库处理' },
]

const STATUS_LABEL = {
  pending: '待解析',
  uploading: '上传中',
  parsing: '解析中',
  done: '已完成',
  failed: '失败',
}

const STATUS_TONE = {
  pending: 'outline',
  uploading: 'secondary',
  parsing: 'secondary',
  done: 'default',
  failed: 'destructive',
}

const CHUNK_LEN_OPTIONS = [200, 400, 600, 800, 1000].map((v) => ({
  value: String(v),
  label: `${v} 字`,
}))
const CHUNK_OVERLAP_OPTIONS = [0, 30, 60, 120, 200].map((v) => ({
  value: String(v),
  label: `${v} 字`,
}))
const CHUNK_SEPARATOR_OPTIONS = [
  { value: 'paragraph', label: '空行（段落）' },
  { value: 'sentence', label: '句号 / 问号 / 叹号' },
  { value: 'newline', label: '换行' },
]

const DEFAULT_CHUNK_CONFIG = {
  mode: 'auto',
  maxLen: '400',
  overlap: '60',
  separator: 'paragraph',
}

/* ============================================================================
 * 工具
 * ========================================================================== */
function formatBytes(n) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function newId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}`
}

function rechunkByConfig(chunks, config) {
  if (config.mode === 'auto') return chunks
  const maxLen = Number(config.maxLen) || 400
  const overlap = Math.min(Number(config.overlap) || 0, Math.floor(maxLen / 2))

  const result = []
  for (const c of chunks) {
    const t = c.text
    if (t.length <= maxLen) {
      result.push(c)
      continue
    }
    let start = 0
    let part = 0
    while (start < t.length) {
      const end = Math.min(start + maxLen, t.length)
      const piece = t.slice(start, end)
      result.push({
        ...c,
        id: `${c.id}-${part}`,
        text: piece,
        tokenCount: Math.max(1, Math.round(piece.length / 1.8)),
      })
      part += 1
      if (end >= t.length) break
      start = end - overlap
    }
  }
  return result
}

/* ============================================================================
 * StepRail · 顶部步骤指示
 * ========================================================================== */
function StepRail({ step }) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {STEPS.map((s, i) => {
        const reached = step >= s.id
        const active = step === s.id
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-colors',
                reached
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {step > s.id ? <Check className="size-3.5" /> : s.id}
            </span>
            <span
              className={cn(
                'text-sm',
                active
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="mx-1 h-px w-6 bg-border md:w-10" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ============================================================================
 * 1️⃣ SourcePicker · 选择数据源 (双 Tile)
 * ========================================================================== */
function SourceTile({ active, Icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-1 flex-col items-start gap-3 rounded-md border bg-card p-5 text-left transition-all',
        'hover:border-primary/60 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_8%,transparent)]',
        active ? 'border-primary ring-2 ring-primary/30' : 'border-border'
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary skeu-raised">
        <Icon className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </button>
  )
}

function SourcePicker({ source, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SourceTile
        active={source === 'file'}
        Icon={Upload}
        title="上传文件"
        desc={`拖入 ${ACCEPTED_LABEL}，可一次拖入多份；后端自动解析为内容块。`}
        onClick={() => onChange('file')}
      />
      <SourceTile
        active={source === 'text'}
        Icon={FileText}
        title="手动文本"
        desc="粘贴产品介绍 / 白皮书 / FAQ 文本，按段落自动切块。"
        onClick={() => onChange('text')}
      />
    </div>
  )
}

/* ============================================================================
 * 2️⃣ FileRow · Dify 风格文件行 (icon + 名称 + 状态 + 进度 + 操作)
 * ========================================================================== */
function FileRow({ file, onRemove, onRetry }) {
  const tone = STATUS_TONE[file.status]
  const showProgress = file.status === 'uploading' || file.status === 'parsing'
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <FileText className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(file.size)}
            {file.status === 'done' && (
              <>
                {' · '}
                <span className="text-foreground">{file.chunks.length} 块</span>
              </>
            )}
            {file.status === 'failed' && file.error && (
              <span className="ml-1 text-destructive">· {file.error}</span>
            )}
          </p>
        </div>
        <Badge variant={tone} className="shrink-0 gap-1 px-2">
          {file.status === 'done' && <CheckCircle2 className="size-3" />}
          {(file.status === 'uploading' || file.status === 'parsing') && (
            <Loader2 className="size-3 animate-spin" />
          )}
          {file.status === 'failed' && <AlertCircle className="size-3" />}
          {STATUS_LABEL[file.status]}
          {file.status === 'uploading' && ` ${file.progress}%`}
        </Badge>
        {file.status === 'failed' && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="重试"
            onClick={() => onRetry(file.id)}
          >
            <RotateCcw />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="移除"
          onClick={() => onRemove(file.id)}
        >
          <X />
        </Button>
      </div>
      {showProgress && (
        <Progress
          value={file.status === 'parsing' ? 100 : file.progress}
          className="mt-2 h-1.5"
        />
      )}
    </div>
  )
}

/* ============================================================================
 * 2️⃣ UploadStep · 基本信息 + 内容输入 (按 source 切换)
 * ========================================================================== */
function UploadStep({
  source,
  name,
  setName,
  companyId,
  setCompanyId,
  companyOptions,
  tags,
  tagIds,
  setTagIds,
  files,
  setFiles,
  text,
  setText,
}) {
  const inputRef = useRef(null)

  const simulateUpload = (entry) => {
    setFiles((cur) =>
      cur.map((f) =>
        f.id === entry.id ? { ...f, status: 'uploading', progress: 0 } : f
      )
    )
    let p = 0
    const tick = () => {
      p += Math.round(15 + Math.random() * 25)
      if (p >= 100) {
        setFiles((cur) =>
          cur.map((f) =>
            f.id === entry.id ? { ...f, progress: 100, status: 'parsing' } : f
          )
        )
        window.setTimeout(() => {
          const chunks = mockChunkFile(entry.file)
          setFiles((cur) =>
            cur.map((f) =>
              f.id === entry.id
                ? { ...f, status: 'done', progress: 100, chunks }
                : f
            )
          )
        }, 600)
      } else {
        setFiles((cur) =>
          cur.map((f) => (f.id === entry.id ? { ...f, progress: p } : f))
        )
        window.setTimeout(tick, 150 + Math.random() * 200)
      }
    }
    window.setTimeout(tick, 200)
  }

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList).filter((f) =>
      ACCEPTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    const entries = incoming.map((f) => ({
      id: newId('f-'),
      file: f,
      name: f.name,
      size: f.size,
      status: 'pending',
      progress: 0,
      chunks: [],
    }))
    setFiles((cur) => [...cur, ...entries])
    entries.forEach(simulateUpload)
  }

  const onRetry = (id) => {
    const entry = files.find((f) => f.id === id)
    if (entry) simulateUpload(entry)
  }

  const onRemove = (id) => {
    setFiles((cur) => cur.filter((f) => f.id !== id))
  }

  const [dragOver, setDragOver] = useState(false)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>所属公司</Label>
          <SingleSelect
            placeholder="选择所属公司"
            options={companyOptions}
            value={companyId || undefined}
            onValueChange={setCompanyId}
            triggerClassName="w-full h-10 rounded-md"
            contentClassName="w-[--radix-popover-trigger-width]"
            withSearch
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="info-title">信息标题</Label>
          <Input
            id="info-title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：火山 GEO · 监测引擎"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>
          标签 <span className="text-destructive">*</span>
        </Label>
        <TagMultiSelect tags={tags} value={tagIds} onChange={setTagIds} />
        <p className="text-xs text-muted-foreground">
          至少选择一个标签，用于标明该信息的类型（如 产品 / FAQ），创作时按标签取数。
        </p>
      </div>

      <Separator />

      {source === 'file' ? (
        <div className="space-y-3">
          <div
            onDragEnter={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              handleFiles(e.dataTransfer.files)
            }}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors',
              dragOver && 'border-primary bg-primary/5'
            )}
            onClick={() => inputRef.current?.click()}
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-background text-primary skeu-raised">
              <Upload className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">
              拖拽文件到此处，或点击选择文件
            </p>
            <p className="text-xs text-muted-foreground">
              支持 {ACCEPTED_LABEL} · 可一次选择多个 · 单文件 ≤ 20 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_EXTS.join(',')}
              multiple
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <ScrollArea className="max-h-64 pr-2">
              <div className="space-y-2">
                {files.map((f) => (
                  <FileRow
                    key={f.id}
                    file={f}
                    onRemove={onRemove}
                    onRetry={onRetry}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="info-text">信息内容</Label>
          <Textarea
            id="info-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={'粘贴产品介绍 / 白皮书 / FAQ / 政策条款。\n\n段落用空行分隔，下一步可在预览中查看切块结果。'}
            className="min-h-56"
          />
          <p className="text-xs text-muted-foreground">
            将由后端按段落切分；下一步可调整切分参数或手动编辑。
          </p>
        </div>
      )}
    </div>
  )
}

/* ============================================================================
 * 3️⃣ PreviewStep · 切分配置 + 预览 (Dify 同款)
 * ========================================================================== */
function ChunkConfigBar({ config, onChange }) {
  const isAuto = config.mode === 'auto'
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">切分模式</span>
        <div className="inline-flex overflow-hidden rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => onChange({ ...config, mode: 'auto' })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              isAuto
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Wand2 className="size-3.5" /> 自动（推荐）
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...config, mode: 'custom' })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
              !isAuto
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <Settings2 className="size-3.5" /> 自定义
          </button>
        </div>
      </div>

      {!isAuto && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">最大块长</p>
            <SingleSelect
              options={CHUNK_LEN_OPTIONS}
              value={config.maxLen}
              onValueChange={(v) => onChange({ ...config, maxLen: v })}
              triggerClassName="w-full h-9 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">重叠长度</p>
            <SingleSelect
              options={CHUNK_OVERLAP_OPTIONS}
              value={config.overlap}
              onValueChange={(v) => onChange({ ...config, overlap: v })}
              triggerClassName="w-full h-9 rounded-md"
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">分隔符</p>
            <SingleSelect
              options={CHUNK_SEPARATOR_OPTIONS}
              value={config.separator}
              onValueChange={(v) => onChange({ ...config, separator: v })}
              triggerClassName="w-full h-9 rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function PreviewStep({ buckets, config, setConfig }) {
  const [activeBucket, setActiveBucket] = useState(buckets[0]?.key)

  const allChunks = useMemo(
    () => buckets.flatMap((b) => rechunkByConfig(b.chunks, config)),
    [buckets, config]
  )
  const totalTokens = allChunks.reduce((s, c) => s + c.tokenCount, 0)
  const active =
    buckets.find((b) => b.key === activeBucket) ?? buckets[0]
  const effectiveActive = active?.key
  const activeChunks = active ? rechunkByConfig(active.chunks, config) : []

  return (
    <div className="space-y-3">
      <ChunkConfigBar config={config} onChange={setConfig} />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" className="tabular-nums">
          {buckets.length} 个来源
        </Badge>
        <Badge variant="secondary" className="tabular-nums">
          {allChunks.length} 块
        </Badge>
        <Badge variant="outline" className="tabular-nums">
          ~{totalTokens.toLocaleString()} tokens
        </Badge>
        <span className="ml-auto">切换来源查看不同文件的切块结果</span>
      </div>

      {buckets.length > 1 && (
        <Tabs value={effectiveActive} onValueChange={setActiveBucket}>
          <TabsList className="w-full overflow-x-auto">
            {buckets.map((b) => (
              <TabsTrigger key={b.key} value={b.key} className="gap-1.5">
                <FileText className="size-3" />
                <span className="max-w-32 truncate">{b.label}</span>
                <Badge variant="outline" className="ml-1 px-1.5 py-0 text-[10px]">
                  {rechunkByConfig(b.chunks, config).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <ScrollArea className="max-h-[22rem] pr-2">
        <div className="space-y-2">
          {activeChunks.map((c, i) => (
            <ChunkRow key={c.id} index={i} chunk={c} />
          ))}
          {activeChunks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              当前来源没有切出块 · 试试切换为自动模式或换个来源
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

/* ============================================================================
 * 4️⃣ ProcessingStep · 入库进度 (mock)
 * ========================================================================== */
function ProcessingStep({ totalChunks, onDone }) {
  const [stage, setStage] = useState(0)
  const stages = ['解析内容', '向量化', '写入知识库']

  useEffect(() => {
    let i = 0
    const tick = () => {
      i += 1
      if (i >= stages.length) {
        setStage(stages.length)
        window.setTimeout(onDone, 400)
        return
      }
      setStage(i)
      window.setTimeout(tick, 700)
    }
    const timer = window.setTimeout(tick, 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pct = Math.round((stage / stages.length) * 100)

  return (
    <div className="space-y-5 py-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {stage >= stages.length ? (
            <CheckCircle2 className="size-5" />
          ) : (
            <Loader2 className="size-5 animate-spin" />
          )}
        </span>
        <div>
          <p className="text-sm font-medium">
            {stage >= stages.length ? '入库完成' : stages[stage] || stages[0]}
          </p>
          <p className="text-xs text-muted-foreground">
            正在处理 {totalChunks} 个内容块 · 完成后自动关闭弹窗
          </p>
        </div>
      </div>
      <Progress value={pct} className="h-2" />
      <ul className="grid gap-2 text-xs">
        {stages.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-5 items-center justify-center rounded-full',
                i < stage
                  ? 'bg-primary text-primary-foreground'
                  : i === stage
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {i < stage ? (
                <Check className="size-3" />
              ) : i === stage ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <span className="text-[10px] tabular-nums">{i + 1}</span>
              )}
            </span>
            <span
              className={cn(
                i < stage
                  ? 'text-foreground'
                  : i === stage
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
              )}
            >
              {s}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================================================================
 * ChunkRow · 块卡片 (查看 / 编辑共用，editable=true 显示编辑/删除)
 * ========================================================================== */
function ChunkRow({ index, chunk, editable, onChange, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(chunk.text)

  const commit = () => {
    onChange?.({
      ...chunk,
      text: draft,
      tokenCount: Math.max(1, Math.round(draft.length / 1.8)),
    })
    setEditing(false)
  }

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium tabular-nums text-foreground">
          #{String(index + 1).padStart(2, '0')}
        </span>
        <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[10px]">
          {chunk.source === 'file' ? (
            <FileText className="size-3" />
          ) : (
            <Sparkles className="size-3" />
          )}
          <span className="max-w-32 truncate">{chunk.sourceName}</span>
        </Badge>
        <span className="ml-auto tabular-nums">{chunk.tokenCount} tokens</span>
        {editable && !editing && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="编辑块"
            onClick={() => {
              setDraft(chunk.text)
              setEditing(true)
            }}
          >
            <Pencil />
          </Button>
        )}
        {editable && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="删除块"
            onClick={() => onDelete?.(chunk.id)}
          >
            <Trash2 />
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-32"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              取消
            </Button>
            <Button size="sm" onClick={commit}>
              保存
            </Button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {chunk.text}
        </p>
      )}
    </div>
  )
}

/* ============================================================================
 * ChunkEditor · 编辑模式 (Dify 文档编辑页同款 — 直接管块，不走向导)
 * ========================================================================== */
function ChunkEditor({ chunks, onChange }) {
  const [appendOpen, setAppendOpen] = useState(false)
  const [appendDraft, setAppendDraft] = useState('')
  const [dedupeHint, setDedupeHint] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const updateChunk = (next) => {
    onChange(chunks.map((c) => (c.id === next.id ? next : c)))
  }
  const deleteChunk = (id) => {
    onChange(chunks.filter((c) => c.id !== id))
  }

  const appendChunks = (incoming) => {
    if (!incoming.length) return
    const { fresh, skipped } = dedupeChunks(chunks, incoming)
    onChange([...chunks, ...fresh])
    setDedupeHint({ added: fresh.length, skipped })
    window.setTimeout(() => setDedupeHint(null), 4000)
  }

  const submitManual = () => {
    const incoming = mockChunkText(appendDraft, '手动添加')
    appendChunks(incoming)
    setAppendDraft('')
    setAppendOpen(false)
  }

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList).filter((f) =>
      ACCEPTED_EXTS.some((ext) => f.name.toLowerCase().endsWith(ext))
    )
    const newChunks = incoming.flatMap((f) => mockChunkFile(f))
    appendChunks(newChunks)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">内容块</p>
        <Badge variant="secondary" className="tabular-nums">
          {chunks.length}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus />}
            onClick={() => setAppendOpen((v) => !v)}
          >
            手动追加
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload />}
            onClick={() => inputRef.current?.click()}
          >
            上传文件
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTS.join(',')}
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {dedupeHint && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs">
          <AlertCircle className="size-3.5 text-primary" />
          <span className="text-foreground">
            新增 <span className="font-medium tabular-nums">{dedupeHint.added}</span> 块
            {dedupeHint.skipped > 0 && (
              <>
                ，已自动去重{' '}
                <span className="font-medium tabular-nums">{dedupeHint.skipped}</span> 块
              </>
            )}
          </span>
        </div>
      )}

      {appendOpen && (
        <div className="space-y-2 rounded-2xl border border-dashed border-border bg-muted/20 p-3">
          <Textarea
            value={appendDraft}
            onChange={(e) => setAppendDraft(e.target.value)}
            placeholder="粘贴一段文本，按段落自动切成块"
            className="min-h-28"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAppendOpen(false)
                setAppendDraft('')
              }}
            >
              取消
            </Button>
            <Button size="sm" onClick={submitManual} disabled={!appendDraft.trim()}>
              切块追加
            </Button>
          </div>
        </div>
      )}

      <div
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          'rounded-2xl border border-dashed border-border bg-muted/10 px-4 py-3 text-center text-xs text-muted-foreground transition-colors',
          dragOver && 'border-primary bg-primary/5 text-foreground'
        )}
      >
        拖入文件追加，或使用上方按钮 · 自动按块去重
      </div>

      {chunks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          暂无内容块 · 上传文件或粘贴文本以生成
        </div>
      ) : (
        <ScrollArea className="max-h-[26rem] pr-2">
          <div className="space-y-2">
            {chunks.map((c, i) => (
              <ChunkRow
                key={c.id}
                index={i}
                chunk={c}
                editable
                onChange={updateChunk}
                onDelete={deleteChunk}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

/* ============================================================================
 * AddWizard · 添加向导 (4 步)
 * ========================================================================== */
function AddWizard({ companies, tags, onSubmit, onCancel }) {
  const [step, setStep] = useState(1)
  const [source, setSource] = useState('file')
  const [companyId, setCompanyId] = useState('')
  const [name, setName] = useState('')
  const [tagIds, setTagIds] = useState([])
  const [files, setFiles] = useState([])
  const [text, setText] = useState('')
  const [chunkConfig, setChunkConfig] = useState(DEFAULT_CHUNK_CONFIG)

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.id, label: c.brandName })),
    [companies]
  )

  /* —— 切分前的「桶」：文本桶 + 每个上传完成的文件桶 —— */
  const buckets = useMemo(() => {
    const list = []
    if (source === 'text' && text.trim()) {
      list.push({
        key: 'manual',
        label: '手动文本',
        chunks: mockChunkText(text, '手动添加'),
      })
    }
    if (source === 'file') {
      files
        .filter((f) => f.status === 'done')
        .forEach((f) =>
          list.push({ key: f.id, label: f.name, chunks: f.chunks })
        )
    }
    return list
  }, [source, text, files])

  const allChunks = useMemo(() => {
    const flat = buckets.flatMap((b) => rechunkByConfig(b.chunks, chunkConfig))
    // 跨桶去重，保证多文件 + 文本混入也不重复
    const seen = new Set()
    const out = []
    for (const c of flat) {
      const k = c.text.trim().toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      out.push(c)
    }
    return out
  }, [buckets, chunkConfig])

  const filesUploading = files.some(
    (f) => f.status === 'uploading' || f.status === 'parsing'
  )
  const hasContent =
    source === 'file'
      ? files.some((f) => f.status === 'done')
      : text.trim().length > 0

  const canNext = (() => {
    if (step === 1) return Boolean(source)
    if (step === 2)
      return Boolean(
        companyId && name.trim() && tagIds.length > 0 && hasContent && !filesUploading
      )
    if (step === 3) return allChunks.length > 0
    return false
  })()

  const handleDone = () => {
    const company = companies.find((c) => c.id === companyId)
    const today = new Date().toLocaleDateString('zh-CN')
    onSubmit({
      id: newId(''),
      title: name.trim(),
      companyId,
      companyName: company?.brandName ?? '',
      tagIds,
      chunks: allChunks,
      updatedAt: today,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>添加信息</DialogTitle>
        <DialogDescription>
          选择来源 → 填写信息 → 切分预览 → 入库。
        </DialogDescription>
      </DialogHeader>

      <div className="border-y border-border bg-muted/20 px-1 py-3">
        <StepRail step={step} />
      </div>

      <div className="py-3">
        {step === 1 && <SourcePicker source={source} onChange={setSource} />}
        {step === 2 && (
          <UploadStep
            source={source}
            name={name}
            setName={setName}
            companyId={companyId}
            setCompanyId={setCompanyId}
            companyOptions={companyOptions}
            tags={tags}
            tagIds={tagIds}
            setTagIds={setTagIds}
            files={files}
            setFiles={setFiles}
            text={text}
            setText={setText}
          />
        )}
        {step === 3 && (
          <PreviewStep
            buckets={buckets}
            config={chunkConfig}
            setConfig={setChunkConfig}
          />
        )}
        {step === 4 && (
          <ProcessingStep totalChunks={allChunks.length} onDone={handleDone} />
        )}
      </div>

      <DialogFooter className="gap-2 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
          leftIcon={step === 1 ? undefined : <ArrowLeft />}
          disabled={step === 4}
        >
          {step === 1 ? '取消' : '上一步'}
        </Button>
        {step < 4 && (
          <Button
            rightIcon={step === 3 ? undefined : <ArrowRight />}
            leftIcon={step === 3 ? <CheckCircle2 /> : undefined}
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            {step === 3 ? '开始入库' : '下一步'}
          </Button>
        )}
      </DialogFooter>
    </>
  )
}

/* ============================================================================
 * EditBody · 编辑 (基本信息 + ChunkEditor)
 * ========================================================================== */
function EditBody({ initialValue, companies, tags, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValue.title)
  const [companyId, setCompanyId] = useState(initialValue.companyId)
  const [tagIds, setTagIds] = useState(initialValue.tagIds ?? [])
  const [chunks, setChunks] = useState(initialValue.chunks)

  const companyOptions = useMemo(
    () => companies.map((c) => ({ value: c.id, label: c.brandName })),
    [companies]
  )

  const canSubmit = name.trim() && companyId && tagIds.length > 0 && chunks.length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const company = companies.find((c) => c.id === companyId)
    const today = new Date().toLocaleDateString('zh-CN')
    onSubmit({
      ...initialValue,
      title: name.trim(),
      companyId,
      companyName: company?.brandName ?? initialValue.companyName,
      tagIds,
      chunks,
      updatedAt: today,
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>编辑信息</DialogTitle>
        <DialogDescription>
          修改基本信息或内容块；可继续上传文件 / 粘贴文本追加，自动去重。
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>所属公司</Label>
            <SingleSelect
              placeholder="选择所属公司"
              options={companyOptions}
              value={companyId || undefined}
              onValueChange={setCompanyId}
              triggerClassName="w-full h-10 rounded-md"
              contentClassName="w-[--radix-popover-trigger-width]"
              withSearch
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="info-title-edit">信息标题</Label>
            <Input
              id="info-title-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>
            标签 <span className="text-destructive">*</span>
          </Label>
          <TagMultiSelect tags={tags} value={tagIds} onChange={setTagIds} />
        </div>
        <ChunkEditor chunks={chunks} onChange={setChunks} />
      </div>

      <DialogFooter className="gap-2 sm:flex-row">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button leftIcon={<Pencil />} disabled={!canSubmit} onClick={handleSubmit}>
          保存修改
        </Button>
      </DialogFooter>
    </>
  )
}

/* ============================================================================
 * InformationFormDialog · 添加(向导) / 编辑(直接编辑) 共享壳
 *   key=mode+id 强制 mount 重置
 * ========================================================================== */
export function InformationFormDialog({
  open,
  onOpenChange,
  onSubmit,
  mode = 'add',
  initialValue,
  companies,
  tags,
}) {
  const formKey =
    mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        {open && mode === 'add' && (
          <AddWizard
            key={formKey}
            companies={companies}
            tags={tags}
            onSubmit={(payload) => {
              onSubmit(payload)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
        {open && mode === 'edit' && initialValue && (
          <EditBody
            key={formKey}
            initialValue={initialValue}
            companies={companies}
            tags={tags}
            onSubmit={(payload) => {
              onSubmit(payload)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export { ChunkRow }
