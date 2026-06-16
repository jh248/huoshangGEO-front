/**
 * [INPUT]: 依赖 react state，ui/Button+Dialog+Input+SingleSelect+Table，lucide，useAuth + canAction
 *          本地 _informationForm (InformationFormDialog) · _informationDetail (InformationDetailDialog) · _knowledgeMock
 * [OUTPUT]: 默认导出 Information — 信息管理页 (标签驱动的统一知识条目)
 *           列表 (搜索 + 公司筛选 + 标签筛选) + 详情 + 添加/编辑向导 + 删除
 * [POS]: /dashboard/knowledge/information 路由
 * [PROTOCOL]: mock 数据来自 _knowledgeMock；按钮权限走 canAction(knowledge.information, …)；接真后端替换提交逻辑
 */
import { useMemo, useState } from 'react'
import { Building2, Eye, Pencil, Plus, Search, Tags as TagsIcon, Trash2 } from 'lucide-react'
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
import { SingleSelect } from '@/components/ui/single-select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/contexts/AuthContext'
import { canAction } from '@/lib/mock-rbac'
import { PageShell } from '../_PageShell'
import { InformationDetailDialog } from './_informationDetail'
import { InformationFormDialog, TagChip } from './_informationForm'
import {
  COMPANIES,
  INITIAL_INFORMATION,
  INITIAL_TAGS,
  tagById,
} from './_knowledgeMock'

function InformationTable({ items, tags, permissions, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">信息标题</TableHead>
            <TableHead>所属公司</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>内容块</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="pr-4 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((info) => (
            <TableRow key={info.id}>
              <TableCell className="pl-4 font-medium">{info.title}</TableCell>
              <TableCell className="text-sm text-foreground">
                {info.companyName}
              </TableCell>
              <TableCell>
                <div className="flex max-w-[18rem] flex-wrap gap-1">
                  {info.tagIds
                    .map((id) => tagById(tags, id))
                    .filter(Boolean)
                    .map((tag) => (
                      <TagChip key={tag.id} tag={tag} />
                    ))}
                </div>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {info.chunks.length}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {info.updatedAt}
              </TableCell>
              <TableCell className="pr-4 text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye />}
                    onClick={() => onView(info)}
                  >
                    查看
                  </Button>
                  {permissions.canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Pencil />}
                      onClick={() => onEdit(info)}
                    >
                      编辑
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除信息"
                      onClick={() => onDelete(info)}
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

function DeleteConfirmDialog({ information, onOpenChange, onConfirm }) {
  if (!information) return null
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>删除信息</DialogTitle>
          <DialogDescription>
            将删除「{information.title}」及其 {information.chunks.length} 个内容块。该操作不可撤销。
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

function Information() {
  const { user } = useAuth()
  const [items, setItems] = useState(INITIAL_INFORMATION)
  const [tags] = useState(INITIAL_TAGS)
  const [viewing, setViewing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [formState, setFormState] = useState({ open: false, mode: 'add', initial: null })
  const [query, setQuery] = useState('')
  const [companyFilter, setCompanyFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')

  const permissions = {
    canCreate: canAction(user, 'knowledge.information', 'create'),
    canEdit: canAction(user, 'knowledge.information', 'edit'),
    canDelete: canAction(user, 'knowledge.information', 'delete'),
  }

  const companyOptions = useMemo(
    () => [
      { value: 'all', label: '全部公司' },
      ...COMPANIES.map((c) => ({ value: c.id, label: c.brandName })),
    ],
    []
  )
  const tagOptions = useMemo(
    () => [
      { value: 'all', label: '全部标签' },
      ...tags.map((t) => ({ value: t.id, label: t.name })),
    ],
    [tags]
  )

  const openAdd = () => setFormState({ open: true, mode: 'add', initial: null })
  const openEdit = (info) => {
    setViewing(null)
    setFormState({ open: true, mode: 'edit', initial: info })
  }
  const closeForm = (next) => setFormState((s) => ({ ...s, open: next }))

  const handleSubmit = (info) => {
    setItems((cur) => {
      const idx = cur.findIndex((i) => i.id === info.id)
      if (idx === -1) return [info, ...cur]
      const next = cur.slice()
      next[idx] = info
      return next
    })
  }

  const handleDelete = () => {
    if (!deleting) return
    setItems((cur) => cur.filter((i) => i.id !== deleting.id))
    setDeleting(null)
  }

  const keyword = query.trim().toLowerCase()
  const filtered = items.filter((info) => {
    const matchKw = !keyword || info.title.toLowerCase().includes(keyword)
    const matchCompany = companyFilter === 'all' || info.companyId === companyFilter
    const matchTag = tagFilter === 'all' || info.tagIds.includes(tagFilter)
    return matchKw && matchCompany && matchTag
  })

  return (
    <>
      <PageShell>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索信息标题"
              className="pl-9"
            />
          </div>
          <SingleSelect
            Icon={Building2}
            label="所属公司"
            options={companyOptions}
            value={companyFilter}
            onValueChange={setCompanyFilter}
          />
          <SingleSelect
            Icon={TagsIcon}
            label="标签"
            options={tagOptions}
            value={tagFilter}
            onValueChange={setTagFilter}
          />
          {permissions.canCreate && (
            <div className="ml-auto">
              <Button leftIcon={<Plus />} onClick={openAdd}>
                添加信息
              </Button>
            </div>
          )}
        </div>

        {filtered.length > 0 ? (
          <InformationTable
            items={filtered}
            tags={tags}
            permissions={permissions}
            onView={setViewing}
            onEdit={openEdit}
            onDelete={setDeleting}
          />
        ) : (
          <div className="rounded-md border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            {keyword || companyFilter !== 'all' || tagFilter !== 'all'
              ? '没有匹配条件的信息'
              : '暂无信息 · 点击右上角添加'}
          </div>
        )}
      </PageShell>

      <InformationDetailDialog
        information={viewing}
        tags={tags}
        canEdit={permissions.canEdit}
        onOpenChange={(open) => !open && setViewing(null)}
        onEdit={openEdit}
      />

      <InformationFormDialog
        open={formState.open}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        mode={formState.mode}
        initialValue={formState.initial}
        companies={COMPANIES}
        tags={tags}
      />

      <DeleteConfirmDialog
        information={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default Information
