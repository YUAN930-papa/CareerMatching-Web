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

          /* warm gradient background */
          background:
            radial-gradient(ellipse 80% 60% at 20% 80%, #f0a06a 0%, transparent 55%),
            radial-gradient(ellipse 60% 70% at 80% 20%, #fce8d4 0%, transparent 50%),
            #f2e0cc;
        }

        /* grain overlay on background */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.55;
          pointer-events: none;
          z-index: 0;
        }

        .login-card {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 840px;
          min-height: 540px;

          /* liquid glass effect */
          background: rgba(255, 252, 248, 0.52);
          backdrop-filter: blur(40px) saturate(1.8);
          -webkit-backdrop-filter: blur(40px) saturate(1.8);

          border-radius: 28px;
          overflow: hidden;

          /* layered borders for glass rim effect */
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            inset 0 1.5px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(200,150,100,0.15),
            inset 1px 0 0 rgba(255,255,255,0.8),
            0 32px 80px rgba(160, 80, 20, 0.18),
            0 8px 24px rgba(0,0,0,0.08),
            0 2px 4px rgba(0,0,0,0.04);
        }

        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          min-height: 480px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px 32px;

          background:
            radial-gradient(ellipse 90% 70% at 50% 100%, rgba(180,60,10,0.7) 0%, transparent 60%),
            radial-gradient(ellipse 100% 100% at 50% 50%, #f5a06a 0%, #e8651a 50%, #c8440a 100%);
        }

        /* grain on left panel */
        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          opacity: 0.7;
          pointer-events: none;
          z-index: 1;
          mix-blend-mode: overlay;
        }

        .login-left-orb {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -58%);
          z-index: 0;

          /* layered radial gradients for soft orb with rim light */
          background:
            radial-gradient(circle at 32% 28%, rgba(255,220,180,0.9) 0%, transparent 35%),
            radial-gradient(circle at 65% 70%, rgba(140,30,0,0.5) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, #f08040 0%, #d04a0a 55%, #8b2800 100%);

          box-shadow:
            inset 0 -20px 60px rgba(80,10,0,0.4),
            inset 0 20px 40px rgba(255,200,140,0.3),
            0 20px 80px rgba(180,60,0,0.35);

          filter: blur(0.5px);
        }

        /* grain on orb */
        .login-left-orb::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.15'/%3E%3C/svg%3E");
          background-size: 128px 128px;
          opacity: 0.9;
          mix-blend-mode: soft-light;
        }

        .login-left-text {
          position: relative;
          z-index: 2;
        }

        .login-left-label {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .login-left-headline {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 27px;
          font-weight: 400;
          color: #fff;
          line-height: 1.35;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 12px rgba(0,0,0,0.2);
        }

        .login-right {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;

          /* subtle right panel glass tint */
          background: rgba(255, 253, 250, 0.6);
        }

        .login-eyebrow {
          font-size: 12px;
          color: #e05c1a;
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
          border-radius: 12px;
          padding: 3px;
          margin-bottom: 28px;
          width: fit-content;
          border: 1px solid rgba(200,170,140,0.2);
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
          box-shadow: 0 1px 8px rgba(0,0,0,0.1), 0 0 0 0.5px rgba(200,170,140,0.3);
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
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(200, 170, 140, 0.28);
          border-radius: 12px;
          outline: none;
          color: #1c1610;
          margin-bottom: 18px;
          font-family: inherit;
          transition: all 0.18s;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.04);
        }

        .login-input::placeholder { color: #c0aea0; }

        .login-input:focus {
          border-color: rgba(224, 92, 26, 0.4);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 0 0 3px rgba(224, 92, 26,0.09), inset 0 1px 3px rgba(0,0,0,0.02);
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
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .login-btn:hover:not(:disabled) {
          background: #2e2418;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.22);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .login-msg {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid transparent;
        }

        .login-msg.success {
          background: rgba(16,185,129,0.07);
          color: #065f46;
          border-color: rgba(16,185,129,0.16);
        }

        .login-msg.error {
          background: rgba(224,92,26,0.07);
          color: #9a3412;
          border-color: rgba(224,92,26,0.16);
        }

        @media (max-width: 620px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          <div className="login-left">
            <div className="login-left-orb" />
            <div className="login-left-text">
              <div className="login-left-label">求职助手 · AI Platform</div>
              <div className="login-left-headline">
                用 AI 精准匹配<br />你的下一份工作
              </div>
            </div>
          </div>

          <div className="login-right">
            <div className="login-eyebrow">✦ 欢迎回来</div>
            <div className="login-heading">
              {mode === 'login' ? '登录账号' : '创建账号'}
            </div>
            <div className="login-sub">
              {mode === 'login' ? 'AI 驱动的个性化求职规划平台' : '开始你的 AI 求职之旅'}
            </div>

            <div className="login-tabs">
              <button className={`login-tab${mode === 'login' ? ' active' : ''}`} onClick={() => setMode('login')}>登录</button>
              <button className={`login-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => setMode('signup')}>注册</button>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="login-label">邮箱</label>
              <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />

              <label className="login-label">密码</label>
              <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位" required />

              {message && (
                <div className={`login-msg ${message.includes('成功') ? 'success' : 'error'}`}>{message}</div>
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