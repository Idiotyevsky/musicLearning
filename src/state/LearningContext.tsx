import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Attempt = { exerciseId: string; lessonId: string; correct: boolean; at: string }
type LearningState = { completed: string[]; attempts: Attempt[]; bookmarks: string[]; lastLesson: string }
type LearningContextValue = LearningState & {
  completeLesson: (id: string) => void; recordAttempt: (attempt: Omit<Attempt, 'at'>) => void;
  toggleBookmark: (id: string) => void; setLastLesson: (id: string) => void; masteryFor: (lessonId: string) => number;
}

const initial: LearningState = { completed: [], attempts: [], bookmarks: [], lastLesson: 'sound-basics' }
const LearningContext = createContext<LearningContextValue | null>(null)

export function LearningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningState>(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem('string-theory-learning') ?? '{}') } }
    catch { return initial }
  })
  useEffect(() => localStorage.setItem('string-theory-learning', JSON.stringify(state)), [state])

  const value = useMemo<LearningContextValue>(() => ({
    ...state,
    completeLesson: (id) => setState((s) => ({ ...s, completed: [...new Set([...s.completed, id])] })),
    recordAttempt: (attempt) => setState((s) => ({ ...s, attempts: [...s.attempts.slice(-199), { ...attempt, at: new Date().toISOString() }] })),
    toggleBookmark: (id) => setState((s) => ({ ...s, bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((v) => v !== id) : [...s.bookmarks, id] })),
    setLastLesson: (lastLesson) => setState((s) => ({ ...s, lastLesson })),
    masteryFor: (lessonId) => {
      const attempts = state.attempts.filter((a) => a.lessonId === lessonId).slice(-20)
      if (!attempts.length) return state.completed.includes(lessonId) ? 20 : 0
      const weighted = attempts.reduce((sum, item, i) => sum + (item.correct ? i + 1 : 0), 0)
      const total = attempts.reduce((sum, _, i) => sum + i + 1, 0)
      return Math.round((weighted / total) * 100)
    },
  }), [state])
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) throw new Error('useLearning 必须在 LearningProvider 中使用')
  return context
}
