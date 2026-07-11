import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

app.get('/api/health', async (c) => {
  let database = 'unconfigured'
  try { await c.env.DB.prepare('SELECT 1 AS ok').first(); database = 'connected' } catch { database = 'unavailable' }
  return c.json({ ok: true, service: 'string-theory', database, timestamp: new Date().toISOString() })
})

app.get('/api/modules', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM course_modules WHERE status = ? ORDER BY order_index').bind('published').all()
  return c.json(rows.results)
})

app.get('/api/lessons/:slug', async (c) => {
  const lesson = await c.env.DB.prepare('SELECT * FROM lessons WHERE slug = ? AND status = ?').bind(c.req.param('slug'), 'published').first()
  return lesson ? c.json(lesson) : c.json({ error: 'lesson_not_found' }, 404)
})

const progressSchema = z.object({ userId: z.string().min(1), lessonId: z.string().min(1), status: z.enum(['started', 'completed']), mastery: z.number().min(0).max(100) })
app.post('/api/progress', zValidator('json', progressSchema), async (c) => {
  const data = c.req.valid('json'); const now = new Date().toISOString()
  await c.env.DB.prepare(`INSERT INTO learning_progress (user_id, lesson_id, status, mastery, last_studied_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO UPDATE SET status=excluded.status, mastery=excluded.mastery, last_studied_at=excluded.last_studied_at, updated_at=excluded.updated_at`)
    .bind(data.userId, data.lessonId, data.status, data.mastery, now, now).run()
  return c.json({ ok: true })
})

const projectSchema = z.object({ id: z.string(), userId: z.string(), title: z.string().min(1).max(120), duration: z.number().nonnegative().max(600), bpm: z.number().positive().max(400).nullable(), keyTonic: z.string().nullable(), keyMode: z.string().nullable(), result: z.unknown() })
app.post('/api/projects', zValidator('json', projectSchema), async (c) => {
  const p = c.req.valid('json'); const now = new Date().toISOString()
  const count = await c.env.DB.prepare('SELECT COUNT(*) AS count FROM transcription_projects WHERE user_id = ?').bind(p.userId).first<{ count: number }>()
  if ((count?.count ?? 0) >= 5) return c.json({ error: 'project_limit_reached' }, 429)
  await c.env.DB.prepare(`INSERT INTO transcription_projects (id,user_id,title,duration,bpm,key_tonic,key_mode,result_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .bind(p.id, p.userId, p.title, p.duration, p.bpm, p.keyTonic, p.keyMode, JSON.stringify(p.result), now, now).run()
  return c.json({ ok: true, id: p.id }, 201)
})

app.get('/api/projects', async (c) => {
  const userId = c.req.query('user_id'); if (!userId) return c.json({ error: 'user_id_required' }, 400)
  const rows = await c.env.DB.prepare('SELECT * FROM transcription_projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5').bind(userId).all()
  return c.json(rows.results)
})

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found' }, 404)
  return c.env.ASSETS.fetch(c.req.raw)
})

export default app
