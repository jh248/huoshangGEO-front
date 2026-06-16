/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Label+Switch+Dialog+Table，lucide，_PageShell，useAuth + canAction
 * [OUTPUT]: 默认导出 SystemModels — 模型管理页 (大模型清单 CRUD：编码/名称/链接/排序/状态/创建时间)
 * [POS]: /dashboard/system/models 路由，系统设置 · 大模型平台维护
 * [PROTOCOL]: mock 数据写在模块顶部常量；按钮权限走 canAction(system.models, …)；接真后端替换 INITIAL_MODELS / 提交逻辑
 */
import { useState } from 'react'
import { Globe2, GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell } from '../_PageShell'
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import { cn } from '@/lib/utils'

/* ============================================================================
 * Mock 数据 · 真后端替换层
 * ========================================================================== */
const INITIAL_MODELS = [
  { id: 1, code: 'doubao', name: '豆包', url: 'https://www.doubao.com', sort: 1, status: 'active', createdAt: '2026-01-20 17:56:49' },
  { id: 2, code: 'deepseek', name: 'DeepSeek', url: 'https://chat.deepseek.com/', sort: 2, status: 'active', createdAt: '2026-01-20 17:56:49' },
  { id: 3, code: 'tongyi', name: '通义千问', url: 'https://www.qianwen.com/', sort: 3, status: 'active', createdAt: '2026-01-20 17:56:49' },
  { id: 8, code: 'yuanbao', name: '元宝', url: 'https://yuanbao.tencent.com/', sort: 3, status: 'active', createdAt: '2026-03-09 09:55:03' },
  { id: 4, code: 'wenxin', name: '文心一言', url: 'https://yiyan.baidu.com/', sort: 4, status: 'active', createdAt: '2026-01-20 17:56:49' },
  { id: 9, code: 'kimi', name: 'Kimi', url: 'https://www.kimi.com/', sort: 5, status: 'active', createdAt: '2026-03-09 16:02:49' },
]

const EMPTY_FORM = { code: '', name: '', url: '', sort: '', status: 'active' }

function nowText() {
  const n = new Date()
  const p = (x) => String(x).padStart(2, '0')
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`
}

/* ============================================================================
 * ModelFormBody · 添加 / 编辑共享 (key=mode-id 强制 mount 重置)
 * ========================================================================== */
function ModelFormBody({ mode, initialValue, onSubmit, onCancel }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() =>
    isEdit && initialValue
      ? {
          code: initialValue.code,
          name: initialValue.name,
          url: initialValue.url,
          sort: String(initialValue.sort ?? ''),
          status: initialValue.status,
        }
      : EMPTY_FORM,
  )

  const canSubmit = form.code.trim() && form.name.trim() && form.url.trim()
  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    const payload = {
      ...(isEdit && initialValue ? initialValue : {}),
      code: form.code.trim(),
      name: form.name.trim(),
      url: form.url.trim(),
      sort: Number(form.sort) || 0,
      status: form.status,
    }
    onSubmit(
      isEdit ? payload : { id: Date.now(), ...payload, createdAt: nowText() },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑模型' : '添加模型'}</DialogTitle>
        <DialogDescription>
          维护可监测的大模型平台；编码用于系统内唯一标识，链接指向平台首页。
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="model-code">大模型编码</Label>
            <Input
              id="model-code"
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
              placeholder="doubao"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model-name">大模型名称</Label>
            <Input
              id="model-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="豆包"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="model-url">链接</Label>
          <Input
            id="model-url"
            type="url"
            value={form.url}
            onChange={(e) => update('url', e.target.value)}
            placeholder="https://www.example.com/"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="model-sort">排序</Label>
            <Input
              id="model-sort"
              type="number"
              min="0"
              value={form.sort}
              onChange={(e) => update('sort', e.target.value)}
              placeholder="数值越小越靠前"
            />
          </div>
          <div className="grid gap-2">
            <Label>状态</Label>
            <div className="flex h-10 items-center gap-2">
              <Switch
                checked={form.status === 'active'}
                onCheckedChange={(v) => update('status', v ? 'active' : 'disabled')}
              />
              <span className="text-sm text-foreground">
                {form.status === 'active' ? '已启用' : '已停用'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" leftIcon={isEdit ? <Pencil /> : <Plus />} disabled={!canSubmit}>
            {isEdit ? '保存修改' : '添加模型'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function ModelFormDialog({ open, onOpenChange, onSubmit, mode = 'add', initialValue }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <ModelFormBody
            key={formKey}
            mode={mode}
            initialValue={initialValue}
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

function ModelDeleteDialog({ model, onOpenChange, onConfirm }) {
  if (!model) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除模型</DialogTitle>
          <DialogDescription>
            将删除模型「{model.name}」（{model.code}）。该操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button variant="destructive" leftIcon={<Trash2 />} onClick={onConfirm}>
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================================
 * ModelTable · 列表 (主键ID / 编码 / 名称 / 链接 / 排序 / 状态 / 创建时间 / 操作)
 * ========================================================================== */
function ModelTable({ models, permissions, canReorder, onReorder, onToggleStatus, onEdit, onDelete }) {
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const resetDrag = () => {
    setDragId(null)
    setOverId(null)
  }
  const handleDrop = (targetId) => {
    if (dragId != null && dragId !== targetId) onReorder(dragId, targetId)
    resetDrag()
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {canReorder && <TableHead className="w-8 pl-4" />}
            <TableHead className={canReorder ? undefined : 'pl-4'}>大模型编码</TableHead>
            <TableHead>大模型名称</TableHead>
            <TableHead>链接</TableHead>
            <TableHead>排序</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((m) => (
            <TableRow
              key={m.id}
              draggable={canReorder}
              onDragStart={
                canReorder
                  ? (e) => {
                      setDragId(m.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }
                  : undefined
              }
              onDragOver={
                canReorder
                  ? (e) => {
                      if (dragId == null) return
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                      if (overId !== m.id) setOverId(m.id)
                    }
                  : undefined
              }
              onDrop={canReorder ? () => handleDrop(m.id) : undefined}
              onDragEnd={resetDrag}
              className={cn(
                'transition-colors',
                dragId === m.id && 'opacity-50',
                overId === m.id && dragId !== m.id && 'border-t-2 border-t-primary',
              )}
            >
              {canReorder && (
                <TableCell className="cursor-grab pl-4 pr-0 text-muted-foreground active:cursor-grabbing">
                  <GripVertical className="size-4" />
                </TableCell>
              )}
              <TableCell className={cn('font-mono text-xs text-foreground', !canReorder && 'pl-4')}>
                {m.code}
              </TableCell>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  draggable={false}
                  className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"
                >
                  <Globe2 className="size-3.5 text-muted-foreground" />
                  <span className="max-w-[12rem] truncate">{m.url}</span>
                </a>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{m.sort}</TableCell>
              <TableCell>
                <Switch
                  size="sm"
                  checked={m.status === 'active'}
                  disabled={!permissions.canEdit}
                  aria-label={`${m.status === 'active' ? '停用' : '启用'}模型 ${m.name}`}
                  onCheckedChange={(next) => onToggleStatus(m.id, next)}
                />
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{m.createdAt}</TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex justify-end gap-2">
                  {permissions.canEdit && (
                    <Button variant="outline" size="sm" leftIcon={<Pencil />} onClick={() => onEdit(m)}>
                      编辑
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除模型"
                      onClick={() => onDelete(m)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SystemModels() {
  const { user } = useAuth()
  const [models, setModels] = useState(INITIAL_MODELS)
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [deleting, setDeleting] = useState(null)

  const permissions = {
    canCreate: canAction(user, 'system.models', 'create'),
    canEdit: canAction(user, 'system.models', 'edit'),
    canDelete: canAction(user, 'system.models', 'delete'),
  }

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (model) => setFormState({ open: true, mode: 'edit', initial: model })
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (model) => {
    setModels((cur) => {
      const idx = cur.findIndex((m) => m.id === model.id)
      if (idx === -1) return [...cur, model]
      const next = cur.slice()
      next[idx] = model
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setModels((cur) => cur.filter((m) => m.id !== deleting.id))
    setDeleting(null)
  }

  const handleToggleStatus = (id, active) => {
    setModels((cur) =>
      cur.map((m) => (m.id === id ? { ...m, status: active ? 'active' : 'disabled' } : m)),
    )
  }

  // 拖拽改排序：按当前排序序列移动 source 到 target 位置，再重写 sort 为 1..n
  const handleReorder = (sourceId, targetId) => {
    setModels((cur) => {
      const ordered = [...cur].sort((a, b) => a.sort - b.sort || a.id - b.id)
      const from = ordered.findIndex((m) => m.id === sourceId)
      const to = ordered.findIndex((m) => m.id === targetId)
      if (from === -1 || to === -1 || from === to) return cur
      const next = ordered.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next.map((m, i) => ({ ...m, sort: i + 1 }))
    })
  }

  const keyword = query.trim().toLowerCase()
  const filtered = models
    .filter((m) =>
      keyword ? [m.code, m.name].some((f) => f.toLowerCase().includes(keyword)) : true,
    )
    .sort((a, b) => a.sort - b.sort || a.id - b.id)

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索模型编码 / 名称"
              className="pl-9"
            />
          </div>
          <Button leftIcon={<Plus />} disabled={!permissions.canCreate} onClick={openAdd}>
            添加模型
          </Button>
        </div>

        {filtered.length > 0 ? (
          <ModelTable
            models={filtered}
            permissions={permissions}
            canReorder={permissions.canEdit && !keyword}
            onReorder={handleReorder}
            onToggleStatus={handleToggleStatus}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            没有匹配的模型
          </div>
        )}
      </PageShell>

      <ModelFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
      />

      <ModelDeleteDialog
        model={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SystemModels
