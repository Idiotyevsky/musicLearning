import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { playPitch } from '../../components/Fretboard'
import { noteToPitchClass } from '../../theory'
import { scoreIntervalInput } from './exerciseScoring'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void }

export function IntervalInputExercise({ exercise, onResult }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const result = submitted ? scoreIntervalInput(exercise, input) : null

  // 从 prompt 解析起始音和目标音（格式："C 到 E 之间相隔几个半音？"）
  const noteMatch = exercise.prompt.match(/([A-G](?:♯|♭)?)\s*到\s*([A-G](?:♯|♭)?)/)
  const fromNote = noteMatch?.[1]
  const toNote = noteMatch?.[2]

  return (
    <div className="exercise-card">
      <div className="quiz-meta"><span>音程计算 · 输入音程名称</span></div>
      <h3>{exercise.prompt}</h3>

      <div className="interval-demo">
        {fromNote && (
          <button className="button secondary compact" onClick={() => playPitch(noteToPitchClass(fromNote), 3)}>
            播放 {fromNote}
          </button>
        )}
        <span className="arrow">→</span>
        {toNote && (
          <button className="button secondary compact" onClick={() => playPitch(noteToPitchClass(toNote), 3)}>
            播放 {toNote}
          </button>
        )}
      </div>

      <label className="input-label">
        音程名称（如：大三度、纯五度、M3、P5）
        <input
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入音程名称..."
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
            <b>{result?.correct ? <><Check /> 回答正确！</> : '音程名称不准确。'}</b>
            <p>{result?.feedback}</p>
            <button className="button primary compact" onClick={() => { setInput(''); setSubmitted(false); onResult(result?.correct ?? false) }}>
              下一题 <ArrowRight />
            </button>
          </div>
          )}
    </div>
  )
}
