import { noteToPitchClass } from '../../theory'

export type ParsedNote = { pitchClass: number; octave: number }

export function parseNoteWithOctave(note: string): ParsedNote {
  const match = note.trim().match(/^([A-Ga-g])([#♯b♭]?)(-?\d+)$/)
  if (!match) throw new Error(`无法解析音名：${note}`)
  const [, letter, accidental] = match
  const octave = Number(match[3])
  const normalized = `${letter.toUpperCase()}${accidental.replace('♯', '#').replace('♭', 'b')}`
  return { pitchClass: noteToPitchClass(normalized), octave }
}

export type ScheduledNote = {
  note: string
  delayMs: number
  durationSeconds: number
}

export type AudioDemoScheduleInput = {
  mode: 'single' | 'sequential' | 'simultaneous' | 'rhythm'
  notes: string[]
  tempo?: number
  subdivision?: number
}

export function buildAudioSchedule(input: AudioDemoScheduleInput): ScheduledNote[] {
  const { mode, notes, tempo = 60, subdivision = 1 } = input

  if (notes.length === 0) return []

  switch (mode) {
    case 'single':
      return [{ note: notes[0], delayMs: 0, durationSeconds: 0.7 }]

    case 'simultaneous':
      return notes.map((note) => ({ note, delayMs: 0, durationSeconds: 1 }))

    case 'sequential':
      return notes.map((note, index) => ({ note, delayMs: index * 550, durationSeconds: 0.45 }))

    case 'rhythm': {
      if (!Number.isFinite(tempo) || tempo <= 0) throw new Error('Tempo must be a positive number')
      if (!Number.isFinite(subdivision) || subdivision <= 0) throw new Error('Subdivision must be a positive number')
      const intervalMs = 60000 / tempo / subdivision
      return notes.map((note, index) => ({
        note,
        delayMs: index * intervalMs,
        durationSeconds: Math.min(0.1, intervalMs / 1000),
      }))
    }

    default: {
      const _exhaustive: never = mode
      throw new Error(`Unsupported audio mode: ${_exhaustive}`)
    }
  }
}

export function getScheduleEndMs(schedule: ScheduledNote[]): number {
  return schedule.reduce((max, item) => Math.max(max, item.delayMs + item.durationSeconds * 1000), 0)
}
