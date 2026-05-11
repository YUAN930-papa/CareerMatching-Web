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
      if (!data.user) { router.replace('/login'); return }
      try { setText(localStorage.getItem(RESUME_STORAGE_KEY) || '') } catch {}
      setLoading(false)
    })()
  }, [router, supabase])

  function save() {
    localStorage.setItem(RESUME_STORAGE_KEY, text)
    setSavedAt(Date.now())
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

        .rp-scene {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
          background: #f0d9c0;
          padding: 40px 32px;
        }
        .rp-blob1 {
          position: fixed; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, #e8602a 0%, transparent 70%);
          bottom: -150px; left: -100px; filter: blur(80px); opacity: 0.7; pointer-events: none;
        }
        .rp-blob2 {
          position: fixed; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, #f5b07a 0%, transparent 70%);
          top: -100px; right: -80px; filter: blur(90px); opacity: 0.6; pointer-events: none;
        }
        .rp-grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.35;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px; mix-blend-mode: overlay;
        }
        .rp-wrap {
          position: relative; z-index: 1; max-width: 760px; margin: 0 auto;
        }

        /* nav */
        .rp-nav {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 36px;
        }
        .rp-nav-title {
          font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.4);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .rp-nav-back {
          font-size: 13px; font-weight: 500; color: rgba(0,0,0,0.5);
          cursor: pointer; letter-spacing: 0.01em;
          background: rgba(255,255,255,0.35);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 999px; padding: 6px 16px;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          transition: all 0.18s;
        }
        .rp-nav-back:hover { background: rgba(255,255,255,0.55); }

        /* heading */
        .rp-heading {
          font-size: 32px; font-weight: 600; color: #000;
          letter-spacing: -0.03em; margin-bottom: 6px;
        }
        .rp-sub {
          font-size: 14px; color: rgba(0,0,0,0.42); margin-bottom: 28px;
          font-weight: 400; line-height: 1.6;
        }

        /* glass card */
        .rp-card {
          background: rgba(255,255,255,0.40);
          backdrop-filter: blur(32px) saturate(1.6);
          -webkit-backdrop-filter: blur(32px) saturate(1.6);
          border: 1px solid rgba(255,255,255,0.65);
          border-radius: 20px;
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,0.80),
            inset 0 -1px 0 rgba(0,0,0,0.05),
            0 24px 60px rgba(120,50,10,0.14),
            0 4px 16px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        /* textarea */
        .rp-textarea {
          width: 100%; min-height: 420px;
          padding: 24px; font-size: 14px; line-height: 1.8;
          font-family: 'Inter', -apple-system, monospace;
          font-weight: 400; color: #000;
          background: transparent; border: none; outline: none; resize: vertical;
          display: block;
        }
        .rp-textarea::placeholder { color: rgba(0,0,0,0.25); }

        /* footer bar */
        .rp-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.18);
        }
        .rp-saved {
          font-size: 12px; color: rgba(0,0,0,0.38); font-weight: 400; letter-spacing: 0.01em;
        }
        .rp-btn {
          background: #000; color: #fff; border: none;
          border-radius: 999px; padding: 10px 28px;
          font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; letter-spacing: 0.02em;
          box-shadow: 0 4px 16px rgba(0,0,0,0.22);
          transition: all 0.18s;
        }
        .rp-btn:hover { background: #1a1a1a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.28); }
        .rp-btn:active { transform: translateY(0); }

        /* char count */
        .rp-count {
          font-size: 12px; color: rgba(0,0,0,0.3);
          padding: 0 24px 12px; text-align: right;
        }
      `}</style>

      <div className="rp-scene">
        <div className="rp-blob1" />
        <div className="rp-blob2" />
        <div className="rp-grain" />

        <div className="rp-wrap">
          <div className="rp-nav">
            <span className="rp-nav-title">求职助手</span>
            <span className="rp-nav-back" onClick={() => router.push('/dashboard')}>← 返回</span>
          </div>

          <div className="rp-heading">简历编辑</div>
          <div className="rp-sub">粘贴或编辑你的简历内容，自动保存到本地。</div>

          <div className="rp-card">
            <textarea
              className="rp-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="把简历内容粘贴到这里..."
            />
            <div className="rp-count">{text.length} 字符</div>
            <div className="rp-footer">
              <span className="rp-saved">
                {savedAt ? `已保存于 ${new Date(savedAt).toLocaleTimeString()}` : '尚未保存'}
              </span>
              <button className="rp-btn" onClick={save}>保存</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
