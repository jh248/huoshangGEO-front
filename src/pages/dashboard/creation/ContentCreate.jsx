/**
 * [INPUT]: 依赖 react 状态，ui/Button+Textarea+Tooltip，lucide-react 图标，私有 TiptapEditor (Tiptap 富文本)
 * [OUTPUT]: 默认导出 ContentCreate — Dashboard 内嵌 YouMind 风格内容创作工作台
 * [POS]: pages/dashboard/creation 真实内容创作页，App.jsx 经 stubs.jsx 导出消费
 * [PROTOCOL]: 保留 Dashboard 顶栏与侧边栏；左 Tiptap 文档右任务，页面不产生整体滚动
 */
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowUp,
  Bot,
  Braces,
  Check,
  Database,
  History,
  Plus,
  Save,
  Send,
  Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TiptapEditor } from './_tiptapEditor'
import { cn } from '@/lib/utils'

const INITIAL_HTML = `
<h1>知识库调研</h1>
<h2>一、为什么需要知识库？</h2>
<p>为什么需要知识库，其实就是为了解决 3 个问题</p>
<ol>
  <li>解决模型幻觉问题</li>
  <li>解决无法访问私有数据问题</li>
  <li>解决没法获取实时数据问题</li>
</ol>
<p>为什么我们的 GEO 系统需要知识库？</p>
<p>其实就是为了优化文章内容的生成基础，避免模型在生成文章时胡编乱造，导致我们俗称的投毒。</p>
<p>当我们把知识库做好时，也是在提升我们 GEO 系统整体的有效性。</p>
<p>我认为：</p>
<p>好的知识库 + 好的 prompt = 好的文章</p>
<p>好的监控 + 好的 prompt 优化 = 好的 GEO 系统</p>
<p>当然后续我们可以以知识库作为基础，进行不同 Agent 的设计，帮助企业做 AI 转型等。</p>
<h2>二、RAG 基础原理</h2>
<h3>1.RAG 是什么？</h3>
<p>RAG = Retrieval-Augmented Generation = 检索增强生成。</p>
`

const MODEL_OPTIONS = [
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'doubao', label: '豆包' },
  { value: 'kimi', label: 'Kimi' },
  { value: 'chatgpt', label: 'ChatGPT' },
]

const HISTORY_ITEMS = [
  { id: 'h1', title: '知识库调研文章优化', time: '今天 09:12' },
  { id: 'h2', title: '护眼大路灯种草长文', time: '昨天 18:40' },
  { id: 'h3', title: '品牌监测复盘提纲', time: '06-22 16:20' },
]

const MEDIA_POOL = [
  { id: 'baijiahao', name: '百家号' },
  { id: 'toutiao', name: '今日头条' },
  { id: 'zhihu', name: '知乎' },
  { id: 'sohu', name: '搜狐号' },
  { id: 'juejin', name: '掘金' },
]

function IconButton({ label, icon, active = false, circle = false, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onClick={onClick}
          className={cn(
            'size-9 text-muted-foreground hover:bg-muted hover:text-foreground',
            circle ? 'rounded-full border border-border' : 'rounded-xl',
            active && 'bg-muted text-foreground'
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function TaskComposer({ chatDraft, setChatDraft, onSend }) {
  const [model, setModel] = useState(MODEL_OPTIONS[0].value)
  const selectedModel = MODEL_OPTIONS.find((item) => item.value === model) ?? MODEL_OPTIONS[0]

  return (
    <div className="flex min-h-32 max-h-[50svh] resize-y flex-col overflow-auto rounded-md border border-border p-3">
      <Textarea
        value={chatDraft}
        onChange={(event) => setChatDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSend()
          }
        }}
        placeholder="开始创作，回车发送，Shift+回车换行"
        aria-label="任务输入"
        className="min-h-16 flex-1 resize-none rounded-none border-0 bg-transparent p-0 shadow-none outline-none focus-visible:border-transparent focus-visible:ring-0"
      />
      <div className="mt-2 flex items-center gap-2">
        <IconButton label="选择知识库" icon={<Database />} />
        <IconButton label="选择 Prompt" icon={<Braces />} />
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
          <DropdownMenuContent align="end">
            {MODEL_OPTIONS.map((option) => (
              <DropdownMenuItem key={option.value} onClick={() => setModel(option.value)}>
                <span className="flex-1">{option.label}</span>
                {model === option.value && <Check className="size-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          size="icon"
          aria-label="发送"
          disabled={!chatDraft.trim()}
          onClick={onSend}
          className="size-11 rounded-full"
        >
          <ArrowUp />
        </Button>
      </div>
    </div>
  )
}

function HistoryMenu() {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="历史对话"
              className="size-9 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <History />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>历史对话</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-64">
        {HISTORY_ITEMS.map((item) => (
          <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PublishArticleDialog({ open, mediaIds, onToggleMedia, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文章发布</DialogTitle>
          <DialogDescription>选择文章要发布到的媒体，媒体来源与发布任务保持一致。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">发布媒体</span>
            <span className="text-xs text-muted-foreground">已选 {mediaIds.length} 个</span>
          </div>
          <ScrollArea className="h-44 rounded-md border border-border">
            <div className="grid gap-1 p-2">
              {MEDIA_POOL.map((media) => {
                const checked = mediaIds.includes(media.id)
                return (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => onToggleMedia(media.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted',
                      checked && 'bg-primary/10',
                    )}
                  >
                    <Checkbox checked={checked} className="pointer-events-none" />
                    <span className="truncate">{media.name}</span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" leftIcon={<Send />} disabled={mediaIds.length === 0} onClick={onConfirm}>
            确认发布
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* 编辑器顶部工具条 — 保存文章 + 插入块(+) + 文字样式(Aa) */
function EditorToolbar({ editorRef, onSave, onPublish, saved, onBack }) {
  const runCommand = (apply) => {
    const editor = editorRef.current?.editor
    if (editor) apply(editor.chain().focus()).run()
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 md:px-6">
      <Button variant="ghost" size="icon-sm" aria-label="返回" className="rounded-xl" onClick={onBack}>
        <ArrowLeft />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="插入块" className="rounded-xl">
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => runCommand((c) => c.setParagraph())}>正文</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleHeading({ level: 1 }))}>标题 1</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleHeading({ level: 2 }))}>标题 2</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleHeading({ level: 3 }))}>标题 3</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleBulletList())}>无序列表</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleOrderedList())}>有序列表</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleBlockquote())}>引用</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleCodeBlock())}>代码块</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.setHorizontalRule())}>分割线</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="文字样式" className="rounded-xl">
            <Type />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleBold())}>加粗</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleItalic())}>斜体</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleStrike())}>删除线</DropdownMenuItem>
          <DropdownMenuItem onClick={() => runCommand((c) => c.toggleCode())}>行内代码</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={saved ? '已保存' : '保存文章'}
              onClick={onSave}
              className="text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            >
              {saved ? <Check /> : <Save />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{saved ? '已保存' : '保存文章'}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="文章发布"
              onClick={onPublish}
              className="text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            >
              <Send />
            </Button>
          </TooltipTrigger>
          <TooltipContent>文章发布</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function ContentCreate() {
  const navigate = useNavigate()
  const [chatDraft, setChatDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishMediaIds, setPublishMediaIds] = useState([MEDIA_POOL[0].id])
  const editorRef = useRef(null)

  const [asideWidth, setAsideWidth] = useState(440)
  const containerRef = useRef(null)

  const sendMessage = () => {
    const text = chatDraft.trim()
    if (!text) return
    editorRef.current?.appendBlockquote(text)
    setChatDraft('')
  }

  const handleSave = () => {
    const html = editorRef.current?.editor?.getHTML()
    if (html == null) return
    // TODO: 接入后端保存接口；当前仅做前端反馈
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  const togglePublishMedia = (id) => {
    setPublishMediaIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ))
  }

  const handlePublish = () => {
    if (publishMediaIds.length === 0) return
    setPublishOpen(false)
  }

  const startResize = (event) => {
    event.preventDefault()
    const onMove = (moveEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const next = rect.right - moveEvent.clientX
      const max = Math.max(320, rect.width - 480)
      setAsideWidth(Math.min(max, Math.max(320, next)))
    }
    const onUp = () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <TooltipProvider>
      <main
        className="-mx-4 -my-6 h-[calc(100svh-3.5rem)] min-h-0 w-[calc(100%+2rem)] max-w-[calc(100%+2rem)] overflow-hidden bg-background text-foreground md:-mx-8 md:-my-8 md:h-[calc(100svh-3.5rem)] md:w-[calc(100%+4rem)] md:max-w-[calc(100%+4rem)]"
      >
        <div
          ref={containerRef}
          className="flex h-full w-full max-w-full overflow-hidden rounded-none border border-transparent bg-background"
        >
          <section className="flex min-w-0 flex-1 flex-col bg-background">
            <EditorToolbar
              editorRef={editorRef}
              onSave={handleSave}
              onPublish={() => setPublishOpen(true)}
              saved={saved}
              onBack={() => navigate('/dashboard/creation/articles')}
            />
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="flex h-full">
                <div className="min-w-0 flex-1 overflow-y-auto">
                  <div className="mx-auto max-w-3xl px-8 pb-28 pt-6 md:px-12 lg:px-14">
                    <TiptapEditor ref={editorRef} initialContent={INITIAL_HTML} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="拖动调整宽度"
            onMouseDown={startResize}
            className="group relative z-10 flex w-2 shrink-0 cursor-col-resize items-stretch justify-center"
          >
            <span className="w-px bg-border transition-colors group-hover:bg-primary/50" />
          </div>

          <aside
            style={{ width: asideWidth }}
            className="flex shrink-0 flex-col bg-background"
          >
            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
              <div className="flex shrink-0 justify-end py-4">
                <HistoryMenu />
              </div>
              <div className="min-h-0 flex-1" />
              <div>
                <TaskComposer
                  chatDraft={chatDraft}
                  setChatDraft={setChatDraft}
                  onSend={sendMessage}
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
      <PublishArticleDialog
        open={publishOpen}
        mediaIds={publishMediaIds}
        onToggleMedia={togglePublishMedia}
        onOpenChange={setPublishOpen}
        onConfirm={handlePublish}
      />
    </TooltipProvider>
  )
}

export default ContentCreate
