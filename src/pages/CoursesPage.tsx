import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, LockKeyhole, Play, Target } from 'lucide-react'
import { lessons, modules } from '../data/catalog'
import { useLearning } from '../state/LearningContext'
import { PageShell } from '../layout/PageShell'

function CoursesPage() {
  const learning = useLearning()
  const [active, setActive] = useState(modules[0].id)
  const module = modules.find((m) => m.id === active)!
  const items = lessons.filter((l) => l.moduleId === active)
  const done = learning.completed.filter((id) => items.some((l) => l.id === id)).length
  return (
    <PageShell eyebrow="系统课程" title="从声音出发，逐步看懂整张指板" description="课程不是知识点清单。每一课都从一个真实问题开始，经过声音、公式、指板和练习，再连到下一步。">
      <div className="course-layout">
        <aside className="module-list">
          <div className="aside-label">学习路线 · 基础乐理</div>
          {modules.map((m) => (
            <button key={m.id} onClick={() => setActive(m.id)} className={active === m.id ? 'active' : ''}>
              <span className="module-index">{String(m.index).padStart(2, '0')}</span>
              <span><b>{m.title}</b><small>{lessons.filter((l) => l.moduleId === m.id).length} 节微课程</small></span>
              {active === m.id && <ChevronRight />}
            </button>
          ))}
        </aside>
        <section className="lesson-list">
          <div className="module-hero" style={{ '--module-color': module.color } as React.CSSProperties}>
            <div><span>模块 {module.index}</span><h2>{module.title}</h2><p>{module.subtitle}</p></div>
            <div className="module-score"><b>{done}/{items.length}</b><span>本模块完成</span></div>
          </div>
          {items.map((lesson, i) => {
            const complete = learning.completed.includes(lesson.id)
            const current = learning.lastLesson === lesson.id
            const accessible = !lesson.prerequisite || learning.completed.includes(lesson.prerequisite)
            return (
              <Link
                key={lesson.id}
                to={accessible ? `/courses/${lesson.slug}` : '#'}
                className={`lesson-row ${current ? 'current' : ''} ${!accessible ? 'locked' : ''}`}
                onClick={(e) => { if (!accessible) e.preventDefault() }}
              >
                <span className={`lesson-status ${complete ? 'done' : current ? 'doing' : ''}`}>
                  {!accessible ? <LockKeyhole /> : complete ? <Check /> : current ? <Play /> : i + 1}
                </span>
                <span className="lesson-main"><small>{lesson.minutes} 分钟 · 微课程</small><b>{lesson.title}</b><em>{lesson.summary}</em></span>
                <span className="lesson-mastery"><small>掌握度</small><b>{learning.masteryFor(lesson.id)}%</b></span>
                {accessible && <ChevronRight />}
              </Link>
            )
          })}
        </section>
        <aside className="course-side">
          <div className="side-card">
            <span className="overline">本周学习</span>
            <div className="big-stat">{learning.completed.length}<small>节已完成</small></div>
            <div className="mini-bars">{(() => { const today = new Date(); const bars: number[] = []; for (let d = 6; d >= 0; d--) { const date = new Date(today); date.setDate(date.getDate() - d); const key = date.toISOString().slice(0, 10); const count = learning.attempts.filter((a) => a.at.startsWith(key)).length; bars.push(Math.min(100, count * 16 + 12)) } return bars.map((h, i) => <i key={i} style={{ height: `${h}%` }} />) })()}</div>
            <Link to="/learning">查看掌握情况 <ArrowRight /></Link>
          </div>
          <div className="side-card warm">
            <Target /><h3>别只看完课程</h3>
            <p>掌握度来自练习表现。完成课程后，立刻用 3–4 道题验证。</p>
            <Link to="/practice">去练习</Link>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

export default CoursesPage
