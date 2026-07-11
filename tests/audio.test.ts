import { describe, expect, it } from 'vitest'
import { parseNoteWithOctave, buildAudioSchedule } from '../src/features/courses/audioUtils'

describe('parseNoteWithOctave', () => {
  it('解析自然音和八度', () => {
    expect(parseNoteWithOctave('C3')).toEqual({ pitchClass: 0, octave: 3 })
    expect(parseNoteWithOctave('C4')).toEqual({ pitchClass: 0, octave: 4 })
    expect(parseNoteWithOctave('C5')).toEqual({ pitchClass: 0, octave: 5 })
  })

  it('C3 与 C4 解析结果不同', () => {
    const c3 = parseNoteWithOctave('C3')
    const c4 = parseNoteWithOctave('C4')
    expect(c3.octave).not.toBe(c4.octave)
    expect(c3.pitchClass).toBe(c4.pitchClass)
  })

  it('解析升号', () => {
    expect(parseNoteWithOctave('F#4')).toEqual({ pitchClass: 6, octave: 4 })
    expect(parseNoteWithOctave('F♯4')).toEqual({ pitchClass: 6, octave: 4 })
  })

  it('解析降号', () => {
    expect(parseNoteWithOctave('Bb3')).toEqual({ pitchClass: 10, octave: 3 })
    expect(parseNoteWithOctave('B♭3')).toEqual({ pitchClass: 10, octave: 3 })
  })

  it('拒绝无效音名', () => {
    expect(() => parseNoteWithOctave('C')).toThrow()
    expect(() => parseNoteWithOctave('hello')).toThrow()
    expect(() => parseNoteWithOctave('H4')).toThrow()
  })
})

describe('buildAudioSchedule', () => {
  it('single 只播放第一个音', () => {
    expect(buildAudioSchedule({ mode: 'single', notes: ['C4', 'E4'] })).toEqual([
      { note: 'C4', delayMs: 0, durationSeconds: 0.7 },
    ])
  })

  it('simultaneous 所有音延迟均为 0', () => {
    const s = buildAudioSchedule({ mode: 'simultaneous', notes: ['C4', 'E4', 'G4'] })
    expect(s.map((i) => i.delayMs)).toEqual([0, 0, 0])
    expect(s.length).toBe(3)
  })

  it('sequential 依次延迟', () => {
    const s = buildAudioSchedule({ mode: 'sequential', notes: ['C4', 'D4', 'E4'] })
    expect(s.map((i) => i.delayMs)).toEqual([0, 550, 1100])
  })

  it('60 BPM 四分音符间隔 1000ms', () => {
    const s = buildAudioSchedule({ mode: 'rhythm', notes: ['C4', 'C4', 'C4', 'C4'], tempo: 60, subdivision: 1 })
    expect(s.map((i) => i.delayMs)).toEqual([0, 1000, 2000, 3000])
  })

  it('120 BPM 四分音符间隔 500ms', () => {
    const s = buildAudioSchedule({ mode: 'rhythm', notes: ['C4', 'C4', 'C4'], tempo: 120, subdivision: 1 })
    expect(s.map((i) => i.delayMs)).toEqual([0, 500, 1000])
  })

  it('60 BPM 八分音符间隔 500ms', () => {
    const s = buildAudioSchedule({ mode: 'rhythm', notes: ['C4', 'C4', 'C4'], tempo: 60, subdivision: 2 })
    expect(s.map((i) => i.delayMs)).toEqual([0, 500, 1000])
  })

  it('拒绝非法 tempo', () => {
    expect(() => buildAudioSchedule({ mode: 'rhythm', notes: ['C4'], tempo: 0 })).toThrow()
    expect(() => buildAudioSchedule({ mode: 'rhythm', notes: ['C4'], tempo: -1 })).toThrow()
  })

  it('拒绝非法 subdivision', () => {
    expect(() => buildAudioSchedule({ mode: 'rhythm', notes: ['C4'], subdivision: 0 })).toThrow()
  })

  it('空 notes 返回空数组', () => {
    expect(buildAudioSchedule({ mode: 'single', notes: [] })).toEqual([])
    expect(buildAudioSchedule({ mode: 'rhythm', notes: [] })).toEqual([])
  })
})
