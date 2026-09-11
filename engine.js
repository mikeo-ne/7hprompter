/* 7H Music Prompter — prompt engineer.
   Taxonomy: Genre -> Subgenre/Mood -> Instruments -> Percussion -> Mix -> BPM & Key
   Style box hard-capped at 200 chars. Instrumental lock always on. */

window.STYLE_CORE = {
  "boom-bap": { genre: "boom-bap hip-hop", mood: "gritty laid-back", inst: "chopped dusty soul, warm bass", perc: "snare on 2-and-4, swung hats", mix: "vinyl MPC dry mix", keys: ["boom bap", "boombap", "90s hip hop", "east coast", "mpc", "dusty"] },
  "sample-chop": { genre: "sample-chop hip-hop", mood: "moody late-night", inst: "jazz chops, heavy two-note bass", perc: "snare on 2-and-4, ghost notes", mix: "low-pass analog grit", keys: ["sample", "chop", "jazz hop", "underground"] },
  "atl-trap": { genre: "Atlanta trap", mood: "dark menacing", inst: "808 slides, sparse minor pluck", perc: "snare on 3, triplet hats", mix: "heavy sub, spacious digital", keys: ["trap", "atlanta", "808", "metro", "half-time"] },
  "melodic-trap": { genre: "melodic trap", mood: "emotional dark-sweet", inst: "sad guitar, melodic 808", perc: "snare on 3, rolling hats", mix: "wet melody, dry drums", keys: ["melodic trap", "sad trap", "guitar trap"] },
  "uk-drill": { genre: "UK drill", mood: "cold menacing", inst: "sliding 808, minor piano", perc: "syncopated snare, hat rolls", mix: "cold dry street mix", keys: ["uk drill", "drill", "south london", "sliding 808"] },
  "ny-drill": { genre: "NY drill", mood: "aggressive grimy", inst: "distorted 808, dark piano", perc: "loud snare on 3, flams", mix: "loud clipped street", keys: ["ny drill", "brooklyn", "bronx", "new york drill"] },
  "g-funk": { genre: "G-funk west coast hip-hop", mood: "laid-back funky", inst: "whiny synth lead, funky bass", perc: "snare on 2-and-4, open hats", mix: "warm analog cruise", keys: ["g-funk", "g funk", "west coast", "lowrider", "funk"] },
  "crunk": { genre: "dirty south crunk", mood: "aggressive hypnotic", inst: "huge 808, orchestra stabs", perc: "slow snare, simple hats", mix: "loud club PA", keys: ["crunk", "dirty south", "trunk", "memphis crunk"] },
  "rage": { genre: "rage hip-hop", mood: "distorted frantic", inst: "blown 808, detuned lead", perc: "glitchy hats, thin snare on 3", mix: "overdriven clip", keys: ["rage", "opium", "distorted 808", "pluggnb rage"] },
  "lofi-hop": { genre: "lo-fi hip-hop", mood: "mellow hazy", inst: "detuned Rhodes, soft bass", perc: "muted snare on 2-and-4, swung hats", mix: "vinyl crackle tape", keys: ["lofi", "lo-fi", "chillhop", "study beat"] },
  "quiet-storm": { genre: "quiet-storm R&B", mood: "sensual late-night", inst: "Rhodes, warm bass, silky pad", perc: "snare on 2-and-4, finger snaps", mix: "analog bedroom warmth", keys: ["quiet storm", "slow rnb", "r&b", "rnb"] },
  "new-jack": { genre: "new jack swing", mood: "bouncy funky", inst: "synth bass, bell stabs", perc: "swung snare on 2-and-4, claps", mix: "dry 90s drum machine", keys: ["new jack", "swingbeat", "90s rnb"] },
  "neo-soul": { genre: "neo-soul", mood: "warm intimate groove", inst: "Rhodes, wah guitar, electric bass", perc: "live pocket, ghost snares", mix: "vinyl live-room", keys: ["neo soul", "neo-soul", "d'angelo pocket", "wah"] },
  "dark-rnb": { genre: "dark alt R&B", mood: "moody nocturnal", inst: "sub bass, icy synth", perc: "half-time snare on 3", mix: "night-drive reverb", keys: ["dark rnb", "alt rnb", "the weeknd", "xo", "alternative r&b"] },
  "trap-soul": { genre: "trap-soul R&B", mood: "emotional smooth", inst: "soul chords, clean 808", perc: "snare on 3, light hat rolls", mix: "polished dry drums", keys: ["trap soul", "trapsoul", "modern rnb"] },
  "slow-jam": { genre: "90s slow-jam R&B", mood: "romantic lush", inst: "lush pads, electric piano", perc: "fat snare on 2-and-4, snaps", mix: "wide 90s R&B mix", keys: ["slow jam", "90s rnb", "slowjam"] },
  "bedroom-rnb": { genre: "bedroom R&B", mood: "intimate hazy", inst: "detuned keys, soft 808", perc: "light snare, closed hats", mix: "close-mic tape", keys: ["bedroom rnb", "diy rnb", "hazy rnb"] },
  "digital-riddim": { genre: "digital dancehall riddim", mood: "raw hypnotic yard", inst: "square digital bass, sparse stab", perc: "snare on 3, shuffle hats", mix: "80s Kingston digital", keys: ["digital riddim", "dancehall", "sleng", "yard", "riddim"] },
  "bashment": { genre: "modern bashment dancehall", mood: "aggressive dancefloor", inst: "sliding bass, guitar skank", perc: "snare on 3, busy shuffle", mix: "modern club riddim", keys: ["bashment", "dancehall", "kingston", "toast"] },
  "one-drop-dh": { genre: "one-drop reggae-dancehall", mood: "heavy roots", inst: "skank guitar, organ, deep bass", perc: "rimshot on 3, one-drop", mix: "spring reverb analog", keys: ["one drop", "one-drop", "reggae", "roots", "dub"] },
  "wine": { genre: "slow wine dancehall", mood: "sensual heavy night", inst: "deep slow bass, airy synth", perc: "fat snare on 3, simple shuffle", mix: "dark body-tempo club", keys: ["wine", "slow dancehall", "rub up"] },
  "dh-trap": { genre: "dancehall-trap", mood: "dark bouncy", inst: "808 slides, dark pluck", perc: "snare on 3, dancehall grid", mix: "modern crossover club", keys: ["dancehall trap", "bashment trap"] },
  "island-pop": { genre: "island-pop dancehall", mood: "bright summer", inst: "tropical guitar, horn stab", perc: "snare on 3, bright shuffle", mix: "polished radio riddim", keys: ["island pop", "tropical dancehall", "summer riddim"] },
  "steppers": { genre: "steppers rub-a-dub", mood: "driving hypnotic roots", inst: "organ bubble, walking bass", perc: "steppers kick, straight 8ths", mix: "analog Jamaican spring reverb", keys: ["steppers", "rub a dub", "rub-a-dub"] },
  "lagos-afro": { genre: "Nigerian afrobeats", mood: "groovy night-drive", inst: "muted guitar, warm bass", perc: "shekere pulse, talking drum, snare on 2-and-4", mix: "Lagos club polish", keys: ["afrobeats", "afro beats", "lagos", "nigeria", "wizkid", "burna", "shekere"] },
  "afro-fusion": { genre: "afro-fusion", mood: "romantic groovy", inst: "melodic guitar, lush keys, warm bass", perc: "shekere, talking drum, soft clap", mix: "streaming-ready warm", keys: ["afro fusion", "afro-fusion", "afropop"] },
  "amapiano": { genre: "amapiano", mood: "hypnotic deep Joburg", inst: "log drum bass, piano stabs", perc: "soft shakers, laid-back clap", mix: "spacious SA piano-house", keys: ["amapiano", "log drum", "joburg", "piano house"] },
  "afro-house": { genre: "afro house", mood: "uplifting hypnotic", inst: "warm sidechain bass, piano stabs", perc: "4/4 kick, organic congas", mix: "warm peak-time club", keys: ["afro house", "afrohouse"] },
  "highlife": { genre: "highlife groove", mood: "bright joyful", inst: "guitar arpeggios, horn stabs", perc: "congas, snare on 2-and-4", mix: "live-band West African warmth", keys: ["highlife", "ghana", "accra", "palm wine"] },
  "afro-trap": { genre: "afro-trap", mood: "dark-groovy street", inst: "808, flute pluck", perc: "afro perc + trap rolls", mix: "night heavy low-end", keys: ["afro trap", "afrotrap"] },
  "alte": { genre: "Nigerian alté", mood: "left-field hazy", inst: "dreamy guitar, elastic bass", perc: "broken hats, odd shakers", mix: "DIY-luxe alternative", keys: ["alte", "alté", "alt afro"] },
  "gqom": { genre: "Durban gqom", mood: "dark raw hypnotic", inst: "sub hits, sparse stabs", perc: "broken gqom kick, not 4/4", mix: "raw taxi-rank club", keys: ["gqom", "durban"] },
  "afro-rnb": { genre: "afro-R&B", mood: "sensual smooth", inst: "Rhodes, muted guitar, warm sub", perc: "soft afro snap on 2-and-4", mix: "romantic bedroom-club", keys: ["afro rnb", "afro r&b", "afro-rnb"] },
  "fela-afrobeat": { genre: "1970s afrobeat", mood: "driving hypnotic", inst: "horn riffs, jazz-funk guitar, bass riff", perc: "polyrhythm, shekere timeline", mix: "live-band vintage warmth", keys: ["fela", "afrobeat", "kalakuta", "not afrobeats"] },
  "dembow": { genre: "dembow reggaeton", mood: "bouncy nocturnal", inst: "deep bass, sparse synth", perc: "dembow kick, snare on 3", mix: "perreo club", keys: ["dembow", "reggaeton", "perreo"] },
  "baile": { genre: "baile funk", mood: "raw chaotic", inst: "tamborzão, montagem stabs", perc: "funk carioca kick, chopped snare", mix: "raw Rio street", keys: ["baile", "funk carioca", "montagem", "tamborzao"] },
  "uk-garage": { genre: "UK garage 2-step", mood: "skippy nocturnal", inst: "organ bass, 2-step stabs", perc: "shuffled snares, skippy kick", mix: "London chrome night", keys: ["uk garage", "ukg", "2-step", "2step"] },
  "uk-funky": { genre: "UK funky", mood: "percussive afro-london", inst: "bouncy bass, synth stabs", perc: "funky 130 kick, cowbell, shakers", mix: "warehouse perc", keys: ["uk funky", "funky house london"] },
  "soca": { genre: "soca", mood: "euphoric carnival", inst: "bright stabs, bouncy bass", perc: "fast soca kick, iron, shakers", mix: "sunny fete", keys: ["soca", "carnival", "fete", "trinidad"] },
  "kompa": { genre: "kompa", mood: "groovy romantic", inst: "twinkling guitar, melodic bass", perc: "kompa kick, tanbou, conga", mix: "smooth Caribbean dance", keys: ["kompa", "konpa", "haiti"] },
  "jersey": { genre: "jersey club", mood: "bouncy chaotic", inst: "kick-led, chopped hits", perc: "jersey kick pattern, snare chops", mix: "raw Newark club", keys: ["jersey club", "jersey", "newark"] },
  "moombahton": { genre: "moombahton", mood: "heavy tropical", inst: "heavy bass, tropical riff", perc: "snare on 3, half-time house", mix: "festival 108 slam", keys: ["moombahton", "moombah"] },
  "phonk": { genre: "drift phonk", mood: "dark night-drive", inst: "distorted 808, pitched synth", perc: "cowbell, triplet hats", mix: "vinyl drift grit", keys: ["phonk", "drift phonk", "cowbell", "memphis"] },
  "cloud": { genre: "cloud rap", mood: "hazy ethereal", inst: "washed pads, soft 808", perc: "snare on 3, airy hats", mix: "reverb cloud", keys: ["cloud rap", "cloudrap", "ethereal rap"] },
  "grime": { genre: "UK grime", mood: "cold square street", inst: "square bass, icy stabs", perc: "140 syncopated kick, thin snare", mix: "pirate-radio digital", keys: ["grime", "wiley", "pirate radio"] },
  "dnb": { genre: "drum and bass", mood: "driving dark-euphoric", inst: "reese bass, pads", perc: "rolling amen breaks, 174", mix: "club rolling mix", keys: ["dnb", "drum and bass", "drum & bass", "neurofunk", "amen"] },
  "house": { genre: "deep house", mood: "groovy hypnotic", inst: "warm analog bass, Rhodes", perc: "4/4 kick, offbeat hats, clap on 2-and-4", mix: "warm looping club", keys: ["deep house", "house", "4/4"] },
  "afro-drill": { genre: "afro-drill", mood: "dark groovy street", inst: "sliding 808, afro guitar", perc: "drill snares, shekere", mix: "night crossover", keys: ["afro drill", "afro-drill"] }
};

window.ENGINES = [
  { id: "suno", name: "Suno v4", hint: "Custom · Instrumental ON · Style ≤200 · Lyrics = metatags · Exclude box" },
  { id: "udio", name: "Udio", hint: "Tags in style · /instrumental · metatags in lyrics · negatives in extra" },
  { id: "stable", name: "Stable Audio", hint: "Paste Style as the prompt; append structure as a second sentence" },
  { id: "eleven", name: "ElevenLabs", hint: "Instrumental music prompt · no vocals · structure as section list" }
];

window.SEVEN_H = {
  STYLE_LIMIT: 200,

  join(parts) {
    return parts.filter(Boolean).map((p) => String(p).trim()).filter(Boolean)
      .join(", ").replace(/,\s*,/g, ", ").replace(/\s+/g, " ").trim();
  },

  uniq(parts) {
    const seen = new Set();
    const out = [];
    parts.filter(Boolean).forEach((p) => {
      const k = String(p).trim().toLowerCase();
      if (!k || seen.has(k)) return;
      seen.add(k);
      out.push(String(p).trim());
    });
    return out;
  },

  fitHeadTail(headParts, tailParts, limit) {
    const tail = this.uniq(tailParts).join(", ");
    const budget = Math.max(0, limit - (tail ? tail.length + 2 : 0));
    let head = "";
    for (const b of this.uniq(headParts)) {
      const next = head ? head + ", " + b : b;
      if (next.length <= budget) head = next;
    }
    const result = head && tail ? head + ", " + tail : (head || tail);
    return result.length <= limit ? result : result.slice(0, limit).replace(/,\s*[^,]*$/, "");
  },

  ideaBits(idea) {
    if (!idea) return [];
    const stop = new Set("a an the and or for with from that this into over under very really just like want need make create generate beat beats instrumental vocals vocal song music of to in on at bpm key".split(" "));
    return idea.toLowerCase()
      .replace(/[^a-z0-9#\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stop.has(w))
      .slice(0, 6);
  },

  parseIdea(idea) {
    const t = (idea || "").toLowerCase();
    const out = { bpm: null, key: null, kitId: null };
    const bpmM = t.match(/(\d{2,3})\s*bpm\b/);
    if (bpmM) {
      const n = +bpmM[1];
      if (n >= 60 && n <= 180) out.bpm = n;
    }
    const keyM = t.match(/\b([a-g](?:#|b)?)\s*(minor|min|major|maj|m)\b/i);
    if (keyM) {
      const note = keyM[1][0].toUpperCase() + keyM[1].slice(1);
      const q = keyM[2].toLowerCase();
      out.key = (q.startsWith("maj")) ? note + "maj" : note + "min";
    }
    let best = { id: null, score: 0 };
    Object.entries(window.STYLE_CORE).forEach(([id, core]) => {
      let score = 0;
      (core.keys || []).forEach((k) => { if (t.includes(k)) score += k.length; });
      if (score > best.score) best = { id, score };
    });
    if (best.score >= 4) out.kitId = best.id;
    return out;
  },

  modifiers(state) {
    const bits = [];
    if (state.swing < 34) bits.push("straight groove");
    else if (state.swing > 72) bits.push("heavy swing");
    if (state.density < 34) bits.push("sparse drums");
    else if (state.density > 72) bits.push("busy drums");
    if (state.darkness < 34) bits.push("bright mix");
    else if (state.darkness > 72) bits.push("dark mix");
    if (state.punch < 34) bits.push("soft transients");
    else if (state.punch > 72) bits.push("hard-hitting");
    if (state.pocket === "empty") bits.push("empty pocket");
    else if (state.pocket === "melodic") bits.push("melodic hook");
    else bits.push("full arrangement");
    if (state.form === "loop") bits.push("seamless loop");
    return bits;
  },

  styleTags(kit, state, idea) {
    const core = window.STYLE_CORE[kit.id] || {};
    const keyBit = state.key && state.key !== "none" ? state.key : "";
    const blob = ((core.genre || "") + " " + (core.mood || "") + " " + (core.inst || "") + " " + (core.perc || "")).toLowerCase();
    const extra = this.ideaBits(idea).filter((w) => blob.indexOf(w) === -1).slice(0, 3).join(" ");

    // Genre -> Mood -> Instruments -> Percussion -> Mix, then required tail: BPM & Key + lock
    return this.fitHeadTail(
      [
        core.genre || kit.genre,
        extra,
        core.mood || kit.mood,
        core.inst,
        core.perc,
        core.mix,
        ...this.modifiers(state)
      ],
      [
        state.bpm + " BPM" + (keyBit ? " " + keyBit : ""),
        "instrumental, no vocals"
      ],
      this.STYLE_LIMIT
    );
  },

  structure(kit, state, engine) {
    const grid = kit.drumIdentity + ", " + state.bpm + " BPM";
    const noVox = "No vocals. No singing. No rapping.";
    const head = engine === "udio" ? "/instrumental\n[Instrumental]" : "[Instrumental]";

    if (state.form === "loop") {
      return [
        head,
        "[Loop]",
        "8-bar " + grid + " loop. " + kit.kick + ". " + kit.snare + ". " + kit.bass + ". Repeatable. " + noVox,
        "[Variation]",
        kit.melody + ". Drums stay locked. " + noVox
      ].join("\n");
    }

    const body = [
      head,
      "[Intro]",
      kit.intro + ". " + noVox,
      "[Verse]",
      kit.verse + ". " + grid + ". " + noVox,
      "[Drop]",
      kit.hook + ". " + kit.drop + ". " + noVox,
      "[Break]",
      kit.brk + ". " + noVox,
      "[Outro]",
      kit.outro + ". " + noVox
    ];

    if (state.form === "track") {
      body.splice(7, 0, "[Verse 2]", "Same pocket as verse, extra " + kit.perc + ". " + noVox);
    }

    if (engine === "stable" || engine === "eleven") {
      return "Instrumental only, no vocals.\n\n" + body.join("\n");
    }
    return body.join("\n");
  },

  negatives(kit, strict) {
    const base = [
      "vocals", "singing", "rapping", "choir", "spoken word", "ad-libs",
      "humming", "toasting", "chants", "vocal chops", "lyrics", "lead vocal"
    ];
    const extra = kit.exclude || [];
    const more = strict ? ["background vocals", "crowd vocals", "MC", "whispering"] : [];
    return [...new Set([...base, ...extra, ...more])].join(", ");
  },

  pack(style, structure, negatives) {
    return [
      "### 🎯 7H Style Tags (Copy to Style Box)",
      style,
      "",
      "### 🎼 Structure & Metatag Prompt",
      structure,
      "",
      "### 🚫 Negative Tags (Copy to Exclude Box)",
      negatives
    ].join("\n");
  }
};
