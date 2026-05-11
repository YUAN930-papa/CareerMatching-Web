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

        /* ── PAGE BACKGROUND ── */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          /* warm gradient scene */
          background:
            radial-gradient(ellipse 70% 60% at 15% 85%, rgba(220,100,20,0.55) 0%, transparent 55%),
            radial-gradient(ellipse 55% 55% at 85% 15%, rgba(255,220,170,0.6) 0%, transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 50%, rgba(245,170,90,0.35) 0%, transparent 60%),
            linear-gradient(160deg, #fce8d0 0%, #f5c090 50%, #e89050 100%);
        }

        /* page-level grain */
        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          mix-blend-mode: multiply;
        }

        /* ── LIQUID GLASS CARD ── */
        /* Step 1+2: white 15% base + backdrop blur */
        .login-card {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 820px;
          min-height: 520px;
          border-radius: 28px;
          overflow: hidden;

          /* Step 1: white semi-transparent base */
          background: rgba(255, 255, 255, 0.15);

          /* Step 2: backdrop blur — core soul */
          backdrop-filter: blur(32px) saturate(1.8) brightness(1.08);
          -webkit-backdrop-filter: blur(32px) saturate(1.8) brightness(1.08);

          /* Step 3: inner shadows for glass thickness */
          /* Step 4: gradient stroke via box-shadow outline trick + pseudo */
          box-shadow:
            /* Step 3a: top highlight — light hitting glass edge */
            inset 0 1px 0 rgba(255,255,255,0.40),
            /* Step 3b: structural perimeter */
            inset 0 0 0 1px rgba(255,255,255,0.15),
            /* outer depth */
            0 40px 100px rgba(140,60,10,0.22),
            0 8px 32px rgba(0,0,0,0.08);
        }

        /* Step 4: gradient stroke border via pseudo-element */
        .login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 1.5px;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.50) 0%,
            rgba(255,255,255,0.10) 40%,
            rgba(255,255,255,0.08) 60%,
            rgba(255,255,255,0.45) 100%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 10;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 36px 32px;
          /* soft warm gradient — NOT solid orange */
          background: linear-gradient(160deg,
            rgba(255,220,170,0.55) 0%,
            rgba(240,150,80,0.5) 45%,
            rgba(200,80,20,0.45) 100%
          );
        }

        /* left panel grain — heavy */
        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.75;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E");
          background-size: 150px 150px;
          mix-blend-mode: soft-light;
        }

        /* the blurry, faded orb */
        .orb {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -58%);
          z-index: 0;
          /* very transparent, heavily blurred */
          background: radial-gradient(circle at 36% 32%,
            rgba(255, 235, 195, 0.22) 0%,
            rgba(235, 130, 55, 0.15) 40%,
            rgba(170, 55, 5, 0.10) 65%,
            transparent 78%
          );
          filter: blur(40px);
          opacity: 0.75;
        }

        .login-left-text {
          position: relative;
          z-index: 2;
        }

        .login-left-label {
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .login-left-headline {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px;
          font-weight: 400;
          color: rgba(255,255,255,0.92);
          line-height: 1.4;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 24px rgba(0,0,0,0.12);
        }

        /* ── RIGHT PANEL: also a glass layer ── */
        .login-right {
          flex: 1.15;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 52px 48px;
          /* Step 1+2 applied again for right panel */
          background: rgba(255, 252, 248, 0.22);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-left: 1.5px solid rgba(255,255,255,0.28);
          /* Step 3: inner shadow on right panel */
          box-shadow: inset 1px 0 0 rgba(255,255,255,0.35);
        }

        .login-eyebrow {
          font-size: 12px;
          color: #c04810;
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
          color: #907060;
          margin-bottom: 32px;
          line-height: 1.6;
        }

        /* tabs: also glass */
        .login-tabs {
          display: flex;
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.32);
          border-radius: 12px;
          padding: 3px;
          margin-bottom: 28px;
          width: fit-content;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
        }

        .login-tab {
          padding: 7px 24px;
          font-size: 13px;
          font-weight: 500;
          border-radius: 10px;
          cursor: pointer;
          color: #907060;
          transition: all 0.2s ease;
          border: none;
          background: transparent;
          font-family: inherit;
        }

        .login-tab.active {
          background: rgba(255,255,255,0.75);
          color: #1c1610;
          box-shadow:
            0 1px 8px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }

        .login-label {
          font-size: 12px;
          font-weight: 500;
          color: #8a7060;
          display: block;
          margin-bottom: 7px;
          letter-spacing: 0.03em;
        }

        /* inputs: glass treatment */
        .login-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 14px;
          /* Step 1: white ~15% */
          background: rgba(255, 255, 255, 0.18);
          /* Step 4: gradient border via outline workaround */
          border: 1px solid rgba(255,255,255,0.35);
          border-radius: 12px;
          outline: none;
          color: #1c1610;
          margin-bottom: 18px;
          font-family: inherit;
          transition: all 0.18s;
          /* Step 3: inner shadow */
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.5),
            inset 0 0 0 1px rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .login-input::placeholder { color: rgba(160,130,110,0.7); }

        .login-input:focus {
          border-color: rgba(200,90,20,0.35);
          background: rgba(255,255,255,0.28);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.6),
            0 0 0 3px rgba(200,90,20,0.08);
        }

        /* button: dark solid for contrast */
        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 500;
          background: rgba(28,22,16,0.88);
          color: #fff;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.03em;
          transition: all 0.2s ease;
          margin-top: 4px;
          box-shadow:
            0 4px 20px rgba(0,0,0,0.25),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .login-btn:hover:not(:disabled) {
          background: rgba(28,22,16,0.95);
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.28);
        }

        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .login-msg {
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          border: 1px solid transparent;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .login-msg.success {
          background: rgba(16,185,129,0.12);
          color: #065f46;
          border-color: rgba(16,185,129,0.2);
        }
        .login-msg.error {
          background: rgba(200,80,20,0.1);
          color: #7a2808;
          border-color: rgba(200,80,20,0.2);
        }

        @media (max-width: 620px) {
          .login-left { display: none; }
          .login-right { padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">

          {/* Left panel */}
          <div className="login-left">
            <div className="orb" />
            <div className="login-left-text">
              <div className="login-left-label">求职助手 · AI Platform</div>
              <div className="login-left-headline">用 AI 精准匹配<br />你的下一份工作</div>
            </div>
          </div>

          {/* Right panel */}
          <div className="login-right">
            <div className="login-eyebrow">✦ 欢迎回来</div>
            <div className="login-heading">
              {mode === 'login' ? '登录账号' : '创建账号'}
            </div>
            <div className="login-sub">
              {mode === 'login' ? 'AI 驱动的个性化求职规划平台' : '开始你的 AI 求职之旅'}
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
