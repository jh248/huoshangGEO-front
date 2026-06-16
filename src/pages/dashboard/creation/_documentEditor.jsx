/**
 * [INPUT]: markdown 字符串 + onChange 回调，本地 cn
 * [OUTPUT]: 命名导出 DocumentEditor — 飞书式块编辑器
 * [POS]: pages/dashboard/creation 私有编辑器组件，ContentCreate 中间正文消费
 * [PROTOCOL]: 块级可编辑；不使用 dangerouslySetInnerHTML；回车新增段落，空块退格删除
 */
import { useEffect, useMemo, useRef } from 'react'
import { GripVertical, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function appendParagraph(blocks, paragraph) {
  if (!paragraph.length) return
  blocks.push({ id: uid(), type: 'p', text: paragraph.join(' ') })
  paragraph.length = 0
}

function markdownToBlocks(markdown) {
  const blocks = []
  const paragraph = []
  const lines = markdown.split('\n')

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      appendParagraph(blocks, paragraph)
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      appendParagraph(blocks, paragraph)
      blocks.push({ id: uid(), type: `h${heading[1].length}`, text: heading[2] })
      continue
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/)
    if (ordered) {
      appendParagraph(blocks, paragraph)
      blocks.push({ id: uid(), type: 'ol', text: ordered[1] })
      continue
    }

    const unordered = line.match(/^[-*]\s+(.+)$/)
    if (unordered) {
      appendParagraph(blocks, paragraph)
      blocks.push({ id: uid(), type: 'ul', text: unordered[1] })
      continue
    }

    const quote = line.match(/^>\s?(.+)$/)
    if (quote) {
      appendParagraph(blocks, paragraph)
      blocks.push({ id: uid(), type: 'quote', text: quote[1] })
      continue
    }

    paragraph.push(line)
  }

  appendParagraph(blocks, paragraph)
  return blocks.length ? blocks : [{ id: uid(), type: 'p', text: '' }]
}

function blocksToMarkdown(blocks) {
  let orderedIndex = 1
  return blocks
    .map((block) => {
      if (block.type !== 'ol') orderedIndex = 1
      const text = block.text.trim()
      if (block.type === 'h1') return `# ${text}`
      if (block.type === 'h2') return `## ${text}`
      if (block.type === 'h3') return `### ${text}`
      if (block.type === 'ol') return `${orderedIndex++}. ${text}`
      if (block.type === 'ul') return `- ${text}`
      if (block.type === 'quote') return `> ${text}`
      return text
    })
    .join('\n\n')
}

function blockClass(type) {
  if (type === 'h1') return 'text-4xl font-bold leading-tight'
  if (type === 'h2') return 'pt-6 text-4xl font-bold leading-tight'
  if (type === 'h3') return 'pt-2 text-3xl font-bold leading-tight'
  if (type === 'ol') return 'text-3xl font-bold leading-10'
  if (type === 'ul') return 'text-2xl leading-10'
  if (type === 'quote') return 'border-l-4 border-primary pl-4 text-2xl leading-10 text-muted-foreground'
  return 'text-2xl leading-10'
}

function markerFor(block, index, blocks) {
  if (block.type === 'ul') return '•'
  if (block.type !== 'ol') return null
  return `${blocks.slice(0, index + 1).filter((item) => item.type === 'ol').length}.`
}

function DocumentEditor({ markdown, onChange }) {
  const focusIdRef = useRef(null)
  const blocks = useMemo(() => markdownToBlocks(markdown), [markdown])

  useEffect(() => {
    if (!focusIdRef.current) return
    const el = document.querySelector(`[data-editor-block="${focusIdRef.current}"]`)
    if (el) {
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
    }
    focusIdRef.current = null
  }, [blocks])

  const commit = (nextBlocks) => {
    onChange(blocksToMarkdown(nextBlocks))
  }

  const updateBlock = (id, text) => {
    const next = blocks.map((block) => (block.id === id ? { ...block, text } : block))
    commit(next)
  }

  const insertAfter = (index, type = 'p') => {
    const next = [
      ...blocks.slice(0, index + 1),
      { id: uid(), type, text: '' },
      ...blocks.slice(index + 1),
    ]
    focusIdRef.current = next[index + 1].id
    commit(next)
  }

  const removeEmpty = (index) => {
    if (blocks.length <= 1 || blocks[index].text.trim()) return
    const next = blocks.filter((_, i) => i !== index)
    focusIdRef.current = next[Math.max(0, index - 1)]?.id
    commit(next)
  }

  return (
    <article className="mx-auto max-w-3xl space-y-7 text-foreground">
      {blocks.map((block, index) => {
        const marker = markerFor(block, index, blocks)
        return (
          <div key={block.id} className="group/editor-block relative flex gap-4">
            <div className="absolute -left-12 top-1 hidden items-center gap-1 text-muted-foreground opacity-0 transition-opacity group-hover/editor-block:flex group-hover/editor-block:opacity-100">
              <button
                type="button"
                aria-label="添加块"
                className="flex size-6 items-center justify-center rounded-md hover:bg-muted"
                onClick={() => insertAfter(index)}
              >
                <Plus className="size-4" />
              </button>
              <GripVertical className="size-4" />
            </div>
            {marker && <span className="w-10 shrink-0 pt-0.5 text-right text-3xl font-bold leading-10">{marker}</span>}
            <div
              data-editor-block={block.id}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className={cn(
                'min-w-0 flex-1 rounded-md outline-none transition-colors empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] focus:bg-muted/30',
                blockClass(block.type)
              )}
              data-placeholder="输入正文，或按 / 插入内容"
              onBlur={(event) => updateBlock(block.id, event.currentTarget.textContent ?? '')}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  const text = event.currentTarget.textContent ?? ''
                  const next = blocks.map((item) => (item.id === block.id ? { ...item, text } : item))
                  const type = block.type === 'ol' || block.type === 'ul' ? block.type : 'p'
                  const inserted = [
                    ...next.slice(0, index + 1),
                    { id: uid(), type, text: '' },
                    ...next.slice(index + 1),
                  ]
                  focusIdRef.current = inserted[index + 1].id
                  commit(inserted)
                }
                if (event.key === 'Backspace') {
                  removeEmpty(index)
                }
              }}
            >
              {block.text}
            </div>
          </div>
        )
      })}
    </article>
  )
}

export { DocumentEditor }
