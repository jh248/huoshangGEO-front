/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Badge+Table+Dialog+Label+SingleSelect，lucide，_PageShell，_customerMock，lib/mock-rbac
 * [OUTPUT]: 默认导出 SystemCustomers — 客户管理页 (客户主体 CRUD 设计稿 · 企业/个人/内部主体 + 联系人 + 运营负责人)
 * [POS]: /dashboard/system/customers 路由，系统设置 · 客户主体管理
 * [PROTOCOL]: mock 数据来自 _customerMock / mock-rbac；接真实接口替换 CUSTOMER_SUBJECTS 与提交逻辑
 */
import { useState } from 'react'
import { CalendarDays, Pencil, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MultiSelect } from '@/components/ui/multi-select'
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
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import { INITIAL_USERS } from './_mock'
import {
  CUSTOMER_SUBJECTS,
  CUSTOMER_TYPE_META,
} from './_customerMock'

const CUSTOMER_TYPE_OPTIONS = Object.entries(CUSTOMER_TYPE_META)
  .filter(([value]) => value !== 'internal')
  .map(([value, meta]) => ({ value, label: meta.label }))

const EMPTY_CUSTOMER_FORM = {
  name: '',
  website: '',
  type: 'company',
  contactUserIds: [],
  contactName: '',
  contactPhone: '',
  operatorUserId: 'none',
  serviceStatus: 'active',
  serviceStartsAt: '',
  serviceExpiresAt: '',
}

function normalizeWebsite(value) {
  return value.trim().replace(/^https?:\/\//, '')
}

function parseDateText(value) {
  const match = String(value ?? '').match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  if (!year || !month || !day) return null
  return { year, month: month - 1, day }
}

function formatDateText(ymd) {
  if (!ymd) return ''
  return `${ymd.year}/${String(ymd.month + 1).padStart(2, '0')}/${String(ymd.day).padStart(2, '0')}`
}

function ymdToTime(ymd) {
  return new Date(ymd.year, ymd.month, ymd.day).getTime()
}

function normalizeRange(start, end) {
  if (!start || !end) return { start, end }
  return ymdToTime(start) <= ymdToTime(end)
    ? { start, end }
    : { start: end, end: start }
}

function servicePeriodLabel(customer) {
  const start = customer.serviceStartsAt
  const end = customer.serviceExpiresAt
  if (start && end) return `${start} - ${end}`
  if (start) return `${start} 起`
  return end || '未设置'
}

function dataScopeFor(type) {
  return type === 'individual' ? '个人账号 GEO 数据' : '品牌 GEO 数据'
}

function contactFromCustomer(customer, users) {
  const linkedUserIds = customer?.contactUserIds?.length
    ? customer.contactUserIds
    : customer?.contactUserId
    ? [customer.contactUserId]
    : []
  const linkedUsers = linkedUserIds
    .map((id) => users.find((item) => item.id === id))
    .filter(Boolean)
  const fallbackName = linkedUsers.map((item) => item.name).join('、')
  const fallbackPhone = linkedUsers.map((item) => item.phone).filter(Boolean).join('、')
  return {
    userIds: linkedUserIds,
    name: customer?.contactName ?? fallbackName,
    phone: customer?.contactPhone ?? fallbackPhone,
  }
}

function formFromCustomer(customer, users = []) {
  if (!customer) return EMPTY_CUSTOMER_FORM
  const contact = contactFromCustomer(customer, users)
  return {
    name: customer.name ?? '',
    website: customer.website ?? '',
    type: customer.type === 'internal' ? 'company' : customer.type,
    contactUserIds: contact.userIds,
    contactName: contact.name,
    contactPhone: contact.phone,
    operatorUserId: customer.operatorUserIds?.[0] ?? 'none',
    serviceStatus: customer.serviceStatus === 'internal' ? 'active' : customer.serviceStatus,
    serviceStartsAt: customer.serviceStartsAt ?? '',
    serviceExpiresAt: customer.serviceExpiresAt === '未设置' ? '' : customer.serviceExpiresAt ?? '',
  }
}

function ServicePeriodPicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const range = {
    start: parseDateText(value.serviceStartsAt),
    end: parseDateText(value.serviceExpiresAt),
  }
  const label =
    value.serviceStartsAt && value.serviceExpiresAt
      ? `${value.serviceStartsAt} - ${value.serviceExpiresAt}`
      : value.serviceStartsAt
      ? `${value.serviceStartsAt} 起`
      : value.serviceExpiresAt || '请选择服务起止时间'

  const handleSelect = (ymd) => {
    if (!range.start || range.end) {
      onChange({ serviceStartsAt: formatDateText(ymd), serviceExpiresAt: '' })
      return
    }

    const next = normalizeRange(range.start, ymd)
    onChange({
      serviceStartsAt: formatDateText(next.start),
      serviceExpiresAt: formatDateText(next.end),
    })
    setOpen(false)
  }

  const clearRange = () => {
    onChange({ serviceStartsAt: '', serviceExpiresAt: '' })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-start rounded-md px-3 font-normal"
          leftIcon={<CalendarDays />}
        >
          <span className={!value.serviceStartsAt && !value.serviceExpiresAt ? 'text-muted-foreground' : undefined}>
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <Calendar mode="range" range={range} onSelect={handleSelect} />
        <div className="flex items-center justify-between border-t border-border pt-2">
          <p className="text-xs text-muted-foreground">先选开始日期，再选结束日期</p>
          <Button type="button" variant="ghost" size="sm" onClick={clearRange}>
            清空
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function CustomerFormDialog({ open, onOpenChange, users, onSubmit, mode = 'add', initialValue }) {
  const [form, setForm] = useState(() => formFromCustomer(initialValue, users))
  const isEdit = mode === 'edit'

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) setForm(EMPTY_CUSTOMER_FORM)
    onOpenChange(nextOpen)
  }

  const canSubmit = Boolean(form.name.trim() && form.website.trim())
  const contactUserOptions = users.map((item) => ({ value: item.id, label: `${item.name} · ${item.phone}` }))
  const operatorUserOptions = [
    { value: 'none', label: '暂不绑定' },
    ...contactUserOptions,
  ]
  const selectedContactUsers = form.contactUserIds
    .map((id) => users.find((item) => item.id === id))
    .filter(Boolean)
  const selectedContactPhones = selectedContactUsers
    .map((item) => item.phone)
    .filter(Boolean)
    .join('、')

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateContactUsers = (value) =>
    setForm((current) => ({
      ...current,
      contactUserIds: value,
      contactName: value
        .map((id) => users.find((item) => item.id === id)?.name)
        .filter(Boolean)
        .join('、'),
      contactPhone: value
        .map((id) => users.find((item) => item.id === id)?.phone)
        .filter(Boolean)
        .join('、'),
    }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      id: initialValue?.id ?? `c-${Date.now()}`,
      name: form.name.trim(),
      type: form.type,
      website: normalizeWebsite(form.website),
      contactUserId: form.contactUserIds[0] ?? null,
      contactUserIds: form.contactUserIds,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      operatorUserIds: form.operatorUserId === 'none' ? [] : [form.operatorUserId],
      serviceStatus: form.serviceStatus,
      serviceStartsAt: form.serviceStartsAt,
      serviceExpiresAt: form.serviceExpiresAt || '未设置',
      dataScope: dataScopeFor(form.type),
    })
    setForm(EMPTY_CUSTOMER_FORM)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑客户主体' : '新增客户主体'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '更新客户主体信息、联系人与运营负责人。' : '创建企业或个人客户主体，并绑定联系人与运营负责人。'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="customer-name">客户名称</Label>
              <Input
                id="customer-name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="请输入客户名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer-website">官网 / 主页</Label>
              <Input
                id="customer-website"
                value={form.website}
                onChange={(event) => update('website', event.target.value)}
                placeholder="www.example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label>客户类型</Label>
              <SingleSelect
                options={CUSTOMER_TYPE_OPTIONS}
                value={form.type}
                onValueChange={(value) => update('type', value)}
                triggerClassName="h-10 w-full justify-between rounded-md border-border bg-background px-3 hover:bg-muted/50 [&>span]:flex-1 [&>span]:text-left [&>svg]:order-last"
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
            <div className="grid gap-2">
              <Label>客户联系人</Label>
              <MultiSelect
                options={contactUserOptions}
                value={form.contactUserIds}
                onValueChange={updateContactUsers}
                withSearch
                allLabel="全部用户"
                placeholder="请选择客户联系人"
                triggerClassName="h-10 w-full justify-between rounded-md border-border bg-background px-3 hover:bg-muted/50 [&>span:first-of-type]:hidden [&>span:nth-of-type(2)]:hidden [&>span:nth-of-type(3)]:rounded-none [&>span:nth-of-type(3)]:bg-transparent [&>span:nth-of-type(3)]:p-0 [&>span:nth-of-type(3)]:text-sm [&>span:nth-of-type(3)]:font-normal"
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
            <div className="grid gap-2">
              <Label>客户联系人手机号</Label>
              <Input
                value={selectedContactPhones}
                readOnly
                placeholder="选择联系人后自动带出"
              />
            </div>
            <div className="grid gap-2">
              <Label>运营负责人</Label>
              <SingleSelect
                options={operatorUserOptions}
                value={form.operatorUserId}
                onValueChange={(value) => update('operatorUserId', value)}
                withSearch
                triggerClassName="h-10 w-full justify-between rounded-md border-border bg-background px-3 hover:bg-muted/50 [&>span]:flex-1 [&>span]:text-left [&>svg]:order-last"
                contentClassName="w-[var(--radix-popover-trigger-width)]"
              />
            </div>
            <div className="grid gap-2">
              <Label>服务时长</Label>
              <ServicePeriodPicker
                value={form}
                onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {isEdit ? '保存修改' : '确认新增'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CustomerTable({ customers, users, permissions, onEdit }) {
  const userById = (id) => users.find((item) => item.id === id)

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">客户名称</TableHead>
            <TableHead>客户联系人</TableHead>
            <TableHead>运营负责人</TableHead>
            <TableHead>服务时长</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => {
            const contact = contactFromCustomer(customer, users)
            const operators = customer.operatorUserIds.map(userById).filter(Boolean)

            return (
              <TableRow key={customer.id}>
                <TableCell className="pl-4">
                  <div className="max-w-[16rem]">
                    <p className="truncate font-medium">{customer.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{customer.website}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {contact.name || contact.phone ? (
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{contact.name || '未填写姓名'}</p>
                      <p className="truncate text-xs text-muted-foreground">{contact.phone || '未填写手机号'}</p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">未绑定用户</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex max-w-[14rem] flex-wrap gap-1">
                    {operators.length > 0 ? (
                      operators.map((operator) => (
                        <Badge key={operator.id} variant="outline" className="font-normal">
                          {operator.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">无代运营</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {servicePeriodLabel(customer)}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pencil />}
                    disabled={!permissions.canEdit}
                    onClick={() => onEdit(customer)}
                  >
                    编辑
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function SystemCustomers() {
  const { user } = useAuth()
  const [users] = useState(INITIAL_USERS)
  const [customers, setCustomers] = useState(CUSTOMER_SUBJECTS)
  const [query, setQuery] = useState('')
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })

  const permissions = {
    canCreate: canAction(user, 'system.customers', 'create'),
    canEdit: canAction(user, 'system.customers', 'edit'),
  }

  const keyword = query.trim().toLowerCase()
  const filteredCustomers = customers.filter((customer) => {
    if (!keyword) return true
    const type = CUSTOMER_TYPE_META[customer.type]
    const operatorNames = customer.operatorUserIds
      .map((id) => users.find((item) => item.id === id)?.name)
      .filter(Boolean)
      .join(' ')
    const contact = contactFromCustomer(customer, users)
    return [
      customer.name,
      customer.website,
      customer.dataScope,
      type.label,
      contact.name,
      contact.phone,
      operatorNames,
    ].some((field) => field?.toLowerCase().includes(keyword))
  })

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (customer) => setFormState({ open: true, mode: 'edit', initial: customer })
  const closeForm = (open) => setFormState((current) => ({ ...current, open }))
  const handleSubmit = (customer) => {
    setCustomers((current) => {
      const exists = current.some((item) => item.id === customer.id)
      if (!exists) return [customer, ...current]
      return current.map((item) => (item.id === customer.id ? customer : item))
    })
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索客户 / 联系人 / 运营"
            className="pl-9"
          />
        </div>
        <Button leftIcon={<Plus />} disabled={!permissions.canCreate} onClick={openAdd}>
          新增客户主体
        </Button>
      </div>

      {filteredCustomers.length > 0 ? (
        <CustomerTable
          customers={filteredCustomers}
          users={users}
          permissions={permissions}
          onEdit={openEdit}
        />
      ) : (
        <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          没有匹配的客户主体
        </div>
      )}
      <CustomerFormDialog
        key={formState.initial?.id ?? formState.mode}
        open={formState.open}
        onOpenChange={closeForm}
        users={users}
        mode={formState.mode}
        initialValue={formState.initial}
        onSubmit={handleSubmit}
      />
    </PageShell>
  )
}

export default SystemCustomers
