import AudioManager from './components/AudioManager'
import { AudioProvider } from './context/AudioContext'
import { AuthProvider } from './context/AuthContext'
import { AuthGuard } from './components/Auth'
import { UserProfile } from './components/Auth'
import './index.css'

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AuthGuard>
          <AudioProvider>
            <div className="min-h-screen bg-gray-900">
              {/* Header with user profile */}
              <div className="flex justify-end p-4">
                <UserProfile />
              </div>
              <AudioManager />
            </div>
          </AudioProvider>
        </AuthGuard>
      </AuthProvider>
    </div>
  )
}

export default App