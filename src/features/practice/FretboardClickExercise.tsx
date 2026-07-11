import { useState } from 'react'
import { ArrowRight, Check, Volume2 } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { Fretboard, playPitch, type FretPosition } from '../../components/Fretboard'
import { noteToPitchClass } from '../../theory'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void }

export function FretboardClickExercise({ exercise, onResult }: Props) {
  const [selected, setSelected] = useState<FretPosition[]>([])
  const [submitted, setSubmitted] = useState(false)
  const result = submitted ? scoreFretboardClickLocal(exercise, selected) : null

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
          <button className="button primary" disabled={selected.length === 0} onClick={() => setSubmitted(true)}>
            提交答案
          </button>
          )
        : (
          <div className={`explanation ${result?.correct ? 'success' : 'error'}`}>
            <b>{result?.correct ? <><Check /> 回答正确！</> : '位置不准确，再试一次。'}</b>
            <p>{result?.feedback}</p>
            <button className="button primary compact" onClick={() => { setSelected([]); setSubmitted(false); onResult(result?.correct ?? false) }}>
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

  // any_position 模式：至少有一个位置匹配目标 pitch class
  const anyMatch = selected.some((p) => p.pitchClass === targetPc)
  if (anyMatch) {
    return { correct: true, feedback: '位置正确！' }
  }
  return {
    correct: false,
    feedback: `目标音是 ${target}。${exercise.explanation}`,
  }
}
