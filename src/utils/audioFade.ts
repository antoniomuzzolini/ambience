// Audio fading utilities for smooth transitions

export interface FadeOptions {
  duration: number; // Duration in seconds
  targetVolume: number; // Target volume (0-1)
  onComplete?: () => void; // Callback when fade completes
}

// Fade audio element to target volume over specified duration
export const fadeAudio = (
  audioElement: HTMLAudioElement,
  options: FadeOptions
): Promise<void> => {
  return new Promise((resolve) => {
    const { duration, targetVolume, onComplete } = options;
    
    if (duration <= 0) {
      audioElement.volume = targetVolume;
      onComplete?.();
      resolve();
      return;
    }

    const startVolume = audioElement.volume;
    const volumeDifference = targetVolume - startVolume;
    const startTime = Date.now();
    const durationMs = duration * 1000;

    const fadeStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Use ease-in-out curve for smoother transition
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      audioElement.volume = Math.max(0, Math.min(1, startVolume + volumeDifference * easedProgress));

      if (progress >= 1) {
        audioElement.volume = targetVolume;
        onComplete?.();
        resolve();
      } else {
        requestAnimationFrame(fadeStep);
      }
    };

    requestAnimationFrame(fadeStep);
  });
};

// Fade in audio element
export const fadeIn = (
  audioElement: HTMLAudioElement,
  targetVolume: number,
  duration: number
): Promise<void> => {
  audioElement.volume = 0;
  return fadeAudio(audioElement, { duration, targetVolume });
};

// Fade out audio element
export const fadeOut = (
  audioElement: HTMLAudioElement,
  duration: number,
  pauseOnComplete = true
): Promise<void> => {
  return fadeAudio(audioElement, {
    duration,
    targetVolume: 0,
    onComplete: pauseOnComplete ? () => audioElement.pause() : undefined
  });
};

// Cross-fade between two audio elements
export const crossFade = (
  audioOut: HTMLAudioElement,
  audioIn: HTMLAudioElement,
  targetVolume: number,
  duration: number
): Promise<void> => {
  return Promise.all([
    fadeOut(audioOut, duration),
    fadeIn(audioIn, targetVolume, duration)
  ]).then(() => {});
};

// Smooth volume change without stopping audio
export const changeVolume = (
  audioElement: HTMLAudioElement,
  targetVolume: number,
  duration: number
): Promise<void> => {
  return fadeAudio(audioElement, { duration, targetVolume });
};

// Seamless loop manager for ambient sounds
export class SeamlessLooper {
  private audioA: HTMLAudioElement;
  private audioB: HTMLAudioElement;
  private isUsingA: boolean = true;
  private loopInterval: number | null = null;
  private isActive: boolean = false;
  private targetVolume: number = 0.5;
  private crossfadeDuration: number = 1.0; // 1 second crossfade

  constructor(audioSrc: string, volume: number = 0.5) {
    this.audioA = new Audio(audioSrc);
    this.audioB = new Audio(audioSrc);
    this.targetVolume = volume;
    
    // Configure both audio elements
    [this.audioA, this.audioB].forEach(audio => {
      audio.preload = 'auto';
      audio.loop = false; // We handle looping manually
    });
  }

  async start(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    const currentAudio = this.isUsingA ? this.audioA : this.audioB;
    
    // Start playing the first instance
    currentAudio.volume = 0;
    await currentAudio.play();
    await fadeIn(currentAudio, this.targetVolume, 0.5);
    
    // Set up the loop monitoring
    this.setupLoopMonitoring();
  }

  async stop(): Promise<void> {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    
    // Fade out and stop both instances
    const fadePromises = [this.audioA, this.audioB].map(audio => {
      if (!audio.paused) {
        return fadeOut(audio, 0.5);
      }
      return Promise.resolve();
    });
    
    await Promise.all(fadePromises);
  }

  async setVolume(volume: number): Promise<void> {
    this.targetVolume = volume;
    
    // Update volume for currently playing audio
    const activeAudio = this.getCurrentAudio();
    if (activeAudio && !activeAudio.paused) {
      await changeVolume(activeAudio, volume, 0.3);
    }
  }

  private getCurrentAudio(): HTMLAudioElement {
    return this.isUsingA ? this.audioA : this.audioB;
  }

  private getNextAudio(): HTMLAudioElement {
    return this.isUsingA ? this.audioB : this.audioA;
  }

  private setupLoopMonitoring(): void {
    this.loopInterval = window.setInterval(() => {
      if (!this.isActive) return;
      
      const currentAudio = this.getCurrentAudio();
      
      // Only proceed if audio is playing and duration is known
      if (currentAudio.paused || !currentAudio.duration || currentAudio.duration <= 5) {
        return;
      }
      
      const timeRemaining = currentAudio.duration - currentAudio.currentTime;
      
      // If we're within the crossfade duration of the end, start the crossfade
      if (timeRemaining <= this.crossfadeDuration && timeRemaining > 0) {
        this.performSeamlessLoop();
      }
    }, 100); // Check every 100ms
  }

  private async performSeamlessLoop(): Promise<void> {
    if (!this.isActive) return;
    
    const currentAudio = this.getCurrentAudio();
    const nextAudio = this.getNextAudio();
    
    // Start the next instance from the beginning
    nextAudio.currentTime = 0;
    nextAudio.volume = 0;
    await nextAudio.play();
    
    // Crossfade between the two instances
    await crossFade(currentAudio, nextAudio, this.targetVolume, this.crossfadeDuration);
    
    // Switch to the new instance
    this.isUsingA = !this.isUsingA;
  }

  cleanup(): void {
    this.stop();
    this.audioA.remove();
    this.audioB.remove();
  }
}