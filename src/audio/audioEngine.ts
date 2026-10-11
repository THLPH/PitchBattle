import { PitchDetector, PitchDetectionResult, midiToHz, midiToNoteName } from './pitchDetector';
import { Song } from '../types';
import { DEFAULT_SONG } from '../songs';

export class AudioEngine {
  private currentSong: Song = DEFAULT_SONG;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private timeDataBuffer: Float32Array<ArrayBuffer> = new Float32Array(2048) as Float32Array<ArrayBuffer>;
  private pitchDetector: PitchDetector = new PitchDetector(44100);

  // Gain nodes
  private masterGain: GainNode | null = null;
  private backingGain: GainNode | null = null;
  private guideGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Active scheduled nodes tracking for clean stop
  private activeScheduledNodes: Array<{ stop: (time?: number) => void }> = [];

  // Playback state
  private isPlayingSong: boolean = false;
  private songStartTime: number = 0;
  private virtualMidi: number | null = null;
  private autoSingMode: boolean = false;

  // Volume levels (0.0 to 1.0)
  public masterVolume: number = 0.8;
  public backingVolume: number = 0.6;
  public guideVolume: number = 0.35;
  public sfxVolume: number = 0.5;
  public rmsThreshold: number = 0.003; // Sensitive pickup for normal singing voice

  private lastMidiValues: number[] = []; // For median filtering

  /**
   * Initialize or resume the AudioContext
   */
  public async initContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.pitchDetector.setSampleRate(this.ctx.sampleRate);

      // Create bus gain hierarchy
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.backingGain = this.ctx.createGain();
      this.backingGain.gain.setValueAtTime(this.backingVolume, this.ctx.currentTime);
      this.backingGain.connect(this.masterGain);

      this.guideGain = this.ctx.createGain();
      this.guideGain.gain.setValueAtTime(this.guideVolume, this.ctx.currentTime);
      this.guideGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Analyser for microphone
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.0;
      this.timeDataBuffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  public setCurrentSong(song: Song) {
    this.currentSong = song;
  }

  public getCurrentSong(): Song {
    return this.currentSong;
  }

  /**
   * Request microphone stream and attach to analyser node
   */
  public async setupMicrophone(): Promise<boolean> {
    try {
      await this.initContext();

      // Check if existing mic stream has active, live tracks
      const hasActiveTracks = !!(
        this.micStream &&
        this.micStream.getAudioTracks().some((t) => t.readyState === 'live' && t.enabled)
      );

      if (!hasActiveTracks) {
        // Clean up any stale or ended tracks
        if (this.micStream) {
          try {
            this.micStream.getTracks().forEach((t) => t.stop());
          } catch {
            // ignore
          }
          this.micStream = null;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('navigator.mediaDevices.getUserMedia is not available');
          return false;
        }

        let stream: MediaStream;
        try {
          // Optimized for vocal music: avoid browser WebRTC speech compression/cancellation
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              autoGainControl: false,
              noiseSuppression: false,
            },
          });
        } catch (constraintErr) {
          console.warn('Custom audio constraints rejected, falling back to simple audio: true', constraintErr);
          // Standard fallback supported by all browsers and webviews
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }

        this.micStream = stream;

        if (this.ctx && this.analyser) {
          if (this.micSource) {
            try {
              this.micSource.disconnect();
            } catch {
              // ignore
            }
          }
          this.micSource = this.ctx.createMediaStreamSource(this.micStream);
          
          // High-pass filter at 65Hz (C2) to remove sub-audible rumble while keeping male fundamentals
          const highpass = this.ctx.createBiquadFilter();
          highpass.type = 'highpass';
          highpass.frequency.setValueAtTime(65, this.ctx.currentTime);
          this.micSource.connect(highpass);
          // Connect to analyser ONLY, NOT to destination to prevent feedback!
          highpass.connect(this.analyser);
        }
      }

      // Resume context if suspended
      if (this.ctx && this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      return true;
    } catch (err) {
      console.warn('Microphone permission or hardware error:', err);
      return false;
    }
  }

  public hasMicrophone(): boolean {
    return !!this.micStream;
  }

  public setVirtualMidi(midi: number | null) {
    this.virtualMidi = midi;
  }

  public setAutoSing(enabled: boolean) {
    this.autoSingMode = enabled;
  }

  public getAutoSing(): boolean {
    return this.autoSingMode;
  }

  /**
   * Get current pitch reading from mic (or virtual pitch simulator)
   */
  public getPitch(currentTimeInSong?: number): PitchDetectionResult {
    // If virtual pitch override is active (e.g. keyboard simulator)
    if (this.virtualMidi !== null) {
      const hz = midiToHz(this.virtualMidi);
      return {
        hz,
        midi: this.virtualMidi,
        rawMidi: this.virtualMidi,
        rms: 0.15,
        clarity: 0.99,
        noteName: "SIM",
        cents: 0,
        isVoiced: true,
      };
    }

    // Auto-sing mode for testing: automatically sings target pitch with realistic human micro-vibrato
    if (this.autoSingMode && currentTimeInSong !== undefined) {
      const currentNote = this.currentSong.notes.find(
        (n) => currentTimeInSong >= n.start - 0.05 && currentTimeInSong <= n.end + 0.05
      );
      if (currentNote) {
        // slight vibrato (5Hz rate, ±0.15 semitone)
        const vibrato = Math.sin(currentTimeInSong * 2 * Math.PI * 5) * 0.15;
        const midi = currentNote.midi + vibrato;
        const hz = midiToHz(midi);
        return {
          hz,
          midi,
          rawMidi: midi,
          rms: 0.12,
          clarity: 0.95,
          noteName: "AUTO",
          cents: Math.round(vibrato * 100),
          isVoiced: true,
        };
      }
    }

    if (!this.analyser) {
      this.lastMidiValues = [];
      return {
        hz: null,
        midi: null,
        rawMidi: null,
        rms: 0,
        clarity: 0,
        noteName: "--",
        cents: 0,
        isVoiced: false,
      };
    }

    this.analyser.getFloatTimeDomainData(this.timeDataBuffer);
    const result = this.pitchDetector.detect(this.timeDataBuffer, this.rmsThreshold);

    // Apply Median Filter to smooth out 1-2 frame glitches
    if (result.isVoiced && result.rawMidi !== null) {
      this.lastMidiValues.push(result.rawMidi);
      if (this.lastMidiValues.length > 5) {
        this.lastMidiValues.shift(); // Keep last 5 frames
      }

      // Calculate median
      const sorted = [...this.lastMidiValues].sort((a, b) => a - b);
      const medianMidi = sorted[Math.floor(sorted.length / 2)];

      // Overwrite the raw detection with the smoothed median detection
      result.rawMidi = medianMidi;
      result.midi = medianMidi;
      result.hz = midiToHz(medianMidi);
      
      const roundedMidi = Math.round(medianMidi);
      const noteInfo = midiToNoteName(roundedMidi);
      result.cents = Math.round((medianMidi - roundedMidi) * 100);
      result.noteName = noteInfo.fullName;
    } else {
      // Clear history when unvoiced to avoid gliding into the next phrase
      this.lastMidiValues = [];
    }

    return result;
  }

  /**
   * Plays count-in beeps (at 0s, 0.75s, 1.5s, 2.25s)
   */
  public scheduleCountIn(startAudioTime: number) {
    if (!this.ctx || !this.sfxGain) return;

    const clicks = [0.0, 0.75, 1.5, 2.25];
    clicks.forEach((offset, idx) => {
      const isGo = idx === clicks.length - 1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isGo ? 880 : 587.33, startAudioTime + offset); // A5 or D5

      gain.gain.setValueAtTime(0.001, startAudioTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.3, startAudioTime + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAudioTime + offset + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startAudioTime + offset);
      osc.stop(startAudioTime + offset + 0.15);
      this.activeScheduledNodes.push(osc);
    });
  }

  /**
   * Synthesize rhythmic backing track (chords, bass, drums)
   */
  public scheduleBackingTrack(startAudioTime: number) {
    if (!this.ctx || !this.backingGain) return;

    const tempoBpm = this.currentSong.bpm || 100;
    const beatInterval = 60 / tempoBpm;
    const totalBeats = Math.floor(this.currentSong.duration / beatInterval);

    // 1. Synthesize Drums
    for (let beat = 0; beat < totalBeats; beat++) {
      const beatTime = startAudioTime + beat * beatInterval;

      // Hi-hat on every beat and offbeat (8th notes)
      this.playHiHat(beatTime, 0.08);
      this.playHiHat(beatTime + beatInterval / 2, 0.04);

      // Kick on beat 1 and 3 of 4-beat bar
      if (beat % 4 === 0 || beat % 4 === 2) {
        this.playKick(beatTime);
      }

      // Snare on beat 2 and 4
      if (beat % 4 === 1 || beat % 4 === 3) {
        this.playSnare(beatTime);
      }
    }

    // 2. Synthesize Chords & Bass
    this.currentSong.chords.forEach((chord) => {
      const chordStart = startAudioTime + chord.time;
      const chordDuration = chord.duration;

      // Bass note
      this.playBassNote(chordStart, chordDuration, chord.root);

      // Polyphonic keyboard chord stabs (subtle upbeat comping)
      const stabs = Math.floor(chordDuration / beatInterval);
      for (let s = 0; s < stabs; s++) {
        const stabTime = chordStart + s * beatInterval;
        this.playChordStab(stabTime, beatInterval * 0.8, chord.chordNotes);
      }
    });
  }

  /**
   * Synthesize guide melody notes
   */
  public scheduleGuideMelody(startAudioTime: number) {
    if (!this.ctx || !this.guideGain) return;

    this.currentSong.notes.forEach((note) => {
      const noteStart = startAudioTime + note.start;
      const duration = note.end - note.start;

      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(midiToHz(note.midi), noteStart);

      // Soft flute-like attack and decay
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.04);
      gain.gain.setValueAtTime(0.18, noteStart + Math.max(0.05, duration - 0.05));
      gain.gain.linearRampToValueAtTime(0.0001, noteStart + duration);

      osc.connect(gain);
      gain.connect(this.guideGain!);

      osc.start(noteStart);
      osc.stop(noteStart + duration + 0.05);
      this.activeScheduledNodes.push(osc);
    });
  }

  private playKick(time: number) {
    if (!this.ctx || !this.backingGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.09);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + 0.2);
    this.activeScheduledNodes.push(osc);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.backingGain) return;

    // Snare tone body
    const osc = this.ctx.createOscillator();
    const gainOsc = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    gainOsc.gain.setValueAtTime(0.25, time);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gainOsc);
    gainOsc.connect(this.backingGain);
    osc.start(time);
    osc.stop(time + 0.12);
    this.activeScheduledNodes.push(osc);

    // Snare noise rattle
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + 0.13);
    this.activeScheduledNodes.push(noise);
  }

  private playHiHat(time: number, vol: number) {
    if (!this.ctx || !this.backingGain) return;
    const bufferSize = this.ctx.sampleRate * 0.04;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.backingGain);

    noise.start(time);
    noise.stop(time + 0.04);
    this.activeScheduledNodes.push(noise);
  }

  private playBassNote(time: number, duration: number, midiNote: number) {
    if (!this.ctx || !this.backingGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(midiToHz(midiNote), time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.25, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.backingGain);

    osc.start(time);
    osc.stop(time + duration);
    this.activeScheduledNodes.push(osc);
  }

  private playChordStab(time: number, duration: number, chordNotes: number[]) {
    if (!this.ctx || !this.backingGain) return;

    chordNotes.forEach((midi) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(midiToHz(midi), time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.backingGain!);

      osc.start(time);
      osc.stop(time + duration);
      this.activeScheduledNodes.push(osc);
    });
  }

  /**
   * Sound effect: Note hit ding
   */
  public playHitSound(isComboMilestone: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isComboMilestone ? 1200 : 880, now);
    if (isComboMilestone) {
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
    }

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Sound effect: Victory Fanfare
   */
  public playVictoryFanfare() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const fanfareNotes = [
      { midi: 60, offset: 0.0, dur: 0.15 },
      { midi: 64, offset: 0.15, dur: 0.15 },
      { midi: 67, offset: 0.3, dur: 0.15 },
      { midi: 72, offset: 0.45, dur: 0.6 },
    ];

    fanfareNotes.forEach((fn) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(midiToHz(fn.midi), now + fn.offset);
      gain.gain.setValueAtTime(0.2, now + fn.offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + fn.offset + fn.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + fn.offset);
      osc.stop(now + fn.offset + fn.dur + 0.05);
    });
  }

  /**
   * Start song playback with audio backing and guide melody
   */
  public async startSong(): Promise<void> {
    await this.initContext();
    this.stopSong();

    this.isPlayingSong = true;
    this.songStartTime = this.ctx!.currentTime;

    // 1. Schedule 3-second count-in
    this.scheduleCountIn(this.songStartTime);

    // 2. Schedule backing track (starts with countdown & continues)
    this.scheduleBackingTrack(this.songStartTime);

    // 3. Schedule guide melody
    this.scheduleGuideMelody(this.songStartTime);
  }

  public getSongTime(): number {
    if (!this.isPlayingSong || !this.ctx) return 0;
    return Math.max(0, this.ctx.currentTime - this.songStartTime);
  }

  public stopSong() {
    this.isPlayingSong = false;
    // Stop all active scheduled nodes
    for (const node of this.activeScheduledNodes) {
      try {
        node.stop();
      } catch {
        // already stopped
      }
    }
    this.activeScheduledNodes = [];
  }

  public setMasterVolume(v: number) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  public setBackingVolume(v: number) {
    this.backingVolume = Math.max(0, Math.min(1, v));
    if (this.backingGain && this.ctx) {
      this.backingGain.gain.setValueAtTime(this.backingVolume, this.ctx.currentTime);
    }
  }

  public setGuideVolume(v: number) {
    this.guideVolume = Math.max(0, Math.min(1, v));
    if (this.guideGain && this.ctx) {
      this.guideGain.gain.setValueAtTime(this.guideVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(v: number) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setRmsThreshold(threshold: number) {
    this.rmsThreshold = threshold;
  }
}

export const globalAudioEngine = new AudioEngine();
