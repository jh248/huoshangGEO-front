/**
 * [INPUT]: 依赖 react state，ui/Button+Badge+Dialog+Input+ScrollArea，lucide 图标，本地 ChunkRow + TagChip，_knowledgeMock tagById
 * [OUTPUT]: 命名导出 InformationDetailDialog — 只读详情 (标题 + 标签 + 所属公司 + 块数 + 块列表 · 块内可搜索)
 * [POS]: pages/dashboard/knowledge 私有，仅 Information.jsx 消费
 * [PROTOCOL]: 仅展示，不修改；进入编辑请走 onEdit 回调
 */
import { useMemo, useState } from 'react'
import { Pencil, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChunkRow, TagChip } from './_informationForm'
import { tagById } from './_knowledgeMock'

export function InformationDetailDialog({ information, tags, onOpenChange, onEdit, canEdit = true }) {
  const [query, setQuery] = useState('')

  const keyword = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!information) return []
    if (!keyword) return information.chunks
    return information.chunks.filter((c) => c.text.toLowerCase().includes(keyword))
  }, [information, keyword])

  if (!information) return null

  const itemTags = information.tagIds
    .map((id) => tagById(tags, id))
    .filter(Boolean)

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{information.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">{information.companyName}</Badge>
            {itemTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} />
            ))}
            <Badge variant="outline" className="tabular-nums">
              {information.chunks.length} 块
            </Badge>
            <span className="text-muted-foreground">
              最近更新 {information.updatedAt}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="在内容块中搜索"
              className="pl-9"
            />
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
              {keyword ? `没有匹配「${query}」的内容块` : '该信息暂无内容块'}
            </div>
          ) : (
            <ScrollArea className="max-h-[26rem] pr-2">
              <div className="space-y-2">
                {filtered.map((c, i) => (
                  <ChunkRow key={c.id} index={i} chunk={c} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          {canEdit && (
            <Button leftIcon={<Pencil />} onClick={() => onEdit(information)}>
              编辑
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
