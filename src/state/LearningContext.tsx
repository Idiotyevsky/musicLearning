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

function reviewDelayDays(correct: boolean, streak: number): number {
  if (!correct) return 1       // 答错：1 天后复习
  if (streak === 1) return 3   // 首次答对：3 天后
  if (streak === 2) return 7   // 连续 2 次答对：7 天后
  if (streak === 3) return 14  // 连续 3 次答对：14 天后
  return 30                     // 连续 4 次以上：30 天后
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
      const d = new Date(now)
      d.setDate(d.getDate() + reviewDelayDays(correct, streak))
      return {
        ...s,
        reviews: {
          ...s.reviews,
          [lessonId]: {
            ...prev,
            lastReviewedAt: now,
            nextReviewAt: d.toISOString(),
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
