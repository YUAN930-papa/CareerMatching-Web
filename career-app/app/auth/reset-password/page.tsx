'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * 用户从邮箱里的「重置密码」链接点进来时会带 token（hash 或 code）。
 * Supabase 浏览器客户端会自动解析；此处只需让用户输入新密码并 updateUser。
 *
 * 请在 Supabase 控制台 → Authentication → URL configuration → Redirect URLs 中加入：
 * - http://localhost:3000/auth/reset-password
 * - https://你的生产域名/auth/reset-password
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let done = false
    const finish = () => {
      if (!done) {
        done = true
        setChecking(false)
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoverySession(true)
        finish()
      } else if (session) {
        setHasRecoverySession(true)
        finish()
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasRecoverySession(true)
        finish()
      }
    })

    const t = window.setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) setHasRecoverySession(true)
      finish()
    }, 2500)
    return () => {
      sub.subscription.unsubscribe()
      window.clearTimeout(t)
    }
  }, [supabase])

  useEffect(() => {
    if (checking) return
    if (!hasRecoverySession) {
      setMessage((m) => m || '链接无效或已过期，请回到登录页重新点击「忘记密码」。')
    }
  }, [checking, hasRecoverySession])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage('')
    if (!hasRecoverySession) {
      setMessage('无法重置：请从邮箱里的重置链接打开本页，或重新申请忘记密码。')
      return
    }
    if (password.length < 6) {
      setMessage('密码至少 6 位')
      return
    }
    if (password !== confirm) {
      setMessage('两次输入的密码不一致')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage('密码已更新，请使用新密码登录。')
    setTimeout(() => router.push('/login'), 1500)
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <p style={{ color: '#666' }}>正在验证重置链接…</p>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        background: 'linear-gradient(180deg, #f8eee4 0%, #f6d8b2 58%, #e7a15f 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 28,
          borderRadius: 16,
          background: 'rgba(255,255,255,.88)',
          boxShadow: '0 16px 40px rgba(0,0,0,.12)',
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 8, color: '#111' }}>设置新密码</h1>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>请输入新密码（至少 6 位）</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: 12, color: '#444', marginBottom: 6 }}>新密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 12,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
          />
          <label style={{ display: 'block', fontSize: 12, color: '#444', marginBottom: 6 }}>确认新密码</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: '#060606',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '保存中…' : '保存新密码'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: 14, fontSize: 13, color: message.includes('已更新') ? '#166534' : '#b91c1c' }}>{message}</p>
        )}
        <button
          type="button"
          onClick={() => router.push('/login')}
          style={{ marginTop: 16, background: 'none', border: 'none', color: '#c04810', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}
        >
          返回登录
        </button>
      </div>
    </div>
  )
}
