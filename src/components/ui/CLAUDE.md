# src/components/ui/
> L2 | 父级: ../CLAUDE.md

## 成员清单 (32 件 · shadcn radix-nova preset · 部分已注入微拟物升级)

accordion.jsx: 折叠面板，Radix Accordion 封装
alert.jsx: 横幅提示，带 icon slot
avatar.jsx: 头像，AvatarImage + AvatarFallback
badge.jsx: 徽章，6 变体 (default/secondary/accent/destructive/outline/ghost/link)，渐变背景 + 三层阴影，inline style 承载 color-mix [已升级]
border-beam.jsx: 边光特效 (magicui)，motion offset-path 沿父级 rounded 边描描扫光；props: size/duration/delay/colorFrom/colorTo/borderWidth/reverse/initialOffset；父级需 relative + rounded
button.jsx: 按钮，8 变体 × 7 尺寸，渐变 + 三层阴影 + hover scale(1.02) + active scale(0.97) + isLoading/leftIcon/rightIcon 入参，forwardRef [已升级 · 设计语言基准]
card.jsx: 卡片，3 变体 (raised/inset/flat)，承载内容分组与立体层级，rounded-md 6px (设计系统唯一卡片圆角) [已升级]
checkbox.jsx: 多选框
color-selector.jsx: 颜色选择器 (spell-ui · 色点圆环单选 · props colors/size(sm|default|lg)/defaultValue/onColorSelect/name · 选中态 inset+外环 box-shadow · 传 var(--token) 直透)，标签管理颜色选择消费
collapsible.jsx: 通用可折叠容器
command.jsx: 命令面板，cmdk 驱动
date-picker.jsx: 日期/时间选择原语 — Calendar (月网格 · single|range · fromToday 禁过去) + DatePicker (单日) + DateTimePicker (日历+时分秒滚轮+此刻/确定) + TimePicker (仅时分秒滚轮)；DateFilter (区间) 与调度 (单日/日期时间/时间) 共用，消除日历复刻品
dialog.jsx: 模态对话框，Radix Dialog
dropdown-menu.jsx: 下拉菜单
hover-card.jsx: 悬浮卡片
input.jsx: 文本输入，内凹效果，rounded-md 6px (设计系统唯一输入框圆角)，h-10 px-4 [已升级]
input-group.jsx: 输入组 (前后缀)
label.jsx: 表单标签
multi-select.jsx: 多选下拉，触发器 Pill + 反色「全部」主开关 + Pill 选项列表，受控/非受控双模，optional 搜索，支持未选择 placeholder；筛选层唯一原语
navigation-menu.jsx: 站点导航
number-ticker.jsx: 数字滚动计数 (magicui · useSpring + useInView 入场计数 · props value/decimalPlaces/startValue/direction/delay · 颜色取 text-foreground)，KPI 等数字加载动效消费
popover.jsx: 弹层
progress.jsx: 进度条，内凹轨道 + 渐变填充条 [已升级]
radio-group.jsx: 单选组
scroll-area.jsx: 自定义滚动条
select.jsx: 下拉选择
separator.jsx: 分隔线
sheet.jsx: 侧滑抽屉，移动端导航首选
single-select.jsx: 单选下拉，与 MultiSelect 同源 Pill 触发器 + 弹层；无「全部」主开关，单选语义，选中项反色 + 右侧 Check；label 有/无切换筛选风格/表单风格触发器
skeleton.jsx: 骨架屏
sonner.jsx: Toast 通知 (sonner 适配层)
switch.jsx: 开关，内凹轨道 (skeu-switch-track) + 凸起旋钮 (skeu-knob) + 选中渐变 [已升级]
table.jsx: 表格元素集
tabs.jsx: 选项卡
textarea.jsx: 多行文本
tooltip.jsx: 工具提示

## 微拟物升级清单 (已应用质感公约)

Button → 渐变背景 + 3 层阴影 + scale 微交互 + isLoading/leftIcon/rightIcon API
Card → variant: raised(凸起) | inset(内凹) | flat(平面)
Input → skeu-inset 内凹背景 + rounded-md (6px 唯一输入框圆角)
Badge → 6 变体渐变背景 (新增 accent)
Switch → skeu-switch-track 轨道 + skeu-knob 旋钮 + 选中态渐变
Progress → skeu-inset-deep 轨道 + skeu-bar 渐变填充

## 微拟物工具类 (index.css @layer utilities)

skeu-raised        凸起 · 外投影 + 顶部高光 + 底部暗边
skeu-raised-hover  凸起加强 · hover 时叠加更深阴影
skeu-inset         内凹 · 浅内阴影 + 底部反光
skeu-inset-deep    深内凹 · 用于 Switch/Progress 轨道
skeu-knob          旋钮 · 小投影 + 顶部高光 + 底部暗边
skeu-bar           渐变填充条 · 用于 Progress 指示器
skeu-interactive   微交互 · transition 200ms + hover scale 1.02 + active 0.97
skeu-switch-track  Switch 轨道选中/未选中双态阴影

## 铁律

- 此目录由 shadcn CLI 注入，微拟物升级允许人工改 cva + inline style + 工具类应用，但禁止破坏 shadcn 数据契约 (data-slot/data-state)
- 颜色仅引用 token (var(--primary) / var(--accent) ...) + color-mix 派生，禁止 hex / oklch 写死
- 凸起元素必须用 .skeu-raised 或同等三层阴影结构；内凹元素必须用 .skeu-inset 系列
- 微交互参数必须一致：hover scale 1.02 / active 0.97 / transition 200ms
- 任何新增 variant 必须在 DesignSystem.jsx 的「微拟物光影」展厅同步呈现

## 增长方式

npx shadcn@latest add <component-name>
新增后立即在此清单一行登记，并按公约升级到微拟物质感

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
