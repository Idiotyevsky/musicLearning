import { useState } from 'react'
import { ArrowRight, Check, Volume2 } from 'lucide-react'
import type { Exercise } from '../../data/catalog'
import { Fretboard, playPitch } from '../../components/Fretboard'
import { noteToPitchClass } from '../../theory'
import { scoreFretboardClick } from './exerciseScoring'

type Props = { exercise: Exercise; onResult: (correct: boolean) => void }

export function FretboardClickExercise({ exercise, onResult }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const result = submitted ? scoreFretboardClick(exercise, selected) : null

  const handleFretClick = (note: string) => {
    if (submitted) return
    setSelected((prev) => {
      if (prev.includes(note)) return prev.filter((n) => n !== note)
      return [...prev, note]
    })
  }

  return (
    <div className="exercise-card">
      <div className="quiz-meta">
        <span>指板定位 · 点击指板选择目标音</span>
      </div>
      <h3>{exercise.prompt}</h3>
      <div className="fretboard-quiz-hint">
        <button className="button secondary compact" onClick={() => {
          if (exercise.targetNote) playPitch(noteToPitchClass(exercise.targetNote), 3)
        }}>
          <Volume2 size={14} /> 播放目标音
        </button>
        <span>{selected.length ? `已选：${selected.join('、')}` : '请在指板上点击音点选择'}</span>
      </div>

      {/* 简易可点击指板 */}
      <div className="clickable-fretboard" onClick={(e) => {
        const target = (e.target as HTMLElement).closest('[data-fret-note]') as HTMLElement | null
        if (target?.dataset.fretNote) {
          handleFretClick(target.dataset.fretNote)
        }
      }}>
        <Fretboard root={exercise.targetContext ?? 'C'} notes={[]} />
        {/* 透明覆盖层用于捕获点击 */}
        <div className="fret-overlay">
          {[1, 2, 3, 4, 5, 6].map((s) =>
            Array.from({ length: 13 }, (_, f) => {
              const note = getNoteAt(s, f, exercise.targetContext ?? 'C')
              const active = selected.includes(note)
              return (
                <button
                  key={`${s}-${f}`}
                  data-fret-note={note}
                  className={`fret-hit-area ${active ? 'selected' : ''}`}
                  style={{ gridRow: s, gridColumn: f + 1 }}
                  aria-label={`${s}弦 ${f}品 ${note}`}
                />
              )
            }),
          )}
        </div>
      </div>

      <div className="selection-bar">
        {selected.map((n) => (
          <span key={n} className="selected-note-tag" onClick={() => handleFretClick(n)}>
            {n} ✕
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

// 从弦和品计算音名（与 theory 保持一致）
function getNoteAt(string: number, fret: number, context: string): string {
  const OPEN_MIDI = [64, 59, 55, 50, 45, 40]
  const CHROMATIC_SHARPS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  const CHROMATIC_FLATS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
  const preferFlats = context.includes('♭') || ['F', 'D♭', 'E♭', 'G♭', 'A♭', 'B♭'].includes(context)
  const notes = preferFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS
  const pc = (OPEN_MIDI[string - 1] + fret) % 12
  return notes[(pc + 120) % 12]
}
