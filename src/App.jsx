import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { CartProvider } from './store/CartContext'
import { AuthProvider } from './store/AuthContext'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ItemDetail from './pages/ItemDetail'
import Cart from './pages/Cart'
import OrderTracking from './pages/OrderTracking'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import Menu from './pages/Menu'
import Dashboard from './pages/admin/Dashboard'
import MenuManagement from './pages/admin/MenuManagement'
import OffersManagement from './pages/admin/OffersManagement' // New
import DailyOffers from './pages/DailyOffers'
import Profile from './pages/Profile'
import DebugPage from './pages/Debug'

import { MenuProvider } from './store/MenuContext'

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/debug" element={<DebugPage />} />

              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="menu/:categoryId" element={<Menu />} />
                <Route path="item/:itemId" element={<ItemDetail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="orders" element={<OrderTracking />} />
                <Route path="offers" element={<DailyOffers />} /> {/* New Route */}
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Admin Routes (Protected) */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Dashboard />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="offers" element={<OffersManagement />} /> {/* New Route */}
                <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
              </Route>
            </Routes>
            <Toaster position="top-center" richColors />
          </BrowserRouter>
        </CartProvider>
      </MenuProvider>
    </AuthProvider>
  )
}

export default App
