/**
 * [INPUT]: 依赖 ui/SingleSelect 与 lucide CalendarClock
 * [OUTPUT]: 命名导出 BrandPlanFilter — 数据中心页面顶部品牌计划单选筛选
 * [POS]: pages/dashboard/data 私有筛选组件，Overview / Scenarios / Citations 共享消费
 * [PROTOCOL]: 当前为 mock 计划列表；接后端后保持 options 结构 { value, label }
 */
import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { SingleSelect } from '@/components/ui/single-select'

const BRAND_PLAN_OPTIONS = [
  { value: 'westinghouse-road-lamp', label: '西屋大路灯' },
  { value: 'eye-care-road-lamp', label: '护眼大路灯' },
  { value: 'cross-border-ip', label: '跨境知产服务' },
]

export function BrandPlanFilter({ value, onChange }) {
  const [internalValue, setInternalValue] = useState(BRAND_PLAN_OPTIONS[0].value)
  const selected = value ?? internalValue

  const handleChange = (next) => {
    if (value === undefined) setInternalValue(next)
    onChange?.(next)
  }

  return (
    <SingleSelect
      Icon={CalendarClock}
      label="品牌计划"
      options={BRAND_PLAN_OPTIONS}
      value={selected}
      onValueChange={handleChange}
      triggerClassName="h-10 rounded-md"
      contentClassName="w-64"
      withSearch
    />
  )
}
