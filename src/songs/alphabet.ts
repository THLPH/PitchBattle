import { SongNote, ChordEvent, Song } from '../types';

export const ALPHABET_TITLE = "The Alphabet Song (A-B-C)";
export const ALPHABET_DURATION = 30.0; // seconds
export const ALPHABET_COUNT_IN_DURATION = 3.0; // 3 seconds count-in

export const ALPHABET_NOTES: SongNote[] = [
  // Phrase 1: "A, B, C, D, E, F, G"
  { id: 1, start: 3.0, end: 3.45, midi: 59, lyric: "A" },       // B3
  { id: 2, start: 3.5, end: 3.95, midi: 59, lyric: "B" },       // B3
  { id: 3, start: 4.0, end: 4.45, midi: 66, lyric: "C" },       // F#4
  { id: 4, start: 4.5, end: 4.95, midi: 66, lyric: "D" },       // F#4
  { id: 5, start: 5.0, end: 5.45, midi: 68, lyric: "E" },       // G#4
  { id: 6, start: 5.5, end: 5.95, midi: 68, lyric: "F" },       // G#4
  { id: 7, start: 6.0, end: 6.90, midi: 66, lyric: "G," },      // F#4

  // Phrase 2: "H, I, J, K, L-M-N-O-P"
  { id: 8,  start: 7.0,  end: 7.45,  midi: 64, lyric: "H" },    // E4
  { id: 9,  start: 7.5,  end: 7.95,  midi: 64, lyric: "I" },    // E4
  { id: 10, start: 8.0,  end: 8.45,  midi: 63, lyric: "J" },    // D#4
  { id: 11, start: 8.5,  end: 8.95,  midi: 63, lyric: "K" },    // D#4
  { id: 12, start: 9.0,  end: 9.30,  midi: 61, lyric: "L" },    // C#4
  { id: 13, start: 9.35, end: 9.65,  midi: 61, lyric: "M" },    // C#4
  { id: 14, start: 9.70, end: 10.00, midi: 61, lyric: "N" },    // C#4
  { id: 15, start: 10.05, end: 10.35, midi: 61, lyric: "O" },   // C#4
  { id: 16, start: 10.40, end: 11.20, midi: 59, lyric: "P," },  // B3

  // Phrase 3: "Q, R, S, T, U, V"
  { id: 17, start: 11.5, end: 11.95, midi: 66, lyric: "Q" },    // F#4
  { id: 18, start: 12.0, end: 12.45, midi: 66, lyric: "R" },    // F#4
  { id: 19, start: 12.5, end: 12.95, midi: 64, lyric: "S" },    // E4
  { id: 20, start: 13.0, end: 13.45, midi: 64, lyric: "T" },    // E4
  { id: 21, start: 13.5, end: 13.95, midi: 63, lyric: "U" },    // D#4
  { id: 22, start: 14.0, end: 14.45, midi: 63, lyric: "V," },   // D#4

  // Phrase 4: "W, X, Y and Z"
  { id: 23, start: 14.5, end: 15.35, midi: 61, lyric: "W," },   // C#4
  { id: 24, start: 15.5, end: 16.35, midi: 66, lyric: "X," },   // F#4
  { id: 25, start: 16.5, end: 16.95, midi: 64, lyric: "Y" },    // E4
  { id: 26, start: 17.0, end: 17.45, midi: 63, lyric: "and" },  // D#4
  { id: 27, start: 17.5, end: 18.85, midi: 61, lyric: "Z." },   // C#4

  // Phrase 5: "Now I know my A-B-C's"
  { id: 28, start: 19.0, end: 19.45, midi: 59, lyric: "Now" },  // B3
  { id: 29, start: 19.5, end: 19.95, midi: 59, lyric: "I" },    // B3
  { id: 30, start: 20.0, end: 20.45, midi: 66, lyric: "know" }, // F#4
  { id: 31, start: 20.5, end: 20.95, midi: 66, lyric: "my" },   // F#4
  { id: 32, start: 21.0, end: 21.45, midi: 68, lyric: "A-" },   // G#4
  { id: 33, start: 21.5, end: 21.95, midi: 68, lyric: "B-" },   // G#4
  { id: 34, start: 22.0, end: 22.90, midi: 66, lyric: "C's," }, // F#4

  // Phrase 6: "Next time won't you sing with me?"
  { id: 35, start: 23.0, end: 23.45, midi: 64, lyric: "Next" }, // E4
  { id: 36, start: 23.5, end: 23.95, midi: 64, lyric: "time" }, // E4
  { id: 37, start: 24.0, end: 24.45, midi: 63, lyric: "won't" },// D#4
  { id: 38, start: 24.5, end: 24.95, midi: 63, lyric: "you" },  // D#4
  { id: 39, start: 25.0, end: 25.45, midi: 61, lyric: "sing" }, // C#4
  { id: 40, start: 25.5, end: 25.95, midi: 61, lyric: "with" }, // C#4
  { id: 41, start: 26.0, end: 27.80, midi: 59, lyric: "me?" },  // B3
];

// Harmonic accompaniment chords in B Major
export const ALPHABET_CHORDS: ChordEvent[] = [
  { time: 0.0,  duration: 3.0, root: 35, chordNotes: [47, 51, 54], name: "B" },
  { time: 3.0,  duration: 2.0, root: 35, chordNotes: [47, 51, 54], name: "B" },
  { time: 5.0,  duration: 2.0, root: 40, chordNotes: [47, 52, 56], name: "E" },
  { time: 7.0,  duration: 2.0, root: 40, chordNotes: [47, 52, 56], name: "E" },
  { time: 9.0,  duration: 2.5, root: 42, chordNotes: [46, 49, 54], name: "F#" },
  { time: 11.5, duration: 2.0, root: 35, chordNotes: [47, 51, 54], name: "B" },
  { time: 13.5, duration: 2.0, root: 40, chordNotes: [47, 52, 56], name: "E" },
  { time: 15.5, duration: 2.0, root: 35, chordNotes: [47, 51, 54], name: "B" },
  { time: 17.5, duration: 1.5, root: 42, chordNotes: [46, 49, 54], name: "F#" },
  { time: 19.0, duration: 2.0, root: 35, chordNotes: [47, 51, 54], name: "B" },
  { time: 21.0, duration: 2.0, root: 40, chordNotes: [47, 52, 56], name: "E" },
  { time: 23.0, duration: 2.0, root: 40, chordNotes: [47, 52, 56], name: "E" },
  { time: 25.0, duration: 2.0, root: 42, chordNotes: [46, 49, 54], name: "F#" },
  { time: 27.0, duration: 3.0, root: 35, chordNotes: [47, 51, 54, 59], name: "B" },
];

export const ALPHABET_SONG: Song = {
  id: "alphabet",
  title: ALPHABET_TITLE,
  artist: "Tradizionale • AudioPuppy",
  genre: "Nursery Rhyme & Pop",
  difficulty: 1,
  duration: ALPHABET_DURATION,
  countInDuration: ALPHABET_COUNT_IN_DURATION,
  bpm: 120,
  key: "B Major",
  vocalRange: "B3 - G#4",
  description: "La celebre melodia dell'alfabeto. Ideale per principianti, con salti di quinta e ottima per la coordinazione ritmica.",
  firstNoteHint: 'Prima Nota: "A" (B3)',
  notes: ALPHABET_NOTES,
  chords: ALPHABET_CHORDS,
  audioUrl: '/audio/alphabet_song.mp3',
};
