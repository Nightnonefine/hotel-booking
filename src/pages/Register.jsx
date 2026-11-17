import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/pages.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

function messageOf(error) {
  return error.response?.data?.message || 'Không kết nối được tới API. Backend đã chạy chưa?'
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  // Validate ngay ở client cho phản hồi nhanh; server vẫn validate lại.
  function validate() {
    const list = []
    if (!EMAIL_RE.test(form.email.trim())) list.push('Email không hợp lệ.')
    if (form.password.length < MIN_PASSWORD) list.push(`Mật khẩu phải có ít nhất ${MIN_PASSWORD} ký tự.`)
    if (form.password !== form.confirm) list.push('Mật khẩu nhập lại không khớp.')
    return list
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const clientErrors = validate()
    setErrors(clientErrors)
    if (clientErrors.length > 0) return

    setBusy(true)
    try {
      await register(form.email.trim(), form.password)
      navigate('/admin/hotels', { replace: true })
    } catch (err) {
      setErrors([messageOf(err)])
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page auth">
      <div className="container auth__inner">
        <div className="card auth__card">
          <h1>Đăng ký</h1>
          <p className="auth__desc">Tạo tài khoản bằng email và mật khẩu.</p>

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
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={`Tối thiểu ${MIN_PASSWORD} ký tự`}
              />
            </div>

            <div className="field">
              <label htmlFor="confirm">Nhập lại mật khẩu</label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            {errors.length > 0 && (
              <ul className="form-error form-error--list">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            )}

            <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>

          <p className="auth__switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
