# src/components/layout/
> L2 | 父级: ../CLAUDE.md

## 成员清单

Header.jsx: 顶部导航栏，sticky + 微拟物底部光影 (无 backdrop-blur)，桌面水平导航 + 移动端 Sheet 抽屉。已接入 useAuth — 未登录露出"登录"按钮 (打开 LoginDialog)，登录态露出用户 DropdownMenu (头像 + 进入控制台 / 消费明细→ConsumptionDialog / 退出)。NAV_ITEMS 单一真相
ConsumptionDialog.jsx: 消费明细弹窗 (明细表 消耗时间/问题数量/消耗积分/剩余积分 · mock 数据)，受控 open/onOpenChange，由 Header 用户菜单「消费明细」唤起
Footer.jsx: 页脚，品牌列 + 三列链接矩阵 + 版权 + 社媒，依赖 Separator + react-icons/si。Layout 路由的统一页脚，landing/ 另有自己的 Footer
Layout.jsx: 公共路由容器，flex 三段式 (Header + Outlet + Footer)，design-system 等非 landing 页面共享
DashboardLayout.jsx: 控制台路由容器，列向编排 (顶 Topbar + 下 Sidebar + Main 行)，所有 /dashboard/* 子路由共享，pageTransition motion.main 包裹 Outlet。集中托管侧栏宽度/收起态 (collapsed + width + dragging，localStorage 持久化)，同源下发给 Topbar 与 Sidebar
DashboardTopbar.jsx: 控制台顶栏 — 品牌 (宽度随侧栏同步 · 收起态切 mark 单 logo) + RBAC 主导航 Tab (数据中心 / 知识库 / 创作中心 / 发布中心 / 系统设置) + 移动端 Sheet。点击 Tab 跳到模块第一个有权限子项；激活态以 pathname.split('/')[2] 匹配 section.id。可见模块由 lib/dashboard-nav + useAuth().user.permissions 过滤
DashboardSidebar.jsx: 控制台左侧 NAV，仅显示当前模块中当前账号有查看权限的子项 (二级导航) + 底部用户卡 (多公司账号可在 DropdownMenu 内切换当前公司)。可拖拽右缘把手调宽 / 收起为图标轨 (收起态留图标 + Tooltip 复显标签 · 双击把手或 chevron 钮切换)。DASHBOARD_NAV 单一真相已迁到 lib/dashboard-nav (产品切换已迁出至各页面右侧筛选条 TargetProductPill)
DashboardAgentPanel.jsx: 控制台右侧 GEO 助手对话面板 (Sheet side=right) — 触发按钮 (头像 + 名) 由 DashboardTopbar 顶栏右侧消费；面板含欢迎语 + 建议提示 + 输入栏，UI 骨架无真实对话逻辑
BrandLogo.jsx: 火山 GEO 品牌 lockup — 内联 SVG · variant=full (mark+wordmark · viewBox 547×108 · wordmark fill=currentColor 适配深浅模式) | variant=mark (仅 pictogram · viewBox 130×108)。Header / DashboardTopbar / Footer / landing/Footer 同源消费

## 暴露接口

每个文件默认导出同名组件

## 约定

- 仅组合 ui/ 原子件，不手写新按钮、输入框
- 所有颜色/间距/字号取 token，不写 hex / 自定义 px
- 禁用 backdrop-blur 毛玻璃，禁用 0 0 Npx 发光，凸起元素一律走微拟物三层阴影
- 装饰性 logo/图标采用 var(--token) 渐变 + 三层阴影 inline style (与 Button/Badge 同源)
- 导航数据 (NAV_ITEMS / LINK_GROUPS) 写在模块顶部常量，渲染无分支
- 新增页面时务必同步更新 Header.NAV_ITEMS 与 Footer.LINK_GROUPS
- 新增控制台页面 → 在 lib/dashboard-nav.DASHBOARD_NAV 追加 + App.jsx 路由注册 + lib/mock-rbac 菜单权限 key + pages/dashboard/* 落地

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
