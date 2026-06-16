# src/
> L2 | 父级: ../CLAUDE.md

## 成员清单

main.jsx: React 应用启动入口，createRoot + StrictMode 挂载到 #root，加载 index.css 全局样式
App.jsx: 应用根组件，BrowserRouter + AuthProvider + Routes 声明 — / 直渲 LandingPage (自带 chrome)，/design-system 在 Layout 下，/dashboard/* 在 RequireAuth + DashboardLayout 下
index.css: 设计系统单一入口，@import "tailwindcss" + tw-animate-css + shadcn/tailwind.css + 主题变量 + 微拟物工具类层 + aurora-background keyframe
components/: UI 组件，分四层 (ui/ shadcn 原子件 · layout/ 站点+控制台布局 · landing/ Landing 10 Section · auth/ 登录 + 路由守卫)
contexts/: React 全局上下文 (AuthContext — mock 鉴权 + localStorage · ProductContext — 当前监测产品 + 切换器，DashboardLayout 包裹，仅数据中心消费)
pages/: 路由页面，一文件一页面 (LandingPage / DesignSystem / dashboard/* 控制台 15 页)
lib/: 工具与公约 (cn 类名合并 + framer-motion 动效 variants)
assets/: 静态资源 (PNG/SVG)，目前为空，由组件 ESM 引入

## 暴露接口

main.jsx → 无导出，副作用性挂载
App.jsx → 默认导出 App 路由根

## 铁律 (复述自 L1)

- 设计来源唯一 — 一切颜色/间距/组件必须取自 components/ui + index.css 的 token
- 禁止手写 hex / 临时 CSS / 自造 Button
- 新增页面必须经 App.jsx 注册路由
- 业务文件必须带 L3 头部 (INPUT/OUTPUT/POS)
- 任何文件 > 800 行立即拆分

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
