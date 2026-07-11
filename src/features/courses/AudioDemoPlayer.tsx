import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { playPitch } from '../../components/Fretboard'
import type { AudioDemo } from '../../data/catalog'
import { parseNoteWithOctave, buildAudioSchedule, getScheduleEndMs } from './audioUtils'

function playNamedNote(note: string, duration = 0.5) {
  const parsed = parseNoteWithOctave(note)
  playPitch(parsed.pitchClass, parsed.octave, duration)
}

type Props = { demo: AudioDemo }

export function AudioDemoPlayer({ demo }: Props) {
  const timeouts = useRef<number[]>([])
  const [playing, setPlaying] = useState(false)

  const clearAllTimeouts = () => {
    timeouts.current.forEach((id) => clearTimeout(id))
    timeouts.current = []
  }

  const stopCurrentDemo = () => {
    clearAllTimeouts()
    setPlaying(false)
  }

  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  const playDemo = () => {
    stopCurrentDemo()
    const notes = demo.notes ?? []
    if (notes.length === 0) return

    const schedule = buildAudioSchedule({
      mode: demo.mode,
      notes,
      tempo: demo.tempo,
      subdivision: demo.subdivision,
    })

    setPlaying(true)

    schedule.forEach((item) => {
      const id = window.setTimeout(() => {
        playNamedNote(item.note, item.durationSeconds)
      }, item.delayMs)
      timeouts.current.push(id)
    })

    // 按计划总时长自动结束播放状态
    const endMs = getScheduleEndMs(schedule)
    if (endMs > 0) {
      const finishId = window.setTimeout(() => setPlaying(false), endMs)
      timeouts.current.push(finishId)
    } else {
      setPlaying(false)
    }
  }

  return (
    <div className="audio-demo-card">
      <button
        className={`button ${playing ? 'secondary' : 'primary'} compact`}
        onClick={playing ? stopCurrentDemo : playDemo}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {' '}{playing ? '停止序列' : demo.title}
      </button>
      {demo.description && <small>{demo.description}</small>}
      {playing && <small className="muted">停止序列会取消尚未播放的音，当前音会自然结束。</small>}
    </div>
  )
}
