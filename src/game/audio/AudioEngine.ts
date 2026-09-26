class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.engineGain.gain.value = 0;
    }
  }

  public playUIClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      // Audio fallback
    }
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public playPunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  public startEngine() {
    if (this.isMuted || this.engineOsc) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch (e) {}
  }

  public updateEnginePitch(speedRatio: number) {
    if (!this.engineOsc || !this.ctx || this.isMuted) return;
    try {
      const targetFreq = 50 + speedRatio * 220;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    } catch (e) {}
  }

  public stopEngine() {
    if (this.engineOsc && this.ctx) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  public updateSiren(wantedLevel: number) {
    if (wantedLevel <= 0 || this.isMuted) {
      if (this.sirenOsc && this.ctx) {
        try {
          this.sirenOsc.stop();
          this.sirenOsc.disconnect();
        } catch (e) {}
        this.sirenOsc = null;
        this.sirenGain = null;
      }
      return;
    }

    this.initCtx();
    if (!this.ctx) return;

    if (!this.sirenOsc) {
      try {
        this.sirenOsc = this.ctx.createOscillator();
        this.sirenGain = this.ctx.createGain();

        this.sirenOsc.type = 'sine';
        this.sirenGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

        this.sirenOsc.connect(this.sirenGain);
        this.sirenGain.connect(this.ctx.destination);

        this.sirenOsc.start();
      } catch (e) {}
    }

    if (this.sirenOsc && this.ctx) {
      const time = this.ctx.currentTime;
      const freq = 600 + Math.sin(time * 6) * 300;
      this.sirenOsc.frequency.setValueAtTime(freq, time);
    }
  }
}

export const audioEngine = new AudioEngine();
