import { Link } from 'react-router-dom'
import { Guitar } from 'lucide-react'

function Footer() {
  return (
    <footer>
      <div>
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark"><Guitar /></span>
          <span>弦上乐理<small>从指型到规律</small></span>
        </Link>
        <p>确定性的乐理规则，真实可迁移的吉他学习。</p>
      </div>
      <div>
        <span>学习</span>
        <Link to="/courses">系统课程</Link>
        <Link to="/practice">今日练习</Link>
        <Link to="/lab">乐理实验室</Link>
      </div>
      <div>
        <span>应用</span>
        <Link to="/songs">歌曲分析</Link>
        <Link to="/transcribe">辅助扒谱</Link>
        <Link to="/tools">常用工具</Link>
      </div>
      <div>
        <span>项目</span>
        <Link to="/admin">内容预览</Link>
        <a href="https://github.com" target="_blank" rel="noreferrer">部署文档</a>
      </div>
      <small>© 2026 弦上乐理 · 教学演示 MVP</small>
    </footer>
  )
}

export default Footer
