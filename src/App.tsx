import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, AudioLines, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight,
  FlaskConical, Guitar, LibraryBig, Music2, Pause, Play, Plus, RotateCcw, Save,
  Sparkles, Trash2, Upload, Volume2, WandSparkles, X,
} from 'lucide-react'
import { exercises, lessons, modules, songCases } from './data/catalog'
import { getKnowledgeForLesson } from './data/knowledge'
import { useLearning } from './state/LearningContext'
import { Fretboard, playPitch } from './components/Fretboard'
import InlineQuiz from './components/InlineQuiz'
import {
  analyzeChordInKey, describeChord, getCapoOptions, getChordNotes, getDiatonicChords, getInterval,
  getScaleNotes, guessKeyFromChords, noteToPitchClass, SCALE_LABELS, SCALE_PATTERNS, transposeChord,
  type ScaleType,
} from './theory'
import Header from './layout/Header'
import MobileNav from './layout/MobileNav'
import Footer from './layout/Footer'
import { NotFound } from './layout/PageShell'
import HomePage from './pages/HomePage'
import CoursesPage from './pages/CoursesPage'
import PracticePage from './pages/PracticePage'
import LearningPage from './pages/LearningPage'
import ToolsPage from './pages/ToolsPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <Routes>
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
        </Routes>
      </main>
      <MobileNav />
      <Footer />
    </div>
  )
}

// === Pages kept inline due to tight coupling with theory/interaction ===

function LessonPage() {
  const { slug } = useParams(); const navigate = useNavigate(); const learning = useLearning()
  const lesson = lessons.find((l) => l.slug === slug)
  const [activeSection, setActiveSection] = useState(0)
  const [saved, setSaved] = useState(false)
  useEffect(() => { if (lesson) learning.setLastLesson(lesson.id); setActiveSection(0) }, [lesson?.id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (lesson?.prerequisite && !learning.completed.includes(lesson.prerequisite)) navigate('/courses') }, [lesson?.id])
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
  return (
    <div className="lesson-page">
      <aside className="lesson-outline"><Link to="/courses" className="back-link"><ChevronLeft /> 课程目录</Link><div className="outline-title"><span>模块 {module.index}</span><b>{module.title}</b></div>{moduleLessons.map((l, i) => <Link className={l.id === lesson.id ? 'active' : ''} to={`/courses/${l.slug}`} key={l.id}><span>{learning.completed.includes(l.id) ? <Check /> : i + 1}</span>{l.title}</Link>)}</aside>
      <article className="lesson-article"><div className="lesson-breadcrumb">课程 / {module.title} / {lesson.title}</div><div className="lesson-title"><div><span className="lesson-kicker">微课程 · {lesson.minutes} 分钟</span><h1>{lesson.title}</h1><p>{lesson.summary}</p></div><button className={`icon-button bookmark ${learning.bookmarks.includes(lesson.id) ? 'active' : ''}`} aria-label="收藏课程" onClick={() => { learning.toggleBookmark(lesson.id); setSaved(!saved) }}><Bookmark /></button></div>
        <div className="lesson-stepper" aria-label="课程步骤">{lessonSteps.map((step, index) => <button key={step.label} className={activeSection === index ? 'active' : activeSection > index ? 'done' : ''} onClick={() => setActiveSection(index)}><span>{activeSection > index ? <Check /> : index + 1}</span><b>{step.label}</b></button>)}</div>
        <div className="lesson-step-progress"><i style={{ width: `${((activeSection + 1) / lessonSteps.length) * 100}%` }} /><span>{activeSection + 1} / {lessonSteps.length}</span></div>
        <div className="lesson-step-content" key={`${lesson.id}-${activeSection}`}>{lessonSteps[activeSection].content}</div>
        <div className="lesson-actions step-actions"><button className="button secondary" onClick={() => activeSection === 0 ? navigate('/courses') : setActiveSection((value) => value - 1)}><ChevronLeft /> {activeSection === 0 ? '返回目录' : '上一步'}</button>{activeSection < lessonSteps.length - 1 ? <button className="button primary" onClick={() => setActiveSection((value) => value + 1)}>下一步：{lessonSteps[activeSection + 1].label} <ArrowRight /></button> : <button className="button primary" onClick={() => { learning.completeLesson(lesson.id); if (next) navigate(`/courses/${next.slug}`); else navigate('/courses') }}>{learning.completed.includes(lesson.id) ? '继续下一课' : '完成并继续'} <ArrowRight /></button>}</div>
      </article>
      <aside className="lesson-notes"><div className="side-card sticky"><span className="overline">本课速记</span><b className="side-formula">{lesson.formula}</b><hr /><span className="overline">学习目标</span><p>{lesson.objective}</p>{lesson.prerequisite && <><span className="overline">前置知识</span><Link to={`/courses/${lessons.find((l) => l.id === lesson.prerequisite)?.slug}`} className="prereq"><Check /> {lessons.find((l) => l.id === lesson.prerequisite)?.title}</Link></>}<span className="overline">常见误区</span>{lesson.mistakes.map((m) => <p className="mistake" key={m}>× {m}</p>)}</div></aside>
    </div>
  )
}

function LabPage() {
  const [params, setParams] = useSearchParams(); const tab = params.get('tab') ?? 'fretboard'
  const tabs = [['fretboard', '交互指板'], ['scale', '音阶生成器'], ['chord', '和弦拆解'], ['interval', '音程实验'], ['progression', '和弦进行'], ['circle', '五度圈']]
  const [root, setRoot] = useState('C'); const [scale, setScale] = useState<ScaleType>('major'); const [chord, setChord] = useState('Cmaj7'); const [from, setFrom] = useState('C'); const [to, setTo] = useState('E'); const [progKey, setProgKey] = useState('C')
  let chordData; try { chordData = describeChord(chord) } catch { chordData = null }
  const activeNotes = tab === 'chord' && chordData ? chordData.notes : getScaleNotes(root, scale)
  return (
    <div className="lab-page">
      <div className="lab-top"><div><span className="overline">乐理实验室</span><h1>把公式放到指板上</h1></div><div className="lab-tabs">{tabs.map(([id, label]) => <button className={tab === id ? 'active' : ''} onClick={() => setParams({ tab: id })} key={id}>{label}</button>)}</div></div>
      <div className="lab-workspace">
        <aside className="lab-controls">
          <span className="overline">参数面板</span>
          {['fretboard', 'scale'].includes(tab) && <><label>主音<select value={root} onChange={(e) => setRoot(e.target.value)}>{['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'].map((n) => <option key={n}>{n}</option>)}</select></label><label>音阶类型<select value={scale} onChange={(e) => setScale(e.target.value as ScaleType)}>{Object.entries(SCALE_LABELS).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label><div className="formula-mini"><span>音程结构</span><b>{SCALE_PATTERNS[scale].map((n) => n === 0 ? '1' : n).join(' · ')}</b></div></>}
          {tab === 'chord' && <><label>和弦符号<input value={chord} onChange={(e) => setChord(e.target.value)} placeholder="例如 Cmaj7" /></label><div className="quick-chords">{['C', 'Cm', 'C7', 'Cmaj7', 'Cm7', 'Csus4'].map((c) => <button key={c} onClick={() => setChord(c)}>{c}</button>)}</div>{!chordData && <p className="field-error">请输入受支持的常见三和弦、七和弦或 sus/add9。</p>}</>}
          {tab === 'interval' && <><label>起点<select value={from} onChange={(e) => setFrom(e.target.value)}>{['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label><label>终点<select value={to} onChange={(e) => setTo(e.target.value)}>{['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label></>}
          {tab === 'progression' && <><label>调性<select value={progKey} onChange={(e) => setProgKey(e.target.value)}><option value="C">C 大调</option><option value="G">G 大调</option><option value="D">D 大调</option><option value="A">A 大调</option><option value="E">E 大调</option><option value="F">F 大调</option></select></label><div className="formula-mini"><span>当前进行</span><b>I · V · vi · IV</b></div><p className="muted">在画布中点击和弦试听，观察每个和弦的功能与共同音。</p></>}
          {tab === 'circle' && <p className="muted">点击圆环中的调，查看对应调号、关系小调与调内和弦。</p>}
        </aside>
        <section className="lab-canvas">
          {['fretboard', 'scale'].includes(tab) && <><div className="canvas-heading"><div><span>{root} · {SCALE_LABELS[scale]}</span><h2>{getScaleNotes(root, scale).join(' · ')}</h2></div><button className="button secondary compact" onClick={() => getScaleNotes(root, scale).forEach((n, i) => setTimeout(() => playPitch(noteToPitchClass(n)), i * 320))}><Play /> 播放音阶</button></div><Fretboard root={root} scaleType={scale} /></>}
          {tab === 'chord' && chordData && <><div className="canvas-heading"><div><span>{chordData.name}</span><h2>{chordData.symbol} <em>{chordData.notes.join(' · ')}</em></h2></div><button className="button secondary compact" onClick={() => chordData?.notes.forEach((n) => playPitch(noteToPitchClass(n), 4, 1.2))}><Play /> 播放和弦</button></div><div className="chord-structure">{chordData.notes.map((n, i) => <div key={n} className={i === 0 ? 'root' : ''}><b>{n}</b><span>{['根音', '三音', '五音', '七音', '九音'][i]}</span><small>+{chordData?.intervals[i]} 半音</small></div>)}</div><Fretboard root={chordData.root} notes={chordData.notes} /></>}
          {tab === 'interval' && <div className="interval-canvas"><span className="overline">音程结果</span><div className="interval-result"><button onClick={() => playPitch(noteToPitchClass(from))}>{from}<Play /></button><div><span>{getInterval(from, to).semitones} 个半音</span><i style={{ '--steps': getInterval(from, to).semitones } as React.CSSProperties} /><b>{getInterval(from, to).name}</b></div><button onClick={() => playPitch(noteToPitchClass(to))}>{to}<Play /></button></div><Fretboard root={from} notes={[from, to]} /></div>}
          {tab === 'progression' && (() => { const chords = getDiatonicChords(progKey); const progression = [chords[0], chords[4], chords[5], chords[3]]; return <><div className="canvas-heading"><div><span>{progKey} 大调 · 四和弦循环</span><h2>I – V – vi – IV</h2></div></div><div className="progression-large">{progression.map((c) => <button key={c.symbol} onClick={() => getChordNotes(c.symbol).forEach((n) => playPitch(noteToPitchClass(n), 4, 1))}><span>{c.roman}</span><b>{c.symbol}</b><small>{c.function}</small><Play /></button>)}</div><Fretboard root={progKey} notes={getChordNotes(progression[0].symbol)} /></> })()}
          {tab === 'circle' && (() => { const outer = ['C','G','D','A','E','B','F♯','D♭','A♭','E♭','B♭','F']; const inner = ['Am','Em','Bm','F♯m','C♯m','G♯m','D♯m','B♭m','Fm','Cm','Gm','Dm']; const [selected, setSelected] = useState('C'); return <div className="circle-wrap"><div className="circle-of-fifths">{outer.map((key, i) => { const angle = i * 30 - 90; return <button className={selected === key ? 'active' : ''} onClick={() => setSelected(key)} key={key} style={{ transform: `rotate(${angle}deg) translate(150px) rotate(${-angle}deg)` }}><b>{key}</b><small>{inner[i]}</small></button> })}<div className="circle-center"><span>当前调</span><b>{selected}</b><small>{getScaleNotes(selected, 'major').join(' · ')}</small></div></div></div> })()}
        </section>
        <aside className="lab-inspector"><span className="overline">为什么？</span><h3>{tab === 'chord' ? '和弦由音程叠成' : tab === 'interval' ? '先数度数，再数半音' : '从根音看每个音的角色'}</h3><p>{tab === 'chord' ? '三音决定大、小色彩；五音提供稳定骨架；七音进一步定义张力方向。' : tab === 'interval' ? '完整音程名需要同时满足音名字母距离和实际半音距离。' : '同一个绝对音在不同调里会承担不同级数。切换主音，观察指板上的音点如何重新获得意义。'}</p><div className="tip"><Sparkles />点击任意亮点可试听。颜色不是唯一提示，根音同时使用更粗边框标记。</div></aside>
      </div>
    </div>
  )
}

function SongsPage() { return (
  <div>
    <section className="page-hero"><div><span className="eyebrow">歌曲分析</span><h1>在真实进行里，看见乐理的作用</h1><p>案例全部使用原创材料。先看级数与功能，再尝试移调、变调夹和指板映射。</p></div></section>
    <div className="page-content">
      <div className="song-actions"><Link className="action-banner green" to="/songs/morning-road"><LibraryBig /><div><span>浏览歌曲分析库</span><b>从 5 个原创案例开始</b></div><ArrowRight /></Link><Link className="action-banner ochre" to="/transcribe"><Upload /><div><span>导入自己的歌曲</span><b>建立可编辑扒谱草稿</b></div><ArrowRight /></Link></div>
      <div className="section-heading compact-heading"><div><span className="overline">推荐案例</span><h2>从常见进行开始听</h2></div></div>
      <div className="song-grid">{songCases.map((song) => <Link to={`/songs/${song.id}`} className="song-card" key={song.id}><div className="song-art"><Music2 /><span>{song.meter}</span></div><div><span className="tag">{song.key} {song.mode === 'major' ? '大调' : '小调'}</span><h3>{song.title}</h3><p>{song.artist} · {song.tempo} BPM</p><div className="mini-chords">{song.chords.slice(0, 4).map((c) => <i key={c}>{c}</i>)}</div><small>{song.summary}</small></div><ArrowRight /></Link>)}</div>
    </div>
  </div>
)}

function SongDetailPage() {
  const { id } = useParams(); const song = songCases.find((s) => s.id === id); const [shift, setShift] = useState(0)
  if (!song) return <NotFound />
  const chords = song.chords.map((c) => transposeChord(c, shift)); const tonic = shift ? transposeChord(song.key, shift) : song.key
  return (
    <div>
      <section className="page-hero"><div><span className="eyebrow">歌曲案例</span><h1>{song.title}</h1><p>{song.artist} · {song.tempo} BPM · {song.meter}</p></div></section>
      <div className="page-content">
        <div className="song-detail">
          <section>
            <div className="song-analysis-head"><div><span className="tag">原创教学案例</span><h2>{tonic} {song.mode === 'major' ? '大调' : '小调'}</h2><p>{song.summary}</p></div><label>移调 <select value={shift} onChange={(e) => setShift(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => <option value={i} key={i}>+{i} 半音</option>)}</select></label></div>
            <div className="timeline">{chords.map((chord, i) => { const analysis = analyzeChordInKey(chord, tonic, song.mode); return <button key={`${chord}-${i}`} onClick={() => getChordNotes(chord).forEach((n) => playPitch(noteToPitchClass(n), 4, 1))}><span>第 {i + 1} 小节</span><b>{chord}</b><em>{analysis.degree}</em><small>{analysis.function}</small></button> })}</div>
            <div className="analysis-copy"><h3>这组进行为什么成立？</h3><p>先从主功能建立中心，再通过属功能制造回归需求。共同音让和弦之间的连接保持连贯，而低音根音勾勒出清楚的方向。</p></div>
            <Fretboard root={tonic} notes={getScaleNotes(tonic, song.mode === 'major' ? 'major' : 'naturalMinor')} />
          </section>
          <aside>
            <div className="side-card"><span className="overline">变调夹建议</span>{getCapoOptions(tonic).slice(0, 3).map((item) => <div className="capo-row" key={item.shape}><b>{item.fret === 0 ? '不夹' : `${item.fret} 品`}</b><span>使用 {item.shape} 指型</span></div>)}</div>
            <div className="side-card warm"><BookOpen /><h3>关联课程</h3><Link to="/courses/major-scale">从公式生成大调音阶</Link><Link to="/courses/interval-distance">音程：两个音的距离</Link></div>
          </aside>
        </div>
      </div>
    </div>
  )
}

type ChordEvent = { id: string; start: number; end: number; chord: string; confidence: number }

function analyzeSafe(chord: string, key: string) { try { return analyzeChordInKey(chord, key).degree } catch { return '?' } }
function formatTime(seconds: number) { const min = Math.floor(seconds / 60); return `${min}:${Math.floor(seconds % 60).toString().padStart(2, '0')}` }
function estimateBpm(buffer: AudioBuffer) { const data = buffer.getChannelData(0); const sampleRate = buffer.sampleRate; const hop = Math.floor(sampleRate * .02); const energy: number[] = []; for (let i = 0; i + hop < data.length; i += hop) { let sum = 0; for (let j = i; j < i + hop; j += 8) sum += data[j] * data[j]; energy.push(sum) } const onset = energy.map((v, i) => Math.max(0, v - (energy[i - 1] ?? v))); let bestLag = 25, best = -Infinity; for (let lag = 17; lag <= 50; lag++) { let score = 0; for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag]; if (score > best) { best = score; bestLag = lag } } const raw = 60 / (bestLag * .02); return Math.round(raw < 70 ? raw * 2 : raw > 180 ? raw / 2 : raw) }

function TranscriptionPage() {
  const audioRef = useRef<HTMLAudioElement>(null); const [audioUrl, setAudioUrl] = useState(''); const [fileName, setFileName] = useState('未命名扒谱项目'); const [duration, setDuration] = useState(0); const [time, setTime] = useState(0); const [playing, setPlaying] = useState(false); const [bpm, setBpm] = useState<number | null>(null); const [detecting, setDetecting] = useState(false); const [events, setEvents] = useState<ChordEvent[]>([]); const [key, setKey] = useState('C'); const [rights, setRights] = useState(false); const [transTab, setTransTab] = useState('chord_sheet'); const [peaks, setPeaks] = useState<number[]>(Array.from({ length: 96 }, () => 0))
  const candidates = events.length ? guessKeyFromChords(events.map((e) => e.chord)) : []
  const importAudio = async (file: File) => { if (!rights) return alert('请先确认你拥有该音频的合法使用权。'); if (file.size > 20 * 1024 * 1024) return alert('MVP 限制：音频不能超过 20 MB。'); if (audioUrl) URL.revokeObjectURL(audioUrl); const url = URL.createObjectURL(file); setAudioUrl(url); setFileName(file.name.replace(/\.[^.]+$/, '')); const buffer = await file.arrayBuffer(); const ctx = new AudioContext(); const decoded = await ctx.decodeAudioData(buffer); setDuration(decoded.duration); const channel = decoded.getChannelData(0); const step = Math.max(1, Math.floor(channel.length / 96)); setPeaks(Array.from({ length: 96 }, (_, i) => { const start = i * step; const end = Math.min(channel.length, (i + 1) * step); let peak = 0; for (let j = start; j < end; j++) { const abs = Math.abs(channel[j]); if (abs > peak) peak = abs; } return Math.max(8, Math.min(100, Math.round(peak * 150))) })); setDetecting(true); setTimeout(() => { setBpm(estimateBpm(decoded)); setDetecting(false); }, 50); await ctx.close() }
  const addEvent = () => { const start = Math.floor(time); setEvents((e) => [...e, { id: crypto.randomUUID(), start, end: Math.min(start + 4, duration || start + 4), chord: 'C', confidence: 1 }].sort((a, b) => a.start - b.start)) }
  const save = () => { localStorage.setItem('string-theory-project', JSON.stringify({ fileName, duration, bpm, key, events, updatedAt: new Date().toISOString() })); alert('项目分析数据已保存在此浏览器。原始音频不会被保存或上传。') }
  const restore = () => { const raw = localStorage.getItem('string-theory-project'); if (!raw) return; const data = JSON.parse(raw); setFileName(data.fileName); setDuration(data.duration); setBpm(data.bpm); setKey(data.key); setEvents(data.events) }
  const exportJson = () => { const blob = new Blob([JSON.stringify({ title: fileName, duration, bpm, key, chordEvents: events }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${fileName}.json`; a.click(); URL.revokeObjectURL(a.href) }
  return <div className="transcription-page"><div className="workbench-head"><div><span className="eyebrow"><WandSparkles /> 辅助扒谱工作台 · 结果需人工确认</span><input className="project-title" value={fileName} onChange={(e) => setFileName(e.target.value)} aria-label="项目名称" /></div><div className="workbench-actions"><button className="button secondary compact" onClick={restore}><RotateCcw /> 打开上次</button><button className="button secondary compact" onClick={save}><Save /> 保存</button><button className="button primary compact" onClick={exportJson}>导出 JSON</button></div></div>
    {!audioUrl && <div className="upload-stage"><div className="upload-icon"><Upload /></div><h1>把一首歌放到时间轴上</h1><p>音频只在你的浏览器中解码。MVP 不上传原始文件，检测结果是辅助草稿，支持逐项修正。</p><label className="rights-check"><input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} /> 我确认拥有该音频的合法使用权</label><label className={`button primary ${!rights ? 'disabled' : ''}`}>选择 MP3 或 WAV<input hidden disabled={!rights} type="file" accept="audio/mpeg,audio/wav,audio/*" onChange={(e) => e.target.files?.[0] && importAudio(e.target.files[0])} /></label><small>最大 20 MB · 最长建议 10 分钟</small></div>}
    {audioUrl && <div className="workbench"><section className="transport"><button className="play-main" onClick={() => { if (!audioRef.current) return; playing ? audioRef.current.pause() : audioRef.current.play(); setPlaying(!playing) }}>{playing ? <Pause /> : <Play />}</button><div className="time-readout"><b>{formatTime(time)}</b><span>/ {formatTime(duration)}</span></div><div className="waveform">{peaks.map((p, i) => <i key={i} style={{ height: `${p}%` }} className={(i / peaks.length) * duration <= time ? 'played' : ''} />)}<input aria-label="播放位置" type="range" min="0" max={duration || 1} step=".1" value={time} onChange={(e) => { const t = Number(e.target.value); setTime(t); if (audioRef.current) audioRef.current.currentTime = t }} /></div><audio ref={audioRef} src={audioUrl} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} /><label className="speed">速度<select onChange={(e) => { if (audioRef.current) audioRef.current.playbackRate = Number(e.target.value) }}><option value=".75">0.75×</option><option value="1" selected>1.0×</option><option value="1.25">1.25×</option></select></label></section>
      <div className="track-summary"><div><span>BPM 候选</span><b>{detecting ? '分析中…' : bpm ?? '—'}</b></div><div><span>调性候选</span><b>{candidates[0]?.tonic ?? key} 大调</b></div><div><span>时长</span><b>{formatTime(duration)}</b></div><button onClick={addEvent} className="button primary compact"><Plus /> 在播放头添加和弦</button></div>
      <div className="chord-track"><div className="track-ruler">{Array.from({ length: 9 }, (_, i) => <span style={{ left: `${i * 12.5}%` }} key={i}>{formatTime(duration * i / 8)}</span>)}</div><div className="event-lane">{events.map((event) => <div className="chord-event" key={event.id} style={{ left: `${event.start / duration * 100}%`, width: `${Math.max(5, (event.end - event.start) / duration * 100)}%` }}><input value={event.chord} onChange={(e) => setEvents((all) => all.map((v) => v.id === event.id ? { ...v, chord: e.target.value } : v))} /><span>{analyzeSafe(event.chord, key)}</span><button aria-label="删除和弦" onClick={() => setEvents((all) => all.filter((v) => v.id !== event.id))}><Trash2 /></button></div>)}</div>{!events.length && <div className="empty-track"><AudioLines /><span>播放到和弦起点，然后添加第一个和弦</span></div>}</div>
      <div className="workbench-lower"><section><div className="tabs-static">{[['chord_sheet', '和弦谱'], ['analysis', '乐理分析'], ['fretboard', '指板视图']].map(([tabId, label]) => <button key={tabId} className={transTab === tabId ? 'active' : ''} onClick={() => setTransTab(tabId)}>{label}</button>)}</div>{transTab === 'chord_sheet' ? <div className="chord-sheet">{events.length ? events.map((e, i) => <div key={e.id}><span>{i + 1}</span><b>{e.chord}</b><small>{formatTime(e.start)} – {formatTime(e.end)}</small></div>) : <p>添加和弦后，这里会形成可编辑和弦谱。</p>}</div> : transTab === 'analysis' ? <div className="chord-sheet"><p>和弦进行分析：{events.length ? events.map((e, i) => <span key={e.id}>{e.chord}{i < events.length - 1 ? ' · ' : ''}</span>) : '暂无和弦数据'}</p></div> : <div className="chord-sheet"><p>指板视图将随和弦选择展示。</p></div>}</section><aside><span className="overline">分析设置</span><label>确认调性<select value={key} onChange={(e) => setKey(e.target.value)}>{['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option value={n} key={n}>{n} 大调</option>)}</select></label><div className="tip"><Sparkles />系统只根据已输入和弦生成候选，不承诺自动识别绝对准确。</div></aside></div>
    </div>}
  </div>
}

export default App
