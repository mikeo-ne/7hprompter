(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const H = window.SEVEN_H;

  const KEYS = ["none", "Cmin", "C#min", "Dmin", "Ebmin", "Emin", "Fmin", "F#min", "Gmin", "Abmin", "Amin", "Bbmin", "Bmin", "Cmaj", "Fmaj", "Gmaj", "Bbmaj"];

  const state = {
    view: "build",
    family: "hiphop",
    kitId: "boom-bap",
    bpm: 92,
    key: "Cmin",
    swing: 62,
    density: 48,
    darkness: 55,
    punch: 70,
    pocket: "empty",
    form: "beat",
    strict: true,
    engine: "suno",
    idea: ""
  };

  const kitById = (id) => window.BEAT_KITS.find((k) => k.id === id);
  const kitsIn = (fam) => window.BEAT_KITS.filter((k) => k.family === fam);

  function beatName(kit) {
    const pool = kit.names || [kit.name.toUpperCase()];
    return pool[Math.floor(Math.random() * pool.length)] + "  ·  " + state.bpm;
  }

  let currentName = "";

  function outputs() {
    const kit = kitById(state.kitId);
    const style = H.styleTags(kit, state, state.idea);
    const structure = H.structure(kit, state, state.engine);
    const negatives = H.negatives(kit, state.strict);
    return { kit, style, structure, negatives, pack: H.pack(style, structure, negatives) };
  }

  function render() {
    const kit = kitById(state.kitId);
    if (!kit) return;

    $$(".fam").forEach((el) => el.classList.toggle("active", el.dataset.id === state.family));
    renderPads();

    $("#bpm").value = state.bpm;
    $("#bpmLed").innerHTML = String(state.bpm) + "<small>BPM</small>";
    $("#swing").value = state.swing; $("#swingV").textContent = state.swing;
    $("#density").value = state.density; $("#densityV").textContent = state.density;
    $("#darkness").value = state.darkness; $("#darknessV").textContent = state.darkness;
    $("#punch").value = state.punch; $("#punchV").textContent = state.punch;
    $("#key").value = state.key;
    $$("#pocketSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.pocket));
    $$("#formSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.form));
    $$("#engineSeg button").forEach((b) => b.classList.toggle("on", b.dataset.v === state.engine));
    $("#strict").classList.toggle("on", state.strict);
    $("#strict").setAttribute("aria-checked", state.strict);

    const core = window.STYLE_CORE[kit.id] || {};
    $("#kitRead").innerHTML =
      "<b>GENRE</b> " + (core.genre || kit.genre) +
      "<br><b>PERC</b> " + (core.perc || kit.drumIdentity) +
      "<br><b>INST</b> " + (core.inst || "") +
      "<br><b>MIX</b> " + (core.mix || "");

    if (!currentName) currentName = beatName(kit);
    $("#beatTitle").innerHTML = currentName.replace(/(\d+)$/, "<span>$1</span>");

    const o = outputs();
    setOut("#styleOut", "#styleCount", o.style, 200);
    setOut("#structOut", "#structCount", o.structure, 5000);
    setOut("#exclOut", "#exclCount", o.negatives, 1000);

    const eng = window.ENGINES.find((e) => e.id === state.engine);
    $("#engineHint").textContent = eng ? eng.hint : "";

    $("#copyAll").dataset.pack = o.pack;
    $("#matchNote").textContent = state.idea ? ideaNote() : "";
  }

  function ideaNote() {
    const parsed = H.parseIdea(state.idea);
    if (parsed.kitId && parsed.kitId !== state.kitId) {
      const k = kitById(parsed.kitId);
      return "Idea leans " + k.name + " — hit Forge to load that kit.";
    }
    if (parsed.kitId === state.kitId) return "Idea locked to " + kitById(state.kitId).name + ".";
    return "Idea folded into tags. Pick a kit or Forge to auto-match.";
  }

  function setOut(pre, count, text, limit) {
    $(pre).textContent = text;
    const el = $(count);
    el.textContent = text.length + " / " + limit;
    el.classList.toggle("warn", text.length > limit * 0.9);
    el.classList.toggle("bad", text.length > limit);
  }

  function renderPads() {
    const box = $("#pads");
    box.innerHTML = "";
    kitsIn(state.family).forEach((k) => {
      const b = document.createElement("button");
      b.className = "pad" + (k.id === state.kitId ? " active" : "");
      b.type = "button";
      b.innerHTML = "<div class='k'>" + k.region + "</div><b>" + k.name + "</b><div class='meta'>" +
        k.defaultBpm + " BPM · " + k.drumIdentity + "</div>";
      b.addEventListener("click", () => selectKit(k));
      box.appendChild(b);
    });
  }

  function selectKit(k) {
    state.kitId = k.id;
    state.family = k.family;
    state.bpm = k.defaultBpm;
    state.key = k.key || "none";
    currentName = beatName(k);
    render();
  }

  function renderFamilies() {
    const box = $("#families");
    box.innerHTML = "";
    window.BEAT_FAMILIES.forEach((f) => {
      const b = document.createElement("button");
      b.className = "fam" + (f.id === state.family ? " active" : "");
      b.type = "button";
      b.dataset.id = f.id;
      b.innerHTML = "<b>" + f.name + "</b><span>" + f.blurb + "</span>";
      b.addEventListener("click", () => {
        state.family = f.id;
        const first = kitsIn(f.id)[0];
        if (first) selectKit(first);
        else render();
      });
      box.appendChild(b);
    });
  }

  function fillKeys() {
    $("#key").innerHTML = KEYS.map((k) => "<option value='" + k + "'>" + (k === "none" ? "No key" : k) + "</option>").join("");
  }

  function copyText(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      const old = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("ok");
      setTimeout(() => { btn.textContent = old; btn.classList.remove("ok"); }, 1200);
    });
  }

  function forgeIdea() {
    const parsed = H.parseIdea(state.idea);
    if (parsed.kitId) {
      const k = kitById(parsed.kitId);
      state.kitId = k.id;
      state.family = k.family;
      state.bpm = parsed.bpm || k.defaultBpm;
      state.key = parsed.key || k.key || "none";
      currentName = beatName(k);
    } else {
      if (parsed.bpm) state.bpm = parsed.bpm;
      if (parsed.key) state.key = parsed.key;
    }
    render();
  }

  function bind() {
    $("#bpm").addEventListener("input", (e) => { state.bpm = +e.target.value; render(); });
    ["swing", "density", "darkness", "punch"].forEach((id) => {
      $("#" + id).addEventListener("input", (e) => { state[id] = +e.target.value; render(); });
    });
    $("#key").addEventListener("change", (e) => { state.key = e.target.value; render(); });
    $$("#pocketSeg button").forEach((b) => b.addEventListener("click", () => { state.pocket = b.dataset.v; render(); }));
    $$("#formSeg button").forEach((b) => b.addEventListener("click", () => { state.form = b.dataset.v; render(); }));
    $$("#engineSeg button").forEach((b) => b.addEventListener("click", () => { state.engine = b.dataset.v; render(); }));
    $("#strict").addEventListener("click", () => { state.strict = !state.strict; render(); });

    $("#idea").addEventListener("input", (e) => { state.idea = e.target.value; render(); });
    $("#forge").addEventListener("click", forgeIdea);
    $("#idea").addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") forgeIdea();
    });

    $("#copyStyle").addEventListener("click", (e) => copyText($("#styleOut").textContent, e.currentTarget));
    $("#copyStruct").addEventListener("click", (e) => copyText($("#structOut").textContent, e.currentTarget));
    $("#copyExcl").addEventListener("click", (e) => copyText($("#exclOut").textContent, e.currentTarget));
    $("#copyAll").addEventListener("click", (e) => copyText(e.currentTarget.dataset.pack, e.currentTarget));

    $("#reroll").addEventListener("click", () => { currentName = beatName(kitById(state.kitId)); render(); });
    $("#randomKit").addEventListener("click", () => {
      const all = window.BEAT_KITS;
      selectKit(all[Math.floor(Math.random() * all.length)]);
    });

    $$(".tab").forEach((t) => t.addEventListener("click", () => {
      state.view = t.dataset.view;
      $$(".tab").forEach((x) => x.setAttribute("aria-selected", x === t));
      $$(".view").forEach((v) => v.classList.toggle("show", v.id === "view-" + state.view));
      if (state.view === "library") renderLibrary();
    }));
  }

  function renderLibrary() {
    const box = $("#lib");
    box.innerHTML = "";
    const hold = { ...state };
    window.BEAT_FAMILIES.forEach((f) => {
      kitsIn(f.id).forEach((k) => {
        Object.assign(state, { bpm: k.defaultBpm, key: k.key || "none", pocket: "empty", form: "beat", strict: true, idea: "" });
        const style = H.styleTags(k, state, "");
        Object.assign(state, hold);
        const card = document.createElement("article");
        card.className = "lib-card";
        card.innerHTML = "<div class='row'><h4>" + k.name + "</h4><div class='tag'>" + f.name + " · " + k.defaultBpm + " BPM · " + k.drumIdentity + "</div></div><pre></pre>";
        card.querySelector("pre").textContent = style;
        const btn = document.createElement("button");
        btn.className = "copy";
        btn.textContent = "Copy style";
        btn.addEventListener("click", () => copyText(style, btn));
        const use = document.createElement("button");
        use.className = "ghost";
        use.textContent = "Load in builder";
        use.addEventListener("click", () => { $$(".tab")[0].click(); selectKit(k); window.scrollTo({ top: 0, behavior: "smooth" }); });
        const foot = document.createElement("div");
        foot.style.display = "flex";
        foot.style.gap = "6px";
        foot.append(btn, use);
        card.appendChild(foot);
        box.appendChild(card);
      });
    });
    Object.assign(state, hold);
  }

  renderFamilies();
  fillKeys();
  bind();
  const start = kitById(state.kitId);
  state.bpm = start.defaultBpm;
  currentName = beatName(start);
  render();
})();
