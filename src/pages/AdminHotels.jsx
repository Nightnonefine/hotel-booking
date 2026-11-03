import { useEffect, useState } from 'react'
import { API_URL, hotelApi } from '../services/api.js'
import '../styles/pages.css'

const emptyForm = { name: '', city: '', address: '', pricePerNight: '', rating: '' }
const PAGE_SIZE = 5

function messageOf(error) {
  return error.response?.data?.message || error.message || 'Lỗi không xác định'
}

export default function AdminHotels() {
  const [data, setData] = useState({ total: 0, items: [] })
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load(targetPage = page) {
    setBusy(true)
    try {
      setData(await hotelApi.list({ page: targetPage, pageSize: PAGE_SIZE }))
      setError('')
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    // Form là chuỗi, API cần số -> ép kiểu tại biên.
    const payload = {
      ...form,
      pricePerNight: Number(form.pricePerNight),
      rating: Number(form.rating),
    }

    setBusy(true)
    try {
      if (editingId) await hotelApi.update(editingId, payload)
      else await hotelApi.create(payload)
      setForm(emptyForm)
      setEditingId(null)
      setPage(1)
      await load(1)
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  function startEdit(hotel) {
    setEditingId(hotel.id)
    setForm({
      name: hotel.name,
      city: hotel.city,
      address: hotel.address ?? '',
      pricePerNight: hotel.pricePerNight,
      rating: hotel.rating,
    })
  }

  async function handleDelete(id) {
    if (!window.confirm(`Xoá khách sạn #${id}?`)) return
    setBusy(true)
    try {
      await hotelApi.remove(id)
      await load()
    } catch (err) {
      setError(messageOf(err))
    } finally {
      setBusy(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  return (
    <section className="page">
      <div className="page__hero">
        <div className="container">
          <h1>Quản lý khách sạn (demo axios)</h1>
          <p>
            Gọi API thật tại <code>{API_URL}/hotels</code> — đủ GET, POST, PUT, DELETE.
          </p>
        </div>
      </div>

      <div className="container admin">
        <form className="card admin__form" onSubmit={handleSubmit}>
          <h2>{editingId ? `Sửa khách sạn #${editingId}` : 'Thêm khách sạn'}</h2>

          <div className="field">
            <label htmlFor="name">Tên</label>
            <input id="name" required value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="city">Thành phố</label>
            <input id="city" required value={form.city} onChange={(e) => setField('city', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="address">Địa chỉ</label>
            <input id="address" value={form.address} onChange={(e) => setField('address', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="price">Giá / đêm (₫)</label>
            <input
              id="price"
              type="number"
              min="0"
              step="1000"
              required
              value={form.pricePerNight}
              onChange={(e) => setField('pricePerNight', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="rating">Điểm (0–5)</label>
            <input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              required
              value={form.rating}
              onChange={(e) => setField('rating', e.target.value)}
            />
          </div>

          <div className="admin__actions">
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {editingId ? 'Lưu (PUT)' : 'Thêm (POST)'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
              >
                Huỷ
              </button>
            )}
          </div>
        </form>

        <div>
          {error && <p className="form-error">Lỗi: {error}</p>}

          <table className="admin__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Thành phố</th>
                <th>Giá / đêm</th>
                <th>Điểm</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.map((hotel) => (
                <tr key={hotel.id}>
                  <td>{hotel.id}</td>
                  <td>{hotel.name}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.pricePerNight.toLocaleString('vi-VN')} ₫</td>
                  <td>{hotel.rating}</td>
                  <td className="admin__row-actions">
                    <button type="button" className="btn btn--outline" onClick={() => startEdit(hotel)}>
                      Sửa
                    </button>
                    <button type="button" className="btn btn--danger" onClick={() => handleDelete(hotel.id)}>
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan="6">Chưa có dữ liệu — bấm “Thêm” để tạo bản ghi đầu tiên.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button
              type="button"
              className="pagination__btn"
              disabled={page === 1 || busy}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </button>
            <span className="admin__count">
              Trang {page}/{totalPages} — {data.total} khách sạn
            </span>
            <button
              type="button"
              className="pagination__btn"
              disabled={page >= totalPages || busy}
              onClick={() => setPage(page + 1)}
            >
              Sau →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
