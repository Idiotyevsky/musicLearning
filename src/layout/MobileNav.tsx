import { NavLink } from 'react-router-dom'
import { AudioLines, BookOpen, CircleUserRound, Music2, Target } from 'lucide-react'

function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/"><Music2 /><span>首页</span></NavLink>
      <NavLink to="/courses"><BookOpen /><span>课程</span></NavLink>
      <NavLink to="/practice"><Target /><span>练习</span></NavLink>
      <NavLink to="/songs"><AudioLines /><span>分析</span></NavLink>
      <NavLink to="/learning"><CircleUserRound /><span>我的</span></NavLink>
    </nav>
  )
}

export default MobileNav
