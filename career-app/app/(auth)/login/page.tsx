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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        /* override globals.css body flex */
        html, body { display: block !important; margin: 0; padding: 0; background: #eaebee !important; }

        .scene {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          /* half area of cover version: r = 53vmin/√2 ≈ 38vmin */
          background:
            radial-gradient(circle 86vmin at 50% 50%,
              rgba(172,201,238,0.90)  0%,
              rgba(188,213,243,0.58) 38%,
              rgba(210,224,246,0.20) 62%,
              transparent            80%
            ),
            #eaebee;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif;
        }

        /* ── Card: width ×0.8 → 269px, padding ×0.7 (height -30%) ──── */
        .card {
          width: min(269px, 100%);
          background: rgba(210,225,248,0.38);
          backdrop-filter: blur(20px) saturate(130%);
          -webkit-backdrop-filter: blur(20px) saturate(130%);
          border: 1.5px solid rgba(255,255,255,0.76);
          border-radius: 20px;
          padding: 19px 22px 18px;
          box-shadow:
            inset 0 4px 28px 0 rgba(255,255,255,0.50),
            0 4px 8px 1px rgba(0,0,0,0.10);
        }

        /* ── Logo ────────────────────────────────────────────────── */
        .logo {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
        }
        .logo-mark {
          width: 22px; height: 22px;
          border-radius: 6px;
          background: #1a1a18;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-mark svg { display: block; }
        .logo-name {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a18;
          letter-spacing: -0.2px;
        }

        /* ── Heading — fs-h3(17px) from design system ────────────── */
        .heading {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.3px;
          color: #1a1a18;
          margin-bottom: 3px;
          line-height: 1.2;
        }
        .sub {
          font-size: 12px;
          color: #5a5a56;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        /* ── Mode toggle ─────────────────────────────────────────── */
        .mode-line {
          display: flex;
          gap: 2px;
          margin-bottom: 14px;
          background: rgba(255,255,255,0.20);
          border: 1px solid rgba(255,255,255,0.40);
          border-radius: 7px;
          padding: 2px;
        }
        .mode-btn {
          flex: 1;
          border: none;
          background: transparent;
          padding: 5px 0;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(26,26,24,0.65);
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .mode-btn.active {
          background: rgba(255,255,255,0.82);
          color: #1a1a18;
          font-weight: 600;
          box-shadow: 0 1px 2px rgba(100,130,180,0.10);
        }

        /* ── Form fields — fs-body(14px) / fs-caption(11px) ─────── */
        .field { margin-bottom: 10px; }
        .label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: rgba(26,26,24,0.80);
          margin-bottom: 4px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .input {
          width: 100%;
          height: 32px;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,0.70);
          background: rgba(255,255,255,0.75);
          padding: 0 10px;
          font-size: 13px;
          color: #1a1a18;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .input:focus {
          border-color: rgba(255,255,255,0.95);
          background: rgba(255,255,255,0.92);
        }
        .input::placeholder { color: rgba(90,90,86,0.55); }

        /* ── Submit ──────────────────────────────────────────────── */
        .submit {
          width: 100%;
          margin-top: 6px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #1a1a18;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          font-family: inherit;
          letter-spacing: -0.1px;
        }
        .submit:hover:not(:disabled) { opacity: 0.84; }
        .submit:disabled { opacity: 0.38; cursor: not-allowed; }

        /* ── Forgot / Message ────────────────────────────────────── */
        .forgot-row { margin-top: 12px; text-align: center; }
        .forgot-link {
          background: none; border: none;
          color: #5a5a56; cursor: pointer;
          font-size: 12px; padding: 0;
          font-family: inherit;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .forgot-link:hover { color: #1a1a18; }

        .msg {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.55;
        }
        .msg.ok  { background: rgba(39,80,10,0.10);  color: #27500A; border: 1px solid rgba(39,80,10,0.18);  }
        .msg.err { background: rgba(121,31,31,0.10); color: #791F1F; border: 1px solid rgba(121,31,31,0.18); }

        /* ── Footer ──────────────────────────────────────────────── */
        .footer {
          margin-top: 20px;
          font-size: 11px;
          color: rgba(26,26,24,0.38);
          text-align: center;
          letter-spacing: 0.01em;
        }
      `}</style>

      <div className="scene">
        <div className="card">

          {/* Logo */}
          <div className="logo">
            <span className="logo-name">求职助手</span>
          </div>

          {/* Heading */}
          <h1 className="heading">
            {mode === 'login' ? '欢迎回来' : '创建账号'}
          </h1>
          <p className="sub">
            {mode === 'login'
              ? 'AI 简历优化 · JD 匹配分析 · 求职追踪'
              : '开始使用 AI 求职助手，提升投递成功率'}
          </p>

          {/* Mode toggle */}
          <div className="mode-line">
            <button
              className={`mode-btn${mode === 'login' ? ' active' : ''}`}
              type="button"
              onClick={() => { setMode('login'); setMessage('') }}
            >
              登录
            </button>
            <button
              className={`mode-btn${mode === 'signup' ? ' active' : ''}`}
              type="button"
              onClick={() => { setMode('signup'); setMessage('') }}
            >
              注册
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">邮箱</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="label">{mode === 'login' ? '密码' : '设置密码'}</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>

            <button className="submit" type="submit" disabled={loading}>
              {loading ? '处理中…' : mode === 'signup' ? '创建账号' : '登录'}
            </button>

            {mode === 'login' && (
              <div className="forgot-row">
                <button
                  className="forgot-link"
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  忘记密码？
                </button>
              </div>
            )}

            {message && (
              <div className={`msg ${message.includes('成功') ? 'ok' : 'err'}`}>
                {message}
              </div>
            )}
          </form>

          <p className="footer">© 2026 求职助手 · 数据安全加密存储</p>
        </div>
      </div>
    </>
  )
}
