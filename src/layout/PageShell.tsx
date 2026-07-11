import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Music2 } from 'lucide-react'

export function PageShell({ eyebrow, title, description, children }: {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <>
      <section className="page-hero">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </section>
      <div className="page-content">{children}</div>
    </>
  )
}

export function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="stat-card">
      <span>{icon}</span>
      <div><b>{value}</b><small>{label}</small></div>
    </div>
  )
}

export function EmptyState({ icon, title, text, action, to }: {
  icon: ReactNode; title: string; text: string; action: string; to: string
}) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to={to} className="button secondary compact">{action}</Link>
    </div>
  )
}

export function NotFound() {
  return (
    <PageShell eyebrow="404" title="这个位置还没有音符" description="页面可能已移动，回到学习路径继续吧。">
      <EmptyState icon={<Music2 />} title="未找到页面" text="你访问的路径不存在。" action="返回首页" to="/" />
    </PageShell>
  )
}
