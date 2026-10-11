import React from 'react';
import { PlayerStats, Song } from '../types';

interface WinnerScreenProps {
  p1Stats: PlayerStats;
  p2Stats: PlayerStats;
  isSoloMode: boolean;
  onPlayAgain: () => void;
  song?: Song;
}

export const WinnerScreen: React.FC<WinnerScreenProps> = ({
  p1Stats,
  p2Stats,
  isSoloMode,
  onPlayAgain,
  song,
}) => {
  const p1Accuracy = p1Stats.totalFramesEvaluated > 0 
    ? (p1Stats.framesHit / p1Stats.totalFramesEvaluated * 100).toFixed(1) 
    : '0.0';
  
  const p2Accuracy = p2Stats.totalFramesEvaluated > 0 
    ? (p2Stats.framesHit / p2Stats.totalFramesEvaluated * 100).toFixed(1) 
    : '0.0';

  const p1Won = p1Stats.score >= p2Stats.score;

  const [aiFeedback, setAiFeedback] = React.useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (p1Stats.totalFramesEvaluated === 0) return;

    const fetchAiFeedback = async () => {
      setIsAiLoading(true);
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
        const songName = song?.title || "You Are My Sunshine";
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
        const text = data.candidates[0].content.parts[0].text;
        setAiFeedback(text);
      } catch (e) {
        console.error("AI fetch failed", e);
        setAiFeedback("Impossibile generare l'analisi AI al momento.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchAiFeedback();
  }, [p1Stats, p1Accuracy]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="max-w-[1440px] mx-auto px-margin w-full flex flex-col gap-space-xl">

<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md pb-space-sm">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-badge-score text-badge-score uppercase tracking-widest font-bold">Laboratorio DSP v4.2</span>
<span className="font-meter-readout text-badge-score text-outline uppercase tracking-wider">Sessione: #TK-8492-BO</span>
</div>
<h1 className="font-headline-battle text-display-hero text-on-surface tracking-tight mt-1">Musiggle Laboratorio Vocale</h1>
<p className="font-subheading-aria text-subheading-aria italic text-primary">La scienza del canto, l’arte della precisione.</p>
</div>

<div className="flex items-center gap-space-sm bg-surface-container-low p-2 rounded-xl shadow-sm">
<div className="flex items-center gap-space-sm px-space-md py-2 bg-surface-container-lowest rounded-lg">
<span className="material-symbols-outlined text-primary text-xl">album</span>
<div className="flex flex-col">
<span className="font-body-subtle text-body-subtle text-outline text-[11px] uppercase tracking-wider">Brano Di Riferimento</span>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface leading-snug">{song?.title || "You Are My Sunshine"}</span>
</div>
</div>
<div className="flex items-center gap-space-xs px-space-md py-2 bg-secondary-container/50 rounded-lg">
<span className="font-meter-readout text-body-subtle text-on-secondary-fixed-variant">Master: <strong className="text-on-surface">{song ? `${song.key} / ${song.bpm} BPM` : "C Mag / 100 BPM"}</strong></span>
</div>
</div>
</div>

<div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-stretch">

<div className="xl:col-span-4 bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between relative overflow-hidden">
<div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
<div className="flex items-center justify-between">
<span className="font-meter-readout text-badge-score uppercase tracking-widest text-outline">Giudizio Algoritmico</span>
<span className="px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-badge-score text-badge-score font-bold">GEMINI AI COACH</span>
</div>
<div className="flex flex-col items-center my-space-md text-center">

<div className="relative w-44 h-44 flex items-center justify-center">
<svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
<circle className="text-surface-container-high" cx="80" cy="80" fill="none" r="68" stroke="currentColor" strokeWidth="10"></circle>
<circle className="text-tertiary-container transition-all duration-1000" cx="80" cy="80" fill="none" r="68" stroke="currentColor" strokeDasharray="427.25" strokeDashoffset={`${427.25 - (427.25 * parseFloat(p1Accuracy)) / 100}`} strokeLinecap="round" strokeWidth="10"></circle>
</svg>
<div className="absolute flex flex-col items-center justify-center">
<span className="font-meter-readout text-display-hero-mobile font-bold text-on-surface leading-none">{p1Accuracy}<span className="text-subheading-aria text-tertiary-container font-semibold">%</span></span>
<span className="font-badge-score text-badge-score tracking-wider text-outline uppercase mt-1">Fedeltà Master</span>
</div>
</div>
<div className="mt-space-md">
<span className="font-subheading-aria text-subheading-aria text-primary font-bold block flex items-center justify-center gap-1">
  <span className="material-symbols-outlined text-sm">smart_toy</span> Analisi Personalizzata
</span>
<p className="font-body-default text-body-subtle text-on-surface-variant max-w-xs mt-1 text-pretty">
  {isAiLoading ? "L'Intelligenza Artificiale sta analizzando la tua performance vocale..." : (aiFeedback || "Nessuna voce rilevata.")}
</p>
</div>
</div>

<div className="flex flex-col gap-space-xs pt-space-sm">
<button className="w-full py-3 px-space-md rounded-xl bg-primary text-on-primary font-body-default font-bold text-center shadow-md hover:bg-primary-container transition-all flex items-center justify-center gap-space-sm" data-path="live-battle-match" >
<span className="material-symbols-outlined text-lg">swords</span>
<span>Sfida un Avversario in 1v1</span>
</button>
<div className="grid grid-cols-2 gap-space-xs">
<button className="py-2 px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-subtle text-body-subtle font-semibold flex items-center justify-center gap-1 transition-colors">
<span className="material-symbols-outlined text-base">ios_share</span> Esporta Stems
            </button>
<button className="py-2 px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-subtle text-body-subtle font-semibold flex items-center justify-center gap-1 transition-colors">
<span className="material-symbols-outlined text-base">replay</span> Registra di Nuovo
            </button>
</div>
</div>
</div>

<div className="xl:col-span-8 bg-surface-container-low rounded-2xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-xs">
<div>
<h2 className="font-headline-battle text-headline-battle-mobile text-on-surface">Radar delle 7 Dimensioni Vocali</h2>
<p className="font-body-subtle text-body-subtle text-on-surface-variant">Scomposizione armonica del segnale registrato rispetto al Master ISO-MPEG.</p>
</div>
<div className="flex items-center gap-space-sm self-start sm:self-auto">
<span className="flex items-center gap-1 font-badge-score text-badge-score text-primary font-bold">
<span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Master Originale
            </span>
<span className="flex items-center gap-1 font-badge-score text-badge-score text-tertiary-container font-bold">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-container inline-block"></span> La Tua Voce
            </span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">

<div className="md:col-span-5 flex items-center justify-center p-space-xs">
<div className="relative w-64 h-64">
<svg className="w-full h-full overflow-visible" viewBox="0 0 240 240">

<polygon className="text-surface-dim" fill="none" points="120,20 205,58 230,145 178,215 62,215 10,145 35,58" stroke="currentColor" strokeDasharray="3,3" strokeWidth="1"></polygon>
<polygon className="text-surface-dim" fill="none" points="120,50 180,75 198,135 160,185 80,185 42,135 60,75" stroke="currentColor" strokeWidth="1"></polygon>
<polygon className="text-surface-dim" fill="none" points="120,80 155,95 165,130 145,160 95,160 75,130 85,95" stroke="currentColor" strokeWidth="1"></polygon>

<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="120" y1="120" y2="20"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="205" y1="120" y2="58"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="230" y1="120" y2="145"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="178" y1="120" y2="215"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="62" y1="120" y2="215"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="10" y1="120" y2="145"></line>
<line className="text-surface-dim" stroke="currentColor" strokeWidth="1" x1="120" x2="35" y1="120" y2="58"></line>

<polygon className="text-primary" fill="rgba(163,57,0,0.12)" points="120,20 205,58 230,145 178,215 62,215 10,145 35,58" stroke="currentColor" strokeWidth="2"></polygon>


<polygon className="text-tertiary-container" fill="rgba(0,105,71,0.22)" points="120,24 205,58 224,148 173,207 65,209 21,142 44,65" stroke="currentColor" strokeWidth="2.5"></polygon>

<circle className="fill-tertiary-container" cx="120" cy="24" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="205" cy="58" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="224" cy="148" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="173" cy="207" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="65" cy="209" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="21" cy="142" r="3.5"></circle>
<circle className="fill-tertiary-container" cx="44" cy="65" r="3.5"></circle>

<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="middle" x="120" y="12">1. Melodia</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="start" x="215" y="55">2. Testo</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="start" x="235" y="150">3. Tonalità</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="middle" x="185" y="230">4. Tempo</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="middle" x="55" y="230">5. Armonia</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="end" x="5" y="150">6. Arrang.</text>
<text className="font-meter-readout fill-on-surface text-[9px] font-bold" text-anchor="end" x="25" y="55">7. Timbro</text>
</svg>
</div>
</div>

<div className="md:col-span-7 flex flex-col gap-2">
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">1. Melodia (Top-Line)</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">96%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[96%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">2. Testo &amp; Metrica Sillabica</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">100%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[100%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">3. Chiave &amp; Micro-Intonazione (Cents)</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">95%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[95%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">4. Tempo (BPM) &amp; Attacchi Ritmici</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">92%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[92%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">5. Letto Armonico &amp; Accordi</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">94%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[94%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">6. Bilanciamento Strumentale</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">90%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[90%] bg-tertiary-container"></span></span>
</div>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-lowest">
<span className="font-body-subtle text-body-subtle font-semibold text-on-surface">7. Timbro Vocale &amp; Vibrato (Hz)</span>
<div className="flex items-center gap-space-sm">
<span className="font-meter-readout text-badge-score text-tertiary-container font-bold">89%</span>
<span className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden flex"><span className="w-[89%] bg-tertiary-container"></span></span>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">

<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pb-space-sm bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-center gap-space-md">
<div className="flex items-center gap-space-xs">
<button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container transition-transform active:scale-95" id="playBtn">
<span className="material-symbols-outlined text-2xl">play_arrow</span>
</button>
<button className="w-8 h-8 rounded-lg bg-surface text-on-surface flex items-center justify-center hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-lg">stop</span>
</button>
</div>
<div className="flex flex-col">
<span className="font-meter-readout text-subheading-aria font-bold text-on-surface tracking-wider leading-none">01:42.340</span>
<span className="font-badge-score text-badge-score text-outline uppercase tracking-wider">Durata Totale: 03:28.000</span>
</div>
<div className="hidden sm:flex items-center gap-1 pl-space-md">
<span className="material-symbols-outlined text-outline text-lg">tune</span>
<span className="font-badge-score text-badge-score uppercase text-on-surface-variant font-semibold">Micro-Loop [Battute 32-36]</span>
<span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold ml-1">ATTIVO</span>
</div>
</div>

<div className="flex items-center gap-space-md">
<div className="flex flex-col items-end">
<span className="font-badge-score text-badge-score uppercase text-outline font-bold tracking-wider">A/B Crossfader Studio</span>
<span className="font-body-subtle text-body-subtle text-on-surface-variant">Originale Master ←→ Registrazione Utente</span>
</div>
<div className="flex items-center gap-space-xs bg-surface-container p-1 rounded-xl">
<span className="font-meter-readout text-badge-score font-bold px-1 text-primary">A</span>
<input className="w-28 accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer" max="100" min="0" type="range" value="50" />
<span className="font-meter-readout text-badge-score font-bold px-1 text-tertiary-container">B</span>
</div>
</div>
</div>

<div className="flex flex-col gap-space-md relative">

<div className="flex flex-col gap-1 p-space-md rounded-xl bg-surface-container-low/70 relative">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-primary-container"></span>
<span className="font-meter-readout text-meter-readout text-on-surface font-bold">TRACCIA 1 • Master Isolato (Lucio Dalla - Voce Guida)</span>
<span className="px-space-xs py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-badge-score text-badge-score uppercase font-bold">24-bit / 96kHz</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-meter-readout text-body-subtle text-primary font-bold">Solo M</span>
<span className="material-symbols-outlined text-outline text-lg cursor-pointer">volume_up</span>
</div>
</div>

<div className="h-16 w-full flex items-center gap-[3px] overflow-hidden py-2 px-1">
<div className="w-1 bg-primary/40 h-4 rounded-full"></div>
<div className="w-1 bg-primary/50 h-8 rounded-full"></div>
<div className="w-1 bg-primary/60 h-12 rounded-full"></div>
<div className="w-1 bg-primary/80 h-14 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary h-12 rounded-full"></div>
<div className="w-1 bg-primary/70 h-8 rounded-full"></div>
<div className="w-1 bg-primary/60 h-10 rounded-full"></div>
<div className="w-1 bg-primary h-14 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary/80 h-12 rounded-full"></div>
<div className="w-1 bg-primary/40 h-6 rounded-full"></div>
<div className="w-1 bg-primary/30 h-3 rounded-full"></div>
<div className="w-1 bg-primary/60 h-9 rounded-full"></div>
<div className="w-1 bg-primary h-14 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary h-10 rounded-full"></div>
<div className="w-1 bg-primary/50 h-5 rounded-full"></div>
<div className="w-1 bg-primary/80 h-13 rounded-full"></div>
<div className="w-1 bg-primary h-15 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary/90 h-14 rounded-full"></div>
<div className="w-1 bg-primary/70 h-8 rounded-full"></div>
<div className="w-1 bg-primary/40 h-4 rounded-full"></div>
<div className="w-1 bg-primary/30 h-2 rounded-full"></div>
<div className="w-1 bg-primary/70 h-11 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary h-15 rounded-full"></div>
<div className="w-1 bg-primary/90 h-12 rounded-full"></div>
<div className="w-1 bg-primary/60 h-7 rounded-full"></div>
<div className="w-1 bg-primary/80 h-13 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary h-14 rounded-full"></div>
<div className="w-1 bg-primary/70 h-9 rounded-full"></div>
<div className="w-1 bg-primary/40 h-4 rounded-full"></div>
<div className="w-1 bg-primary/70 h-10 rounded-full"></div>
<div className="w-1 bg-primary h-15 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary/80 h-11 rounded-full"></div>
<div className="w-1 bg-primary/50 h-6 rounded-full"></div>
<div className="w-1 bg-primary/30 h-3 rounded-full"></div>
<div className="w-1 bg-primary/60 h-8 rounded-full"></div>
<div className="w-1 bg-primary h-14 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary/80 h-12 rounded-full"></div>
<div className="w-1 bg-primary/50 h-6 rounded-full"></div>
<div className="w-1 bg-primary/80 h-14 rounded-full"></div>
<div className="w-1 bg-primary h-16 rounded-full"></div>
<div className="w-1 bg-primary h-11 rounded-full"></div>
<div className="w-1 bg-primary/60 h-6 rounded-full"></div>
</div>
</div>

<div className="flex flex-col gap-1 p-space-md rounded-xl bg-surface-container-low/70 relative">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
<span className="font-meter-readout text-meter-readout text-on-surface font-bold">TRACCIA 2 • Ripresa Vocale Utente (Take #03 Live)</span>
<span className="px-space-xs py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-badge-score text-badge-score uppercase font-bold">Mic: Shure Beta 58A • +4 Cents</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-meter-readout text-body-subtle text-tertiary-container font-bold">Live Rec</span>
<span className="material-symbols-outlined text-outline text-lg cursor-pointer">volume_up</span>
</div>
</div>

<div className="h-16 w-full flex items-center gap-[3px] overflow-hidden py-2 px-1">
<div className="w-1 bg-tertiary/30 h-3 rounded-full"></div>
<div className="w-1 bg-tertiary/50 h-7 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-11 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-13 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-16 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-11 rounded-full"></div>
<div className="w-1 bg-tertiary/70 h-7 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-10 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-13 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-11 rounded-full"></div>
<div className="w-1 bg-tertiary/40 h-5 rounded-full"></div>
<div className="w-1 bg-tertiary/30 h-2 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-8 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-13 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-16 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-9 rounded-full"></div>
<div className="w-1 bg-tertiary/50 h-4 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-12 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-14 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-16 rounded-full"></div>
<div className="w-1 bg-tertiary/90 h-13 rounded-full"></div>
<div className="w-1 bg-tertiary/70 h-8 rounded-full"></div>
<div className="w-1 bg-tertiary/40 h-4 rounded-full"></div>
<div className="w-1 bg-tertiary/30 h-2 rounded-full"></div>
<div className="w-1 bg-tertiary/70 h-10 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-14 rounded-full"></div>
<div className="w-1 bg-tertiary/90 h-11 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-6 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-12 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-13 rounded-full"></div>
<div className="w-1 bg-tertiary/70 h-8 rounded-full"></div>
<div className="w-1 bg-tertiary/40 h-3 rounded-full"></div>
<div className="w-1 bg-tertiary/70 h-9 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-14 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-10 rounded-full"></div>
<div className="w-1 bg-tertiary/50 h-5 rounded-full"></div>
<div className="w-1 bg-tertiary/30 h-2 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-7 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-13 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-11 rounded-full"></div>
<div className="w-1 bg-tertiary/50 h-5 rounded-full"></div>
<div className="w-1 bg-tertiary/80 h-13 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-15 rounded-full"></div>
<div className="w-1 bg-tertiary-container h-10 rounded-full"></div>
<div className="w-1 bg-tertiary/60 h-5 rounded-full"></div>
</div>
</div>

<div className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-primary z-20 pointer-events-none flex flex-col items-center">
<div className="w-3.5 h-3.5 bg-primary rotate-45 -mt-1 shadow-md"></div>
<div className="mt-auto px-1.5 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-meter-readout text-[10px] whitespace-nowrap mb-1">
            01:42.34
          </div>
</div>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-xs">
<div>
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-xl">piano</span>
<h3 className="font-headline-battle text-headline-battle-mobile text-on-surface">Piano Roll • Griglia di Sintonizzazione Centesimale</h3>
</div>
<p className="font-body-subtle text-body-subtle text-on-surface-variant mt-1">
            Visualizzazione stile Melodic Highway: le barre rettangolari indicano il pitch target originale, la linea continua rappresenta la risonanza vocale effettiva.
          </p>
</div>
<div className="flex items-center gap-space-sm">
<span className="flex items-center gap-1 font-badge-score text-badge-score text-tertiary-container font-bold">
<span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> Perfetto (±15c)
          </span>
<span className="flex items-center gap-1 font-badge-score text-badge-score text-primary font-bold">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Deviazione (&gt;35c)
          </span>
</div>
</div>

<div className="w-full bg-surface-container-high/40 rounded-xl p-space-md flex flex-col gap-2 relative overflow-hidden">

<div className="relative w-full h-72 flex">

<div className="w-14 flex flex-col justify-between py-1 font-meter-readout text-[11px] font-bold text-outline pr-2 select-none">
<div className="flex items-center justify-between"><span>F4</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between"><span>Eb4</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between"><span>D4</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between"><span>C4</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between text-primary"><span>Bb3</span><span className="w-2 h-0.5 bg-primary"></span></div>
<div className="flex items-center justify-between"><span>A3</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between"><span>G3</span><span className="w-2 h-0.5 bg-outline"></span></div>
<div className="flex items-center justify-between"><span>F3</span><span className="w-2 h-0.5 bg-outline"></span></div>
</div>

<div className="flex-1 relative overflow-hidden bg-surface-container-lowest/80 rounded-lg shadow-inner">

<div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-primary/20"></div>
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-surface-container-high"></div>
<div className="w-full h-px bg-surface-container-high"></div>
</div>


<div className="absolute top-[52%] left-[4%] w-[12%] h-6 rounded-md bg-secondary-container/80 flex items-center px-2">
<span className="font-meter-readout text-[10px] font-bold text-on-secondary-fixed">Bb3 (Te)</span>
</div>

<div className="absolute top-[40%] left-[19%] w-[10%] h-6 rounded-md bg-secondary-container/80 flex items-center px-2">
<span className="font-meter-readout text-[10px] font-bold text-on-secondary-fixed">C4 (vo-)</span>
</div>

<div className="absolute top-[28%] left-[32%] w-[18%] h-6 rounded-md bg-secondary-container/80 flex items-center px-2">
<span className="font-meter-readout text-[10px] font-bold text-on-secondary-fixed">D4 (-glio)</span>
</div>

<div className="absolute top-[16%] left-[53%] w-[14%] h-6 rounded-md bg-secondary-container/80 flex items-center px-2">
<span className="font-meter-readout text-[10px] font-bold text-on-secondary-fixed">Eb4 (be-)</span>
</div>

<div className="absolute top-[28%] left-[70%] w-[24%] h-6 rounded-md bg-secondary-container/80 flex items-center px-2">
<span className="font-meter-readout text-[10px] font-bold text-on-secondary-fixed">D4 (-ne assai...)</span>
</div>

<svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 300">

<defs>
<filter height="140%" id="emeraldGlow" width="140%" x="-20%" y="-20%">
<feGaussianBlur result="blur" stdDeviation="3"></feGaussianBlur>
<feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
</filter>
</defs>

<path className="text-tertiary-container" d="M 40,168 
                       C 80,165 110,164 150,162 
                       C 165,160 180,140 200,128 
                       C 230,126 270,125 300,123 
                       C 315,115 325,92 345,90 
                       C 380,88 470,89 510,87 
                       C 525,80 535,56 555,54 
                       C 600,52 650,53 680,68 
                       C 700,85 710,88 730,88
                       C 760,82 780,94 810,88 
                       C 830,82 850,94 880,88 
                       C 910,83 930,93 960,88" fill="none" filter="url(#emeraldGlow)" stroke="currentColor" strokeLinecap="round" strokeWidth="5"></path>

<circle className="fill-primary animate-ping" cx="680" cy="68" r="6"></circle>
<circle className="fill-primary" cx="680" cy="68" r="4.5"></circle>
</svg>

<div className="absolute top-4 left-[64%] bg-primary text-on-primary px-space-sm py-1 rounded-md text-[11px] font-meter-readout shadow-md pointer-events-none flex items-center gap-1">
<span className="material-symbols-outlined text-xs">warning</span>
              Rush Ritmico (+0.08s) su bar 34
            </div>
</div>
</div>

<div className="flex items-center justify-between px-space-md py-2 bg-surface-container rounded-lg">
<span className="font-body-subtle text-body-subtle text-outline uppercase font-semibold">Testo Cantato Sincronizzato:</span>
<div className="flex items-center gap-space-lg font-body-lyric-lg text-body-lyric-lg text-on-surface">
<span className="text-on-surface font-bold">“Te</span>
<span className="text-on-surface font-bold">vo-</span>
<span className="text-on-surface font-bold">glio</span>
<span className="text-tertiary-container font-bold underline decoration-tertiary-container decoration-2 underline-offset-4">be-</span>
<span className="text-tertiary-container font-bold">ne</span>
<span className="text-on-surface-variant font-medium">as-sai,</span>
<span className="text-outline text-body-default">ma tanto tanto bene sai...”</span>
</div>
<span className="font-meter-readout text-badge-score text-tertiary font-bold">Sillabe: 100% In Griglia</span>
</div>
</div>
</div>

<div className="flex flex-col gap-space-md">
<div className="flex flex-col gap-0.5">
<h3 className="font-headline-battle text-headline-battle-mobile text-on-surface">Analisi Approfondita dei 7 Parametri Musicali</h3>
<p className="font-body-subtle text-body-subtle text-on-surface-variant">
          Valutazione biometrica ed elettroacustica secondo gli standard di conservatorio e produzione discografica.
        </p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter">

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">1</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Melodia (Top-line)</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">96% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Pitch intervals accurate across 142 of 148 notes. Exceptional phrase ending control e transizioni di registro fluide nel passaggio di petto.
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">Note Centrate: 142/148</span>
<span className="font-badge-score text-badge-score text-tertiary-container font-bold">ECCELLENTE</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">2</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Testo &amp; Struttura</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">100% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Zero dropped syllables; verse, chorus, and bridge transitions hit exactly on beat. Dizione italiana nitida e fedele al testo originale.
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">Sillabe Perse: 0 / 238</span>
<span className="font-badge-score text-badge-score text-tertiary-container font-bold">IMPECCABILE</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">3</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Chiave &amp; Pitch</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">95% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Sung in original Key of Bb Major with 0 transpositions. Micro-tuning average: +4 cents (well within human studio tolerance).
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">Offset Medio: +4.1 Cents</span>
<span className="font-badge-score text-badge-score text-tertiary-container font-bold">Bb MAGGIORE</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">4</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Tempo (BPM) &amp; Ritmo</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">92% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Groove lock at 118 BPM. Slight rush on bar 34 chorus pickup (+0.08s). Ottima ripresa sul tema principale del ritornello.
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">BPM Calcolato: 118.2</span>
<span className="font-badge-score text-badge-score text-primary font-bold">LIEVE ANTICIPO</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">5</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Letto Armonico &amp; Accordi</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">94% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Vocal overtones resonate cleanly over underlying Bb - Gm - Eb - F progression. Nessuna dissonanza di seconda minore rilevata.
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">Progressione: Bb-Gm-Eb-F</span>
<span className="font-badge-score text-badge-score text-tertiary-container font-bold">CONSONANZA PURA</span>
</div>
</div>

<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">6</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Arrangiamento &amp; Pesi</span>
</div>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">90% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant">
            Acoustic vs Full Orchestra balance fidelity index: 90%. La voce buca il mix orchestrale nei crescendo con adeguata pressione dinamica.
          </p>
<div className="flex items-center justify-between pt-space-xs border-t-0 bg-surface-container-low p-2 rounded-lg">
<span className="font-meter-readout text-badge-score text-outline">Mix Headroom: +2.4 dB</span>
<span className="font-badge-score text-badge-score text-tertiary-container font-bold">EQUILIBRATO</span>
</div>
</div>

<div className="md:col-span-2 xl:col-span-3 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col gap-1 max-w-xl">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">7</div>
<span className="font-body-lyric-lg text-body-default font-bold text-on-surface">Timbro Vocale, Stile &amp; Vibrato</span>
<span className="px-space-sm py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-meter-readout text-badge-score font-bold">89% MATCH</span>
</div>
<p className="font-body-default text-body-subtle text-on-surface-variant mt-1">
              Vibrato frequency measured at 5.8Hz matching original delivery; warm chest-voice resonance. Attacco glottico dolce coerente con il fraseggio lirico italiano tradizionale.
            </p>
</div>

<div className="flex items-center gap-space-lg bg-surface-container-low p-space-md rounded-xl">
<div className="flex flex-col">
<span className="font-badge-score text-badge-score uppercase text-outline">Frequenza Vibrato</span>
<span className="font-meter-readout text-subheading-aria font-bold text-tertiary-container">5.8 Hz <span className="text-xs text-on-surface-variant font-normal">(±0.2)</span></span>
</div>
<div className="h-8 w-px bg-surface-container-high"></div>
<div className="flex flex-col">
<span className="font-badge-score text-badge-score uppercase text-outline">Risonanza Formanti</span>
<span className="font-meter-readout text-subheading-aria font-bold text-on-surface">Petto Caldo <span className="text-xs text-primary font-normal">(F1/F2 Ok)</span></span>
</div>
<div className="h-8 w-px bg-surface-container-high hidden sm:block"></div>
<div className="flex flex-col hidden sm:flex">
<span className="font-badge-score text-badge-score uppercase text-outline">Soffiosità HNR</span>
<span className="font-meter-readout text-subheading-aria font-bold text-on-surface">22.4 dB</span>
</div>
</div>
</div>
</div>
</div>

<div className="bg-surface-container rounded-2xl p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md shadow-sm mb-space-sm">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-3xl">emoji_events</span>
</div>
<div className="flex flex-col">
<h4 className="font-headline-battle text-subheading-aria text-on-surface font-bold">Pronto per il Duetto Competitivo?</h4>
<p className="font-body-subtle text-body-subtle text-on-surface-variant">
            Il tuo score di 93.7% ti colloca nel top 4% dei cantanti di “Caruso”. Lancia una sfida diretta su questo brano.
          </p>
</div>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="py-2.5 px-space-md rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-high font-body-default font-semibold transition-colors flex items-center gap-1 shadow-sm" data-path="party-and-qr-battle-room" >
<span className="material-symbols-outlined text-base">qr_code</span> Crea Stanza QR
        </button>
<button className="py-2.5 px-space-lg rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-default font-bold shadow-md transition-all flex items-center gap-1" data-path="live-battle-match" >
<span className="material-symbols-outlined text-base">mic</span> Avvia Live Battle 1v1
        </button>
</div>
</div>
</div>
</div>
    </div>
  );
};
