'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const RESUME_STORAGE_KEY = 'career_app_resume_text_v1'

export default function ResumePage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [savedAt, setSavedAt] = useState<number | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
        return
      }
      try {
        setText(localStorage.getItem(RESUME_STORAGE_KEY) || '')
      } catch {}
      setLoading(false)
    })()
  }, [router, supabase])

  function save() {
    localStorage.setItem(RESUME_STORAGE_KEY, text)
    setSavedAt(Date.now())
  }

  if (loading) return <div style={{ padding: 40 }}>加载中...</div>

  return (
    <div style={{ padding: '28px', fontFamily: 'system-ui, sans-serif', background: '#f6f4ef', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '22px', marginBottom: 8 }}>简历修改</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>
        这里可以直接编辑你的简历文本（自动本地保存）。
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="把简历内容粘贴到这里..."
        style={{
          width: '100%',
          minHeight: 420,
          padding: 14,
          borderRadius: 10,
          border: '1px solid #d9d3c5',
          fontSize: 14,
          lineHeight: 1.6,
          resize: 'vertical',
          boxSizing: 'border-box',
          background: '#fff',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <button
          onClick={save}
          style={{
            background: '#1a1916',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          保存
        </button>
        <span style={{ fontSize: 13, color: '#777' }}>
          {savedAt ? `已保存：${new Date(savedAt).toLocaleString()}` : '尚未保存'}
        </span>
      </div>
    </div>
  )
}
