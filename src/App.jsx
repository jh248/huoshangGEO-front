/**
 * [INPUT]: 依赖 react-router-dom 的 BrowserRouter/Routes/Route/Navigate/useLocation，framer-motion AnimatePresence，contexts/AuthProvider，auth/RequireAuth，layout/Layout + DashboardLayout，所有页面
 * [OUTPUT]: 默认导出 App 根组件 · 顶层 AuthProvider + BrowserRouter + AnimatedRoutes
 * [POS]: src/ 的应用根，被 main.jsx 唯一消费 (main.jsx 顶层挂 MotionConfig reducedMotion="user")
 * [PROTOCOL]: 路由层级 — 公共 / + 设计系统 / 受保护 /dashboard 子树 (RequireAuth)
 *             AnimatedRoutes 用 location.pathname 作 key 触发 enter/exit，配合页面顶层 motion.div + pageTransition
 */
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import RequireAuth from '@/components/auth/RequireAuth'
import RequirePermission from '@/components/auth/RequirePermission'
import Layout from '@/components/layout/Layout'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LandingPage from '@/pages/LandingPage'
import BrandDiagnosisPage from '@/pages/BrandDiagnosisPage'
import CasesPage from '@/pages/CasesPage'
import DesignSystem from '@/pages/DesignSystem'
import DataOverview from '@/pages/dashboard/data/Overview'
import DataScenarios from '@/pages/dashboard/data/Scenarios'
import DataCompetitors from '@/pages/dashboard/data/Competitors'
import DataConsumption from '@/pages/dashboard/data/Consumption'
import DataMonitorPlans from '@/pages/dashboard/data/MonitorPlans'
import DataCitations from '@/pages/dashboard/data/Citations'
import DataDiagnosis from '@/pages/dashboard/data/Diagnosis'
import KnowledgeBases from '@/pages/dashboard/knowledge/Bases'
import KnowledgeTags from '@/pages/dashboard/knowledge/Tags'
import Information from '@/pages/dashboard/knowledge/Information'
import SystemCustomers from '@/pages/dashboard/system/Customers'
import SystemUsers from '@/pages/dashboard/system/Users'
import SystemOperations from '@/pages/dashboard/system/Operations'
import SystemRoles from '@/pages/dashboard/system/Roles'
import SystemPermissions from '@/pages/dashboard/system/Permissions'
import SystemModels from '@/pages/dashboard/system/Models'
import SystemMedia from '@/pages/dashboard/system/Media'
import SystemTerminals from '@/pages/dashboard/system/Terminals'
import * as DataStubs from '@/pages/dashboard/data/stubs'
import * as CreateStubs from '@/pages/dashboard/creation/stubs'
import * as PublishStubs from '@/pages/dashboard/publish/stubs'
import PublishTasks from '@/pages/dashboard/publish/Tasks'

function withPermission(permissionKey, element) {
  return (
    <RequirePermission permissionKey={permissionKey}>
      {element}
    </RequirePermission>
  )
}

// ============================================================================
// 路由表
// /                              LandingPage    自带 chrome
// /brand-diagnosis               BrandDiagnosisPage 公开品牌诊断 / 实时搜索页
// /design-system                 DesignSystem   Layout 包裹
// /dashboard                     RequireAuth → DashboardLayout
//   ├ data/overview              DataOverview   登录默认落地
//   ├ data/{prompt-strategy|scenarios|citations|competitors|diagnosis}
//   ├ knowledge/{bases|tags|information}
//   ├ creation/{topics|content|articles|prompts}
//   ├ publish/{auth|tasks|records}
//   └ system/{company|users|roles|permissions} 系统设置 · RBAC (RequirePermission)
// ============================================================================
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<LandingPage />} />
        <Route path="brand-diagnosis" element={<BrandDiagnosisPage />} />

        <Route element={<Layout />}>
          <Route path="design-system" element={<DesignSystem />} />
          <Route path="cases" element={<CasesPage />} />
        </Route>

        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="data/overview" replace />} />

          {/* 数据中心 */}
          <Route path="data/overview" element={withPermission('data.overview', <DataOverview />)} />
          <Route path="data/prompt-strategy" element={<DataStubs.PromptStrategy />} />
          <Route path="data/scenarios" element={withPermission('data.scenarios', <DataScenarios />)} />
          <Route path="data/citations" element={withPermission('data.citations', <DataCitations />)} />
          <Route path="data/competitors" element={withPermission('data.competitors', <DataCompetitors />)} />
          <Route path="data/consumption" element={withPermission('data.consumption', <DataConsumption />)} />
          <Route path="data/monitor" element={withPermission('data.monitor', <DataMonitorPlans />)} />
          <Route path="data/diagnosis" element={withPermission('data.diagnosis', <DataDiagnosis />)} />
          <Route path="data/settings" element={<DataStubs.DataSettings />} />

          {/* 知识库 */}
          <Route path="knowledge/bases" element={withPermission('knowledge.bases', <KnowledgeBases />)} />
          <Route path="knowledge/tags" element={withPermission('knowledge.tags', <KnowledgeTags />)} />
          <Route path="knowledge/information" element={withPermission('knowledge.information', <Information />)} />

          {/* 创作中心 */}
          <Route path="creation/topics" element={withPermission('creation.topics', <CreateStubs.Topics />)} />
          <Route path="creation/content" element={withPermission('creation.content', <CreateStubs.ContentCreate />)} />
          <Route path="creation/articles" element={withPermission('creation.articles', <CreateStubs.Articles />)} />
          <Route path="creation/prompts" element={withPermission('creation.prompts', <CreateStubs.Prompts />)} />
          <Route path="creation/prompts/:id" element={withPermission('creation.prompts', <CreateStubs.PromptDetail />)} />

          {/* 发布中心 */}
          <Route path="publish/auth" element={withPermission('publish.auth', <PublishStubs.AuthMgmt />)} />
          <Route path="publish/tasks" element={withPermission('publish.tasks', <PublishTasks />)} />
          <Route path="publish/records" element={withPermission('publish.records', <PublishStubs.Records />)} />

          {/* 系统设置 */}
          <Route path="system/models" element={withPermission('system.models', <SystemModels />)} />
          <Route path="system/media" element={withPermission('system.media', <SystemMedia />)} />
          <Route path="system/terminals" element={withPermission('system.terminals', <SystemTerminals />)} />
          <Route path="system/customers" element={withPermission('system.customers', <SystemCustomers />)} />
          <Route path="system/users" element={withPermission('system.users', <SystemUsers />)} />
          <Route path="system/operations" element={withPermission('system.operations', <SystemOperations />)} />
          <Route path="system/roles" element={withPermission('system.roles', <SystemRoles />)} />
          <Route path="system/permissions" element={withPermission('system.permissions', <SystemPermissions />)} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
