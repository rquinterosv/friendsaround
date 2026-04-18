import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Guides from './pages/Guides'
import Packages from './pages/Packages'
import PragueItinerary from './pages/PragueItinerary'
import Partners from './pages/Partners'
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
            <Route path="/itinerario/praga" element={<PragueItinerary />} />
            <Route path="/partners" element={<Partners />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
