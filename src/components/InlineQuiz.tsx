import { useState } from 'react'
import { ArrowRight, Check, Volume2 } from 'lucide-react'
import { playPitch } from './Fretboard'
import { noteToPitchClass } from '../theory'
import type { Exercise } from '../data/catalog'

export type ExerciseResult = { exerciseId: string; lessonId: string; correct: boolean }

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  multiple_choice: '选择题', fretboard_click: '指板定位',
  interval_input: '音程计算', roman_numeral_input: '级数分析',
}

function InlineQuiz({ lessonId, exercises: items, onResult }: {
  lessonId: string; exercises: Exercise[]; onResult?: (result: ExerciseResult) => void
}) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const item = items[index]
  if (!item) return null
  const isCorrect = chosen === item.answer
  const submit = () => {
    if (chosen === null || submitted) return
    setSubmitted(true)
    onResult?.({ exerciseId: item.id, lessonId, correct: isCorrect })
  }
  const next = () => { setIndex((index + 1) % items.length); setChosen(null); setSubmitted(false) }

  return (
    <div className="inline-quiz">
      <div className="quiz-meta">
        <span>{EXERCISE_TYPE_LABELS[item.type] ?? '选择题'} · 第 {index + 1}/{items.length} 题</span>
        <div className="quiz-dots">{items.map((_, i) => <i className={i <= index ? 'active' : ''} key={i} />)}</div>
      </div>
      <h3>{item.prompt}</h3>
      {item.type === 'fretboard_click' && item.targetNote && (
        <div className="fretboard-quiz-hint">
          <button className="button secondary compact" onClick={() => playPitch(noteToPitchClass(item.targetNote!), 3)}>
            <Volume2 size={14} /> 播放目标音
          </button>
          <span>请在下方指板中找到 {item.targetNote} 的位置。不要求精确位置，任一同音位置均可。</span>
        </div>
      )}
      <div className="option-grid">
        {item.options.map((option, i) => (
          <button
            disabled={submitted}
            onClick={() => setChosen(i)}
            className={`${chosen === i ? 'selected' : ''} ${submitted && i === item.answer ? 'correct' : ''} ${submitted && chosen === i && !isCorrect ? 'wrong' : ''}`}
            key={option}
          >
            <span>{String.fromCharCode(65 + i)}</span>{option}
            {submitted && i === item.answer && <Check />}
          </button>
        ))}
      </div>
      {submitted
        ? (
          <div className={`explanation ${isCorrect ? 'success' : 'error'}`}>
            <b>{isCorrect ? '回答正确，规律已经接上了。' : '还差一步，按公式重新推导。'}</b>
            <p>{item.explanation}</p>
            <button className="button primary compact" onClick={next}>
              {index === items.length - 1 ? '再练一轮' : '下一题'} <ArrowRight />
            </button>
          </div>
          )
        : (
          <button className="button primary" disabled={chosen === null} onClick={submit}>
            提交答案
          </button>
          )}
    </div>
  )
}

export default InlineQuiz
