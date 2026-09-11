# 7H Music Prompter

Elite instrumental prompt engineer for **Suno v4**, **Udio**, **Stable Audio**, and **ElevenLabs**.

Takes a beat idea or kit + sliders and emits a dual-format pack. Style tags stay **under 200 characters**. Vocals are locked out.

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

Open `index.html` or serve the folder. Paste Style / Structure / Exclude into the engine you selected.
