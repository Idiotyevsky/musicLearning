import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { scoreRomanNumeral } from './exerciseScoring'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void }

export function RomanNumeralInputExercise({ exercise, onResult }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const result = submitted ? scoreRomanNumeral(exercise, input) : null

  return (
    <div className="exercise-card">
      <div className="quiz-meta"><span>级数分析 · 输入罗马数字</span></div>
      <h3>{exercise.prompt}</h3>

      <label className="input-label">
        罗马数字级数（如：I、vi、V7、vii°）
        <input
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入罗马数字..."
          disabled={submitted}
          onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) setSubmitted(true) }}
        />
      </label>

      {!submitted
        ? (
          <button className="button primary" disabled={!input.trim()} onClick={() => setSubmitted(true)}>
            提交答案
          </button>
          )
        : (
          <div className={`explanation ${result?.correct ? 'success' : 'error'}`}>
            <b>{result?.correct ? <><Check /> 回答正确！</> : '级数不准确。'}</b>
            <p>{result?.feedback}</p>
            <button className="button primary compact" onClick={() => { setInput(''); setSubmitted(false); onResult(result?.correct ?? false) }}>
              下一题 <ArrowRight />
            </button>
          </div>
          )}
    </div>
  )
}
