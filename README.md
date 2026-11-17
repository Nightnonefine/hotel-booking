# AzureStay — Website booking khách sạn

Bài tập lớn môn **Lập trình Web** (PTIT HCM) — Đề tài số 2: Xây dựng website booking khách sạn.

## Công nghệ

- **React 19** + **Vite** (khởi tạo bằng `npm create vite@latest`)
- **React Router DOM v7** — điều hướng client-side
- **CSS thuần** chia theo `index.css` (biến màu, reset, component dùng chung), `styles/home.css` (trang chủ), `styles/components.css` (navbar/footer/card), `styles/pages.css` (trang con)
- Dữ liệu mẫu đặt trong `src/data/hotels.js`, sẽ thay bằng REST API ở phần backend

## Chạy dự án

```bash
npm install
npm run dev
```

Mặc định Vite chạy ở <http://localhost:5173>. Muốn chạy đúng cổng 3000 như đề bài:

```bash
npm run dev -- --port 3000
```

Build kiểm tra:

```bash
npm run build
npm run preview
```

## Cấu trúc thư mục

```
src/
├── main.jsx                # Gắn BrowserRouter vào ứng dụng
├── App.jsx                 # Khai báo toàn bộ route
├── index.css               # Biến CSS, reset, class dùng chung (.btn, .field...)
├── components/
│   ├── Layout.jsx          # Khung chung: Navbar + Outlet + Footer
│   ├── Navbar.jsx          # Menu dùng NavLink (tự highlight trang hiện tại)
│   ├── Footer.jsx
│   ├── SearchBar.jsx       # Form tìm phòng, đẩy điều kiện lên URL
│   └── HotelCard.jsx
├── pages/
│   ├── Home.jsx            # Trang chủ
│   ├── Hotels.jsx          # Danh sách + lọc + sắp xếp + phân trang
│   ├── HotelDetail.jsx     # Chi tiết khách sạn (useParams)
│   ├── About.jsx           # Giới thiệu (/about-us)
│   ├── Contact.jsx
│   ├── Login.jsx
│   └── NotFound.jsx        # Route "*"
├── data/hotels.js          # Dữ liệu mẫu
└── styles/                 # home.css, components.css, pages.css
```

## Danh sách route

| Đường dẫn | Trang | Ghi chú |
|---|---|---|
| `/` | Trang chủ | Hero + tìm kiếm + khách sạn nổi bật |
| `/hotels` | Danh sách khách sạn | Đọc query `?city=&guests=`, có lọc/sort/phân trang |
| `/hotels/:slug` | Chi tiết khách sạn | `useParams()` lấy slug từ URL |
| `/about-us` | Giới thiệu | Ví dụ trong đề bài |
| `/contact` | Liên hệ | Form demo |
| `/login` | Đăng nhập | Giao diện demo |
| `*` | 404 | Bắt mọi URL không khớp route |

## Điều hướng

- Menu dùng `<NavLink>` nên click là chuyển trang **không reload**, kèm class `is-active` cho mục đang mở.
- Truy cập trực tiếp bằng URL (`http://localhost:3000/about-us`) cũng hiển thị đúng trang vì `BrowserRouter` đọc `window.location`.
- `Layout.jsx` tự cuộn về đầu trang mỗi khi đổi route.
- Thanh tìm kiếm ở trang chủ dùng `useNavigate()` để chuyển sang `/hotels?city=Đà Nẵng&guests=2`.

## Backend API (bài tuần 2 — nhánh `week2-api`)

- **ASP.NET Core 8** (Controllers) + **EF Core 8** + **SQL Server Express**
- Database `HotelBookingDb` trên instance `.\SQLEXPRESS`; connection string nằm trong `api/appsettings.json` → `ConnectionStrings:Default`
- Bảng `Hotels`, `Bookings` (1-nhiều); xoá khách sạn còn đơn bị chặn và trả `409`; seed 4 khách sạn bằng `HasData`
- Migration: `api/Migrations/*_InitialSqlServer.cs` (`dotnet ef database update` tự tạo database + bảng)

### Endpoint

| Method | Đường dẫn | Ghi chú |
|---|---|---|
| GET | `/api/hotels?city=&q=&page=&pageSize=` | danh sách + phân trang |
| GET | `/api/hotels/{id}` | 200 / 404 |
| POST | `/api/hotels` | 201 + `Location` |
| PUT | `/api/hotels/{id}` | 204 / 404 |
| DELETE | `/api/hotels/{id}` | 204 / 404 / 409 nếu còn đơn |
| GET | `/api/bookings?status=&page=` | danh sách đơn |
| GET | `/api/bookings/{id}` | 200 / 404 |
| POST | `/api/bookings` | 201; 400 nếu ngày trả ≤ ngày nhận |
| PUT | `/api/bookings/{id}` | đổi trạng thái đơn |
| DELETE | `/api/bookings/{id}` | 204 / 404 |

### Chạy backend

```bash
cd api
dotnet tool restore
dotnet ef database update
dotnet run            # http://localhost:5080/swagger
```

Trang `/admin/hotels` gọi API qua axios (`src/services/api.js`), demo đủ GET/POST/PUT/DELETE.
Test API: `python3 api/tests/smoke_test.py` (nếu có Python) hoặc thao tác trực tiếp trên Swagger.

## Việc còn lại

- Trang `/hotels` công khai vẫn dùng dữ liệu tĩnh, cần chuyển sang gọi API
- Đăng nhập JWT cho admin / chủ khách sạn
- Đóng gói Docker + deploy hosting
