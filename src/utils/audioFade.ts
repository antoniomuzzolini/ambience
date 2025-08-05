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