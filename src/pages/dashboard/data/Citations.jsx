/**
 * [INPUT]: 依赖 ui/Button+Select+ScrollArea+Table+Tooltip，lucide 图标，本地 _charts(DonutChart/PlatformBadge/seriesColor) + _filters，PageShell+PageSectionCard
 * [OUTPUT]: 默认导出 Citations — 引用来源页 (Top引用数据[内置筛选条 + 来源分布环形 + 高频平台榜单] + 引用文章列表 + 各平台偏好画像置底)
 * [POS]: /dashboard/data/citations 路由，从 stubs.jsx 拆出独立文件
 * [PROTOCOL]: mock 数据写在模块顶部常量；颜色一律走 var(--token)/seriesColor；图表走 ./_charts；筛选 Pill 复用 ./_filters
 */
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageShell, PageSectionCard } from '../_PageShell'
import { DonutChart, PlatformBadge, seriesColor } from './_charts'
import { DateFilter, PlatformFilter, TermFilter } from './_filters'

/* ============================================================================
 * Mock 数据
 * ========================================================================== */
const PAGE_SIZES = ['10', '20', '50']

const TERM_OPTIONS = [
  { value: '1', label: '电动汽车品牌排行榜' },
  { value: '2', label: '电动汽车推荐' },
  { value: '3', label: '新能源汽车十大品牌' },
]

/* 目标词条引用来源分布 (引用率 %) · 末项「其他」为灰色补满整环 */
const SOURCE_DIST = [
  { name: '懂车帝', value: 10.1 },
  { name: '太平洋汽车', value: 9.5 },
  { name: '百度知道', value: 8.8 },
  { name: '今日头条', value: 7.7 },
  { name: '汽车之家', value: 6.9 },
  { name: '其他', value: 57.0, grey: true },
]

/* 高频引用平台榜单 */
const PLATFORM_RANK = [
  { name: '懂车帝', rate: '10.1%' },
  { name: '太平洋汽车', rate: '9.5%' },
  { name: '百度知道', rate: '8.8%' },
  { name: '今日头条', rate: '7.7%' },
  { name: '汽车之家', rate: '6.9%' },
  { name: '中国品牌网', rate: '6.2%' },
  { name: '中华网', rate: '5.6%' },
  { name: '抖音', rate: '5.1%' },
  { name: '搜狐汽车', rate: '4.8%' },
  { name: '易车', rate: '4.3%' },
]

/* 引用文章列表 */
const ARTICLES = [
  { title: '电动汽车', url: 'https://mip.chinapp.com/paihang/diandongqiche', mentioned: false, total: 36, avg: '18.0', source: '中国品牌网' },
  { title: '汽车', url: 'https://auto.china.com/car/0-0-2-0.html', mentioned: false, total: 22, avg: '22.0', source: '中华网' },
  { title: '新能源汽车十大品牌', url: 'https://www.chinapp.com/paihang/xinnengyuanqiche', mentioned: false, total: 14, avg: '4.7', source: '中国品牌网' },
  { title: '电动汽车十大品牌', url: 'https://www.chinapp.com/paihang/diandongqiche', mentioned: false, total: 13, avg: '4.3', source: '中国品牌网' },
  { title: '2026电动车别乱买!这5款续航最强，第一名卖断货_云上逍遥漫步', url: 'http://m.toutiao.com/group/7625281905579049508', mentioned: false, total: 9, avg: '4.5', source: '今日头条' },
  { title: '2026年智驾靠前的车系|实测排名+真实体验_电车极客说', url: 'http://m.toutiao.com/group/7622959454669111808', mentioned: false, total: 9, avg: '3.0', source: '今日头条' },
  { title: '电动车后期维修成本有多高?5年后二手车保值率还剩多少?', url: 'http://haokan.baidu.com/v?pd=wisenatural&vid=7777023288421306224', mentioned: false, total: 6, avg: '2.0', source: '百度知道' },
  { title: '最近更新:2026年1月7日', url: 'https://www.chinapp.com/brand/1650', mentioned: false, total: 5, avg: '1.7', source: '中国品牌网' },
  { title: '硬核横评：千里浩瀚 G-ASD 凭什么全科第一？2026 年智驾横评…', url: 'https://www.iesdouyin.com/share/video/7614905922829192483', mentioned: false, total: 5, avg: '1.7', source: '抖音' },
  { title: '15 万级带智驾的家用轿车如何选？别只看参数，实测好用才是真…', url: 'https://www.iesdouyin.com/share/video/7622898286931815603', mentioned: false, total: 5, avg: '1.7', source: '抖音' },
]

const TOTAL_COUNT = 1207
const TOTAL_PAGES = 121

/* 各平台 AI 回答的「偏好画像」· 每平台 PC/手机 各一条 · tags 为偏好信源类型 */
const PREFERENCE_PROFILES = [
  { platform: '豆包', term: 'PC 版', tags: ['类型A（门户/自媒体平台）', '类型C（地方媒体/新闻）'], desc: '高度依赖搜狐、今日头条等综合门户及自媒体平台，同时显著引用地方新闻媒体如潮新闻、咸宁新闻网，体现对本土化信源的关注。' },
  { platform: '豆包', term: '手机版', tags: ['类型A（门户/自媒体平台）', '类型C（地方媒体/新闻）'], desc: '偏好抖音等短视频平台与知识产权专业机构信源，同时持续引用咸宁新闻网等地域性媒体，显示移动端对垂直领域与本地信息的侧重。' },
  { platform: 'DeepSeek', term: 'PC 版', tags: ['类型A（门户/自媒体平台）', '类型D（专业服务机构）'], desc: '集中引用知识产权、跨境合规类专业服务平台（如世纪恒程、AMZ123），辅以百度百科等通用知识库，凸显其在商业与法律领域的专业信源偏好。' },
  { platform: 'DeepSeek', term: '手机版', tags: ['类型A（门户/自媒体平台）', '类型D（专业服务机构）'], desc: '延续网页版对专业服务机构的依赖，同时引入 QQ News 等视频平台，信源结构更趋多元但核心仍聚焦跨境与知识产权垂直领域。' },
  { platform: '通义千问', term: 'PC 版', tags: ['类型B（教育/工具平台）'], desc: '全部引用集中于"元宝高考通"，表现出极强的单一教育工具平台依赖，信源高度垂直且缺乏多样性。' },
  { platform: '通义千问', term: '手机版', tags: ['类型B（教育/工具平台）'], desc: '与网页版一致，100% 引用"元宝高考通"，进一步强化其在移动端对特定教育服务工具的深度绑定。' },
  { platform: '元宝', term: 'PC 版', tags: ['类型A（门户/自媒体平台）', '类型C（地方媒体/新闻）'], desc: '以 10100.com 为核心信源，辅以中国商报网、今日头条等地域与综合媒体，体现对商业资讯与本地新闻的混合偏好。' },
  { platform: '元宝', term: '手机版', tags: ['类型A（门户/自媒体平台）', '类型C（地方媒体/新闻）'], desc: '信源分布更均衡，10100.com 仍居首，同时显著引用咸宁新闻网等地方媒体及腾讯网等主流平台，移动端信息覆盖更广。' },
  { platform: '文心一言', term: 'PC 版', tags: ['类型A（门户/自媒体平台）'], desc: '极度依赖搜狐系平台（含 business.sohu.com），顺企网、百家号等自媒体次之，信源集中于中文综合门户生态。' },
  { platform: '文心一言', term: '手机版', tags: [], desc: '' },
  { platform: 'Kimi', term: 'PC 版', tags: ['类型A（门户/自媒体平台）', '类型E（国际组织/政府机构）'], desc: '以网易、搜狐为主干，同时高频引用 WIPO、国家电子政务网等权威机构，展现兼顾大众媒体与国际/政府信源的平衡策略。' },
  { platform: 'Kimi', term: '手机版', tags: ['类型A（门户/自媒体平台）', '类型D（专业服务机构）'], desc: '搜狐占比显著提升，博客园等技术社区紧随其后，君合等专业律所信源突出，反映移动端对专业内容与主流门户的双重倚重。' },
]

/* ============================================================================
 * 子组件
 * ========================================================================== */
const MEDAL = ['var(--color-amber-400)', 'var(--color-slate-300)', 'var(--color-orange-400)']

function RankBadge({ rank }) {
  const medal = MEDAL[rank - 1]
  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums"
      style={
        medal
          ? { background: medal, color: 'var(--foreground)' }
          : { background: 'var(--muted)', color: 'var(--muted-foreground)' }
      }
    >
      {rank}
    </span>
  )
}

const segColor = (i, seg) =>
  seg.grey ? 'color-mix(in srgb, var(--foreground) 18%, transparent)' : seriesColor(i)

function SourceDistribution() {
  const segments = SOURCE_DIST.map((s, i) => ({ value: s.value, color: segColor(i, s) }))
  const top = SOURCE_DIST[0]
  return (
    <div className="rounded-md border border-border bg-background/40 p-5">
      <p className="text-sm font-medium text-foreground">目标词条引用来源分布</p>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 self-start text-xs text-muted-foreground">
            引用率最高的平台
          </div>
          <div className="flex items-center gap-2 self-start">
            <PlatformBadge name={top.name} size={22} />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {top.name}：{top.value}%
            </span>
          </div>
          <DonutChart segments={segments} size={170} />
        </div>
        <ul className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-1">
          {SOURCE_DIST.map((s, i) => (
            <li key={s.name} className="flex items-center gap-2 text-xs text-foreground">
              <span
                className="size-3 shrink-0 rounded-sm"
                style={{ background: segColor(i, s) }}
              />
              <span className="truncate">{s.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PlatformRanking() {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background/40 p-5">
      <p className="text-sm font-medium text-foreground">目标词条高频引用平台榜单</p>
      <ScrollArea className="mt-3 h-64 pr-3">
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">平台名称</TableHead>
                <TableHead className="pr-4 text-right">引用率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLATFORM_RANK.map((p, i) => (
                <TableRow key={p.name}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <RankBadge rank={i + 1} />
                      <PlatformBadge name={p.name} size={22} />
                      <span className="text-sm text-foreground">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums">
                    {p.rate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  )
}

/* 各平台偏好画像 · 单条 (左 平台名+端 / 右 偏好类型 + 描述) */
function PreferenceProfileCard({ profile }) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-background/40 p-4 sm:grid-cols-[8rem_1fr] sm:gap-5">
      <div className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-0.5">
        <span className="text-sm font-semibold text-primary">{profile.platform}</span>
        <span className="text-xs text-muted-foreground">{profile.term}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          偏好：{profile.tags.join('、')}
        </p>
        {profile.desc && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{profile.desc}</p>
        )}
      </div>
    </div>
  )
}

/* ============================================================================
 * Citations
 * ========================================================================== */
function Citations() {
  const [dateValue, setDateValue] = useState({ preset: '7d' })
  const [platforms, setPlatforms] = useState([])
  const [terms, setTerms] = useState([])
  const [pageSize, setPageSize] = useState('10')

  const pages = [1, 2, 3, 4]

  return (
    <PageShell>
      {/* ====== Top 引用数据 ====== */}
      <PageSectionCard
        title="Top引用数据"
        desc="目标词条在各平台的引用来源分布与高频引用平台榜单"
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <DateFilter value={dateValue} onChange={setDateValue} />
          <PlatformFilter selected={platforms} onChange={setPlatforms} />
          <TermFilter options={TERM_OPTIONS} selected={terms} onChange={setTerms} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <SourceDistribution />
          <PlatformRanking />
        </div>
      </PageSectionCard>

      {/* ====== 引用文章列表 ====== */}
      <PageSectionCard title="引用文章列表">
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">文章标题</TableHead>
                <TableHead className="text-right">总引用次数</TableHead>
                <TableHead className="text-center">来源平台</TableHead>
                <TableHead className="pr-4 text-right">文章链接</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ARTICLES.map((a, i) => (
                <TableRow key={`${a.title}-${i}`}>
                  <TableCell className="pl-4">
                    <div className="flex items-start gap-3">
                      <RankBadge rank={i + 1} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.url}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{a.total}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <PlatformBadge name={a.source} size={22} />
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <a href={a.url} target="_blank" rel="noreferrer">查看</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>共 {TOTAL_COUNT} 条数据</span>
            <div className="flex items-center gap-2">
              <span>每页行数</span>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger className="h-7 w-16"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" aria-label="首页" disabled><ChevronsLeft /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="上一页" disabled><ChevronLeft /></Button>
            {pages.map((p) => (
              <Button
                key={p}
                variant={p === 1 ? 'default' : 'ghost'}
                size="icon-sm"
                className="tabular-nums"
              >
                {p}
              </Button>
            ))}
            <span className="px-1">…</span>
            <Button variant="ghost" size="icon-sm" className="tabular-nums w-9">{TOTAL_PAGES}</Button>
            <Button variant="ghost" size="icon-sm" aria-label="下一页"><ChevronRight /></Button>
            <Button variant="ghost" size="icon-sm" aria-label="末页"><ChevronsRight /></Button>
          </div>
        </div>
      </PageSectionCard>

      {/* ====== 各平台 AI 回答的「偏好画像」 ====== */}
      <PageSectionCard
        title={'各平台 AI 回答的"偏好画像"'}
        desc="按平台与端拆解 AI 引用信源的类型倾向，洞察不同平台对门户、地方媒体、专业机构等信源的偏好。"
      >
        <div className="grid gap-3 lg:grid-cols-2">
          {PREFERENCE_PROFILES.map((p) => (
            <PreferenceProfileCard key={`${p.platform}-${p.term}`} profile={p} />
          ))}
        </div>
      </PageSectionCard>
    </PageShell>
  )
}

export default Citations
