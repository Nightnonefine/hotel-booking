import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/pages.css'

function messageOf(error) {
  return error.response?.data?.message || 'Không kết nối được tới API. Backend đã chạy chưa?'
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const redirectTo = location.state?.from || '/admin/hotels'

  async function handleSubmit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page auth">
      <div className="container auth__inner">
        <div className="card auth__card">
          <h1>Đăng nhập</h1>
          <p className="auth__desc">Dùng email và mật khẩu đã đăng ký.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ban@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Đang kiểm tra...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="auth__switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
