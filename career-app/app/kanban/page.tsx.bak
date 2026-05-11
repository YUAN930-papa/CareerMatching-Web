'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type Status = 'applied' | 'interview' | 'offer' | 'rejected'
type Item = {
  id: string; company: string; role: string; note: string
  status: Status; createdAt: number
}

const STORAGE_KEY = 'career_app_kanban_v1'

const COLUMNS: { key: Status; title: string; color: string; dot: string }[] = [
  { key: 'applied',   title: '已投递', color: 'rgba(59,130,246,0.12)',  dot: '#3b82f6' },
  { key: 'interview', title: '面试中', color: 'rgba(234,179,8,0.12)',   dot: '#ca8a04' },
  { key: 'offer',     title: 'Offer',  color: 'rgba(34,197,94,0.12)',   dot: '#16a34a' },
  { key: 'rejected',  title: '未通过', color: 'rgba(239,68,68,0.10)',   dot: '#dc2626' },
]

export default function KanbanPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [note, setNote] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) { router.replace('/login'); return }
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
    setItems(prev => [{
      id: crypto.randomUUID(), company: company.trim(),
      role: role.trim(), note: note.trim(),
      status: 'applied', createdAt: Date.now(),
    }, ...prev])
    setCompany(''); setRole(''); setNote(''); setShowForm(false)
  }

  function move(id: string, to: Status) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: to } : i))
  }

  function remove(id: string) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0d9c0', fontFamily: 'Inter, sans-serif', color: 'rgba(0,0,0,0.4)', fontSize: 14 }}>
      加载中...
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .kb-scene {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          background: #f0d9c0;
          padding: 36px 28px 60px;
          overflow-x: hidden;
        }
        .kb-blob1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, #e8602a 0%, transparent 70%);
          bottom: -150px; left: -100px; filter: blur(80px); opacity: 0.7; pointer-events: none;
        }
        .kb-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, #f5b07a 0%, transparent 70%);
          top: -100px; right: -80px; filter: blur(90px); opacity: 0.6; pointer-events: none;
        }
        .kb-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.35;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; mix-blend-mode: overlay;
        }
        .kb-wrap { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; }

        /* top nav */
        .kb-nav {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;
        }
        .kb-nav-left { display: flex; align-items: baseline; gap: 12px; }
        .kb-nav-title { font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.4); letter-spacing: 0.06em; text-transform: uppercase; }
        .kb-heading { font-size: 28px; font-weight: 600; color: #000; letter-spacing: -0.025em; }
        .kb-nav-back {
          font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.5); cursor: pointer;
          background: rgba(255,255,255,0.35); border: 1px solid rgba(255,255,255,0.6);
          border-radius: 999px; padding: 6px 16px;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.18s;
        }
        .kb-nav-back:hover { background: rgba(255,255,255,0.55); }

        /* add button */
        .kb-add-btn {
          background: #000; color: #fff; border: none; border-radius: 999px;
          padding: 9px 22px; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2); transition: all 0.18s;
        }
        .kb-add-btn:hover { background: #1a1a1a; transform: translateY(-1px); }

        /* add form glass panel */
        .kb-form {
          background: rgba(255,255,255,0.40);
          backdrop-filter: blur(32px) saturate(1.6);
          -webkit-backdrop-filter: blur(32px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 18px;
          box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.80), 0 16px 40px rgba(120,50,10,0.12);
          padding: 24px; margin-bottom: 28px;
          display: grid; grid-template-columns: 1fr 1fr 2fr auto; gap: 10px; align-items: end;
        }
        .kb-form-field { display: flex; flex-direction: column; gap: 6px; }
        .kb-form-label { font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.45); letter-spacing: 0.04em; text-transform: uppercase; }
        .kb-input {
          width: 100%; padding: 10px 14px; font-size: 14px; font-family: inherit;
          background: rgba(255,255,255,0.42); border: 1px solid rgba(255,255,255,0.60);
          border-radius: 10px; outline: none; color: #000;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.70);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: all 0.18s;
        }
        .kb-input::placeholder { color: rgba(0,0,0,0.25); font-weight: 300; }
        .kb-input:focus { background: rgba(255,255,255,0.62); border-color: rgba(255,255,255,0.80); box-shadow: inset 0 1px 0 rgba(255,255,255,0.80), 0 0 0 3px rgba(0,0,0,0.06); }
        .kb-form-btn {
          background: #000; color: #fff; border: none; border-radius: 10px;
          padding: 10px 20px; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; white-space: nowrap; transition: all 0.18s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2); align-self: end;
        }
        .kb-form-btn:hover { background: #1a1a1a; }

        /* stats row */
        .kb-stats {
          display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;
        }
        .kb-stat {
          background: rgba(255,255,255,0.35);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 12px; padding: 10px 18px;
          display: flex; align-items: center; gap: 8px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }
        .kb-stat-dot { width: 7px; height: 7px; border-radius: 50%; }
        .kb-stat-label { font-size: 12px; color: rgba(0,0,0,0.45); font-weight: 400; }
        .kb-stat-num { font-size: 14px; font-weight: 600; color: #000; }

        /* board */
        .kb-board { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

        /* column */
        .kb-col {
          background: rgba(255,255,255,0.32);
          backdrop-filter: blur(24px) saturate(1.4);
          -webkit-backdrop-filter: blur(24px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.60);
          border-radius: 18px; padding: 16px;
          box-shadow: inset 0 1.5px 0 rgba(255,255,255,0.75), 0 8px 24px rgba(0,0,0,0.06);
          display: flex; flex-direction: column; gap: 10px;
          min-height: 300px;
        }
        .kb-col-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;
        }
        .kb-col-title-wrap { display: flex; align-items: center; gap: 7px; }
        .kb-col-dot { width: 7px; height: 7px; border-radius: 50%; }
        .kb-col-title { font-size: 13px; font-weight: 600; color: #000; letter-spacing: 0.01em; }
        .kb-col-count {
          font-size: 11px; font-weight: 500; color: rgba(0,0,0,0.35);
          background: rgba(0,0,0,0.06); border-radius: 999px; padding: 2px 8px;
        }

        /* card */
        .kb-card {
          background: rgba(255,255,255,0.52);
          border: 1px solid rgba(255,255,255,0.70);
          border-radius: 12px; padding: 14px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.18s;
        }
        .kb-card:hover { background: rgba(255,255,255,0.68); transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255,255,255,0.90), 0 6px 16px rgba(0,0,0,0.08); }
        .kb-card-company { font-size: 14px; font-weight: 600; color: #000; margin-bottom: 2px; }
        .kb-card-role { font-size: 13px; color: rgba(0,0,0,0.5); margin-bottom: 4px; }
        .kb-card-note { font-size: 12px; color: rgba(0,0,0,0.38); line-height: 1.5; margin-bottom: 10px; }
        .kb-card-actions { display: flex; gap: 5px; flex-wrap: wrap; }
        .kb-move-btn {
          font-size: 11px; font-weight: 500; font-family: inherit;
          color: rgba(0,0,0,0.45); background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.08); border-radius: 999px;
          padding: 3px 10px; cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .kb-move-btn:hover { background: rgba(0,0,0,0.10); color: #000; }
        .kb-del-btn {
          font-size: 11px; font-weight: 500; font-family: inherit;
          color: rgba(180,40,20,0.6); background: rgba(220,60,10,0.06);
          border: 1px solid rgba(220,60,10,0.12); border-radius: 999px;
          padding: 3px 10px; cursor: pointer; transition: all 0.15s;
        }
        .kb-del-btn:hover { background: rgba(220,60,10,0.12); color: #b91c0c; }

        /* empty state */
        .kb-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          flex: 1; padding: 24px 0; gap: 6px;
        }
        .kb-empty-icon { font-size: 22px; opacity: 0.25; }
        .kb-empty-text { font-size: 12px; color: rgba(0,0,0,0.3); font-weight: 400; }

        @media (max-width: 900px) {
          .kb-board { grid-template-columns: repeat(2, 1fr); }
          .kb-form { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 560px) {
          .kb-board { grid-template-columns: 1fr; }
          .kb-form { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="kb-scene">
        <div className="kb-blob1" />
        <div className="kb-blob2" />
        <div className="kb-grain" />

        <div className="kb-wrap">

          {/* nav */}
          <div className="kb-nav">
            <div className="kb-nav-left">
              <span className="kb-nav-title">求职助手</span>
              <span className="kb-heading">投递看板</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="kb-add-btn" onClick={() => setShowForm(v => !v)}>
                {showForm ? '取消' : '+ 新增'}
              </button>
              <span className="kb-nav-back" onClick={() => router.push('/dashboard')}>← 返回</span>
            </div>
          </div>

          {/* add form */}
          {showForm && (
            <div className="kb-form">
              <div className="kb-form-field">
                <label className="kb-form-label">公司</label>
                <input className="kb-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="公司名称" />
              </div>
              <div className="kb-form-field">
                <label className="kb-form-label">岗位</label>
                <input className="kb-input" value={role} onChange={e => setRole(e.target.value)} placeholder="岗位名称" />
              </div>
              <div className="kb-form-field">
                <label className="kb-form-label">备注</label>
                <input className="kb-input" value={note} onChange={e => setNote(e.target.value)} placeholder="备注（可选）" />
              </div>
              <button className="kb-form-btn" onClick={addItem}>添加</button>
            </div>
          )}

          {/* stats */}
          <div className="kb-stats">
            {COLUMNS.map(col => (
              <div className="kb-stat" key={col.key}>
                <div className="kb-stat-dot" style={{ background: col.dot }} />
                <span className="kb-stat-label">{col.title}</span>
                <span className="kb-stat-num">{items.filter(i => i.status === col.key).length}</span>
              </div>
            ))}
            <div className="kb-stat">
              <span className="kb-stat-label">总计</span>
              <span className="kb-stat-num">{items.length}</span>
            </div>
          </div>

          {/* board */}
          <div className="kb-board">
            {COLUMNS.map(col => {
              const list = items.filter(x => x.status === col.key).sort((a, b) => b.createdAt - a.createdAt)
              return (
                <div className="kb-col" key={col.key}>
                  <div className="kb-col-header">
                    <div className="kb-col-title-wrap">
                      <div className="kb-col-dot" style={{ background: col.dot }} />
                      <span className="kb-col-title">{col.title}</span>
                    </div>
                    <span className="kb-col-count">{list.length}</span>
                  </div>

                  {list.length === 0 ? (
                    <div className="kb-empty">
                      <div className="kb-empty-icon">○</div>
                      <div className="kb-empty-text">暂无记录</div>
                    </div>
                  ) : (
                    list.map(item => (
                      <div className="kb-card" key={item.id}>
                        <div className="kb-card-company">{item.company}</div>
                        <div className="kb-card-role">{item.role}</div>
                        {item.note && <div className="kb-card-note">{item.note}</div>}
                        <div className="kb-card-actions">
                          {COLUMNS.filter(c => c.key !== col.key).map(c => (
                            <button key={c.key} className="kb-move-btn" onClick={() => move(item.id, c.key)}>
                              → {c.title}
                            </button>
                          ))}
                          <button className="kb-del-btn" onClick={() => remove(item.id)}>删除</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </>
  )
}
