import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Home from './pages/Home.jsx'
import Hotels from './pages/Hotels.jsx'
import HotelDetail from './pages/HotelDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminHotels from './pages/AdminHotels.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="hotels/:slug" element={<HotelDetail />} />
        <Route path="about-us" element={<About />} />
        <Route
          path="admin/hotels"
          element={
            <RequireAuth>
              <AdminHotels />
            </RequireAuth>
          }
        />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
