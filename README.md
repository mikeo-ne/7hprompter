# 7H Music Prompter

Elite instrumental prompt engineer for **Suno v4**, **Udio**, **Stable Audio**, and **ElevenLabs** + Serato-style in-browser **Chop Sampler + Stem Splitter** (Serato Sample-like, as simple as Serato).

Takes a beat idea or kit + sliders and emits a dual-format pack. Style tags stay **under 200 characters**. Vocals are locked out. No server — sampler + stems decode locally.

## Output format

```
### 🎯 7H Style Tags (Copy to Style Box)
[comma-separated tags ≤ 200]

### 🎼 Structure & Metatag Prompt
[Instrumental]
[Intro] …
[Verse] …
[Drop] …
[Outro] …

### 🚫 Negative Tags (Copy to Exclude Box)
vocals, singing, rapping, choir, …
```

## Tag order

`Genre → Subgenre/Mood → Primary Instruments → Percussion Style → Production/Mix → BPM & Key → instrumental, no vocals`

Longer or conversational style strings get dropped by audio models. Do not write paragraphs in the Style box.

## Instrumental guarantee

1. Style ends with `instrumental, no vocals`
2. Structure opens with `[Instrumental]` and restates no-vocals per section
3. Exclude: `vocals, singing, rapping, choir, spoken word, ad-libs, toasting`

## Drum grids

| Kit | Grid | BPM |
| --- | --- | --- |
| Boom bap | snare on 2 and 4, swung hats | 88–96 |
| Trap | snare on 3, 808 slides | 130–150 |
| Dancehall | snare on 3, kick on 1 | 90–105 |
| Afrobeats | snare on 2+4, shekere, talking drum | 95–108 |
| Amapiano | log drum as bass, piano stabs | 110–115 |
| Dembow | kick on 1 + and-of-2, snare on 3 | 88–100 |

## Chop Sampler — Serato Simple

**As simple as Serato: Drop → Find Samples → Play Pads → Export.** Simple mode hides tweaks; Pro shows all.

In-browser, no upload. All via Web Audio `decodeAudioData`.

- **Drop audio** — WAV / MP3 / FLAC / OGG, decoded locally. Big drop zone + **Load demo break** (92 BPM dust break). Auto-chop on load.
- **One-click Find Samples** — transient detection (short-term energy + adaptive threshold + min-slice merge). Drag markers, double-click to add, right-click to merge, trim. 16 equal fallback.
- **16 pads × 2 banks** — A/B = 32 slices, Serato LEDs, 4×4 grid. Huge pads, bank toggle.
- **QWERTY + MIDI** — `Q W E R / A S D F / Z X C V / 1 2 3 4` + `Shift+key` for Bank B, MIDI notes 36–51 (A) / 52–67 (B), chromatic C3+ (60–75)
- **Slice / Chromatic** — slice = one chop per pad at original pitch; chromatic = selected chop pitched across 16 pads (root + semitone + fine, playbackRate)
- **Playback** — one-shot / gate, gain / attack / release, reverse / loop, pitch
- **Export** — per-slice 16-bit WAV (RIFF PCM) or ZIP STORE `7H_chop_A01…B16.wav` + `7H_prompt_pack.txt`

## Stem Splitter — Serato Sample-like (DSP Lite, No Upload)

One-click **Split Stems** like Serato Sample 2.0 — instant, in-browser, no AI server:

- **4 stems**: **Vocals** (centre 300–3400Hz), **Drums** (side + transient, highpass 150–180Hz), **Bass** (lowpass 250Hz), **Melody** (highpass remainder) — via `OfflineAudioContext` + Biquad + mid/side. DSP lite, not Demucs, but instant and private.
- **Isolate & Solo** — per-stem Play / Solo / Mute / Gain, mini-waveform, one-click **Chop This Stem → Pads** (auto-rechop). Switch stem, pads follow.
- **Use any stem as source** — original or any stem becomes the chop source (waveform updates, BPM estimate). Original always kept.
- **Export** — per-stem WAVs + ZIP `7H_stem_vocals.wav` etc. + chops ZIP of active stem. For studio-grade AI, export original and run Demucs/Spleeter externally — this stays 100% local.

Open `index.html` or serve the folder. Paste Style / Structure / Exclude into the engine you selected. Use **Sampler** tab: drop, Find Samples, play pads, Split Stems if needed, export to MPC / Serato / DAW.
