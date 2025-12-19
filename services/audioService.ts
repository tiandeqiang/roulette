
export class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Lazy initialization handled in methods to comply with browser autoplay policies
  }

  private init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Default volume
            this.masterGain.connect(this.ctx.destination);
        }
    }
  }

  private ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Short high-pitched blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  playSpin(duration: number) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    // Simulate clicking sound of a wheel ticking
    // The wheel slows down, so intervals between ticks increase.
    
    let time = this.ctx.currentTime;
    const totalTicks = 40; 
    
    for (let i = 0; i < totalTicks; i++) {
        const progress = i / totalTicks;
        // Non-linear interval to simulate deceleration
        // Interval increases as progress increases
        const interval = 0.04 + (0.2 * Math.pow(progress, 2)); 
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.type = 'sawtooth';
        osc.frequency.value = 100 + Math.random() * 100; // Low mechanical thud
        
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        // Volume fades out towards the end of spin
        gain.gain.setValueAtTime(0.4 * (1 - progress * 0.8), time); 
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.start(time);
        osc.stop(time + 0.05);

        time += interval;
        if (time > this.ctx.currentTime + duration) break;
    }
  }

  playWin() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Victory Fanfare (C Major Arpeggio with shimmer)
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 E5 G5 C6 E6 G6
    
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const start = t + i * 0.08;
        const dur = 0.4;

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.start(start);
        osc.stop(start + dur);
    });
    
    // Sparkle effect
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, t);
    osc2.frequency.linearRampToValueAtTime(2093, t + 0.6); 
    
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.3);
    gain2.gain.linearRampToValueAtTime(0, t + 0.6);
    
    osc2.start(t);
    osc2.stop(t + 0.6);
  }
}

export const audioService = new AudioService();
    