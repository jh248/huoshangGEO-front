/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Input+Label+SingleSelect+Switch+Badge，lucide，_mock COMPANIES，_customerMock CUSTOMER_SUBJECTS
 * [OUTPUT]: 命名导出 UserFormDialog (添加/编辑共享) + UserDeleteDialog
 * [POS]: pages/dashboard/system 私有，被 Users.jsx 消费
 * [PROTOCOL]: 表单 key=mode-id 强制 mount 重置；总管理员用户锁角色 (禁降级)、禁删；接真实接口替换 onSubmit
 */
import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
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
import { SingleSelect } from '@/components/ui/single-select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { COMPANIES } from './_mock'
import { CUSTOMER_SUBJECTS } from './_customerMock'

const EMPTY_FORM = {
  name: '',
  phone: '',
  roleId: '',
  customerId: '',
  companyIds: [],
  status: 'active',
}

function customerForUser(user) {
  return CUSTOMER_SUBJECTS.find((customer) => customer.name === user?.companyName) ?? null
}

function companyIdForCustomer(customer) {
  return COMPANIES.find((company) => company.name === customer?.name)?.id ?? customer?.id
}

function normalizedWebsite(website) {
  if (!website) return ''
  return /^https?:\/\//.test(website) ? website : `https://${website}`
}

function UserFormBody({ mode, initialValue, roles, onSubmit, onCancel }) {
  const [form, setForm] = useState(() =>
    mode === 'edit' && initialValue
      ? {
          name: initialValue.name,
          phone: initialValue.phone ?? '',
          roleId: initialValue.roleId,
          customerId: customerForUser(initialValue)?.id ?? '',
          companyIds: [...initialValue.companyIds],
          status: initialValue.status,
        }
      : EMPTY_FORM,
  )

  const isEdit = mode === 'edit'
  const lockRole = isEdit && initialValue?.roleId === 'super-admin'
  const canSubmit = form.name.trim() && form.phone.trim() && form.roleId && form.customerId

  const update = (key, value) => setForm((c) => ({ ...c, [key]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    const today = new Date().toLocaleDateString('zh-CN')
    const name = form.name.trim()
    const selectedCustomer = CUSTOMER_SUBJECTS.find((customer) => customer.id === form.customerId)
    const selectedCompanyId = companyIdForCustomer(selectedCustomer)
    const payload = {
      ...(isEdit && initialValue ? initialValue : {}),
      name,
      phone: form.phone.trim(),
      companyName: selectedCustomer?.name ?? '',
      companyDescription: selectedCustomer?.dataScope ?? '',
      companyWebsite: normalizedWebsite(selectedCustomer?.website),
      roleId: form.roleId,
      companyIds: selectedCompanyId ? [selectedCompanyId] : form.companyIds,
      status: form.status,
      avatar: name[0]?.toUpperCase() ?? 'U',
      updatedAt: today,
    }
    onSubmit(isEdit ? payload : { id: `${Date.now()}`, ...payload })
  }

  const roleName = roles.find((r) => r.id === form.roleId)?.name ?? '—'

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑用户' : '添加用户'}</DialogTitle>
        <DialogDescription>
          为成员分配角色与账号状态。
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="user-name">用户名称</Label>
            <Input
              id="user-name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="请输入用户名称"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="user-phone">手机号码</Label>
            <Input
              id="user-phone"
              type="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="138 0000 0000"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>角色权限</Label>
          {lockRole ? (
            <div className="flex h-10 items-center gap-2">
              <Badge>{roleName}</Badge>
              <span className="text-xs text-muted-foreground">
                系统总管理员不可降级
              </span>
            </div>
          ) : (
            <SingleSelect
              placeholder="选择角色"
              value={form.roleId || undefined}
              onValueChange={(v) => update('roleId', v)}
              options={roles.map((r) => ({ value: r.id, label: r.name }))}
              triggerClassName="w-full h-10 rounded-md"
            />
          )}
        </div>

        <div className="grid gap-2">
          <Label>客户主体</Label>
          <SingleSelect
            placeholder="选择客户主体"
            value={form.customerId || undefined}
            onValueChange={(v) => update('customerId', v)}
            options={CUSTOMER_SUBJECTS.map((customer) => ({
              value: customer.id,
              label: customer.name,
            }))}
            triggerClassName="w-full h-10 rounded-md"
            contentClassName="w-[var(--radix-popover-trigger-width)]"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">账号状态</p>
            <p className="text-xs text-muted-foreground">
              停用后该用户无法登录控制台
            </p>
          </div>
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
          <Button
            type="submit"
            leftIcon={isEdit ? <Pencil /> : <Plus />}
            disabled={!canSubmit}
          >
            {isEdit ? '保存修改' : '添加用户'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function UserFormDialog({ open, onOpenChange, onSubmit, roles, mode = 'add', initialValue }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <UserFormBody
            key={formKey}
            mode={mode}
            initialValue={initialValue}
            roles={roles}
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

export function UserDeleteDialog({ user, onOpenChange, onConfirm }) {
  if (!user) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除用户</DialogTitle>
          <DialogDescription>
            将删除用户「{user.name}」（{user.phone || '未填写手机号'}）。该操作不可撤销。
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
