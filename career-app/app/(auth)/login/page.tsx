'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('注册成功！请检查邮箱确认链接。')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── SCENE: warm blobs on cream ── */
        .scene {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'Inter', -apple-system, 'SF Pro Display', sans-serif;
          position: relative;
          overflow: hidden;
          background: #f0d9c0;
        }

        /* blob 1 – deep orange bottom-left */
        .blob1 {
          position: fixed;
          width: 600px; height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, #e8602a 0%, transparent 70%);
          bottom: -150px; left: -100px;
          filter: blur(80px);
          opacity: 0.75;
          pointer-events: none;
        }

        /* blob 2 – soft peach top-right */
        .blob2 {
          position: fixed;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, #f5b07a 0%, transparent 70%);
          top: -100px; right: -80px;
          filter: blur(90px);
          opacity: 0.65;
          pointer-events: none;
        }

        /* blob 3 – warm tan center */
        .blob3 {
          position: fixed;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, #d4956a 0%, transparent 70%);
          top: 40%; left: 40%;
          transform: translate(-50%, -50%);
          filter: blur(100px);
          opacity: 0.45;
          pointer-events: none;
        }

        /* grain overlay */
        .grain {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.38;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          mix-blend-mode: overlay;
        }

        /* ── GLASS CARD ── */
        .card {
          position: relative;
          z-index: 2;
          display: flex;
          width: 100%;
          max-width: 800px;
          min-height: 500px;
          border-radius: 24px;
          overflow: hidden;

          /* liquid glass base */
          background: rgba(255, 255, 255, 0.40);
          backdrop-filter: blur(32px) saturate(1.6);
          -webkit-backdrop-filter: blur(32px) saturate(1.6);

          /* 1px white border = glass edge refraction */
          border: 1px solid rgba(255, 255, 255, 0.65);

          box-shadow:
            /* top highlight rim */
            inset 0 1.5px 0 rgba(255,255,255,0.80),
            /* bottom shadow rim */
            inset 0 -1px 0 rgba(0,0,0,0.06),
            /* outer depth */
            0 32px 80px rgba(120,50,10,0.18),
            0 8px 24px rgba(0,0,0,0.08);
        }

        /* ── LEFT PANEL ── */
        .left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px 32px;

          /* slightly less opaque than card — lets blobs show more */
          background: rgba(255, 255, 255, 0.10);
          border-right: 1px solid rgba(255, 255, 255, 0.35);
        }

        /* grain on left panel */
        .left::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.55;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.70' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          mix-blend-mode: soft-light;
        }

        .left-label {
          position: relative;
          z-index: 1;
          font-size: 10px;
          font-weight: 500;
          color: rgba(60,30,10,0.5);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .left-headline {
          position: relative;
          z-index: 1;
          font-size: 24px;
          font-weight: 600;
          color: rgba(30,15,5,0.85);
          line-height: 1.4;
          letter-spacing: -0.02em;
        }

        /* ── RIGHT PANEL ── */
        .right {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 44px;
          /* slightly more opaque right side for readability */
          background: rgba(255, 255, 255, 0.28);
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 500;
          color: #c04810;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .heading {
          font-size: 28px;
          font-weight: 600;
          color: #000;
          margin-bottom: 6px;
          letter-spacing: -0.025em;
        }

        .subtext {
          font-size: 13px;
          color: rgba(0,0,0,0.45);
          margin-bottom: 32px;
          line-height: 1.6;
          font-weight: 400;
        }

        /* tab switcher */
        .tabs {
          display: inline-flex;
          background: rgba(0,0,0,0.07);
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 999px;
          padding: 3px;
          margin-bottom: 28px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .tab {
          padding: 6px 22px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 999px;
          cursor: pointer;
          color: rgba(0,0,0,0.45);
          transition: all 0.18s ease;
          border: none;
          background: transparent;
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        .tab.active {
          background: rgba(255,255,255,0.82);
          color: #000;
          box-shadow: 0 1px 6px rgba(0,0,0,0.10);
        }

        /* field label */
        .label {
          font-size: 11px;
          font-weight: 500;
          color: rgba(0,0,0,0.5);
          display: block;
          margin-bottom: 6px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* glass input */
        .input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          font-family: inherit;
          font-weight: 400;
          background: rgba(255, 255, 255, 0.42);
          border: 1px solid rgba(255, 255, 255, 0.60);
          border-radius: 12px;
          outline: none;
          color: #000;
          margin-bottom: 16px;
          transition: all 0.18s;
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.70),
            inset 0 -1px 0 rgba(0,0,0,0.04);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .input::placeholder {
          color: rgba(0,0,0,0.28);
          font-weight: 300;
        }

        .input:focus {
          background: rgba(255,255,255,0.62);
          border-color: rgba(255,255,255,0.80);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.80),
            0 0 0 3px rgba(0,0,0,0.06);
        }

        /* pill black button */
        .btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.02em;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          margin-top: 8px;
          transition: all 0.18s ease;
          box-shadow:
            0 4px 16px rgba(0,0,0,0.22),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .btn:hover:not(:disabled) {
          background: #1a1a1a;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.28);
        }

        .btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .msg {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 14px;
          font-weight: 400;
        }
        .msg.ok  { background: rgba(16,185,129,0.12); color: #065f46; border: 1px solid rgba(16,185,129,0.2); }
        .msg.err { background: rgba(220,60,10,0.10);  color: #7a2808; border: 1px solid rgba(220,60,10,0.18); }

        @media (max-width: 600px) {
          .left { display: none; }
          .right { padding: 40px 28px; }
        }
      `}</style>

      <div className="scene">
        {/* background blobs */}
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />
        {/* grain */}
        <div className="grain" />

        {/* glass card */}
        <div className="card">

          {/* left */}
          <div className="left">
            <div className="left-label">求职助手 · AI Platform</div>
            <div className="left-headline">用 AI 精准匹配<br />你的下一份工作</div>
          </div>

          {/* right */}
          <div className="right">
            <div className="eyebrow">Welcome back</div>
            <div className="heading">{mode === 'login' ? '登录账号' : '创建账号'}</div>
            <div className="subtext">
              {mode === 'login' ? 'AI 驱动的个性化求职规划平台' : '开始你的 AI 求职之旅'}
            </div>

            <div className="tabs">
              <button className={`tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>登录</button>
              <button className={`tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>注册</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="label">邮箱</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />

              <label className="label">密码</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="至少 6 位" required />

              {message && (
                <div className={`msg ${message.includes('成功') ? 'ok' : 'err'}`}>{message}</div>
              )}

              <button className="btn" type="submit" disabled={loading}>
                {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}
