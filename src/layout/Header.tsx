import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CircleUserRound, Guitar, Menu, Search, X } from 'lucide-react'

function Header() {
  const [open, setOpen] = useState(false)
  const links: [string, string][] = [
    ['/courses', '课程'], ['/practice', '练习'], ['/lab', '乐理实验室'],
    ['/songs', '歌曲分析'], ['/tools', '工具'], ['/learning', '我的学习'],
  ]
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark"><Guitar size={22} /></span>
          <span>弦上乐理<small>STRING THEORY</small></span>
        </Link>
        <nav className={open ? 'desktop-nav open' : 'desktop-nav'}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-button search-btn" aria-label="搜索" title="搜索功能开发中" onClick={() => alert('搜索功能开发中')}>
            <Search size={19} />
          </button>
          <Link className="avatar" to="/learning" aria-label="我的学习">
            <CircleUserRound size={22} />
          </Link>
          <button className="icon-button menu-btn" onClick={() => setOpen(!open)} aria-label="打开导航">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
