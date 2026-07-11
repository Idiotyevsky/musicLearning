# MVP 最终检查

## Git 信息

- Commit SHA: (见下方)
- Branch: main
- Working tree clean: yes

## 修改项目

| 项目 | 修改文件 | 测试 | 状态 |
|---|---|---|---|
| 题目 key 重置 (PracticePage) | `src/pages/PracticePage.tsx` | E2E | 完成 |
| 题目 key 重置 (LessonPage) | `src/App.tsx` | E2E | 完成 |
| 答题 E2E | `tests/e2e/app.spec.ts` (3 new) | Playwright | 完成 |
| 八度解析测试 | `tests/audio.test.ts` | 5 tests | 完成 |
| 节奏调度测试 | `tests/audio.test.ts` | 9 tests | 完成 |
| data-testid 选择器 | `ExerciseRenderer.tsx`, `IntervalInputExercise.tsx`, `RomanNumeralInputExercise.tsx` | E2E | 完成 |
| 停止按钮语义 | `src/features/courses/AudioDemoPlayer.tsx` | 手动 | 完成（"停止序列"） |
| 播放状态修正 | `src/features/courses/AudioDemoPlayer.tsx` | 手动 | 完成（schedule 总时长 auto-stop） |
| audioUtils 提取 | `src/features/courses/audioUtils.ts` (新) | 14 tests | 完成 |

## 命令结果

| 命令 | 结果 |
|---|---|
| npx tsc -b | PASS |
| npm run validate:content | PASS |
| npm test (vitest) | PASS (44 tests: 23 theory + 7 worker + 14 audio) |
| npm run build | PASS (359 KB JS) |
| npm run test:e2e | 待 Playwright 环境运行 |

## 尚未实现

- 自动和弦识别
- 完整 20 模块课程
- 账户与跨设备同步
- Web Audio 音符即时中止（只清理了 timer，振荡器自然衰减）
- ESLint 配置
