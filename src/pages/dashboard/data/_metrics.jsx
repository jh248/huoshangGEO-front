/**
 * [INPUT]: 依赖 ui/Tooltip + lucide HelpCircle
 * [OUTPUT]: 命名导出 METRIC_INFO / MetricHint / SectionTitle — 4 个核心指标的「?」气泡解释
 * [POS]: pages/dashboard/data 私有共享层，被 Overview / Scenarios 等数据页同源消费
 * [PROTOCOL]: 指标定义是单一真相，新增/改名只在此调整；调用方传 name 字符串引用
 */
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export const METRIC_INFO = {
  '提及次数': {
    desc: '在「场景词」的对话中出现目标产品的次数。',
    value: '「提及次数」越高，目标产品在 AI 对话中越容易被更多用户看见。',
  },
  '提及总次数': {
    desc: '在「场景词」的对话中出现目标产品的累计总次数。',
    value: '「提及总次数」越高，目标产品在 AI 对话中越容易被更多用户看见。',
  },
  '提及率': {
    desc: '在「场景词」的对话中目标产品的次数在所有对话中的占比。\n公式：提及率 = 出现目标产品对话 / 总对话数 (例如总共 10 次对话，其中 5 次出现目标产品，提及率 = 5/10 = 50%)。',
    value: '「提及率」越高，目标产品在 AI 对话中越容易被更多用户看见。',
  },
  '平均提及位次': {
    desc: '「目标产品」在对话中出现在第几名的平均值。\n公式：平均提及位次 = 每次出现位次综合 / 次数 (例如总共 3 次对话，2 次第一，1 次第二，平均提及位次 = (1+1+2)/3 = 1.3 名)。',
    value: '「平均提及位次」越高，目标产品在 AI 模型越容易被用户引用。',
  },
  'Top 引用来源': {
    desc: '在「场景词」的对话中所有链接的来源平台。',
    value: '可以分析出做场景词的对话过程中模型喜欢引用的来源平台。',
  },
}

export function MetricHint({ name, side = 'top' }) {
  const info = METRIC_INFO[name]
  if (!info) return null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`${name} 指标解释`}
          className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs whitespace-pre-line text-left leading-relaxed">
        <p className="font-medium">{name}</p>
        <p className="mt-1 opacity-90">{info.desc}</p>
        <p className="mt-1 opacity-70">价值：{info.value}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export function SectionTitle({ name }) {
  return (
    <span className="flex items-center gap-1.5">
      {name}
      <MetricHint name={name} />
    </span>
  )
}
