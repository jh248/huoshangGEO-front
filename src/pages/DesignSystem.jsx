/**
 * [INPUT]: 依赖 react、framer-motion 的 motion、@/lib/motion 的 pageTransition、@/components/ui 的全量组件、lucide-react 图标
 * [OUTPUT]: 默认导出 DesignSystem 页面组件
 * [POS]: pages/ 的 /design-system 路由，shadcn + amethyst-haze 的可视化展厅
 *        顶层 motion.div 承载 pageTransition variants，与 App.jsx 的 AnimatePresence 配对
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, Layers, ListChecks, Mail, Search, Settings, Sparkles, User } from 'lucide-react'
import { pageTransition } from '@/lib/motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CircularText } from '@/components/ui/circular-text'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MultiSelect } from '@/components/ui/multi-select'
import { SingleSelect } from '@/components/ui/single-select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// ============================================================================
// 调色板 · 单一真相 · 数据驱动
// ============================================================================
const COLOR_TOKENS = [
  { name: 'background', class: 'bg-background border-border' },
  { name: 'foreground', class: 'bg-foreground' },
  { name: 'primary', class: 'bg-primary' },
  { name: 'secondary', class: 'bg-secondary' },
  { name: 'accent', class: 'bg-accent' },
  { name: 'muted', class: 'bg-muted' },
  { name: 'destructive', class: 'bg-destructive' },
  { name: 'border', class: 'bg-border' },
  { name: 'ring', class: 'bg-ring' },
  { name: 'card', class: 'bg-card border-border' },
  { name: 'popover', class: 'bg-popover border-border' },
  { name: 'input', class: 'bg-input border-border' },
]

// 平台多选示例数据 · 字母 + 渐变色派生品牌头像
const PLATFORM_OPTIONS = [
  { value: 'DeepSeek', label: 'DeepSeek', letter: 'DS', hue: 220 },
  { value: '豆包', label: '豆包', letter: '豆', hue: 30 },
  { value: '元宝', label: '元宝', letter: '宝', hue: 0 },
  { value: '文心', label: '文心', letter: '文', hue: 200 },
  { value: 'Kimi', label: 'Kimi', letter: 'K', hue: 250 },
  { value: '智谱', label: '智谱', letter: '智', hue: 280 },
]

const TAG_OPTIONS = [
  { value: 'geo', label: 'GEO 优化' },
  { value: 'aio', label: 'AIO 引用' },
  { value: 'kw', label: '词条监控' },
  { value: 'cmp', label: '竞品对比' },
  { value: 'pmt', label: '提示词诊断' },
]

const RADIUS_TOKENS = [
  { name: 'base', class: 'rounded-md', px: '6px', usage: '唯一基准 · 所有卡片 / 所有输入框 (Input/Textarea/Select) / 列表 / 表格容器' },
  { name: 'sm', class: 'rounded-xl', px: '12px', usage: '紧凑控件 · 筛选 Pill (SingleSelect/MultiSelect Trigger)' },
  { name: 'default', class: 'rounded-2xl', px: '16px', usage: '图标墩子 (size-11) · Button 默认' },
  { name: 'xl', class: 'rounded-3xl', px: '24px', usage: '大面板 · Hero 容器 · Button xl' },
]

const TYPOGRAPHY = [
  { tag: 'h1', class: 'text-4xl md:text-5xl font-semibold tracking-tight', sample: '一级标题 / Display' },
  { tag: 'h2', class: 'text-3xl font-semibold tracking-tight', sample: '二级标题 / Title' },
  { tag: 'h3', class: 'text-xl font-medium', sample: '三级标题 / Subtitle' },
  { tag: 'p', class: 'text-base text-foreground', sample: '正文 · 阅读层 · 默认 16px。' },
  { tag: 'muted', class: 'text-sm text-muted-foreground', sample: '次要信息 · 时间戳 · 注解。' },
]

function Section({ title, desc, children }) {
  return (
    <section className="border-b border-border py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </section>
  )
}

function DesignSystem() {
  const [progress, setProgress] = useState(64)

  return (
    <TooltipProvider>
      <motion.div
        className="mx-auto max-w-6xl px-4 py-12"
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <header className="mb-8">
          <Badge variant="accent" className="mb-3">amethyst-haze · 微拟物</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            设计系统展厅
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            一切设计源自设计系统 — 颜色、间距、组件、动效都从此处取材。
            离开这里的任何 hex / px / 自定义 CSS 视为越权。
          </p>
        </header>

        {/* ====================== 微拟物光影 ====================== */}
        <Section
          title="微拟物光影 · Skeuomorphic"
          desc="渐变背景 + 三层阴影 + 微交互。颜色全部派生自 token，禁用毛玻璃、发光、硬编码 hex。"
        >
          {/* ---- 升级后 Button 全谱 ---- */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-medium text-foreground">Button · 渐变变体</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <h3 className="mt-6 mb-3 text-sm font-medium text-foreground">Button · 尺寸 + 状态</h3>
            <div className="flex flex-wrap items-end gap-3">
              <Button size="sm">SM</Button>
              <Button size="default">Default</Button>
              <Button size="md">MD</Button>
              <Button size="lg">LG</Button>
              <Button size="xl">XL</Button>
              <Button size="icon"><Settings /></Button>
              <Button leftIcon={<Sparkles />}>左图标</Button>
              <Button rightIcon={<Check />}>右图标</Button>
              <Button isLoading>加载中</Button>
            </div>
            <h3 className="mt-6 mb-3 text-sm font-medium text-foreground">CircularText · 圆形 CTA</h3>
            <Button
              type="button"
              size="icon"
              aria-label="圆形诊断按钮"
              className="relative isolate h-24 w-24 overflow-hidden rounded-full p-0"
            >
              <CircularText
                text="AI GEO · BRAND DIAGNOSIS · "
                className="inset-1 text-[0.625rem] text-primary-foreground/70"
              />
              <span className="relative z-10 flex flex-col items-center justify-center gap-1 leading-none">
                <span className="whitespace-nowrap text-base font-semibold text-primary-foreground">开始诊断</span>
              </span>
            </Button>
          </div>

          {/* ---- 升级后 Card 凸起/内凹 ---- */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-medium text-foreground">Card · 凸起 vs 内凹</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card variant="raised">
                <CardHeader>
                  <CardTitle>Raised · 凸起</CardTitle>
                  <CardDescription>外投影 + 顶部高光，承载主要内容</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">默认变体，立体感最强。</CardContent>
              </Card>
              <Card variant="inset">
                <CardHeader>
                  <CardTitle>Inset · 内凹</CardTitle>
                  <CardDescription>内阴影模拟下陷，承载次级信息</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">适合输入区与代码块容器。</CardContent>
              </Card>
              <Card variant="flat">
                <CardHeader>
                  <CardTitle>Flat · 平面</CardTitle>
                  <CardDescription>仅边框分割，无阴影</CardDescription>
                </CardHeader>
                <CardContent className="text-muted-foreground">用于栅格分组的轻量容器。</CardContent>
              </Card>
            </div>
          </div>

          {/* ---- 升级后 Input 内凹 ---- */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-medium text-foreground">Input · 内凹效果</h3>
            <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
              <Input placeholder="搜索关键词..." />
              <Input type="email" placeholder="you@example.com" />
            </div>
          </div>

          {/* ---- 升级后 Badge 渐变 ---- */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-medium text-foreground">Badge · 渐变变体</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* ---- 升级后 Switch + Progress ---- */}
          <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Switch · 凸起旋钮</h3>
              <div className="flex items-center gap-6">
                <Switch defaultChecked />
                <Switch />
                <Switch size="sm" defaultChecked />
                <Switch size="sm" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Progress · 渐变填充</h3>
              <div className="flex flex-col gap-3">
                <Progress value={28} />
                <Progress value={64} />
                <Progress value={92} />
              </div>
            </div>
          </div>
        </Section>

        {/* ====================== 调色板 ====================== */}
        <Section title="调色板" desc="所有色彩取自 CSS 变量，深浅色自动适配。">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {COLOR_TOKENS.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className={`size-10 shrink-0 rounded-md border ${t.class}`} />
                <code className="text-xs text-foreground">{t.name}</code>
              </div>
            ))}
          </div>
        </Section>

        {/* ====================== 圆角 ====================== */}
        <Section
          title="圆角 · Radius"
          desc="铁律 · 所有卡片与所有输入框 (Input / Textarea / Select) 一律 rounded-md 6px。筛选 Pill 走 sm，图标墩子 / Button 走 default，大面板走 xl。"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RADIUS_TOKENS.map((r) => (
              <div
                key={r.name}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div
                  className={`h-20 w-full border border-border bg-muted ${r.class}`}
                />
                <div className="flex items-baseline justify-between">
                  <code className="text-sm font-medium text-foreground">{r.name}</code>
                  <span className="text-xs tabular-nums text-muted-foreground">{r.px}</span>
                </div>
                <code className="text-xs text-muted-foreground">{r.class}</code>
                <p className="text-xs leading-relaxed text-muted-foreground">{r.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ====================== 字体 ====================== */}
        <Section title="字体层级" desc="Geist Variable · 系统级一致性">
          <div className="flex flex-col gap-4">
            {TYPOGRAPHY.map((t) => (
              <div key={t.tag} className="flex items-baseline gap-4 border-b border-border pb-3 last:border-0">
                <code className="w-16 shrink-0 text-xs text-muted-foreground">{t.tag}</code>
                <p className={t.class}>{t.sample}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ====================== 表单 ====================== */}
        <Section title="表单元素" desc="Input / Textarea / Select / Checkbox / Radio / Switch">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>角色</Label>
              <SingleSelect
                placeholder="选择角色"
                defaultValue="editor"
                options={[
                  { value: 'admin', label: '管理员' },
                  { value: 'editor', label: '编辑' },
                  { value: 'viewer', label: '访客' },
                ]}
                triggerClassName="w-fit"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea id="bio" placeholder="说点什么..." rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="terms" />
              <Label htmlFor="terms">同意服务条款</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="notif" />
              <Label htmlFor="notif">推送通知</Label>
            </div>
            <RadioGroup defaultValue="monthly" className="flex gap-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="monthly" id="r1" />
                <Label htmlFor="r1">按月</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yearly" id="r2" />
                <Label htmlFor="r2">按年</Label>
              </div>
            </RadioGroup>
          </div>
        </Section>

        {/* ====================== 多选下拉 ====================== */}
        <Section
          title="多选下拉 · MultiSelect"
          desc="筛选层唯一标准 — 触发器 Pill (Icon | label | value | ▾) + 弹层 (反色「全部」主开关 + Pill 选项列表)。所有数据中心筛选条必走此原语。"
        >
          <div className="flex flex-wrap items-start gap-3">
            <MultiSelect
              Icon={Layers}
              label="平台"
              defaultValue={PLATFORM_OPTIONS.map((o) => o.value)}
              options={PLATFORM_OPTIONS}
              renderItem={(o) => (
                <>
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-primary-foreground"
                    style={{
                      background: `linear-gradient(135deg, hsl(${o.hue} 60% 55%) 0%, hsl(${o.hue} 65% 40%) 100%)`,
                    }}
                  >
                    {o.letter}
                  </span>
                  <span className="flex-1 truncate">{o.label}</span>
                </>
              )}
            />
            <MultiSelect
              Icon={ListChecks}
              label="标签"
              withSearch
              defaultValue={[]}
              options={TAG_OPTIONS}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            提示：「全部」勾选时返回空数组 (语义 = 不过滤)；任一项被取消勾选则切到「N 项」模式。受控请传 <code className="rounded bg-muted px-1">value</code> + <code className="rounded bg-muted px-1">onValueChange</code>。
          </p>
        </Section>

        {/* ====================== 单选下拉 ====================== */}
        <Section
          title="单选下拉 · SingleSelect"
          desc="与 MultiSelect 同源 Pill 触发器 + 弹层。无「全部」主开关，单选语义，选中项反色 + 右侧 Check。"
        >
          <div className="flex flex-wrap items-start gap-3">
            <SingleSelect
              placeholder="选择角色"
              defaultValue="editor"
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'editor', label: '编辑' },
                { value: 'viewer', label: '访客' },
              ]}
            />
            <SingleSelect
              Icon={Layers}
              label="平台"
              defaultValue={PLATFORM_OPTIONS[0].value}
              options={PLATFORM_OPTIONS}
              renderItem={(o) => (
                <>
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-primary-foreground"
                    style={{
                      background: `linear-gradient(135deg, hsl(${o.hue} 60% 55%) 0%, hsl(${o.hue} 65% 40%) 100%)`,
                    }}
                  >
                    {o.letter}
                  </span>
                  <span className="flex-1 truncate">{o.label}</span>
                </>
              )}
            />
            <SingleSelect
              Icon={ListChecks}
              label="标签"
              withSearch
              placeholder="选择"
              options={TAG_OPTIONS}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            提示：传 <code className="rounded bg-muted px-1">label</code> 走筛选风格 (Icon | label | value | ▾)；不传则走表单风格 (value | ▾)。受控传 <code className="rounded bg-muted px-1">value</code> + <code className="rounded bg-muted px-1">onValueChange</code>，选中后弹层自动关闭。
          </p>
        </Section>

        {/* ====================== 卡片 ====================== */}
        <Section title="卡片 · Card">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>升级到 Pro</CardTitle>
              <CardDescription>解锁全部 GEO 优化模板与无限引用追踪</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                ¥199 / 月起，随时可取消。
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button>立即升级</Button>
              <Button variant="ghost">了解更多</Button>
            </CardFooter>
          </Card>
        </Section>

        {/* ====================== 反馈 ====================== */}
        <Section title="反馈" desc="Alert / Progress / Skeleton">
          <div className="flex flex-col gap-4">
            <Alert>
              <Check />
              <AlertTitle>已保存</AlertTitle>
              <AlertDescription>你的更改已经同步到云端。</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">索引进度</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} />
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.max(0, p - 10))}>-10</Button>
                <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>+10</Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        </Section>

        {/* ====================== 导航 ====================== */}
        <Section title="选项卡与折叠面板">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="metrics">指标</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4 text-sm text-muted-foreground">
              展示项目核心指标、近 7 天引用次数与趋势。
            </TabsContent>
            <TabsContent value="metrics" className="mt-4 text-sm text-muted-foreground">
              详细数据图表、过滤器与导出功能。
            </TabsContent>
            <TabsContent value="settings" className="mt-4 text-sm text-muted-foreground">
              偏好、API 密钥与团队权限。
            </TabsContent>
          </Tabs>

          <Separator className="my-6" />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="a">
              <AccordionTrigger>GEO 与 SEO 有何不同？</AccordionTrigger>
              <AccordionContent>
                SEO 优化搜索引擎结果页排名，GEO 优化 LLM 生成回答中的品牌引用与提及。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>支持哪些大模型？</AccordionTrigger>
              <AccordionContent>
                豆包、DeepSeek、Kimi、文心一言、通义千问、智谱清言等国产主流模型均覆盖。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        {/* ====================== 头像 + 弹层 + 对话框 ====================== */}
        <Section title="头像 · 工具提示 · 对话框">
          <div className="flex items-center gap-6">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="user" />
              <AvatarFallback>VG</AvatarFallback>
            </Avatar>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon"><Bell /></Button>
              </TooltipTrigger>
              <TooltipContent>3 条新通知</TooltipContent>
            </Tooltip>

            <Dialog>
              <DialogTrigger asChild>
                <Button>打开对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认操作</DialogTitle>
                  <DialogDescription>
                    此操作将更新你的订阅，立即生效。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">取消</Button>
                  <Button>确认</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Section>

        {/* ====================== 图标 ====================== */}
        <Section title="图标系统" desc="lucide-react 系统图标 · 唯一来源">
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {[Search, Mail, Bell, User, Settings, Check].map((Icon, i) => (
              <span key={i} className="flex size-10 items-center justify-center rounded-md border border-border">
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </Section>
      </motion.div>
    </TooltipProvider>
  )
}

export default DesignSystem
