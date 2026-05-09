import Link from 'next/link'

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f4f0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <nav
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2dfd8',
          padding: '0 40px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: '600' }}>求职助手</span>
        <Link
          href="/login"
          style={{
            padding: '7px 18px',
            background: '#1a1916',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          登录 / 注册
        </Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: '#E1F5EE',
            color: '#085041',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '24px',
          }}
        >
          内测版本 · MVP
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: '600',
            lineHeight: '1.15',
            letterSpacing: '-1px',
            marginBottom: '20px',
            color: '#1a1916',
          }}
        >
          AI 驱动的
          <br />
          个性化求职助手
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#6b6860',
            lineHeight: '1.6',
            marginBottom: '40px',
            maxWidth: '520px',
            margin: '0 auto 40px',
          }}
        >
          上传简历，分析 JD，追踪投递进度。
          <br />
          专为墨尔本求职者设计，帮你从海投到拿到 Offer。
        </p>

        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#1a1916',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '500',
            textDecoration: 'none',
          }}
        >
          免费开始使用 →
        </Link>
      </div>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {[
          { icon: '📄', title: '简历分析', desc: '上传一次，AI 自动提取关键信息，作为所有 JD 分析的基准' },
          { icon: '🎯', title: 'JD 智能匹配', desc: '粘贴任意职位描述，30秒获得四维评分和缺口分析' },
          { icon: '📊', title: '投递看板', desc: '记录所有投递进度，从申请到 Offer 全程追踪' },
        ].map((f) => (
          <div
            key={f.title}
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid #e2dfd8',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '8px' }}>{f.title}</div>
            <div style={{ fontSize: '13px', color: '#888', lineHeight: '1.6' }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
