/**
 * [INPUT]: 依赖 ui/Button+Badge+Table，lucide 图标，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 MonitorPlans — 监测计划页 (汇总条 + 增加监测计划 + 计划表 恢复/暂停/复制/删除/修改)
 * [POS]: /dashboard/data/monitor 路由，数据中心子页
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)；状态/操作随行变化
 */
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell, PageSectionCard } from '../_PageShell'

/* ============================================================================
 * Mock 数据
 * ========================================================================== */
const INITIAL_PLANS = [
  {
    id: 1,
    brand: '西屋大路灯',
    name: '西屋大路灯',
    source: '我的计划',
    aiCount: 0,
    platforms: 4,
    freq: '1天1次',
    cost: 0,
    createdAt: '2026-05-16 14:20:39',
    status: 'paused',
  },
]

const STATUS_META = {
  running: { label: '监测中', variant: 'accent' },
  paused: { label: '已暂停', variant: 'secondary' },
}

let seq = INITIAL_PLANS.length

/* ============================================================================
 * MonitorPlans
 * ========================================================================== */
function MonitorPlans() {
  const [plans, setPlans] = useState(INITIAL_PLANS)

  const toggleStatus = (id) =>
    setPlans((list) =>
      list.map((p) =>
        p.id === id ? { ...p, status: p.status === 'running' ? 'paused' : 'running' } : p,
      ),
    )

  const removePlan = (id) => setPlans((list) => list.filter((p) => p.id !== id))

  const copyPlan = (id) =>
    setPlans((list) => {
      const src = list.find((p) => p.id === id)
      if (!src) return list
      seq += 1
      return [...list, { ...src, id: seq, name: `${src.name} 副本`, status: 'paused' }]
    })

  const addPlan = () => {
    seq += 1
    setPlans((list) => [
      ...list,
      {
        id: seq,
        brand: '西屋大路灯',
        name: `监测计划 ${seq}`,
        source: '我的计划',
        aiCount: 0,
        platforms: 4,
        freq: '1天1次',
        cost: 0,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        status: 'paused',
      },
    ])
  }

  return (
    <PageShell>
      <PageSectionCard
        title="监测计划"
        actions={
          <Button size="sm" leftIcon={<Plus />} onClick={addPlan}>
            增加监测计划
          </Button>
        }
      >
        {/* 计划表 */}
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">监测品牌</TableHead>
                <TableHead>计划名称</TableHead>
                <TableHead className="text-right">场景词</TableHead>
                <TableHead className="text-right">监测平台</TableHead>
                <TableHead>监测频次</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="pr-4">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    暂无监测计划
                  </TableCell>
                </TableRow>
              )}
              {plans.map((p) => {
                const status = STATUS_META[p.status] ?? STATUS_META.paused
                return (
                  <TableRow key={p.id}>
                    <TableCell className="pl-4 font-medium">{p.brand}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.aiCount}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.platforms}</TableCell>
                    <TableCell className="text-muted-foreground">{p.freq}</TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">{p.createdAt}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => toggleStatus(p.id)}>
                          {p.status === 'running' ? '暂停监测' : '恢复监测'}
                        </Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0">修改计划</Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => removePlan(p.id)}>删除监测</Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => copyPlan(p.id)}>复制计划</Button>
                        <span className="text-border">|</span>
                        <Button variant="link" size="sm" className="h-auto p-0">修改记录</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </PageSectionCard>
    </PageShell>
  )
}

export default MonitorPlans
