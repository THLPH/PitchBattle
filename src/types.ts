/**
 * PitchBattle Game Type Definitions
 */

export interface SongNote {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  midi: number;  // target MIDI note (e.g. 60 = C4)
  lyric: string; // syllable or lyric text
}

export interface ChordEvent {
  time: number;
  duration: number;
  root: number;     // MIDI note for bass (e.g. 36 = C2)
  chordNotes: number[]; // MIDI notes for triad/chord (e.g. [48, 52, 55] = C3, E3, G3)
  name: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: string;
  difficulty: number; // 1 to 5
  duration: number;   // in seconds
  countInDuration: number;
  bpm: number;
  key: string;
  vocalRange: string;
  description: string;
  firstNoteHint: string;
  notes: SongNote[];
  chords: ChordEvent[];
  audioUrl?: string;
}

export interface PitchRecord {
  time: number;
  midi: number;
  rawMidi: number;
  hit: boolean;
  targetMidi: number | null;
}

export interface PlayerStats {
  score: number;
  maxCombo: number;
  currentCombo: number;
  perfectHits: number;
  goodHits: number;
  misses: number;
  totalFramesEvaluated: number;
  framesHit: number;
  pitchHistory: PitchRecord[];
}

export type GameStage = 
  | 'START'
  | 'P1_COUNTDOWN'
  | 'P1_SINGING'
  | 'INTERMISSION'
  | 'P2_COUNTDOWN'
  | 'P2_SINGING'
  | 'WINNER';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  vy: number;
}

export interface TunerState {
  hz: number | null;
  midi: number | null;
  noteName: string;
  cents: number;
  rms: number;
  clarity: number;
  isVoiced: boolean;
}
