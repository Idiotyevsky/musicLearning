export const CHROMATIC_SHARPS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const
export const CHROMATIC_FLATS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'] as const
const NATURAL_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

export type ScaleType = 'major' | 'naturalMinor' | 'harmonicMinor' | 'majorPentatonic' | 'minorPentatonic' | 'blues' | 'dorian' | 'mixolydian'

export const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
}

export const SCALE_LABELS: Record<ScaleType, string> = {
  major: '大调音阶', naturalMinor: '自然小调', harmonicMinor: '和声小调',
  majorPentatonic: '大调五声音阶', minorPentatonic: '小调五声音阶', blues: '布鲁斯音阶',
  dorian: '多利亚调式', mixolydian: '混合利底亚调式',
}

export const normalizeAccidentals = (note: string) => note.trim().replace(/#/g, '♯').replace(/b/g, '♭')

export function noteToPitchClass(note: string): number {
  const clean = normalizeAccidentals(note).replace(/\d/g, '')
  const match = clean.match(/^([A-Ga-g])([♯♭]{0,2})$/)
  if (!match) throw new Error(`无效音名：${note}`)
  let pc = NATURAL_PC[match[1].toUpperCase()]
  for (const accidental of match[2]) pc += accidental === '♯' ? 1 : -1
  return (pc + 120) % 12
}

function spellPitch(letter: string, targetPc: number): string {
  let delta = (targetPc - NATURAL_PC[letter] + 12) % 12
  if (delta > 6) delta -= 12
  if (delta === 0) return letter
  if (delta === 1) return `${letter}♯`
  if (delta === 2) return `${letter}♯♯`
  if (delta === -1) return `${letter}♭`
  if (delta === -2) return `${letter}♭♭`
  return CHROMATIC_SHARPS[targetPc]
}

function preferFlats(tonic: string) {
  return tonic.includes('♭') || ['F', 'D♭', 'E♭', 'G♭', 'A♭', 'B♭'].includes(normalizeAccidentals(tonic))
}

export function displayNote(pc: number, context = 'C'): string {
  return (preferFlats(context) ? CHROMATIC_FLATS : CHROMATIC_SHARPS)[(pc + 120) % 12]
}

export function getScaleNotes(tonic: string, type: ScaleType = 'major'): string[] {
  const normalized = normalizeAccidentals(tonic)
  const tonicPc = noteToPitchClass(normalized)
  const rootLetter = normalized[0].toUpperCase()
  const rootIndex = LETTERS.indexOf(rootLetter)
  const pattern = SCALE_PATTERNS[type]
  const usesDiatonicLetters = !['majorPentatonic', 'minorPentatonic', 'blues'].includes(type)
  return pattern.map((offset, index) => {
    const pc = (tonicPc + offset) % 12
    if (!usesDiatonicLetters) return displayNote(pc, normalized)
    return spellPitch(LETTERS[(rootIndex + index) % 7], pc)
  })
}

type ChordShape = { intervals: number[]; degrees: number[]; label: string }
const CHORD_SHAPES: Record<string, ChordShape> = {
  '': { intervals: [0, 4, 7], degrees: [1, 3, 5], label: '大三和弦' },
  m: { intervals: [0, 3, 7], degrees: [1, 3, 5], label: '小三和弦' },
  dim: { intervals: [0, 3, 6], degrees: [1, 3, 5], label: '减三和弦' },
  aug: { intervals: [0, 4, 8], degrees: [1, 3, 5], label: '增三和弦' },
  '7': { intervals: [0, 4, 7, 10], degrees: [1, 3, 5, 7], label: '属七和弦' },
  maj7: { intervals: [0, 4, 7, 11], degrees: [1, 3, 5, 7], label: '大七和弦' },
  m7: { intervals: [0, 3, 7, 10], degrees: [1, 3, 5, 7], label: '小七和弦' },
  m7b5: { intervals: [0, 3, 6, 10], degrees: [1, 3, 5, 7], label: '半减七和弦' },
  dim7: { intervals: [0, 3, 6, 9], degrees: [1, 3, 5, 7], label: '减七和弦' },
  sus2: { intervals: [0, 2, 7], degrees: [1, 2, 5], label: '挂二和弦' },
  sus4: { intervals: [0, 5, 7], degrees: [1, 4, 5], label: '挂四和弦' },
  add9: { intervals: [0, 4, 7, 14], degrees: [1, 3, 5, 9], label: '加九和弦' },
  '6': { intervals: [0, 4, 7, 9], degrees: [1, 3, 5, 6], label: '大六和弦' },
  m6: { intervals: [0, 3, 7, 9], degrees: [1, 3, 5, 6], label: '小六和弦' },
  '9': { intervals: [0, 4, 7, 10, 14], degrees: [1, 3, 5, 7, 9], label: '属九和弦' },
}

export interface ParsedChord { root: string; quality: string; bass?: string; symbol: string }

export function parseChord(symbol: string): ParsedChord {
  const normalized = normalizeAccidentals(symbol).replace(/Δ/g, 'maj').replace(/°/g, 'dim').replace(/ø/g, 'm7b5')
  const match = normalized.match(/^([A-G](?:♯|♭)?)(maj7|m7b5|dim7|sus2|sus4|add9|m7|m6|dim|aug|maj|m|7|9|6)?(?:\/([A-G](?:♯|♭)?))?$/i)
  if (!match) throw new Error(`暂不支持的和弦：${symbol}`)
  const root = match[1][0].toUpperCase() + match[1].slice(1)
  let quality = match[2] ?? ''
  if (quality === 'maj') quality = ''
  if (!CHORD_SHAPES[quality]) throw new Error(`暂不支持的和弦类型：${quality}`)
  return { root, quality, bass: match[3], symbol: `${root}${quality}${match[3] ? `/${match[3]}` : ''}` }
}

export function getChordNotes(symbol: string): string[] {
  const chord = parseChord(symbol)
  const rootPc = noteToPitchClass(chord.root)
  const rootLetter = LETTERS.indexOf(chord.root[0])
  const shape = CHORD_SHAPES[chord.quality]
  return shape.intervals.map((interval, index) => {
    const degree = shape.degrees[index]
    const letterStep = (degree - 1) % 7
    return spellPitch(LETTERS[(rootLetter + letterStep) % 7], (rootPc + interval) % 12)
  })
}

export function describeChord(symbol: string) {
  const chord = parseChord(symbol)
  const shape = CHORD_SHAPES[chord.quality]
  return { ...chord, name: shape.label, notes: getChordNotes(symbol), intervals: shape.intervals.map((v) => v % 12) }
}

const INTERVAL_NAMES = ['纯一度', '小二度', '大二度', '小三度', '大三度', '纯四度', '增四度/减五度', '纯五度', '小六度', '大六度', '小七度', '大七度']
export function getInterval(from: string, to: string) {
  const semitones = (noteToPitchClass(to) - noteToPitchClass(from) + 12) % 12
  return { semitones, name: INTERVAL_NAMES[semitones] }
}

const MAJOR_TRIADS = ['', 'm', 'm', '', '', 'm', 'dim']
const MINOR_TRIADS = ['m', 'dim', '', 'm', 'm', '', '']
const MAJOR_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const MINOR_ROMANS = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
const FUNCTIONS = ['主功能', '下属功能', '主功能', '下属功能', '属功能', '主功能', '属功能']

export function getDiatonicChords(tonic: string, mode: 'major' | 'minor' = 'major') {
  const notes = getScaleNotes(tonic, mode === 'major' ? 'major' : 'naturalMinor')
  const qualities = mode === 'major' ? MAJOR_TRIADS : MINOR_TRIADS
  const romans = mode === 'major' ? MAJOR_ROMANS : MINOR_ROMANS
  return notes.map((note, i) => ({ symbol: `${note}${qualities[i]}`, root: note, quality: qualities[i], roman: romans[i], function: FUNCTIONS[i] }))
}

export function analyzeChordInKey(symbol: string, tonic: string, mode: 'major' | 'minor' = 'major') {
  const chord = parseChord(symbol)
  const chords = getDiatonicChords(tonic, mode)
  const degreeIndex = chords.findIndex((candidate) => noteToPitchClass(candidate.root) === noteToPitchClass(chord.root))
  const exact = degreeIndex >= 0 && chords[degreeIndex].quality === chord.quality.replace('7', '')
  if (degreeIndex < 0) return { degree: '—', diatonic: false, function: '调外色彩', reason: `${chord.root} 不在该音阶中` }
  return {
    degree: (mode === 'major' ? MAJOR_ROMANS : MINOR_ROMANS)[degreeIndex],
    diatonic: exact,
    function: FUNCTIONS[degreeIndex],
    reason: exact ? '调内和弦' : '根音在调内，但和弦性质发生了变化',
  }
}

export function transposeNote(note: string, semitones: number, context?: string) {
  return displayNote(noteToPitchClass(note) + semitones, context ?? note)
}

export function transposeChord(symbol: string, semitones: number, context?: string) {
  const chord = parseChord(symbol)
  const root = transposeNote(chord.root, semitones, context ?? chord.root)
  const bass = chord.bass ? `/${transposeNote(chord.bass, semitones, context ?? chord.bass)}` : ''
  return `${root}${chord.quality}${bass}`
}

export function midiToNote(midi: number, flats = false) {
  const notes = flats ? CHROMATIC_FLATS : CHROMATIC_SHARPS
  return `${notes[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

export function noteToMidi(note: string) {
  const match = normalizeAccidentals(note).match(/^([A-G](?:♯|♭)?)(-?\d+)$/)
  if (!match) throw new Error(`缺少或无效的八度编号：${note}`)
  return (Number(match[2]) + 1) * 12 + noteToPitchClass(match[1])
}

export interface FretPosition { string: number; fret: number; note: string; pitchClass: number }
const OPEN_MIDI = [64, 59, 55, 50, 45, 40] // 显示顺序：1弦到6弦

export function getFretboardPositions(frets = 15, context = 'C'): FretPosition[] {
  return OPEN_MIDI.flatMap((open, stringIndex) => Array.from({ length: frets + 1 }, (_, fret) => {
    const pc = (open + fret) % 12
    return { string: stringIndex + 1, fret, note: displayNote(pc, context), pitchClass: pc }
  }))
}

export function getCapoOptions(targetKey: string, preferredShapes = ['C', 'G', 'D', 'A', 'E']) {
  const target = noteToPitchClass(targetKey)
  return preferredShapes.map((shape) => ({ shape, fret: (target - noteToPitchClass(shape) + 12) % 12 }))
    .filter((item) => item.fret <= 7).sort((a, b) => a.fret - b.fret)
}

export function guessKeyFromChords(symbols: string[]) {
  const tonics = CHROMATIC_SHARPS
  return tonics.map((tonic) => {
    const score = symbols.reduce((sum, symbol) => sum + (analyzeChordInKey(symbol, tonic, 'major').diatonic ? 1 : 0), 0)
    return { tonic, mode: 'major' as const, score, confidence: symbols.length ? score / symbols.length : 0 }
  }).sort((a, b) => b.score - a.score).slice(0, 3)
}
