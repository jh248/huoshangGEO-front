/**
 * [INPUT]: 依赖 react state/memo/effect、framer-motion、ui/Button/Input/Textarea/Label/SingleSelect/Dialog/Table、PageShell、lib/motion、cn
 * [OUTPUT]: 默认导出 Prompts — Prompt 管理列表 (Key/名称/描述/最新版本/最近提交人/提交时间 + 搜索 + 创建人筛选 + 创建/编辑/删除)
 * [POS]: /dashboard/creation/prompts 路由 · 创作中心提示词管理
 * [PROTOCOL]: 本地 mock 数据仅作前端原型；接入后端时替换 INITIAL_PROMPTS 与增删逻辑
 */
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Pencil, Search, Trash2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
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
import { cn } from '@/lib/utils'

const INITIAL_PROMPTS = [
  { id: 'p1', key: 'seed_long_post', name: '护眼大路灯种草长文', description: '围绕核心词撰写 1500 字种草长文，含选购维度与场景化推荐', version: 'v3', submitter: '张运营', updatedAt: '2026-06-05 11:20:08' },
  { id: 'p2', key: 'title_rewrite', name: '标题党改写器', description: '基于正文核心卖点生成 5 个高点击率标题', version: 'v2', submitter: '李文案', updatedAt: '2026-06-04 16:02:33' },
  { id: 'p3', key: 'geo_keyword_expand', name: 'GEO 关键词扩写', description: '围绕目标达成词扩展 10 个长尾问题词', version: 'v1', submitter: '张运营', updatedAt: '2026-06-03 09:45:12' },
  { id: 'p4', key: 'colloquial_rewrite', name: '口语化场景改写', description: '把段落改写成贴近学生家长的口语化表达', version: 'v5', submitter: '王编辑', updatedAt: '2026-06-02 14:31:50' },
  { id: 'p5', key: 'one_line_summary', name: '一句话摘要', description: '用一句不超过 40 字的话概括全文核心结论', version: 'v1', submitter: '李文案', updatedAt: '2026-05-31 18:10:00' },
]

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function nowStamp() {
  const d = new Date()
  return `${d.getFullYear()}-${padDatePart(d.getMonth() + 1)}-${padDatePart(d.getDate())} ${padDatePart(d.getHours())}:${padDatePart(d.getMinutes())}:${padDatePart(d.getSeconds())}`
}

/* 带字数计数的字段 */
function CountedField({ label, required, value, onChange, max, placeholder, textarea = false, readOnly = false, id }) {
  const Comp = textarea ? Textarea : Input
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <div className="relative">
        <Comp
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, max))}
          maxLength={max}
          placeholder={placeholder}
          readOnly={readOnly}
          className={cn(textarea ? 'min-h-32 pb-6' : 'pr-16', readOnly && 'opacity-70')}
        />
        <span
          className={cn(
            'pointer-events-none absolute text-xs tabular-nums text-muted-foreground',
            textarea ? 'bottom-2 right-3' : 'right-3 top-1/2 -translate-y-1/2',
          )}
        >
          {value.length}/{max}
        </span>
      </div>
    </div>
  )
}

function PromptFormDialog({ open, prompt, onOpenChange, onSubmit }) {
  const isEdit = Boolean(prompt)
  const [name, setName] = useState(() => prompt?.name ?? '')
  const [description, setDescription] = useState(() => prompt?.description ?? '')

  const canSubmit = Boolean(name.trim())

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({ name: name.trim(), description: description.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑提示词' : '创建提示词'}</DialogTitle>
          <DialogDescription className="sr-only">填写提示词名称与描述</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <CountedField
            id="prompt-name"
            label="提示词名称"
            required
            value={name}
            onChange={setName}
            max={100}
            placeholder="请输入提示词名称"
          />
          <CountedField
            id="prompt-desc"
            label="提示词描述"
            value={description}
            onChange={setDescription}
            max={500}
            placeholder="输入描述，帮你生成简版提示词；不填则不生成"
            textarea
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              确认
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeletePromptDialog({ prompt, onOpenChange, onConfirm }) {
  return (
    <Dialog open={Boolean(prompt)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除提示词</DialogTitle>
          <DialogDescription>
            将删除「{prompt?.name}」。该操作不可撤销。
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

function Prompts() {
  const navigate = useNavigate()
  const [rows, setRows] = useState(INITIAL_PROMPTS)
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deletePrompt, setDeletePrompt] = useState(null)

  const normalizedQuery = query.trim().toLowerCase()
  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(normalizedQuery))
  }, [rows, normalizedQuery])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (row) => {
    navigate(`/dashboard/creation/prompts/${row.id}`, { state: { prompt: row } })
  }

  const handleSubmit = (value) => {
    if (editing) {
      setRows((current) =>
        current.map((row) =>
          row.id === editing.id ? { ...row, ...value, updatedAt: nowStamp() } : row,
        ),
      )
    } else {
      const id = `p-${Date.now()}`
      setRows((current) => [
        { id, version: '-', submitter: '-', updatedAt: nowStamp(), ...value },
        ...current,
      ])
      navigate(`/dashboard/creation/prompts/${id}`, { state: { name: value.name } })
    }
  }

  const handleDelete = () => {
    if (!deletePrompt) return
    setRows((current) => current.filter((row) => row.id !== deletePrompt.id))
    setDeletePrompt(null)
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
                placeholder="搜索提示词名称"
                aria-label="搜索提示词"
                className="pl-9"
              />
            </div>
            <Button className="ml-auto" onClick={openAdd}>
              创建提示词
            </Button>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-md border border-border bg-card"
          >
            <Table className="min-w-[720px] table-fixed">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[18rem] pl-4">提示词名称</TableHead>
                  <TableHead className="w-28">最新版本</TableHead>
                  <TableHead className="w-56">更新时间</TableHead>
                  <TableHead className="w-24 pr-4 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-4 font-medium text-foreground">
                      <div className="max-w-full truncate" title={row.name}>
                        {row.name}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{row.version}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{row.updatedAt}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="编辑提示词" onClick={() => openEdit(row)}>
                          <Pencil />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="删除提示词" onClick={() => setDeletePrompt(row)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      没有匹配的提示词
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </PageShell>
      </motion.div>

      {formOpen && (
        <PromptFormDialog
          key={editing?.id ?? 'new'}
          open={formOpen}
          prompt={editing}
          onOpenChange={setFormOpen}
          onSubmit={handleSubmit}
        />
      )}

      <DeletePromptDialog
        prompt={deletePrompt}
        onOpenChange={(next) => !next && setDeletePrompt(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default Prompts
