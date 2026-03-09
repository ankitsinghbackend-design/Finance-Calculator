import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import axios from 'axios'
import { apiUrl } from '../config/api'

interface TipTapEditorProps {
  content: string
  onChange: (html: string) => void
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null

  const addImage = useCallback(async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('image', file)

      try {
        const { data } = await axios.post<{ url: string }>(apiUrl('/api/upload/image'), formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        if (data.url) {
          editor?.chain().focus().setImage({ src: data.url }).run()
        }
      } catch (err) {
        console.error('Image upload failed:', err)
        alert('Failed to upload image. Please try again.')
      }
    }
    input.click()
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href as string | undefined
    const url = window.prompt('Enter URL', previousUrl ?? '')

    if (url === null) return

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const btnClass = (isActive: boolean) =>
    `px-2 py-1 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-gray-800 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`

  return (
    <div className="flex flex-wrap gap-1 border-b border-cardBorder p-2 bg-alt rounded-t-lg">
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor?.isActive('heading', { level: 1 }) ?? false)}>
        H1
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor?.isActive('heading', { level: 2 }) ?? false)}>
        H2
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor?.isActive('heading', { level: 3 }) ?? false)}>
        H3
      </button>

      <div className="w-px bg-cardBorder mx-1" />

      <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={btnClass(editor?.isActive('bold') ?? false)}>
        <strong>B</strong>
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={btnClass(editor?.isActive('italic') ?? false)}>
        <em>I</em>
      </button>

      <div className="w-px bg-cardBorder mx-1" />

      <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className={btnClass(editor?.isActive('bulletList') ?? false)}>
        • List
      </button>
      <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()} className={btnClass(editor?.isActive('orderedList') ?? false)}>
        1. List
      </button>

      <div className="w-px bg-cardBorder mx-1" />

      <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={btnClass(editor?.isActive('blockquote') ?? false)}>
        " Quote
      </button>
      <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>
        — HR
      </button>

      <div className="w-px bg-cardBorder mx-1" />

      <button type="button" onClick={setLink} className={btnClass(editor?.isActive('link') ?? false)}>
        🔗 Link
      </button>
      <button type="button" onClick={addImage} className={btnClass(false)}>
        🖼 Image
      </button>
    </div>
  )
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          rel: 'noopener noreferrer'
        }
      })
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px]'
      }
    }
  })

  return (
    <div className="border border-cardBorder rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
