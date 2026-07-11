# 弦上乐理（String Theory）

面向吉他初学者的交互式乐理学习网站。产品围绕“系统学习、交互探索、歌曲实践”三条主线，把课程、指板实验、即时练习、歌曲分析和浏览器端辅助扒谱连成完整学习闭环。

完整的产品范围、课程体系、交互原则、技术架构与验收标准见 [产品规格说明](./PRODUCT_SPEC.md)。

## 产品主线

- **系统学习**：按前置关系学习音符、节奏、指板、音程、音阶、和弦与和声；
- **交互探索**：在指板、音阶、和弦、音程、和弦进行和五度圈中验证规律；
- **歌曲实践**：用原创歌曲案例、移调工具和可编辑扒谱时间轴完成实际应用。

## 当前可用功能

- 5 个基础课程模块、15 节结构化微课程、60 道含解析练习；
- 15 个经过检索与审核的知识节点、16 个来源登记，课程页可查看逐条知识依据；
- 游客学习进度、近期正确率、错题和收藏的本地保存；
- 交互式指板，支持音名、级数、半音标签和点击试听；
- 音阶生成、和弦拆解、音程实验、和弦进行、五度圈；
- 正确升降号语境的确定性 TypeScript 乐理规则引擎；
- 5 个原创歌曲案例、罗马数字分析、移调与变调夹建议；
- 本地 MP3/WAV 导入、波形概览、BPM 候选、可编辑和弦时间轴、项目保存与 JSON 导出；
- 节拍器、和弦移调器、变调夹计算器；
- 内容管理预览、JSON Schema、内容自动校验、D1 migration 与 Hono API；
- 桌面、平板和移动端响应式布局。

## 本地开发

需要 Node.js 20+。

```bash
npm install
npm run dev
```

生产验证：

```bash
npm run validate:content
npm test
npm run build
npm run preview
```

Vite 开发地址默认为 `http://localhost:5173`。静态生产文件输出到 `dist/`。

## Cloudflare 部署

1. 在 Cloudflare 创建 D1 数据库：

   ```bash
   npx wrangler d1 create string-theory-db
   ```

2. 把返回的数据库 ID 写入 `wrangler.jsonc` 的 `database_id`。
3. 应用 migration：

   ```bash
   npx wrangler d1 migrations apply string-theory-db --local
   npx wrangler d1 migrations apply string-theory-db --remote
   ```

4. 构建并部署：

   ```bash
   npm run deploy
   ```

部署后 `/api/health` 会返回 Worker 和 D1 状态。静态资源由 Workers Static Assets 提供，未知前端路径回退到单页应用。

首版默认使用游客模式，页面功能不依赖 D1；D1 API 是后续登录与跨设备同步的兼容层。没有创建实际 Cloudflare 资源前，不会产生在线地址。

MVP 默认不上传原始音频，所以 `wrangler.jsonc` 中的 R2 配置保持注释。后续启用时先运行 `npx wrangler r2 bucket create string-theory-audio`，再取消 `r2_buckets` 示例配置；桶应保持私有，并通过短时签名 URL 访问。

## 目录

```text
src/
  components/       指板等共享交互组件
  data/             结构化课程、知识库、来源、练习与歌曲案例
  state/            游客学习进度状态
  theory/           确定性乐理规则引擎
  worker/           Hono / Cloudflare Worker API
content/            知识库规范与课程、练习、知识节点 JSON Schema
migrations/         Cloudflare D1 schema
scripts/            内容及乐理事实校验
tests/              Vitest 规则引擎测试
PRODUCT_SPEC.md     产品、课程、交互、架构与验收规格
```

## 数据与隐私

- 学习进度、错题、收藏与扒谱 JSON 使用 LocalStorage 保存；
- 音频由 Web Audio API 在本地解码，不上传、不写入 D1；
- 本地 Object URL 只在当前页面会话有效，重新打开项目时需重新选择音频；
- 导入前必须确认拥有音频的合法使用权，MVP 限制为 20 MB，建议不超过 10 分钟；
- 歌曲案例均为本项目原创教学材料。

## 内容工作流

课程存放于 `src/data/catalog.ts`，使用字段化对象而非长 Markdown；检索来源、知识断言和课程映射存放于 `src/data/knowledge.ts`。完整生产规则见 `content/KNOWLEDGE_BASE.md`。新增或修改内容后执行：

```bash
npm run validate:content
```

校验会检查：重复 ID/slug、模块引用、前置课程存在性和环、每课分段与练习数量、答案索引、来源 URL 与元数据、知识断言的来源完整性、发布课程的知识节点覆盖，以及 C/F/G 大调和常用和弦等基础乐理事实。课程和练习的交换格式分别由 `content/schemas/lesson.schema.json` 和 `exercise.schema.json` 定义。

## 已知限制

- BPM 检测是轻量浏览器算法，只提供候选；复杂编曲、弱起和速度变化可能产生半拍/倍拍误差；
- MVP 不自动识别和弦，和弦时间轴由用户建立和修正；
- 项目 JSON 可恢复，但浏览器出于隐私不会持久保存本地音频文件；
- 目前发布 5 个入门模块，完整 20 模块属于后续内容阶段；
- 账号、跨设备同步、R2 音频存储和内容版本写入 UI 尚未启用；
- 管理后台是本地只读预览，正式编辑与鉴权将在接入账号体系后实现；
- 页面试听使用 Web Audio 合成音，不替代真实吉他录音；
- 当前没有 AI 聊天老师，也不承诺辅助扒谱结果绝对准确。

## 设计与可访问性

视觉采用暖白、墨绿和琴木棕的“音乐教室 + 数字工具”风格。核心颜色集中在 CSS token；交互元素提供键盘焦点语义、指板音点提供 `aria-label`，根音同时用颜色与描边区分，并尊重系统的“减少动态效果”设置。
