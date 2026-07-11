import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { scoreRomanNumeral } from './exerciseScoring'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void; onNext: () => void }

export function RomanNumeralInputExercise({ exercise, onResult, onNext }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null)

  const submit = () => {
    if (submitted || !input.trim()) return
    const r = scoreRomanNumeral(exercise, input)
    setResult(r)
    setSubmitted(true)
    onResult(r.correct) // 立即保存，不是等到下一题
  }

  const next = () => {
    onNext()
  }

  return (
    <div className="exercise-card" data-testid="exercise-question">
      <div className="quiz-meta"><span>级数分析 · 输入罗马数字</span></div>
      <h3>{exercise.prompt}</h3>

      <label className="input-label">
        罗马数字级数（如：I、vi、V7、vii°）
        <input
          className="text-input"
          data-testid="roman-answer-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入罗马数字..."
          disabled={submitted}
          onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) submit() }}
        />
      </label>

      {!submitted
        ? (
          <button className="button primary" disabled={!input.trim()} onClick={submit}>
            提交答案
          </button>
          )
        : (
          <div className={`explanation ${result?.correct ? 'success' : 'error'}`} data-testid="exercise-feedback">
            <b>{result?.correct ? <><Check /> 回答正确！</> : '级数不准确。'}</b>
            <p>{result?.feedback}</p>
            <button className="button primary compact" onClick={next}>
              下一题 <ArrowRight />
            </button>
          </div>
          )}
    </div>
  )
}
