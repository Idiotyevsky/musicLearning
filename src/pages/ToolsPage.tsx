import { useEffect, useRef, useState } from 'react'
import { Guitar, Pause, Play, SlidersHorizontal, TimerReset } from 'lucide-react'
import { getCapoOptions, transposeChord } from '../theory'
import { playPitch } from '../components/Fretboard'
import { PageShell } from '../layout/PageShell'

function ToolsPage() {
  const [bpm, setBpm] = useState(92)
  const [running, setRunning] = useState(false)
  const timer = useRef<number | null>(null)
  const [target, setTarget] = useState('D')
  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return }
    const tick = () => playPitch(9, 5, .08)
    tick()
    timer.current = window.setInterval(tick, 60000 / bpm)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [running, bpm])
  return (
    <PageShell eyebrow="常用工具" title="练习需要的工具，保持简单可靠" description="节拍、移调和变调夹计算都在浏览器本地完成。">
      <div className="tools-grid">
        <section className="tool-card metronome">
          <div className="tool-head"><TimerReset /><div><span>节拍器</span><b>稳定内在拍点</b></div></div>
          <div className="bpm-display">
            <button onClick={() => setBpm(Math.max(30, bpm - 1))}>−</button>
            <div><b>{bpm}</b><span>BPM</span></div>
            <button onClick={() => setBpm(Math.min(240, bpm + 1))}>+</button>
          </div>
          <input type="range" min="30" max="240" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          <button className="button primary" onClick={() => setRunning(!running)}>{running ? <Pause /> : <Play />} {running ? '停止' : '开始'}</button>
        </section>
        <section className="tool-card">
          <div className="tool-head"><Guitar /><div><span>变调夹计算</span><b>保留熟悉指型</b></div></div>
          <label>目标调<select value={target} onChange={(e) => setTarget(e.target.value)}>{['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'].map((n) => <option key={n}>{n}</option>)}</select></label>
          <div className="capo-options">{getCapoOptions(target).slice(0, 4).map((o) => <div key={o.shape}><b>{o.fret ? `${o.fret} 品` : '不夹'}</b><span>{o.shape} 指型</span></div>)}</div>
        </section>
        <section className="tool-card">
          <div className="tool-head"><SlidersHorizontal /><div><span>和弦移调器</span><b>整体保持相对关系</b></div></div>
          <ChordTransposer />
        </section>
      </div>
    </PageShell>
  )
}

function ChordTransposer() {
  const [input, setInput] = useState('C G Am F')
  const [step, setStep] = useState(2)
  const output = input.split(/\s+/).map((c) => { try { return transposeChord(c, step) } catch { return '?' } }).join('  ')
  return (
    <>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} aria-label="输入和弦" />
      <label>升高半音数 <input type="number" min="-11" max="11" value={step} onChange={(e) => setStep(Number(e.target.value))} /></label>
      <div className="transpose-output">{output}</div>
    </>
  )
}

export default ToolsPage
