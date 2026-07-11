import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { noteToPitchClass } from '../../theory'
import { playPitch } from '../../components/Fretboard'
import type { AudioDemo } from '../../data/catalog'

type ParsedNote = { pitchClass: number; octave: number }

function parseNoteWithOctave(note: string): ParsedNote {
  // match: letter, optional accidental, octave number
  const match = note.trim().match(/^([A-Ga-g])([#♯b♭]?)(-?\d+)$/)
  if (!match) throw new Error(`无法解析音名：${note}`)
  const [, letter, accidental] = match
  const octave = Number(match[3])
  const normalized = `${letter.toUpperCase()}${accidental.replace('♯', '#').replace('♭', 'b')}`
  return { pitchClass: noteToPitchClass(normalized), octave }
}

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

  const playSequential = () => {
    const notes = demo.notes ?? []
    notes.forEach((note, index) => {
      const id = window.setTimeout(() => {
        playNamedNote(note, 0.45)
        if (index === notes.length - 1) setPlaying(false)
      }, index * 550)
      timeouts.current.push(id)
    })
  }

  const playSimultaneous = () => {
    const notes = demo.notes ?? []
    notes.forEach((note) => playNamedNote(note, 1))
    setPlaying(false)
  }

  const playRhythm = () => {
    const tempo = demo.tempo ?? 60
    const subdivision = demo.subdivision ?? 1
    const notes = demo.notes?.length ? demo.notes : ['C4', 'C4', 'C4', 'C4']
    const beatMs = 60000 / tempo
    const stepMs = beatMs / subdivision
    notes.forEach((note, index) => {
      const id = window.setTimeout(() => {
        playNamedNote(note, 0.1)
        if (index === notes.length - 1) setPlaying(false)
      }, index * stepMs)
      timeouts.current.push(id)
    })
  }

  const playDemo = () => {
    stopCurrentDemo()
    setPlaying(true)

    switch (demo.mode) {
      case 'single': {
        const note = demo.notes?.[0]
        if (note) playNamedNote(note, 0.7)
        setPlaying(false)
        break
      }
      case 'sequential':
        playSequential()
        break
      case 'simultaneous':
        playSimultaneous()
        break
      case 'rhythm':
        playRhythm()
        break
    }
  }

  return (
    <div className="audio-demo-card">
      <button
        className={`button ${playing ? 'secondary' : 'primary'} compact`}
        onClick={playing ? stopCurrentDemo : playDemo}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
        {' '}{demo.title}
      </button>
      {demo.description && <small>{demo.description}</small>}
    </div>
  )
}
