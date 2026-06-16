/**
 * [INPUT]: 依赖 react state，ui/Button+Badge+Table，lucide，_PageShell，_mock，_roleForm
 * [OUTPUT]: 默认导出 SystemRoles — 角色权限页 (角色表 + 添加/编辑/查看 + 菜单权限矩阵 + 删除)
 * [POS]: /dashboard/system/roles 路由，系统设置 · 角色与菜单权限管理 (RBAC)
 * [PROTOCOL]: mock 数据来自 _mock；系统内置角色只读·禁删；有用户的角色禁删
 */
import { useState } from 'react'
import { Eye, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell } from '../_PageShell'
import {
  INITIAL_ROLES,
  INITIAL_USERS,
  DEFAULT_BUTTON_PERMISSIONS,
  MENU_KEYS,
  countRoleUsers,
} from './_mock'
import { RoleFormDialog, RoleDeleteDialog } from './_roleForm'

function grantedCount(permissions) {
  return MENU_KEYS.filter((k) => permissions[k]?.view).length
}

function grantedButtonCount(permissions) {
  return MENU_KEYS.reduce((sum, key) => {
    const available = DEFAULT_BUTTON_PERMISSIONS[key] ?? []
    return sum + available.filter((action) => permissions[key]?.actions?.[action] || permissions[key]?.manage).length
  }, 0)
}

function totalButtonCount() {
  return MENU_KEYS.reduce((sum, key) => sum + (DEFAULT_BUTTON_PERMISSIONS[key] ?? []).length, 0)
}

function RoleTable({ roles, users, permissions, onOpen, onDelete }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">角色</TableHead>
            <TableHead>可见菜单</TableHead>
            <TableHead>按钮权限</TableHead>
            <TableHead>用户数</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((r) => {
            const count = countRoleUsers(users, r.id)
            return (
              <TableRow key={r.id}>
                <TableCell className="pl-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary skeu-raised">
                      <ShieldCheck className="size-4" />
                    </span>
                    <span className="font-medium">{r.name}</span>
                    {r.system && <Badge variant="secondary">内置</Badge>}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {r.system ? '全部' : `${grantedCount(r.permissions)} / ${MENU_KEYS.length}`}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {r.system ? '全部' : `${grantedButtonCount(r.permissions)} / ${totalButtonCount()}`}
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {count}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={r.system || !permissions.canEdit ? <Eye /> : <Pencil />}
                      onClick={() => onOpen(r)}
                    >
                      {r.system || !permissions.canEdit ? '查看权限' : '配置权限'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除角色"
                      disabled={r.system || count > 0 || !permissions.canDelete}
                      onClick={() => onDelete(r)}
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

function SystemRoles() {
  const { user } = useAuth()
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [users] = useState(INITIAL_USERS)
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [deleting, setDeleting] = useState(null)
  const permissions = {
    canCreate: canAction(user, 'system.roles', 'create'),
    canEdit: canAction(user, 'system.roles', 'edit'),
    canDelete: canAction(user, 'system.roles', 'delete'),
  }

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openRole = (role) => setFormState({ open: true, mode: 'edit', initial: role })
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (role) => {
    setRoles((cur) => {
      const idx = cur.findIndex((r) => r.id === role.id)
      if (idx === -1) return [...cur, role]
      const next = cur.slice()
      next[idx] = role
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setRoles((cur) => cur.filter((r) => r.id !== deleting.id))
    setDeleting(null)
  }

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button leftIcon={<Plus />} disabled={!permissions.canCreate} onClick={openAdd}>
            添加角色
          </Button>
        </div>

        <RoleTable
          roles={roles}
          users={users}
          permissions={permissions}
          onOpen={openRole}
          onDelete={setDeleting}
        />
      </PageShell>

      <RoleFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
        readOnly={!permissions.canEdit}
      />

      <RoleDeleteDialog
        role={deleting}
        userCount={deleting ? countRoleUsers(users, deleting.id) : 0}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default SystemRoles
