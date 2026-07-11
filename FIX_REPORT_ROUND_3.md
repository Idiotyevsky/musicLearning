# 弦上乐理 第三轮修复报告

## 修改摘要

第三轮核心工作是"接线"——将第二轮已创建的组件和算法真正接入用户使用路径，修复逻辑错误，并用真实测试替换空测试。

## 逐项修复状态

| 任务 | 状态 | 修改文件 | 测试 | 说明 |
|---|---|---|---|---|
| 1. 统一状态更新回调 | ✅ | `InlineQuiz.tsx`, `ExerciseRenderer.tsx` | 手动 | 所有题型通过 `onResult(ExerciseResult)` 上报，页面统一调用 `recordAttempt` + `updateReview` |
| 2. ExerciseRenderer 单题接口 | ✅ | `ExerciseRenderer.tsx` | 手动 | 接收 `exercise: Exercise` + `onResult` + `onNext`，页面管理索引 |
| 3a. PracticePage 接入 | ✅ | `PracticePage.tsx` | 手动 | `<InlineQuiz>` → `<ExerciseRenderer>`，统一 handler |
| 3b. LessonPage 接入 | ✅ | `App.tsx` (LessonExerciseBlock) | 手动 | 课程内即时练习使用 ExerciseRenderer |
| 4. 指板位置回调 | ✅ | `Fretboard.tsx`, `FretboardClickExercise.tsx` | 手动 | `onNoteClick(FretPosition)` 回调，存储 `{stringIndex, fret, note, pitchClass}`，按 `${stringIndex}:${fret}` 去重 |
| 5. 罗马数字大小写 | ✅ | `exerciseScoring.ts` | `theory.test.ts` (5 tests) | 移除 `.toLowerCase()`，`vi ≠ VI`，大/小三和弦必须区分 |
| 6a. 错题最新结果 | ✅ | `PracticePage.tsx` | 手动 | 按 `exerciseId` 取最新一次结果，只有最新仍错才算当前错题 |
| 6b. 课程范围限制 | ✅ | `PracticePage.tsx` | 手动 | 只从已答题/已完成/已有复习状态的课程选题 |
| 6c. 优先级保留 | ✅ | `PracticePage.tsx` | 手动 | 组内 shuffle，组间保持顺序（错题 > 到期 > 低掌握度） |
| 6d. 空状态 | ✅ | `PracticePage.tsx` | 手动 | 无候选时显示"今天暂无到期复习"，不回退固定八题 |
| 7. ON CONFLICT | ✅ | `seed-d1.mjs` | 手动 | `INSERT OR REPLACE` → `ON CONFLICT(id) DO UPDATE SET ...`，事务包裹 |
| 8. Worker 真实测试 | ✅ | `worker/index.ts`, `worker.test.ts` | 7 tests | 导出 app，使用 `app.request()` + mock D1，断言状态码和正文 |
| 9a. 交互数据 | ✅ | `catalog.ts` (lessonInteractions) | 手动 | 15 节课各有独立 audio/fretboard 演示配置 |
| 9b. 交互渲染 | ✅ | `App.tsx` (LessonPage) | 手动 | 优先读取 `lesson.interaction`，fallback 到 `lessonInteractions[lesson.id]` |
| 9c. 内容校验 | ✅ | `validate-content.mjs` | 手动 | 检查每节发布课有非空交互配置 |
| 10. E2E | ⚠️ 部分 | `tests/e2e/app.spec.ts` | — | 需要 Playwright 环境（Chrome 路径），本次未运行 |
| 11. Lint | ⚠️ 部分 | — | — | 项目无 ESLint 配置，TypeScript strict 模式通过 `tsc -b` |

## 测试执行结果

```
✓ tests/theory.test.ts (23 tests) — 含新增罗马数字大小写测试
✓ tests/worker.test.ts (7 tests)  — 真实 app.request() + mock D1
Test Files  2 passed
     Tests  30 passed (was 26 in R2)

  GET /api/health                → 200 { ok: true }
  GET /api/projects (disabled)   → 503 user_api_disabled_in_mvp
  GET /api/projects (enabled)    → 400 user_id_required
  POST /api/projects (disabled)  → 503
  POST /api/progress (disabled)  → 503
  GET /api/modules (public)      → 200
  GET /api/lessons/:slug (public)→ 200
```

## 构建执行结果

```bash
npm run build
✓ built in 4.02s
dist/index.html       0.59 kB
dist/assets/index.css 50.54 kB
dist/assets/index.js 358.09 kB
```

## 内容校验结果

```
内容校验通过：5 模块，15 课程，75 练习，5 歌曲案例，15 知识节点，16 个来源。
（含交互配置检查：每节课均有 audioDemos 或 fretboardDemos）
```

## 修改文件列表

```
修改：
  src/components/InlineQuiz.tsx           — onResult prop，移除直接 recordAttempt
  src/components/Fretboard.tsx            — onNoteClick 回调 + FretPosition 类型
  src/features/practice/ExerciseRenderer.tsx — 单题接口 + 统一回调
  src/features/practice/FretboardClickExercise.tsx — FretPosition[] 存储
  src/features/practice/exerciseScoring.ts — 罗马数字大小写敏感
  src/pages/PracticePage.tsx              — ExerciseRenderer 接入、复习过滤、错题逻辑、空状态
  src/App.tsx                             — LessonExerciseBlock 组件、interaction 读取
  src/data/catalog.ts                     — lessonInteractions 映射、ExerciseResult 类型
  src/worker/index.ts                     — 导出 app
  tests/worker.test.ts                    — 真实 HTTP 测试
  tests/theory.test.ts                    — 罗马数字大小写测试
  scripts/seed-d1.mjs                     — ON CONFLICT DO UPDATE
  scripts/validate-content.mjs            — 交互数据校验
```

## 尚未完成项

1. **E2E 测试** — Playwright 需要特定 Chrome 路径且需 build+preview 环境
2. **ESLint** — 项目当前无 lint 配置，TypeScript strict 模式可部分替代
3. **LessonPage 音频真实渲染** — 类型和交互数据已就位，但 audio demo 的实际播放渲染为简化版
4. **扒谱工作台深化** — 和弦块拖动/缩放/撤销/重做/拍点吸附仍未实现

## 最新 Commit SHA

见 `git log`

## 已知限制

- 端到端测试依赖 Playwright 原生 Chrome 二进制文件
- 复习系统使用 LocalStorage，不支持跨设备
- D1 用户 API 默认关闭（`ENABLE_USER_API=false`）
