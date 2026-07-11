/**
 * 弦上乐理 Worker API (Hono / Cloudflare Workers)
 *
 * MVP 状态说明：
 * - 当前前端 MVP 使用 LocalStorage 存储所有用户数据，不调用本 API。
 * - 本 API 是为后续登录与跨设备同步准备的兼容层。
 * - 所有用户私有接口默认禁用（ENABLE_USER_API !== 'true'），仅保留公开只读端点。
 *
 * 当前默认禁用的端点（受 protectUserApi 保护）：
 *   GET  /api/projects
 *   POST /api/projects
 *   POST /api/progress
 *
 * 正式启用前必须完成：
 * 1. 接入身份认证（Clerk / Auth0 / Cloudflare Access 等）
 * 2. 从已验证 Token 中提取 userId，禁止客户端自由提交
 * 3. 将 CORS 限制为生产域名
 * 4. 对写入端点添加速率限制
 * 5. 管理员端点与普通用户端点隔离
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
  ENABLE_USER_API?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS：MVP 阶段仅允许本地开发与 Pages 预览域名；生产部署时更新
app.use('/api/*', cors({
  origin: (origin) => {
    const allowed = ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173', 'http://127.0.0.1:4173']
    if (!origin || allowed.some((a) => origin.startsWith(a)) || origin.endsWith('.pages.dev')) {
      return origin ?? allowed[0]
    }
    return allowed[0]
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// 用户数据保护：MVP 默认禁用所有用户私有接口；在 wrangler.jsonc 中设置 ENABLE_USER_API = "true" 以启用
const protectUserApi = async (c: any, next: any) => {
  if (c.env.ENABLE_USER_API !== 'true') {
    return c.json({ error: 'user_api_disabled_in_mvp', message: '当前为本地游客模式，不支持账户系统与跨设备同步。用户私有 API 默认关闭。' }, 503)
  }
  return next()
}

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
app.post('/api/progress', protectUserApi, zValidator('json', progressSchema), async (c) => {
  const data = c.req.valid('json'); const now = new Date().toISOString()
  await c.env.DB.prepare(`INSERT INTO learning_progress (user_id, lesson_id, status, mastery, last_studied_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, lesson_id) DO UPDATE SET status=excluded.status, mastery=excluded.mastery, last_studied_at=excluded.last_studied_at, updated_at=excluded.updated_at`)
    .bind(data.userId, data.lessonId, data.status, data.mastery, now, now).run()
  return c.json({ ok: true })
})

const projectSchema = z.object({ id: z.string(), userId: z.string(), title: z.string().min(1).max(120), duration: z.number().nonnegative().max(600), bpm: z.number().positive().max(400).nullable(), keyTonic: z.string().nullable(), keyMode: z.string().nullable(), result: z.unknown() })
app.post('/api/projects', protectUserApi, zValidator('json', projectSchema), async (c) => {
  const p = c.req.valid('json'); const now = new Date().toISOString()
  const count = await c.env.DB.prepare('SELECT COUNT(*) AS count FROM transcription_projects WHERE user_id = ?').bind(p.userId).first<{ count: number }>()
  if ((count?.count ?? 0) >= 5) return c.json({ error: 'project_limit_reached' }, 429)
  await c.env.DB.prepare(`INSERT INTO transcription_projects (id,user_id,title,duration,bpm,key_tonic,key_mode,result_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .bind(p.id, p.userId, p.title, p.duration, p.bpm, p.keyTonic, p.keyMode, JSON.stringify(p.result), now, now).run()
  return c.json({ ok: true, id: p.id }, 201)
})

app.get('/api/projects', protectUserApi, async (c) => {
  const userId = c.req.query('user_id'); if (!userId) return c.json({ error: 'user_id_required' }, 400)
  const rows = await c.env.DB.prepare('SELECT * FROM transcription_projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5').bind(userId).all()
  return c.json(rows.results)
})

app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'not_found' }, 404)
  return c.env.ASSETS.fetch(c.req.raw)
})

export { app }
export default app
