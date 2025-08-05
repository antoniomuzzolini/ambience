# 🎵 D&D Audio Manager

A modern, modular audio management system for D&D sessions with automatic sound loading and intuitive controls.

## ✨ Features

- **🎭 Environment Management** - Create custom audio environments for different scenarios
- **🌧️ Ambient Sounds** - Background atmospheres (rain, wind, fire, forest, city, ocean waves, war)
- **⚡ Sound Effects** - Instant effects with keyboard shortcuts (wolf, thunder, roar, explosion)
- **🎚️ Volume Controls** - Independent volume control for music, ambient, and effects
- **⌨️ Keyboard Shortcuts** - Number keys (1-4) for quick sound effects
- **📁 Auto Sound Loading** - Automatically detects and loads sounds from your `/sounds` directory

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your Sound Files
Place your audio files in the `/sounds` directory:
```
/sounds
├── /ambience
│   ├── rain.m4a
│   ├── wind.wav
│   ├── fire.m4a
│   ├── forest.wav
│   ├── city.wav
│   ├── waves.wav
│   └── war.mp3
└── /effects
    ├── wolf.wav
    ├── thunder.wav
    ├── roar.wav
    └── explosion.mp3
```

### 3. Copy Sounds to Public Directory
```bash
npm run copy-sounds
```

### 4. Start Development Server
```bash
npm run dev
```

## 🎵 Sound File Management

### Supported Formats
- **MP3** - Most compatible
- **WAV** - High quality, larger files
- **M4A** - Apple format, good compression
- **mp3** - Uncompressed, high quality
- **OGG** - Web optimized

### Auto-Loading vs Manual Loading

#### Auto-Loading (Recommended)
The app automatically tries to load sounds from `/public/sounds/` when it starts. Use the `copy-sounds` script to copy your files:

```bash
npm run copy-sounds
```

#### Manual Loading
If auto-loading fails, you can manually load sounds:
1. Click the **Settings** ⚙️ button
2. In the **Available Sound Files** section
3. Click **Load** next to each sound you want to use

## 🎮 Usage

### Creating Environments
1. Click the **+** button in the Environments section
2. Enter a name for your environment (e.g., "Tavern", "Forest Battle")
3. Click **Create**
4. Click the **Edit** button to add music tracks

### Using Ambient Sounds
- Click the volume icon next to any ambient sound to toggle it on/off
- Multiple ambient sounds can play simultaneously
- Adjust ambient volume in Settings

### Sound Effects & Keyboard Shortcuts
- **Key 1**: Wolf howl
- **Key 2**: Thunder
- **Key 3**: Roar  
- **Key 4**: Explosion

### Volume Controls
- **Music Tracks**: Controls environment music volume
- **Ambient Sounds**: Controls background atmosphere volume
- **Sound Effects**: Controls one-shot effect volume

## 🛠️ Architecture

The app uses a modern, modular React architecture:

```
src/
├── components/AudioManager/    # UI components
├── hooks/                      # Custom React hooks
├── context/                    # React Context for state
├── types/                      # TypeScript definitions
└── utils/                      # Utility functions
```

### Key Components
- **AudioManager** - Main container component
- **EnvironmentsList** - Manage audio environments
- **AmbientSounds** - Background atmosphere controls
- **SoundEffects** - Quick effect triggers
- **VolumeControls** - Audio level management

### Custom Hooks
- **useAudioManager** - Core audio playback logic
- **useEnvironments** - Environment CRUD operations
- **useVolumeControl** - Volume management
- **useKeyboardShortcuts** - Keyboard event handling
- **useAudioLoader** - Automatic sound file loading

## 🎯 Tips for Best Experience

### File Organization
- Keep file sizes reasonable (< 10MB per file)
- Use descriptive filenames
- Organize by type (ambience vs effects)

### Performance
- MP3 files load faster than WAV
- Consider file size for web deployment
- Use loop-friendly formats for ambient sounds

### Audio Quality
- 44.1kHz sample rate is standard
- 16-bit depth is sufficient for most use cases
- Normalize volume levels across files

## 🔧 Development

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

### Preview Production Build
```bash
npm run preview
```

## 📝 License

MIT License - Feel free to use for your D&D sessions!

## 🎲 Perfect for

- **D&D Sessions** - Create immersive audio environments
- **RPG Games** - Quick access to atmosphere and effects
- **Streaming** - Professional audio control for content creators
- **Theater** - Sound design for live performances