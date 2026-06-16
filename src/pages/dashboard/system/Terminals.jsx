/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Label+Switch+Dialog+Table，lucide，_PageShell，useAuth + canAction
 * [OUTPUT]: 默认导出 SystemTerminals — 终端管理页 (终端ID/状态/网卡地址/IP/设备信息/设备版本/创建/更新)
 * [POS]: /dashboard/system/terminals 路由，系统设置 · 接入终端设备维护
 * [PROTOCOL]: 终端由设备自注册，仅 编辑(状态)/删除，无新增；mock 数据写在顶部常量；按钮权限 canAction(system.terminals)
 */
import { useState } from 'react'
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
const INITIAL_TERMINALS = [
  {
    id: 1,
    terminalId: 'TERM-9F2A7C10',
    status: 'active',
    mac: '00:1A:2B:3C:4D:5E',
    ip: '192.168.1.24',
    deviceInfo: 'Windows 11 · Chrome 120',
    deviceVersion: 'v2.3.1',
    createdAt: '2026-01-20 17:56:49',
    updatedAt: '2026-03-09 09:55:03',
  },
  {
    id: 2,
    terminalId: 'TERM-3B81D4E9',
    status: 'active',
    mac: 'A4:5E:60:C1:22:9F',
    ip: '10.0.6.108',
    deviceInfo: 'macOS 15 · Safari 18',
    deviceVersion: 'v2.3.1',
    createdAt: '2026-02-14 10:12:30',
    updatedAt: '2026-03-08 16:02:49',
  },
  {
    id: 3,
    terminalId: 'TERM-7E0CA552',
    status: 'disabled',
    mac: '8C:85:90:11:33:7B',
    ip: '172.16.4.71',
    deviceInfo: 'Android 14 · 内置浏览器',
    deviceVersion: 'v2.2.0',
    createdAt: '2026-02-28 08:41:05',
    updatedAt: '2026-03-01 19:20:11',
  },
]

/* ============================================================================
 * TerminalEditDialog · 编辑 (终端 ID 只读，可改设备信息 / 版本 / 状态)
 * ========================================================================== */
function TerminalEditBody({ initialValue, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    terminalId: initialValue.terminalId,
    mac: initialValue.mac,
    ip: initialValue.ip,
    deviceInfo: initialValue.deviceInfo,
    deviceVersion: initialValue.deviceVersion,
    status: initialValue.status,
  }))
  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...initialValue,
      ...form,
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>编辑终端</DialogTitle>
        <DialogDescription>终端由设备自注册接入；可调整设备信息、版本与启用状态。</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="term-id">终端ID</Label>
            <Input id="term-id" value={form.terminalId} disabled className="font-mono" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="term-mac">网卡地址</Label>
            <Input
              id="term-mac"
              value={form.mac}
              onChange={(e) => update('mac', e.target.value)}
              placeholder="00:1A:2B:3C:4D:5E"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="term-ip">IP地址</Label>
            <Input
              id="term-ip"
              value={form.ip}
              onChange={(e) => update('ip', e.target.value)}
              placeholder="192.168.1.24"
              className="font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="term-ver">设备版本</Label>
            <Input
              id="term-ver"
              value={form.deviceVersion}
              onChange={(e) => update('deviceVersion', e.target.value)}
              placeholder="v2.3.1"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="term-info">设备信息</Label>
          <Input
            id="term-info"
            value={form.deviceInfo}
            onChange={(e) => update('deviceInfo', e.target.value)}
            placeholder="Windows 11 · Chrome 120"
          />
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
          <Button type="submit" leftIcon={<Pencil />}>
            保存修改
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function TerminalEditDialog({ open, onOpenChange, onSubmit, initialValue }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && initialValue && (
          <TerminalEditBody
            key={initialValue.id}
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

function TerminalDeleteDialog({ terminal, onOpenChange, onConfirm }) {
  if (!terminal) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除终端</DialogTitle>
          <DialogDescription>
            将删除终端「{terminal.terminalId}」。删除后该设备需重新注册接入。该操作不可撤销。
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

function TerminalTable({ items, permissions, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">终端ID</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>网卡地址</TableHead>
            <TableHead>IP地址</TableHead>
            <TableHead>设备信息</TableHead>
            <TableHead>设备版本</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="pl-4 font-mono text-xs text-foreground">{t.terminalId}</TableCell>
              <TableCell>
                <Switch
                  size="sm"
                  checked={t.status === 'active'}
                  disabled={!permissions.canEdit}
                  aria-label={`${t.status === 'active' ? '停用' : '启用'}终端 ${t.terminalId}`}
                  onCheckedChange={(next) => onToggleStatus(t.id, next)}
                />
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.mac}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">{t.ip}</TableCell>
              <TableCell className="text-sm text-foreground">{t.deviceInfo}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">{t.deviceVersion}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">{t.createdAt}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">{t.updatedAt}</TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex justify-end gap-2">
                  {permissions.canEdit && (
                    <Button variant="outline" size="sm" leftIcon={<Pencil />} onClick={() => onEdit(t)}>
                      编辑
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除终端"
                      onClick={() => onDelete(t)}
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

function SystemTerminals() {
  const { user } = useAuth()
  const [items, setItems] = useState(INITIAL_TERMINALS)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const permissions = {
    canEdit: canAction(user, 'system.terminals', 'edit'),
    canDelete: canAction(user, 'system.terminals', 'delete'),
  }

  const handleSubmit = (terminal) => {
    setItems((cur) => cur.map((t) => (t.id === terminal.id ? terminal : t)))
  }

  const handleDelete = () => {
    if (!deleting) return
    setItems((cur) => cur.filter((t) => t.id !== deleting.id))
    setDeleting(null)
  }

  const setStatus = (id, active) =>
    setItems((cur) =>
      cur.map((t) => (t.id === id ? { ...t, status: active ? 'active' : 'disabled' } : t)),
    )

  const keyword = query.trim().toLowerCase()
  const filtered = items.filter((t) =>
    keyword ? [t.terminalId, t.ip, t.mac, t.deviceInfo].some((f) => f.toLowerCase().includes(keyword)) : true,
  )

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索终端ID / IP / 网卡 / 设备"
              className="pl-9"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <TerminalTable
            items={filtered}
            permissions={permissions}
            onToggleStatus={setStatus}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            {keyword ? '没有匹配的终端' : '暂无数据'}
          </div>
        )}
      </PageShell>

      <TerminalEditDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        onSubmit={handleSubmit}
        initialValue={editing}
      />

      <TerminalDeleteDialog
        terminal={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SystemTerminals
