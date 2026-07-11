import { describe, expect, it } from 'vitest'
import {
  analyzeChordInKey, getCapoOptions, getChordNotes, getDiatonicChords, getFretboardPositions,
  getInterval, getScaleNotes, midiToNote, noteToMidi, transposeChord,
} from '../src/theory'

describe('确定性乐理规则引擎', () => {
  it('按调性正确拼写大调音阶', () => {
    expect(getScaleNotes('C', 'major')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(getScaleNotes('F', 'major')).toEqual(['F', 'G', 'A', 'B♭', 'C', 'D', 'E'])
    expect(getScaleNotes('E♭', 'major')).toEqual(['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'])
  })
  it('生成常见和弦并保留正确音名字母', () => {
    expect(getChordNotes('Cmaj7')).toEqual(['C', 'E', 'G', 'B'])
    expect(getChordNotes('B♭m')).toEqual(['B♭', 'D♭', 'F'])
    expect(getChordNotes('F♯dim')).toEqual(['F♯', 'A', 'C'])
  })
  it('计算音程、MIDI 与移调', () => {
    expect(getInterval('C', 'E')).toEqual({ semitones: 4, name: '大三度' })
    expect(noteToMidi('A4')).toBe(69)
    expect(midiToNote(60)).toBe('C4')
    expect(transposeChord('C#m7', 2)).toBe('D♯m7')
  })
  it('生成调内和弦并判断和声功能', () => {
    expect(getDiatonicChords('G').map((c) => c.symbol)).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F♯dim'])
    expect(analyzeChordInKey('Em', 'G')).toMatchObject({ degree: 'vi', diatonic: true, function: '主功能' })
    expect(analyzeChordInKey('B♭', 'C').diatonic).toBe(false)
  })
  it('映射指板并给出变调夹方案', () => {
    expect(getFretboardPositions(12).filter((p) => p.string === 6 && p.note === 'E').map((p) => p.fret)).toEqual([0, 12])
    expect(getCapoOptions('D')[0]).toEqual({ shape: 'D', fret: 0 })
  })
})
