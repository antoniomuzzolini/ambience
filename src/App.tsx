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
    <div className="App">
      <AuthProvider>
        <AuthGuard>
          <AudioProvider>
            <Router>
              <div className="min-h-screen bg-gray-900">
                {/* Header with user profile */}
                <div className="flex justify-end p-4">
                  <UserProfile />
                </div>
                
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tracks" element={<TracksPage />} />
                </Routes>
              </div>
            </Router>
          </AudioProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  )
}

export default App