/**
 * [INPUT]: lucide-react 图标，mock-rbac 权限工具
 * [OUTPUT]: 控制台导航结构与按权限过滤的导航工具
 * [POS]: lib 层导航单一来源，被 DashboardTopbar / DashboardSidebar 共同消费
 * [PROTOCOL]: 新增控制台页面时同步 DASHBOARD_NAV、App.jsx 路由和 mock-rbac 菜单权限 key
 */
import {
  Database,
  FileText,
  Send,
  PenSquare,
  LayoutGrid,
  ListChecks,
  Users,
  MessageSquare,
  Heart,
  Settings,
  BookOpen,
  Lightbulb,
  ListTree,
  Wand2,
  KeyRound,
  CheckSquare,
  History,
  ShieldCheck,
  Bot,
  Newspaper,
  MonitorSmartphone,
  Building2,
  Handshake,
  Coins,
  CalendarClock,
} from 'lucide-react'
import { canView, canViewSection, routeToPermissionKey } from '@/lib/mock-rbac'

export const DASHBOARD_NAV = [
  {
    id: 'data',
    label: '数据中心',
    Icon: Database,
    items: [
      { to: '/dashboard/data/overview', label: '数据大盘', Icon: LayoutGrid },
      { to: '/dashboard/data/scenarios', label: '场景词分析', Icon: ListChecks },
      { to: '/dashboard/data/citations', label: '引用源分析', Icon: MessageSquare },
      { to: '/dashboard/data/competitors', label: 'UV数据分析', Icon: Users },
      { to: '/dashboard/data/consumption', label: '消费明细', Icon: Coins },
      { to: '/dashboard/data/monitor', label: '监测计划', Icon: CalendarClock },
      { to: '/dashboard/data/diagnosis', label: '品牌诊断', Icon: Heart },
    ],
  },
  {
    id: 'knowledge',
    label: '知识库',
    Icon: FileText,
    items: [
      { to: '/dashboard/knowledge/bases', label: '知识库管理', Icon: BookOpen },
    ],
  },
  {
    id: 'creation',
    label: '创作中心',
    Icon: PenSquare,
    items: [
      { to: '/dashboard/creation/topics', label: '核心词管理', Icon: Lightbulb },
      { to: '/dashboard/creation/articles', label: '文章列表', Icon: ListTree },
      { to: '/dashboard/creation/prompts', label: '提示词管理', Icon: Wand2 },
    ],
  },
  {
    id: 'publish',
    label: '发布中心',
    Icon: Send,
    items: [
      { to: '/dashboard/publish/auth', label: '授权管理', Icon: KeyRound },
      { to: '/dashboard/publish/tasks', label: '发布任务', Icon: CheckSquare },
      { to: '/dashboard/publish/records', label: '发布记录', Icon: History },
    ],
  },
  {
    id: 'system',
    label: '系统设置',
    Icon: Settings,
    items: [
      { to: '/dashboard/system/customers', label: '客户管理', Icon: Building2 },
      { to: '/dashboard/system/users', label: '用户管理', Icon: Users },
      { to: '/dashboard/system/operations', label: '运营管理', Icon: Handshake },
      { to: '/dashboard/system/roles', label: '角色权限', Icon: ShieldCheck },
      { to: '/dashboard/system/permissions', label: '权限配置', Icon: KeyRound },
      { to: '/dashboard/system/models', label: '模型管理', Icon: Bot },
      { to: '/dashboard/system/media', label: '媒体管理', Icon: Newspaper },
      { to: '/dashboard/system/terminals', label: '终端管理', Icon: MonitorSmartphone },
    ],
  },
]

export function sectionGroups(section) {
  return section.groups ?? [{ items: section.items }]
}

export function firstSectionItem(section) {
  return section.groups ? section.groups[0].items[0] : section.items[0]
}

export function visibleSectionsFor(user) {
  return DASHBOARD_NAV.filter((section) => canViewSection(user, section.id))
}

export function visibleSectionGroups(section, user) {
  return sectionGroups(section)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        canView(user, routeToPermissionKey(item.to))
      ),
    }))
    .filter((group) => group.items.length > 0)
}

export function firstVisibleSectionItem(section, user) {
  return visibleSectionGroups(section, user)[0]?.items[0] ?? firstSectionItem(section)
}
