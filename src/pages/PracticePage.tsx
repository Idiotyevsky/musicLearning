import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Target, TrendingUp } from 'lucide-react'
import { exercises, lessons, modules } from '../data/catalog'
import { useLearning } from '../state/LearningContext'
import { PageShell, StatCard } from '../layout/PageShell'
import InlineQuiz from '../components/InlineQuiz'

function PracticePage() {
  const learning = useLearning()
  const [scope, setScope] = useState<'today' | 'all' | 'mistakes'>('today')
  const [index, setIndex] = useState(0)
  const missedIds = new Set(learning.attempts.filter((a) => !a.correct).map((a) => a.exerciseId))

  const todayReview = useMemo(() => {
    const recentMistakes = exercises.filter((e) => missedIds.has(e.id))
    const lowMasteryLessons = new Set(
      lessons.filter((l) => learning.masteryFor(l.id) < 50).map((l) => l.id),
    )
    const lowMasteryExercises = exercises.filter(
      (e) => lowMasteryLessons.has(e.lessonId) && !missedIds.has(e.id),
    )
    const combined = [...recentMistakes, ...lowMasteryExercises]
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]]
    }
    return combined.slice(0, 8)
  }, [learning.attempts])

  const pool = scope === 'mistakes'
    ? exercises.filter((e) => missedIds.has(e.id))
    : scope === 'today'
      ? (todayReview.length ? todayReview : exercises.slice(0, 8))
      : exercises
  const items = pool.length ? pool : exercises.slice(0, 8)

  return (
    <PageShell eyebrow="专注练习" title="每一道错题，都是下一课的路标" description="答题后在原位置查看推导，不只知道对错。最近 20 次相关练习将形成你的掌握度。">
      <div className="practice-toolbar">
        <div className="segmented">
          <button className={scope === 'today' ? 'active' : ''} onClick={() => { setScope('today'); setIndex(0) }}>今日复习</button>
          <button className={scope === 'all' ? 'active' : ''} onClick={() => { setScope('all'); setIndex(0) }}>知识练习</button>
          <button className={scope === 'mistakes' ? 'active' : ''} onClick={() => { setScope('mistakes'); setIndex(0) }}>错题本 <span>{missedIds.size}</span></button>
        </div>
        <span>{items.length} 道题 · 约 {Math.ceil(items.length / 2)} 分钟</span>
      </div>
      <div className="practice-stage">
        <div className="practice-header">
          <span>{modules.find((m) => m.id === lessons.find((l) => l.id === items[index % items.length].lessonId)?.moduleId)?.title}</span>
          <b>{(index % items.length) + 1} / {items.length}</b>
        </div>
        <InlineQuiz lessonId={items[index % items.length].lessonId} exercises={[items[index % items.length]]} />
        <button className="next-floating" onClick={() => setIndex((i) => (i + 1) % items.length)}><span>→</span></button>
      </div>
      <div className="practice-stats">
        <StatCard icon={<Target />} value={`${learning.attempts.filter((a) => a.correct).length}`} label="累计答对" />
        <StatCard icon={<RotateCcw />} value={`${missedIds.size}`} label="待巩固错题" />
        <StatCard icon={<TrendingUp />} value={`${learning.attempts.length ? Math.round(learning.attempts.filter((a) => a.correct).length / learning.attempts.length * 100) : 0}%`} label="近期正确率" />
      </div>
    </PageShell>
  )
}

export default PracticePage
