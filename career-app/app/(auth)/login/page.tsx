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
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .scene{
          min-height:100vh;
          font-family: Inter, -apple-system, "SF Pro Display", "Segoe UI", sans-serif;
          position:relative;
          overflow:hidden;
          padding:26px;
          display:flex;
          align-items:center;
          justify-content:center;
          background: linear-gradient(180deg, #f8eee4 0%, #f6d8b2 58%, #e7a15f 100%);
        }
        .grain{
          position:absolute;
          inset:0;
          pointer-events:none;
          z-index:1;
          opacity:1;
          background:radial-gradient(circle at 36% 34%, rgba(255,245,230,.96) 0%, rgba(255,224,182,.60) 40%, rgba(239,155,78,.52) 72%, rgba(226,129,36,.22) 100%);
          filter:blur(22px);
        }
        .dome,.orb,.stone,.cactus{display:none;}
        .layout{position:relative;z-index:2;width:min(760px, 94vw);}
        .glass{
          background:
            linear-gradient(rgba(255,255,255,.50), rgba(255,250,244,.46)) padding-box,
            linear-gradient(135deg, rgba(255,255,255,.30) 0%, rgba(255,255,255,.10) 48%, rgba(255,255,255,.50) 100%) border-box;
          border:1.2px solid transparent;border-radius:28px;
          backdrop-filter:blur(34px) saturate(140%);-webkit-backdrop-filter:blur(34px) saturate(140%);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.4), inset 0 0 0 1px rgba(255,255,255,.15), 0 22px 44px rgba(63,36,10,.18);
        }
        .account{padding:24px;display:grid;grid-template-columns:1.02fr 1.08fr;min-height:560px;overflow:hidden;}
        .account-left{
          border-radius:20px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;color:#16120c;
          background:
            radial-gradient(circle at 72% 70%, rgba(243,148,66,.55) 0%, rgba(243,148,66,.16) 36%, rgba(255,255,255,.04) 70%),
            linear-gradient(180deg, rgba(255,255,255,.58) 0%, rgba(255,245,233,.54) 100%);
          border:1px solid rgba(255,255,255,.46);
        }
        .brand{font-size:14px;font-weight:600;}
        .account-copy{font-size:40px;font-weight:650;line-height:1.12;letter-spacing:-.02em;}
        .account-copy small{display:block;font-size:20px;font-weight:500;opacity:.78;}
        .account-right{padding:4px 2px 4px 24px;display:flex;flex-direction:column;justify-content:center;}
        .asterisk{font-size:34px;color:#c77a48;line-height:1;margin-bottom:4px;}
        .heading{font-size:44px;font-weight:640;letter-spacing:-.02em;color:#111;margin-bottom:4px;}
        .sub{font-size:13px;color:#645c51;line-height:1.5;margin-bottom:20px;}
        .mode-line{display:flex;gap:12px;margin-bottom:14px;}
        .mode-link{border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:#14110c;opacity:.55;}
        .mode-link.active{opacity:1;text-decoration:underline;}
        .label{display:block;font-size:12px;color:#4f473d;margin-bottom:6px;}
        .input{
          width:100%;height:44px;border-radius:12px;border:1px solid rgba(228,216,200,.9);
          background:#fff;padding:0 14px;font-size:14px;color:#121212;margin-bottom:12px;outline:none;
        }
        .input:focus{border-color:#c78c58;}
        .submit{
          width:100%;margin-top:8px;height:44px;border:none;border-radius:11px;background:#060606;color:#fff;
          font-size:14px;font-weight:620;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.32);
        }
        .submit:disabled{opacity:.45;cursor:not-allowed;}
        .msg{margin-top:10px;padding:10px 12px;border-radius:10px;font-size:12px;line-height:1.5;}
        .msg.ok{background:rgba(34,197,94,.14);color:#166534;border:1px solid rgba(34,197,94,.22);}
        .msg.err{background:rgba(220,38,38,.12);color:#991b1b;border:1px solid rgba(220,38,38,.20);}
        @media (max-width: 980px){
          .layout{width:min(560px, 94vw);}
          .account{grid-template-columns:1fr;min-height:auto;}
          .account-left{min-height:220px;}
          .account-right{padding:16px 0 0;}
        }
      `}</style>

      <div className="scene">
        <div className="dome" />
        <div className="orb" />
        <div className="stone s1" />
        <div className="stone s2" />
        <div className="stone s3" />
        <div className="cactus" />
        <div className="grain" />

        <div className="layout">
          <section className="glass account">
            <div className="account-left">
              <div className="brand">求职助手</div>
              <div className="account-copy"></div>
            </div>
            <div className="account-right">
              <div className="asterisk">*</div>
              <h1 className="heading">{mode === 'login' ? 'Log in' : 'Create an account'}</h1>
              <p className="sub"></p>

              <div className="mode-line">
                <button className={`mode-link${mode === 'login' ? ' active' : ''}`} type="button" onClick={() => setMode('login')}>Log in</button>
                <button className={`mode-link${mode === 'signup' ? ' active' : ''}`} type="button" onClick={() => setMode('signup')}>Sign up</button>
              </div>

              <form onSubmit={handleSubmit}>
                <label className="label">Your email</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <label className="label">{mode === 'login' ? 'Password' : 'Create password'}</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required />

                <button className="submit" type="submit" disabled={loading}>
                  {loading ? 'Processing...' : mode === 'signup' ? 'Create account' : 'Log in'}
                </button>

                {message && (
                  <div className={`msg ${message.includes('成功') ? 'ok' : 'err'}`}>{message}</div>
                )}
              </form>
            </div>
          </section>

          </div>
      </div>
    </>
  )
}
