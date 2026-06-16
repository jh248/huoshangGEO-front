/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Input+Label+Table，lucide，useAuth + canAction
 *          本地 _informationForm (TagChip) · _knowledgeMock (INITIAL_TAGS / TAG_PALETTE / INITIAL_INFORMATION / countInfoByTag)
 * [OUTPUT]: 默认导出 Tags — 标签管理页 (全局标签 CRUD · 名称 + 颜色 + 描述)
 * [POS]: /dashboard/knowledge/tags 路由
 * [PROTOCOL]: mock 数据来自 _knowledgeMock；按钮权限走 canAction(knowledge.tags, …)；颜色仅取 TAG_PALETTE (var(--chart-N))
 */
import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import { ColorSelector } from '@/components/ui/color-selector'
import { PageShell } from '../_PageShell'
import { TagChip } from './_informationForm'
import {
  INITIAL_TAGS,
  INITIAL_INFORMATION,
  TAG_PALETTE,
  countInfoByTag,
} from './_knowledgeMock'

const EMPTY_FORM = { name: '', color: TAG_PALETTE[0], description: '' }

function TagFormBody({ mode, initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    mode === 'edit' && initialValue
      ? { name: initialValue.name, color: initialValue.color, description: initialValue.description }
      : EMPTY_FORM,
  )
  const isEdit = mode === 'edit'
  const canSubmit = form.name.trim().length > 0
  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    const payload = {
      ...(isEdit && initialValue ? initialValue : { id: `tag-${Date.now()}` }),
      name: form.name.trim(),
      color: form.color,
      description: form.description.trim(),
    }
    onSubmit(payload)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑标签' : '添加标签'}</DialogTitle>
        <DialogDescription>
          标签用于标明信息的类型，全局共用；创作时可按标签精准取数。
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="tag-name">标签名称</Label>
          <Input
            id="tag-name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="例如：产品 / FAQ / 政策"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>标签颜色</Label>
          <ColorSelector
            colors={TAG_PALETTE}
            defaultValue={form.color}
            size="lg"
            onColorSelect={(color) => update('color', color)}
            className="py-1"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tag-desc">描述</Label>
          <Input
            id="tag-desc"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="一句话说明该标签覆盖什么类型的信息"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">预览：</span>
          <TagChip tag={{ ...form, name: form.name.trim() || '标签' }} />
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" leftIcon={isEdit ? <Pencil /> : <Plus />} disabled={!canSubmit}>
            {isEdit ? '保存修改' : '添加标签'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function TagFormDialog({ open, onOpenChange, onSubmit, mode = 'add', initialValue }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <TagFormBody
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

function TagDeleteDialog({ tag, usageCount, onOpenChange, onConfirm }) {
  if (!tag) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除标签</DialogTitle>
          <DialogDescription>
            {usageCount > 0
              ? `标签「${tag.name}」当前被 ${usageCount} 条信息使用，删除后这些信息将移除该标签。该操作不可撤销。`
              : `将删除标签「${tag.name}」。该操作不可撤销。`}
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

function Tags() {
  const { user } = useAuth()
  const [tags, setTags] = useState(INITIAL_TAGS)
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [deleting, setDeleting] = useState(null)

  const permissions = {
    canCreate: canAction(user, 'knowledge.tags', 'create'),
    canEdit: canAction(user, 'knowledge.tags', 'edit'),
    canDelete: canAction(user, 'knowledge.tags', 'delete'),
  }

  const usage = (tagId) => countInfoByTag(INITIAL_INFORMATION, tagId)

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (tag) => setFormState({ open: true, mode: 'edit', initial: tag })
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (tag) => {
    setTags((cur) => {
      const idx = cur.findIndex((t) => t.id === tag.id)
      if (idx === -1) return [...cur, tag]
      const next = cur.slice()
      next[idx] = tag
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setTags((cur) => cur.filter((t) => t.id !== deleting.id))
    setDeleting(null)
  }

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            全局标签用于标明信息类型，一条信息可打多个标签。
          </p>
          {permissions.canCreate && (
            <Button leftIcon={<Plus />} onClick={openAdd}>
              添加标签
            </Button>
          )}
        </div>

        <div className="overflow-hidden rounded-md border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">标签</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>关联信息</TableHead>
                <TableHead className="pr-4 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="pl-4">
                    <TagChip tag={tag} />
                  </TableCell>
                  <TableCell className="max-w-[24rem]">
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {tag.description || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {usage(tag.id)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      {permissions.canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Pencil />}
                          onClick={() => openEdit(tag)}
                        >
                          编辑
                        </Button>
                      )}
                      {permissions.canDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="删除标签"
                          onClick={() => setDeleting(tag)}
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
      </PageShell>

      <TagFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
      />

      <TagDeleteDialog
        tag={deleting}
        usageCount={deleting ? usage(deleting.id) : 0}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default Tags
