import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import BrowseLabour from './pages/BrowseLabour'
import LabourDetail from './pages/LabourDetail'
import RegisterLabour from './pages/RegisterLabour'
import Login from './pages/Login'
import Signup from './pages/Signup'
import HowItWorks from './pages/HowItWorks'
import Dashboard from './pages/Dashboard'
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminLabourers from './pages/admin/AdminLabourers'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBookings from './pages/admin/AdminBookings'
import AdminPayments from './pages/admin/AdminPayments'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<BrowseLabour />} />
          <Route path="/labour/:id" element={<LabourDetail />} />
          <Route path="/register-labour" element={<RegisterLabour />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminOverview />} />
            <Route path="labourers" element={<AdminLabourers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-display text-6xl font-bold text-ink">404</p>
      <p className="mt-2 text-steel">Ye page nahi mila.</p>
    </div>
  )
}
