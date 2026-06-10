import { Navigate, Route, Routes } from 'react-router-dom'
import HomeLayout from './components/HomeLayout'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtecedRoute'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import RestaurantMenuPage from './pages/RestaurantMenuPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/giris" element={<LoginPage />} />
        <Route path="/kayit" element={<RegisterPage />} />
        <Route
          path="/anasayfa"
          element={
            <ProtectedRoute>
              <HomeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="restoran/:restaurantId" element={<RestaurantMenuPage />} />
        </Route>
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}