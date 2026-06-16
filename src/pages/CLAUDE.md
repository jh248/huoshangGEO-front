# src/pages/
> L2 | 父级: ../CLAUDE.md

## 成员清单

LandingPage.jsx: / 路由，"承诺 → 逐屏兑现" 编排 (Hero → Accountability(对结果负责) → Ranking(行业榜单) → BrandSite(品牌官网·权威信息源) → EngineLoop(增长引擎) → Comparison(区隔对手) → FinalCTA → Footer)，自带 layout/Header + landing/Footer，不走 Layout 路由包裹
DesignSystem.jsx: /design-system 路由，shadcn + 主题 + 微拟物全量展厅，走 Layout 路由包裹
dashboard/: /dashboard/* 子路由集合 (15 页 · 4 模块)，走 DashboardLayout (二段式) + RequireAuth 包裹
  - _PageShell.jsx: 共享框架 — PageShell (actions 行 · title/desc 已废弃) + PageSectionCard
  - _StubPage.jsx: 通用占位骨架，被各模块 stubs.jsx 消费
  - data/Overview.jsx: GEO 健康总览 6 段式 (GEO 计分卡 + 趋势分析 + 竞品 GEO 得分 TOP10 + 舆情分析热力矩阵 + 竞争位置散点 ScatterChart)，数据骨架对齐《GEO 品牌检测报告》，登录默认落地
  - data/Scenarios.jsx: 场景词数据 4 段式 (提及率 + 提及次数 + 综合得分 + 词条表置底)
  - data/Diagnosis.jsx: 品牌诊断 2 段式 (诊断配置 — 品牌名 + 6 平台多模态勾选 + 全选/深度/搜索一下 · 诊断记录 — 卡片列表 + 5 项指标 + 删除 + 分页)
  - data/Competitors.jsx: UV 数据分析页 (数据概览内置日期刷新 + 3 指标卡 + 时间筛选流量趋势)
  - data/Consumption.jsx: 消费明细页 (汇总数据 + 时间筛选 + 积分消耗趋势 MultiLineChart + 消费/充值明细卡片列表 + 分页)
  - data/_charts.jsx: 数据中心私有图表原子 (LineChart / MultiLineChart / PlatformBars / PlatformBadge / DonutChart / AnimatedDonutChart / GaugeRing[0-100 仪表环] / ScatterChart[提及率×排名散点] · 纯 SVG · 颜色仅取 var(--chart-N))
  - data/_metrics.jsx: 4 个核心指标的解释与「?」气泡 (METRIC_INFO + MetricHint + SectionTitle)，Overview/Scenarios 同源消费
  - data/_filters.jsx: 数据中心私有筛选 Pill 层 (FilterPill 通用触发 + DateFilter 预设+日历 + MultiCheckFilter 多选 + PlatformFilter 带头像 + TermFilter 搜索+多选 + TargetProductPill 搜索+单选目标产品 · 自消费 ProductContext)，Overview/Scenarios 同源消费
  - data/stubs.jsx: PromptStrategy / Citations / DataSettings 占位 (Scenarios / Diagnosis / Competitors 已拆为独立页)
  - knowledge/Tags.jsx: 标签管理页 (全局标签 CRUD · 名称 + 颜色 swatch(var(--chart-N)) + 描述 · TagChip 预览 · 关联信息数 · 按钮权限 canAction(knowledge.tags))
  - knowledge/Information.jsx: 信息管理页 (标签驱动统一知识条目 · 表格 标题/公司/标签 chips/内容块/更新 + 搜索 + 公司筛选 + 标签筛选 + 查看/编辑/删除 · 按钮权限 canAction(knowledge.information))
  - knowledge/_informationForm.jsx: 私有 — InformationFormDialog (添加向导 4 步 选择来源→基本信息(含 标签 MultiSelect)→切分预览→入库 · 编辑 EditBody + ChunkEditor) + TagMultiSelect + TagChip + 暴露 ChunkRow
  - knowledge/_informationDetail.jsx: 私有 — InformationDetailDialog (只读 · 标签 chips + 块内搜索 + ScrollArea)
  - knowledge/_knowledgeMock.js: 私有 mock — COMPANIES / TAG_PALETTE / INITIAL_TAGS / INITIAL_INFORMATION + 切块工具 mockChunkText/mockChunkFile/dedupeChunks + tagById/countInfoByTag
  - knowledge/Bases.jsx: 知识库管理页 (WeKnora 参考 · 列表卡片(打开/删除) + 新建知识库 Dialog(类型/名称/描述 · 完成创建/创建并导入) + 详情 DocumentReader(文档列表 + 分块/原文预览 + 每文档「查看或调整配置」) · 切分配置下沉到文档级 · 索引策略/Wiki/图谱已下线 · INITIAL_BASES/INITIAL_DOCUMENTS mock)
  - knowledge/_documentConfig.jsx: 私有 — DocumentConfigDialog (文档级三步向导 创建设置/分段预览/数据处理 · 创建设置含 文档解析策略(精准/快速 + 提取内容 + 内容过滤) 与 分段策略(自动/自定义/按层级) · 后两步占位待补)
  - knowledge/_documentConfigShared.js: 私有 — 跨组件共享非组件导出 SEGMENT_SEPARATORS / CHUNK_STRATEGY_LABEL / defaultDocConfig
  - creation/stubs.jsx: Topics / ContentCreate / Articles / Prompts
  - creation/ContentCreate.jsx: 内容创作页 (左侧 Tiptap 富文本编辑器 + 顶部工具条(保存文章/插入块+/文字样式Aa·DropdownMenu 跑 Tiptap 命令) + 右侧内容副驾对话框(可拖拽分隔条调宽) · 助手建议以引用块插入正文)
  - creation/Articles.jsx: 文章列表页 (表格 标题/状态(Badge)/字数/核心词/更新时间/操作 + 搜索 + 状态筛选(全部/已发布/审核中/草稿) + 新建文章(跳内容创作) + 编辑/删除(确认弹窗) · INITIAL_ARTICLES mock)
  - creation/Prompts.jsx: 提示词管理页 (表格 Prompt Key/名称/描述/最新版本/最近提交人/最近提交时间/操作 + 搜索 + 创建人筛选 + 创建 Prompt(Key+名称+描述·CountedField 计数)/删除 · 创建或编辑跳转 PromptDetail · INITIAL_PROMPTS mock)
  - creation/PromptDetail.jsx: Prompt 编排/调试工作台 (/creation/prompts/:id · 三栏 模板(System/User 消息+变量)/常用配置(模型+参数滑块+Prompt变量+函数)/预览与调试(单次运行+测试输入) · 顶栏 对比模式/版本记录/智能优化/提交新版 · 前端骨架无真实模型调用)
  - creation/_tiptapEditor.jsx: 私有 — TiptapEditor (Tiptap v3 富文本 · StarterKit + Placeholder · forwardRef 暴露 editor 实例 + appendBlockquote · onTitleChange 回传首个 heading · 占位符样式在 index.css)
  - creation/_documentEditor.jsx: 私有 — DocumentEditor 飞书式块编辑器 (已被 Tiptap 取代·保留备用)
  - creation/_markdownPreview.jsx: 私有 — MarkdownPreview 轻量预览组件 (已被 Tiptap 取代·保留备用)
  - publish/stubs.jsx: AuthMgmt / Records (Tasks 已拆为独立页)
  - publish/Tasks.jsx: 发布任务页 (任务表 运行/停止/删除 + 添加任务 Dialog · 调度 固定时间/每天/每周/每月 · 多选文章+媒体 · 单次仅一篇·周期多篇 · 页面级 setInterval 模拟每次触发发一篇、发完自动停止 · 进度 Progress + 状态 Badge)
  - system/Models.jsx: 模型管理页 (大模型平台 CRUD · 表格 编码/名称/链接/排序/状态(Switch)/创建时间 + 搜索 + 添加/编辑/删除 + 拖拽改排序 · 按钮权限 canAction(system.models) · 自带 INITIAL_MODELS mock)
  - system/Media.jsx: 媒体管理页 (媒体平台 CRUD · 表格 类型/名称/编码/图标(Avatar)/状态(Switch)/登录地址/主页地址 + 搜索 + 添加/编辑/删除 · 按钮权限 canAction(system.media) · 自带 INITIAL_MEDIA mock)
  - system/Terminals.jsx: 终端管理页 (接入设备 · 表格 终端ID/状态(Switch)/网卡地址/IP/设备信息/设备版本/创建/更新 + 搜索 + 编辑/删除(终端自注册无新增) · 按钮权限 canAction(system.terminals) · 自带 INITIAL_TERMINALS mock)
  - system/Customers.jsx: 客户管理页 (客户主体 CRUD 设计稿 · 4 概览卡(主体/企业/个人/服务中) + 搜索(客户/联系人/运营) + CustomerTable(类型/联系人/运营负责人/数据归属/服务到期/状态) + 新增客户主体 · 按钮权限 canAction(system.customers) · 数据来自 _customerMock)
  - system/Users.jsx: 用户管理页 (RBAC · 用户账号表(搜索 + 状态 Switch + UserFormDialog 添加/编辑 + UserDeleteDialog · 总管理员禁删) · 客户主体已拆分到 客户管理)
  - system/Operations.jsx: 营运管理页 (运营授权独立菜单 · AssignmentTable 客户主体/运营负责人/授权角色/权限范围/有效期/状态 + 搜索 + 新增运营授权 · 按钮权限 canAction(system.operations))
  - system/_customerMock.js: 私有 mock — CUSTOMER_SUBJECTS / OPERATOR_ASSIGNMENTS / CUSTOMER_TYPE_META / SERVICE_STATUS_META，被 Customers 与 Users(运营授权) 共享
  - system/Roles.jsx: 角色权限页 (角色表 + 菜单/按钮权限计数 + RoleFormDialog(角色名 + 权限矩阵) + PermissionMatrix(按 MENU_TREE 分段 · 查看/管理 + 按钮动作) + RoleDeleteDialog · 系统内置角色只读·禁删 · 有用户角色禁删)
  - system/Permissions.jsx: 权限配置页 (菜单权限目录 + 按钮权限目录 + 添加菜单权限 / 添加按钮权限 mock)
  - system/_userForm.jsx: 私有 — UserFormDialog + UserDeleteDialog
  - system/_roleForm.jsx: 私有 — RoleFormDialog + RoleDeleteDialog + PermissionMatrix (菜单查看/管理 + 按钮动作)
  - system/_mock.js: 私有 mock 转发 — COMPANIES / MENU_TREE / MENU_KEYS / BUTTON_ACTIONS / DEFAULT_BUTTON_PERMISSIONS / PERMISSION_CATALOG / INITIAL_ROLES / INITIAL_USERS / emptyPermissions / fullPermissions / countRoleUsers / companyNames 均来自 lib/mock-rbac

## 暴露接口

每个文件默认导出同名页面组件，被 App.jsx 注册到路由

## 铁律

- 页面只编排，不发明 — 仅组合 components/ui + components/layout + components/landing
- Landing 类页面在 components/landing/ 沉淀 Section，页面文件只做顺序拼装
- 所有视觉元素 token 化，禁止内联 hex / 自定义 px
- 新增页面 → 在 App.jsx 注册 Route，按页面性质决定是否走 Layout，并在此清单加一行
- Landing 页面自带 chrome (Header + Footer)，DesignSystem 等内部页走 Layout
- 控制台页面 (/dashboard/*) 走 DashboardLayout + RequireAuth，仅鉴权用户可访问
- 控制台占位页可批量放在模块 stubs.jsx，落地真页面时拆出独立文件
- 新增控制台页面 → 同步 lib/dashboard-nav.DASHBOARD_NAV + App.jsx 路由 + lib/mock-rbac 菜单权限 key + 此清单
- 任何页面 > 400 行考虑拆分子模块
- 时间筛选公约 — 任何页面新增时间筛选必须使用 `pages/dashboard/data/_filters.jsx` 的 `DateFilter` Pill (预设 + 日历区间)，value 形如 `{ preset, start?, end? }` (start/end 为 `{year,month,day}`，区间由两次日历点击或预设派生)。禁止自造日期输入、native `<input type="date">`、双框开始/结束输入

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
