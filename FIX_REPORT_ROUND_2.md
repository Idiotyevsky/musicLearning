# 弦上乐理 第二轮修复报告

## 修改摘要

第二轮重点完成安全闭环、真实练习题型、React 稳定性、D1 数据一致性、复习算法和课程交互数据化。

## 修复问题列表

| 任务 | 状态 | 修改文件 | 测试 | 说明 |
|---|---|---|---|---|
| P0-1 关闭未认证用户项目读取 API | 完成 | `src/worker/index.ts` | `tests/worker.test.ts` (8 tests) | `protectUserApi` 中间件应用于 `GET /api/projects`，默认返回 503 |
| P0-2 修复五度圈 React Hooks 违规 | 完成 | `src/App.tsx`, `src/features/theory-lab/CircleOfFifthsPanel.tsx` | 手动验证 | IIFE 内 `useState` 提取为独立组件 |
| P0-3 实现真实非选择题组件 | 完成 | `src/features/practice/*` (6 文件), `src/data/catalog.ts` | 手动验证 | 指板点击、音程输入、罗马数字输入三种真实交互 |
| P1-1 D1 Seed 保留真实题型 | 完成 | `scripts/seed-d1.mjs`, `migrations/0002_exercise_metadata.sql` | 手动验证 | `e.type` 代替硬编码 `'multiple_choice'`，新增 `metadata_json` 列 |
| P1-2 Seed 幂等性 | 完成 | `scripts/seed-d1.mjs`, `migrations/0002_exercise_metadata.sql` | 手动验证 | `INSERT OR REPLACE` 代替 `INSERT OR IGNORE` |
| P1 复习升级为基础间隔复习 | 完成 | `src/state/LearningContext.tsx`, `src/pages/PracticePage.tsx` | 手动验证 | 新增 `ReviewState`，1/3/7/14/30 天间隔规则 |
| P1 课程交互数据化 | 部分完成 | `src/data/catalog.ts`, `src/App.tsx` | 手动验证 | 新增 `AudioDemo`/`FretboardDemo` 类型，LessonPage 优先读取数据 |
| P1-1 扒谱名称统一 | 完成 | `src/App.tsx` | 手动验证 | 更名为"辅助扒谱工作台 · BPM 候选 + 手动标注 + 乐理分析" |
| P2 拆分 App.tsx | 部分完成 | `src/features/theory-lab/`, `src/features/practice/` | 手动验证 | 五度圈和练习题型已拆出，LabPage/TranscriptionPage 仍在 App.tsx |

## 最新 Commit SHA

（见 git log）

## 修改文件列表

```
修改：
  src/App.tsx                     — 五度圈组件替换、课程交互数据读取、扒谱名称
  src/data/catalog.ts             — Exercise 类型扩展、exercise 数据、LessonInteraction 类型
  src/state/LearningContext.tsx   — ReviewState、间隔复习逻辑
  src/pages/PracticePage.tsx      — 今日复习过滤锁定课程
  src/worker/index.ts             — protectUserApi 守卫 GET /api/projects
  scripts/seed-d1.mjs             — 保留题型、新增 metadata_json、INSERT OR REPLACE

新增：
  src/features/theory-lab/CircleOfFifthsPanel.tsx
  src/features/practice/ExerciseRenderer.tsx
  src/features/practice/FretboardClickExercise.tsx
  src/features/practice/IntervalInputExercise.tsx
  src/features/practice/RomanNumeralInputExercise.tsx
  src/features/practice/exerciseScoring.ts
  tests/worker.test.ts
  migrations/0002_exercise_metadata.sql
```

## 新增测试数量

- 7 个 Worker API 安全测试 (`tests/worker.test.ts`)
- 原 18 个乐理测试全部通过（回归验证）
- 总计：26 tests

## 测试执行结果

```
✓ tests/worker.test.ts (8 tests)
✓ tests/theory.test.ts (18 tests)
Test Files  2 passed (2)
     Tests  26 passed (26)
```

## 构建执行结果

```
✓ built in 4.19s
dist/index.html      0.59 kB
dist/assets/index.css 50.54 kB
dist/assets/index.js 347.32 kB
```

## 内容校验结果

```
内容校验通过：5 模块，15 课程，75 练习，5 歌曲案例，15 知识节点，16 个来源。
```

## D1 Seed 验证

- `seed-d1.mjs` 已更新：使用 `e.type`（而非硬编码 `'multiple_choice'`）
- 新增 `metadata_json` 列迁移
- `INSERT OR REPLACE` 确保幂等性
- 包含 4 种题型：`multiple_choice`, `fretboard_click`, `interval_input`, `roman_numeral_input`

## 未完成问题

1. **App.tsx 仍包含 LabPage、TranscriptionPage、LessonPage、SongsPage** — 五度圈和练习组件已拆出，但页面主体仍内联
2. **扒谱和弦时间轴拖动/缩放/撤销/重做** — 需要较大的交互重构
3. **15 节课程独立交互数据完整配置** — 类型和 LessonPage 适配已完成，课程数据部分填充
4. **E2E 测试** — 需要 Playwright 环境（需 `npm run build && npm run preview` 后运行）
5. **节拍吸附网格** — 需要和弦事件系统重构

## 已知限制

- 当前为本地游客模式，不支持账户系统与跨设备同步
- D1 用户私有接口默认关闭（`ENABLE_USER_API = "false"`）
- 扒谱工作台为手动标注工具，不自动识别和弦
- 音程输入接受中文名称和常见缩写，但不支持所有变体
