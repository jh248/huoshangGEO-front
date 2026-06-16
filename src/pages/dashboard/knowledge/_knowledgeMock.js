/**
 * [INPUT]: 无依赖
 * [OUTPUT]: 知识库 mock 单一来源 — COMPANIES / 全局 TAGS + 调色板 / INITIAL_INFORMATION
 *           + 切块工具 (mockChunkText / mockChunkFile / dedupeChunks) + tagById / countInfoByTag
 * [POS]: pages/dashboard/knowledge 私有 mock，被 Tags / Information / _informationForm / _informationDetail 消费
 * [PROTOCOL]: 纯前端 mock；接真后端时整层替换。标签颜色仅取 var(--chart-N)，禁 hex
 */

/* 标签调色板 —— 取 Tailwind v4 主题色板 token (深浅模式自动适配，禁 hex) */
export const TAG_PALETTE = [
  'var(--color-blue-500)',
  'var(--color-violet-500)',
  'var(--color-emerald-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
  'var(--color-cyan-500)',
]

export const COMPANIES = [
  { id: 'huoshan-geo', brandName: '火山 GEO' },
  { id: 'lixiang', brandName: '理想汽车' },
  { id: 'nio', brandName: '蔚来汽车' },
  { id: 'xpeng', brandName: '小鹏汽车' },
]

/* 全局标签 —— 用户可自由增删；产品 / FAQ 仅是其中两个示例 */
export const INITIAL_TAGS = [
  { id: 'tag-product', name: '产品', color: 'var(--color-blue-500)', description: '产品介绍、功能、规格类信息。' },
  { id: 'tag-faq', name: 'FAQ', color: 'var(--color-violet-500)', description: '常见问题与标准答案。' },
  { id: 'tag-policy', name: '政策', color: 'var(--color-amber-500)', description: '售后、保修、隐私等政策条款。' },
  { id: 'tag-case', name: '案例', color: 'var(--color-emerald-500)', description: '客户案例与场景实践。' },
]

/* ============================================================================
 * 切块工具 (mock) —— 接真后端时整组替换为 service 返回的 chunk 数组
 * ========================================================================== */
export function mockChunkText(text, sourceName = '手动添加') {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 8)

  const out = []
  for (const p of paragraphs) {
    if (p.length <= 240) {
      out.push(p)
      continue
    }
    const sentences = p.split(/(?<=[。！？!?.])\s*/)
    let buf = ''
    for (const s of sentences) {
      if ((buf + s).length > 240) {
        if (buf) out.push(buf)
        buf = s
      } else {
        buf += s
      }
    }
    if (buf) out.push(buf)
  }

  return out.map((t, i) => ({
    id: `${Date.now()}-${i}-${Math.round(Math.random() * 1e6)}`,
    text: t,
    source: sourceName === '手动添加' ? 'manual' : 'file',
    sourceName,
    tokenCount: Math.max(1, Math.round(t.length / 1.8)),
  }))
}

export function mockChunkFile(file) {
  const base = file.name.replace(/\.[^.]+$/, '')
  const count = Math.max(3, Math.min(7, Math.round(file.size / 4096) || 4))
  return Array.from({ length: count }, (_, i) => ({
    id: `${Date.now()}-${i}-${Math.round(Math.random() * 1e6)}`,
    text: `《${base}》第 ${i + 1} 段 · 模型抽取的关键段落 · 后端会替换为真实切分结果，前端只负责呈现 ${count} 个块的展示与编辑。`,
    source: 'file',
    sourceName: file.name,
    tokenCount: 120 + i * 18,
  }))
}

export function dedupeChunks(existing, incoming) {
  const seen = new Set(existing.map((c) => c.text.trim().toLowerCase()))
  const fresh = []
  let skipped = 0
  for (const c of incoming) {
    const key = c.text.trim().toLowerCase()
    if (seen.has(key)) {
      skipped += 1
      continue
    }
    seen.add(key)
    fresh.push(c)
  }
  return { fresh, skipped }
}

/* ============================================================================
 * 信息条目 mock —— 统一条目 + 多标签
 * ========================================================================== */
export const INITIAL_INFORMATION = [
  {
    id: 'info-monitor',
    title: '火山 GEO · 监测引擎',
    companyId: 'huoshan-geo',
    companyName: '火山 GEO',
    tagIds: ['tag-product'],
    chunks: mockChunkText(
      `火山 GEO 监测引擎面向品牌方提供生成式搜索的可见性监控。

引擎每天采集 6 大 AI 平台对场景词的回答样本，统计品牌的提及次数、提及率与平均位次，输出可视化仪表盘。

支持自定义场景词与目标产品，监测周期可按日 / 周 / 月聚合。`,
      '初始化样本.md'
    ),
    updatedAt: '2026/05/30',
  },
  {
    id: 'info-faq-price',
    title: '监测引擎如何计费？',
    companyId: 'huoshan-geo',
    companyName: '火山 GEO',
    tagIds: ['tag-faq', 'tag-policy'],
    chunks: mockChunkText(
      `监测引擎按监测的「场景词 × 平台」组合数计费，支持按月或按年订阅。

新用户提供 14 天全功能试用，试用期内不限场景词数量。

升级、降级或取消可在账单中心自助操作，按比例结算。`,
      '计费说明.md'
    ),
    updatedAt: '2026/05/28',
  },
]

export function tagById(tags, id) {
  return tags.find((t) => t.id === id)
}

export function countInfoByTag(infoList, tagId) {
  return infoList.filter((info) => info.tagIds.includes(tagId)).length
}
