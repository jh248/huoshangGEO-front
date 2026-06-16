/**
 * [INPUT]: 依赖 ../_StubPage
 * [OUTPUT]: 命名导出 PromptStrategy / DataSettings (Scenarios / Diagnosis / Competitors / Citations 已拆为独立文件)
 * [POS]: pages/dashboard/data 占位集合 · App.jsx 路由消费 · 真页面落地时拆出独立文件
 * [PROTOCOL]: 仅占位骨架，禁止塞业务；新增数据中心页面在 DashboardSidebar.DASHBOARD_NAV 追加
 */
import StubPage from '../_StubPage'

export const PromptStrategy = () => (
  <StubPage sections={['提示词分组', '触发覆盖率', '策略 A/B']} />
)
export const DataSettings = () => (
  <StubPage sections={['监测配置', '推送规则', '账号同步']} />
)
