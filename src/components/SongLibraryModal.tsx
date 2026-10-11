import React, { useState } from 'react';
import { Song } from '../types';
import { SONG_CATALOG } from '../songs';

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSong: Song;
  onSelectSong: (song: Song) => void;
}

export const SongLibraryModal: React.FC<SongLibraryModalProps> = ({
  isOpen,
  onClose,
  currentSong,
  onSelectSong,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Tutti');

  if (!isOpen) return null;

  const genres = ['Tutti', 'Folk Tradizionale', 'Nursery Rhyme & Pop'];

  const filteredSongs = SONG_CATALOG.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'Tutti' || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest dark:bg-surface-container-low rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[24px]">library_music</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-battle text-2xl font-bold text-on-surface">Canzoniere &amp; Archivio Brani</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-score text-[11px] uppercase tracking-wider font-semibold">
                  {SONG_CATALOG.length} Brani
                </span>
              </div>
              <p className="font-body-subtle text-xs text-on-surface-variant">
                Seleziona il brano da eseguire nel duello o nella modalità di pratica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Chiudi libreria"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 bg-surface-container-lowest border-b border-outline-variant/20 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder="Cerca per titolo, artista o melodia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-badge-score transition-all ${
                  selectedGenre === g
                    ? 'bg-primary text-on-primary shadow-xs font-bold'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Song Cards List */}
        <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
          {filteredSongs.map((song) => {
            const isSelected = currentSong.id === song.id;
            return (
              <div
                key={song.id}
                className={`group relative p-5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-md'
                    : 'bg-surface-container-low/60 hover:bg-surface-container-low border-outline-variant/30 hover:border-outline-variant hover:shadow-sm'
                }`}
                onClick={() => {
                  onSelectSong(song);
                  onClose();
                }}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {song.id === 'alphabet' ? 'spellcheck' : 'music_note'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-body-lyric-lg text-lg font-bold text-on-surface leading-snug">
                        {song.title}
                      </h3>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-badge-score text-[10px] uppercase font-bold tracking-wider">
                          Selezionato
                        </span>
                      )}
                      {song.id === 'alphabet' && (
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-score text-[10px] uppercase font-bold tracking-wider">
                          Nuovo
                        </span>
                      )}
                    </div>

                    <p className="font-body-subtle text-xs text-on-surface-variant">
                      {song.artist} • <span className="italic">{song.genre}</span>
                    </p>

                    <p className="font-body-default text-xs text-on-surface-variant/90 line-clamp-2 mt-1">
                      {song.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-meter-readout text-on-surface-variant">
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        {song.key}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        {song.bpm} BPM
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        Estensione: {song.vocalRange}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant/30">
                        {song.duration}s
                      </span>
                      <span className="flex items-center gap-0.5 text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-[13px]"
                            style={{ fontVariationSettings: `'FILL' ${i < song.difficulty ? 1 : 0}` }}
                          >
                            star
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSong(song);
                      onClose();
                    }}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-body-default text-sm font-semibold transition-all shadow-sm ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-primary/30'
                        : 'bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface'
                    }`}
                  >
                    {isSelected ? '✓ In Uso' : 'Scegli Brano'}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredSongs.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
              <p className="font-body-default">Nessun brano trovato con i filtri correnti.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
          <span className="font-body-subtle text-xs text-on-surface-variant">
            Brano attivo attuale: <strong className="text-on-surface">{currentSong.title}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
