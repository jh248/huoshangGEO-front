/**
 * [INPUT]: 依赖 @tiptap/react + @tiptap/starter-kit + @tiptap/extension-placeholder，lib/utils cn
 * [OUTPUT]: 命名导出 TiptapEditor — 富文本编辑器 (forwardRef 暴露 editor 实例 + appendBlockquote)
 * [POS]: pages/dashboard/creation 私有，被 ContentCreate 内容创作页消费
 * [PROTOCOL]: 视觉仅用 token 派生的 Tailwind 工具类 (arbitrary 子选择器)，不写 hex；占位符样式在 index.css
 */
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

const CONTENT_CLASS = cn(
  'tiptap min-h-[60vh] max-w-none text-foreground focus:outline-none',
  '[&>*:first-child]:mt-0',
  '[&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight',
  '[&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-bold',
  '[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-semibold',
  '[&_p]:my-3 [&_p]:leading-7',
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:my-1 [&_li]:leading-7',
  '[&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground',
  '[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm',
  '[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:text-sm',
  '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
  '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
  '[&_hr]:my-6 [&_hr]:border-border',
  '[&_strong]:font-semibold',
)

function extractTitle(editor) {
  let title = ''
  editor.state.doc.descendants((node) => {
    if (title) return false
    if (node.type.name === 'heading') {
      title = node.textContent.trim()
      return false
    }
    return true
  })
  if (!title) title = editor.state.doc.firstChild?.textContent?.trim() ?? ''
  return title || '未命名文章'
}

export const TiptapEditor = forwardRef(function TiptapEditor({ initialContent, onTitleChange }, ref) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '开始写作，或从右侧让 AI 帮你生成…' }),
    ],
    content: initialContent,
    editorProps: { attributes: { class: CONTENT_CLASS } },
    onUpdate: ({ editor }) => onTitleChange?.(extractTitle(editor)),
  })

  useEffect(() => {
    if (editor) onTitleChange?.(extractTitle(editor))
  }, [editor, onTitleChange])

  useImperativeHandle(
    ref,
    () => ({
      editor,
      appendBlockquote(text) {
        const value = text?.trim()
        if (!editor || !value) return
        editor
          .chain()
          .focus('end')
          .insertContent({
            type: 'blockquote',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }],
          })
          .run()
      },
    }),
    [editor],
  )

  return <EditorContent editor={editor} />
})
