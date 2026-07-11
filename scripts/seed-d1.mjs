/**
 * D1 课程数据填充脚本（幂等：ON CONFLICT DO UPDATE）
 *
 * 用法：
 *   node scripts/seed-d1.mjs
 *   npx wrangler d1 execute string-theory-db --local --file=seed.sql
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

lines.push('-- 弦上乐理 D1 种子数据（幂等：ON CONFLICT DO UPDATE）')
lines.push('-- 生成时间：' + new Date().toISOString())
lines.push('BEGIN TRANSACTION;')
lines.push('')

// course_modules（父表优先）
for (const m of modules) {
  lines.push(
    `INSERT INTO course_modules (id, slug, title, description, order_index, status) VALUES (${esc(m.id)}, ${esc(m.id)}, ${esc(m.title)}, ${esc(m.subtitle)}, ${m.index}, 'published') ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, description=excluded.description, order_index=excluded.order_index, status=excluded.status;`,
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
    `INSERT INTO lessons (id, module_id, slug, title, summary, level, estimated_minutes, content_json, order_index, status, version, created_at, updated_at) VALUES (${esc(l.id)}, ${esc(l.moduleId)}, ${esc(l.slug)}, ${esc(l.title)}, ${esc(l.summary)}, 'beginner', ${l.minutes}, ${esc(content)}, ${lessons.indexOf(l)}, 'published', 1, '2026-07-11T00:00:00Z', '2026-07-11T00:00:00Z') ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, summary=excluded.summary, content_json=excluded.content_json, estimated_minutes=excluded.estimated_minutes, updated_at='2026-07-11T00:00:00Z';`,
  )
}
lines.push('')

// lesson_prerequisites（不覆盖，只在不存在时插入）
for (const l of lessons) {
  if (l.prerequisite) {
    lines.push(
      `INSERT INTO lesson_prerequisites (lesson_id, prerequisite_lesson_id) VALUES (${esc(l.id)}, ${esc(l.prerequisite)}) ON CONFLICT(lesson_id, prerequisite_lesson_id) DO NOTHING;`,
    )
  }
}
lines.push('')

// exercises（保留真实题型和 metadata）
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
    `INSERT INTO exercises (id, lesson_id, type, prompt_json, answer_json, explanation_json, metadata_json, difficulty, status) VALUES (${esc(e.id)}, ${esc(e.lessonId)}, ${esc(e.type)}, ${esc(prompt)}, ${esc(answer)}, ${esc(explanation)}, ${esc(metadata)}, ${e.difficulty}, 'published') ON CONFLICT(id) DO UPDATE SET type=excluded.type, prompt_json=excluded.prompt_json, answer_json=excluded.answer_json, explanation_json=excluded.explanation_json, metadata_json=excluded.metadata_json, difficulty=excluded.difficulty, status=excluded.status;`,
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
    `INSERT INTO song_cases (id, slug, title, artist, key_tonic, key_mode, content_json, status, created_at, updated_at) VALUES (${esc(s.id)}, ${esc(s.id)}, ${esc(s.title)}, ${esc(s.artist)}, ${esc(s.key)}, ${esc(s.mode)}, ${esc(content)}, 'published', '2026-07-11T00:00:00Z', '2026-07-11T00:00:00Z') ON CONFLICT(id) DO UPDATE SET slug=excluded.slug, title=excluded.title, artist=excluded.artist, key_tonic=excluded.key_tonic, key_mode=excluded.key_mode, content_json=excluded.content_json, status=excluded.status, updated_at='2026-07-11T00:00:00Z';`,
  )
}

lines.push('')
lines.push('COMMIT;')

const sql = lines.join('\n')
console.log(sql)

const outPath = 'seed.sql'
await writeFile(outPath, sql, 'utf8')
console.error(`\n已写入 ${outPath}（${lines.length} 行 SQL）`)
console.error('运行方式：npx wrangler d1 execute string-theory-db --local --file=seed.sql')
