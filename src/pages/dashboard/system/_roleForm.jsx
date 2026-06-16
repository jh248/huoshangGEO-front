/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Input+Label+Checkbox+ScrollArea+Badge+Collapsible，lucide，_mock
 * [OUTPUT]: 命名导出 RoleFormDialog (添加/编辑/只读共享) + RoleDeleteDialog + PermissionMatrix
 * [POS]: pages/dashboard/system 私有，被 Roles.jsx 消费
 * [PROTOCOL]: 菜单权限矩阵按 MENU_TREE 分段渲染 (查看/管理两级，管理蕴含查看)；系统内置角色只读、禁删
 */
import { useState } from 'react'
import { ChevronDown, Plus, Pencil, Search, Trash2 } from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { BUTTON_ACTIONS, DEFAULT_BUTTON_PERMISSIONS, MENU_KEYS, MENU_TREE, emptyPermissions } from './_mock'

function clonePermissions(perms) {
  return Object.fromEntries(
    MENU_KEYS.map((k) => {
      const current = perms[k] ?? {}
      const actions = Object.fromEntries(
        (DEFAULT_BUTTON_PERMISSIONS[k] ?? []).map((action) => [
          action,
          !!current.actions?.[action] || !!current.manage,
        ])
      )
      const available = DEFAULT_BUTTON_PERMISSIONS[k] ?? []
      return [
        k,
        {
          view: !!current.view,
          manage: !!current.manage || (available.length > 0 && available.every((action) => actions[action])),
          actions,
        },
      ]
    }),
  )
}

/* ============================================================================
 * PermissionMatrix · 菜单权限矩阵 (查看 / 管理)
 * ========================================================================== */
export function PermissionMatrix({ permissions, onChange, disabled = false }) {
  const [query, setQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries(MENU_TREE.map((section) => [section.sectionId, true]))
  )
  const normalizedQuery = query.trim().toLowerCase()
  const setKey = (key, next) => onChange({ ...permissions, [key]: next })
  const actionLabel = (key) => BUTTON_ACTIONS.find((action) => action.key === key)?.label ?? key
  const matchesQuery = (...values) =>
    !normalizedQuery || values.some((value) => String(value).toLowerCase().includes(normalizedQuery))
  const withManageState = (key, next) => {
    const available = DEFAULT_BUTTON_PERMISSIONS[key] ?? []
    const manage = available.length > 0 && available.every((action) => next.actions?.[action])
    return { ...next, manage }
  }

  const toggleView = (key) => {
    const cur = permissions[key]
    const view = !cur.view
    setKey(key, withManageState(key, { ...cur, view, actions: view ? cur.actions : Object.fromEntries(Object.keys(cur.actions ?? {}).map((action) => [action, false])) }))
  }
  const toggleManage = (key) => {
    const cur = permissions[key]
    const manage = !cur.manage
    const actions = Object.fromEntries(
      Object.keys(cur.actions ?? {}).map((action) => [action, manage])
    )
    setKey(key, { ...cur, manage, view: manage ? true : cur.view, actions })
  }
  const toggleAction = (key, action) => {
    const cur = permissions[key]
    const nextActions = { ...cur.actions, [action]: !cur.actions?.[action] }
    setKey(key, withManageState(key, { ...cur, view: true, actions: nextActions }))
  }
  const toggleSection = (section) => {
    const keys = section.items.map((i) => i.key)
    const allView = keys.every((k) => permissions[k]?.view)
    const next = { ...permissions }
    for (const k of keys) {
      next[k] = allView
        ? {
            ...next[k],
            view: false,
            manage: false,
            actions: Object.fromEntries(Object.keys(next[k].actions ?? {}).map((action) => [action, false])),
          }
        : { ...next[k], view: true }
    }
    onChange(next)
  }
  const visibleSections = MENU_TREE.map((section) => {
    const sectionMatched = matchesQuery(section.sectionLabel, section.sectionId)
    const items = section.items
      .map((item) => {
        const itemMatched = matchesQuery(item.label, item.key)
        const allActions = DEFAULT_BUTTON_PERMISSIONS[item.key] ?? []
        const visibleActions =
          !normalizedQuery || sectionMatched || itemMatched
            ? allActions
            : allActions.filter((action) => matchesQuery(action, actionLabel(action)))

        return {
          ...item,
          visibleActions,
          visible: !normalizedQuery || sectionMatched || itemMatched || visibleActions.length > 0,
        }
      })
      .filter((item) => item.visible)

    return { ...section, items, sectionMatched }
  }).filter((section) => !normalizedQuery || section.sectionMatched || section.items.length > 0)

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索菜单 / 按钮权限"
            className="pl-9"
          />
        </div>
        {query && (
          <Button type="button" variant="outline" size="sm" onClick={() => setQuery('')}>
            清空
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        <div className="flex items-center justify-between bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground">
          <span>菜单</span>
          <div className="flex">
            <span className="w-20 text-center">菜单可见</span>
            <span className="w-20 text-center">按钮全选</span>
          </div>
        </div>
        <div className="max-h-[44vh] overflow-y-auto">
          {visibleSections.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              没有找到匹配的权限
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleSections.map((section) => {
                const sourceSection = MENU_TREE.find((item) => item.sectionId === section.sectionId) ?? section
                const keys = sourceSection.items.map((i) => i.key)
                const allView = keys.every((k) => permissions[k]?.view)
                const checkedCount = keys.filter((k) => permissions[k]?.view).length
                const open = normalizedQuery ? true : expandedSections[section.sectionId]

                return (
                  <Collapsible
                    key={section.sectionId}
                    open={open}
                    onOpenChange={(next) =>
                      setExpandedSections((current) => ({ ...current, [section.sectionId]: next }))
                    }
                  >
                    <div className="flex items-center justify-between bg-muted/30 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <CollapsibleTrigger
                          type="button"
                          className="flex size-6 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 ease-out hover:bg-muted"
                          aria-label={`${open ? '收起' : '展开'}${section.sectionLabel}`}
                        >
                          <ChevronDown className={`size-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
                        </CollapsibleTrigger>
                        <Checkbox
                          checked={allView}
                          onCheckedChange={() => toggleSection(sourceSection)}
                          disabled={disabled}
                        />
                        <span className="truncate text-sm font-medium text-foreground">
                          {section.sectionLabel}
                        </span>
                        <Badge variant="outline">
                          {checkedCount} / {keys.length}
                        </Badge>
                      </div>
                    </div>

                    <CollapsibleContent>
                      {section.items.map((item) => {
                        const perm = permissions[item.key] ?? { view: false, manage: false, actions: {} }
                        return (
                          <div key={item.key} className="grid gap-2 py-2 pl-12 pr-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">{item.label}</span>
                              <div className="flex">
                                <span className="flex w-20 justify-center">
                                  <Checkbox
                                    checked={perm.view}
                                    onCheckedChange={() => toggleView(item.key)}
                                    disabled={disabled}
                                  />
                                </span>
                                <span className="flex w-20 justify-center">
                                  <Checkbox
                                    checked={perm.manage}
                                    onCheckedChange={() => toggleManage(item.key)}
                                    disabled={disabled}
                                  />
                                </span>
                              </div>
                            </div>
                            {item.visibleActions.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.visibleActions.map((action) => (
                                  <label
                                    key={action}
                                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                                  >
                                    <Checkbox
                                      checked={!!perm.actions?.[action]}
                                      onCheckedChange={() => toggleAction(item.key, action)}
                                      disabled={disabled || !perm.view}
                                    />
                                    {actionLabel(action)}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================================================================
 * RoleFormBody · 角色表单 (system 角色只读)
 * ========================================================================== */
function RoleFormBody({ mode, initialValue, forceReadOnly = false, onSubmit, onCancel }) {
  const readOnly = forceReadOnly || !!initialValue?.system
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() =>
    isEdit && initialValue
      ? {
          name: initialValue.name,
          permissions: clonePermissions(initialValue.permissions),
        }
      : { name: '', permissions: emptyPermissions() },
  )

  const canSubmit = form.name.trim().length > 0
  const selectedCount = MENU_KEYS.filter((k) => form.permissions[k]?.view).length

  const handleSubmit = (event) => {
    event.preventDefault()
    if (readOnly || !canSubmit) return
    const payload = {
      ...(isEdit && initialValue ? initialValue : {}),
      name: form.name.trim(),
      permissions: form.permissions,
      system: false,
    }
    onSubmit(isEdit ? payload : { id: `${Date.now()}`, ...payload })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {readOnly ? '查看菜单权限' : isEdit ? '配置菜单权限' : '添加角色权限'}
        </DialogTitle>
        <DialogDescription>
          {readOnly
            ? '当前角色不可编辑，或当前账号仅拥有查看权限。'
            : '为角色添加可访问菜单：「菜单可见」控制页面入口是否可访问；「按钮全选」一键开启该菜单下所有按钮权限。'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label htmlFor="role-name">角色名称</Label>
            <Input
              id="role-name"
              value={form.name}
              onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
              placeholder="公司管理员"
              disabled={readOnly}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Label>菜单权限</Label>
            <Badge variant="outline">{selectedCount} / {MENU_KEYS.length}</Badge>
            {readOnly && <Badge variant="secondary">全部权限 · 内置</Badge>}
          </div>
          <PermissionMatrix
            permissions={form.permissions}
            onChange={(next) => setForm((c) => ({ ...c, permissions: next }))}
            disabled={readOnly}
          />
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            {readOnly ? '关闭' : '取消'}
          </Button>
          {!readOnly && (
            <Button
              type="submit"
              leftIcon={isEdit ? <Pencil /> : <Plus />}
              disabled={!canSubmit}
            >
              {isEdit ? '保存修改' : '添加角色'}
            </Button>
          )}
        </DialogFooter>
      </form>
    </>
  )
}

export function RoleFormDialog({ open, onOpenChange, onSubmit, mode = 'add', initialValue, readOnly = false }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.id}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {open && (
          <RoleFormBody
            key={formKey}
            mode={mode}
            initialValue={initialValue}
            forceReadOnly={readOnly}
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

export function RoleDeleteDialog({ role, userCount = 0, onOpenChange, onConfirm }) {
  if (!role) return null
  const blocked = role.system || userCount > 0
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除角色</DialogTitle>
          <DialogDescription>
            {role.system
              ? '系统内置角色不可删除。'
              : userCount > 0
                ? `角色「${role.name}」下还有 ${userCount} 个用户，请先转移或删除这些用户。`
                : `将删除角色「${role.name}」。该操作不可撤销。`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            variant="destructive"
            leftIcon={<Trash2 />}
            disabled={blocked}
            onClick={onConfirm}
          >
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
