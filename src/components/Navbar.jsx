import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/hotels', label: 'Khách sạn' },
  { to: '/about-us', label: 'Giới thiệu' },
  { to: '/admin/hotels', label: 'Quản trị', requiresAuth: true },
  { to: '/contact', label: 'Liên hệ' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__logo">AZ</span>
          <span>
            <strong>AzureStay</strong>
            <small>Đặt phòng khách sạn</small>
          </span>
        </Link>

        <nav className={`navbar__nav ${open ? 'is-open' : ''}`}>
          {links
            .filter((link) => !link.requiresAuth || user)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => 'navbar__link' + (isActive ? ' is-active' : '')}
              >
                {link.label}
              </NavLink>
            ))}

          {user ? (
            <span className="navbar__user">
              <span className="navbar__email" title={user.email}>
                {user.email}
              </span>
              <button type="button" className="btn btn--outline navbar__logout" onClick={handleLogout}>
                Đăng xuất
              </button>
            </span>
          ) : (
            <Link to="/login" className="btn btn--primary navbar__cta" onClick={() => setOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Mở menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
