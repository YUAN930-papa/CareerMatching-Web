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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f7ede2;
          font-family: 'DM Sans', -apple-system, sans-serif;
          padding: 24px;
        }

        .login-card {
          display: flex;
          width: 100%;
          max-width: 820px;
          min-height: 540px;
          background: rgba(255, 252, 248, 0.72);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.88);
          border-radius: 28px;
          overflow: hidden;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.9) inset,
            0 24px 64px rgba(180, 100, 40, 0.14),
            0 4px 16px rgba(0,0,0,0.05);
        }

        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          min-height: 480px;
          background: linear-gradient(160deg, #fce8d4 0%, #f5a06a 45%, #e05c1a 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px 32px;
        }

        .login-left-orb {
          position: absolute;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle at 40% 40%, rgba(255,200,150,0.7) 0%, rgba(230,90,30,0.85) 55%, rgba(180,50,10,0.6) 100%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -58%);
          filter: blur(2px);
        }

        .login-left-label {
          position: relative;
          font-size: 12px;
          font-weight: 400;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .login-left-headline {
          position: relative;
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: #fff;
          line-height: 1.3;
          letter-spacing: -0.01em;
        }

        .login-right {
          flex: 1.1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 44px;
        }

        .login-eyebrow {
          font-size: 13px;
          color: #e05c1a;
          font-weight: 500;
          letter-spacing: 0.04em;
          margin-bottom: 10px;
        }

        .login-heading {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 28px;
          font-weight: 400;
          color: #1c1610;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .login-sub {
          font-size: 13px;
          color: #9c8878;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .login-tabs {
          display: flex;
          gap: 0;
          background: rgba(0,0,0,0.04);
          border-radius: 12px;
          padding: 3px;
          margin-bottom: 28px;
          width: fit-content;
        }

        .login-tab {
          padding: 7px 22px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          color: #9c8878;
          transition: all 0.18s ease;
          border: none;
          background: transparent;
          font-family: inherit;
        }

        .login-tab.active {
          background: white;
          color: #1c1610;
          box-shadow: 0 1px 6px rgba(0,0,0,0.1);
        }

        .login-label {
          font-size: 12px;
          font-weight: 500;
          color: #7a6a58;
          display: block;
          margin-bottom: 7px;
          letter-spacing: 0.02em;
        }

        .login-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(200, 170, 140, 0.3);
          border-radius: 12px;
          outline: none;
          color: #1c1610;
          margin-bottom: 18px;
          font-family: inherit;
          transition: border 0.18s, background 0.18s;
        }

        .login-input:focus {
          border-color: rgba(224, 92, 26, 0.45);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 3px rgba(224, 92, 26, 0.08);
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 500;
          background: #1c1610;
          color: #fff;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.02em;
          transition: all 0.18s ease;
          margin-top: 4px;
        }

        .login-btn:hover:not(:disabled) {
          background: #2e2418;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.18);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-msg {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid transparent;
        }

        .login-msg.success {
          background: rgba(16,185,129,0.08);
          color: #065f46;
          border-color: rgba(16,185,129,0.18);
        }

        .login-msg.error {
          background: rgba(224,92,26,0.08);
          color: #9a3412;
          border-color: rgba(224,92,26,0.18);
        }

        @media (max-width: 600px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* Left panel */}
          <div className="login-left">
            <div className="login-left-orb" />
            <div className="login-left-label">求职助手 · AI Platform</div>
            <div className="login-left-headline">
              用 AI 精准匹配<br />你的下一份工作
            </div>
          </div>

          {/* Right panel */}
          <div className="login-right">
            <div className="login-eyebrow">✦ 欢迎回来</div>
            <div className="login-heading">
              {mode === 'login' ? '登录账号' : '创建账号'}
            </div>
            <div className="login-sub">
              {mode === 'login'
                ? 'AI 驱动的个性化求职规划平台'
                : '开始你的 AI 求职之旅'}
            </div>

            <div className="login-tabs">
              <button
                className={`login-tab${mode === 'login' ? ' active' : ''}`}
                onClick={() => setMode('login')}
              >登录</button>
              <button
                className={`login-tab${mode === 'signup' ? ' active' : ''}`}
                onClick={() => setMode('signup')}
              >注册</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="login-label">邮箱</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label className="login-label">密码</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                required
              />

              {message && (
                <div className={`login-msg ${message.includes('成功') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </>
  )
}