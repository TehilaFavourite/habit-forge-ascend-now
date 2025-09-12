class TimerService {
  private interval: NodeJS.Timeout | null = null;
  private audioContext: AudioContext | null = null;
  private tickOscillator: OscillatorNode | null = null;
  private tickGain: GainNode | null = null;
  private callbacks: Set<() => void> = new Set();

  start(callback: () => void) {
    this.callbacks.add(callback);

    if (!this.interval) {
      this.interval = setInterval(() => {
        this.callbacks.forEach((cb) => cb());
      }, 1000);
    }
  }

  stop(callback?: () => void) {
    if (callback) {
      this.callbacks.delete(callback);
    }

    if (this.callbacks.size === 0 && this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.stopTicking();
    }
  }

  startTicking() {
    if (this.audioContext && this.tickOscillator) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.tickOscillator = this.audioContext.createOscillator();
      this.tickGain = this.audioContext.createGain();

      // Create a more pleasant ticking sound
      this.tickOscillator.connect(this.tickGain);
      this.tickGain.connect(this.audioContext.destination);

      // Use a softer, more metronome-like tone
      this.tickOscillator.frequency.setValueAtTime(
        440,
        this.audioContext.currentTime
      ); // A4 note
      this.tickOscillator.type = "sine";
      this.tickGain.gain.setValueAtTime(0, this.audioContext.currentTime);

      this.tickOscillator.start();
    } catch (error) {
      console.warn("Ticking sound not supported:", error);
    }
  }

  playTick() {
    if (!this.audioContext || !this.tickGain) return;

    try {
      const now = this.audioContext.currentTime;
      this.tickGain.gain.cancelScheduledValues(now);
      this.tickGain.gain.setValueAtTime(0, now);
      this.tickGain.gain.linearRampToValueAtTime(0.02, now + 0.01);
      this.tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    } catch (error) {
      console.warn("Could not play tick:", error);
    }
  }

  stopTicking() {
    if (this.tickOscillator) {
      try {
        this.tickOscillator.stop();
      } catch (e) {
        // Already stopped
      }
      this.tickOscillator = null;
    }
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {
        // Already closed
      }
      this.audioContext = null;
    }
    this.tickGain = null;
  }

  cleanup() {
    this.callbacks.clear();
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.stopTicking();
  }
}

export const timerService = new TimerService();
