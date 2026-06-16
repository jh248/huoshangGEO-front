/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Label+Avatar+Switch+Dialog+Table，lucide，_PageShell，useAuth + canAction
 * [OUTPUT]: 默认导出 SystemMedia — 媒体管理页 (媒体平台 CRUD：类型/名称/编码/图标/状态/登录地址/主页地址)
 * [POS]: /dashboard/system/media 路由，系统设置 · 媒体平台维护
 * [PROTOCOL]: mock 数据写在模块顶部常量；按钮权限走 canAction(system.media, …)；接真后端替换 INITIAL_MEDIA / 提交逻辑
 */
import { useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

/* ============================================================================
 * Mock 数据 · 真后端替换层
 * ========================================================================== */
const INITIAL_MEDIA = [
  { id: 68, type: '自媒体', name: '掘金', code: 'juejin', icon: '', status: 'active', loginUrl: 'https://juejin.cn/', homeUrl: 'https://juejin.cn/creator/home' },
  { id: 13, type: '自媒体', name: '知乎', code: 'zhihu', icon: '', status: 'active', loginUrl: 'https://www.zhihu.com/creator', homeUrl: 'https://www.zhihu.com/creator' },
  { id: 11, type: '自媒体', name: '今日头条', code: 'toutiao', icon: '', status: 'active', loginUrl: 'https://mp.toutiao.com/auth/page/login', homeUrl: 'https://mp.toutiao.com/profile_v4/index' },
  { id: 4, type: '自媒体', name: '搜狐号', code: 'sohu', icon: '', status: 'active', loginUrl: 'https://mp.sohu.com/mpfe/v4/login', homeUrl: 'https://mp.sohu.com/mpfe/v4/contentManagement/first' },
  { id: 2, type: '自媒体', name: '百家号', code: 'baijiahao', icon: '', status: 'active', loginUrl: 'https://baijiahao.baidu.com/builder/theme/bjh/login', homeUrl: 'https://baijiahao.baidu.com/builder/rc/home' },
]

const EMPTY_FORM = {
  type: '自媒体',
  name: '',
  code: '',
  icon: '',
  loginUrl: '',
  homeUrl: '',
  status: 'active',
}

/* ============================================================================
 * MediaFormBody · 添加 / 编辑共享 (key=mode-id 强制 mount 重置)
 * ========================================================================== */
function MediaFormBody({ mode, initialValue, onSubmit, onCancel }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() =>
    isEdit && initialValue
      ? {
          type: initialValue.type,
          name: initialValue.name,
          code: initialValue.code,
          icon: initialValue.icon ?? '',
          loginUrl: initialValue.loginUrl ?? '',
          homeUrl: initialValue.homeUrl ?? '',
          status: initialValue.status,
        }
      : EMPTY_FORM,
  )

  const canSubmit = form.type.trim() && form.name.trim() && form.code.trim()
  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    const payload = {
      ...(isEdit && initialValue ? initialValue : {}),
      type: form.type.trim(),
      name: form.name.trim(),
      code: form.code.trim(),
      icon: form.icon.trim(),
      loginUrl: form.loginUrl.trim(),
      homeUrl: form.homeUrl.trim(),
      status: form.status,
    }
    onSubmit(isEdit ? payload : { id: Date.now(), ...payload })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑媒体' : '添加媒体'}</DialogTitle>
        <DialogDescription>
          维护可发布的媒体平台；编码用于系统内唯一标识，登录 / 主页地址用于跳转。
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="media-type">媒体类型</Label>
            <Input
              id="media-type"
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              placeholder="自媒体"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="media-name">媒体名称</Label>
            <Input
              id="media-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="掘金"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="media-code">媒体编码</Label>
            <Input
              id="media-code"
              value={form.code}
              onChange={(e) => update('code', e.target.value)}
              placeholder="juejin"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="media-icon">图标地址（可选）</Label>
          <Input
            id="media-icon"
            value={form.icon}
            onChange={(e) => update('icon', e.target.value)}
            placeholder="https://.../logo.png（留空则用名称首字）"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="media-login">登录地址</Label>
            <Input
              id="media-login"
              type="url"
              value={form.loginUrl}
              onChange={(e) => update('loginUrl', e.target.value)}
              placeholder="https://.../login"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="media-home">主页地址</Label>
            <Input
              id="media-home"
              type="url"
              value={form.homeUrl}
              onChange={(e) => update('homeUrl', e.target.value)}
              placeholder="https://.../home"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <span className="text-sm font-medium text-foreground">状态</span>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.status === 'active'}
              onCheckedChange={(v) => update('status', v ? 'active' : 'disabled')}
            />
            <span className="text-sm text-foreground">
              {form.status === 'active' ? '启用' : '停用'}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" leftIcon={isEdit ? <Pencil /> : <Plus />} disabled={!canSubmit}>
            {isEdit ? '保存修改' : '添加媒体'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function MediaFormDialog({ open, onOpenChange, onSubmit, mode = 'add', initialValue }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <MediaFormBody
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

function MediaDeleteDialog({ media, onOpenChange, onConfirm }) {
  if (!media) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除媒体</DialogTitle>
          <DialogDescription>
            将删除媒体「{media.name}」（{media.code}）。该操作不可撤销。
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

function UrlCell({ url }) {
  if (!url) return <span className="text-muted-foreground">—</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex max-w-[14rem] items-center truncate text-foreground hover:text-primary"
    >
      <span className="truncate">{url}</span>
    </a>
  )
}

function StatusSwitch({ active, label, disabled, onToggle }) {
  return (
    <Switch
      size="sm"
      checked={active}
      disabled={disabled}
      aria-label={`${active ? '停用' : '启用'}${label}`}
      onCheckedChange={onToggle}
    />
  )
}

/* ============================================================================
 * MediaTable · 列表 (类型 / 名称 / 编码 / 图标 / 状态 / 租户状态 / 登录地址 / 主页地址 / 操作)
 * ========================================================================== */
function MediaTable({ items, permissions, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">媒体类型</TableHead>
            <TableHead>媒体名称</TableHead>
            <TableHead>媒体编码</TableHead>
            <TableHead>图标</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>登录地址</TableHead>
            <TableHead>主页地址</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="pl-4 text-sm text-foreground">{m.type}</TableCell>
              <TableCell className="font-medium">{m.name}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{m.code}</TableCell>
              <TableCell>
                <Avatar className="size-8 rounded-md">
                  {m.icon && <AvatarImage src={m.icon} alt={m.name} />}
                  <AvatarFallback className="rounded-md text-xs font-medium">
                    {m.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>
                <StatusSwitch
                  active={m.status === 'active'}
                  label={`媒体 ${m.name}`}
                  disabled={!permissions.canEdit}
                  onToggle={(next) => onToggleStatus(m.id, next)}
                />
              </TableCell>
              <TableCell>
                <UrlCell url={m.loginUrl} />
              </TableCell>
              <TableCell>
                <UrlCell url={m.homeUrl} />
              </TableCell>
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
                      aria-label="删除媒体"
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

function SystemMedia() {
  const { user } = useAuth()
  const [items, setItems] = useState(INITIAL_MEDIA)
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [deleting, setDeleting] = useState(null)

  const permissions = {
    canCreate: canAction(user, 'system.media', 'create'),
    canEdit: canAction(user, 'system.media', 'edit'),
    canDelete: canAction(user, 'system.media', 'delete'),
  }

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (media) => setFormState({ open: true, mode: 'edit', initial: media })
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (media) => {
    setItems((cur) => {
      const idx = cur.findIndex((m) => m.id === media.id)
      if (idx === -1) return [...cur, media]
      const next = cur.slice()
      next[idx] = media
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setItems((cur) => cur.filter((m) => m.id !== deleting.id))
    setDeleting(null)
  }

  const setField = (id, key, value) =>
    setItems((cur) => cur.map((m) => (m.id === id ? { ...m, [key]: value } : m)))

  const keyword = query.trim().toLowerCase()
  const filtered = items.filter((m) =>
    keyword ? [m.name, m.code, m.type].some((f) => f.toLowerCase().includes(keyword)) : true,
  )

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索媒体名称 / 编码 / 类型"
              className="pl-9"
            />
          </div>
          <Button leftIcon={<Plus />} disabled={!permissions.canCreate} onClick={openAdd}>
            添加媒体
          </Button>
        </div>

        {filtered.length > 0 ? (
          <MediaTable
            items={filtered}
            permissions={permissions}
            onToggleStatus={(id, active) => setField(id, 'status', active ? 'active' : 'disabled')}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            没有匹配的媒体
          </div>
        )}
      </PageShell>

      <MediaFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
      />

      <MediaDeleteDialog
        media={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SystemMedia
