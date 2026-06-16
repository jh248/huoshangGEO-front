/**
 * [INPUT]: 依赖 react state、react-router useParams/useLocation/useNavigate、ui/Button/Badge/Input/Textarea/Switch/Tabs/SingleSelect/DropdownMenu、lucide、lib/utils cn
 * [OUTPUT]: 默认导出 PromptDetail — Prompt 编排/调试工作台 (双栏：模板 / 预览调试)
 * [POS]: /dashboard/creation/prompts/:id 路由 · 创建/编辑 Prompt 后进入
 * [PROTOCOL]: 调试与运行为前端骨架，无真实模型调用；接入后端时替换运行逻辑与版本提交
 */
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Braces,
  ChevronDown,
  Compass,
  History,
  MoreHorizontal,
  Pencil,
  Play,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SingleSelect } from '@/components/ui/single-select'

const DEFAULT_SYSTEM = `你是一名高效的学习助理，请观看用户上传的课堂录播视频，并提取出本堂课的核心内容，生成一份精炼的学习笔记。

**工作准则**：
1. **识别主题**：首先确定本堂课的核心主题。
2. **提取关键知识点**：以列表形式，列出视频中讲解的所有关键知识点和定义。
3. **记录案例**：记录视频中提到的重要案例或示例，并简要说明其用途。
4. **生成思考题**：根据课程内容，生成 3 个相关的思考题，帮助用户巩固学习。
5. **结构化输出**：所有内容需以 JSON 格式返回。`

function PromptDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialName = location.state?.name ?? location.state?.prompt?.name ?? '未命名 Prompt'

  const [name, setName] = useState(initialName)
  const [editingName, setEditingName] = useState(false)
  const [system, setSystem] = useState(location.state?.prompt?.system ?? DEFAULT_SYSTEM)
  const [testInput, setTestInput] = useState('')

  return (
    <main className="-mx-4 -my-6 flex h-[calc(100svh-3.5rem)] min-h-0 w-[calc(100%+2rem)] max-w-[calc(100%+2rem)] flex-col overflow-hidden bg-background text-foreground md:-mx-8 md:-my-8 md:w-[calc(100%+4rem)] md:max-w-[calc(100%+4rem)]">
      {/* 顶栏 */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2.5">
        <Button variant="ghost" size="icon-sm" aria-label="返回" onClick={() => navigate('/dashboard/creation/prompts')}>
          <ArrowLeft />
        </Button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Braces className="size-4" />
        </span>
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
            className="inline-flex items-center gap-1.5 text-base font-semibold"
          >
            {name}
            <Pencil className="size-3.5 text-muted-foreground" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<History />}>版本记录</Button>
          <Button variant="outline" size="sm" leftIcon={<Sparkles />} rightIcon={<ChevronDown />}>智能优化</Button>
          <Button size="sm">提交新版</Button>
          <Button variant="ghost" size="icon-sm" aria-label="更多">
            <MoreHorizontal />
          </Button>
        </div>
      </header>

      {/* 双栏主体 */}
      <div className="flex min-h-0 flex-1">
        {/* 栏 1 */}
        <section className="flex min-w-0 flex-1 flex-col border-r border-border">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-md border border-border bg-card p-4">
              <Textarea
                value={system}
                onChange={(event) => setSystem(event.target.value)}
                className="min-h-[32rem] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
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
            <SingleSelect
              Icon={Play}
              options={[
                { value: 'single', label: '单次运行' },
                { value: 'batch', label: '批量运行' },
              ]}
              defaultValue="single"
            />
            <div className="rounded-md border border-border p-3">
              <Textarea
                value={testInput}
                onChange={(event) => setTestInput(event.target.value.slice(0, 20))}
                placeholder="请输入问题测试大模型回复，回车发送，Shift+回车换行"
                className="min-h-16 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" className="ml-auto" leftIcon={<Play />}>运行</Button>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">内容由 AI 生成，无法确保真实准确，仅供参考。</p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default PromptDetail
