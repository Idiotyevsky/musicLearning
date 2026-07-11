import { useState, useMemo } from 'react'
import { RotateCcw, Target, TrendingUp } from 'lucide-react'
import { exercises, lessons, modules, type ExerciseResult } from '../data/catalog'
import { useLearning } from '../state/LearningContext'
import { PageShell, StatCard } from '../layout/PageShell'
import { ExerciseRenderer } from '../features/practice/ExerciseRenderer'

function PracticePage() {
  const learning = useLearning()
  const [scope, setScope] = useState<'today' | 'all' | 'mistakes'>('today')
  const [index, setIndex] = useState(0)
  // 错题：仅取每道题的最新一次结果，只有最新仍错误才算当前错题
  const missedIds = useMemo(() => {
    const latestByExercise = new Map<string, boolean>()
    for (const a of learning.attempts) {
      latestByExercise.set(a.exerciseId, a.correct)
    }
    return new Set(
      [...latestByExercise.entries()].filter(([, correct]) => !correct).map(([id]) => id),
    )
  }, [learning.attempts])

  const todayReview = useMemo(() => {
    // 只从用户真正学习过的课程中选题（已答题 / 已完成 / 已有复习状态）
    const attemptedLessonIds = new Set(learning.attempts.map((a) => a.lessonId))
    const reviewedLessonIds = new Set(Object.keys(learning.reviews))
    const accessibleLessonIds = new Set([
      ...attemptedLessonIds,
      ...learning.completed,
      ...reviewedLessonIds,
    ])
    const dueLessonIds = new Set(learning.getDueReviews())

    // 优先级组：错题 > 到期复习 > 低掌握度（组间不 shuffle）
    const group1 = exercises.filter(
      (e) => missedIds.has(e.id) && accessibleLessonIds.has(e.lessonId),
    )
    const group2 = exercises.filter(
      (e) => dueLessonIds.has(e.lessonId) && !missedIds.has(e.id) && accessibleLessonIds.has(e.lessonId),
    )
    const group3 = exercises.filter(
      (e) => learning.masteryFor(e.lessonId) < 50 && !missedIds.has(e.id) && !dueLessonIds.has(e.lessonId) && accessibleLessonIds.has(e.lessonId),
    )

    // 组内随机，保持优先级顺序
    const shuffle = <T extends unknown>(arr: T[]): T[] => {
      const copy = [...arr]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy
    }
    return [...shuffle(group1), ...shuffle(group2), ...shuffle(group3)].slice(0, 8)
  }, [learning.attempts, learning.completed, learning.reviews])

  const pool = scope === 'mistakes'
    ? exercises.filter((e) => missedIds.has(e.id))
    : scope === 'today'
      ? todayReview
      : exercises
  const items = pool
  const currentExercise = items.length ? exercises.find((e) => e.id === items[index % items.length].id) ?? exercises[0] : null

  const handleResult = (result: ExerciseResult) => {
    learning.recordAttempt({ exerciseId: result.exerciseId, lessonId: result.lessonId, correct: result.correct })
    learning.updateReview(result.lessonId, result.correct)
  }

  return (
    <PageShell eyebrow="专注练习" title="每一道错题，都是下一课的路标" description="答题后在原位置查看推导，不只知道对错。最近 20 次相关练习将形成你的掌握度。">
      <div className="practice-toolbar">
        <div className="segmented">
          <button className={scope === 'today' ? 'active' : ''} onClick={() => { setScope('today'); setIndex(0) }}>今日复习</button>
          <button className={scope === 'all' ? 'active' : ''} onClick={() => { setScope('all'); setIndex(0) }}>知识练习</button>
          <button className={scope === 'mistakes' ? 'active' : ''} onClick={() => { setScope('mistakes'); setIndex(0) }}>错题本 <span>{missedIds.size}</span></button>
        </div>
        <span>{items.length ? `${items.length} 道题 · 约 ${Math.ceil(items.length / 2)} 分钟` : ''}</span>
      </div>
      <div className="practice-stage">
        {currentExercise
          ? (
            <>
              <div className="practice-header">
                <span>{modules.find((m) => m.id === lessons.find((l) => l.id === currentExercise.lessonId)?.moduleId)?.title}</span>
                <b>{(index % (items.length || 1)) + 1} / {items.length || 1}</b>
              </div>
              <ExerciseRenderer
                key={currentExercise.id}
                lessonId={currentExercise.lessonId}
                exercise={currentExercise}
                onResult={handleResult}
                onNext={() => setIndex((i) => (i + 1) % (items.length || 1))}
              />
              <button className="next-floating" onClick={() => setIndex((i) => (i + 1) % (items.length || 1))}>
                <span>→</span>
              </button>
            </>
            )
          : (
            <div className="empty-state">
              <Target />
              <h3>今天暂无到期复习</h3>
              <p>继续学习新课程吧。</p>
            </div>
            )}
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
