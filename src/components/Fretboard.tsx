import { useMemo, useState } from 'react'
import { getFretboardPositions, noteToPitchClass, type ScaleType, getScaleNotes } from '../theory'

export type FretPosition = { stringIndex: number; stringNumber: number; fret: number; note: string; pitchClass: number }

type Props = {
  root?: string; notes?: string[]; scaleType?: ScaleType; compact?: boolean
  onNoteClick?: (position: FretPosition) => void
}

const degreeLabels = ['1', '♭2', '2', '♭3', '3', '4', '♭5', '5', '♭6', '6', '♭7', '7']

export function Fretboard({ root = 'C', notes, scaleType = 'major', compact = false, onNoteClick }: Props) {
  const [mode, setMode] = useState<'note' | 'degree' | 'interval'>('note')
  const activeNotes = notes ?? getScaleNotes(root, scaleType)
  const activePcs = activeNotes.map(noteToPitchClass)
  const rootPc = noteToPitchClass(root)
  const frets = compact ? 12 : 15
  const positions = useMemo(() => getFretboardPositions(frets, root), [frets, root])
  const labels = Array.from({ length: frets + 1 }, (_, i) => i)

  function nodeLabel(note: string, pc: number) {
    if (mode === 'note') return note
    const interval = (pc - rootPc + 12) % 12
    return mode === 'degree' ? degreeLabels[interval] : `${interval}`
  }

  return <div className="fretboard-shell">
    <div className="segmented small" aria-label="指板标签模式">
      <button className={mode === 'note' ? 'active' : ''} onClick={() => setMode('note')}>音名</button>
      <button className={mode === 'degree' ? 'active' : ''} onClick={() => setMode('degree')}>级数</button>
      <button className={mode === 'interval' ? 'active' : ''} onClick={() => setMode('interval')}>半音</button>
    </div>
    <div className="fret-scroll">
      <div className="fretboard" style={{ '--frets': frets + 1 } as React.CSSProperties}>
        <div className="fret-labels">{labels.map((f) => <span key={f}>{f}</span>)}</div>
        {[1, 2, 3, 4, 5, 6].map((string) => <div className="string" key={string}>
          {positions.filter((p) => p.string === string).map((p) => {
            const active = activePcs.includes(p.pitchClass)
            const isRoot = p.pitchClass === rootPc
            return <button
              key={p.fret} className={`fret ${active ? 'is-active' : ''} ${isRoot && active ? 'is-root' : ''}`}
              aria-label={`${string}弦 ${p.fret}品 ${p.note}`}
              title={`${string}弦 ${p.fret}品 · ${p.note}`}
              onClick={() => { playPitch(p.pitchClass, 3 + Math.floor((6 - string) / 2)); onNoteClick?.({ stringIndex: string - 1, stringNumber: string, fret: p.fret, note: p.note, pitchClass: p.pitchClass }) }}
            >{active ? nodeLabel(p.note, p.pitchClass) : ''}</button>
          })}
        </div>)}
      </div>
    </div>
    <div className="legend"><span><i className="dot root" />根音</span><span><i className="dot tone" />音阶 / 和弦音</span><span className="muted">点击音点试听</span></div>
  </div>
}

export function playPitch(pc: number, octave = 4, duration = .7) {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const ctx = new AudioContextClass()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const midi = (octave + 1) * 12 + pc
  osc.frequency.value = 440 * 2 ** ((midi - 69) / 12)
  osc.type = 'triangle'
  gain.gain.setValueAtTime(0.0001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + .02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(); osc.stop(ctx.currentTime + duration + .02)
  osc.onended = () => ctx.close()
}
