# src/lib/
> L2 | 父级: ../CLAUDE.md

## 成员清单

utils.js: 工具函数集合，导出 cn() — clsx + tailwind-merge 组合类名，shadcn 与所有业务组件共用
motion.js: Apple 级动效公约，集中 Spring 物理引擎 + 缓动曲线 + 全部动效 variants，被 ui/Button + landing/ + pages/ 唯一消费
dashboard-nav.js: 控制台导航单一真相 DASHBOARD_NAV + 按 RBAC permissions 过滤主导航/子导航的工具
mock-rbac.js: 前端演示 RBAC mock 单一真相 — 公司、菜单权限 key、按钮动作权限、权限目录、角色、用户、演示账号、session 构造与 canView/canManage/canAction 工具

## 暴露接口

### utils.js
cn(...inputs): string — 合并并去重 Tailwind 类名

### motion.js
- springs: { snappy, gentle, bouncy, smooth, inertia } — 5 档 Spring 物理预设
- appleEase / appleEaseOut / appleDecelerate — iOS 缓动曲线 (非 Spring 场景)
- defaultViewport: { once: true, margin: '-100px' } — whileInView 默认参数
- fadeInUp / scaleIn / slideInLeft / slideInRight — 进场 variants (Spring 驱动)
- staggerContainer / staggerItem — 父子序列进场配对
- hoverLift — 悬浮提升 rest/hover variants (Apple Card 效果)
- tapScale — whileTap 直传对象 (Spring 500/30 紧致回弹)
- modalOverlay / modalContent — 模态层背景 + 内容动效
- pageTransition — 路由切换 initial/animate/exit (与 AnimatePresence 配对)

### dashboard-nav.js
- DASHBOARD_NAV — 控制台 5 大模块与子菜单结构
- visibleSectionsFor(user) / visibleSectionGroups(section, user) — 按 user.permissions 过滤导航
- firstVisibleSectionItem(section, user) — 顶栏主 Tab 跳转目标

### mock-rbac.js
- DEMO_ACCOUNTS — 登录弹窗展示的 4 个演示账号 (account/password/email/role 映射)
- INITIAL_ROLES / INITIAL_USERS / COMPANIES — 系统设置页与 AuthContext 共用 mock
- BUTTON_ACTIONS / DEFAULT_BUTTON_PERMISSIONS / PERMISSION_CATALOG — 菜单权限与按钮权限目录
- buildSessionUser(account) — mock 登录后生成带 permissions/companyIds/companyOptions/activeCompanyId 的 session user
- canView(user, key) / canManage(user, key) / canAction(user, key, action) — 路由、导航、按钮权限判断

## Spring 选型参考

| 场景               | 预设      | 体感时长 |
| ------------------ | --------- | -------- |
| 微交互 (按钮 hover) | snappy   | ~200ms   |
| 元素进场           | gentle    | ~350ms   |
| 关键反馈 (徽章弹出) | bouncy   | ~300ms   |
| 大块面板 / 页面    | smooth    | ~500ms   |
| 列表 / 轮播        | inertia   | ~450ms   |

## 约定

- 此目录只放纯函数 / 无副作用工具与常量，禁止放业务逻辑或 UI
- 所有动效缓动唯一通过 springs / appleEase 系列消费，组件侧禁止现写 transition / duration / stiffness
- 进场用 Spring，退场用短 duration (~0.15-0.2s) + appleEase
- 阻尼值集中在 25-40 之间，遵循 Apple 落定感
- 路由顶层需 MotionConfig reducedMotion="user" (在 main.jsx) 尊重系统偏好

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
