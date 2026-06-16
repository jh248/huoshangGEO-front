/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Label+Checkbox+SingleSelect+Badge+ScrollArea，lucide，_customerMock CUSTOMER_TYPE_META
 * [OUTPUT]: 命名导出 OperatorAssignDialog — 运营「负责客户主体」配置弹窗 (添加/编辑共享)
 * [POS]: pages/dashboard/system 私有，被 Operations.jsx 消费
 * [PROTOCOL]: 仅配置运营→客户主体归属；运营本身是用户，权限/角色在用户管理维护，此处不涉及
 */
import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { SingleSelect } from '@/components/ui/single-select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CUSTOMER_TYPE_META } from './_customerMock'

function OperatorAssignBody({
  mode,
  operator,
  operatorOptions,
  customers,
  initialCustomerIds,
  onSubmit,
  onCancel,
}) {
  const isEdit = mode === 'edit'
  const [operatorId, setOperatorId] = useState(operator?.id ?? '')
  const [selected, setSelected] = useState(() => new Set(initialCustomerIds ?? []))

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const canSubmit = operatorId && selected.size > 0

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({ operatorId, customerIds: [...selected] })
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑负责客户主体' : '配置运营客户主体'}</DialogTitle>
        <DialogDescription>
          为运营配置其负责的客户主体。运营本身是用户，权限与角色在「用户管理」中维护。
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>运营负责人</Label>
          {isEdit ? (
            <div className="flex h-10 items-center gap-2">
              <Badge variant="secondary">{operator?.name ?? '未知运营'}</Badge>
              <span className="text-xs text-muted-foreground">
                {operator?.email}
              </span>
            </div>
          ) : (
            <SingleSelect
              placeholder="选择运营（来自用户管理）"
              value={operatorId || undefined}
              onValueChange={setOperatorId}
              options={operatorOptions.map((u) => ({
                value: u.id,
                label: `${u.name} · ${u.email}`,
              }))}
              triggerClassName="w-full h-10 rounded-md"
              contentClassName="w-[var(--radix-popover-trigger-width)]"
            />
          )}
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>负责客户主体</Label>
            <span className="text-xs text-muted-foreground">
              已选 {selected.size} / {customers.length}
            </span>
          </div>
          <ScrollArea className="max-h-72 rounded-md border border-border">
            <ul className="divide-y divide-border">
              {customers.map((c) => {
                const meta = CUSTOMER_TYPE_META[c.type]
                const checked = selected.has(c.id)
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(c.id)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {c.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {c.website}
                        </p>
                      </div>
                      {meta && (
                        <Badge variant={meta.variant} className="shrink-0">
                          {meta.label}
                        </Badge>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
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
          {isEdit ? '保存修改' : '完成配置'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function OperatorAssignDialog({
  open,
  onOpenChange,
  mode = 'add',
  operator,
  operatorOptions = [],
  customers,
  initialCustomerIds,
  onSubmit,
}) {
  const formKey =
    mode === 'edit' && operator ? `edit-${operator.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <OperatorAssignBody
            key={formKey}
            mode={mode}
            operator={operator}
            operatorOptions={operatorOptions}
            customers={customers}
            initialCustomerIds={initialCustomerIds}
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
