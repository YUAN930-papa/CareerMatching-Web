'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Status = 'applied' | 'interview' | 'offer' | 'rejected'
type Item = {
  id: string
  company: string
  role: string
  note: string
  status: Status
  createdAt: number
}

const STORAGE_KEY = 'career_app_kanban_v1'

const COLUMNS: { key: Status; title: string }[] = [
  { key: 'applied', title: '已投递' },
  { key: 'interview', title: '面试中' },
  { key: 'offer', title: 'Offer' },
  { key: 'rejected', title: '未通过' },
]

export default function KanbanPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
        return
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) setItems(JSON.parse(raw) as Item[])
      } catch {}
      setLoading(false)
    })()
  }, [router, supabase])

  useEffect(() => {
    if (!loading) localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, loading])

  function addItem() {
    if (!company.trim() || !role.trim()) return
    setItems((prev) => [
      {
        id: crypto.randomUUID(),
        company: company.trim(),
        role: role.trim(),
        note: note.trim(),
        status: 'applied',
        createdAt: Date.now(),
      },
      ...prev,
    ])
    setCompany('')
    setRole('')
    setNote('')
  }

  function move(itemId: string, to: Status) {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: to } : i)))
  }

  function remove(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  if (loading) return <div style={{ padding: 40 }}>加载中...</div>

  return (
    <div style={{ padding: '28px', fontFamily: 'system-ui, sans-serif', background: '#f6f4ef', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '14px' }}>投递看板</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 3fr auto', gap: 10, marginBottom: 16 }}>
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="公司名" style={inputStyle} />
        <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="岗位名" style={inputStyle} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" style={inputStyle} />
        <button onClick={addItem} style={btnStyle}>新增</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {COLUMNS.map((col) => {
          const list = items
            .filter((x) => x.status === col.key)
            .sort((a, b) => b.createdAt - a.createdAt)
          return (
            <div key={col.key} style={{ background: '#fff', border: '1px solid #e4dfd2', borderRadius: 12, padding: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{col.title} ({list.length})</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {list.map((i) => (
                  <div key={i.id} style={{ border: '1px solid #ece7dc', borderRadius: 10, padding: 10, background: '#fffefb' }}>
                    <div style={{ fontWeight: 600 }}>{i.company}</div>
                    <div style={{ fontSize: 13, color: '#555' }}>{i.role}</div>
                    {i.note ? <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{i.note}</div> : null}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                        <button key={c.key} onClick={() => move(i.id, c.key)} style={miniBtnStyle}>
                          移到{c.title}
                        </button>
                      ))}
                      <button onClick={() => remove(i.id)} style={{ ...miniBtnStyle, borderColor: '#f3c7c7', color: '#a11' }}>
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #d9d3c5',
  fontSize: 14,
}

const btnStyle: CSSProperties = {
  background: '#1a1916',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 14px',
  cursor: 'pointer',
}

const miniBtnStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 12,
  padding: '4px 8px',
  cursor: 'pointer',
}
