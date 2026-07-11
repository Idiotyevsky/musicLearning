/**
 * D1 课程数据填充脚本
 *
 * 从 src/data/catalog.ts 读取课程、模块、练习与歌曲案例，生成 SQL INSERT 语句。
 * 生成的 SQL 会覆盖写入 stdout，可直接管道传输给 wrangler d1 execute。
 *
 * 用法：
 *   # 本地 D1
 *   node scripts/seed-d1.mjs | npx wrangler d1 execute string-theory-db --local --file=/dev/stdin
 *
 *   # 远程 D1（Windows 下可重定向到临时文件）
 *   node scripts/seed-d1.mjs > seed.sql
 *   npx wrangler d1 execute string-theory-db --remote --file=seed.sql
 */
import { readFile, writeFile } from 'node:fs/promises'
import ts from 'typescript'

async function importTypeScript(path) {
  const source = await readFile(path, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`)
}

function esc(v) {
  if (v == null) return 'NULL'
  return `'${String(v).replace(/'/g, "''")}'`
}

const { modules, lessons, exercises, songCases } = await importTypeScript(
  new URL('../src/data/catalog.ts', import.meta.url),
)

const lines = []

lines.push('-- 弦上乐理 D1 种子数据')
lines.push('-- 生成时间：' + new Date().toISOString())
lines.push('')

// course_modules
for (const m of modules) {
  lines.push(
    `INSERT OR REPLACE INTO course_modules (id, slug, title, description, order_index, status) VALUES (${esc(m.id)}, ${esc(m.id)}, ${esc(m.title)}, ${esc(m.subtitle)}, ${m.index}, 'published');`,
  )
}
lines.push('')

// lessons
for (const l of lessons) {
  const content = JSON.stringify({
    sections: l.sections,
    mistakes: l.mistakes,
    formula: l.formula,
    quiz: l.quiz,
  })
  lines.push(
    `INSERT OR REPLACE INTO lessons (id, module_id, slug, title, summary, level, estimated_minutes, content_json, order_index, status, version, created_at, updated_at) VALUES (${esc(l.id)}, ${esc(l.moduleId)}, ${esc(l.slug)}, ${esc(l.title)}, ${esc(l.summary)}, 'beginner', ${l.minutes}, ${esc(content)}, ${lessons.indexOf(l)}, 'published', 1, '2026-07-11T00:00:00Z', '2026-07-11T00:00:00Z');`,
  )
}
lines.push('')

// lesson_prerequisites
for (const l of lessons) {
  if (l.prerequisite) {
    lines.push(
      `INSERT OR REPLACE INTO lesson_prerequisites (lesson_id, prerequisite_lesson_id) VALUES (${esc(l.id)}, ${esc(l.prerequisite)});`,
    )
  }
}
lines.push('')

// exercises
for (const e of exercises) {
  const prompt = JSON.stringify({ text: e.prompt, type: e.type })
  const answer = JSON.stringify({ index: e.answer })
  const explanation = JSON.stringify({ text: e.explanation })
  const metadata = JSON.stringify({
    targetNote: e.targetNote ?? null,
    targetContext: e.targetContext ?? null,
    intervalAnswer: e.intervalAnswer ?? null,
    romanAnswer: e.romanAnswer ?? null,
  })
  lines.push(
    `INSERT OR REPLACE INTO exercises (id, lesson_id, type, prompt_json, answer_json, explanation_json, metadata_json, difficulty, status) VALUES (${esc(e.id)}, ${esc(e.lessonId)}, ${esc(e.type)}, ${esc(prompt)}, ${esc(answer)}, ${esc(explanation)}, ${esc(metadata)}, ${e.difficulty}, 'published');`,
  )
}
lines.push('')

// song_cases
for (const s of songCases) {
  const content = JSON.stringify({
    artist: s.artist,
    tempo: s.tempo,
    meter: s.meter,
    chords: s.chords,
    summary: s.summary,
    tags: s.tags,
  })
  lines.push(
    `INSERT OR REPLACE INTO song_cases (id, slug, title, artist, key_tonic, key_mode, content_json, status, created_at, updated_at) VALUES (${esc(s.id)}, ${esc(s.id)}, ${esc(s.title)}, ${esc(s.artist)}, ${esc(s.key)}, ${esc(s.mode)}, ${esc(content)}, 'published', '2026-07-11T00:00:00Z', '2026-07-11T00:00:00Z');`,
  )
}

const sql = lines.join('\n')
console.log(sql)

// 同时写入文件方便 Windows 下使用
const outPath = 'seed.sql'
await writeFile(outPath, sql, 'utf8')
console.error(`\n已写入 ${outPath}（${lines.length} 行 SQL）`)
console.error('运行方式：npx wrangler d1 execute string-theory-db --local --file=seed.sql')
