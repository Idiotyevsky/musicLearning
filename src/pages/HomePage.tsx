import { Link } from 'react-router-dom'
import { ArrowRight, AudioLines, BookOpen, Check, ChevronRight, FlaskConical, LibraryBig, Sparkles, TimerReset } from 'lucide-react'
import type { ReactNode } from 'react'
import { lessons, modules, songCases } from '../data/catalog'
import { useLearning } from '../state/LearningContext'
import { analyzeChordInKey } from '../theory'
import { useMemo } from 'react'

function HomePage() {
  const learning = useLearning()
  const current = lessons.find((l) => l.id === learning.lastLesson) ?? lessons[0]
  const progress = Math.round((learning.completed.length / lessons.length) * 100)
  const featuredSong = useMemo(() => songCases[Math.floor(Math.random() * songCases.length)], [])
  return (
    <>
      <section className="hero"><div className="hero-inner">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={15} /> 从听见，到看懂，再到弹出来</div>
          <h1>不再死记指型，<br /><em>真正理解</em>吉他背后的音乐规律</h1>
          <p>把音符、音程、和弦与音阶放回真实指板。沿着系统课程学习，用交互实验验证，再把规律用进一首歌。</p>
          <div className="button-row"><Link className="button primary" to="/courses/sound-basics">开始系统学习 <ArrowRight size={18} /></Link><Link className="button secondary" to="/practice">测试当前水平</Link></div>
          <div className="hero-proof"><span><Check /> 确定性乐理规则</span><span><Check /> 边学边练</span><span><Check /> 游客进度本地保存</span></div>
        </div>
        <div className="hero-visual" aria-label="吉他指板音程示意">
          <div className="visual-top"><span>C 大调 · 和弦视图</span><span className="live-dot">正在演示</span></div>
          <div className="mini-neck">
            {['E', 'B', 'G', 'D', 'A', 'E'].map((s, i) => <div className="mini-string" key={i}><span>{s}</span>{[0, 1, 2, 3, 4, 5].map((f) => <i key={f} className={(i + f) % 5 === 0 ? 'note root-note' : (i * 2 + f) % 4 === 0 ? 'note chord-note' : ''}>{(i + f) % 5 === 0 ? '1' : (i * 2 + f) % 4 === 0 ? ['3', '5'][f % 2] : ''}</i>)}</div>)}
          </div>
          <div className="visual-caption"><div><span className="chord-big">C</span><span>C · E · G</span></div><p>大三和弦为什么听起来稳定？<br />从 <b>1–3–5</b> 的距离开始理解。</p></div>
        </div>
      </div></section>

      <section className="section continue-section"><div className="section-heading"><div><span className="overline">你的学习路径</span><h2>继续上一次的进度</h2></div><Link to="/learning">查看学习概览 <ArrowRight /></Link></div>
        <div className="continue-card"><div className="continue-icon"><BookOpen /></div><div className="continue-info"><span>模块 {modules.find((m) => m.id === current.moduleId)?.index} · {modules.find((m) => m.id === current.moduleId)?.title}</span><h3>{current.title}</h3><p>{current.summary}</p><div className="progress-line"><i style={{ width: `${progress}%` }} /></div><small>全路线已完成 {progress}% · {learning.completed.length}/{lessons.length} 课</small></div><Link className="button primary compact" to={`/courses/${current.slug}`}>继续学习 <ChevronRight /></Link></div>
      </section>

      <section className="section"><div className="section-heading"><div><span className="overline">三种方式，一条闭环</span><h2>今天想从哪里开始？</h2></div></div>
        <div className="entry-grid">
          <EntryCard icon={<LibraryBig />} number="01" title="系统课程" text="沿着清晰路径，从十二个音到能分析和弦进行。" link="/courses" action="查看学习路线" tone="green" />
          <EntryCard icon={<FlaskConical />} number="02" title="指板探索" text="切换音名、级数和音程，让抽象公式在琴颈上亮起来。" link="/lab" action="打开乐理实验室" tone="ochre" />
          <EntryCard icon={<AudioLines />} number="03" title="导入歌曲分析" text="在浏览器本地播放音频，编辑和弦时间轴并生成级数分析。" link="/transcribe" action="进入辅助扒谱" tone="blue" />
        </div>
      </section>

      <section className="section split-section">
        <div className="panel daily-panel">
          <div className="panel-title">
            <div><span className="overline">今日复习</span><h2>让记忆再牢一点</h2></div>
            <span className="round-icon"><TimerReset /></span>
          </div>
          <div className="review-ring">
            <div className="ring"><b>{Math.min(learning.attempts.length, 8)}</b><span>/ 8</span></div>
            <div><h3>{learning.attempts.length ? '保持手感，完成今日小练习' : '从 8 道基础题开始'}</h3><p>预计 4 分钟 · 根据最近答题动态抽取</p></div>
          </div>
          <Link to="/practice" className="text-link">开始今日复习 <ArrowRight /></Link>
        </div>
        <div className="panel song-panel">
          <div className="panel-title"><div><span className="overline">歌曲中的乐理</span><h2>一组熟悉的四和弦</h2></div><span className="tag">{featuredSong.key + (featuredSong.mode === 'major' ? ' 大调' : ' 小调')}</span></div>
          <div className="chord-flow">{featuredSong.chords.slice(0, 4).map((c) => { try { return <div key={c}><b>{c}</b><span>{analyzeChordInKey(c, featuredSong.key, featuredSong.mode).degree}</span></div> } catch { return <div key={c}><b>{c}</b></div> } })}</div>
          <p>从稳定出发，制造张力，再用共同音顺滑回归。点击查看每个和弦在指板上的构成。</p>
          <Link to={`/songs/${featuredSong.id}`} className="text-link">分析《{featuredSong.title}》 <ArrowRight /></Link>
        </div>
      </section>
    </>
  )
}

function EntryCard({ icon, number, title, text, link, action, tone }: { icon: ReactNode; number: string; title: string; text: string; link: string; action: string; tone: string }) {
  return <Link className={`entry-card ${tone}`} to={link}><div className="entry-top"><span className="entry-icon">{icon}</span><span>{number}</span></div><h3>{title}</h3><p>{text}</p><span className="card-action">{action} <ArrowRight /></span></Link>
}

export default HomePage
