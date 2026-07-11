import { readFile } from 'node:fs/promises'
import ts from 'typescript'

async function importTypeScript(path) {
  const source = await readFile(path, 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)
}

const { lessons, modules, exercises, songCases } = await importTypeScript(new URL('../src/data/catalog.ts', import.meta.url))
const { knowledgeNodes, knowledgeSources } = await importTypeScript(new URL('../src/data/knowledge.ts', import.meta.url))
const theory = await importTypeScript(new URL('../src/theory/index.ts', import.meta.url))
const errors = []
const unique = (values) => new Set(values).size === values.length

if (!unique(lessons.map((l) => l.slug))) errors.push('存在重复课程 slug')
if (!unique(lessons.map((l) => l.id))) errors.push('存在重复课程 id')
if (!unique(exercises.map((e) => e.id))) errors.push('存在重复练习 id')
if (modules.length < 3) errors.push('MVP 至少需要 3 个课程模块')
if (lessons.length < 10) errors.push('MVP 至少需要 10 节课程')
if (exercises.length < 50) errors.push('MVP 至少需要 50 道练习')
if (songCases.length < 5) errors.push('MVP 至少需要 5 个歌曲案例')
if (!unique(knowledgeSources.map((source) => source.id))) errors.push('存在重复知识来源 id')
if (!unique(knowledgeNodes.map((node) => node.id))) errors.push('存在重复知识节点 id')

for (const lesson of lessons) {
  if (!modules.some((m) => m.id === lesson.moduleId)) errors.push(`${lesson.id}: moduleId 不存在`)
  if (lesson.sections.length < 4) errors.push(`${lesson.id}: 课程分段不足`)
  if (lesson.quiz.length < 3) errors.push(`${lesson.id}: 每课至少 3 道练习`)
  if (lesson.prerequisite && !lessons.some((l) => l.id === lesson.prerequisite)) errors.push(`${lesson.id}: 前置课程不存在`)
  for (const q of lesson.quiz) if (q.answer < 0 || q.answer >= q.options.length) errors.push(`${lesson.id}: 练习答案越界`)
}

for (const source of knowledgeSources) {
  try { new URL(source.url) } catch { errors.push(`${source.id}: 来源 URL 无效`) }
  if (!source.publisher || !source.accessedAt || !source.license) errors.push(`${source.id}: 来源元数据不完整`)
}
for (const node of knowledgeNodes) {
  if (!node.claims.length) errors.push(`${node.id}: 知识节点没有断言`)
  if (node.status !== 'reviewed') errors.push(`${node.id}: 发布课程只能引用 reviewed 知识节点`)
  for (const lessonId of node.lessonIds) if (!lessons.some((lesson) => lesson.id === lessonId)) errors.push(`${node.id}: 引用了不存在的课程 ${lessonId}`)
  for (const claim of node.claims) {
    if (!claim.statement.trim()) errors.push(`${node.id}: 存在空知识断言`)
    if (!claim.sourceIds.length) errors.push(`${node.id}: 断言缺少来源`)
    for (const sourceId of claim.sourceIds) if (!knowledgeSources.some((source) => source.id === sourceId)) errors.push(`${node.id}: 来源 ${sourceId} 不存在`)
  }
}
for (const lesson of lessons) {
  const mapped = knowledgeNodes.some((node) => node.lessonIds.includes(lesson.id) && node.status === 'reviewed')
  if (!mapped) errors.push(`${lesson.id}: 发布课程未映射已审核知识节点`)
}

for (const [tonic, expected] of Object.entries({ C: 'C D E F G A B', F: 'F G A B♭ C D E', G: 'G A B C D E F♯' })) {
  const actual = theory.getScaleNotes(tonic, 'major').join(' ')
  if (actual !== expected) errors.push(`${tonic} 大调错误：${actual}`)
}
for (const [chord, expected] of Object.entries({ C: 'C E G', Am: 'A C E', G7: 'G B D F' })) {
  const actual = theory.getChordNotes(chord).join(' ')
  if (actual !== expected) errors.push(`${chord} 和弦错误：${actual}`)
}

// 单前置链也要做通用环检测，便于内容扩展。
const visiting = new Set(), visited = new Set()
function visit(id) {
  if (visiting.has(id)) return errors.push(`课程前置关系成环：${id}`)
  if (visited.has(id)) return
  visiting.add(id); const dependency = lessons.find((l) => l.id === id)?.prerequisite
  if (dependency) visit(dependency)
  visiting.delete(id); visited.add(id)
}
lessons.forEach((l) => visit(l.id))

if (errors.length) {
  console.error(`内容校验失败（${errors.length} 项）\n${errors.map((e) => `- ${e}`).join('\n')}`)
  process.exit(1)
}
console.log(`内容校验通过：${modules.length} 模块，${lessons.length} 课程，${exercises.length} 练习，${songCases.length} 歌曲案例，${knowledgeNodes.length} 知识节点，${knowledgeSources.length} 个来源。`)
