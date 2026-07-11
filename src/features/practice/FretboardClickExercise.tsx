import { useState } from 'react'
import { ArrowRight, Check, Volume2 } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { Fretboard, playPitch, type FretPosition } from '../../components/Fretboard'
import { noteToPitchClass } from '../../theory'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void; onNext: () => void }

export function FretboardClickExercise({ exercise, onResult, onNext }: Props) {
  const [selected, setSelected] = useState<FretPosition[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ correct: boolean; feedback: string } | null>(null)

  const handleFretClick = (pos: FretPosition) => {
    if (submitted) return
    const key = `${pos.stringIndex}:${pos.fret}`
    setSelected((prev) => {
      if (prev.some((p) => `${p.stringIndex}:${p.fret}` === key)) {
        return prev.filter((p) => `${p.stringIndex}:${p.fret}` !== key)
      }
      return [...prev, pos]
    })
  }

  const submit = () => {
    if (submitted || selected.length === 0) return
    const r = scoreFretboardClickLocal(exercise, selected)
    setResult(r)
    setSubmitted(true)
    onResult(r.correct) // 立即保存
  }

  return (
    <div className="exercise-card">
      <div className="quiz-meta"><span>指板定位 · 点击指板选择目标音</span></div>
      <h3>{exercise.prompt}</h3>
      <div className="fretboard-quiz-hint">
        <button className="button secondary compact" onClick={() => {
          if (exercise.targetNote) playPitch(noteToPitchClass(exercise.targetNote), 3)
        }}>
          <Volume2 size={14} /> 播放目标音
        </button>
        <span>
          {selected.length
            ? `已选：${selected.map((p) => `${p.stringNumber}弦${p.fret}品(${p.note})`).join('、')}`
            : '请在指板上点击音点选择'}
        </span>
      </div>

      <Fretboard
        root={exercise.targetContext ?? 'C'}
        notes={[]}
        onNoteClick={handleFretClick}
      />

      <div className="selection-bar">
        {selected.map((p) => (
          <span key={`${p.stringIndex}:${p.fret}`} className="selected-note-tag" onClick={() => handleFretClick(p)}>
            {p.stringNumber}弦{p.fret}品 ({p.note}) ✕
          </span>
        ))}
      </div>

      {!submitted
        ? (
          <button className="button primary" disabled={selected.length === 0} onClick={submit}>
            提交答案
          </button>
          )
        : (
          <div className={`explanation ${result?.correct ? 'success' : 'error'}`}>
            <b>{result?.correct ? <><Check /> 回答正确！</> : '位置不准确，再试一次。'}</b>
            <p>{result?.feedback}</p>
            <button className="button primary compact" onClick={() => onNext()}>
              下一题 <ArrowRight />
            </button>
          </div>
          )}
    </div>
  )
}

function scoreFretboardClickLocal(exercise: Exercise, selected: FretPosition[]): { correct: boolean; feedback: string } {
  const target = exercise.targetNote ?? ''
  if (!target) return { correct: false, feedback: '题目数据缺少目标音。' }

  const targetPc = (() => { try { return noteToPitchClass(target) } catch { return -1 } })()

  // 必须至少选了一个
  if (selected.length === 0) {
    return { correct: false, feedback: `请点击指板选择 ${target} 音的位置。` }
  }

  // 所有选中的位置都必须是目标 pitch class（不允许混入错误位置）
  const allCorrect = selected.every((p) => p.pitchClass === targetPc)
  if (!allCorrect) {
    const wrong = selected.filter((p) => p.pitchClass !== targetPc)
    return { correct: false, feedback: `${wrong.map((p) => `${p.stringNumber}弦${p.fret}品(${p.note})`).join('、')} 不是 ${target}。${exercise.explanation}` }
  }

  return { correct: true, feedback: '位置正确！' }
}
