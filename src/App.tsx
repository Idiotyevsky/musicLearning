import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, AudioLines, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, CircleUserRound,
  Clock3, FlaskConical, Gauge, Guitar, Headphones, HeartPulse, LibraryBig, LockKeyhole, Menu, Music2,
  Pause, Play, Plus, RotateCcw, Save, Search, SlidersHorizontal, Sparkles, Target, TimerReset, Trash2,
  TrendingUp, Upload, Volume2, WandSparkles, X,
} from 'lucide-react'
import { exercises, lessons, modules, songCases, type Exercise } from './data/catalog'
import { getKnowledgeForLesson, knowledgeNodes, knowledgeSources } from './data/knowledge'
import { useLearning } from './state/LearningContext'
import { Fretboard, playPitch } from './components/Fretboard'
import {
  analyzeChordInKey, describeChord, getCapoOptions, getChordNotes, getDiatonicChords, getInterval,
  getScaleNotes, guessKeyFromChords, noteToPitchClass, SCALE_LABELS, SCALE_PATTERNS, transposeChord,
  type ScaleType,
} from './theory'

function App() {
  return <div className="app"><Header /><main><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/courses/:slug" element={<LessonPage />} />
    <Route path="/practice" element={<PracticePage />} />
    <Route path="/lab" element={<LabPage />} />
    <Route path="/songs" element={<SongsPage />} />
    <Route path="/songs/:id" element={<SongDetailPage />} />
    <Route path="/transcribe" element={<TranscriptionPage />} />
    <Route path="/tools" element={<ToolsPage />} />
    <Route path="/learning" element={<LearningPage />} />
    <Route path="/admin" element={<AdminPage />} />
    <Route path="*" element={<NotFound />} />
  </Routes></main><MobileNav /><Footer /></div>
}

function Header() {
  const [open, setOpen] = useState(false)
  const links = [
    ['/courses', '课程'], ['/practice', '练习'], ['/lab', '乐理实验室'], ['/songs', '歌曲分析'], ['/tools', '工具'], ['/learning', '我的学习'],
  ]
  return <header className="header"><div className="nav-wrap">
    <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Guitar size={22} /></span><span>弦上乐理<small>STRING THEORY</small></span></Link>
    <nav className={open ? 'desktop-nav open' : 'desktop-nav'}>{links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}</nav>
    <div className="nav-actions"><button className="icon-button search-btn" aria-label="搜索"><Search size={19} /></button><Link className="avatar" to="/learning" aria-label="我的学习"><CircleUserRound size={22} /></Link><button className="icon-button menu-btn" onClick={() => setOpen(!open)} aria-label="打开导航">{open ? <X /> : <Menu />}</button></div>
  </div></header>
}

function MobileNav() {
  return <nav className="mobile-nav">
    <NavLink to="/"><Music2 /><span>首页</span></NavLink><NavLink to="/courses"><BookOpen /><span>课程</span></NavLink>
    <NavLink to="/practice"><Target /><span>练习</span></NavLink><NavLink to="/songs"><AudioLines /><span>分析</span></NavLink>
    <NavLink to="/learning"><CircleUserRound /><span>我的</span></NavLink>
  </nav>
}

function HomePage() {
  const learning = useLearning()
  const current = lessons.find((l) => l.id === learning.lastLesson) ?? lessons[0]
  const progress = Math.round((learning.completed.length / lessons.length) * 100)
  return <>
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
      <div className="panel daily-panel"><div className="panel-title"><div><span className="overline">今日复习</span><h2>让记忆再牢一点</h2></div><span className="round-icon"><TimerReset /></span></div><div className="review-ring"><div className="ring"><b>{Math.min(learning.attempts.length, 8)}</b><span>/ 8</span></div><div><h3>{learning.attempts.length ? '保持手感，完成今日小练习' : '从 8 道基础题开始'}</h3><p>预计 4 分钟 · 根据最近答题动态抽取</p></div></div><Link to="/practice" className="text-link">开始今日复习 <ArrowRight /></Link></div>
      <div className="panel song-panel"><div className="panel-title"><div><span className="overline">歌曲中的乐理</span><h2>一组熟悉的四和弦</h2></div><span className="tag">G 大调</span></div><div className="chord-flow">{['G', 'D', 'Em', 'C'].map((c, i) => <div key={c}><b>{c}</b><span>{['I', 'V', 'vi', 'IV'][i]}</span></div>)}</div><p>从稳定出发，制造张力，再用共同音顺滑回归。点击查看每个和弦在指板上的构成。</p><Link to="/songs/morning-road" className="text-link">分析《清晨公路》 <ArrowRight /></Link></div>
    </section>
  </>
}

function EntryCard({ icon, number, title, text, link, action, tone }: { icon: ReactNode; number: string; title: string; text: string; link: string; action: string; tone: string }) {
  return <Link className={`entry-card ${tone}`} to={link}><div className="entry-top"><span className="entry-icon">{icon}</span><span>{number}</span></div><h3>{title}</h3><p>{text}</p><span className="card-action">{action} <ArrowRight /></span></Link>
}

function CoursesPage() {
  const learning = useLearning()
  const [active, setActive] = useState(modules[0].id)
  const module = modules.find((m) => m.id === active)!
  const items = lessons.filter((l) => l.moduleId === active)
  const done = learning.completed.filter((id) => items.some((l) => l.id === id)).length
  return <PageShell eyebrow="系统课程" title="从声音出发，逐步看懂整张指板" description="课程不是知识点清单。每一课都从一个真实问题开始，经过声音、公式、指板和练习，再连到下一步。">
    <div className="course-layout">
      <aside className="module-list"><div className="aside-label">学习路线 · 基础乐理</div>{modules.map((m) => <button key={m.id} onClick={() => setActive(m.id)} className={active === m.id ? 'active' : ''}><span className="module-index">{String(m.index).padStart(2, '0')}</span><span><b>{m.title}</b><small>{lessons.filter((l) => l.moduleId === m.id).length} 节微课程</small></span>{active === m.id && <ChevronRight />}</button>)}</aside>
      <section className="lesson-list"><div className="module-hero" style={{ '--module-color': module.color } as React.CSSProperties}><div><span>模块 {module.index}</span><h2>{module.title}</h2><p>{module.subtitle}</p></div><div className="module-score"><b>{done}/{items.length}</b><span>本模块完成</span></div></div>
        {items.map((lesson, i) => { const complete = learning.completed.includes(lesson.id); const current = learning.lastLesson === lesson.id; return <Link key={lesson.id} to={`/courses/${lesson.slug}`} className={`lesson-row ${current ? 'current' : ''}`}><span className={`lesson-status ${complete ? 'done' : current ? 'doing' : ''}`}>{complete ? <Check /> : current ? <Play /> : i + 1}</span><span className="lesson-main"><small>{lesson.minutes} 分钟 · 微课程</small><b>{lesson.title}</b><em>{lesson.summary}</em></span><span className="lesson-mastery"><small>掌握度</small><b>{learning.masteryFor(lesson.id)}%</b></span><ChevronRight /></Link> })}
      </section>
      <aside className="course-side"><div className="side-card"><span className="overline">本周学习</span><div className="big-stat">{learning.completed.length}<small>节已完成</small></div><div className="mini-bars">{[32, 58, 42, 78, 54, 88, 65].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><Link to="/learning">查看掌握情况 <ArrowRight /></Link></div><div className="side-card warm"><Target /><h3>别只看完课程</h3><p>掌握度来自练习表现。完成课程后，立刻用 3–4 道题验证。</p><Link to="/practice">去练习</Link></div></aside>
    </div>
  </PageShell>
}

function LessonPage() {
  const { slug } = useParams(); const navigate = useNavigate(); const learning = useLearning()
  const lesson = lessons.find((l) => l.slug === slug)
  const [activeSection, setActiveSection] = useState(0)
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (lesson) learning.setLastLesson(lesson.id); setActiveSection(0) }, [lesson?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!lesson) return <NotFound />
  const module = modules.find((m) => m.id === lesson.moduleId)!
  const moduleLessons = lessons.filter((l) => l.moduleId === lesson.moduleId)
  const globalIndex = lessons.indexOf(lesson)
  const next = lessons[globalIndex + 1]
  const highlighted = lesson.moduleId === 'scale' ? getScaleNotes(lesson.id === 'minor-scale' || lesson.id === 'pentatonic' ? 'A' : 'C', lesson.id === 'pentatonic' ? 'minorPentatonic' : lesson.id === 'minor-scale' ? 'naturalMinor' : 'major') : lesson.moduleId === 'interval' ? ['C', 'E', 'G'] : [lesson.moduleId === 'fretboard' ? 'E' : 'C']
  const root = lesson.moduleId === 'scale' && lesson.id !== 'major-scale' ? 'A' : lesson.moduleId === 'fretboard' ? 'E' : 'C'
  const research = getKnowledgeForLesson(lesson.id)
  const lessonSteps: { label: string; content: ReactNode }[] = [
    { label: '核心问题', content: <div className="question-card step-card"><span>本课核心问题</span><h2>{lesson.coreQuestion}</h2><p>先不用急着记答案。带着这个问题完成后面的声音、解释与指板验证。</p></div> },
    { label: '声音演示', content: <section className="step-panel"><span className="overline">先听，再解释</span><h2>比较两个声音之间的关系</h2><p>先播放根音，再播放它上方的参照音。声音只是入口，下一步会用公式说明你听到的距离。</p><div className="sound-buttons"><button className="button primary" onClick={() => playPitch(noteToPitchClass(root))}><Volume2 /> 播放根音 {root}</button><button className="button secondary" onClick={() => { playPitch(noteToPitchClass(root)); setTimeout(() => playPitch((noteToPitchClass(root) + 7) % 12), 500) }}><Play /> 播放根音与纯五度</button></div><div className="formula-card"><span>本课公式</span><b>{lesson.formula}</b></div></section> },
    { label: '乐理解释', content: <section className="step-panel"><span className="overline">从规律推导</span><h2>{lesson.sections[0].title}</h2><p>{lesson.sections[0].content}</p><div className="formula-card"><span>核心公式</span><b>{lesson.formula}</b></div></section> },
    { label: '指板验证', content: <section className="step-panel content-wide"><span className="overline">把抽象关系放回吉他</span><h2>在指板上验证</h2><p>{lesson.sections[2].content}</p><Fretboard root={root} notes={highlighted} compact /></section> },
    { label: '吉他案例', content: <section className="step-panel"><span className="overline">真实应用</span><h2>{lesson.sections[1].title}</h2><p>{lesson.sections[1].content}</p><div className="application-callout"><Guitar /><div><b>练琴时这样做</b><span>先说出根音与关系，再弹形状；换一个起点重复推导，确认自己理解的是规律而不是位置。</span></div></div></section> },
    { label: '即时练习', content: <section className="step-panel content-wide"><span className="overline">用答案验证理解</span><h2>马上检验</h2><InlineQuiz lessonId={lesson.id} exercises={exercises.filter((e) => e.lessonId === lesson.id).slice(0, 3)} /></section> },
    { label: '知识依据', content: <section className="step-panel content-wide"><span className="overline">可追溯知识库</span><h2>本课知识依据</h2><p>正文根据下列教学资料交叉核对后，用面向吉他学习者的中文重新编写；乐理结果同时由规则引擎验证。</p><div className="research-claims">{research.nodes.filter((node) => node.id !== 'kb.sequence.mvp').flatMap((node) => node.claims).map((claim, index) => <div key={`${claim.statement}-${index}`}><Check /><span>{claim.statement}</span></div>)}</div><div className="source-list">{research.sources.map((source, index) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id}><span>[{index + 1}]</span><div><b>{source.title}</b><small>{source.publisher} · {source.license}</small></div><ArrowRight /></a>)}</div></section> },
    { label: '本课总结', content: <section className="lesson-summary step-summary"><div><Check /></div><div><span>本课总结</span><h2>{lesson.summary}</h2><p>下一次拿起吉他时，先说出根音和关系，再让手去完成形状。</p></div></section> },
  ]
  return <div className="lesson-page">
    <aside className="lesson-outline"><Link to="/courses" className="back-link"><ChevronLeft /> 课程目录</Link><div className="outline-title"><span>模块 {module.index}</span><b>{module.title}</b></div>{moduleLessons.map((l, i) => <Link className={l.id === lesson.id ? 'active' : ''} to={`/courses/${l.slug}`} key={l.id}><span>{learning.completed.includes(l.id) ? <Check /> : i + 1}</span>{l.title}</Link>)}</aside>
    <article className="lesson-article"><div className="lesson-breadcrumb">课程 / {module.title} / {lesson.title}</div><div className="lesson-title"><div><span className="lesson-kicker">微课程 · {lesson.minutes} 分钟</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><button className={`icon-button bookmark ${learning.bookmarks.includes(lesson.id) ? 'active' : ''}`} aria-label="收藏课程" onClick={() => { learning.toggleBookmark(lesson.id); setSaved(!saved) }}><Bookmark /></button></div>
      <div className="lesson-stepper" aria-label="课程步骤">{lessonSteps.map((step, index) => <button key={step.label} className={activeSection === index ? 'active' : activeSection > index ? 'done' : ''} onClick={() => setActiveSection(index)}><span>{activeSection > index ? <Check /> : index + 1}</span><b>{step.label}</b></button>)}</div>
      <div className="lesson-step-progress"><i style={{ width: `${((activeSection + 1) / lessonSteps.length) * 100}%` }} /><span>{activeSection + 1} / {lessonSteps.length}</span></div>
      <div className="lesson-step-content" key={`${lesson.id}-${activeSection}`}>{lessonSteps[activeSection].content}</div>
      <div className="lesson-actions step-actions"><button className="button secondary" onClick={() => activeSection === 0 ? navigate('/courses') : setActiveSection((value) => value - 1)}><ChevronLeft /> {activeSection === 0 ? '返回目录' : '上一步'}</button>{activeSection < lessonSteps.length - 1 ? <button className="button primary" onClick={() => setActiveSection((value) => value + 1)}>下一步：{lessonSteps[activeSection + 1].label} <ArrowRight /></button> : <button className="button primary" onClick={() => { learning.completeLesson(lesson.id); if (next) navigate(`/courses/${next.slug}`); else navigate('/courses') }}>{learning.completed.includes(lesson.id) ? '继续下一课' : '完成并继续'} <ArrowRight /></button>}</div>
    </article>
    <aside className="lesson-notes"><div className="side-card sticky"><span className="overline">本课速记</span><b className="side-formula">{lesson.formula}</b><hr /><span className="overline">学习目标</span><p>{lesson.objective}</p>{lesson.prerequisite && <><span className="overline">前置知识</span><Link to={`/courses/${lessons.find((l) => l.id === lesson.prerequisite)?.slug}`} className="prereq"><Check /> {lessons.find((l) => l.id === lesson.prerequisite)?.title}</Link></>}<span className="overline">常见误区</span>{lesson.mistakes.map((m) => <p className="mistake" key={m}>× {m}</p>)}</div></aside>
  </div>
}

function InlineQuiz({ lessonId, exercises: items }: { lessonId: string; exercises: Exercise[] }) {
  const learning = useLearning(); const [index, setIndex] = useState(0); const [chosen, setChosen] = useState<number | null>(null); const [submitted, setSubmitted] = useState(false)
  const item = items[index]; if (!item) return null
  const isCorrect = chosen === item.answer
  const submit = () => { if (chosen === null) return; setSubmitted(true); learning.recordAttempt({ exerciseId: item.id, lessonId, correct: isCorrect }) }
  const next = () => { setIndex((index + 1) % items.length); setChosen(null); setSubmitted(false) }
  return <div className="inline-quiz"><div className="quiz-meta"><span>第 {index + 1}/{items.length} 题</span><div className="quiz-dots">{items.map((_, i) => <i className={i <= index ? 'active' : ''} key={i} />)}</div></div><h3>{item.prompt}</h3><div className="option-grid">{item.options.map((option, i) => <button disabled={submitted} onClick={() => setChosen(i)} className={`${chosen === i ? 'selected' : ''} ${submitted && i === item.answer ? 'correct' : ''} ${submitted && chosen === i && !isCorrect ? 'wrong' : ''}`} key={option}><span>{String.fromCharCode(65 + i)}</span>{option}{submitted && i === item.answer && <Check />}</button>)}</div>{submitted ? <div className={`explanation ${isCorrect ? 'success' : 'error'}`}><b>{isCorrect ? '回答正确，规律已经接上了。' : '还差一步，按公式重新推导。'}</b><p>{item.explanation}</p><button className="button primary compact" onClick={next}>{index === items.length - 1 ? '再练一轮' : '下一题'} <ArrowRight /></button></div> : <button className="button primary" disabled={chosen === null} onClick={submit}>提交答案</button>}</div>
}

function PracticePage() {
  const learning = useLearning(); const [scope, setScope] = useState<'today' | 'all' | 'mistakes'>('today'); const [index, setIndex] = useState(0)
  const missedIds = new Set(learning.attempts.filter((a) => !a.correct).map((a) => a.exerciseId))
  const pool = scope === 'mistakes' ? exercises.filter((e) => missedIds.has(e.id)) : scope === 'today' ? exercises.slice(0, 8) : exercises
  const items = pool.length ? pool : exercises.slice(0, 8)
  return <PageShell eyebrow="专注练习" title="每一道错题，都是下一课的路标" description="答题后在原位置查看推导，不只知道对错。最近 20 次相关练习将形成你的掌握度。">
    <div className="practice-toolbar"><div className="segmented"><button className={scope === 'today' ? 'active' : ''} onClick={() => { setScope('today'); setIndex(0) }}>今日复习</button><button className={scope === 'all' ? 'active' : ''} onClick={() => { setScope('all'); setIndex(0) }}>知识练习</button><button className={scope === 'mistakes' ? 'active' : ''} onClick={() => { setScope('mistakes'); setIndex(0) }}>错题本 <span>{missedIds.size}</span></button></div><span>{items.length} 道题 · 约 {Math.ceil(items.length / 2)} 分钟</span></div>
    <div className="practice-stage"><div className="practice-header"><span>{modules.find((m) => m.id === lessons.find((l) => l.id === items[index % items.length].lessonId)?.moduleId)?.title}</span><b>{(index % items.length) + 1} / {items.length}</b></div><InlineQuiz lessonId={items[index % items.length].lessonId} exercises={[items[index % items.length]]} /><button className="next-floating" onClick={() => setIndex((i) => (i + 1) % items.length)}><ChevronRight /></button></div>
    <div className="practice-stats"><StatCard icon={<Target />} value={`${learning.attempts.filter((a) => a.correct).length}`} label="累计答对" /><StatCard icon={<RotateCcw />} value={`${missedIds.size}`} label="待巩固错题" /><StatCard icon={<TrendingUp />} value={`${learning.attempts.length ? Math.round(learning.attempts.filter((a) => a.correct).length / learning.attempts.length * 100) : 0}%`} label="近期正确率" /></div>
  </PageShell>
}

function LabPage() {
  const [params, setParams] = useSearchParams(); const tab = params.get('tab') ?? 'fretboard'
  const tabs = [['fretboard', '交互指板'], ['scale', '音阶生成器'], ['chord', '和弦拆解'], ['interval', '音程实验'], ['progression', '和弦进行'], ['circle', '五度圈']]
  const [root, setRoot] = useState('C'); const [scale, setScale] = useState<ScaleType>('major'); const [chord, setChord] = useState('Cmaj7'); const [from, setFrom] = useState('C'); const [to, setTo] = useState('E')
  let chordData; try { chordData = describeChord(chord) } catch { chordData = null }
  const activeNotes = tab === 'chord' && chordData ? chordData.notes : getScaleNotes(root, scale)
  return <div className="lab-page"><div className="lab-top"><div><span className="overline">乐理实验室</span><h1>把公式放到指板上</h1></div><div className="lab-tabs">{tabs.map(([id, label]) => <button className={tab === id ? 'active' : ''} onClick={() => setParams({ tab: id })} key={id}>{label}</button>)}</div></div>
    <div className="lab-workspace"><aside className="lab-controls"><span className="overline">参数面板</span>{['fretboard', 'scale'].includes(tab) && <><label>主音<select value={root} onChange={(e) => setRoot(e.target.value)}>{['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'].map((n) => <option key={n}>{n}</option>)}</select></label><label>音阶类型<select value={scale} onChange={(e) => setScale(e.target.value as ScaleType)}>{Object.entries(SCALE_LABELS).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><div className="formula-mini"><span>音程结构</span><b>{SCALE_PATTERNS[scale].map((n) => n === 0 ? '1' : n).join(' · ')}</b></div></>}{tab === 'chord' && <><label>和弦符号<input value={chord} onChange={(e) => setChord(e.target.value)} placeholder="例如 Cmaj7" /></label><div className="quick-chords">{['C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'Csus4'].map((c) => <button key={c} onClick={() => setChord(c)}>{c}</button>)}</div>{!chordData && <p className="field-error">请输入受支持的常见三和弦、七和弦或 sus/add9。</p>}</>}{tab === 'interval' && <><label>起点<select value={from} onChange={(e) => setFrom(e.target.value)}>{['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label><label>终点<select value={to} onChange={(e) => setTo(e.target.value)}>{['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label></>}{tab === 'progression' && <ProgressionControls />}{tab === 'circle' && <p className="muted">点击圆环中的调，查看对应调号、关系小调与调内和弦。</p>}</aside>
      <section className="lab-canvas">{['fretboard', 'scale'].includes(tab) && <><div className="canvas-heading"><div><span>{root} · {SCALE_LABELS[scale]}</span><h2>{getScaleNotes(root, scale).join(' · ')}</h2></div><button className="button secondary compact" onClick={() => getScaleNotes(root, scale).forEach((n, i) => setTimeout(() => playPitch(noteToPitchClass(n)), i * 320))}><Play /> 播放音阶</button></div><Fretboard root={root} scaleType={scale} /></>}{tab === 'chord' && chordData && <><div className="canvas-heading"><div><span>{chordData.name}</span><h2>{chordData.symbol} <em>{chordData.notes.join(' · ')}</em></h2></div><button className="button secondary compact" onClick={() => chordData?.notes.forEach((n) => playPitch(noteToPitchClass(n), 4, 1.2))}><Play /> 播放和弦</button></div><div className="chord-structure">{chordData.notes.map((n, i) => <div key={n} className={i === 0 ? 'root' : ''}><b>{n}</b><span>{['根音', '三音', '五音', '七音', '九音'][i]}</span><small>+{chordData?.intervals[i]} 半音</small></div>)}</div><Fretboard root={chordData.root} notes={chordData.notes} /></>}{tab === 'interval' && <IntervalCanvas from={from} to={to} />}{tab === 'progression' && <ProgressionCanvas />}{tab === 'circle' && <CircleOfFifths />}</section>
      <aside className="lab-inspector"><span className="overline">为什么？</span><h3>{tab === 'chord' ? '和弦由音程叠成' : tab === 'interval' ? '先数度数，再数半音' : '从根音看每个音的角色'}</h3><p>{tab === 'chord' ? '三音决定大、小色彩；五音提供稳定骨架；七音进一步定义张力方向。' : tab === 'interval' ? '完整音程名需要同时满足音名字母距离和实际半音距离。' : '同一个绝对音在不同调里会承担不同级数。切换主音，观察指板上的音点如何重新获得意义。'}</p><div className="tip"><Sparkles />点击任意亮点可试听。颜色不是唯一提示，根音同时使用更粗边框标记。</div></aside></div>
  </div>
}

function IntervalCanvas({ from, to }: { from: string; to: string }) { const interval = getInterval(from, to); return <div className="interval-canvas"><span className="overline">音程结果</span><div className="interval-result"><button onClick={() => playPitch(noteToPitchClass(from))}>{from}<Play /></button><div><span>{interval.semitones} 个半音</span><i style={{ '--steps': interval.semitones } as React.CSSProperties} /><b>{interval.name}</b></div><button onClick={() => playPitch(noteToPitchClass(to))}>{to}<Play /></button></div><Fretboard root={from} notes={[from, to]} /></div> }

function ProgressionControls() { return <><label>调性<select><option>C 大调</option><option>G 大调</option><option>D 大调</option></select></label><div className="formula-mini"><span>当前进行</span><b>I · V · vi · IV</b></div><p className="muted">在画布中点击和弦试听，观察每个和弦的功能与共同音。</p></> }
function ProgressionCanvas() { const chords = getDiatonicChords('C'); const progression = [chords[0], chords[4], chords[5], chords[3]]; return <><div className="canvas-heading"><div><span>C 大调 · 四和弦循环</span><h2>I – V – vi – IV</h2></div></div><div className="progression-large">{progression.map((c) => <button key={c.symbol} onClick={() => getChordNotes(c.symbol).forEach((n) => playPitch(noteToPitchClass(n), 4, 1))}><span>{c.roman}</span><b>{c.symbol}</b><small>{c.function}</small><Play /></button>)}</div><Fretboard root="C" notes={getChordNotes('C')} /></> }

function CircleOfFifths() { const outer = ['C','G','D','A','E','B','F♯','D♭','A♭','E♭','B♭','F']; const inner = ['Am','Em','Bm','F♯m','C♯m','G♯m','D♯m','B♭m','Fm','Cm','Gm','Dm']; const [selected, setSelected] = useState('C'); return <div className="circle-wrap"><div className="circle-of-fifths">{outer.map((key, i) => { const angle = i * 30 - 90; return <button className={selected === key ? 'active' : ''} onClick={() => setSelected(key)} key={key} style={{ transform: `rotate(${angle}deg) translate(150px) rotate(${-angle}deg)` }}><b>{key}</b><small>{inner[i]}</small></button> })}<div className="circle-center"><span>当前调</span><b>{selected}</b><small>{getScaleNotes(selected, 'major').join(' · ')}</small></div></div></div> }

function SongsPage() { return <PageShell eyebrow="歌曲分析" title="在真实进行里，看见乐理的作用" description="案例全部使用原创材料。先看级数与功能，再尝试移调、变调夹和指板映射。"><div className="song-actions"><Link className="action-banner green" to="/songs/morning-road"><LibraryBig /><div><span>浏览歌曲分析库</span><b>从 5 个原创案例开始</b></div><ArrowRight /></Link><Link className="action-banner ochre" to="/transcribe"><Upload /><div><span>导入自己的歌曲</span><b>建立可编辑扒谱草稿</b></div><ArrowRight /></Link></div><div className="section-heading compact-heading"><div><span className="overline">推荐案例</span><h2>从常见进行开始听</h2></div></div><div className="song-grid">{songCases.map((song) => <Link to={`/songs/${song.id}`} className="song-card" key={song.id}><div className="song-art"><Music2 /><span>{song.meter}</span></div><div><span className="tag">{song.key} {song.mode === 'major' ? '大调' : '小调'}</span><h3>{song.title}</h3><p>{song.artist} · {song.tempo} BPM</p><div className="mini-chords">{song.chords.slice(0, 4).map((c) => <i key={c}>{c}</i>)}</div><small>{song.summary}</small></div><ArrowRight /></Link>)}</div></PageShell> }

function SongDetailPage() { const { id } = useParams(); const song = songCases.find((s) => s.id === id); const [shift, setShift] = useState(0); if (!song) return <NotFound />; const chords = song.chords.map((c) => transposeChord(c, shift)); const tonic = shift ? transposeChord(song.key, shift) : song.key; return <PageShell eyebrow="歌曲案例" title={song.title} description={`${song.artist} · ${song.tempo} BPM · ${song.meter}`}><div className="song-detail"><section><div className="song-analysis-head"><div><span className="tag">原创教学案例</span><h2>{tonic} {song.mode === 'major' ? '大调' : '小调'}</h2><p>{song.summary}</p></div><label>移调 <select value={shift} onChange={(e) => setShift(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option value={i} key={i}>+{i} 半音</option>)}</select></label></div><div className="timeline">{chords.map((chord, i) => { const analysis = analyzeChordInKey(chord, tonic, song.mode); return <button key={`${chord}-${i}`} onClick={() => getChordNotes(chord).forEach((n) => playPitch(noteToPitchClass(n), 4, 1))}><span>第 {i + 1} 小节</span><b>{chord}</b><em>{analysis.degree}</em><small>{analysis.function}</small></button> })}</div><div className="analysis-copy"><h3>这组进行为什么成立？</h3><p>先从主功能建立中心，再通过属功能制造回归需求。共同音让和弦之间的连接保持连贯，而低音根音勾勒出清楚的方向。</p></div><Fretboard root={tonic} notes={getScaleNotes(tonic, song.mode === 'major' ? 'major' : 'naturalMinor')} /></section><aside><div className="side-card"><span className="overline">变调夹建议</span>{getCapoOptions(tonic).slice(0, 3).map((item) => <div className="capo-row" key={item.shape}><b>{item.fret === 0 ? '不夹' : `${item.fret} 品`}</b><span>使用 {item.shape} 指型</span></div>)}</div><div className="side-card warm"><BookOpen /><h3>关联课程</h3><Link to="/courses/major-scale">从公式生成大调音阶</Link><Link to="/courses/interval-distance">音程：两个音的距离</Link></div></aside></div></PageShell> }

type ChordEvent = { id: string; start: number; end: number; chord: string; confidence: number }
function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement>(null); const [audioUrl, setAudioUrl] = useState(''); const [fileName, setFileName] = useState('未命名扒谱项目'); const [duration, setDuration] = useState(0); const [time, setTime] = useState(0); const [playing, setPlaying] = useState(false); const [bpm, setBpm] = useState<number | null>(null); const [detecting, setDetecting] = useState(false); const [events, setEvents] = useState<ChordEvent[]>([]); const [key, setKey] = useState('C'); const [rights, setRights] = useState(false); const [peaks, setPeaks] = useState<number[]>(Array.from({ length: 96 }, (_, i) => 18 + ((i * 37) % 62)))
  const candidates = events.length ? guessKeyFromChords(events.map((e) => e.chord)) : []
  const importAudio = async (file: File) => { if (!rights) return alert('请先确认你拥有该音频的合法使用权。'); if (file.size > 20 * 1024 * 1024) return alert('MVP 限制：音频不能超过 20 MB。'); if (audioUrl) URL.revokeObjectURL(audioUrl); const url = URL.createObjectURL(file); setAudioUrl(url); setFileName(file.name.replace(/\.[^.]+$/, '')); const buffer = await file.arrayBuffer(); const ctx = new AudioContext(); const decoded = await ctx.decodeAudioData(buffer.slice(0)); setDuration(decoded.duration); const channel = decoded.getChannelData(0); const step = Math.max(1, Math.floor(channel.length / 96)); setPeaks(Array.from({ length: 96 }, (_, i) => Math.max(8, Math.min(100, Math.round(Math.max(...Array.from(channel.slice(i * step, Math.min(channel.length, (i + 1) * step)), Math.abs)) * 150))))); setDetecting(true); setTimeout(() => { setBpm(estimateBpm(decoded)); setDetecting(false); }, 50); await ctx.close() }
  const addEvent = () => { const start = Math.floor(time); setEvents((e) => [...e, { id: crypto.randomUUID(), start, end: Math.min(start + 4, duration || start + 4), chord: 'C', confidence: 1 }].sort((a, b) => a.start - b.start)) }
  const save = () => { localStorage.setItem('string-theory-project', JSON.stringify({ fileName, duration, bpm, key, events, updatedAt: new Date().toISOString() })); alert('项目分析数据已保存在此浏览器。原始音频不会被保存或上传。') }
  const restore = () => { const raw = localStorage.getItem('string-theory-project'); if (!raw) return; const data = JSON.parse(raw); setFileName(data.fileName); setDuration(data.duration); setBpm(data.bpm); setKey(data.key); setEvents(data.events) }
  const exportJson = () => { const blob = new Blob([JSON.stringify({ title: fileName, duration, bpm, key, chordEvents: events }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${fileName}.json`; a.click(); URL.revokeObjectURL(a.href) }
  return <div className="transcription-page"><div className="workbench-head"><div><span className="eyebrow"><WandSparkles /> AI 辅助扒谱工作台 · 结果需人工确认</span><input className="project-title" value={fileName} onChange={(e) => setFileName(e.target.value)} aria-label="项目名称" /></div><div className="workbench-actions"><button className="button secondary compact" onClick={restore}><RotateCcw /> 打开上次</button><button className="button secondary compact" onClick={save}><Save /> 保存</button><button className="button primary compact" onClick={exportJson}>导出 JSON</button></div></div>
    {!audioUrl && <div className="upload-stage"><div className="upload-icon"><Upload /></div><h1>把一首歌放到时间轴上</h1><p>音频只在你的浏览器中解码。MVP 不上传原始文件，检测结果是辅助草稿，支持逐项修正。</p><label className="rights-check"><input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} /> 我确认拥有该音频的合法使用权</label><label className={`button primary ${!rights ? 'disabled' : ''}`}>选择 MP3 或 WAV<input hidden disabled={!rights} type="file" accept="audio/mpeg,audio/wav,audio/*" onChange={(e) => e.target.files?.[0] && importAudio(e.target.files[0])} /></label><small>最大 20 MB · 最长建议 10 分钟</small></div>}
    {audioUrl && <div className="workbench"><section className="transport"><button className="play-main" onClick={() => { if (!audioRef.current) return; playing ? audioRef.current.pause() : audioRef.current.play(); setPlaying(!playing) }}>{playing ? <Pause /> : <Play />}</button><div className="time-readout"><b>{formatTime(time)}</b><span>/ {formatTime(duration)}</span></div><div className="waveform">{peaks.map((p, i) => <i key={i} style={{ height: `${p}%` }} className={(i / peaks.length) * duration <= time ? 'played' : ''} />)}<input aria-label="播放位置" type="range" min="0" max={duration || 1} step=".1" value={time} onChange={(e) => { const t = Number(e.target.value); setTime(t); if (audioRef.current) audioRef.current.currentTime = t }} /></div><audio ref={audioRef} src={audioUrl} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} /><label className="speed">速度<select onChange={(e) => { if (audioRef.current) audioRef.current.playbackRate = Number(e.target.value) }}><option value=".75">0.75×</option><option value="1" selected>1.0×</option><option value="1.25">1.25×</option></select></label></section>
      <div className="track-summary"><div><span>BPM 候选</span><b>{detecting ? '分析中…' : bpm ?? '—'}</b></div><div><span>调性候选</span><b>{candidates[0]?.tonic ?? key} 大调</b></div><div><span>时长</span><b>{formatTime(duration)}</b></div><button onClick={addEvent} className="button primary compact"><Plus /> 在播放头添加和弦</button></div>
      <div className="chord-track"><div className="track-ruler">{Array.from({ length: 9 }, (_, i) => <span style={{ left: `${i * 12.5}%` }} key={i}>{formatTime(duration * i / 8)}</span>)}</div><div className="event-lane">{events.map((event) => <div className="chord-event" key={event.id} style={{ left: `${event.start / duration * 100}%`, width: `${Math.max(5, (event.end - event.start) / duration * 100)}%` }}><input value={event.chord} onChange={(e) => setEvents((all) => all.map((v) => v.id === event.id ? { ...v, chord: e.target.value } : v))} /><span>{analyzeSafe(event.chord, key)}</span><button aria-label="删除和弦" onClick={() => setEvents((all) => all.filter((v) => v.id !== event.id))}><Trash2 /></button></div>)}</div>{!events.length && <div className="empty-track"><AudioLines /><span>播放到和弦起点，然后添加第一个和弦</span></div>}</div>
      <div className="workbench-lower"><section><div className="tabs-static"><button className="active">和弦谱</button><button>乐理分析</button><button>指板视图</button></div><div className="chord-sheet">{events.length ? events.map((e, i) => <div key={e.id}><span>{i + 1}</span><b>{e.chord}</b><small>{formatTime(e.start)} – {formatTime(e.end)}</small></div>) : <p>添加和弦后，这里会形成可编辑和弦谱。</p>}</div></section><aside><span className="overline">分析设置</span><label>确认调性<select value={key} onChange={(e) => setKey(e.target.value)}>{['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n} 大调</option>)}</select></label><div className="tip"><Sparkles />系统只根据已输入和弦生成候选，不承诺自动识别绝对准确。</div></aside></div>
    </div>}
  </div>
}

function analyzeSafe(chord: string, key: string) { try { return analyzeChordInKey(chord, key).degree } catch { return '?' } }
function formatTime(seconds: number) { const min = Math.floor(seconds / 60); return `${min}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` }
function estimateBpm(buffer: AudioBuffer) { const data = buffer.getChannelData(0); const sampleRate = buffer.sampleRate; const hop = Math.floor(sampleRate * .02); const energy: number[] = []; for (let i = 0; i + hop < data.length; i += hop) { let sum = 0; for (let j = i; j < i + hop; j += 8) sum += data[j] * data[j]; energy.push(sum) } const onset = energy.map((v, i) => Math.max(0, v - (energy[i - 1] ?? v))); let bestLag = 25, best = -Infinity; for (let lag = 17; lag <= 50; lag++) { let score = 0; for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag]; if (score > best) { best = score; bestLag = lag } } const raw = 60 / (bestLag * .02); return Math.round(raw < 70 ? raw * 2 : raw > 180 ? raw / 2 : raw) }

function ToolsPage() { const [bpm, setBpm] = useState(92); const [running, setRunning] = useState(false); const timer = useRef<number | null>(null); const [target, setTarget] = useState('D'); useEffect(() => { if (!running) { if (timer.current) clearInterval(timer.current); return } const tick = () => playPitch(9, 5, .08); tick(); timer.current = window.setInterval(tick, 60000 / bpm); return () => { if (timer.current) clearInterval(timer.current) } }, [running, bpm]); return <PageShell eyebrow="常用工具" title="练习需要的工具，保持简单可靠" description="节拍、移调和变调夹计算都在浏览器本地完成。"><div className="tools-grid"><section className="tool-card metronome"><div className="tool-head"><TimerReset /><div><span>节拍器</span><b>稳定内在拍点</b></div></div><div className="bpm-display"><button onClick={() => setBpm(Math.max(30, bpm - 1))}>−</button><div><b>{bpm}</b><span>BPM</span></div><button onClick={() => setBpm(Math.min(240, bpm + 1))}>+</button></div><input type="range" min="30" max="240" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} /><button className="button primary" onClick={() => setRunning(!running)}>{running ? <Pause /> : <Play />} {running ? '停止' : '开始'}</button></section><section className="tool-card"><div className="tool-head"><Guitar /><div><span>变调夹计算</span><b>保留熟悉指型</b></div></div><label>目标调<select value={target} onChange={(e) => setTarget(e.target.value)}>{['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label><div className="capo-options">{getCapoOptions(target).slice(0, 4).map((o) => <div key={o.shape}><b>{o.fret ? `${o.fret} 品` : '不夹'}</b><span>{o.shape} 指型</span></div>)}</div></section><section className="tool-card"><div className="tool-head"><SlidersHorizontal /><div><span>和弦移调器</span><b>整体保持相对关系</b></div></div><ChordTransposer /></section></div></PageShell> }
function ChordTransposer() { const [input, setInput] = useState('C G Am F'); const [step, setStep] = useState(2); const output = input.split(/\s+/).map((c) => { try { return transposeChord(c, step) } catch { return '?' } }).join('  '); return <><textarea value={input} onChange={(e) => setInput(e.target.value)} aria-label="输入和弦" /><label>升高半音数 <input type="number" min="-11" max="11" value={step} onChange={(e) => setStep(Number(e.target.value))} /></label><div className="transpose-output">{output}</div></> }

function LearningPage() { const learning = useLearning(); const accuracy = learning.attempts.length ? Math.round(learning.attempts.filter((a) => a.correct).length / learning.attempts.length * 100) : 0; const recent = [...learning.attempts].reverse().slice(0, 5); return <PageShell eyebrow="我的学习" title="关注真实掌握，而不是只看打卡" description="课程完成、近期练习和错题共同组成学习概览。数据仅保存在当前浏览器。"><div className="dashboard-grid"><section className="dashboard-main"><div className="stat-grid"><StatCard icon={<BookOpen />} value={`${learning.completed.length}/${lessons.length}`} label="课程完成" /><StatCard icon={<Target />} value={`${accuracy}%`} label="练习正确率" /><StatCard icon={<RotateCcw />} value={`${new Set(learning.attempts.filter((a) => !a.correct).map((a) => a.exerciseId)).size}`} label="待复习" /><StatCard icon={<Bookmark />} value={`${learning.bookmarks.length}`} label="已收藏" /></div><div className="panel"><div className="panel-title"><div><span className="overline">能力地图</span><h2>五个基础模块</h2></div></div><div className="mastery-list">{modules.map((m) => { const ls = lessons.filter((l) => l.moduleId === m.id); const value = Math.round(ls.reduce((s, l) => s + learning.masteryFor(l.id), 0) / ls.length); return <div key={m.id}><span>{m.title}</span><div><i style={{ width: `${value}%`, background: m.color }} /></div><b>{value}%</b></div> })}</div></div><div className="panel"><div className="panel-title"><div><span className="overline">最近练习</span><h2>答题记录</h2></div><Link to="/practice">继续练习 <ArrowRight /></Link></div>{recent.length ? <div className="attempt-list">{recent.map((a, i) => <div key={`${a.at}-${i}`}><span className={a.correct ? 'attempt-ok' : 'attempt-bad'}>{a.correct ? <Check /> : <X />}</span><div><b>{lessons.find((l) => l.id === a.lessonId)?.title}</b><small>{new Date(a.at).toLocaleString('zh-CN')}</small></div><Link to={`/courses/${lessons.find((l) => l.id === a.lessonId)?.slug}`}>复习课程</Link></div>)}</div> : <EmptyState icon={<Target />} title="还没有答题记录" text="完成第一组练习后，这里会展示你的真实掌握变化。" action="开始练习" to="/practice" />}</div></section><aside className="dashboard-side"><div className="side-card warm"><span className="overline">下一步</span><h3>{lessons.find((l) => l.id === learning.lastLesson)?.title}</h3><p>{lessons.find((l) => l.id === learning.lastLesson)?.summary}</p><Link className="button primary compact" to={`/courses/${lessons.find((l) => l.id === learning.lastLesson)?.slug}`}>继续学习 <ArrowRight /></Link></div><div className="side-card"><span className="overline">本地数据说明</span><p>游客进度保存在 LocalStorage。清除浏览器数据会同步清除学习记录。</p></div></aside></div></PageShell> }

function AdminPage() { const [query, setQuery] = useState(''); const filtered = lessons.filter((l) => l.title.includes(query)); return <PageShell eyebrow="内容管理 · 本地预览" title="课程内容审核台" description="课程正文先映射检索知识库，再经过 Schema、乐理规则与人工审核。"><div className="admin-layout"><aside className="admin-nav"><button className="active"><BookOpen /> 课程管理 <span>{lessons.length}</span></button><button><LibraryBig /> 知识节点 <span>{knowledgeNodes.length}</span></button><button><Target /> 练习管理 <span>{exercises.length}</span></button><button><Music2 /> 歌曲案例 <span>{songCases.length}</span></button><button><Gauge /> 来源登记 <span>{knowledgeSources.length}</span></button></aside><section className="admin-main"><div className="admin-toolbar"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索课程" /></label><span className="validation-ok"><Check /> {knowledgeSources.length} 个来源、{knowledgeNodes.length} 个知识节点已建立追溯关系</span></div><div className="admin-table"><div className="table-row header"><span>课程</span><span>模块</span><span>依据</span><span>状态</span><span>版本</span></div>{filtered.map((lesson) => <div className="table-row" key={lesson.id}><span><b>{lesson.title}</b><small>{lesson.slug}</small></span><span>{modules.find((m) => m.id === lesson.moduleId)?.title}</span><span>{getKnowledgeForLesson(lesson.id).sources.length} 个来源</span><span><i className="status-dot" /> 已审核</span><span>v2</span></div>)}</div></section></div></PageShell> }

function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children: ReactNode }) { return <><section className="page-hero"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div></section><div className="page-content">{children}</div></> }
function StatCard({ icon, value, label }: { icon: ReactNode; value: string; label: string }) { return <div className="stat-card"><span>{icon}</span><div><b>{value}</b><small>{label}</small></div></div> }
function EmptyState({ icon, title, text, action, to }: { icon: ReactNode; title: string; text: string; action: string; to: string }) { return <div className="empty-state">{icon}<h3>{title}</h3><p>{text}</p><Link to={to} className="button secondary compact">{action}</Link></div> }
function NotFound() { return <PageShell eyebrow="404" title="这个位置还没有音符" description="页面可能已移动，回到学习路径继续吧。"><EmptyState icon={<Music2 />} title="未找到页面" text="你访问的路径不存在。" action="返回首页" to="/" /></PageShell> }
function Footer() { return <footer><div><Link className="brand footer-brand" to="/"><span className="brand-mark"><Guitar /></span><span>弦上乐理<small>从指型到规律</small></span></Link><p>确定性的乐理规则，真实可迁移的吉他学习。</p></div><div><span>学习</span><Link to="/courses">系统课程</Link><Link to="/practice">今日练习</Link><Link to="/lab">乐理实验室</Link></div><div><span>应用</span><Link to="/songs">歌曲分析</Link><Link to="/transcribe">辅助扒谱</Link><Link to="/tools">常用工具</Link></div><div><span>项目</span><Link to="/admin">内容管理</Link><a href="https://github.com" target="_blank">部署文档</a></div><small>© 2026 弦上乐理 · 教学演示 MVP</small></footer> }

export default App
