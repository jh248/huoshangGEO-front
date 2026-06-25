/**
 * [INPUT]: 依赖 react state/memo、framer-motion、react-router useNavigate、ui/Button/Input/Badge/Dialog/Table、PageShell、lib/motion
 * [OUTPUT]: 默认导出 Articles — 文章列表 (表格 标题/状态/字数/核心词/更新 + 搜索 + 状态筛选 + 新建/编辑/删除)
 * [POS]: /dashboard/creation/articles 路由 · 创作中心文章列表
 * [PROTOCOL]: 本地 mock 数据仅作前端原型；接入后端时替换 INITIAL_ARTICLES 与增删逻辑
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Filter, Pencil, Search, Send, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { SingleSelect } from '@/components/ui/single-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { PageShell } from '../_PageShell'
import { fadeInUp, pageTransition } from '@/lib/motion'

const STATUS_META = {
  published: { label: '已发布', variant: 'default' },
  scheduled: { label: '准备发布', variant: 'accent' },
  draft: { label: '未发布', variant: 'secondary' },
}

const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '已发布' },
  { value: 'scheduled', label: '准备发布' },
  { value: 'draft', label: '未发布' },
]

const INITIAL_ARTICLES = [
  { id: 'a1', title: '知识库调研', status: 'draft', words: 1280, keyword: '西屋大路灯选购', scene: '选购哪个牌子好', updatedAt: '2026-06-05 16:28:31' },
  { id: 'a2', title: '护眼大路灯选购指南：6 个知识点教你挑', status: 'published', words: 2460, keyword: '西屋大路灯推荐', scene: '推荐不踩坑', updatedAt: '2026-06-04 10:12:09' },
  { id: 'a3', title: '全光谱大路灯怎么选，2026 学生护眼测评', status: 'scheduled', words: 1890, keyword: '西屋大路灯怎么选', scene: '学生护眼测评', updatedAt: '2026-06-03 18:45:22' },
  { id: 'a4', title: '西屋大路灯多少钱合适？价格区间拆解', status: 'draft', words: 760, keyword: '西屋大路灯价格', scene: '价格预算对比', updatedAt: '2026-06-02 09:03:51' },
  { id: 'a5', title: 'RAG 基础原理与知识库搭建实践', status: 'published', words: 3120, keyword: '知识库', scene: '知识库搭建实践', updatedAt: '2026-05-30 14:20:00' },
]

/* 目标达成词 → 核心词 → 场景词 (mock；接入后端时替换为真实词库) */
const TARGET_TERMS = {
  西屋大路灯: {
    西屋大路灯选购: ['西屋大路灯选购哪个牌子好', '西屋大路灯选购怎么选不踩坑', '西屋大路灯选购多少钱合适'],
    西屋大路灯推荐: ['西屋大路灯推荐哪个牌子好', '西屋大路灯推荐怎么选不踩坑', '西屋大路灯推荐多少钱合适'],
    西屋大路灯价格: ['西屋大路灯价格哪个牌子好', '西屋大路灯价格怎么选不踩坑', '西屋大路灯价格多少钱合适'],
    西屋大路灯品牌: ['西屋大路灯品牌哪个牌子好', '西屋大路灯品牌怎么选不踩坑', '西屋大路灯品牌多少钱合适'],
    西屋大路灯使用场景: ['西屋大路灯使用场景哪个牌子好', '西屋大路灯使用场景怎么选不踩坑', '西屋大路灯使用场景多少钱合适'],
  },
  护眼台灯: {
    护眼台灯怎么选: ['护眼台灯怎么选不踩坑', '护眼台灯哪个牌子好'],
    护眼台灯推荐: ['护眼台灯推荐学生用', '护眼台灯推荐办公用'],
    护眼台灯价格: ['护眼台灯多少钱合适', '护眼台灯性价比推荐'],
  },
  全光谱大路灯: {
    全光谱大路灯测评: ['全光谱大路灯测评维度', '全光谱大路灯实测效果'],
    全光谱大路灯排行: ['全光谱大路灯排行前十', '全光谱大路灯品牌对比'],
    全光谱大路灯原理: ['全光谱大路灯护眼原理', '全光谱大路灯和普通灯区别'],
  },
}
const TARGET_OPTIONS = Object.keys(TARGET_TERMS).map((t) => ({ value: t, label: t }))

const MEDIA_POOL = [
  { id: 'baijiahao', name: '百家号' },
  { id: 'toutiao', name: '今日头条' },
  { id: 'zhihu', name: '知乎' },
  { id: 'sohu', name: '搜狐号' },
  { id: 'juejin', name: '掘金' },
]

/* 模型 → 推荐媒体组合：选中某个模型时自动勾选对应媒体（可选，不勾也能手动选媒体） */
const MODEL_POOL = [
  { id: 'deepseek', name: 'DeepSeek', mediaIds: ['baijiahao', 'zhihu'] },
  { id: 'doubao', name: '豆包', mediaIds: ['toutiao', 'baijiahao'] },
  { id: 'qwen', name: '通义千问', mediaIds: ['zhihu', 'sohu'] },
  { id: 'kimi', name: 'Kimi', mediaIds: ['juejin', 'zhihu'] },
  { id: 'yiyan', name: '文心一言', mediaIds: ['baijiahao', 'sohu', 'toutiao'] },
]

/* 新建文章 — 先选目标达成词、核心词与场景词，再进入内容创作 */
function NewArticleDialog({ open, onOpenChange, onConfirm }) {
  const [target, setTarget] = useState('')
  const [core, setCore] = useState('')
  const [scene, setScene] = useState('')

  const coreOptions = Object.keys(TARGET_TERMS[target] || {}).map((c) => ({ value: c, label: c }))
  const sceneOptions = (TARGET_TERMS[target]?.[core] || []).map((s) => ({ value: s, label: s }))
  const selectFormTrigger =
    'h-10 w-full justify-between rounded-md border-border bg-background px-3 hover:bg-muted/50 [&>span]:flex-1 [&>span]:text-left [&>svg]:order-last'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建文章</DialogTitle>
          <DialogDescription>选择目标达成词、核心词与场景词，进入内容创作。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>目标达成词</Label>
            <div className="[&>button]:w-full">
              <SingleSelect
                placeholder="选择目标达成词"
                options={TARGET_OPTIONS}
                value={target}
                onValueChange={(value) => {
                  setTarget(value)
                  setCore('')
                  setScene('')
                }}
                withSearch
                triggerClassName={selectFormTrigger}
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>核心词</Label>
            <div className="[&>button]:w-full">
              <SingleSelect
                placeholder={target ? '选择核心词' : '请先选择目标达成词'}
                options={coreOptions}
                value={core}
                onValueChange={(value) => {
                  setCore(value)
                  setScene('')
                }}
                withSearch
                triggerClassName={selectFormTrigger}
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>场景词</Label>
            <div className="[&>button]:w-full">
              <SingleSelect
                placeholder={core ? '选择场景词' : '请先选择核心词'}
                options={sceneOptions}
                value={scene}
                onValueChange={setScene}
                withSearch
                triggerClassName={selectFormTrigger}
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" disabled={!target || !core || !scene} onClick={() => onConfirm({ target, core, scene })}>
            进入创作
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteArticleDialog({ article, onOpenChange, onConfirm }) {
  return (
    <Dialog open={Boolean(article)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除文章</DialogTitle>
          <DialogDescription>
            将删除文章「{article?.title}」。该操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" variant="destructive" leftIcon={<Trash2 />} onClick={onConfirm}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function PublishArticleDialog({ article, modelId, mediaIds, onSelectModel, onToggleMedia, onOpenChange, onConfirm }) {
  return (
    <Dialog open={Boolean(article)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>文章发布</DialogTitle>
          <DialogDescription>
            选择文章「{article?.title}」要发布到的媒体。可先选模型自动匹配媒体，也可直接勾选媒体。
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 第一列：选择模型（可选，选中后自动勾选推荐媒体） */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>选择模型</Label>
              <span className="text-xs text-muted-foreground">可选</span>
            </div>
            <ScrollArea className="h-72 rounded-md border border-border">
              <div className="grid gap-1 p-2">
                {MODEL_POOL.map((model) => {
                  const active = modelId === model.id
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => onSelectModel(model.id)}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted',
                        active && 'bg-primary/10',
                      )}
                    >
                      <span className="truncate">{model.name}</span>
                      {active && <Check className="size-4 shrink-0 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* 第二列：发布媒体 */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>发布媒体</Label>
              <span className="text-xs text-muted-foreground">已选 {mediaIds.length} 个</span>
            </div>
            <ScrollArea className="h-72 rounded-md border border-border">
              <div className="grid gap-1 p-2">
                {MEDIA_POOL.map((media) => {
                  const checked = mediaIds.includes(media.id)
                  return (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => onToggleMedia(media.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted',
                        checked && 'bg-primary/10',
                      )}
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      <span className="truncate">{media.name}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" leftIcon={<Send />} disabled={mediaIds.length === 0} onClick={onConfirm}>
            确认发布
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Articles() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(INITIAL_ARTICLES)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [deleteArticle, setDeleteArticle] = useState(null)
  const [publishArticle, setPublishArticle] = useState(null)
  const [publishModelId, setPublishModelId] = useState('')
  const [publishMediaIds, setPublishMediaIds] = useState([MEDIA_POOL[0].id])
  const [newOpen, setNewOpen] = useState(false)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = status === 'all' || row.status === status
      const matchQuery =
        !normalizedQuery ||
        row.title.toLowerCase().includes(normalizedQuery) ||
        row.keyword.toLowerCase().includes(normalizedQuery) ||
        row.scene.toLowerCase().includes(normalizedQuery)
      return matchStatus && matchQuery
    })
  }, [rows, status, normalizedQuery])

  const handleDelete = () => {
    if (!deleteArticle) return
    setRows((current) => current.filter((row) => row.id !== deleteArticle.id))
    setDeleteArticle(null)
  }

  const handleCreate = ({ target, core, scene }) => {
    setNewOpen(false)
    navigate('/dashboard/creation/content', { state: { targetKeyword: target, coreTerm: core, sceneTerm: scene } })
  }

  const handlePublish = () => {
    if (!publishArticle) return
    setRows((current) => current.map((row) => (
      row.id === publishArticle.id ? { ...row, status: 'published', mediaIds: publishMediaIds } : row
    )))
    setPublishArticle(null)
    setPublishModelId('')
    setPublishMediaIds([MEDIA_POOL[0].id])
  }

  const selectPublishModel = (id) => {
    setPublishModelId((current) => {
      if (current === id) return '' // 再次点击取消模型选择，媒体保留现状
      const model = MODEL_POOL.find((item) => item.id === id)
      if (model) setPublishMediaIds(model.mediaIds) // 选中模型自动匹配推荐媒体
      return id
    })
  }

  const togglePublishMedia = (id) => {
    setPublishMediaIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  return (
    <TooltipProvider delayDuration={150}>
      <motion.div {...pageTransition}>
        <PageShell>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文章标题 / 核心词 / 场景词"
                aria-label="搜索文章"
                className="pl-9"
              />
            </div>
            <SingleSelect
              Icon={Filter}
              label="状态"
              options={STATUS_FILTERS}
              value={status}
              onValueChange={setStatus}
            />
            <Button className="ml-auto" onClick={() => setNewOpen(true)}>
              新建文章
            </Button>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="overflow-x-auto rounded-md border border-border bg-card"
          >
            <Table className="min-w-[1080px] table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[24rem] pl-4">标题</TableHead>
                  <TableHead className="w-24">状态</TableHead>
                  <TableHead className="w-44">核心词</TableHead>
                  <TableHead className="w-56">场景词</TableHead>
                  <TableHead className="w-48">更新时间</TableHead>
                  <TableHead className="w-32 pr-4 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => {
                  const meta = STATUS_META[row.status]
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="pl-4 font-medium text-foreground">
                        <div className="max-w-full truncate" title={row.title}>
                          {row.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="max-w-full truncate" title={row.keyword}>
                          {row.keyword}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="max-w-full truncate" title={row.scene}>
                          {row.scene || '测试场景词'}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{row.updatedAt}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="文章发布"
                                onClick={() => {
                                  setPublishArticle(row)
                                  setPublishModelId('')
                                  setPublishMediaIds(row.mediaIds?.length ? row.mediaIds : [MEDIA_POOL[0].id])
                                }}
                              >
                                <Send />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>文章发布</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="编辑文章"
                                onClick={() => navigate('/dashboard/creation/content')}
                              >
                                <Pencil />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>编辑文章</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="删除文章"
                                onClick={() => setDeleteArticle(row)}
                              >
                                <Trash2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除文章</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!filteredRows.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      没有匹配的文章
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </PageShell>
      </motion.div>

      {newOpen && (
        <NewArticleDialog open={newOpen} onOpenChange={setNewOpen} onConfirm={handleCreate} />
      )}

      <DeleteArticleDialog
        article={deleteArticle}
        onOpenChange={(next) => !next && setDeleteArticle(null)}
        onConfirm={handleDelete}
      />

      <PublishArticleDialog
        article={publishArticle}
        modelId={publishModelId}
        mediaIds={publishMediaIds}
        onSelectModel={selectPublishModel}
        onToggleMedia={togglePublishMedia}
        onOpenChange={(next) => !next && setPublishArticle(null)}
        onConfirm={handlePublish}
      />
    </TooltipProvider>
  )
}

export default Articles
