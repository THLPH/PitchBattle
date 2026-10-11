import { Song } from '../types';
import { SUNSHINE_SONG } from './sunshine';
import { ALPHABET_SONG } from './alphabet';

export * from './sunshine';
export * from './alphabet';

export const SONG_CATALOG: Song[] = [
  SUNSHINE_SONG,
  ALPHABET_SONG,
];

export const DEFAULT_SONG: Song = SUNSHINE_SONG;

export function getSongById(id: string): Song {
  return SONG_CATALOG.find((s) => s.id === id) || DEFAULT_SONG;
}
