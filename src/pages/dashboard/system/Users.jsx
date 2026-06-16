/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Badge+Switch+Table，lucide，_PageShell，_mock，_userForm
 * [OUTPUT]: 默认导出 SystemUsers — 用户管理页 (用户账号管理；运营授权已拆分到 运营管理)
 * [POS]: /dashboard/system/users 路由，系统设置 · 用户体系管理
 * [PROTOCOL]: mock 数据来自 _mock / _customerMock；总管理员用户禁删；接真实接口替换 INITIAL_USERS / 提交逻辑
 */
import { useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import {
  INITIAL_USERS,
  INITIAL_ROLES,
} from './_mock'
import { UserFormDialog, UserDeleteDialog } from './_userForm'

function todayText() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

function StatusSwitch({ user, disabled, onToggle }) {
  const checked = user.status === 'active'
  return (
    <Switch
      size="sm"
      checked={checked}
      disabled={disabled}
      aria-label={`${checked ? '停用' : '启用'}用户 ${user.name}`}
      onCheckedChange={(next) => onToggle(user.id, next)}
    />
  )
}

function UserTable({ users, roleName, permissions, onToggleStatus, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">用户名称</TableHead>
            <TableHead>手机号码</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>所属客户主体</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const displayCompany = u.companyName || '未填写'
            const isSuper = u.roleId === 'super-admin'
            return (
              <TableRow key={u.id}>
                <TableCell className="pl-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{u.name}</p>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {u.phone || '未填写手机号'}
                </TableCell>
                <TableCell>
                  <Badge variant={isSuper ? 'default' : 'secondary'}>
                    {roleName(u.roleId)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="max-w-[18rem]">
                    <p className="truncate text-sm text-foreground">{displayCompany}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusSwitch
                    user={u}
                    disabled={!permissions.canEdit}
                    onToggle={onToggleStatus}
                  />
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {u.updatedAt}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Pencil />}
                      disabled={!permissions.canEdit}
                      onClick={() => onEdit(u)}
                    >
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除用户"
                      disabled={isSuper || !permissions.canDelete}
                      onClick={() => onDelete(u)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function SystemUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState(INITIAL_USERS)
  const [roles] = useState(INITIAL_ROLES)
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [deleting, setDeleting] = useState(null)

  const roleName = (id) => roles.find((r) => r.id === id)?.name ?? '—'
  const permissions = {
    canCreate: canAction(user, 'system.users', 'create'),
    canEdit: canAction(user, 'system.users', 'edit'),
    canDelete: canAction(user, 'system.users', 'delete'),
  }

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (user) => setFormState({ open: true, mode: 'edit', initial: user })
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (user) => {
    setUsers((cur) => {
      const idx = cur.findIndex((u) => u.id === user.id)
      if (idx === -1) return [user, ...cur]
      const next = cur.slice()
      next[idx] = user
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setUsers((cur) => cur.filter((u) => u.id !== deleting.id))
    setDeleting(null)
  }

  const handleToggleStatus = (id, active) => {
    setUsers((cur) =>
      cur.map((u) =>
        u.id === id
          ? { ...u, status: active ? 'active' : 'disabled', updatedAt: todayText() }
          : u
      )
    )
  }

  const keyword = query.trim().toLowerCase()
  const filtered = users.filter((u) => {
    const matchKw = keyword
      ? [u.name, u.phone, u.companyName].some((f) =>
          f?.toLowerCase().includes(keyword)
        )
      : true
    return matchKw
  })

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索用户名称 / 手机号 / 公司"
              className="pl-9"
            />
          </div>
          <Button leftIcon={<Plus />} disabled={!permissions.canCreate} onClick={openAdd}>
            添加用户
          </Button>
        </div>

        {filtered.length > 0 ? (
          <UserTable
            users={filtered}
            roleName={roleName}
            permissions={permissions}
            onToggleStatus={handleToggleStatus}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            没有匹配的用户
          </div>
        )}
      </PageShell>

      <UserFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        roles={roles}
        mode={formState.mode}
        initialValue={formState.initial}
      />

      <UserDeleteDialog
        user={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SystemUsers
