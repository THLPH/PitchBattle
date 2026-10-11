/**
 * High-Precision YIN Pitch Detection & MIDI Utilities
 */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface PitchDetectionResult {
  hz: number | null;
  midi: number | null;
  rawMidi: number | null;
  rms: number;
  clarity: number; // 0.0 to 1.0 confidence
  noteName: string;
  cents: number;
  isVoiced: boolean;
}

/**
 * Converts frequency in Hertz to floating point MIDI note number.
 * MIDI 69 = A4 (440Hz), 60 = C4 (~261.63Hz)
 */
export function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

/**
 * Converts MIDI note number back to frequency in Hertz
 */
export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Gets note name and octave from MIDI note (e.g. 60 -> "C4")
 */
export function midiToNoteName(midi: number): { note: string; octave: number; fullName: string } {
  const rounded = Math.round(midi);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12) - 1;
  const note = NOTE_NAMES[noteIndex];
  return {
    note,
    octave,
    fullName: `${note}${octave}`,
  };
}

/**
 * Calculates cyclic pitch distance accounting for octave folding.
 * Returns semitone difference between 0 and 6.
 * (e.g. User singing C3 while target is C4 results in 0 difference)
 */
export function getOctaveFoldedDistance(userMidi: number, targetMidi: number): number {
  const userPitchClass = ((userMidi % 12) + 12) % 12;
  const targetPitchClass = ((targetMidi % 12) + 12) % 12;
  const rawDiff = Math.abs(userPitchClass - targetPitchClass);
  return Math.min(rawDiff, 12 - rawDiff);
}

/**
 * Shifts userMidi into the octave of targetMidi for visual alignment
 */
export function alignMidiToTargetOctave(userMidi: number, targetMidi: number): number {
  const diff = userMidi - targetMidi;
  const octaveShift = Math.round(diff / 12);
  return userMidi - (octaveShift * 12);
}

/**
 * Implements the YIN pitch detection algorithm on a raw audio buffer
 */
export class PitchDetector {
  private sampleRate: number;
  private minFreq: number;
  private maxFreq: number;
  private yinThreshold: number;

  constructor(
    sampleRate: number = 44100,
    minFreq: number = 65,   // C2 (~65Hz) - covers human vocal range including low male chest voice
    maxFreq: number = 1000, // C6 (~1046Hz) - covers high soprano / falsetto
    yinThreshold: number = 0.15
  ) {
    this.sampleRate = sampleRate;
    this.minFreq = minFreq;
    this.maxFreq = maxFreq;
    this.yinThreshold = yinThreshold;
  }

  public setSampleRate(rate: number) {
    this.sampleRate = rate;
  }

  /**
   * Detect pitch from Float32Array time domain data
   */
  public detect(buffer: Float32Array<any>, rmsThreshold: number = 0.003): PitchDetectionResult {
    const bufferSize = buffer.length;

    // 1. Calculate Root Mean Square (RMS) energy
    let sumSquares = 0;
    for (let i = 0; i < bufferSize; i++) {
      const sample = buffer[i];
      sumSquares += sample * sample;
    }
    const rms = Math.sqrt(sumSquares / bufferSize);

    // If signal is too quiet, return silence/unvoiced
    if (rms < rmsThreshold) {
      return {
        hz: null,
        midi: null,
        rawMidi: null,
        rms,
        clarity: 0,
        noteName: "--",
        cents: 0,
        isVoiced: false,
      };
    }

    // 2. Fast YIN difference function (stepped for real-time 60fps performance)
    const minPeriod = Math.max(2, Math.floor(this.sampleRate / this.maxFreq));
    const maxPeriod = Math.min(Math.floor(bufferSize / 2), Math.floor(this.sampleRate / this.minFreq));
    const yinBuffer = new Float32Array(maxPeriod);

    // Step by 2 to maintain responsive 60fps without starving the main thread
    const step = 2; 
    const windowSize = bufferSize - maxPeriod;

    for (let tau = 0; tau < maxPeriod; tau++) {
      let diff = 0;
      for (let i = 0; i < windowSize; i += step) {
        const delta = buffer[i] - buffer[i + tau];
        diff += delta * delta;
      }
      yinBuffer[tau] = diff * step;
    }

    // 3. Cumulative mean normalized difference
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < maxPeriod; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] = runningSum > 0 ? (yinBuffer[tau] * tau) / runningSum : 1;
    }

    // 4. Absolute thresholding & local minimum search
    let period = -1;
    let foundBelowThreshold = false;

    for (let tau = minPeriod; tau < maxPeriod; tau++) {
      if (yinBuffer[tau] < this.yinThreshold) {
        foundBelowThreshold = true;
        // Keep searching until the bottom of the dip
        while (tau + 1 < maxPeriod && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        period = tau;
        break;
      }
    }

    // Fallback: If no value below threshold, find global minimum if good enough
    if (!foundBelowThreshold) {
      let minVal = 1.0;
      let minIdx = -1;
      for (let tau = minPeriod; tau < maxPeriod; tau++) {
        if (yinBuffer[tau] < minVal) {
          minVal = yinBuffer[tau];
          minIdx = tau;
        }
      }
      if (minIdx !== -1 && minVal < 0.32) {
        period = minIdx;
      }
    }

    if (period === -1 || period < minPeriod || period >= maxPeriod) {
      return {
        hz: null,
        midi: null,
        rawMidi: null,
        rms,
        clarity: 0,
        noteName: "--",
        cents: 0,
        isVoiced: false,
      };
    }

    // 5. Parabolic interpolation for sub-sample precision
    let betterPeriod = period;
    if (period > 0 && period < maxPeriod - 1) {
      const s0 = yinBuffer[period - 1];
      const s1 = yinBuffer[period];
      const s2 = yinBuffer[period + 1];
      const denominator = 2 * (2 * s1 - s0 - s2);
      if (denominator !== 0) {
        const delta = (s2 - s0) / denominator;
        betterPeriod = period + delta;
      }
    }

    const hz = this.sampleRate / betterPeriod;
    if (hz < this.minFreq || hz > this.maxFreq || !isFinite(hz)) {
      return {
        hz: null,
        midi: null,
        rawMidi: null,
        rms,
        clarity: 0,
        noteName: "--",
        cents: 0,
        isVoiced: false,
      };
    }

    const rawMidi = hzToMidi(hz);
    const clarity = Math.max(0, Math.min(1, 1 - (yinBuffer[period] || 0.2)));
    const noteInfo = midiToNoteName(rawMidi);
    const roundedMidi = Math.round(rawMidi);
    const cents = Math.round((rawMidi - roundedMidi) * 100);

    return {
      hz,
      midi: rawMidi,
      rawMidi,
      rms,
      clarity,
      noteName: noteInfo.fullName,
      cents,
      isVoiced: true,
    };
  }
}
