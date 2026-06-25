/**
 * [INPUT]: 依赖 react state、react-router useLocation/useNavigate、ui/Button/Input/Textarea、lucide
 * [OUTPUT]: 默认导出 PromptDetail — Prompt 编排/调试工作台 (双栏：模板 / 预览调试)
 * [POS]: /dashboard/creation/prompts/:id 路由 · 创建/编辑 Prompt 后进入
 * [PROTOCOL]: 调试与运行为前端骨架，无真实模型调用；接入后端时替换运行逻辑与版本提交
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  History,
  Play,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const DEFAULT_SYSTEM = `你是一名高效的学习助理，请观看用户上传的课堂录播视频，并提取出本堂课的核心内容，生成一份精炼的学习笔记。

**工作准则**：
1. **识别主题**：首先确定本堂课的核心主题。
2. **提取关键知识点**：以列表形式，列出视频中讲解的所有关键知识点和定义。
3. **记录案例**：记录视频中提到的重要案例或示例，并简要说明其用途。
4. **生成思考题**：根据课程内容，生成 3 个相关的思考题，帮助用户巩固学习。
5. **结构化输出**：所有内容需以 JSON 格式返回。`

const KNOWLEDGE_OPTIONS = [
  { value: 'product', label: '产品知识库' },
  { value: 'faq', label: 'FAQ 知识库' },
  { value: 'brand', label: '品牌资料库' },
]

const MODEL_OPTIONS = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'doubao', label: '豆包' },
  { value: 'kimi', label: 'Kimi' },
  { value: 'chatgpt', label: 'ChatGPT' },
]

const VERSION_CONTENT = {
  v3: DEFAULT_SYSTEM,
  v2: `你是一名高效的学习助理，请观看用户上传的课堂录播视频，并提取出本堂课的核心内容，生成一份精炼的学习笔记。

**工作准则**：
1. **识别主题**：首先确定本堂课的核心主题。
2. **提取关键知识点**：以列表形式，列出视频中讲解的所有关键知识点和定义。
3. **记录案例**：记录视频中提到的重要案例或示例，并简要说明其用途。`,
  v1: `你是一名高效的学习助理，请观看用户上传的课堂录播视频，并提取出本堂课的核心内容，生成一份精炼的学习笔记。`,
}

const VERSION_HISTORY = [
  {
    id: 'v3',
    version: 'v3',
    title: '优化输出结构',
    summary: '补充 JSON 返回约束，明确学习笔记需要包含主题、知识点、案例和思考题。',
    operator: 'demo',
    updatedAt: '2026-06-05 11:20:08',
    content: VERSION_CONTENT.v3,
  },
  {
    id: 'v2',
    version: 'v2',
    title: '增加工作准则',
    summary: '加入识别主题、提取关键知识点和记录案例三段式处理流程。',
    operator: 'demo',
    updatedAt: '2026-06-04 16:02:33',
    content: VERSION_CONTENT.v2,
  },
  {
    id: 'v1',
    version: 'v1',
    title: '创建初始版本',
    summary: '创建护眼大路灯种草长文提示词，并写入基础角色设定。',
    operator: 'demo',
    updatedAt: '2026-06-03 09:45:12',
    content: VERSION_CONTENT.v1,
  },
]

const VERSION_PAGE_SIZE = 2

function PromptVersionText({ title, meta, content, tone = 'default' }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground">{meta}</span>
        </div>
      </div>
      <ScrollArea className="h-[48svh]">
        <pre
          className={[
            'whitespace-pre-wrap p-3 text-sm leading-6 text-foreground',
            tone === 'history' ? 'bg-destructive/5' : 'bg-primary/5',
          ].join(' ')}
        >
          {content}
        </pre>
      </ScrollArea>
    </div>
  )
}

function PromptDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialName = location.state?.name ?? location.state?.prompt?.name ?? '未命名 Prompt'

  const [name, setName] = useState(initialName)
  const [editingName, setEditingName] = useState(false)
  const [system, setSystem] = useState(location.state?.prompt?.system ?? DEFAULT_SYSTEM)
  const [testInput, setTestInput] = useState('')
  const [knowledgeBase, setKnowledgeBase] = useState(KNOWLEDGE_OPTIONS[0].value)
  const [model, setModel] = useState(MODEL_OPTIONS[0].value)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitNote, setSubmitNote] = useState('')
  const [diffVersion, setDiffVersion] = useState(null)
  const [historyPage, setHistoryPage] = useState(1)
  const selectedKnowledge = KNOWLEDGE_OPTIONS.find((item) => item.value === knowledgeBase) ?? KNOWLEDGE_OPTIONS[0]
  const selectedModel = MODEL_OPTIONS.find((item) => item.value === model) ?? MODEL_OPTIONS[0]
  const historyPageCount = Math.max(1, Math.ceil(VERSION_HISTORY.length / VERSION_PAGE_SIZE))
  const visibleHistory = VERSION_HISTORY.slice(
    (historyPage - 1) * VERSION_PAGE_SIZE,
    historyPage * VERSION_PAGE_SIZE,
  )

  return (
    <TooltipProvider>
      <main className="-mx-4 -my-6 flex h-[calc(100svh-3.5rem)] min-h-0 w-[calc(100%+2rem)] max-w-[calc(100%+2rem)] flex-col overflow-hidden bg-background text-foreground md:-mx-8 md:-my-8 md:w-[calc(100%+4rem)] md:max-w-[calc(100%+4rem)]">
      {/* 顶栏 */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5">
        <Button variant="ghost" size="icon-sm" aria-label="返回" onClick={() => navigate('/dashboard/creation/prompts')}>
          <ArrowLeft />
        </Button>
        {editingName ? (
          <Input
            value={name}
            autoFocus
            onChange={(event) => setName(event.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(event) => event.key === 'Enter' && setEditingName(false)}
            className="h-8 w-64"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="inline-flex items-center text-base font-semibold"
          >
            {name}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<History />} onClick={() => setHistoryOpen(true)}>版本记录</Button>
          <Button size="sm" onClick={() => setSubmitOpen(true)}>提交新版</Button>
        </div>
      </header>

      {/* 双栏主体 */}
      <div className="flex min-h-0 flex-1">
        {/* 栏 1 */}
        <section className="flex min-w-0 flex-1 flex-col border-r border-border">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="h-full rounded-md border border-border bg-card p-4">
              <Textarea
                value={system}
                onChange={(event) => setSystem(event.target.value)}
                className="h-full min-h-0 resize-none rounded-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0"
              />
            </div>
          </div>
        </section>

        {/* 栏 2 · 预览与调试 */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 items-center justify-between px-4 py-3">
            <h2 className="text-base font-semibold">预览与调试</h2>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-muted-foreground/40">
            <Compass className="size-12" />
          </div>

          <div className="shrink-0 space-y-2 px-4 pb-4">
            <div className="flex min-h-32 max-h-[50svh] resize-y flex-col overflow-auto rounded-md border border-border p-3">
              <Textarea
                value={testInput}
                onChange={(event) => setTestInput(event.target.value.slice(0, 20))}
                placeholder="请输入问题测试大模型回复，回车发送，Shift+回车换行"
                className="min-h-16 flex-1 resize-none rounded-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center gap-2">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="选择知识库"
                          className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Database />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>选择知识库：{selectedKnowledge.label}</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="start" className="w-44">
                    {KNOWLEDGE_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => setKnowledgeBase(option.value)}>
                        <span className="flex-1">{option.label}</span>
                        {knowledgeBase === option.value && <Check className="size-4" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex-1" />

                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="选择模型"
                          className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Bot />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>选择模型：{selectedModel.label}</TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end" className="w-40">
                    {MODEL_OPTIONS.map((option) => (
                      <DropdownMenuItem key={option.value} onClick={() => setModel(option.value)}>
                        <span className="flex-1">{option.label}</span>
                        {model === option.value && <Check className="size-4" />}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                      当前用于测试运行
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" leftIcon={<Play />} disabled={!testInput.trim()}>运行</Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">内容由 AI 生成，无法确保真实准确，仅供参考。</p>
          </div>
        </section>
      </div>
    </main>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className={diffVersion ? 'sm:max-w-5xl' : 'sm:max-w-xl'}>
          <DialogHeader>
            <DialogTitle>{diffVersion ? '版本差异' : '版本记录'}</DialogTitle>
            <DialogDescription>
              {diffVersion ? `对比 ${diffVersion.version} 与当前编辑版本。` : '查看该提示词的历史修改记录。'}
            </DialogDescription>
          </DialogHeader>

          {diffVersion ? (
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft />} onClick={() => setDiffVersion(null)}>
                  返回版本列表
                </Button>
                <span className="text-xs text-muted-foreground">
                  红色底为历史版本，蓝色底为当前版本。
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                <PromptVersionText
                  title={`${diffVersion.version} · ${diffVersion.title}`}
                  meta={diffVersion.updatedAt}
                  content={diffVersion.content}
                  tone="history"
                />
                <PromptVersionText
                  title="当前版本"
                  meta="正在编辑"
                  content={system}
                  tone="current"
                />
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[60svh] pr-3">
              <div className="grid gap-3">
                {visibleHistory.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDiffVersion(item)}
                    className="rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                            {item.version}
                          </span>
                          <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                      </div>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.updatedAt}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">修改人：{item.operator}</p>
                      <span className="text-xs text-muted-foreground">点击查看差异</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  第 {historyPage} / {historyPageCount} 页
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<ChevronLeft />}
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                  >
                    上一页
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    rightIcon={<ChevronRight />}
                    disabled={historyPage >= historyPageCount}
                    onClick={() => setHistoryPage((page) => Math.min(historyPageCount, page + 1))}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* 提交新版确认框 — 备注选填 */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交新版</DialogTitle>
            <DialogDescription>
              将以当前模板与配置创建「{name}」的新版本。可填写本次变更的备注。
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="submit-note">备注（选填）</Label>
            <Textarea
              id="submit-note"
              value={submitNote}
              onChange={(event) => setSubmitNote(event.target.value)}
              placeholder="简述本次变更，便于版本回溯"
              className="min-h-24 resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              取消
            </Button>
            <Button
              onClick={() => {
                setSubmitOpen(false)
                setSubmitNote('')
              }}
            >
              确认提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default PromptDetail
