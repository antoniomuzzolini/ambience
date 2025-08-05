import AudioManager from './components/AudioManager'
import { AudioProvider } from './context/AudioContext'
import './index.css'

function App() {
  return (
    <div className="App">
      <AudioProvider>
        <AudioManager />
      </AudioProvider>
    </div>
  )
}

export default App