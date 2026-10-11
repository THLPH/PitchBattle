import { SongNote, ChordEvent, Song } from '../types';

export const SONG_TITLE = "You Are My Sunshine";
export const SONG_DURATION = 35.0; // seconds
export const COUNT_IN_DURATION = 3.0; // 3 seconds count-in before first note

export const SUNSHINE_NOTES: SongNote[] = [
  // Phrase 1: "You are my sunshine, my only sunshine"
  { id: 1, start: 3.0, end: 3.4, midi: 60, lyric: "You" },       // C4
  { id: 2, start: 3.5, end: 3.9, midi: 62, lyric: "are" },       // D4
  { id: 3, start: 4.0, end: 4.4, midi: 64, lyric: "my" },        // E4
  { id: 4, start: 4.5, end: 5.3, midi: 64, lyric: "sun-" },      // E4
  { id: 5, start: 5.4, end: 6.7, midi: 64, lyric: "-shine," },   // E4

  { id: 6, start: 7.0, end: 7.4, midi: 62, lyric: "my" },        // D4
  { id: 7, start: 7.5, end: 8.1, midi: 64, lyric: "on-" },       // E4
  { id: 8, start: 8.2, end: 8.6, midi: 60, lyric: "-ly" },       // C4
  { id: 9, start: 8.7, end: 9.4, midi: 60, lyric: "sun-" },      // C4
  { id: 10, start: 9.5, end: 10.9, midi: 60, lyric: "-shine." }, // C4

  // Phrase 2: "You make me happy when skies are gray"
  { id: 11, start: 11.4, end: 11.8, midi: 60, lyric: "You" },     // C4
  { id: 12, start: 11.9, end: 12.3, midi: 62, lyric: "make" },    // D4
  { id: 13, start: 12.4, end: 12.8, midi: 64, lyric: "me" },      // E4
  { id: 14, start: 12.9, end: 13.6, midi: 65, lyric: "hap-" },    // F4
  { id: 15, start: 13.7, end: 15.0, midi: 69, lyric: "-py" },     // A4

  { id: 16, start: 15.4, end: 15.9, midi: 69, lyric: "when" },    // A4
  { id: 17, start: 16.0, end: 16.5, midi: 67, lyric: "skies" },   // G4
  { id: 18, start: 16.6, end: 17.1, midi: 65, lyric: "are" },     // F4
  { id: 19, start: 17.2, end: 18.7, midi: 64, lyric: "gray." },   // E4

  // Phrase 3: "You'll never know, dear, how much I love you"
  { id: 20, start: 19.2, end: 19.6, midi: 60, lyric: "You'll" },  // C4
  { id: 21, start: 19.7, end: 20.1, midi: 62, lyric: "ne-" },     // D4
  { id: 22, start: 20.2, end: 20.6, midi: 64, lyric: "-ver" },    // E4
  { id: 23, start: 20.7, end: 21.4, midi: 65, lyric: "know," },   // F4
  { id: 24, start: 21.5, end: 22.8, midi: 69, lyric: "dear," },   // A4

  { id: 25, start: 23.2, end: 23.7, midi: 69, lyric: "how" },     // A4
  { id: 26, start: 23.8, end: 24.3, midi: 67, lyric: "much" },    // G4
  { id: 27, start: 24.4, end: 24.9, midi: 65, lyric: "I" },       // F4
  { id: 28, start: 25.0, end: 25.7, midi: 64, lyric: "love" },    // E4
  { id: 29, start: 25.8, end: 27.0, midi: 60, lyric: "you." },    // C4

  // Phrase 4: "Please don't take my sunshine away"
  { id: 30, start: 27.5, end: 27.9, midi: 60, lyric: "Please" },  // C4
  { id: 31, start: 28.0, end: 28.4, midi: 62, lyric: "don't" },   // D4
  { id: 32, start: 28.5, end: 28.9, midi: 64, lyric: "take" },    // E4
  { id: 33, start: 29.0, end: 29.5, midi: 65, lyric: "my" },      // F4
  { id: 34, start: 29.6, end: 30.3, midi: 64, lyric: "sun-" },    // E4
  { id: 35, start: 30.4, end: 31.0, midi: 62, lyric: "-shine" },  // D4
  { id: 36, start: 31.1, end: 31.6, midi: 62, lyric: "a-" },      // D4
  { id: 37, start: 31.7, end: 33.5, midi: 60, lyric: "-way!" },   // C4
];

// Harmonic accompaniment chords
export const SUNSHINE_CHORDS: ChordEvent[] = [
  { time: 0.0, duration: 3.0, root: 36, chordNotes: [48, 52, 55], name: "C" },
  { time: 3.0, duration: 4.0, root: 36, chordNotes: [48, 52, 55], name: "C" },
  { time: 7.0, duration: 4.0, root: 36, chordNotes: [48, 52, 55], name: "C" },
  { time: 11.0, duration: 4.0, root: 41, chordNotes: [53, 57, 60], name: "F" },
  { time: 15.0, duration: 4.0, root: 36, chordNotes: [48, 52, 55], name: "C" },
  { time: 19.0, duration: 4.0, root: 41, chordNotes: [53, 57, 60], name: "F" },
  { time: 23.0, duration: 4.0, root: 36, chordNotes: [48, 52, 55], name: "C" },
  { time: 27.0, duration: 4.0, root: 43, chordNotes: [47, 50, 53, 55], name: "G7" },
  { time: 31.0, duration: 4.0, root: 36, chordNotes: [48, 52, 55, 60], name: "C" },
];

export const SUNSHINE_SONG: Song = {
  id: "sunshine",
  title: SONG_TITLE,
  artist: "Jimmie Davis / Charles Mitchell",
  genre: "Folk Tradizionale",
  difficulty: 2,
  duration: SONG_DURATION,
  countInDuration: COUNT_IN_DURATION,
  bpm: 100,
  key: "C Major",
  vocalRange: "C4 - A4",
  description: "Un classico intramontabile perfetto per scaldare la voce e testare l'intonazione sulle terze e quinte.",
  firstNoteHint: 'Prima Nota: "You" (C4)',
  notes: SUNSHINE_NOTES,
  chords: SUNSHINE_CHORDS,
};
