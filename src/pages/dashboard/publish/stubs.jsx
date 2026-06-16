/**
 * [INPUT]: 依赖 react state，ui/Button+Input+Table+Dialog，lucide 图标，PageShell
 * [OUTPUT]: 命名导出 AuthMgmt / Records (Tasks 已拆为独立文件)
 * [POS]: pages/dashboard/publish · App.jsx 路由消费
 * [PROTOCOL]: AuthMgmt 按媒体授权页面实现；Tasks / Records 暂保留占位
 */
import { useMemo, useState } from 'react'
import {
  FileText,
  ListChecks,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PageSectionCard, PageShell } from '../_PageShell'
import { DateFilter, MultiCheckFilter } from '../data/_filters'

const MEDIA_PLATFORMS = [
  { id: 'baijiahao', name: '百家号', mark: '百', tone: 'destructive' },
  { id: 'sohu', name: '搜狐号', mark: '狐', tone: 'accent' },
  { id: 'toutiao', name: '今日头条', mark: '头', tone: 'destructive' },
  { id: 'zhihu', name: '知乎', mark: '知', tone: 'primary' },
  { id: 'juejin', name: '掘金', mark: '掘', tone: 'primary' },
]

const AUTH_ROWS = {
  baijiahao: [],
  sohu: [
    {
      id: 'sohu-001',
      accountName: '火山 GEO 官方号',
      authStatus: '已授权',
      status: '正常',
    },
  ],
  toutiao: [],
  zhihu: [],
  juejin: [],
}

const PUBLISH_RECORDS = [
  {
    id: 180,
    title: '孩子写作业总揉眼睛？换了这盏灯后我终于不焦虑了',
    status: '失败',
    publishedAt: '2026-06-02 18:24:45',
    createdAt: '2026-06-02 18:24:46',
  },
  {
    id: 179,
    title: '孩子写作业总揉眼睛？换了这盏灯后我终于不焦虑了',
    status: '失败',
    publishedAt: '2026-06-02 17:55:05',
    createdAt: '2026-06-02 17:55:06',
  },
  {
    id: 178,
    title: '孩子写作业总揉眼睛？换了这盏灯后我终于不焦虑了',
    status: '失败',
    publishedAt: '2026-06-02 17:46:05',
    createdAt: '2026-06-02 17:46:06',
  },
  {
    id: 177,
    title: '选儿童大路灯踩坑两次后，我终于悟了',
    status: '已发布',
    publishedAt: '2026-06-02 17:40:31',
    createdAt: '2026-06-02 17:41:06',
  },
  {
    id: 176,
    title: '陪娃写作业三年，我终于把护眼灯换明白了',
    status: '已发布',
    publishedAt: '2026-06-02 17:36:38',
    createdAt: '2026-06-02 17:37:07',
  },
  {
    id: 175,
    title: '当妈后才知道，选对一盏灯比啥都重要',
    status: '已发布',
    publishedAt: '2026-06-02 17:34:53',
    createdAt: '2026-06-02 17:35:06',
  },
  {
    id: 174,
    title: '熬夜陪读眼睛酸胀？换对这盏大路灯，老母亲终于能喘口气了',
    status: '已发布',
    publishedAt: '2026-06-02 17:33:33',
    createdAt: '2026-06-02 17:34:06',
  },
]

const PUBLISH_STATUS_OPTIONS = [
  { value: '已发布', label: '已发布' },
  { value: '失败', label: '失败' },
]

function toYmd(date) {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() }
}

function ymdToTs(ymd) {
  return new Date(ymd.year, ymd.month, ymd.day).getTime()
}

function presetDateRange(preset) {
  if (!preset || preset === 'custom') return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (preset === 'yesterday') {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const ymd = toYmd(yesterday)
    return { start: ymd, end: ymd }
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : null
  if (!days) return null
  const start = new Date(today)
  start.setDate(start.getDate() - days + 1)
  return { start: toYmd(start), end: toYmd(today) }
}

function recordDateTs(dateTime) {
  const [date] = dateTime.split(' ')
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

function matchesDateFilter(record, dateValue) {
  const range =
    dateValue.preset === 'custom'
      ? { start: dateValue.start ?? null, end: dateValue.end ?? null }
      : presetDateRange(dateValue.preset)
  if (!range?.start) return true

  const value = recordDateTs(record.publishedAt)
  const start = ymdToTs(range.start)
  const end = range.end ? ymdToTs(range.end) : null
  return value >= start && (end == null || value <= end)
}

function articleContent(record) {
  if (!record) return []

  const sharedIntro =
    '孩子写作业时频繁揉眼睛，很多时候不是不认真，而是书桌上的光线不够稳定。过暗、频闪或照射角度不合适，都会让眼睛更快疲劳。'
  const bodyById = {
    180: [
      sharedIntro,
      '这次我把台灯换成了更适合长时间阅读的大路灯，最明显的变化是桌面亮度更均匀，孩子写完一页作业后不再频繁眯眼。',
      '选灯时重点看三点：照度覆盖范围、显色指数和防眩设计。参数不是越高越好，关键是让孩子在真实书写姿势下看得清、看得舒服。',
    ],
    179: [
      sharedIntro,
      '换灯前，我一直以为孩子揉眼睛只是坐姿问题。实际调整光源后才发现，桌面明暗不均会让眼睛一直在适应，时间长了自然容易累。',
      '大面积柔光比单点强光更适合儿童学习桌，尤其适合需要连续写作业、阅读和画画的场景。',
    ],
    178: [
      sharedIntro,
      '如果孩子一到晚上写作业就喊眼睛累，可以先检查学习区的光线，而不是只提醒坐正。灯光环境稳定后，专注时间也会更长。',
    ],
    177: [
      '选儿童大路灯踩过两次坑后，我发现真正重要的不是外观多高级，而是光线是否覆盖整个桌面、是否刺眼、是否方便调节。',
      '适合学习的灯，要让书本、作业本和电脑屏幕周围的明暗过渡自然，减少眼睛在不同亮度之间来回适应。',
    ],
    176: [
      '陪娃写作业三年，我终于明白护眼灯不是买一个“亮”的，而是买一个“稳”的。',
      '稳定的光线、足够的照明范围和合适的色温，才是孩子每天都能舒服使用的关键。',
    ],
    175: [
      '当妈后才知道，学习桌上的一盏灯会影响孩子每天写字、阅读和画画的体验。',
      '选对灯以后，桌面不再一边亮一边暗，孩子也少了很多“眼睛累”的抱怨。',
    ],
    174: [
      '熬夜陪读最怕孩子眼睛酸胀。换对大路灯后，书桌上的光线更均匀，老母亲终于不用反复调整台灯角度。',
      '护眼不是单看一个参数，而是看实际使用时孩子是否能长时间舒服阅读。',
    ],
  }

  return bodyById[record.id] ?? [record.title, '当前文章为发布记录预览内容。']
}

function PlatformMark({ platform, active }) {
  return (
    <span
      className={cn(
        'grid size-7 shrink-0 place-items-center rounded-md text-xs font-semibold',
        platform.tone === 'destructive' && 'bg-destructive/10 text-destructive',
        platform.tone === 'primary' && 'bg-primary/10 text-primary',
        platform.tone === 'accent' && 'bg-accent text-accent-foreground',
        active && 'bg-background text-primary',
      )}
    >
      {platform.mark}
    </span>
  )
}

function PlatformList({ platforms, selectedId, onSelect }) {
  return (
    <nav className="space-y-1">
      {platforms.map((platform) => {
        const active = selectedId === platform.id
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onSelect(platform.id)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted',
              active && 'bg-primary/10 text-primary hover:bg-primary/10',
            )}
          >
            <PlatformMark platform={platform} active={active} />
            <span className="truncate text-sm font-medium">{platform.name}</span>
          </button>
        )
      })}
    </nav>
  )
}

function EmptyAuthTable() {
  return (
    <TableRow>
      <TableCell colSpan={4} className="h-64 text-center">
        <div className="grid justify-items-center gap-2 text-muted-foreground">
          <span className="grid size-12 place-items-center rounded-md border border-border bg-muted/30">
            <FileText className="size-6" />
          </span>
          <span className="text-sm">暂无数据</span>
        </div>
      </TableCell>
    </TableRow>
  )
}

function AuthTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">主键ID</TableHead>
            <TableHead>账号昵称</TableHead>
            <TableHead>授权状态</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="pl-4 font-mono text-sm">{row.id}</TableCell>
                <TableCell>{row.accountName}</TableCell>
                <TableCell>{row.authStatus}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyAuthTable />
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function RecordsToolbar({
  titleQuery,
  statuses,
  dateValue,
  onTitleQueryChange,
  onStatusesChange,
  onDateChange,
  onReset,
}) {
  return (
    <PageSectionCard className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={titleQuery}
            onChange={(event) => onTitleQueryChange(event.target.value)}
            placeholder="搜索文章标题"
            className="pl-9"
          />
        </div>
        <MultiCheckFilter
          Icon={ListChecks}
          label="发布状态"
          options={PUBLISH_STATUS_OPTIONS}
          selected={statuses}
          onChange={onStatusesChange}
        />
        <DateFilter value={dateValue} onChange={onDateChange} />
        <Button
          variant="outline"
          leftIcon={<RotateCcw />}
          onClick={onReset}
          className="lg:ml-auto"
        >
          重置
        </Button>
      </div>
    </PageSectionCard>
  )
}

function PublishRecordsTable({ rows, onViewArticle }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-24 pl-4">ID</TableHead>
            <TableHead>文章标题</TableHead>
            <TableHead className="w-36">发布状态</TableHead>
            <TableHead className="w-52">发布时间</TableHead>
            <TableHead className="w-52">创建时间</TableHead>
            <TableHead className="w-32">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="pl-4 tabular-nums text-muted-foreground">
                {row.id}
              </TableCell>
              <TableCell>
                <span className="line-clamp-2 max-w-sm leading-6">{row.title}</span>
              </TableCell>
              <TableCell>
                <Badge variant={row.status === '失败' ? 'destructive' : 'secondary'}>
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {row.publishedAt}
              </TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {row.createdAt}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => onViewArticle(row)}>
                  查看文章
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ArticlePreviewDialog({ record, onOpenChange }) {
  const open = Boolean(record)
  const content = articleContent(record)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{record?.title ?? '查看文章'}</DialogTitle>
        </DialogHeader>

        {record && (
          <div className="grid gap-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={record.status === '失败' ? 'destructive' : 'secondary'}>
                {record.status}
              </Badge>
              <Badge variant="outline">ID {record.id}</Badge>
              <Badge variant="outline">发布时间 {record.publishedAt}</Badge>
              <Badge variant="outline">创建时间 {record.createdAt}</Badge>
            </div>
            <article className="max-h-[60svh] overflow-auto rounded-md border border-border bg-card p-4">
              <h2 className="mb-4 text-base font-semibold">{record.title}</h2>
              <div className="space-y-4 text-sm leading-7 text-muted-foreground">
                {content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AuthMgmt() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('baijiahao')
  const keyword = query.trim().toLowerCase()
  const platforms = useMemo(
    () =>
      MEDIA_PLATFORMS.filter((platform) =>
        keyword ? platform.name.toLowerCase().includes(keyword) : true,
      ),
    [keyword],
  )
  const selectedPlatform =
    MEDIA_PLATFORMS.find((platform) => platform.id === selectedId) ?? MEDIA_PLATFORMS[0]
  const rows = AUTH_ROWS[selectedPlatform.id] ?? []

  return (
    <PageShell>
      <div className="grid min-h-[calc(100svh-8rem)] gap-6 lg:grid-cols-[15rem_1fr]">
        <aside className="rounded-md border border-border bg-card p-3">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索媒体平台"
              className="pl-9"
            />
          </div>
          <PlatformList
            platforms={platforms}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-base font-semibold tracking-tight">媒体授权</h1>
            <div className="flex items-center gap-2">
              <Button leftIcon={<Plus />}>
                新增授权
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="刷新">
                <RefreshCw />
              </Button>
            </div>
          </div>

          <AuthTable rows={rows} />
        </section>
      </div>
    </PageShell>
  )
}

export function Records() {
  const [titleQuery, setTitleQuery] = useState('')
  const [statuses, setStatuses] = useState([])
  const [dateValue, setDateValue] = useState({ preset: '30d' })
  const [viewingRecord, setViewingRecord] = useState(null)
  const keyword = titleQuery.trim().toLowerCase()
  const rows = useMemo(
    () =>
      PUBLISH_RECORDS.filter((record) => {
        const matchTitle = keyword ? record.title.toLowerCase().includes(keyword) : true
        const matchStatus = statuses.length === 0 || statuses.includes(record.status)
        const matchDate = matchesDateFilter(record, dateValue)
        return matchTitle && matchStatus && matchDate
      }),
    [dateValue, keyword, statuses],
  )

  const reset = () => {
    setTitleQuery('')
    setStatuses([])
    setDateValue({ preset: '30d' })
  }

  return (
    <PageShell className="gap-5">
      <RecordsToolbar
        titleQuery={titleQuery}
        statuses={statuses}
        dateValue={dateValue}
        onTitleQueryChange={setTitleQuery}
        onStatusesChange={setStatuses}
        onDateChange={setDateValue}
        onReset={reset}
      />
      <PublishRecordsTable rows={rows} onViewArticle={setViewingRecord} />
      <ArticlePreviewDialog
        record={viewingRecord}
        onOpenChange={(open) => !open && setViewingRecord(null)}
      />
    </PageShell>
  )
}
