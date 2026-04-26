import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="nav-logo">
          <span className="nav-logo-icon">₹</span>
          <span>FinanceTracker</span>
        </Link>
        <div className="nav-links">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/transactions"
            className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
          >
            Transactions
          </Link>
        </div>
        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="nav-user">
            <span className="nav-avatar">{user?.name?.charAt(0).toUpperCase()}</span>
            <span className="nav-name">{user?.name}</span>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: '7px 14px', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
