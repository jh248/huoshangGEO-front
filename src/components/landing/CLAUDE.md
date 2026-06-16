# src/components/landing/
> L2 | 父级: ../CLAUDE.md

## 成员清单 (Landing 九屏 + 终极 CTA + Footer · "承诺 → 逐屏兑现" 叙事 · 序号即编排顺序)

01 Hero.jsx              — 首屏品牌诊断: 大标题+副文+实时搜索/品牌诊断分段入口+品牌输入框
02 AccountabilitySection.jsx — 兑现「对结果负责」: 承诺没达到效果按比例返费 / 专家级获客策略定制 / 品牌核心认知体系构建 三机制卡 (自实现 sticky 标题定住 + 卡片同位覆盖)
03 RankingSection.jsx    — 品牌诊断报告: 火山全域GEO品牌诊断报告案例(榜单表 品牌/提及率/次数/平均提及排名/情感/得分 · 汽车行业 mock 数据)
04 BrandSiteSection.jsx  — 兑现「品牌官网 · 权威信息源」: 左 导语+4 能力要点卡(自有阵地/AI 信源/收录权重/内容底盘) · 右 CardSwap 3D 官网案例卡轮换(截图待替换)
04 EngineLoopSection.jsx — 兑现「增长引擎」: 监测→沉淀→生成→分发→再监测 自循环链路 + 四大模块卡
06 MetricsSection.jsx    — 兑现「可量化」: 4 个 NumberTicker 战绩 (引用率/引擎数/见效天数/提问数)
07 ComparisonSection.jsx — 区隔对手: 火山 GEO vs 其他 六维逐行 VS 对垒表 (效果保障置顶 · 品牌墩/暗色墩对峙)
08 TrustSection.jsx      — 信任背书: 客户 logo Marquee + 三则一句话 case + 可点开案例
09 ContentHubSection.jsx — 内容/知识中心: GEO 白皮书主入口(图片占位) + 三条行业观点
   CasesShowSection.jsx  — 合作案例: 双层镶边大卡 (左品牌深色墩 + 右成果·超大数字双卡 + 成果列表)，编排于 Comparison 之后
   FAQ.jsx               — 常见问题: 六问 Accordion (SEO 区别/模型覆盖/时效/ROI/安全/上手门槛)，编排于 CasesShow 之后、转化前清障
   FinalCTA.jsx          — 终极 CTA: 收口回"看得见" + 双 CTA + light-rays 反向晕染
   Footer.jsx            — 品牌 + 四列链接矩阵

✦ HeroDiagnose.jsx      — 子件: 首屏右侧速测件 (输品牌名 → mock AI 提及率/排名/逐引擎结果)，仅 Hero 消费
✦ BrandDiagnosisDialog.jsx — 子件: 品牌诊断大弹框 (头部固定 标题+积分余额胶囊·购买→CreditsPurchaseDialog + 中部滚动 品牌设置/AI 问题推荐 + 底部固定 消耗积分+开始诊断)，受控 open/onOpenChange/defaultBrand，被 Hero 与 AiSearchWorkspace 双入口消费
✦ CreditsPurchaseDialog.jsx — 子件: 充值积分弹窗 (购买积分标题 + 我的积分 + 4 档套餐卡[618 绶带/划线价/到手折扣/单价条] + 支付区 二维码占位/支付方式/应付金额)，受控 open/onOpenChange/balance，仅 BrandDiagnosisDialog 消费
✦ MediaPlaceholder.jsx  — 子件: 图片占位凹槽 (虚线边 + skeu-inset + 图标 + 标签)，各承诺屏消费，待补真实图
✦ AuroraBackground.jsx  — 装饰层: shadcnblocks 抽取的极光纹理 (mask + invert + animate-aurora-background 60s linear)，仅被 Hero 消费作为首屏背景，着色公式不可改

✗ 已下线 (文件保留，不在编排): LogoBar / ProblemSection / FeaturesSection / WhyChooseSection / HowItWorks / Testimonials / Pricing / AttributionSection / MonitorSection(可监测看板·被 BrandSiteSection 替换) — 定位转为"效果对赌/对结果负责"咨询式，自助分档定价与痛点屏不再编排

## 暴露接口

每个 Section 默认导出同名组件，被 pages/LandingPage 顺序编排，无 props 入参
AuroraBackground 命名+默认双导出，props: { className, showRadialGradient }，由 Hero 单点消费

## 动效公约

- 所有 Section 仅消费 lib/motion.js 暴露的 variants (fadeInUp / staggerContainer / scaleIn / slideInLeft/Right)
- viewport 统一传 defaultViewport ({ once: true, margin: '-100px' })
- 缓动唯一为 [0.22, 1, 0.36, 1]，禁止现写 transition / duration

## 铁律

- 只组合 ui/ 原子件 (Card / Button / Badge / Avatar / Accordion / Input / Separator)，禁止自造按钮、卡片
- 颜色仅用 var(--primary) / var(--accent) / var(--destructive) / var(--muted) / var(--card)，禁止 hex
- 凸起元素一律 .skeu-raised + .skeu-interactive 组合，禁止 backdrop-blur，禁止 0 0 Npx 发光
- 图标墩子统一: size-11 + rounded-2xl + 渐变背景 + 3 层阴影 (与 Header logo 同源)
- 数据驱动: Section 内的列表 (FEATURES / PROBLEMS / STEPS / QUOTES / PLANS / FAQ_ITEMS / LINK_GROUPS) 必须是模块顶部常量
- 单文件 < 250 行；超出考虑下沉子组件
- 新增 Section → 在 LandingPage 编排，在此清单加一行

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
