# 7H Music Prompter

Elite instrumental prompt engineer for **Suno v4**, **Udio**, **Stable Audio**, and **ElevenLabs** + Serato-style in-browser **Chop Sampler**.

Takes a beat idea or kit + sliders and emits a dual-format pack. Style tags stay **under 200 characters**. Vocals are locked out. No server — sampler decodes audio locally.

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

## Chop Sampler (Serato-style)

In-browser, no upload. All via Web Audio `decodeAudioData`.

- **Drop audio** — WAV / MP3 / FLAC / OGG, decoded locally
- **Auto-chop transients** — short-term energy + adaptive threshold + min-slice merge; drag markers, double-click to add, right-click to delete, trim start/end
- **16 pads × 2 banks** — A/B = 32 slices, Serato-style LEDs, 4×4 grid
- **QWERTY + MIDI** — `Q W E R / A S D F / Z X C V / 1 2 3 4` + `Shift+key` for Bank B, MIDI notes 36–51 (A) / 52–67 (B), chromatic C3+ in chromatic mode
- **Slice / Chromatic** — slice = one chop per pad at original pitch, chromatic = selected chop pitched across 16 pads (semitone + fine)
- **Playback** — one-shot / gate, gain / attack / release, reverse / loop, semitone / fine / root
- **Export** — per-slice 16-bit WAV (RIFF PCM) or ZIP (STORE, no re-encode) `7H_chop_A01…B16.wav` + optional `7H_prompt_pack.txt`

Open `index.html` or serve the folder. Paste Style / Structure / Exclude into the engine you selected. Use Sampler tab for chops, then export to MPC / Serato / DAW.
