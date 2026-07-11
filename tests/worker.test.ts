import { describe, expect, it } from 'vitest'
import { app } from '../src/worker'

// 简单 D1 Mock：支持 prepare → bind → first/all/run
function mockD1(rows: unknown[] = []) {
  const stmt = {
    bind: (..._args: unknown[]) => stmt,
    first: async <T>() => rows[0] as T ?? null,
    all: async () => ({ results: rows }),
    run: async () => ({}),
  }
  return {
    prepare: (_sql: string) => stmt,
  }
}

function mockEnv(overrides: Record<string, unknown> = {}) {
  return {
    DB: mockD1([]),
    ASSETS: { fetch: async () => new Response('SPA fallback') },
    ENABLE_USER_API: 'false',
    ...overrides,
  }
}

describe('Worker API', () => {
  it('GET /api/health 返回 200', async () => {
    const res = await app.request('/api/health', {}, mockEnv())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.service).toBe('string-theory')
  })

  it('GET /api/projects 在 API 关闭时返回 503', async () => {
    const res = await app.request('/api/projects?user_id=test', {}, mockEnv({ ENABLE_USER_API: 'false' }))
    expect(res.status).toBe(503)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('user_api_disabled_in_mvp')
  })

  it('GET /api/projects 在 API 启用且无 user_id 时返回 400', async () => {
    const res = await app.request('/api/projects', {}, mockEnv({ ENABLE_USER_API: 'true' }))
    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('user_id_required')
  })

  it('POST /api/projects 在 API 关闭时返回 503', async () => {
    const res = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'p1', userId: 'u1', title: 'Test', duration: 60, bpm: null, keyTonic: null, keyMode: null, result: {} }),
    }, mockEnv({ ENABLE_USER_API: 'false' }))
    expect(res.status).toBe(503)
  })

  it('POST /api/progress 在 API 关闭时返回 503', async () => {
    const res = await app.request('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'u1', lessonId: 'l1', status: 'completed', mastery: 80 }),
    }, mockEnv({ ENABLE_USER_API: 'false' }))
    expect(res.status).toBe(503)
  })

  it('GET /api/modules 公开可访问且不受 ENABLE_USER_API 影响', async () => {
    const modules = [{ id: 'm1', slug: 'm1', title: 'Test', description: 'Desc', order_index: 0, status: 'published' }]
    const res = await app.request('/api/modules', {}, mockEnv({
      ENABLE_USER_API: 'false',
      DB: mockD1(modules),
    }))
    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body).toEqual(modules)
  })

  it('GET /api/lessons/:slug 公开可访问', async () => {
    const lesson = { id: 'l1', slug: 'test', title: 'Test', status: 'published' }
    const res = await app.request('/api/lessons/test', {}, mockEnv({
      ENABLE_USER_API: 'false',
      DB: mockD1([lesson]),
    }))
    expect(res.status).toBe(200)
  })
})
