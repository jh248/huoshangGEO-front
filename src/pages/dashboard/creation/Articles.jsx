/**
 * [INPUT]: 依赖 react state/memo、framer-motion、react-router useNavigate、ui/Button/Input/Badge/Dialog/Table、PageShell、lib/motion
 * [OUTPUT]: 默认导出 Articles — 文章列表 (表格 标题/状态/字数/核心词/更新 + 搜索 + 状态筛选 + 新建/编辑/删除)
 * [POS]: /dashboard/creation/articles 路由 · 创作中心文章列表
 * [PROTOCOL]: 本地 mock 数据仅作前端原型；接入后端时替换 INITIAL_ARTICLES 与增删逻辑
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { SingleSelect } from '@/components/ui/single-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell } from '../_PageShell'
import { fadeInUp, pageTransition } from '@/lib/motion'

const STATUS_META = {
  published: { label: '已发布', variant: 'default' },
  scheduled: { label: '准备发布', variant: 'accent' },
  draft: { label: '草稿', variant: 'secondary' },
}

const STATUS_FILTERS = [
  { value: 'all', label: '全部' },
  { value: 'published', label: '已发布' },
  { value: 'scheduled', label: '准备发布' },
  { value: 'draft', label: '草稿' },
]

const INITIAL_ARTICLES = [
  { id: 'a1', title: '知识库调研', status: 'draft', words: 1280, keyword: '西屋大路灯选购', updatedAt: '2026-06-05 16:28:31' },
  { id: 'a2', title: '护眼大路灯选购指南：6 个知识点教你挑', status: 'published', words: 2460, keyword: '西屋大路灯推荐', updatedAt: '2026-06-04 10:12:09' },
  { id: 'a3', title: '全光谱大路灯怎么选，2026 学生护眼测评', status: 'scheduled', words: 1890, keyword: '西屋大路灯怎么选', updatedAt: '2026-06-03 18:45:22' },
  { id: 'a4', title: '西屋大路灯多少钱合适？价格区间拆解', status: 'draft', words: 760, keyword: '西屋大路灯价格', updatedAt: '2026-06-02 09:03:51' },
  { id: 'a5', title: 'RAG 基础原理与知识库搭建实践', status: 'published', words: 3120, keyword: '知识库', updatedAt: '2026-05-30 14:20:00' },
]

/* 目标达成词 → 核心词 (mock；接入后端时替换为真实词库) */
const TARGET_TERMS = {
  西屋大路灯: ['西屋大路灯选购', '西屋大路灯推荐', '西屋大路灯价格', '西屋大路灯品牌', '西屋大路灯使用场景'],
  护眼台灯: ['护眼台灯怎么选', '护眼台灯推荐', '护眼台灯价格'],
  全光谱大路灯: ['全光谱大路灯测评', '全光谱大路灯排行', '全光谱大路灯原理'],
}
const TARGET_OPTIONS = Object.keys(TARGET_TERMS).map((t) => ({ value: t, label: t }))

/* 新建文章 — 先选目标达成词与核心词，再进入内容创作 */
function NewArticleDialog({ open, onOpenChange, onConfirm }) {
  const [target, setTarget] = useState('')
  const [core, setCore] = useState('')

  const coreOptions = (TARGET_TERMS[target] || []).map((c) => ({ value: c, label: c }))
  const selectFormTrigger =
    'h-10 w-full justify-between rounded-md border-border bg-background px-3 hover:bg-muted/50 [&>span]:flex-1 [&>span]:text-left [&>svg]:order-last'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建文章</DialogTitle>
          <DialogDescription>选择目标达成词与核心词，进入内容创作。</DialogDescription>
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
                onValueChange={setCore}
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
          <Button type="button" disabled={!target || !core} onClick={() => onConfirm({ target, core })}>
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

function Articles() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(INITIAL_ARTICLES)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [deleteArticle, setDeleteArticle] = useState(null)
  const [newOpen, setNewOpen] = useState(false)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchStatus = status === 'all' || row.status === status
      const matchQuery =
        !normalizedQuery ||
        row.title.toLowerCase().includes(normalizedQuery) ||
        row.keyword.toLowerCase().includes(normalizedQuery)
      return matchStatus && matchQuery
    })
  }, [rows, status, normalizedQuery])

  const handleDelete = () => {
    if (!deleteArticle) return
    setRows((current) => current.filter((row) => row.id !== deleteArticle.id))
    setDeleteArticle(null)
  }

  const handleCreate = ({ target, core }) => {
    setNewOpen(false)
    navigate('/dashboard/creation/content', { state: { targetKeyword: target, coreTerm: core } })
  }

  return (
    <>
      <motion.div {...pageTransition}>
        <PageShell>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文章标题 / 核心词"
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
            className="overflow-hidden rounded-md border border-border bg-card"
          >
            <Table className="min-w-[1040px] table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[45%] pl-4">标题</TableHead>
                  <TableHead className="w-[9%]">状态</TableHead>
                  <TableHead className="w-[18%]">核心词</TableHead>
                  <TableHead className="w-[18%]">更新时间</TableHead>
                  <TableHead className="w-[10%] pr-4 text-right">操作</TableHead>
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
                      <TableCell className="tabular-nums text-muted-foreground">{row.updatedAt}</TableCell>
                      <TableCell className="pr-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="编辑文章"
                            onClick={() => navigate('/dashboard/creation/content')}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="删除文章"
                            onClick={() => setDeleteArticle(row)}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!filteredRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
    </>
  )
}

export default Articles
