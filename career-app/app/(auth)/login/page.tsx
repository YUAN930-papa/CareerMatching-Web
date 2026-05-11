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
          padding: 24px;
          font-family: 'DM Sans', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #fce8d8 0%, #f5c9a0 40%, #e8a06a 100%);
        }

        .login-root::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          mix-blend-mode: multiply;
        }

        .login-card {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 820px;
          min-height: 520px;
          border-radius: 28px;
          overflow: hidden;
          background: rgba(255, 248, 240, 0.38);
          backdrop-filter: blur(48px) saturate(1.6) brightness(1.05);
          -webkit-backdrop-filter: blur(48px) saturate(1.6) brightness(1.05);
          border: 1.5px solid rgba(255, 255, 255, 0.75);
          box-shadow:
            inset 0 2px 0 rgba(255,255,255,0.9),
            inset 0 -1px 0 rgba(180,120,60,0.12),
            0 40px 100px rgba(160,70,10,0.2),
            0 8px 32px rgba(0,0,0,0.07);
        }

        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px 32px;
          background: linear-gradient(170deg, #fce0c0 0%, #f5b080 40%, #e87840 100%);
        }

        .login-left::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.85;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.68' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 150px 150px;
          mix-blend-mode: overlay;
        }

        .orb {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -56%);
          z-index: 0;
          background: radial-gradient(circle at 38% 35%,
            rgba(255, 230, 190, 0.28) 0%,
            rgba(230, 130, 60, 0.18) 40%,
            rgba(160, 50, 0, 0.12) 65%,
            transparent 80%
          );
          filter: blur(38px);
          opacity: 0.7;
        }

        .login-left-text {
          position: relative;
          z-index: 2;
        }

        .login-left-label {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .login-left-headline {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: rgba(255,255,255,0.95);
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 20px rgba(0,0,0,0.15);
        }

        .login-right {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;
          background: rgba(255, 252, 248, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-left: 1px solid rgba(255,255,255,0.5);
        }

        .login-eyebrow {
          font-size: 12px;
          color: #d05010;
          font-weight: 500;
          letter-spacing: 0.06em;
          margin-bottom: 10px;
        }

        .login-heading {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 30px;
          font-weight: 400;
          color: #1c1610;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .login-sub {
          font-size: 13px;
          color: #a08870;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .login-tabs {
          display: flex;
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(200,170,140,0.2);
          border-radius: 12px;
          padding: 3px;
          margin-bottom: 28px;
          width: fit-content;
        }

        .login-tab {
          padding: 7px 24px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          color: #a08870;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          font-family: inherit;
        }

        .login-tab.active {
          background: rgba(255,255,255,0.9);
          color: #1c1610;
          box-shadow: 0 1px 8px rgba(0,0,0,0.1);
        }

        .login-label {
          font-size: 12px;
          font-weight: 500;
          color: #8a7060;
          display: block;
          margin-bottom: 7px;
          letter-spacing: 0.03em;
        }

        .login-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(200, 170, 140, 0.3);
          border-radius: 12px;
          outline: none;
          color: #1c1610;
          margin-bottom: 18px;
          font-family: inherit;
          transition: all 0.18s;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
        }

        .login-input::placeholder { color: #c0aea0; }

        .login-input:focus {
          border-color: rgba(200, 90, 20, 0.38);
          background: rgba(255, 255, 255, 0.82);
          box-shadow: 0 0 0 3px rgba(200,90,20,0.08);
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
          letter-spacing: 0.03em;
          transition: all 0.2s ease;
          margin-top: 4px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.22);
        }

        .login-btn:hover:not(:disabled) {
          background: #2e2418;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.24);
        }

        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .login-msg {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid transparent;
        }
        .login-msg.success { background: rgba(16,185,129,0.07); color: #065f46; border-color: rgba(16,185,129,0.16); }
        .login-msg.error { background: rgba(200,80,20,0.07); color: #9a3412; border-color: rgba(200,80,20,0.16); }

        @media (max-width: 620px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <div className="login-left">
            <div className="orb" />
            <div className="login-left-text">
              <div className="login-left-label">求职助手 · AI Platform</div>
              <div className="login-left-headline">用 AI 精准匹配<br />你的下一份工作</div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-eyebrow">✦ 欢迎回来</div>
            <div className="login-heading">{mode === 'login' ? '登录账号' : '创建账号'}</div>
            <div className="login-sub">{mode === 'login' ? 'AI 驱动的个性化求职规划平台' : '开始你的 AI 求职之旅'}</div>

            <div className="login-tabs">
              <button className={`login-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>登录</button>
              <button className={`login-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>注册</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="login-label">邮箱</label>
              <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
              <label className="login-label">密码</label>
              <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位" required />
              {message && <div className={`login-msg ${message.includes('成功') ? 'success' : 'error'}`}>{message}</div>}
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