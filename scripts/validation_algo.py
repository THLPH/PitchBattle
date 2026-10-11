import os
import sys
import numpy as np
import librosa
import crepe
import subprocess
import json
import requests

# Load API key from environment variable or .env file
from dotenv import load_dotenv
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def run_demucs(audio_path, out_dir="separated"):
    """
    Step 1: Demucs 4-stem separation
    Separates the song into vocals, drums, bass, and other.
    """
    base_name = os.path.splitext(os.path.basename(audio_path))[0]
    stem_dir = os.path.join(out_dir, "htdemucs", base_name)
    
    stems = {
        "vocals": os.path.join(stem_dir, "vocals.wav"),
        "drums": os.path.join(stem_dir, "drums.wav"),
        "bass": os.path.join(stem_dir, "bass.wav"),
        "other": os.path.join(stem_dir, "other.wav"),
    }
    
    if all(os.path.exists(path) for path in stems.values()):
        print(f"Stems already exist in {stem_dir}, skipping separation.")
        return stems
        
    print(f"Running Demucs separation on {audio_path}...")
    # Using the standard htdemucs model
    cmd = ["demucs", "-n", "htdemucs", audio_path, "-o", out_dir]
    subprocess.run(cmd, check=True)
    
    return {
        "vocals": os.path.join(stem_dir, "vocals.wav"),
        "drums": os.path.join(stem_dir, "drums.wav"),
        "bass": os.path.join(stem_dir, "bass.wav"),
        "other": os.path.join(stem_dir, "other.wav"),
    }

def estimate_instrumental_tuning(bass_path, other_path):
    """
    Step 2: Tuning Offset
    Calculates librosa.estimate_tuning on the instrumental (bass + other).
    Drums are excluded to avoid broadband transient smearing.
    """
    print("Estimating tuning offset...")
    # Load and mix bass and other stems
    y_bass, sr = librosa.load(bass_path, sr=None)
    y_other, _ = librosa.load(other_path, sr=sr)
    
    # Mix them to create a harmonic instrumental track
    min_len = min(len(y_bass), len(y_other))
    y_inst = y_bass[:min_len] + y_other[:min_len]
    
    # Estimate tuning offset in fractions of a bin (semitone)
    tuning = librosa.estimate_tuning(y=y_inst, sr=sr)
    print(f"Detected tuning offset: {tuning:.2f} cents")
    return tuning, y_inst, sr

def extract_harmony_and_beats(y_other, sr, tuning_offset):
    """
    Step 3: Harmony
    Extracts tuning-aligned CENS chroma and beat tracking for slack windows.
    """
    print("Extracting CENS chroma and beat tracking...")
    # Beat tracking
    tempo, beats = librosa.beat.beat_track(y=y_other, sr=sr)
    
    # Tuning-aligned CENS chroma
    # We shift the pitch classes by the tuning offset to ensure correct bins
    chroma_cens = librosa.feature.chroma_cens(y=y_other, sr=sr, tuning=tuning_offset)
    
    return chroma_cens, beats, tempo

def extract_vocal_notes(vocal_path, confidence_threshold=0.8):
    """
    Step 4: Vocal Pitch Extraction
    Runs CREPE (full capacity) for high-precision f0 tracking,
    confidence-gated, and extracts note segments via hysteresis.
    """
    print("Running CREPE for vocal f0 extraction...")
    from scipy.signal import medfilt
    
    audio, sr = librosa.load(vocal_path, sr=16000) # CREPE operates at 16kHz
    
    # Run crepe model (capacity='full' for best accuracy)
    time, frequency, confidence, activation = crepe.predict(audio, sr, viterbi=True, model_capacity='full', step_size=10)
    
    # Confidence gating
    frequency[confidence < confidence_threshold] = np.nan
    
    # Smooth frequencies using a median filter to remove micro-glitches (hysteresis)
    # Filter out NaNs temporally
    freq_clean = np.copy(frequency)
    valid = ~np.isnan(freq_clean)
    if np.any(valid):
        freq_clean[valid] = medfilt(freq_clean[valid], kernel_size=5)
        
    return time, freq_clean, confidence

def calculate_scores(time, freq, chroma_cens, beats, tuning_offset):
    """
    Step 5: Harmonic Fit & Intonation Precision Scoring
    Calculates how well the vocal pitch fits the underlying chords (Harmonic Fit)
    and the micro-precision of the vocal intonation (Cents accuracy).
    """
    print("Calculating Harmonic Fit and Intonation Precision...")
    
    valid_idx = ~np.isnan(freq)
    valid_freq = freq[valid_idx]
    
    if len(valid_freq) == 0:
        return 0.0, 0.0, 0.0
        
    # Convert valid frequencies to MIDI notes (tuning corrected)
    # midi = 69 + 12 * log2(f/440)
    # Apply tuning offset so A4 is exactly aligned with the track's tuning
    f_ref = 440.0 * (2.0 ** (tuning_offset / 1200.0))
    midi_notes = 69 + 12 * np.log2(valid_freq / f_ref)
    
    # 1. Intonation Precision (Cents from tuning-corrected target)
    # Distance to the nearest integer MIDI note
    nearest_note = np.round(midi_notes)
    cents_error = np.abs(midi_notes - nearest_note) * 100
    
    # Perceptual curve: 0-15 cents is perfect (1.0), drops off after 35 cents
    precision_scores = np.clip(1.0 - (cents_error - 15) / 20.0, 0.0, 1.0)
    overall_precision = np.mean(precision_scores) * 100
    
    # 2. Harmonic Fit (Pitch class vs Chroma prominence)
    # Map time arrays to chroma frame indices
    sr_chroma = 22050 # librosa default
    hop_length = 512
    
    valid_times = time[valid_idx]
    chroma_frames = librosa.time_to_frames(valid_times, sr=sr_chroma, hop_length=hop_length)
    
    fit_scores = []
    for i, frame in enumerate(chroma_frames):
        if frame < chroma_cens.shape[1]:
            pitch_class = int(nearest_note[i] % 12)
            # Slack window: ±1 beat (simplified here as ± frames)
            # In a full implementation, you'd find the nearest beat from `beats`
            window_start = max(0, frame - 5)
            window_end = min(chroma_cens.shape[1], frame + 5)
            
            # Prominence of the sung pitch class in the underlying harmony
            prominence = np.max(chroma_cens[pitch_class, window_start:window_end])
            fit_scores.append(prominence)
            
    overall_harmonic_fit = np.mean(fit_scores) * 100 if fit_scores else 0.0
    
    # 3. Coverage
    coverage = (len(valid_freq) / len(freq)) * 100
    
    return overall_harmonic_fit, overall_precision, coverage

def generate_gemini_report(harmonic_fit, precision, coverage):
    """
    Step 6: Gemini Report Generation
    """
    print("Generating AI report via Gemini...")
    
    prompt = f"""
    You are an expert audio engineer and vocal producer. 
    Analyze the following vocal extraction metrics derived from a master track:
    - Harmonic Fit (Pitch class vs Chroma prominence): {harmonic_fit:.1f}/100
    - Intonation Precision (Tuning-corrected cents accuracy): {precision:.1f}/100
    - Vocal Coverage (Percentage of track with voiced phonemes): {coverage:.1f}%
    
    Provide a professional, technical 1-paragraph summary of the singer's performance. 
    Focus on their pitch accuracy, their ability to lock into the instrumental harmony, and the stability of their tuning.
    """
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, json=payload)
        data = response.json()
        report = data["candidates"][0]["content"]["parts"][0]["text"]
        return report
    except Exception as e:
        return f"Error generating report: {e}"

def analyze_song(audio_path):
    stems = run_demucs(audio_path)
    
    tuning_offset, y_inst, sr_inst = estimate_instrumental_tuning(stems["bass"], stems["other"])
    
    chroma_cens, beats, tempo = extract_harmony_and_beats(y_inst, sr_inst, tuning_offset)
    
    time, freq, conf = extract_vocal_notes(stems["vocals"])
    
    harmonic_fit, precision, coverage = calculate_scores(time, freq, chroma_cens, beats, tuning_offset)
    
    print("\n--- FINAL SCORES ---")
    print(f"Harmonic Fit: {harmonic_fit:.1f}%")
    print(f"Intonation Precision: {precision:.1f}%")
    print(f"Vocal Coverage: {coverage:.1f}%\n")
    
    report = generate_gemini_report(harmonic_fit, precision, coverage)
    print("--- GEMINI AI REPORT ---")
    print(report)
    print("------------------------")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validation_algo.py <path_to_audio_file>")
        sys.exit(1)
        
    target_audio = sys.argv[1]
    if not os.path.exists(target_audio):
        print(f"File not found: {target_audio}")
        sys.exit(1)
        
    analyze_song(target_audio)
