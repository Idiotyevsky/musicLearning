import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Attempt = { exerciseId: string; lessonId: string; correct: boolean; at: string }

export type ReviewState = {
  lessonId: string
  lastReviewedAt: string | null
  nextReviewAt: string | null
  correctStreak: number
  incorrectCount: number
  mastery: number
}

type LearningState = {
  completed: string[]; attempts: Attempt[]; bookmarks: string[]; lastLesson: string
  reviews: Record<string, ReviewState>
}

type LearningContextValue = LearningState & {
  completeLesson: (id: string) => void; recordAttempt: (attempt: Omit<Attempt, 'at'>) => void;
  toggleBookmark: (id: string) => void; setLastLesson: (id: string) => void; masteryFor: (lessonId: string) => number;
  getDueReviews: () => string[]; updateReview: (lessonId: string, correct: boolean) => void;
}

const REVIEW_INTERVALS = [1, 3, 7, 14, 30] // 连续正确次数对应的间隔天数

function calcNextReview(correctStreak: number, fromDate: string): string {
  const days = REVIEW_INTERVALS[Math.min(correctStreak, REVIEW_INTERVALS.length - 1)]
  const d = new Date(fromDate)
  d.setDate(d.getDate() + (correctStreak >= 0 ? days : 1))
  return d.toISOString()
}

const initial: LearningState = { completed: [], attempts: [], bookmarks: [], lastLesson: 'sound-basics', reviews: {} }
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
    getDueReviews: () => {
      const now = new Date().toISOString()
      return Object.entries(state.reviews)
        .filter(([, r]) => !r.nextReviewAt || r.nextReviewAt <= now)
        .map(([lessonId]) => lessonId)
    },
    updateReview: (lessonId, correct) => setState((s) => {
      const prev = s.reviews[lessonId] ?? { lessonId, lastReviewedAt: null, nextReviewAt: null, correctStreak: 0, incorrectCount: 0, mastery: 0 }
      const now = new Date().toISOString()
      const streak = correct ? prev.correctStreak + 1 : 0
      return {
        ...s,
        reviews: {
          ...s.reviews,
          [lessonId]: {
            ...prev,
            lastReviewedAt: now,
            nextReviewAt: calcNextReview(correct ? streak - 1 : -1, now),
            correctStreak: streak,
            incorrectCount: prev.incorrectCount + (correct ? 0 : 1),
            mastery: Math.round((prev.mastery * 0.7) + (correct ? 30 : 0)),
          },
        },
      }
    }),
  }), [state])
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>
}

export function useLearning() {
  const context = useContext(LearningContext)
  if (!context) throw new Error('useLearning 必须在 LearningProvider 中使用')
  return context
}
