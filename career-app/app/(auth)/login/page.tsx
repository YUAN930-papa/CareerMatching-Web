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
      else setMessage('注册成功！请检查邮箱确认链接，然后登录。')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f4f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid #e2dfd8',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            求职助手
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            AI 驱动的个性化求职规划平台
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#666',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #e2dfd8',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#666',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #e2dfd8',
                borderRadius: '8px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {message && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                background: message.includes('成功') ? '#d8f3dc' : '#fee2e2',
                color: message.includes('成功') ? '#085041' : '#991b1b',
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '14px',
              fontWeight: '500',
              background: '#1a1916',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
            }}
          >
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' }}>
          {mode === 'login' ? (
            <>
              还没有账号？
              <span
                style={{ color: '#1a1916', cursor: 'pointer', fontWeight: '500' }}
                onClick={() => setMode('signup')}
              >
                注册
              </span>
            </>
          ) : (
            <>
              已有账号？
              <span
                style={{ color: '#1a1916', cursor: 'pointer', fontWeight: '500' }}
                onClick={() => setMode('login')}
              >
                登录
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

