import React, { useState, useEffect } from 'react';
import { PlayerStats, Song } from '../types';

interface WinnerScreenProps {
  p1Stats: PlayerStats;
  p2Stats: PlayerStats;
  isSoloMode: boolean;
  onPlayAgain: () => void;
  onHome?: () => void;
  song?: Song;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  p1Stats,
  p2Stats,
  isSoloMode,
  onPlayAgain,
  onHome,
  song,
}) => {
  const p1Accuracy = p1Stats.totalFramesEvaluated > 0 
    ? (p1Stats.framesHit / p1Stats.totalFramesEvaluated * 100).toFixed(1) 
    : '0.0';
  
  const p2Accuracy = p2Stats.totalFramesEvaluated > 0 
    ? (p2Stats.framesHit / p2Stats.totalFramesEvaluated * 100).toFixed(1) 
    : '0.0';

  const p1Won = p1Stats.score >= p2Stats.score;

  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  useEffect(() => {
    if (p1Stats.totalFramesEvaluated === 0) return;

    const fetchAiFeedback = async () => {
      setIsAiLoading(true);
      try {
        const songName = song?.title || "You Are My Sunshine";

        // 1. Try secure backend proxy first (Vercel Serverless API)
        try {
          const apiRes = await fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              songTitle: songName,
              score: p1Stats.score,
              perfectHits: p1Stats.perfectHits,
              goodHits: p1Stats.goodHits,
              misses: p1Stats.misses,
              maxCombo: p1Stats.maxCombo,
              accuracy: p1Accuracy,
            }),
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData.feedback) {
              setAiFeedback(apiData.feedback);
              return;
            }
          }
        } catch {
          // Ignore and check client-side fallback
        }

        // 2. Client-side fallback if VITE_GEMINI_API_KEY is configured in local dev
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          setAiFeedback("Ottima sessione vocale! La precisione e la tenuta dell'intonazione sono state registrate con successo.");
          return;
        }

        const prompt = `Sei un vocal coach esperto e un giudice musicale AI. Il giocatore ha appena cantato "${songName}". 
Ha ottenuto un punteggio di ${p1Stats.score}.
Hit Perfetti: ${p1Stats.perfectHits}
Hit Buoni: ${p1Stats.goodHits}
Mancati (Misses): ${p1Stats.misses}
Combo Massima: ${p1Stats.maxCombo}
Precisione: ${p1Accuracy}%

Analizza la sua performance in modo conciso (2-3 frasi). Sii incoraggiante ma fai notare se ha mancato molte note o se è stato estremamente preciso in base ai dati. Scrivi in italiano.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        setAiFeedback(text || "Analisi completata con successo.");
      } catch (e) {
        console.error("AI fetch failed", e);
        setAiFeedback("Ottima esibizione! Precisione ritmica e controllo dell'intonazione ben dimostrati.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchAiFeedback();
  }, [p1Stats, p1Accuracy, song]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onHome || onPlayAgain}
    >
      <div 
        className="relative w-full max-w-md bg-surface-container-lowest dark:bg-surface-container-low rounded-3xl p-6 sm:p-7 shadow-2xl border border-outline-variant/30 flex flex-col items-center text-center gap-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Close Button */}
        <button
          onClick={onHome || onPlayAgain}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer border border-outline-variant/20"
          title="Chiudi"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Top Trophy Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <span className="material-symbols-outlined text-[36px]">emoji_events</span>
        </div>

        {/* Header & Title */}
        <div className="flex flex-col items-center gap-1">
          <span className="px-3 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-score text-[11px] uppercase tracking-wider font-bold">
            {isSoloMode ? "Esibizione Completata" : (p1Won ? "Vincitore: Giocatore 1" : "Vincitore: Giocatore 2")}
          </span>
          <h2 className="font-headline-battle text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {song?.title || "You Are My Sunshine"}
          </h2>
          <span className="text-xs font-meter-readout text-on-surface-variant">
            {song ? `${song.key} • ${song.bpm} BPM` : 'C Mag • 100 BPM'}
          </span>
        </div>

        {/* Main Score Display */}
        <div className="w-full bg-surface-container-low rounded-2xl p-4 flex flex-col items-center border border-outline-variant/20 shadow-xs">
          <span className="text-[11px] font-meter-readout uppercase text-outline tracking-wider font-semibold">
            Punteggio Finale
          </span>
          <div className="flex items-baseline gap-1 my-0.5">
            <span className="font-meter-readout text-4xl sm:text-5xl font-black text-primary leading-none">
              {p1Stats.score.toLocaleString()}
            </span>
            <span className="text-xs font-body-default text-on-surface-variant font-medium">pts</span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs font-meter-readout">
            <span className="text-tertiary font-bold">
              {p1Accuracy}% Precisione
            </span>
            <span className="text-outline">•</span>
            <span className="text-secondary font-semibold">
              Max Combo: {p1Stats.maxCombo}
            </span>
          </div>
        </div>

        {/* Breakdown Badges */}
        <div className="grid grid-cols-3 gap-2 w-full text-xs font-meter-readout">
          <div className="flex flex-col items-center p-2 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary">
            <span className="font-bold text-base leading-tight">{p1Stats.perfectHits}</span>
            <span className="text-[10px] uppercase font-semibold">Perfetti</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <span className="font-bold text-base leading-tight">{p1Stats.goodHits}</span>
            <span className="text-[10px] uppercase font-semibold">Buoni</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container border border-outline-variant/30 text-on-surface-variant">
            <span className="font-bold text-base leading-tight">{p1Stats.misses}</span>
            <span className="text-[10px] uppercase font-semibold">Miss</span>
          </div>
        </div>

        {/* AI Vocal Coach Feedback */}
        <div className="w-full p-3.5 rounded-xl bg-surface-container/70 border border-outline-variant/30 text-left flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center text-primary shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div className="flex flex-col gap-0.5 flex-1 text-xs">
            <span className="font-badge-score font-bold text-primary tracking-wide text-[11px] uppercase">
              Vocal Coach AI
            </span>
            {isAiLoading ? (
              <div className="flex items-center gap-2 text-on-surface-variant py-1">
                <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                <span>Analisi timbrica e intonazione in corso...</span>
              </div>
            ) : (
              <p className="text-on-surface font-body-default text-xs leading-relaxed">
                {aiFeedback || "Performance completata con successo."}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-on-primary font-body-default text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-container active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">replay</span>
            <span>Gioca Ancora</span>
          </button>
          <button
            onClick={onHome || onPlayAgain}
            className="py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-default text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            <span>Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
