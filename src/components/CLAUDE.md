# src/components/
> L2 | 父级: ../CLAUDE.md

## 子模块

ui/: shadcn/ui 原子组件库 (30 件)，由 npx shadcn@latest add 注入，部分已升级至微拟物质感，禁止手改风格
CardSwap/: react-bits 动效件 (CardSwap 3D 卡片轮换 · gsap 驱动 · 自带 CardSwap.css，hex 已改 token)，被 landing/BrandSiteSection 消费
ScrollStack/: react-bits 动效件 (ScrollStack 滚动堆叠 · lenis 驱动 · useWindowScroll 模式，css 内边距/圆角已按公约调整)，被 landing/AccountabilitySection 消费
layout/: 站点级布局组件 (Header / Footer / Layout 三段式 · DashboardLayout + DashboardSidebar + DashboardTopbar 控制台二段式)，组合 ui/ 原子件而成
landing/: Landing Page 10 Section 集合，仅被 pages/LandingPage 编排，使用 lib/motion 动效公约
auth/: 鉴权 UI (LoginDialog 账号密码 mock 登录) + 路由守卫 (RequireAuth / RequirePermission)，与 contexts/AuthContext 配对

## 边界

- 任何业务组件只能依赖 ui/ 与 layout/，不可绕开 ui/ 自造按钮、自造输入框
- landing/ 同时依赖 ui/ + lib/motion；layout/ 不应反向依赖 landing/
- 颜色用语义类 (bg-primary, text-foreground...)，不写 hex
- 间距用 Tailwind spacing scale (p-4, gap-3...)，不写 px

## 增长规则

- 新原子组件 → npx shadcn@latest add <name>
- 新业务组件 → 组合 ui/ 而非新建一套
- 新 Landing Section → 在 landing/ 平级新建，并在 LandingPage 编排
- 新模式 (Dashboard 等) → 在 layout/ 平级新建子目录，并补 L2

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
