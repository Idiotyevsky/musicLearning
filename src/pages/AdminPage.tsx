import { useState } from 'react'
import { BookOpen, Check, Gauge, LibraryBig, Music2, Search, Target } from 'lucide-react'
import { exercises, lessons, modules, songCases } from '../data/catalog'
import { getKnowledgeForLesson, knowledgeNodes, knowledgeSources } from '../data/knowledge'
import { PageShell } from '../layout/PageShell'

function AdminPage() {
  const [query, setQuery] = useState('')
  const filtered = lessons.filter((l) => l.title.includes(query))
  return (
    <PageShell eyebrow="内容预览 · 本地只读" title="课程内容预览台" description="本地只读预览 — 正式编辑与版本管理功能将在账号体系接入后实现。">
      <div className="admin-layout">
        <aside className="admin-nav">
          <button className="active" title="当前仅展示课程列表"><BookOpen /> 课程预览 <span>{lessons.length}</span></button>
          <button onClick={() => alert('功能开发中')}><LibraryBig /> 知识节点 <span>{knowledgeNodes.length}</span></button>
          <button onClick={() => alert('功能开发中')}><Target /> 练习管理 <span>{exercises.length}</span></button>
          <button onClick={() => alert('功能开发中')}><Music2 /> 歌曲案例 <span>{songCases.length}</span></button>
          <button onClick={() => alert('功能开发中')}><Gauge /> 来源登记 <span>{knowledgeSources.length}</span></button>
        </aside>
        <section className="admin-main">
          <div className="admin-toolbar">
            <label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索课程" /></label>
            <span className="validation-ok"><Check /> {knowledgeSources.length} 个来源、{knowledgeNodes.length} 个知识节点已建立追溯关系</span>
          </div>
          <div className="admin-table">
            <div className="table-row header"><span>课程</span><span>模块</span><span>依据</span><span>状态</span><span>版本</span></div>
            {filtered.map((lesson) => (
              <div className="table-row" key={lesson.id}>
                <span><b>{lesson.title}</b><small>{lesson.slug}</small></span>
                <span>{modules.find((m) => m.id === lesson.moduleId)?.title}</span>
                <span>{getKnowledgeForLesson(lesson.id).sources.length} 个来源</span>
                <span><i className="status-dot" /> 已审核</span>
                <span>v2</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  )
}

export default AdminPage
