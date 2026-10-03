#!/usr/bin/env python3
"""Region audio generator — motif-seeded, zero third-party samples.

Renders, from THIS game's stage-1 music bed (the first melody every player
hears, game.js scheduleMusicNote defaultThemes[0]: C E G C G E):
  - 3 seamless 24s stereo region loops (one per campaign block:
    R1 north, R2 Mexico lantern-pilot block, R3 holy finale)
  - 6 short mono SFX samples (jump, land, pickup, hurt, rescue, celebration)

Output is 16-bit PCM WAV; the repo ships AAC (.m4a) encoded from these WAVs
via ffmpeg (see --encode flag; Safari/iPhone-safe). Narration is NOT
synthesized here — scripts/render-narration.sh renders the world-1 strings
with system TTS.

Provenance: every sample is computed in this file from sine partials. No
audio input files are read. Owner-authorized zero-budget agent run
(2-saints Phase 3 treatment port). Faith & Family music review: pending
(see docs/audio-provenance.md).

Usage:
  python3 scripts/generate-audio.py --wav-dir /tmp/cs1-audio/wav \
      --m4a-dir audio --encode
"""
import argparse
import math
import os
import struct
import subprocess
import sys
import wave

SR = 44100

try:
    import numpy as np
except ImportError:
    sys.exit('numpy is required (repo dev env provides it)')

MAJOR = [0, 2, 4, 5, 7, 9, 11]
MINOR = [0, 2, 3, 5, 7, 8, 10]
# Stage-1 bed as scale degrees (C E G C G E in major; the high C is degree 7).
MOTIF = [0, 2, 4, 7, 4, 2]


def degree_to_semi(degree, mode):
    table = MAJOR if mode == 'major' else MINOR
    octaves, rest = divmod(degree, 7)
    return table[rest] + 12 * octaves


def adsr(n, attack, release):
    env = np.ones(n)
    a = min(n, int(attack * SR))
    r = min(n, int(release * SR))
    if a > 1:
        env[:a] = 0.5 - 0.5 * np.cos(np.linspace(0, math.pi, a))
    if r > 1:
        env[n - r:] = 0.5 + 0.5 * np.cos(np.linspace(0, math.pi, r))
    return env


def place(dst, src, at_sec):
    """Add src mono buffer into dst (mono or stereo) at offset seconds."""
    start = int(at_sec * SR)
    if start >= len(dst):
        return
    seg = src[:len(dst) - start]
    if dst.ndim == 2:
        dst[start:start + len(seg), 0] += seg
        dst[start:start + len(seg), 1] += seg
    else:
        dst[start:start + len(seg)] += seg


def lead_note(freq, dur, voice, shimmer=False):
    """One motif-melody note. Gentle attack, no clicks, no harsh partials."""
    n = max(8, int(dur * SR))
    t = np.arange(n) / SR
    vib = 1.0 + 0.0018 * np.sin(2 * math.pi * 5.2 * t)
    phase = np.cumsum(2 * math.pi * freq * vib) / SR
    if voice == 'musicbox':
        partials = [(1.0, 1.0), (0.30, 2.76), (0.10, 5.40)]
        decay = np.exp(-t / 0.55)
    elif voice == 'soft':
        partials = [(1.0, 1.0), (0.15, 2.0)]
        decay = np.exp(-t / 1.4)
    else:  # flute
        partials = [(1.0, 1.0), (0.25, 2.0), (0.10, 3.0)]
        decay = np.exp(-t / 1.1)
    sig = np.zeros(n)
    for amp, mult in partials:
        sig += amp * np.sin(phase * mult)
    sig *= decay * adsr(n, 0.03, 0.09)
    if shimmer:
        sig += 0.15 * np.sin(phase * 2.0) * decay * adsr(n, 0.03, 0.09)
    return sig / 1.6


def pad_chord(freqs, dur, detune_cents=3.0):
    """Slow-breathing triad, returned as a stereo pair (wide, quiet)."""
    n = max(8, int(dur * SR))
    t = np.arange(n) / SR
    env = adsr(n, 1.6, 1.8)
    out = np.zeros((n, 2))
    for i, f in enumerate(freqs):
        det = 2 ** (detune_cents / 1200)
        sig_l = np.sin(2 * math.pi * f / det * t + i)
        sig_r = np.sin(2 * math.pi * f * det * t + i * 2)
        sig_l += 0.3 * np.sin(2 * math.pi * f * 2 / det * t)
        sig_r += 0.3 * np.sin(2 * math.pi * f * 2 * det * t)
        out[:, 0] += sig_l
        out[:, 1] += sig_r
    out *= (env / max(1, len(freqs)) / 1.6)[:, None]
    return out


def bass_note(freq, dur):
    n = max(8, int(dur * SR))
    t = np.arange(n) / SR
    sig = np.sin(2 * math.pi * freq * t) + 0.2 * np.sin(2 * math.pi * freq * 2 * t)
    return sig * adsr(n, 0.05, 0.25) / 1.4


REGIONS = [
    # (root_hz, mode, beat, voice, shimmer, pad_lvl, bass_lvl, lead_lvl)
    (261.63, 'major', 0.50, 'flute', False, 0.11, 0.13, 0.30),  # R1 home
    (220.00, 'minor', 0.50, 'soft', False, 0.12, 0.13, 0.27),  # R2 reflective (lantern pilot)
    (261.63, 'major', 0.50, 'flute', True, 0.11, 0.13, 0.32),  # R3 radiant
]
PHRASE = 6.0
LOOP_LEN = 24.0
# Phrase roots: P1 tonic, P2 dominant answer, P3 subdominant breath, P4 tonic.
PHRASE_SHIFT = [0, 7, -5, 0]


def chord_for(mode, shift):
    if mode == 'major':
        roots = [0, 7, 5, 0]
        quals = ['maj', 'maj', 'maj', 'maj']
    else:
        roots = [0, 7, 3, 0]
        quals = ['min', 'min', 'maj', 'min']
    idx = PHRASE_SHIFT.index(shift)
    third = 4 if quals[idx] == 'maj' else 3
    return [roots[idx], roots[idx] + third, roots[idx] + 7]


def render_region_loop(region_idx):
    root, mode, beat, voice, shimmer, pad_lvl, bass_lvl, lead_lvl = REGIONS[region_idx]
    total = int(LOOP_LEN * SR)
    mix = np.zeros((total, 2))
    for p in range(4):
        base = p * PHRASE
        shift = PHRASE_SHIFT[p]
        # Lead: the 6-note stage-1 motif stated twice per phrase (statement
        # + answer, 12 notes x 0.5s = 6s). Degrees map through the region mode.
        # P4 answers with the motif's rising half (C E G C') then breathes a
        # full second: the tail rests at the seam so the echo taps wrap
        # silence, and the high C resolves across the seam into P1.
        for rep in range(2):
            for i, deg in enumerate(MOTIF):
                if p == 3 and rep == 1 and i >= len(MOTIF) - 2:
                    continue
                semi = degree_to_semi(deg, mode) + shift
                freq = root * 2 ** (semi / 12)
                note = lead_note(freq, beat, voice, shimmer) * lead_lvl
                place(mix, note, base + (rep * len(MOTIF) + i) * beat)
        # Pad + bass on the phrase chord.
        chord = [root * 2 ** (s / 12) for s in chord_for(mode, shift)]
        pad = pad_chord(chord, PHRASE) * pad_lvl
        s = int(base * SR)
        mix[s:s + len(pad)] += pad[:len(mix) - s]
        for half in range(2):
            b = bass_note(chord[0] / 2, PHRASE / 2) * bass_lvl
            place(mix, b, base + half * PHRASE / 2)
    # Chapel space: two deterministic short taps with wraparound reads, so
    # the echo of the tail lands on the head and the loop has no seam.
    # (No tail/head crossfade: the dry mix already rests at the boundary —
    # each note ends on the grid with a short release while P1 attacks from
    # zero — and a crossfade would graft the head attack transient onto
    # the tail.)
    wet = np.zeros_like(mix)
    for delay, gain, pan in ((0.375, 0.16, 0), (0.75, 0.10, 1)):
        d = int(delay * SR)
        wet[d:, pan] += mix[:-d, pan] * gain
        wet[:d, pan] += mix[-d:, pan] * gain
        wet[d:, 1 - pan] += mix[:-d, 1 - pan] * gain * 0.3
        wet[:d, 1 - pan] += mix[-d:, 1 - pan] * gain * 0.3
    mix += wet
    peak = np.abs(mix).max()
    if peak > 0:
        mix *= 0.8 / peak
    return mix


def sweep_tone(f0, f1, dur, curve=1.0, harmonic=0.3):
    n = max(8, int(dur * SR))
    t = np.arange(n) / SR
    k = (t / dur) ** curve
    freq = f0 + (f1 - f0) * k
    phase = np.cumsum(2 * math.pi * freq) / SR
    sig = np.sin(phase) + harmonic * np.sin(phase * 2)
    return sig * adsr(n, 0.008, dur * 0.55) / (1 + harmonic)


def chime(freq, dur, at, total, level=1.0):
    n = max(8, int(dur * SR))
    t = np.arange(n) / SR
    sig = np.sin(2 * math.pi * freq * t) + 0.3 * np.sin(2 * math.pi * freq * 2.76 * t)
    sig *= np.exp(-t / (dur * 0.45)) * adsr(n, 0.006, dur * 0.4)
    out = np.zeros(int(total * SR))
    place(out, sig * level / 1.4, at)
    return out


def render_sfx(kind):
    if kind == 'jump':  # bright rising chirp (between-stage hop)
        return sweep_tone(380, 740, 0.16) * 0.8
    if kind == 'land':  # soft touchdown thud (stage arrival)
        thud = sweep_tone(150, 80, 0.14, harmonic=0.1)
        tap = np.random.default_rng(7).standard_normal(len(thud))
        tap = np.convolve(tap, np.ones(24) / 24, mode='same')
        tap *= np.exp(-np.arange(len(thud)) / SR / 0.012) * 0.25
        return (thud + tap) * 0.8
    if kind == 'pickup':  # music-box chime arpeggio (Lux / star / rosary)
        out = np.zeros(int(0.5 * SR))
        for i, f in enumerate((659.25, 783.99, 987.77)):
            out += chime(f, 0.4, i * 0.07, 0.5, 0.8)
        return out
    if kind == 'hurt':  # muted low thud — felt, never harsh (kids)
        return sweep_tone(130, 88, 0.2, harmonic=0.08) * 0.75
    if kind == 'rescue':  # celebration arpeggio + shimmer (prayer / rosary)
        out = np.zeros(int(1.0 * SR))
        for i, f in enumerate((523.25, 659.25, 783.99, 1046.5, 1318.5)):
            out += chime(f, 0.55, i * 0.09, 1.0, 0.75)
        return out
    if kind == 'celebration':  # stage/world-complete fanfare (shorter than rescue)
        out = np.zeros(int(0.7 * SR))
        for i, f in enumerate((523.25, 659.25, 783.99, 1046.5)):
            out += chime(f, 0.5, i * 0.08, 0.7, 0.75)
        return out
    raise ValueError(kind)


def write_wav(path, data):
    stereo = data.ndim == 2
    frames = (np.clip(data, -1, 1) * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2 if stereo else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(frames.tobytes())


def encode_m4a(wav_path, m4a_path, bitrate, channels):
    cmd = ['ffmpeg', '-y', '-v', 'error', '-i', wav_path, '-c:a', 'aac',
           '-b:a', str(bitrate), '-ac', str(channels), '-movflags',
           '+faststart', m4a_path]
    subprocess.run(cmd, check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--wav-dir', required=True)
    ap.add_argument('--m4a-dir', required=True)
    ap.add_argument('--encode', action='store_true',
                    help='also encode .m4a via ffmpeg AAC')
    ap.add_argument('--only-kind', default=None,
                    help='render only one sfx kind (e.g. celebration)')
    args = ap.parse_args()
    os.makedirs(args.wav_dir, exist_ok=True)
    os.makedirs(args.m4a_dir, exist_ok=True)
    manifest = []
    loops = [] if args.only_kind else range(1, 4)
    for region in loops:
        mix = render_region_loop(region - 1)
        wav = os.path.join(args.wav_dir, f'region-{region}-loop.wav')
        write_wav(wav, mix)
        manifest.append((wav, f'region-{region}-loop.m4a', 96000, 2))
    kinds = (args.only_kind,) if args.only_kind else ('jump', 'land', 'pickup', 'hurt', 'rescue', 'celebration')
    for kind in kinds:
        sig = render_sfx(kind)
        peak = np.abs(sig).max()
        if peak > 0:
            sig = sig * 0.8 / peak
        wav = os.path.join(args.wav_dir, f'sfx-{kind}.wav')
        write_wav(wav, sig)
        manifest.append((wav, f'sfx-{kind}.m4a', 64000, 1))
    if args.encode:
        for wav, name, rate, ch in manifest:
            encode_m4a(wav, os.path.join(args.m4a_dir, name), rate, ch)
            print(f'{name}: {os.path.getsize(os.path.join(args.m4a_dir, name))} bytes')
    else:
        for wav, _, _, _ in manifest:
            print(wav)
    print(f'OK — {len(manifest)} renders')


if __name__ == '__main__':
    main()
