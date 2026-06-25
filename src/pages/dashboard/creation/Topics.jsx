/**
 * [INPUT]: 依赖 react state/memo/effect、framer-motion、ui/Button/Dialog/Input/Label/Table、PageShell、lib/motion
 * [OUTPUT]: 默认导出 Topics — 目标达成词管理 (目标达成词 → 多个核心词 → 每个核心词下多个场景词，树状层级)
 * [POS]: /dashboard/creation/topics 路由 · 创作中心目标达成词管理
 * [PROTOCOL]: 本地确定性生成逻辑仅作前端原型；接入后端时替换 generateCoreTerms / generateSceneTerms
 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Pencil, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PageShell } from '../_PageShell'
import { cn } from '@/lib/utils'
import { fadeInUp, pageTransition } from '@/lib/motion'

const CORE_PATTERNS = ['选购', '推荐', '价格', '品牌', '使用场景']
const SCENE_PATTERNS = ['哪个牌子好', '怎么选不踩坑', '多少钱合适']
const INITIAL_TARGET_KEYWORD = '西屋大路灯'

let termUid = 0
const nextTermId = () => `term-${termUid++}`

function normalizeKeyword(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function padDatePart(value) {
  return String(value).padStart(2, '0')
}

function formatUpdatedAt(date) {
  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hour = padDatePart(date.getHours())
  const minute = padDatePart(date.getMinutes())
  const second = padDatePart(date.getSeconds())
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

function generateCoreTerms(keyword) {
  const targetKeyword = normalizeKeyword(keyword)
  if (!targetKeyword) return []
  return CORE_PATTERNS.map((suffix) => `${targetKeyword}${suffix}`)
}

function generateSceneTerms(coreTerm) {
  const term = normalizeKeyword(coreTerm)
  if (!term) return []
  return SCENE_PATTERNS.map((suffix) => `${term}${suffix}`)
}

/* 持久模型 cores: [{ coreTerm, sceneTerms: [] }] ↔ 编辑模型 items: [{ id, value, scenes:[{id,value}] }] */
const sceneTermValue = (sceneTerm) =>
  typeof sceneTerm === 'string' ? sceneTerm : sceneTerm?.value ?? ''
const sceneTermMonitored = (sceneTerm) =>
  typeof sceneTerm === 'object' && Boolean(sceneTerm?.monitored)

const toCoreItems = (cores) =>
  cores.map((core) => ({
    id: nextTermId(),
    value: core.coreTerm,
    scenes: core.sceneTerms.map((sceneTerm) => ({
      id: nextTermId(),
      value: sceneTermValue(sceneTerm),
      monitored: sceneTermMonitored(sceneTerm),
    })),
  }))

const fromCoreItems = (items) =>
  items
    .map((core) => ({
      coreTerm: normalizeKeyword(core.value),
      sceneTerms: (core.scenes || [])
        .map((scene) => ({
          value: normalizeKeyword(scene.value),
          monitored: Boolean(scene.monitored),
        }))
        .filter((scene) => scene.value),
    }))
    .filter((core) => core.coreTerm)

const countScenes = (cores) => cores.reduce((sum, core) => sum + core.sceneTerms.length, 0)

function buildEntry({ targetKeyword, cores }, date = new Date()) {
  const normalizedTarget = normalizeKeyword(targetKeyword)
  if (!normalizedTarget) return null
  const normalizedCores = cores
    .map((core) => ({
      coreTerm: normalizeKeyword(core.coreTerm),
      sceneTerms: core.sceneTerms
        .map((sceneTerm) => ({
          value: normalizeKeyword(sceneTermValue(sceneTerm)),
          monitored: sceneTermMonitored(sceneTerm),
        }))
        .filter((sceneTerm) => sceneTerm.value),
    }))
    .filter((core) => core.coreTerm)
  return {
    id: `${normalizedTarget}-${date.getTime()}`,
    targetKeyword: normalizedTarget,
    cores: normalizedCores,
    updatedAt: formatUpdatedAt(date),
  }
}

function buildInitialEntries() {
  const cores = generateCoreTerms(INITIAL_TARGET_KEYWORD).map((coreTerm) => ({
    coreTerm,
    sceneTerms: generateSceneTerms(coreTerm).map((value, index) => ({
      value,
      monitored: index === 0,
    })),
  }))
  const entry = buildEntry({ targetKeyword: INITIAL_TARGET_KEYWORD, cores })
  return entry ? [entry] : []
}

/* 扁平核心词列表 — 仅生成核心词阶段使用 */
function CoreTermList({ items, onChange }) {
  const update = (id, value) =>
    onChange(items.map((item) => (item.id === id ? { ...item, value } : item)))
  const remove = (id) => onChange(items.filter((item) => item.id !== id))
  const add = () => onChange([...items, { id: nextTermId(), value: '', scenes: [] }])

  return (
    <div className="grid gap-2">
      <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={item.value}
              onChange={(event) => update(item.id, event.target.value)}
              placeholder="输入核心词"
            />
            <Button type="button" variant="ghost" size="icon-sm" aria-label="删除核心词" onClick={() => remove(item.id)}>
              <X />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" leftIcon={<Plus />} onClick={add} className="justify-self-start">
        添加核心词
      </Button>
    </div>
  )
}

function IconTooltip({ label, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{label}</TooltipContent>
    </Tooltip>
  )
}

/* 树状编辑器 — 核心词为父节点，场景词缩进挂在其下，类似文件结构 */
function CoreSceneTree({ items, onChange }) {
  const [collapsed, setCollapsed] = useState({})
  const toggleCollapse = (coreId) =>
    setCollapsed((current) => ({ ...current, [coreId]: !current[coreId] }))
  const updateCore = (coreId, value) =>
    onChange(items.map((core) => (core.id === coreId ? { ...core, value } : core)))
  const removeCore = (coreId) => onChange(items.filter((core) => core.id !== coreId))
  const updateScene = (coreId, sceneId, value) =>
    onChange(
      items.map((core) =>
        core.id === coreId
          ? { ...core, scenes: core.scenes.map((s) => (s.id === sceneId ? { ...s, value } : s)) }
          : core,
      ),
    )
  const removeScene = (coreId, sceneId) =>
    onChange(
      items.map((core) =>
        core.id === coreId ? { ...core, scenes: core.scenes.filter((s) => s.id !== sceneId) } : core,
      ),
    )
  const toggleSceneMonitor = (coreId, sceneId) =>
    onChange(
      items.map((core) =>
        core.id === coreId
          ? {
              ...core,
              scenes: core.scenes.map((scene) =>
                scene.id === sceneId ? { ...scene, monitored: !scene.monitored } : scene,
              ),
            }
          : core,
      ),
    )
  const addScene = (coreId) =>
    onChange(
      items.map((core) =>
        core.id === coreId ? { ...core, scenes: [...core.scenes, { id: nextTermId(), value: '', monitored: false }] } : core,
      ),
    )

  const fieldClass =
    'h-8 border-transparent bg-transparent! px-2 shadow-none! transition-colors hover:bg-muted/50 focus-visible:border-ring focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40'

  return (
    <TooltipProvider delayDuration={120}>
      <div className="grid gap-2">
      <div className="grid max-h-[46vh] gap-0.5 overflow-y-auto rounded-md border border-border/60 bg-background/40 p-2">
          {!items.length && (
            <p className="px-2 py-3 text-sm text-muted-foreground">暂无核心词，点击下方按钮添加。</p>
          )}
          {items.map((core) => {
            const isOpen = !collapsed[core.id]
            return (
              <div key={core.id}>
                {/* 核心词节点 */}
                <div
                  className="group flex items-center gap-1 rounded-md py-1 pr-1 transition-colors hover:bg-muted/50"
                  style={{ paddingLeft: 4 }}
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapse(core.id)}
                    aria-label={isOpen ? '收起' : '展开'}
                    aria-expanded={isOpen}
                    className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </button>
                  <Input
                    value={core.value}
                    onChange={(event) => updateCore(core.id, event.target.value)}
                    placeholder="输入核心词"
                    className={cn(fieldClass, 'font-medium')}
                  />
                  <IconTooltip label="添加场景词">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="添加场景词"
                      className="shrink-0"
                      onClick={() => addScene(core.id)}
                    >
                      <Plus />
                    </Button>
                  </IconTooltip>
                  <IconTooltip label="删除核心词">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="删除核心词"
                      className="shrink-0"
                      onClick={() => removeCore(core.id)}
                    >
                      <X />
                    </Button>
                  </IconTooltip>
                </div>

                {/* 场景词子节点 */}
                {isOpen && (
                  <>
                    {core.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        className="group flex items-center gap-1 rounded-md py-1 pr-1 transition-colors hover:bg-muted/50"
                        style={{ paddingLeft: 32 }}
                      >
                        <IconTooltip label="删除场景词">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="删除场景词"
                            className="size-7 shrink-0 text-muted-foreground"
                            onClick={() => removeScene(core.id, scene.id)}
                          >
                            <X />
                          </Button>
                        </IconTooltip>
                        <Input
                          value={scene.value}
                          onChange={(event) => updateScene(core.id, scene.id, event.target.value)}
                          placeholder="输入场景词"
                          className={fieldClass}
                        />
                        <span
                          className="flex size-7 shrink-0 items-center justify-center"
                          title={scene.monitored ? '监测中' : '未监测'}
                          aria-label={scene.monitored ? '监测中' : '未监测'}
                        >
                          <span
                            className={cn(
                              'size-2.5 rounded-full',
                              scene.monitored
                                ? 'bg-chart-4 shadow-[0_0_0_3px_color-mix(in_srgb,var(--chart-4)_18%,transparent)]'
                                : 'bg-muted-foreground/35',
                            )}
                          />
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSceneMonitor(core.id, scene.id)}
                          className="h-7 shrink-0 px-2 text-xs"
                        >
                          {scene.monitored ? '剔除监测' : '加入监测'}
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

const STAGE_DESC = {
  input: '输入目标达成词，AI 将为你生成多个核心词。',
  core: '确认或修改核心词，下一步为每个核心词生成场景词。',
  scene: '确认或修改每个核心词下的场景词，最后保存。',
}

function AddTargetTermDialog({ open, onOpenChange, onSubmit }) {
  const [stage, setStage] = useState('input')
  const [targetKeyword, setTargetKeyword] = useState(INITIAL_TARGET_KEYWORD)
  const [coreItems, setCoreItems] = useState([])

  const normalizedTarget = normalizeKeyword(targetKeyword)
  const validCores = fromCoreItems(coreItems)
  const hasCore = coreItems.some((item) => normalizeKeyword(item.value))

  const resetForm = () => {
    setStage('input')
    setTargetKeyword(INITIAL_TARGET_KEYWORD)
    setCoreItems([])
  }

  const handleOpenChange = (next) => {
    if (!next) resetForm()
    onOpenChange(next)
  }

  const handleGenerateCore = () => {
    if (!normalizedTarget) return
    setCoreItems(generateCoreTerms(normalizedTarget).map((value) => ({ id: nextTermId(), value, scenes: [] })))
    setStage('core')
  }

  const handleGenerateScene = () => {
    const valid = coreItems.filter((item) => normalizeKeyword(item.value))
    if (!valid.length) return
    setCoreItems(
      valid.map((item) => {
        const value = normalizeKeyword(item.value)
        return {
          id: item.id,
          value,
          scenes: generateSceneTerms(value).map((sceneValue) => ({
            id: nextTermId(),
            value: sceneValue,
            monitored: false,
          })),
        }
      }),
    )
    setStage('scene')
  }

  const handleSave = () => {
    if (!validCores.length) return
    onSubmit({ targetKeyword: normalizedTarget, cores: validCores })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加目标达成词</DialogTitle>
          <DialogDescription>{STAGE_DESC[stage]}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {stage === 'input' ? (
            <div className="grid gap-2">
              <Input
                id="topic-target-keyword"
                value={targetKeyword}
                onChange={(event) => setTargetKeyword(event.target.value)}
                placeholder="输入目标达成词"
                autoFocus
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>目标达成词</Label>
              <div className="rounded-md border border-border/60 bg-muted/40 px-4 py-2 text-sm text-foreground">
                {normalizedTarget}
              </div>
            </div>
          )}

          {stage === 'core' && (
            <div className="grid gap-2">
              <Label>核心词（{validCores.length}）</Label>
              <CoreTermList items={coreItems} onChange={setCoreItems} />
            </div>
          )}

          {stage === 'scene' && (
            <div className="grid gap-2">
              <Label>核心词与场景词</Label>
              <CoreSceneTree items={coreItems} onChange={setCoreItems} />
            </div>
          )}
        </div>

        <DialogFooter>
          {stage === 'input' && (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                取消
              </Button>
              <Button type="button" leftIcon={<Sparkles />} onClick={handleGenerateCore} disabled={!normalizedTarget}>
                生成核心词
              </Button>
            </>
          )}
          {stage === 'core' && (
            <>
              <Button type="button" variant="outline" onClick={() => setStage('input')}>
                上一步
              </Button>
              <Button type="button" leftIcon={<Sparkles />} onClick={handleGenerateScene} disabled={!hasCore}>
                生成场景词
              </Button>
            </>
          )}
          {stage === 'scene' && (
            <>
              <Button type="button" variant="outline" onClick={() => setStage('core')}>
                上一步
              </Button>
              <Button type="button" onClick={handleSave} disabled={!validCores.length}>
                保存
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* 详情 / 编辑 — 树状查看并编辑核心词与其场景词 */
function DetailEditDialog({ entry, onOpenChange, onSave }) {
  const [targetKeyword, setTargetKeyword] = useState(entry.targetKeyword)
  const [coreItems, setCoreItems] = useState(() => toCoreItems(entry.cores))

  const normalizedTarget = normalizeKeyword(targetKeyword)
  const validCores = fromCoreItems(coreItems)
  const totalScenes = countScenes(validCores)
  const addCoreToStart = () =>
    setCoreItems((current) => [{ id: nextTermId(), value: '', scenes: [] }, ...current])

  const handleSave = () => {
    if (!entry || !normalizedTarget || !validCores.length) return
    onSave({
      ...entry,
      targetKeyword: normalizedTarget,
      cores: validCores,
      updatedAt: formatUpdatedAt(new Date()),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="sr-only">目标达成词详情</DialogTitle>
          <DialogDescription className="sr-only">查看并编辑该目标达成词下的核心词与场景词</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>目标达成词</Label>
            <Input
              value={targetKeyword}
              onChange={(event) => setTargetKeyword(event.target.value)}
              placeholder="输入目标达成词"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>
                核心词与场景词（{validCores.length} 核心词 · {totalScenes} 场景词）
              </Label>
              <Button type="button" variant="outline" size="sm" leftIcon={<Plus />} onClick={addCoreToStart}>
                添加核心词
              </Button>
            </div>
            <CoreSceneTree items={coreItems} onChange={setCoreItems} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" onClick={handleSave} disabled={!normalizedTarget || !validCores.length}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* 删除确认 */
function DeleteEntryDialog({ entry, onOpenChange, onConfirm }) {
  return (
    <Dialog open={Boolean(entry)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除目标达成词</DialogTitle>
          <DialogDescription>
            将删除「{entry?.targetKeyword}」及其 {entry?.cores.length} 个核心词、
            {entry ? countScenes(entry.cores) : 0} 个场景词。该操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" variant="destructive" leftIcon={<Trash2 />} onClick={onConfirm}>
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Topics() {
  const [rows, setRows] = useState(buildInitialEntries)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteEntry, setDeleteEntry] = useState(null)
  const normalizedQuery = normalizeKeyword(query).toLowerCase()
  const filteredRows = useMemo(() => {
    if (!normalizedQuery) return rows
    return rows.filter((row) => {
      const targetKeyword = row.targetKeyword.toLowerCase()
      const coreHit = row.cores.some((core) => core.coreTerm.toLowerCase().includes(normalizedQuery))
      return targetKeyword.includes(normalizedQuery) || coreHit
    })
  }, [normalizedQuery, rows])

  const handleAdd = (value) => {
    const entry = buildEntry(value)
    if (!entry) return
    setRows((current) => [entry, ...current])
  }

  const handleSaveEdit = (updated) => {
    setRows((current) => current.map((row) => (row.id === updated.id ? updated : row)))
  }

  const handleDelete = () => {
    if (!deleteEntry) return
    setRows((current) => current.filter((row) => row.id !== deleteEntry.id))
    setDeleteEntry(null)
  }

  return (
    <>
      <motion.div {...pageTransition}>
        <PageShell>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索目标达成词 / 核心词"
                aria-label="搜索目标达成词和核心词"
                className="pl-9"
              />
            </div>
            <Button onClick={() => setAddOpen(true)}>
              添加目标达成词
            </Button>
          </div>

          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-md border border-border bg-card"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">目标达成词</TableHead>
                  <TableHead>核心词数量</TableHead>
                  <TableHead>场景词数据</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="pr-4 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="pl-4 font-medium text-foreground">
                      {row.targetKeyword}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {row.cores.length}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {countScenes(row.cores)}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {row.updatedAt}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="详情编辑"
                          onClick={() => setEditEntry(row)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="删除"
                          onClick={() => setDeleteEntry(row)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredRows.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      没有匹配的目标达成词
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </PageShell>
      </motion.div>

      <AddTargetTermDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
      />

      {editEntry && (
        <DetailEditDialog
          key={editEntry.id}
          entry={editEntry}
          onOpenChange={(next) => !next && setEditEntry(null)}
          onSave={handleSaveEdit}
        />
      )}

      <DeleteEntryDialog
        entry={deleteEntry}
        onOpenChange={(next) => !next && setDeleteEntry(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

export default Topics
