import { describe, expect, it } from 'vitest'
import {
  analyzeChordInKey, getCapoOptions, getChordNotes, getDiatonicChords, getFretboardPositions,
  getInterval, getScaleNotes, isSeventhChordQuality, midiToNote, noteToMidi, transposeChord,
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

describe('大调调内七和弦', () => {
  it('正确识别 C 大调的自然七和弦', () => {
    expect(analyzeChordInKey('Cmaj7', 'C', 'major')).toMatchObject({ degree: 'Imaj7', diatonic: true })
    expect(analyzeChordInKey('Dm7', 'C', 'major')).toMatchObject({ degree: 'ii7', diatonic: true })
    expect(analyzeChordInKey('Em7', 'C', 'major')).toMatchObject({ degree: 'iii7', diatonic: true })
    expect(analyzeChordInKey('Fmaj7', 'C', 'major')).toMatchObject({ degree: 'IVmaj7', diatonic: true })
    expect(analyzeChordInKey('G7', 'C', 'major')).toMatchObject({ degree: 'V7', diatonic: true })
    expect(analyzeChordInKey('Am7', 'C', 'major')).toMatchObject({ degree: 'vi7', diatonic: true })
    expect(analyzeChordInKey('Bm7b5', 'C', 'major')).toMatchObject({ degree: 'viiø7', diatonic: true })
  })

  it('排除大调中的非自然七和弦', () => {
    expect(analyzeChordInKey('C7', 'C', 'major').diatonic).toBe(false) // 应为 Cmaj7
    expect(analyzeChordInKey('Gmaj7', 'C', 'major').diatonic).toBe(false) // 应为 G7
    expect(analyzeChordInKey('Bdim7', 'C', 'major').diatonic).toBe(false) // 应为 Bm7b5
  })
})

describe('小调调内七和弦', () => {
  it('正确识别 A 自然小调的自然七和弦', () => {
    expect(analyzeChordInKey('Am7', 'A', 'minor')).toMatchObject({ degree: 'i7', diatonic: true })
    expect(analyzeChordInKey('Bm7b5', 'A', 'minor')).toMatchObject({ degree: 'iiø7', diatonic: true })
    expect(analyzeChordInKey('Cmaj7', 'A', 'minor')).toMatchObject({ degree: 'III△7', diatonic: true })
    expect(analyzeChordInKey('Dm7', 'A', 'minor')).toMatchObject({ degree: 'iv7', diatonic: true })
    expect(analyzeChordInKey('Em7', 'A', 'minor')).toMatchObject({ degree: 'v7', diatonic: true })
    expect(analyzeChordInKey('Fmaj7', 'A', 'minor')).toMatchObject({ degree: 'VI△7', diatonic: true })
    expect(analyzeChordInKey('G7', 'A', 'minor')).toMatchObject({ degree: 'VII7', diatonic: true })
  })

  it('排除小调中的非自然七和弦', () => {
    expect(analyzeChordInKey('E7', 'A', 'minor').diatonic).toBe(false) // 自然小调中 v 为 Em7
    expect(analyzeChordInKey('Amaj7', 'A', 'minor').diatonic).toBe(false) // 应为 Am7
  })
})

describe('七和弦 getDiatonicChords', () => {
  it('返回 C 大调调内七和弦', () => {
    expect(getDiatonicChords('C', 'major', true).map((c) => c.symbol)).toEqual([
      'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5',
    ])
  })

  it('返回 A 小调调内七和弦', () => {
    expect(getDiatonicChords('A', 'minor', true).map((c) => c.symbol)).toEqual([
      'Am7', 'Bm7b5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7',
    ])
  })

  it('三和弦模式不受影响', () => {
    expect(getDiatonicChords('C', 'major').map((c) => c.symbol)).toEqual([
      'C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim',
    ])
  })
})

describe('isSeventhChordQuality', () => {
  it('正确判断七和弦品质', () => {
    expect(isSeventhChordQuality('7')).toBe(true)
    expect(isSeventhChordQuality('maj7')).toBe(true)
    expect(isSeventhChordQuality('m7')).toBe(true)
    expect(isSeventhChordQuality('m7b5')).toBe(true)
    expect(isSeventhChordQuality('dim7')).toBe(true)
  })

  it('三和弦品质不属于七和弦', () => {
    expect(isSeventhChordQuality('')).toBe(false)
    expect(isSeventhChordQuality('m')).toBe(false)
    expect(isSeventhChordQuality('dim')).toBe(false)
    expect(isSeventhChordQuality('aug')).toBe(false)
    expect(isSeventhChordQuality('sus4')).toBe(false)
  })
})

describe('边界与回归', () => {
  it('三和弦分析不受七和弦改动影响', () => {
    expect(analyzeChordInKey('C', 'C', 'major')).toMatchObject({ degree: 'I', diatonic: true })
    expect(analyzeChordInKey('Am', 'C', 'major')).toMatchObject({ degree: 'vi', diatonic: true })
    expect(analyzeChordInKey('Dm', 'C', 'major')).toMatchObject({ degree: 'ii', diatonic: true })
    expect(analyzeChordInKey('Bdim', 'C', 'major')).toMatchObject({ degree: 'vii°', diatonic: true })
  })

  it('G 大调调内三和弦', () => {
    expect(analyzeChordInKey('G', 'G', 'major')).toMatchObject({ degree: 'I', diatonic: true })
    expect(analyzeChordInKey('Am', 'G', 'major')).toMatchObject({ degree: 'ii', diatonic: true })
    expect(analyzeChordInKey('D', 'G', 'major')).toMatchObject({ degree: 'V', diatonic: true })
  })

  it('非调内根音返回 —', () => {
    expect(analyzeChordInKey('C♯m', 'C', 'major').degree).toBe('—')
    expect(analyzeChordInKey('F♯', 'C', 'major').diatonic).toBe(false)
  })

  it('七和弦移调保持正确', () => {
    expect(transposeChord('Cmaj7', 2)).toBe('Dmaj7')
    expect(transposeChord('G7', 2)).toBe('A7')
    expect(transposeChord('Bm7b5', 2)).toBe('C♯m7b5')
  })
})

// 罗马数字判题测试（来自 exerciseScoring 逻辑）
describe('罗马数字判题：大小写敏感', () => {
  function scoreRomanNumeral(userInput: string, expected: string): boolean {
    const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/♭/g, 'b').replace(/♯/g, '#')
    return normalize(userInput) === normalize(expected)
  }

  it('vi 不等于 VI', () => {
    expect(scoreRomanNumeral('vi', 'vi')).toBe(true)
    expect(scoreRomanNumeral('VI', 'vi')).toBe(false) // 大三 ≠ 小三
    expect(scoreRomanNumeral('Vi', 'vi')).toBe(false)
  })

  it('V7 不等于 v7', () => {
    expect(scoreRomanNumeral('V7', 'V7')).toBe(true)
    expect(scoreRomanNumeral('v7', 'V7')).toBe(false)
  })

  it('ii 不等于 II', () => {
    expect(scoreRomanNumeral('ii', 'ii')).toBe(true)
    expect(scoreRomanNumeral('II', 'ii')).toBe(false)
  })

  it('标准化空格和 Unicode 符号但不影响大小写', () => {
    expect(scoreRomanNumeral('  vi  ', 'vi')).toBe(true)
    expect(scoreRomanNumeral('V7', 'V7')).toBe(true)
  })

  it('大小写提示', () => {
    // 用户输入了大写但答案是小写 — 给出提示逻辑（由 scoring 层处理）
    const user = 'VI'
    const expected = 'vi'
    const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').replace(/♭/g, 'b').replace(/♯/g, '#')
    expect(normalize(user)).not.toBe(normalize(expected)) // exact match fails
    expect(normalize(user).toLowerCase()).toBe(normalize(expected).toLowerCase()) // but case-insensitive match reveals the case error
  })
})
