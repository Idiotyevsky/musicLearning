import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import type { Exercise, ExerciseResult } from '../../data/catalog'
import { FretboardClickExercise } from './FretboardClickExercise'
import { IntervalInputExercise } from './IntervalInputExercise'
import { RomanNumeralInputExercise } from './RomanNumeralInputExercise'

type Props = {
  lessonId: string
  exercise: Exercise
  onResult: (result: ExerciseResult) => void
  onNext: () => void
}

// 单道选择题组件（不使用 InlineQuiz 的内部索引，由页面管理题目切换）
function MCQuestion({ exercise, onResult, onNext }: { exercise: Exercise; onResult: (correct: boolean) => void; onNext: () => void }) {
  const [chosen, setChosen] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = chosen === exercise.answer

  const submit = () => {
    if (chosen === null || submitted) return
    setSubmitted(true)
    onResult(isCorrect)
  }

  return (
    <div className="inline-quiz">
      <div className="quiz-meta"><span>选择题</span></div>
      <h3>{exercise.prompt}</h3>
      <div className="option-grid">
        {exercise.options.map((option, i) => (
          <button
            disabled={submitted}
            onClick={() => setChosen(i)}
            className={`${chosen === i ? 'selected' : ''} ${submitted && i === exercise.answer ? 'correct' : ''} ${submitted && chosen === i && !isCorrect ? 'wrong' : ''}`}
            key={option}
          >
            <span>{String.fromCharCode(65 + i)}</span>{option}
            {submitted && i === exercise.answer && <Check />}
          </button>
        ))}
      </div>
      {submitted
        ? (
          <div className={`explanation ${isCorrect ? 'success' : 'error'}`}>
            <b>{isCorrect ? '回答正确！' : '还差一步。'}</b>
            <p>{exercise.explanation}</p>
            <button className="button primary compact" onClick={onNext}>
              下一题 <ArrowRight />
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

export function ExerciseRenderer({ lessonId, exercise, onResult, onNext }: Props) {
  const handleResult = (correct: boolean) => {
    onResult({ exerciseId: exercise.id, lessonId, correct })
  }

  switch (exercise.type) {
    case 'multiple_choice':
      return <MCQuestion exercise={exercise} onResult={handleResult} onNext={onNext} />

    case 'fretboard_click':
      return <FretboardClickExercise exercise={exercise} onResult={(correct) => { handleResult(correct); onNext() }} />

    case 'interval_input':
      return <IntervalInputExercise exercise={exercise} onResult={(correct) => { handleResult(correct); onNext() }} />

    case 'roman_numeral_input':
      return <RomanNumeralInputExercise exercise={exercise} onResult={(correct) => { handleResult(correct); onNext() }} />

    default:
      return <div className="exercise-card"><p className="muted">此题型暂不支持。</p></div>
  }
}
