import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AudioProvider } from './context/AudioContext'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard } from './components/Auth'
import { UserProfile } from './components/Auth'
import Dashboard from './pages/Dashboard'
import TracksPage from './pages/TracksPage'
import './index.css'

function App() {
  return (
    <div className="App medieval-text">
      <AuthProvider>
        <AuthGuard>
          <AudioProvider>
            <Router>
              <div className="min-h-screen bg-medieval-gradient">
                {/* Medieval Header with decorative border */}
                <div className="relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-medieval-gold to-transparent"></div>
                  <div className="flex justify-between items-center p-4 bg-medieval-card border-b-2 border-medieval-gold/30">
                    {/* Medieval Title/Logo */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-medieval-gold rounded-full flex items-center justify-center shadow-medieval-glow">
                        <span className="text-2xl">🏰</span>
                      </div>
                      <h1 className="medieval-title text-2xl md:text-3xl">
                        Ambience Sanctum
                      </h1>
                    </div>
                    
                    {/* User Profile */}
                    <UserProfile />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-medieval-gold to-transparent"></div>
                </div>
                
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tracks" element={<TracksPage />} />
                </Routes>
                
                {/* Medieval Footer Decoration */}
                <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-medieval-gold/50 to-transparent pointer-events-none"></div>
              </div>
            </Router>
          </AudioProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  )
}

export default App