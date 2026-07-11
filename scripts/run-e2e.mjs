import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const playwright = fileURLToPath(new URL('../node_modules/@playwright/test/cli.js', import.meta.url))
const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1'], { stdio: 'ignore', windowsHide: true })

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try { const response = await fetch('http://127.0.0.1:4173'); if (response.ok) return }
    catch { /* server is still starting */ }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error('Vite 预览服务器未能在 5 秒内启动')
}

function stopServer() {
  if (!server.pid) return
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore', windowsHide: true })
  else server.kill('SIGTERM')
}

try {
  await waitForServer()
  const runner = spawn(process.execPath, [playwright, 'test', '--config=playwright.config.ts'], { stdio: 'inherit', windowsHide: true })
  const code = await new Promise((resolve) => runner.on('exit', (value) => resolve(value ?? 1)))
  stopServer()
  process.exit(code)
} catch (error) {
  stopServer()
  console.error(error)
  process.exit(1)
}
