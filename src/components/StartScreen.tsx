import React from 'react';
import { TunerState, Song } from '../types';

interface StartScreenProps {
  isSoloMode: boolean;
  onSetSoloMode: (solo: boolean) => void;
  onStartGame: () => void;
  micConnected: boolean;
  onConnectMic: () => void;
  tunerState: TunerState;
  autoSing: boolean;
  onToggleAutoSing: (enabled: boolean) => void;
  currentSong: Song;
  onOpenLibrary: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  micConnected,
  onConnectMic,
  tunerState,
  autoSing,
  onToggleAutoSing,
  currentSong,
  onOpenLibrary,
}) => {
  return (
    <section className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col justify-between px-margin-mobile lg:px-margin max-w-[1440px] mx-auto py-space-xl">
<div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="flex items-center justify-between w-full pt-space-sm"><button id="theme-toggle" type="button" onClick={() => document.documentElement.classList.toggle('dark')} className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface shadow-sm cursor-pointer" aria-label="Cambia tema" ><span id="theme-icon" className="material-symbols-outlined text-[24px] text-primary">dark_mode</span></button><div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container shadow-sm border border-outline-variant/30 text-on-surface" ><span className="material-symbols-outlined text-[18px] text-primary">emoji_events</span><span className="font-badge-score text-badge-score tracking-wider uppercase font-semibold text-on-surface">BEL CANTO</span><span className="w-px h-3 bg-outline-variant/50"></span><span className="font-meter-readout text-badge-score text-tertiary font-bold">2844 cantanti online ora</span></div></div>
<div className="flex flex-col items-center text-center my-auto py-space-xl">
<div className="flex flex-col items-center max-w-4xl mx-auto gap-6 py-4">
<span className="font-badge-score text-sm md:text-base tracking-[0.25em] text-primary uppercase font-semibold">
          Duello Vocale Istantaneo • Pitch-Tracked Live
        </span>
<h1 className="font-display-hero text-6xl md:text-8xl tracking-tight text-on-surface text-balance">
          Musiggle
        </h1>
<p className="font-subheading-aria text-xl md:text-3xl italic text-primary font-normal tracking-wide">
          “La voce non mente mai.”
        </p>
<p className="font-body-default text-base md:text-xl text-on-surface-variant max-w-xl mx-auto text-balance leading-relaxed">
          Accoppiamento casuale 1 contro 1. La precisione dell'intonazione a confronto in tempo reale. Due microfoni, una sola melodia, nessun artificio.
        </p>
</div>
<div className="w-full max-w-md mt-space-xl flex flex-col items-center gap-space-md">
  {/* Selected Song Preview Pill */}
  <button
    type="button"
    onClick={onOpenLibrary}
    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface shadow-xs transition-all text-left cursor-pointer group"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <span className="material-symbols-outlined text-[18px]">album</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-meter-readout uppercase tracking-widest text-outline font-semibold">Brano Selezionato</span>
        <span className="text-sm font-bold text-on-surface line-clamp-1">{currentSong.title}</span>
      </div>
    </div>
    <div className="flex items-center gap-1 text-xs text-primary font-semibold shrink-0">
      <span className="hidden sm:inline">Cambia Brano</span>
      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">chevron_right</span>
    </div>
  </button>

  <a className="group relative w-full flex flex-col items-center justify-center text-center px-space-lg py-7 rounded-xl bg-primary text-on-primary shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 overflow-hidden cursor-pointer" data-path="mic-check-&-calibration" href="#" onClick={(e) => { e.preventDefault(); onStartGame(); }}><div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div><div className="flex items-center justify-center gap-space-xs mb-2"><span className="material-symbols-outlined text-[28px] text-primary-fixed">swords</span><span className="material-symbols-outlined text-[28px] text-on-primary">mic</span></div><div className="flex flex-col items-center justify-center text-center"><span className="font-body-lyric-lg text-body-lyric-lg font-bold tracking-tight text-on-primary leading-tight text-center">Entra in Coda</span><span className="font-badge-score text-badge-score uppercase text-primary-fixed tracking-wider opacity-90 mt-1 text-center">1v1 Vocal Battle • {currentSong.title}</span></div></a>
  <div className="grid grid-cols-2 gap-space-sm w-full">
    <button onClick={onOpenLibrary} className="flex items-center justify-center gap-space-xs px-space-md py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface hover:text-primary shadow-sm transition-all text-left cursor-pointer" type="button">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">library_music</span>
      <span className="font-body-default text-body-default font-medium">Canzoniere</span>
    </button>
    <button className="flex items-center justify-center gap-space-xs px-space-md py-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface hover:text-primary shadow-sm transition-all text-left" type="button">
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">lock</span>
      <span className="font-body-default text-body-default font-medium">Stanza Privata</span>
    </button>
  </div>
</div>
</div>

</section>
  );
};
