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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  async function handleForgotPassword() {
    setMessage('')
    const trimmed = email.trim()
    if (!trimmed) { setMessage('请先填写邮箱，再点击「忘记密码」。'); return }
    setLoading(true)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) setMessage(error.message)
    else setMessage('已发送重置邮件，请查收邮箱并点击链接设置新密码。')
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", sans-serif; }
        html, body { display: block !important; margin: 0; padding: 0; }

        .scene {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #e0e9f5 0%, #cbd5e1 50%, #aebeec 100%);
          overflow: hidden;
          position: relative;
        }

        .scene::before {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          background: linear-gradient(135deg, #a5b4fc, #818cf8);
          border-radius: 50%;
          top: 15%; left: 25%;
          z-index: 1;
          filter: blur(20px);
          opacity: 0.6;
        }

        .scene::after {
          content: '';
          position: absolute;
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #fbcfe8, #f472b6);
          border-radius: 50%;
          bottom: 10%; right: 20%;
          z-index: 1;
          filter: blur(40px);
          opacity: 0.4;
        }

        /* ── Glass card ──────────────────────────────────────────── */
        .glass-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 2.5rem;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          -webkit-backdrop-filter: blur(20px);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.2);
          box-shadow:
            0 4px 30px rgba(0,0,0,0.02),
            0 15px 40px rgba(0,0,0,0.05),
            inset 0 1px 0 rgba(255,255,255,0.25),
            inset 0 -1px 2px rgba(0,0,0,0.03);
          transform: translate3d(0,0,0);
          backface-visibility: hidden;
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }

        .glass-card:hover {
          transform: translate3d(0,-4px,0);
          border-color: rgba(255,255,255,0.3);
          background: linear-gradient(135deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.05) 100%);
          box-shadow:
            0 8px 40px rgba(0,0,0,0.04),
            0 25px 60px rgba(0,0,0,0.09),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }

        /* ── Header ──────────────────────────────────────────────── */
        .card-header { margin-bottom: 2rem; }

        .brand-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .main-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .subtitle {
          font-size: 0.85rem;
          color: #64748b;
        }

        /* ── Tab group ───────────────────────────────────────────── */
        .tab-group {
          display: flex;
          background: rgba(0,0,0,0.04);
          padding: 4px;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .tab-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border-radius: 9px;
          transition: all 0.2s ease;
          text-align: center;
          font-family: inherit;
        }

        .tab-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        /* ── Form ────────────────────────────────────────────────── */
        .form-group { margin-bottom: 1.25rem; }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          color: #0f172a;
          outline: none;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input::placeholder { color: #94a3b8; }

        .form-input:focus {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
        }

        /* ── Submit ──────────────────────────────────────────────── */
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          background: #1e293b;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(30,41,59,0.15);
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .submit-btn:hover:not(:disabled) {
          background: #0f172a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(30,41,59,0.25);
        }

        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Forgot / Message ────────────────────────────────────── */
        .forgot-link-container {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .forgot-link {
          font-size: 0.85rem;
          color: #475569;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.2s ease;
          font-family: inherit;
          padding: 0;
        }

        .forgot-link:hover { color: #1d4ed8; text-decoration: underline; }

        .msg {
          margin-top: 8px;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 12px;
          line-height: 1.5;
        }
        .msg.ok  { background: rgba(39,80,10,0.10);  color: #27500A; border: 1px solid rgba(39,80,10,0.18);  }
        .msg.err { background: rgba(121,31,31,0.10); color: #791F1F; border: 1px solid rgba(121,31,31,0.18); }

        /* ── Footer ──────────────────────────────────────────────── */
        .card-footer {
          text-align: center;
          border-top: 1px solid rgba(0,0,0,0.05);
          padding-top: 1.25rem;
        }

        .footer-text {
          font-size: 0.75rem;
          color: #64748b;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div className="scene">
        <div className="glass-card">

          <div className="card-header">
            <div className="brand-title">求职助手</div>
            <h1 className="main-title">{mode === 'login' ? '欢迎回来' : '创建账号'}</h1>
            <div className="subtitle">AI 简历优化 · JD 匹配分析 · 求职追踪</div>
          </div>

          <div className="tab-group">
            <button
              className={`tab-btn${mode === 'login' ? ' active' : ''}`}
              type="button"
              onClick={() => { setMode('login'); setMessage('') }}
            >登录</button>
            <button
              className={`tab-btn${mode === 'signup' ? ' active' : ''}`}
              type="button"
              onClick={() => { setMode('signup'); setMessage('') }}
            >注册</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">{mode === 'login' ? '密码' : '设置密码'}</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? '处理中…' : mode === 'signup' ? '创建账号' : '登录'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="forgot-link-container">
              <button className="forgot-link" type="button" onClick={handleForgotPassword} disabled={loading}>
                忘记密码？
              </button>
            </div>
          )}

          {message && (
            <div className={`msg ${message.includes('成功') ? 'ok' : 'err'}`}>{message}</div>
          )}

          <div className="card-footer">
            <p className="footer-text">© 2026 求职助手 · 数据安全加密存储</p>
          </div>

        </div>
      </div>
    </>
  )
}
