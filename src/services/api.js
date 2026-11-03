import axios from 'axios'

// Backend chạy ở cổng 5080 (xem api/Properties/launchSettings.json).
// Muốn đổi thì tạo file .env với VITE_API_URL=http://localhost:xxxx/api
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api'

const http = axios.create({ baseURL: API_URL, timeout: 10000 })

// Bốn phương thức HTTP mà bài tuần 2 yêu cầu, mỗi cái một hàm.
export const hotelApi = {
  list: (params) => http.get('/hotels', { params }).then((res) => res.data), // GET  (có ?page=&pageSize=)
  get: (id) => http.get(`/hotels/${id}`).then((res) => res.data), // GET  theo id
  create: (data) => http.post('/hotels', data).then((res) => res.data), // POST
  update: (id, data) => http.put(`/hotels/${id}`, data), // PUT
  remove: (id) => http.delete(`/hotels/${id}`), // DELETE
}
