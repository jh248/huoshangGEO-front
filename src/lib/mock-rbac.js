/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: mock RBAC 数据与权限工具 — 公司 / 菜单树 / 角色 / 用户 / session 构造 / 权限判断
 * [POS]: lib 层 mock 单一来源；AuthContext、系统设置页面、导航与路由守卫共同消费
 * [PROTOCOL]: 纯前端演示数据；接真实接口时替换 buildSessionUser() 与权限判断输入即可
 */

export const COMPANIES = [
  { id: 'huoshan-geo', name: '火山 GEO' },
  { id: 'mickey-micro', name: '米奇微影' },
  { id: 'litemos', name: '理想汽车' },
  { id: 'nova-saas', name: 'Nova SaaS' },
  { id: 'aurora-fmcg', name: '极光消费' },
]

export const MENU_TREE = [
  {
    sectionId: 'data',
    sectionLabel: '数据中心',
    items: [
      { key: 'data.overview', label: '数据大盘' },
      { key: 'data.scenarios', label: '场景词分析' },
      { key: 'data.citations', label: '引用源分析' },
      { key: 'data.competitors', label: 'UV数据分析' },
      { key: 'data.consumption', label: '消费明细' },
      { key: 'data.monitor', label: '监测计划' },
      { key: 'data.diagnosis', label: '品牌诊断' },
    ],
  },
  {
    sectionId: 'knowledge',
    sectionLabel: '知识库',
    items: [
      { key: 'knowledge.bases', label: '知识库管理' },
      { key: 'knowledge.tags', label: '标签管理' },
      { key: 'knowledge.information', label: '信息管理' },
    ],
  },
  {
    sectionId: 'creation',
    sectionLabel: '创作中心',
    items: [
      { key: 'creation.topics', label: '核心词管理' },
      { key: 'creation.content', label: '内容创作' },
      { key: 'creation.articles', label: '文章列表' },
      { key: 'creation.prompts', label: '提示词管理' },
    ],
  },
  {
    sectionId: 'publish',
    sectionLabel: '发布中心',
    items: [
      { key: 'publish.auth', label: '授权管理' },
      { key: 'publish.tasks', label: '发布任务' },
      { key: 'publish.records', label: '发布记录' },
    ],
  },
  {
    sectionId: 'system',
    sectionLabel: '系统设置',
    items: [
      { key: 'system.models', label: '模型管理' },
      { key: 'system.media', label: '媒体管理' },
      { key: 'system.terminals', label: '终端管理' },
      { key: 'system.customers', label: '客户管理' },
      { key: 'system.users', label: '用户管理' },
      { key: 'system.operations', label: '运营管理' },
      { key: 'system.roles', label: '角色权限' },
      { key: 'system.permissions', label: '权限配置' },
    ],
  },
]

export const MENU_KEYS = MENU_TREE.flatMap((s) => s.items.map((i) => i.key))

export const BUTTON_ACTIONS = [
  { key: 'create', label: '新增' },
  { key: 'edit', label: '编辑' },
  { key: 'delete', label: '删除' },
  { key: 'export', label: '导出' },
  { key: 'publish', label: '发布' },
  { key: 'diagnose', label: '诊断' },
]

export const DEFAULT_BUTTON_PERMISSIONS = {
  'data.overview': ['export'],
  'data.scenarios': ['create', 'edit', 'delete', 'export'],
  'data.competitors': ['export'],
  'data.consumption': ['export'],
  'data.citations': ['export'],
  'data.monitor': ['create', 'edit', 'delete'],
  'data.diagnosis': ['create', 'delete', 'diagnose'],
  'knowledge.bases': ['create', 'edit', 'delete'],
  'knowledge.tags': ['create', 'edit', 'delete'],
  'knowledge.information': ['create', 'edit', 'delete', 'export'],
  'creation.topics': ['create', 'edit', 'delete'],
  'creation.content': ['create', 'edit', 'delete'],
  'creation.articles': ['create', 'edit', 'delete', 'publish'],
  'creation.prompts': ['create', 'edit', 'delete'],
  'publish.auth': ['create', 'edit', 'delete'],
  'publish.tasks': ['create', 'edit', 'delete', 'publish'],
  'publish.records': ['export'],
  'system.models': ['create', 'edit', 'delete'],
  'system.media': ['create', 'edit', 'delete'],
  'system.terminals': ['edit', 'delete'],
  'system.customers': ['create', 'edit', 'delete'],
  'system.users': ['create', 'edit', 'delete'],
  'system.operations': ['create', 'edit', 'delete'],
  'system.roles': ['create', 'edit', 'delete'],
  'system.permissions': ['create', 'edit', 'delete'],
}

export const PERMISSION_CATALOG = MENU_TREE.flatMap((section) =>
  section.items.map((item) => ({
    sectionId: section.sectionId,
    sectionLabel: section.sectionLabel,
    menuKey: item.key,
    menuLabel: item.label,
    buttons: (DEFAULT_BUTTON_PERMISSIONS[item.key] ?? []).map((actionKey) => {
      const action = BUTTON_ACTIONS.find((a) => a.key === actionKey)
      return {
        key: actionKey,
        label: action?.label ?? actionKey,
        code: `${item.key}.${actionKey}`,
      }
    }),
  }))
)

function emptyActions(menuKey) {
  return Object.fromEntries(
    (DEFAULT_BUTTON_PERMISSIONS[menuKey] ?? []).map((actionKey) => [actionKey, false])
  )
}

function fullActions(menuKey) {
  return Object.fromEntries(
    (DEFAULT_BUTTON_PERMISSIONS[menuKey] ?? []).map((actionKey) => [actionKey, true])
  )
}

export function emptyPermissions() {
  return Object.fromEntries(MENU_KEYS.map((k) => [k, { view: false, manage: false, actions: emptyActions(k) }]))
}

export function fullPermissions() {
  return Object.fromEntries(MENU_KEYS.map((k) => [k, { view: true, manage: true, actions: fullActions(k) }]))
}

function permissionsFor(viewKeys, manageKeys = [], actionKeys = {}) {
  const base = emptyPermissions()
  for (const k of viewKeys) if (base[k]) base[k].view = true
  for (const k of manageKeys) if (base[k]) base[k] = { view: true, manage: true, actions: fullActions(k) }
  for (const [menuKey, actions] of Object.entries(actionKeys)) {
    if (!base[menuKey]) continue
    base[menuKey].view = true
    base[menuKey].actions = { ...base[menuKey].actions }
    for (const action of actions) if (action in base[menuKey].actions) base[menuKey].actions[action] = true
    const available = DEFAULT_BUTTON_PERMISSIONS[menuKey] ?? []
    base[menuKey].manage = available.length > 0 && available.every((action) => base[menuKey].actions[action])
  }
  return base
}

export const INITIAL_ROLES = [
  {
    id: 'super-admin',
    name: '系统总管理员',
    description: '拥有全部菜单与配置权限，系统内置，不可编辑或删除。',
    system: true,
    permissions: fullPermissions(),
  },
  {
    id: 'company-admin',
    name: '公司管理员',
    description: '管理所辖公司的数据、知识库与创作内容，不能进入系统设置。',
    system: false,
    permissions: permissionsFor(
      [
        'data.overview',
        'data.scenarios',
        'data.competitors',
        'data.consumption',
        'data.citations',
        'data.monitor',
        'data.diagnosis',
        'knowledge.bases',
        'knowledge.tags',
        'knowledge.information',
        'creation.topics',
        'creation.content',
        'creation.articles',
        'creation.prompts',
      ],
      ['knowledge.bases', 'knowledge.tags', 'knowledge.information', 'creation.content'],
      {
        'data.diagnosis': ['diagnose'],
        'data.scenarios': ['export'],
      },
    ),
  },
  {
    id: 'content-operator',
    name: '内容运营',
    description: '专注创作中心与知识库信息，只读数据看板。',
    system: false,
    permissions: permissionsFor(
      ['data.overview', 'knowledge.bases', 'knowledge.tags', 'knowledge.information', 'creation.topics', 'creation.content', 'creation.articles', 'creation.prompts'],
      [],
      {
        'creation.content': ['create', 'edit'],
        'creation.articles': ['create', 'edit'],
      },
    ),
  },
  {
    id: 'publisher',
    name: '发布运营',
    description: '负责渠道授权、发布任务与发布记录，不能编辑知识库。',
    system: false,
    permissions: permissionsFor(
      ['data.overview', 'creation.content', 'creation.articles', 'publish.auth', 'publish.tasks', 'publish.records'],
      [],
      {
        'publish.auth': ['create', 'edit'],
        'publish.tasks': ['create', 'edit', 'publish'],
        'publish.records': ['export'],
      },
    ),
  },
]

export const INITIAL_USERS = [
  {
    id: 'u-admin',
    name: 'demo',
    email: 'admin@huoshan-geo.cn',
    phone: '138 0000 0001',
    companyName: '火山 GEO',
    companyDescription: '火山 GEO 是面向品牌增长团队的生成式引擎优化平台，帮助企业沉淀知识库、追踪 AI 引用表现，并提升品牌在生成式搜索中的可见度。',
    companyWebsite: 'https://www.huoshan-geo.cn',
    avatar: 'D',
    roleId: 'super-admin',
    companyIds: ['huoshan-geo', 'mickey-micro', 'litemos', 'nova-saas', 'aurora-fmcg'],
    status: 'active',
    updatedAt: '2026/06/02',
  },
  {
    id: 'u-lin',
    name: '林晚',
    email: 'linwan@huoshan-geo.cn',
    phone: '138 0000 0002',
    companyName: '火山 GEO',
    companyDescription: '火山 GEO 是面向品牌增长团队的生成式引擎优化平台，帮助企业沉淀知识库、追踪 AI 引用表现，并提升品牌在生成式搜索中的可见度。',
    companyWebsite: 'https://www.huoshan-geo.cn',
    avatar: '林',
    roleId: 'company-admin',
    companyIds: ['huoshan-geo', 'mickey-micro'],
    status: 'active',
    updatedAt: '2026/05/28',
  },
  {
    id: 'u-zhao',
    name: '赵宇',
    email: 'zhaoyu@litemos.com',
    phone: '138 0000 0003',
    companyName: '理想汽车',
    companyDescription: '理想汽车是一家新能源汽车企业，专注于家庭用户的智能电动车产品与出行体验。',
    companyWebsite: 'https://www.lixiang.com',
    avatar: '赵',
    roleId: 'content-operator',
    companyIds: ['litemos'],
    status: 'active',
    updatedAt: '2026/05/22',
  },
  {
    id: 'u-chen',
    name: '陈禾',
    email: 'chenhe@nova-saas.com',
    phone: '138 0000 0004',
    companyName: 'Nova SaaS',
    companyDescription: 'Nova SaaS 为企业提供客户运营、数据分析与自动化协作工具，帮助团队提升业务流程效率。',
    companyWebsite: 'https://www.nova-saas.com',
    avatar: '陈',
    roleId: 'publisher',
    companyIds: ['nova-saas'],
    status: 'active',
    updatedAt: '2026/06/01',
  },
  {
    id: 'u-disabled',
    name: '停用账号',
    email: 'disabled@huoshan-geo.cn',
    phone: '138 0000 0005',
    companyName: '火山 GEO',
    companyDescription: '火山 GEO 是面向品牌增长团队的生成式引擎优化平台，帮助企业沉淀知识库、追踪 AI 引用表现，并提升品牌在生成式搜索中的可见度。',
    companyWebsite: 'https://www.huoshan-geo.cn',
    avatar: '停',
    roleId: 'content-operator',
    companyIds: ['huoshan-geo'],
    status: 'disabled',
    updatedAt: '2026/05/20',
  },
]

export const DEMO_ACCOUNTS = [
  { account: 'admin', password: 'demo123456', email: 'admin@huoshan-geo.cn', label: '系统总管理员', desc: '可进入系统设置，拥有全部查看与管理权限。' },
  { account: 'company', password: 'demo123456', email: 'linwan@huoshan-geo.cn', label: '公司管理员', desc: '可管理公司与知识库，不能进入系统设置。' },
  { account: 'content', password: 'demo123456', email: 'zhaoyu@litemos.com', label: '内容运营', desc: '只看数据总览，主要管理创作内容。' },
  { account: 'publisher', password: 'demo123456', email: 'chenhe@nova-saas.com', label: '发布运营', desc: '可进入发布中心，不能编辑知识库。' },
]

export function roleById(roleId) {
  return INITIAL_ROLES.find((r) => r.id === roleId)
}

export function userByEmail(email) {
  const normalized = email?.trim().toLowerCase()
  return INITIAL_USERS.find((u) => u.email.toLowerCase() === normalized)
}

export function userByPhone(phone) {
  const normalized = phone?.replace(/\D/g, '')
  return INITIAL_USERS.find((u) => u.phone?.replace(/\D/g, '') === normalized)
}

export function demoAccountByLogin(account) {
  if (typeof account !== 'string') return undefined
  const normalized = account?.trim().toLowerCase()
  return DEMO_ACCOUNTS.find((item) => item.account === normalized)
}

export function companyNames(companyIds) {
  return COMPANIES.filter((c) => companyIds.includes(c.id)).map((c) => c.name)
}

export function companyOptions(companyIds) {
  return COMPANIES.filter((c) => companyIds.includes(c.id)).map((c) => ({
    id: c.id,
    name: c.name,
  }))
}

export function countRoleUsers(users, roleId) {
  return users.filter((u) => u.roleId === roleId).length
}

export function routeToPermissionKey(pathname) {
  const [, dashboard, section, page] = pathname.split('/')
  if (dashboard !== 'dashboard' || !section || !page) return null
  return `${section}.${page}`
}

export function canView(user, key) {
  if (!key) return true
  return !!user?.permissions?.[key]?.view
}

export function canManage(user, key) {
  if (!key) return false
  return !!user?.permissions?.[key]?.manage
}

export function canAction(user, key, action) {
  if (!key || !action) return false
  return !!user?.permissions?.[key]?.actions?.[action]
}

export function isPermissionShapeCurrent(user) {
  if (!user?.permissions) return false
  return MENU_KEYS.every((key) => {
    const permission = user.permissions[key]
    if (!permission || typeof permission.view !== 'boolean') return false
    const actions = DEFAULT_BUTTON_PERMISSIONS[key] ?? []
    return actions.every((action) => typeof permission.actions?.[action] === 'boolean')
  })
}

export function canViewSection(user, sectionId) {
  const section = MENU_TREE.find((s) => s.sectionId === sectionId)
  if (!section) return false
  return section.items.some((item) => canView(user, item.key))
}

export function buildSessionUser(login) {
  const loginKey = typeof login === 'string' ? login : login?.account
  const account = demoAccountByLogin(loginKey)
  const email = account?.email ?? login?.email ?? (typeof login === 'string' ? login : undefined)
  const matched = login?.phone ? userByPhone(login.phone) : userByEmail(email)
  const fallbackName = login?.account || login?.phone || email?.split('@')[0] || '内容运营'
  const user = matched?.status === 'active'
    ? matched
    : {
        id: 'u-guest-content',
        name: fallbackName,
        email: email || 'guest@huoshan-geo.cn',
        phone: login?.phone ?? '',
        avatar: (login?.account?.[0] ?? login?.phone?.[0] ?? email?.[0] ?? '运').toUpperCase(),
        roleId: 'content-operator',
        companyIds: ['huoshan-geo'],
        status: 'active',
        updatedAt: '2026/06/02',
      }
  const role = roleById(user.roleId) ?? roleById('content-operator')
  const options = companyOptions(user.companyIds)
  const activeCompany = options[0]
  return {
    id: user.id,
    account: account?.account ?? user.email.split('@')[0],
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: role.name,
    roleId: role.id,
    isAdmin: role.id === 'super-admin',
    companyIds: user.companyIds,
    companyOptions: options,
    companies: options.map((company) => company.name),
    activeCompanyId: activeCompany?.id ?? null,
    company: activeCompany?.name ?? '未分配公司',
    permissions: role.permissions,
    status: user.status,
  }
}
