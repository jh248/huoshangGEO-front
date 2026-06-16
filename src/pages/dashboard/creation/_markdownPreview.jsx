/**
 * [INPUT]: 依赖 react useMemo，本地 cn
 * [OUTPUT]: 命名导出 MarkdownPreview — 轻量 Markdown 块级 + 行内预览组件
 * [POS]: pages/dashboard/creation 私有预览组件，ContentCreate 消费
 * [PROTOCOL]: 支持常用写作格式；不使用 dangerouslySetInnerHTML
 */
import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

function inlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)

  return parts.map((part, index) => {
    if (!part) return null

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm">
          {part.slice(1, -1)}
        </code>
      )
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="text-primary underline underline-offset-4">
          {linkMatch[1]}
        </a>
      )
    }

    return <span key={index}>{part}</span>
  })
}

function flushParagraph(blocks, paragraph) {
  if (!paragraph.length) return
  blocks.push({
    type: 'p',
    text: paragraph.join(' '),
  })
  paragraph.length = 0
}

function parseMarkdown(markdown) {
  const lines = markdown.split('\n')
  const blocks = []
  const paragraph = []

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim()

    if (!trimmed) {
      flushParagraph(blocks, paragraph)
      continue
    }

    if (trimmed.startsWith('```')) {
      flushParagraph(blocks, paragraph)
      const code = []
      i += 1
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        code.push(lines[i])
        i += 1
      }
      blocks.push({ type: 'code', text: code.join('\n') })
      continue
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      flushParagraph(blocks, paragraph)
      blocks.push({ type: `h${heading[1].length}`, text: heading[2] })
      continue
    }

    if (trimmed === '---') {
      flushParagraph(blocks, paragraph)
      blocks.push({ type: 'hr' })
      continue
    }

    if (trimmed.startsWith('>')) {
      flushParagraph(blocks, paragraph)
      blocks.push({ type: 'quote', text: trimmed.replace(/^>\s?/, '') })
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph(blocks, paragraph)
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''))
        i += 1
      }
      i -= 1
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushParagraph(blocks, paragraph)
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i += 1
      }
      i -= 1
      blocks.push({ type: 'ol', items })
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph(blocks, paragraph)
  return blocks
}

function MarkdownPreview({ markdown, compact = false, variant = 'default' }) {
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown])
  const youmind = variant === 'youmind'

  return (
    <article
      className={cn(
        'mx-auto max-w-3xl space-y-5 text-foreground',
        compact && 'space-y-3',
        youmind && 'max-w-none space-y-9'
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === 'h1') {
          return (
            <h1 key={index} className={cn('text-3xl font-bold leading-tight', youmind && 'text-4xl')}>
              {inlineMarkdown(block.text)}
            </h1>
          )
        }

        if (block.type === 'h2') {
          return (
            <h2 key={index} className={cn('pt-4 text-2xl font-bold leading-tight', youmind && 'pt-6 text-4xl')}>
              {inlineMarkdown(block.text)}
            </h2>
          )
        }

        if (block.type === 'h3') {
          return (
            <h3 key={index} className={cn('pt-2 text-xl font-semibold leading-tight', youmind && 'text-3xl font-bold')}>
              {inlineMarkdown(block.text)}
            </h3>
          )
        }

        if (block.type === 'p') {
          return (
            <p key={index} className={cn('text-base leading-8', youmind && 'text-2xl leading-10')}>
              {inlineMarkdown(block.text)}
            </p>
          )
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={index} className="rounded-md border-l-4 border-primary bg-muted px-4 py-3 text-sm leading-7 text-muted-foreground">
              {inlineMarkdown(block.text)}
            </blockquote>
          )
        }

        if (block.type === 'ul') {
          return (
            <ul key={index} className={cn('list-disc space-y-2 pl-6 text-base leading-8', youmind && 'space-y-4 text-2xl leading-10')}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}
            </ul>
          )
        }

        if (block.type === 'ol') {
          return (
            <ol key={index} className={cn('list-decimal space-y-2 pl-6 text-base font-semibold leading-8', youmind && 'space-y-9 text-3xl leading-10')}>
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}
            </ol>
          )
        }

        if (block.type === 'code') {
          return (
            <pre key={index} className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm leading-7 text-foreground">
              <code>{block.text}</code>
            </pre>
          )
        }

        return <Separator key={index} />
      })}
    </article>
  )
}

export { MarkdownPreview }
