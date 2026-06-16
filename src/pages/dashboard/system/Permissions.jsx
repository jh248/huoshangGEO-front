/**
 * [INPUT]: 依赖 react state/memo，ui/Button+Badge+Dialog+Input+Label+Select+Collapsible+DropdownMenu，_PageShell，_mock
 * [OUTPUT]: 默认导出 SystemPermissions — 权限配置页 (树形菜单权限目录 + 按钮权限搜索 + 菜单/按钮权限 增改删 mock)
 * [POS]: /dashboard/system/permissions 路由，系统设置 · 权限目录维护
 * [PROTOCOL]: 仅维护前端 mock 权限目录；菜单权限可编辑(标识锁定)/删除，按钮权限可删除(chip × )；增改删按钮均走 canAction(system.permissions, …)；真实接入由后端权限资源表驱动
 */
import { useState } from 'react'
import { ChevronDown, FileText, Folder, GripVertical, KeyRound, ListPlus, MousePointerClick, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageShell } from '../_PageShell'
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import { MENU_TREE, PERMISSION_CATALOG } from './_mock'

const MENU_FORM_EMPTY = {
  sectionId: 'system',
  menuKey: '',
  menuLabel: '',
}

const BUTTON_FORM_EMPTY = {
  sectionId: '',
  menuKey: '',
  actionKey: '',
  actionLabel: '',
}

function sectionName(sectionId) {
  return MENU_TREE.find((section) => section.sectionId === sectionId)?.sectionLabel ?? sectionId
}

function createTreeSections(catalog, sectionOrder) {
  const bySection = new Map()
  for (const item of catalog) {
    if (!bySection.has(item.sectionId)) bySection.set(item.sectionId, [])
    bySection.get(item.sectionId).push(item)
  }

  const order = sectionOrder ?? MENU_TREE.map((s) => s.sectionId)
  // 兜底：catalog 里有但 order 未收录的 section 追加在末尾
  const merged = [...order, ...[...bySection.keys()].filter((id) => !order.includes(id))]

  return merged
    .map((sectionId) => ({
      sectionId,
      sectionLabel: sectionName(sectionId),
      items: bySection.get(sectionId) ?? [],
    }))
    .filter((section) => section.items.length > 0)
}

function matchesButton(button, query) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return [button.label, button.key, button.code].some((value) =>
    String(value).toLowerCase().includes(normalized)
  )
}

function PermissionTree({
  catalog,
  sectionOrder,
  query,
  permissions,
  onEditMenu,
  onDeleteMenu,
  onDeleteButton,
  onReorderSection,
  onReorderItem,
}) {
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries(MENU_TREE.map((section) => [section.sectionId, false]))
  )
  // 拖拽排序状态：section 级 + item 级
  const [dragSection, setDragSection] = useState(null)
  const [overSection, setOverSection] = useState(null)
  const [dragItem, setDragItem] = useState(null) // { sectionId, menuKey }
  const [overItem, setOverItem] = useState(null)
  const resetDrag = () => {
    setDragSection(null)
    setOverSection(null)
    setDragItem(null)
    setOverItem(null)
  }

  const normalizedQuery = query.trim().toLowerCase()
  const canReorder = permissions.canEdit && !normalizedQuery
  const sections = createTreeSections(catalog, sectionOrder)
    .map((section) => ({
      ...section,
      items: section.items
        .map((item) => {
          const visibleButtons = item.buttons.filter((button) => matchesButton(button, query))
          return {
            ...item,
            visibleButtons: normalizedQuery ? visibleButtons : item.buttons,
            visible: !normalizedQuery || visibleButtons.length > 0,
          }
        })
        .filter((item) => item.visible),
    }))
    .filter((section) => !normalizedQuery || section.items.length > 0)

  return (
    <div className="grid gap-3">
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid gap-3 bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.7fr)_minmax(12rem,1fr)]">
          <span>权限树</span>
          <span>权限标识</span>
          <span>按钮权限</span>
        </div>

        {sections.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            没有找到匹配的按钮权限
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sections.map((section) => {
              const open = normalizedQuery ? true : expandedSections[section.sectionId]

              return (
                <Collapsible
                  key={section.sectionId}
                  open={open}
                  onOpenChange={(next) =>
                    setExpandedSections((current) => ({ ...current, [section.sectionId]: next }))
                  }
                >
                  <div
                    draggable={canReorder}
                    onDragStart={
                      canReorder
                        ? (e) => {
                            setDragSection(section.sectionId)
                            e.dataTransfer.effectAllowed = 'move'
                          }
                        : undefined
                    }
                    onDragOver={
                      canReorder
                        ? (e) => {
                            if (dragSection == null) return
                            e.preventDefault()
                            if (overSection !== section.sectionId) setOverSection(section.sectionId)
                          }
                        : undefined
                    }
                    onDrop={
                      canReorder
                        ? () => {
                            if (dragSection && dragSection !== section.sectionId)
                              onReorderSection(dragSection, section.sectionId)
                            resetDrag()
                          }
                        : undefined
                    }
                    onDragEnd={resetDrag}
                    className={`grid items-center gap-3 px-4 py-3 transition-colors md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.7fr)_minmax(12rem,1fr)] ${dragSection === section.sectionId ? 'opacity-50' : ''} ${overSection === section.sectionId && dragSection !== section.sectionId ? 'border-t-2 border-t-primary' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {canReorder && (
                        <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                      )}
                      <CollapsibleTrigger
                        type="button"
                        className="flex size-7 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 ease-out hover:bg-muted"
                        aria-label={`${open ? '收起' : '展开'}${section.sectionLabel}`}
                      >
                        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? '' : '-rotate-90'}`} />
                      </CollapsibleTrigger>
                      <span className="flex size-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Folder className="size-4" />
                      </span>
                      <span className="truncate font-medium">{section.sectionLabel}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{section.sectionId}</span>
                    <span className="text-sm text-muted-foreground">
                      {open ? '已展开' : '默认收起'}
                    </span>
                  </div>

                  <CollapsibleContent>
                    <div className="divide-y divide-border border-t border-border bg-muted/10">
                      {section.items.map((item) => (
                        <div
                          key={item.menuKey}
                          draggable={canReorder}
                          onDragStart={
                            canReorder
                              ? (e) => {
                                  setDragItem({ sectionId: section.sectionId, menuKey: item.menuKey })
                                  e.dataTransfer.effectAllowed = 'move'
                                  e.stopPropagation()
                                }
                              : undefined
                          }
                          onDragOver={
                            canReorder
                              ? (e) => {
                                  if (!dragItem || dragItem.sectionId !== section.sectionId) return
                                  e.preventDefault()
                                  if (overItem !== item.menuKey) setOverItem(item.menuKey)
                                }
                              : undefined
                          }
                          onDrop={
                            canReorder
                              ? (e) => {
                                  e.stopPropagation()
                                  if (
                                    dragItem &&
                                    dragItem.sectionId === section.sectionId &&
                                    dragItem.menuKey !== item.menuKey
                                  )
                                    onReorderItem(section.sectionId, dragItem.menuKey, item.menuKey)
                                  resetDrag()
                                }
                              : undefined
                          }
                          onDragEnd={resetDrag}
                          className={`grid gap-3 px-4 py-3 transition-colors md:grid-cols-[minmax(0,1fr)_minmax(10rem,0.7fr)_minmax(12rem,1fr)] ${dragItem?.menuKey === item.menuKey ? 'opacity-50' : ''} ${overItem === item.menuKey && dragItem?.menuKey !== item.menuKey ? 'border-t-2 border-t-primary' : ''}`}
                        >
                          <div className="flex min-w-0 items-center gap-2 pl-3">
                            {canReorder && (
                              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                            )}
                            <span className="flex size-7 items-center justify-center rounded-xl bg-background text-muted-foreground">
                              <FileText className="size-4" />
                            </span>
                            <span className="truncate font-medium">{item.menuLabel}</span>
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.menuKey}
                          </span>
                          <div className="flex items-start gap-2">
                            <div className="flex flex-1 flex-wrap gap-1.5">
                              {item.visibleButtons.length > 0 ? (
                                item.visibleButtons.map((button) => (
                                  <Badge
                                    key={button.code}
                                    variant="outline"
                                    className="gap-1 font-normal"
                                  >
                                    {button.label}
                                    {permissions.canDelete && (
                                      <button
                                        type="button"
                                        aria-label={`删除按钮权限 ${button.label}`}
                                        onClick={() => onDeleteButton(item.menuKey, button.key)}
                                        className="-mr-0.5 rounded-full text-muted-foreground transition-colors hover:text-destructive"
                                      >
                                        <X className="size-3" />
                                      </button>
                                    )}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">无按钮权限</span>
                              )}
                            </div>
                            {(permissions.canEdit || permissions.canDelete) && (
                              <div className="flex shrink-0 items-center gap-1">
                                {permissions.canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`编辑菜单权限 ${item.menuLabel}`}
                                    onClick={() => onEditMenu(item)}
                                  >
                                    <Pencil />
                                  </Button>
                                )}
                                {permissions.canDelete && (
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`删除菜单权限 ${item.menuLabel}`}
                                    onClick={() => onDeleteMenu(item)}
                                  >
                                    <Trash2 />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuPermissionDialog({ open, mode = 'add', initialValue, onOpenChange, onSubmit }) {
  const formKey = mode === 'edit' && initialValue ? `edit-${initialValue.menuKey}` : 'add'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {open && (
          <MenuPermissionForm
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

function MenuPermissionForm({ mode, initialValue, onSubmit, onCancel }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(() =>
    isEdit && initialValue
      ? {
          sectionId: initialValue.sectionId,
          menuKey: initialValue.menuKey,
          menuLabel: initialValue.menuLabel,
        }
      : MENU_FORM_EMPTY,
  )
  const canSubmit = form.menuKey.trim() && form.menuLabel.trim()

  const submit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      sectionId: form.sectionId,
      sectionLabel: sectionName(form.sectionId),
      menuKey: form.menuKey.trim(),
      menuLabel: form.menuLabel.trim(),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? '编辑菜单权限' : '添加菜单权限'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>所属模块</Label>
          <Select
            value={form.sectionId}
            onValueChange={(sectionId) => setForm((cur) => ({ ...cur, sectionId }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MENU_TREE.map((section) => (
                <SelectItem key={section.sectionId} value={section.sectionId}>
                  {section.sectionLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="permission-menu-name">菜单名称</Label>
          <Input
            id="permission-menu-name"
            value={form.menuLabel}
            onChange={(event) => setForm((cur) => ({ ...cur, menuLabel: event.target.value }))}
            placeholder="操作日志"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="permission-menu-key">权限标识</Label>
          <Input
            id="permission-menu-key"
            value={form.menuKey}
            onChange={(event) => setForm((cur) => ({ ...cur, menuKey: event.target.value }))}
            placeholder="system.audit"
            disabled={isEdit}
            required
          />
          {isEdit && (
            <p className="text-xs text-muted-foreground">权限标识为唯一身份，不可修改。</p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" leftIcon={isEdit ? <Pencil /> : <ListPlus />} disabled={!canSubmit}>
            {isEdit ? '保存修改' : '添加菜单权限'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function MenuPermissionDeleteDialog({ item, onOpenChange, onConfirm }) {
  if (!item) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除菜单权限</DialogTitle>
        </DialogHeader>
        <p className="py-2 text-sm text-muted-foreground">
          将删除菜单权限「{item.menuLabel}」（{item.menuKey}）及其 {item.buttons.length} 个按钮权限。该操作不可撤销。
        </p>
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

function ButtonPermissionDialog({ open, catalog, onOpenChange, onSubmit }) {
  const [form, setForm] = useState(BUTTON_FORM_EMPTY)
  const menusInSection = form.sectionId
    ? catalog.filter((item) => item.sectionId === form.sectionId)
    : []
  const canSubmit = form.sectionId && form.menuKey && form.actionKey.trim() && form.actionLabel.trim()

  const closeDialog = (next) => {
    if (!next) setForm(BUTTON_FORM_EMPTY)
    onOpenChange(next)
  }

  const submit = (event) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({
      menuKey: form.menuKey,
      key: form.actionKey.trim(),
      label: form.actionLabel.trim(),
      code: `${form.menuKey}.${form.actionKey.trim()}`,
    })
    closeDialog(false)
  }

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>添加按钮权限</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>一级菜单</Label>
            <Select
              value={form.sectionId}
              onValueChange={(sectionId) =>
                setForm((cur) => ({ ...cur, sectionId, menuKey: '' }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择一级菜单" />
              </SelectTrigger>
              <SelectContent>
                {MENU_TREE.map((section) => (
                  <SelectItem key={section.sectionId} value={section.sectionId}>
                    {section.sectionLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>二级菜单</Label>
            <Select
              value={form.menuKey}
              onValueChange={(menuKey) => setForm((cur) => ({ ...cur, menuKey }))}
              disabled={!form.sectionId}
            >
              <SelectTrigger className="w-full" disabled={!form.sectionId}>
                <SelectValue placeholder={form.sectionId ? '选择二级菜单' : '请先选择一级菜单'} />
              </SelectTrigger>
              <SelectContent>
                {menusInSection.map((item) => (
                  <SelectItem key={item.menuKey} value={item.menuKey}>
                    {item.menuLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="permission-action-name">按钮名称</Label>
            <Input
              id="permission-action-name"
              value={form.actionLabel}
              onChange={(event) => setForm((cur) => ({ ...cur, actionLabel: event.target.value }))}
              placeholder="审核"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="permission-action-key">按钮标识</Label>
            <Input
              id="permission-action-key"
              value={form.actionKey}
              onChange={(event) => setForm((cur) => ({ ...cur, actionKey: event.target.value }))}
              placeholder="review"
              required
            />
          </div>
          <DialogFooter className="gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
              取消
            </Button>
            <Button type="submit" leftIcon={<MousePointerClick />} disabled={!canSubmit}>
              添加按钮权限
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SystemPermissions() {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState(PERMISSION_CATALOG)
  const [sectionOrder, setSectionOrder] = useState(() => MENU_TREE.map((s) => s.sectionId))
  const [menuDialog, setMenuDialog] = useState({ open: false, mode: 'add', initial: null })
  const [buttonOpen, setButtonOpen] = useState(false)
  const [deletingMenu, setDeletingMenu] = useState(null)
  const [query, setQuery] = useState('')

  const permissions = {
    canCreate: canAction(user, 'system.permissions', 'create'),
    canEdit: canAction(user, 'system.permissions', 'edit'),
    canDelete: canAction(user, 'system.permissions', 'delete'),
  }

  const openAddMenu = () => setMenuDialog({ open: true, mode: 'add', initial: null })
  const openEditMenu = (item) => setMenuDialog({ open: true, mode: 'edit', initial: item })
  const closeMenuDialog = (next) => setMenuDialog((s) => ({ ...s, open: next }))

  const submitMenuPermission = (payload) => {
    setCatalog((cur) => {
      const idx = cur.findIndex((item) => item.menuKey === payload.menuKey)
      if (idx === -1) return [...cur, { ...payload, buttons: [] }]
      const next = cur.slice()
      // 编辑：保留按钮权限，仅更新模块归属与名称
      next[idx] = { ...next[idx], sectionId: payload.sectionId, sectionLabel: payload.sectionLabel, menuLabel: payload.menuLabel }
      return next
    })
  }

  const deleteMenuPermission = () => {
    if (!deletingMenu) return
    setCatalog((cur) => cur.filter((item) => item.menuKey !== deletingMenu.menuKey))
    setDeletingMenu(null)
  }

  const deleteButtonPermission = (menuKey, buttonKey) => {
    setCatalog((cur) =>
      cur.map((item) =>
        item.menuKey === menuKey
          ? { ...item, buttons: item.buttons.filter((b) => b.key !== buttonKey) }
          : item
      )
    )
  }

  // 一级菜单（section）排序：移动 source 到 target 位置
  const reorderSection = (sourceId, targetId) => {
    setSectionOrder((cur) => {
      const order = cur.includes(sourceId) ? cur.slice() : [...cur, sourceId]
      const from = order.indexOf(sourceId)
      const to = order.indexOf(targetId)
      if (from === -1 || to === -1 || from === to) return cur
      order.splice(from, 1)
      order.splice(to, 0, sourceId)
      return order
    })
  }

  // 二级菜单（item）排序：在同一 section 内移动 catalog 条目
  const reorderItem = (sectionId, sourceKey, targetKey) => {
    setCatalog((cur) => {
      const inSection = cur.filter((item) => item.sectionId === sectionId)
      const from = inSection.findIndex((item) => item.menuKey === sourceKey)
      const to = inSection.findIndex((item) => item.menuKey === targetKey)
      if (from === -1 || to === -1 || from === to) return cur
      const reordered = inSection.slice()
      const [moved] = reordered.splice(from, 1)
      reordered.splice(to, 0, moved)
      let qi = 0
      return cur.map((item) => (item.sectionId === sectionId ? reordered[qi++] : item))
    })
  }

  const addButtonPermission = (button) => {
    setCatalog((cur) =>
      cur.map((item) =>
        item.menuKey === button.menuKey
          ? {
              ...item,
              buttons: item.buttons.some((existing) => existing.key === button.key)
                ? item.buttons
                : [...item.buttons, button],
            }
          : item
      )
    )
  }

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索按钮权限"
                className="pl-9"
              />
            </div>
            {query && (
              <Button type="button" variant="outline" size="sm" onClick={() => setQuery('')}>
                清空
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                leftIcon={<Plus />}
                rightIcon={<ChevronDown />}
                disabled={!permissions.canCreate}
              >
                添加权限
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={openAddMenu}>
                <ListPlus />
                添加菜单权限
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setButtonOpen(true)}>
                <KeyRound />
                添加按钮权限
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <PermissionTree
          catalog={catalog}
          sectionOrder={sectionOrder}
          query={query}
          permissions={permissions}
          onEditMenu={openEditMenu}
          onDeleteMenu={setDeletingMenu}
          onDeleteButton={deleteButtonPermission}
          onReorderSection={reorderSection}
          onReorderItem={reorderItem}
        />
      </PageShell>

      <MenuPermissionDialog
        open={menuDialog.open}
        mode={menuDialog.mode}
        initialValue={menuDialog.initial}
        onOpenChange={closeMenuDialog}
        onSubmit={submitMenuPermission}
      />
      <ButtonPermissionDialog
        open={buttonOpen}
        catalog={catalog}
        onOpenChange={setButtonOpen}
        onSubmit={addButtonPermission}
      />
      <MenuPermissionDeleteDialog
        item={deletingMenu}
        onOpenChange={(open) => !open && setDeletingMenu(null)}
        onConfirm={deleteMenuPermission}
      />
    </>
  )
}

export default SystemPermissions
