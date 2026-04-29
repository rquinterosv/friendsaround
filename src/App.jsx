import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Guides from './pages/Guides'
import Packages from './pages/Packages'
import PragueItinerary from './pages/PragueItinerary'
import Partners from './pages/Partners'
import Profile from './pages/Profile'
import GuideProfile from './pages/GuideProfile'
import UserProfile from './pages/UserProfile'
import './App.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/prague" element={<Packages />} />
            <Route path="/itinerary/praga" element={<PragueItinerary />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/guide/:id" element={<GuideProfile />} />
            <Route path="/user/:id" element={<UserProfile />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
