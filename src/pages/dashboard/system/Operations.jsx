/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Badge+Avatar+Table，lucide，_PageShell，mock-rbac，_mock，_customerMock，_operatorForm
 * [OUTPUT]: 默认导出 Operations — 运营管理页 (运营中心视图 · 一个运营负责多个客户主体 · 配置客户信息)
 * [POS]: /dashboard/system/operations 路由，系统设置 · 运营管理
 * [PROTOCOL]: 运营即用户(权限在用户管理维护)，此处只配置运营→客户主体归属；接真实接口替换 subjects 数据源与 onSubmit
 */
import { useMemo, useState } from 'react'
import { Plus, Search, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CUSTOMER_SUBJECTS } from './_customerMock'
import { OperatorAssignDialog } from './_operatorForm'

function OperatorTable({ operators, canEdit, onEdit }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">运营负责人</TableHead>
            <TableHead>负责客户主体</TableHead>
            <TableHead>客户主体数</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operators.map(({ user, customers }) => (
            <TableRow key={user.id}>
              <TableCell className="pl-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex max-w-[28rem] flex-wrap gap-1">
                  {customers.map((customer) => (
                    <Badge key={customer.id} variant="outline" className="font-normal">
                      {customer.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {customers.length}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Pencil />}
                  disabled={!canEdit}
                  onClick={() => onEdit(user)}
                >
                  编辑
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function Operations() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [subjects, setSubjects] = useState(CUSTOMER_SUBJECTS)
  const [dialog, setDialog] = useState(null) // { mode, operatorId? }

  const canCreate = canAction(user, 'system.operations', 'create')
  const canEdit = canAction(user, 'system.operations', 'edit')

  const userById = (id) => INITIAL_USERS.find((item) => item.id === id)

  // 运营中心聚合 · 一个运营 → 其负责的多个客户主体
  const operators = useMemo(() => {
    const ids = [...new Set(subjects.flatMap((s) => s.operatorUserIds))]
    return ids
      .map((id) => ({
        user: userById(id),
        customers: subjects.filter((s) => s.operatorUserIds.includes(id)),
      }))
      .filter((o) => o.user)
  }, [subjects])

  const keyword = query.trim().toLowerCase()
  const filtered = keyword
    ? operators.filter(({ user: op, customers }) =>
        [op.name, op.email, ...customers.flatMap((c) => [c.name, c.website])].some(
          (field) => field?.toLowerCase().includes(keyword),
        ),
      )
    : operators

  // 可被指派为运营的用户 = 启用用户
  const operatorOptions = INITIAL_USERS.filter((u) => u.status === 'active')

  // 保存归属 · 选中则确保含该运营，未选中则移除
  const applyAssignment = (operatorId, customerIds) => {
    const picked = new Set(customerIds)
    setSubjects((prev) =>
      prev.map((s) => {
        const has = s.operatorUserIds.includes(operatorId)
        const should = picked.has(s.id)
        if (has === should) return s
        return {
          ...s,
          operatorUserIds: should
            ? [...s.operatorUserIds, operatorId]
            : s.operatorUserIds.filter((id) => id !== operatorId),
        }
      }),
    )
  }

  const dialogOperator = dialog?.operatorId ? userById(dialog.operatorId) : null
  const dialogInitialIds = dialog?.operatorId
    ? subjects.filter((s) => s.operatorUserIds.includes(dialog.operatorId)).map((s) => s.id)
    : []

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索运营 / 客户主体"
            className="pl-9"
          />
        </div>
        <Button
          leftIcon={<Plus />}
          disabled={!canCreate}
          onClick={() => setDialog({ mode: 'add' })}
        >
          配置运营客户
        </Button>
      </div>

      {filtered.length > 0 ? (
        <OperatorTable
          operators={filtered}
          canEdit={canEdit}
          onEdit={(op) => setDialog({ mode: 'edit', operatorId: op.id })}
        />
      ) : (
        <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          没有匹配的运营
        </div>
      )}

      <OperatorAssignDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        mode={dialog?.mode ?? 'add'}
        operator={dialogOperator}
        operatorOptions={operatorOptions}
        customers={subjects}
        initialCustomerIds={dialogInitialIds}
        onSubmit={({ operatorId, customerIds }) =>
          applyAssignment(operatorId, customerIds)
        }
      />
    </PageShell>
  )
}

export default Operations
