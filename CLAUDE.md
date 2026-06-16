# 火山 GEO — 生成式引擎优化前端

Vite 8 + React 19 + react-router-dom 7 + TailwindCSS v4 + shadcn/ui (radix-nova preset · amethyst-haze 主题) + framer-motion + lucide-react + react-icons + tailwind-variants + clsx + tailwind-merge

<directory>
src/ - 应用源代码 (5 子模块: components/, pages/, lib/, assets/, 入口)
public/ - 静态资源原样直出 (favicon.svg)
node_modules/ - 依赖产物 (不入版本)
</directory>

<config>
package.json - 项目清单·脚本入口·依赖锁版
vite.config.js - Vite 构建配置·React 插件·Tailwind v4 插件·@/ -> ./src 别名
jsconfig.json - JS 路径别名声明·IDE 智能感知
components.json - shadcn/ui 注册表配置·radix-nova 风格·@/ 别名映射·neutral 基色
index.html - 单页应用挂载点·#root 入口·zh-CN
eslint.config.js - 代码规范·React Hooks + Refresh 规则
.gitignore - 版本忽略清单
</config>

<design_law>
铁律一 · 设计系统是唯一真理 — 所有颜色、间距、圆角、阴影、字体、组件必须来自 src/components/ui 与 src/index.css 中的 token，禁止任何 hex / 自定义 px / 临时 CSS。
铁律二 · 主题即变量 — 颜色用语义类 (bg-primary / text-foreground / border-border / bg-accent ...) 而非具体色值，深浅模式靠 CSS 变量自动切换。
铁律三 · 组件即原子 — 业务组件必须组合 shadcn/ui 原子件 (Button / Card / Input ...)，不允许手写一遍 Button。
铁律四 · 展厅即真相 — /design-system 路由是设计系统的可视化镜像，任何新增 token 或组件变体必须在此页面同步呈现。
违例处置 — 越权写死的颜色、自造的按钮、绕过 token 的间距，一律视为破坏架构，立即重构。
</design_law>

<skeuomorphic_language>
质感公约 · 微拟物光影
公式一 · 凸起 = 渐变背景 + 外投影 + 顶部高光 + 底部暗边
公式二 · 内凹 = 内阴影 + 底部反光
公式三 · 旋钮 = 小投影 + 顶部高光 + 底部暗边
微交互 — 所有可交互元素 transition 200ms ease，hover scale(1.02)；点击回弹由 framer-motion Spring (stiffness 500 / damping 30) 接管，不再用 active:scale Tailwind
圆角 — base 6px(rounded-md · 所有卡片+所有输入框 Input/Textarea/Select+列表/表格+弹窗 Dialog/Command 唯一基准) · sm 12px(rounded-xl · 筛选 Pill) · default 16px(rounded-2xl · 图标墩子/Button) · xl 24px(rounded-3xl · 大面板/Hero)
颜色派生 — linear-gradient(135deg, var(--token), color-mix(var(--token) 85%, black), color-mix(var(--token) 70%, black))
阴影派生 — 外投影色 = color-mix(var(--token) 35%, transparent)；高光/暗边 = rgb(255 255 255 / 0.x) 与 rgb(0 0 0 / 0.x) 作环境光常量
工具类入口 — index.css @layer utilities 的 .skeu-raised / .skeu-raised-hover / .skeu-inset / .skeu-inset-deep / .skeu-knob / .skeu-bar / .skeu-interactive / .skeu-switch-track
禁令 — 禁用 backdrop-blur 毛玻璃 · 禁用 0 0 Npx 发光扩散阴影 · 禁用任何 hex/色值写死
</skeuomorphic_language>

<animation_system>
动效公约 · Apple 级 Spring 物理引擎
单一来源 — lib/motion.js 集中导出 springs / appleEase* / defaultViewport / fadeInUp / scaleIn / slideInLeft|Right / staggerContainer / staggerItem / hoverLift / tapScale / modalOverlay / modalContent / pageTransition
Spring 预设 — snappy(400/30 微交互) · gentle(300/35 进场) · bouncy(500/25/0.8 弹性) · smooth(200/40/1.2 优雅) · inertia(150/20/0.5 惯性)
缓动曲线 — appleEase [0.25,0.1,0.25,1] · appleEaseOut [0.22,1,0.36,1] · appleDecelerate [0,0,0.2,1]
进退场公约 — 进场必走 Spring，退场必走短 duration (~0.15-0.2s) + appleEase
路由层 — main.jsx 顶层挂 MotionConfig reducedMotion="user"，App.jsx 用 AnimatePresence mode="wait" + location.pathname key
页面层 — LandingPage / DesignSystem 根节点用 motion.div + pageTransition variants
交互层 — Button motion.button + whileTap=tapScale；Card-wrapping motion.div 加 whileHover={{ y:-4, transition: springs.snappy }}
禁令 — 禁用线性 (linear) 缓动 · 禁用无阻尼弹跳 · 同时触发 > 3 个动画 · 组件侧禁止现写 stiffness / duration
可访问性 — reducedMotion="user" 必开，尊重系统 prefers-reduced-motion
</animation_system>

<landing_architecture>
Landing 页面架构 · components/landing/ 沉淀 10 Section · pages/LandingPage 顺序编排
Section 序号 — 01 Hero · 02 LogoBar · 03 ProblemSection · 04 FeaturesSection (Bento) · 05 HowItWorks · 06 Testimonials · 07 Pricing · 08 FAQ · 09 FinalCTA · 10 Footer
动效来源 — lib/motion.js (Spring 物理预设 + 全部 variants)
视口公约 — whileInView 一律传 defaultViewport ({ once: true, margin: '-100px' })，单方向触发避免重复抖动
chrome 策略 — Landing 自带 layout/Header + landing/Footer，不走 Layout 路由；DesignSystem 等内部页走 Layout 三段式
</landing_architecture>

<conventions>
路径别名 @/ → src/，import 路径如思想般直白
样式系统 TailwindCSS v4 utility-first，@import "tailwindcss" 单行启动
组件库 shadcn/ui 通过 npx shadcn@latest add 增量注入到 src/components/ui
图标系统 lucide-react 系统图标 · react-icons/si 社媒图标 · 前缀 Si
动效系统 framer-motion 负责 Spring 弹簧/进退场/路由过渡，所有 variants 集中于 lib/motion.js
类名合并 cn() = clsx + tailwind-merge，禁止字符串拼接 className
路由系统 react-router-dom v7 · BrowserRouter · AnimatePresence + useLocation 包裹 · Landing 直渲 · 内部页走 Layout
</conventions>

<routes>
/                          LandingPage    Landing 整页 (10 Section · 自带 chrome · pageTransition)
/design-system             DesignSystem   设计系统展厅 (走 Layout · pageTransition)
/dashboard                 控制台 (RequireAuth + DashboardLayout 二段式 · 默认重定向到 data/overview)
  data/overview            数据总览 (筛选条 · 日期 / 平台 / 场景词 · KPI · 趋势 · 模型矩阵 · 最新引用)
  data/{prompt-strategy,scenarios,citations,competitors,diagnosis}
  knowledge/{tags,information}   知识库 · 标签驱动 (标签管理 + 信息管理；信息走 粘贴/上传→切块 + 多标签)
  creation/{topics,content,articles,prompts}
  publish/{auth,tasks,records}
  system/{company,models,media,terminals,customers,users,roles,permissions} 系统设置 · RBAC (公司管理 + 模型管理 + 媒体管理 + 终端管理 + 客户管理 + 用户体系 + 角色授权 + 权限配置 · RequirePermission 控制访问)
</routes>

<auth>
鉴权来源 — contexts/AuthContext (mock + localStorage)，AuthProvider 在 App.jsx 内包裹于 BrowserRouter 之下
登录入口 — components/auth/LoginDialog (受控 Dialog · 账号密码 mock 登录 · 演示账号选择 · 成功 navigate('/dashboard'))，由 layout/Header 唯一消费
路由守卫 — components/auth/RequireAuth (未登录 → Navigate '/' · 已登录透传 children/Outlet)，包裹 /dashboard 子树
状态读取 — useAuth() → { user, isAuthenticated, login, logout }，Header / DashboardTopbar 都通过此 hook 渲染用户态
</auth>

<scripts>
npm run dev - 启动 Vite 开发服务器 (HMR)
npm run build - 产出生产构建到 dist/
npm run preview - 本地预览生产产物
npm run lint - ESLint 全量扫描
</scripts>

法则: 极简·稳定·导航·版本精确
