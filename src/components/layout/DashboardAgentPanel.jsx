/**
 * [INPUT]: 依赖 framer-motion motion，ui/Button+Input+ScrollArea，lucide 图标，lib/motion springs，本地 cn
 * [OUTPUT]: 默认导出 DashboardAgentPanel — 顶层抽屉式 GEO 助手 (与 main 同层，开合时压缩 main 而非 overlay)
 *           命名导出 AgentTriggerButton — 顶栏触发钮 (头像 + 名)
 * [POS]: components/layout · DashboardLayout 渲染面板 · DashboardTopbar 渲染触发钮 · 两者共享 open 状态 (props 传递)
 * [PROTOCOL]: 仅 UI 骨架 (无真实对话逻辑) — 头像/欢迎语/建议提示/输入栏；动画走 springs.snappy
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bot,
  Mic,
  Paperclip,
  PanelRightClose,
  Send,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { springs } from '@/lib/motion'

const PANEL_WIDTH = 384

const SUGGESTIONS = [
  '帮我分析本周品牌触达趋势',
  '为「智能驾驶」场景推荐 5 条提示词',
  '生成「理想汽车」品牌诊断摘要',
  '对比理想 / 蔚来 / 小鹏的引用份额',
]

function AgentAvatar({ size = 32 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-primary-foreground"
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 75%, black) 100%)',
        boxShadow:
          '0 2px 6px color-mix(in srgb, var(--primary) 30%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.25), inset 0 -1px 0 rgb(0 0 0 / 0.1)',
      }}
    >
      <Bot style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  )
}

export function AgentTriggerButton({ active, onClick }) {
  return (
    <Button
      variant={active ? 'secondary' : 'outline'}
      size="sm"
      aria-label="GEO 助手"
      aria-pressed={active}
      onClick={onClick}
      leftIcon={<AgentAvatar size={24} />}
      className="h-9 border-dashed px-2"
    >
      <span className="hidden text-xs font-medium md:inline">GEO 助手</span>
    </Button>
  )
}

function DashboardAgentPanel({ open, onClose }) {
  const [draft, setDraft] = useState('')

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? PANEL_WIDTH : 0 }}
      transition={springs.snappy}
      className="sticky top-0 hidden h-svh shrink-0 overflow-hidden border-l border-border bg-card md:block"
      aria-hidden={!open}
    >
      <div className="flex h-full flex-col" style={{ width: PANEL_WIDTH }}>
        {/* ---------- Header ---------- */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <AgentAvatar size={28} />
            <span className="text-sm font-semibold">GEO 助手</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="收起助手"
            onClick={onClose}
          >
            <PanelRightClose />
          </Button>
        </div>

        {/* ---------- 欢迎 + 建议 ---------- */}
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="rounded-2xl bg-muted/50 p-4">
            <Sparkles className="mb-2 size-4 text-primary" />
            <p className="text-sm font-medium">你好，我是火山 GEO 智能助手</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              基于你的知识库 + 监测数据，告诉我你想做什么，我们一起来。
            </p>
          </div>

          <p className="mb-2 mt-5 text-xs text-muted-foreground">试试这些：</p>
          <div className="space-y-2">
            {SUGGESTIONS.map((s) => (
              <Button
                key={s}
                variant="outline"
                onClick={() => setDraft(s)}
                leftIcon={<Sparkles className="mt-0.5 text-primary" />}
                className="h-auto w-full items-start justify-start whitespace-normal px-3 py-2.5 text-left text-sm font-normal"
              >
                <span className="flex-1">{s}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* ---------- 输入栏 ---------- */}
        <div className="border-t border-border p-3">
          <div className="rounded-2xl border border-border bg-background p-3 shadow-[0_1px_0_rgb(255_255_255/0.5)_inset]">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="输入消息"
              className="h-8 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="mt-2 flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" aria-label="附件"><Paperclip /></Button>
              <Button variant="ghost" size="icon-sm" aria-label="语音"><Mic /></Button>
              <div className="flex-1" />
              <Button
                size="icon-sm"
                aria-label="发送"
                disabled={!draft.trim()}
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}

export default DashboardAgentPanel
