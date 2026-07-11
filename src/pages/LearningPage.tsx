import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Bookmark, Check, RotateCcw, Target, X } from 'lucide-react'
import { lessons, modules } from '../data/catalog'
import { useLearning } from '../state/LearningContext'
import { PageShell, StatCard, EmptyState } from '../layout/PageShell'

function LearningPage() {
  const learning = useLearning()
  const accuracy = learning.attempts.length
    ? Math.round(learning.attempts.filter((a) => a.correct).length / learning.attempts.length * 100)
    : 0
  const recent = [...learning.attempts].reverse().slice(0, 5)
  return (
    <PageShell eyebrow="我的学习" title="关注真实掌握，而不是只看打卡" description="课程完成、近期练习和错题共同组成学习概览。数据仅保存在当前浏览器。">
      <div className="dashboard-grid">
        <section className="dashboard-main">
          <div className="stat-grid">
            <StatCard icon={<BookOpen />} value={`${learning.completed.length}/${lessons.length}`} label="课程完成" />
            <StatCard icon={<Target />} value={`${accuracy}%`} label="练习正确率" />
            <StatCard icon={<RotateCcw />} value={`${new Set(learning.attempts.filter((a) => !a.correct).map((a) => a.exerciseId)).size}`} label="待复习" />
            <StatCard icon={<Bookmark />} value={`${learning.bookmarks.length}`} label="已收藏" />
          </div>
          <div className="panel">
            <div className="panel-title"><div><span className="overline">能力地图</span><h2>五个基础模块</h2></div></div>
            <div className="mastery-list">
              {modules.map((m) => {
                const ls = lessons.filter((l) => l.moduleId === m.id)
                const value = Math.round(ls.reduce((s, l) => s + learning.masteryFor(l.id), 0) / ls.length)
                return (
                  <div key={m.id}>
                    <span>{m.title}</span>
                    <div><i style={{ width: `${value}%`, background: m.color }} /></div>
                    <b>{value}%</b>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title"><div><span className="overline">最近练习</span><h2>答题记录</h2></div><Link to="/practice">继续练习 <ArrowRight /></Link></div>
            {recent.length
              ? (
                <div className="attempt-list">
                  {recent.map((a, i) => (
                    <div key={`${a.at}-${i}`}>
                      <span className={a.correct ? 'attempt-ok' : 'attempt-bad'}>{a.correct ? <Check /> : <X />}</span>
                      <div><b>{lessons.find((l) => l.id === a.lessonId)?.title}</b><small>{new Date(a.at).toLocaleString('zh-CN')}</small></div>
                      <Link to={`/courses/${lessons.find((l) => l.id === a.lessonId)?.slug}`}>复习课程</Link>
                    </div>
                  ))}
                </div>
                )
              : <EmptyState icon={<Target />} title="还没有答题记录" text="完成第一组练习后，这里会展示你的真实掌握变化。" action="开始练习" to="/practice" />}
          </div>
        </section>
        <aside className="dashboard-side">
          <div className="side-card warm">
            <span className="overline">下一步</span>
            <h3>{lessons.find((l) => l.id === learning.lastLesson)?.title}</h3>
            <p>{lessons.find((l) => l.id === learning.lastLesson)?.summary}</p>
            <Link className="button primary compact" to={`/courses/${lessons.find((l) => l.id === learning.lastLesson)?.slug}`}>继续学习 <ArrowRight /></Link>
          </div>
          <div className="side-card">
            <span className="overline">本地数据说明</span>
            <p>游客进度保存在 LocalStorage。清除浏览器数据会同步清除学习记录。</p>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

export default LearningPage
