import type { Exercise } from '../../data/catalog'

export type ScoreResult = { correct: boolean; feedback: string }

// 音程名称标准化：支持中英文及常见缩写
const INTERVAL_ALIASES: Record<string, string[]> = {
  '纯一度': ['P1', 'perfect unison', '纯一', '同度', 'unison'],
  '小二度': ['m2', 'minor second', '小二', '半音'],
  '大二度': ['M2', 'major second', '大二', '全音'],
  '小三度': ['m3', 'minor third', '小三'],
  '大三度': ['M3', 'major third', '大三'],
  '纯四度': ['P4', 'perfect fourth', '纯四'],
  '增四度/减五度': ['A4', 'd5', 'tritone', '三全音', '增四', '减五'],
  '纯五度': ['P5', 'perfect fifth', '纯五'],
  '小六度': ['m6', 'minor sixth', '小六'],
  '大六度': ['M6', 'major sixth', '大六'],
  '小七度': ['m7', 'minor seventh', '小七'],
  '大七度': ['M7', 'major seventh', '大七'],
}

function normalizeAnswer(input: string): string {
  const trimmed = input.trim().toLowerCase()
  for (const [canonical, aliases] of Object.entries(INTERVAL_ALIASES)) {
    const all = [canonical.toLowerCase(), ...aliases.map((a) => a.toLowerCase())]
    if (all.includes(trimmed)) return canonical
  }
  return trimmed
}

export function scoreIntervalInput(exercise: Exercise, userInput: string): ScoreResult {
  const normalized = normalizeAnswer(userInput)
  const expected = exercise.intervalAnswer ?? ''
  if (!expected) return { correct: false, feedback: '题目数据缺少正确答案。' }

  const expectedNorm = normalizeAnswer(expected)
  if (normalized === expectedNorm) {
    return { correct: true, feedback: '回答正确！' }
  }
  return {
    correct: false,
    feedback: `正确答案是「${expected}」。${exercise.explanation}`,
  }
}

export function scoreRomanNumeral(exercise: Exercise, userInput: string): ScoreResult {
  const trimmed = userInput.trim().toLowerCase()
  const expected = exercise.romanAnswer ?? ''
  if (!expected) return { correct: false, feedback: '题目数据缺少正确答案。' }

  // 大小写不敏感（vi == VI == Vi）
  const expectedNorm = expected.toLowerCase().replace(/°/g, '°').replace(/ø/g, 'ø')
  const userNorm = trimmed.replace(/°/g, '°').replace(/ø/g, 'ø')

  if (userNorm === expectedNorm) {
    return { correct: true, feedback: '回答正确！' }
  }
  return {
    correct: false,
    feedback: `正确答案是「${expected}」。${exercise.explanation}`,
  }
}

export function scoreMultipleChoice(exercise: Exercise, chosenIndex: number): ScoreResult {
  const correct = chosenIndex === exercise.answer
  return {
    correct,
    feedback: correct ? '回答正确！' : exercise.explanation,
  }
}

export function scoreFretboardClick(exercise: Exercise, selected: string[]): ScoreResult {
  const target = exercise.targetNote ?? ''
  if (!target) return { correct: false, feedback: '题目数据缺少目标音。' }

  const allCorrect = selected.length > 0 && selected.every((s) => {
    // 比较 pitch class
    const pc1 = (() => { try { return noteToPc(s) } catch { return -1 } })()
    const pc2 = (() => { try { return noteToPc(target) } catch { return -2 } })()
    return pc1 === pc2
  })

  if (allCorrect && selected.length > 0) {
    return { correct: true, feedback: '位置正确！' }
  }
  return {
    correct: false,
    feedback: `目标音是 ${target}。${exercise.explanation}`,
  }
}

// 简易 pitch class 计算（避免循环依赖 theory）
function noteToPc(note: string): number {
  const map: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const clean = note.trim().replace(/#/g, '♯').replace(/b/g, '♭')
  const match = clean.match(/^([A-G])([♯♭]*)$/)
  if (!match) throw new Error(`无效音名：${note}`)
  let pc = map[match[1].toUpperCase()] ?? 0
  for (const acc of match[2]) pc += acc === '♯' ? 1 : -1
  return (pc + 120) % 12
}
