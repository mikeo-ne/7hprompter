/* 7H Chop Sampler — Serato-style + Stem Splitter (Serato Sample-like)
   Features: drop audio, auto transient chop, 16 pads x 2 banks (32), QWERTY + MIDI, slice/chromatic, WAV/ZIP export, stem splitter (vocals/drums/bass/melody) DSP lite.
   All local: Web Audio decode, no upload. Simple mode as easy as Serato. */

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // --- elements
  const drop = $("#samDrop");
  const fileInput = $("#samFile");
  const waveCanvas = $("#samWave");
  const chopCanvas = $("#samChop");
  const waveWrap = $("#waveWrap");
  const playhead = $("#samPlayhead");
  const sens = $("#samSens");
  const sensV = $("#samSensV");
  const minEl = $("#samMin");
  const minV = $("#samMinV");
  const countEl = $("#samCount");
  const autoBtn = $("#samAuto");
  const equalBtn = $("#samEqual");
  const clearBtn = $("#samClear");
  const trimStartEl = $("#samTrimStart");
  const trimEndEl = $("#samTrimEnd");
  const trimApplyBtn = $("#samTrimApply");
  const chopsList = $("#samChopsList");
  const statusEl = $("#samStatus");
  const demoBtn = $("#samDemo");
  const bpmKeyEl = $("#samBpmKey");

  const padsEl = $("#samPads");
  const bankSeg = $("#samBankSeg");
  const bankLabel = $("#samBankLabel");
  const modeSeg = $("#samModeSeg");
  const modeLabel = $("#samModeLabel");
  const playSeg = $("#samPlaySeg");
  const gainEl = $("#samGain");
  const gainV = $("#samGainV");
  const attEl = $("#samAttack");
  const attV = $("#samAttackV");
  const relEl = $("#samRelease");
  const relV = $("#samReleaseV");
  const revChk = $("#samReverse");
  const loopChk = $("#samLoop");
  const tuneEl = $("#samTune");
  const tuneV = $("#samTuneV");
  const fineEl = $("#samFine");
  const fineV = $("#samFineV");
  const rootEl = $("#samRoot");
  const midiBtn = $("#samMidiBtn");
  const midiStatus = $("#samMidiStatus");

  const exportOne = $("#samExportOne");
  const exportEach = $("#samExportEach");
  const exportZip = $("#samExportZip");
  const copyPack = $("#samCopyPack");

  // stem + simple
  const simpleSeg = $("#simpleSeg");
  const splitStemsBtn = $("#splitStemsBtn");
  const stemsGrid = $("#stemsGrid");
  const stemsStatus = $("#stemsStatus");
  const stemsAutoChop = $("#stemsAutoChop");
  const stemsUseOriginalBtn = $("#stemsUseOriginal");
  const stemsExportAllBtn = $("#stemsExportAll");
  const stemsPlayMixBtn = $("#stemsPlayMix");

  if (!drop || !waveCanvas) return;

  const W = waveCanvas.width, H = waveCanvas.height;
  const gWave = waveCanvas.getContext("2d");
  const gChop = chopCanvas.getContext("2d");

  let ctx = null;
  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  let audioBuffer = null;
  let originalBuffer = null;
  let fileName = "";
  let slices = [];
  let selectedGlobal = 0;
  let bank = 0;
  let mode = "slice";
  let playMode = "oneshot";
  let scheduledSources = new Map();
  let activePad = null;
  let simpleMode = true;

  // --- stems state
  let stemBuffers = { original: null, vocals: null, drums: null, bass: null, other: null };
  let activeStem = "original";
  let stemsSolo = null; // 'vocals'|'drums'|'bass'|'other' or null
  let stemsMuted = { vocals: false, drums: false, bass: false, other: false };
  let stemsGain = { vocals: 100, drums: 100, bass: 100, other: 100 };
  let stemSources = new Map(); // stem -> {src,gain}

  const QWERTY_MAP = {
    'q': 0, 'w': 1, 'e': 2, 'r': 3,
    'a': 4, 's': 5, 'd': 6, 'f': 7,
    'z': 8, 'x': 9, 'c': 10, 'v': 11,
    '1': 12, '2': 13, '3': 14, '4': 15,
    'Q': 0, 'W': 1, 'E': 2, 'R': 3,
    'A': 4, 'S': 5, 'D': 6, 'F': 7,
    'Z': 8, 'X': 9, 'C': 10, 'V': 11,
  };
  const KEY_HINTS = ["Q","W","E","R","A","S","D","F","Z","X","C","V","1","2","3","4"];
  const STEMS = [
    { id: "vocals", name: "Vocals", icon: "🎙️", desc: "Centre • 300–3400Hz", color: "#ff6a1a" },
    { id: "drums", name: "Drums", icon: "🥁", desc: "Side + transient", color: "#d6ff3d" },
    { id: "bass", name: "Bass", icon: "🔊", desc: "Low-pass 250Hz", color: "#7ee0c8" },
    { id: "other", name: "Melody", icon: "🎹", desc: "High-pass • instrumental", color: "#9a8c72" },
  ];

  function fmtTime(s) { return s.toFixed(3) + "s"; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function updateCount() {
    countEl.textContent = slices.length;
    renderChopsList();
    draw();
    updateBpmKey();
  }

  // --- simple mode
  function syncSimpleMode() {
    const isSimple = simpleMode;
    $$("#simpleSeg button").forEach(b => b.classList.toggle("on", b.dataset.v === (isSimple ? "simple" : "pro")));
    $$(".pro-row").forEach(el => el.style.display = isSimple ? "none" : "flex");
    $$(".simple-row").forEach(el => el.style.display = "flex");
    // in simple, keep waveform controls minimal — Find Samples + 16 equal + chops count
    // pro shows sensitivity etc.
    const samplerView = $("#view-sampler");
    if (samplerView) samplerView.classList.toggle("simple", isSimple);
  }

  // --- waveform drawing
  function clearCanvas(c, ctx2) { ctx2.clearRect(0, 0, c.width, c.height); }

  function drawWaveform() {
    clearCanvas(waveCanvas, gWave);
    if (!audioBuffer) {
      gWave.fillStyle = "#1a160f";
      gWave.fillRect(0, 0, W, H);
      gWave.fillStyle = "#6e6454";
      gWave.font = "12px IBM Plex Mono, monospace";
      gWave.textAlign = "center";
      gWave.fillText("drop audio or load demo break — instant, no upload", W / 2, H / 2 - 6);
      gWave.fillStyle = "rgba(214,255,61,0.9)";
      gWave.font = "10px IBM Plex Mono, monospace";
      gWave.fillText("Serato-simple: Drop → Find Samples → Play Pads → Split Stems", W / 2, H / 2 + 12);
      return;
    }
    gWave.fillStyle = "#100e0b";
    gWave.fillRect(0, 0, W, H);
    gWave.strokeStyle = "rgba(244,216,160,0.06)";
    gWave.lineWidth = 1;
    for (let x = 0; x < W; x += 100) { gWave.beginPath(); gWave.moveTo(x, 0); gWave.lineTo(x, H); gWave.stroke(); }
    for (let y = H * 0.25; y < H; y += H * 0.25) { gWave.beginPath(); gWave.moveTo(0, y); gWave.lineTo(W, y); gWave.stroke(); }
    const ch = audioBuffer.numberOfChannels;
    const data0 = audioBuffer.getChannelData(0);
    const data1 = ch > 1 ? audioBuffer.getChannelData(1) : data0;
    const len = audioBuffer.length;
    const step = Math.max(1, Math.floor(len / W));
    const midY = H / 2;
    const amp = (H / 2) * 0.85;
    gWave.fillStyle = "rgba(255,106,26,0.14)";
    let started = false;
    for (let x = 0; x < W; x++) {
      let min = 1, max = -1;
      const start = x * step;
      const end = Math.min(len, start + step);
      for (let i = start; i < end; i++) {
        const v = (data0[i] + data1[i]) * 0.5;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const yTop = midY - max * amp;
      if (!started) { gWave.moveTo(x, yTop); started = true; }
      else gWave.lineTo(x, yTop);
    }
    for (let x = W - 1; x >= 0; x--) {
      let min = 1;
      const start = x * step;
      const end = Math.min(len, start + step);
      for (let i = start; i < end; i++) {
        const v = (data0[i] + data1[i]) * 0.5;
        if (v < min) min = v;
      }
      const yBot = midY - min * amp;
      gWave.lineTo(x, yBot);
    }
    gWave.closePath();
    gWave.fill();
    gWave.strokeStyle = "rgba(244,216,160,0.18)";
    gWave.setLineDash([4, 6]);
    gWave.beginPath(); gWave.moveTo(0, midY); gWave.lineTo(W, midY); gWave.stroke();
    gWave.setLineDash([]);
    gWave.strokeStyle = "#ff9a4a";
    gWave.lineWidth = 1.05;
    gWave.beginPath();
    for (let x = 0; x < W; x++) {
      let max = -1;
      const start = x * step, end = Math.min(len, start + step);
      for (let i = start; i < end; i++) { const v = (data0[i] + data1[i]) * 0.5; if (v > max) max = v; }
      const y = midY - max * amp;
      if (x === 0) gWave.moveTo(x, y); else gWave.lineTo(x, y);
    }
    gWave.stroke();
    // stem indicator
    if (activeStem !== "original") {
      gWave.fillStyle = "rgba(214,255,61,0.08)";
      gWave.fillRect(0, 0, W, 18);
      gWave.fillStyle = "#d6ff3d";
      gWave.font = "10px IBM Plex Mono, monospace";
      gWave.textAlign = "left";
      gWave.fillText(`STEM: ${activeStem.toUpperCase()}  •  chopping ${activeStem}`, 8, 12);
      gWave.textAlign = "left";
    }
  }

  function drawChops() {
    clearCanvas(chopCanvas, gChop);
    if (!audioBuffer || slices.length === 0) return;
    const dur = audioBuffer.duration;
    slices.forEach((s, i) => {
      const x1 = (s.start / dur) * W;
      const x2 = (s.end / dur) * W;
      const w = Math.max(1, x2 - x1);
      const isSelected = i === selectedGlobal;
      const inBank = Math.floor(i / 16) === bank;
      gChop.fillStyle = isSelected ? "rgba(214,255,61,0.14)" : inBank ? "rgba(126,224,200,0.07)" : "rgba(244,216,160,0.03)";
      gChop.fillRect(x1, 0, w, H);
      gChop.strokeStyle = isSelected ? "#d6ff3d" : inBank ? "rgba(126,224,200,0.22)" : "rgba(244,216,160,0.08)";
      gChop.lineWidth = isSelected ? 1.4 : 0.9;
      gChop.strokeRect(x1 + 0.5, 0.5, w - 1, H - 1);
      const padNum = (i % 16) + 1;
      const bankChar = i < 16 ? "A" : "B";
      gChop.fillStyle = isSelected ? "#d6ff3d" : "#f4ead6";
      gChop.font = isSelected ? "bold 11px IBM Plex Mono, monospace" : "10px IBM Plex Mono, monospace";
      gChop.fillText(bankChar + String(padNum).padStart(2, "0"), x1 + 4, 14);
      gChop.fillStyle = "rgba(244,234,214,0.55)";
      gChop.font = "9px IBM Plex Mono, monospace";
      gChop.fillText(fmtTime(s.start) + "–" + fmtTime(s.end), x1 + 4, H - 6);
    });
    slices.forEach((s, i) => {
      const x = (s.start / dur) * W;
      const isSelected = i === selectedGlobal;
      gChop.fillStyle = isSelected ? "#d6ff3d" : "#ff6a1a";
      gChop.fillRect(x - 1, 0, 2, H);
      gChop.beginPath();
      gChop.arc(x, 10, 5, 0, Math.PI * 2);
      gChop.fill();
      gChop.fillStyle = "#0b0a08";
      gChop.font = "8px IBM Plex Mono, monospace";
      gChop.textAlign = "center";
      gChop.fillText(String((i % 16) + 1), x, 13);
      gChop.textAlign = "left";
    });
    if (slices.length) {
      const last = slices[slices.length - 1];
      const x = (last.end / dur) * W;
      gChop.fillStyle = "#ff6a1a";
      gChop.fillRect(x - 1, 0, 2, H);
    }
    const tStart = (+trimStartEl.value) / 1000;
    const tEnd = (+trimEndEl.value) / 1000;
    if (tStart > 0 || tEnd < 1) {
      const x1 = tStart * W;
      const x2 = tEnd * W;
      gChop.fillStyle = "rgba(0,0,0,0.42)";
      if (x1 > 0) gChop.fillRect(0, 0, x1, H);
      if (x2 < W) gChop.fillRect(x2, 0, W - x2, H);
      gChop.strokeStyle = "rgba(255,255,255,0.35)";
      gChop.setLineDash([4, 4]);
      if (x1 > 0) { gChop.beginPath(); gChop.moveTo(x1, 0); gChop.lineTo(x1, H); gChop.stroke(); }
      if (x2 < W) { gChop.beginPath(); gChop.moveTo(x2, 0); gChop.lineTo(x2, H); gChop.stroke(); }
      gChop.setLineDash([]);
    }
  }

  function draw() { drawWaveform(); drawChops(); drawStemsWaveforms(); }

  function updateBpmKey() {
    if (!bpmKeyEl) return;
    if (!audioBuffer) { bpmKeyEl.textContent = "—"; return; }
    // quick BPM estimate via onset autocorrelation (simplified)
    let bpm = 0;
    try {
      const sr = audioBuffer.sampleRate;
      const data = audioBuffer.getChannelData(0);
      const len = data.length;
      const hop = 512, win = 1024;
      const nFrames = Math.floor((len - win) / hop);
      const env = new Float32Array(nFrames);
      for (let f = 0; f < nFrames; f++) {
        let sum = 0; const off = f * hop;
        for (let i = 0; i < win; i++) { const v = data[off + i]; sum += v * v; }
        env[f] = Math.sqrt(sum / win);
      }
      // autocorrelation for tempo
      let bestLag = 0, bestCorr = 0;
      const minLag = Math.floor(60 / 180 * sr / hop), maxLag = Math.floor(60 / 60 * sr / hop);
      for (let lag = minLag; lag <= maxLag; lag++) {
        let corr = 0;
        for (let i = 0; i < nFrames - lag; i++) corr += env[i] * env[i + lag];
        if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
      }
      const beatSec = bestLag * hop / sr;
      bpm = Math.round(60 / beatSec);
      if (bpm < 60 || bpm > 180) bpm = 0;
    } catch { bpm = 0; }
    const keyEst = audioBuffer ? "—" : "—";
    // simple key via filename? keep —
    bpmKeyEl.textContent = bpm ? `${bpm} BPM • ${keyEst} • ${activeStem !== "original" ? activeStem : "mix"}` : `${activeStem !== "original" ? activeStem : "mix"} • ${slices.length} chops`;
  }

  // --- transient detection
  function detectTransients(buffer, opts = {}) {
    const sensVal = opts.sens ?? 52;
    const minMs = opts.minMs ?? 160;
    const sr = buffer.sampleRate;
    const data = buffer.getChannelData(0);
    const len = data.length;
    let mono;
    if (buffer.numberOfChannels > 1) {
      const d1 = buffer.getChannelData(1);
      mono = new Float32Array(len);
      for (let i = 0; i < len; i++) mono[i] = (data[i] + d1[i]) * 0.5;
    } else mono = data;
    const win = 1024, hop = 512;
    const nFrames = Math.floor((len - win) / hop);
    const energy = new Float32Array(nFrames);
    let maxE = 0;
    for (let f = 0; f < nFrames; f++) {
      let sum = 0; const off = f * hop;
      for (let i = 0; i < win; i++) { const v = mono[off + i]; sum += v * v; }
      let hf = 0;
      for (let i = 1; i < win; i++) { const diff = mono[off + i] - mono[off + i - 1]; hf += diff * diff; }
      const e = Math.sqrt(sum / win) * 0.6 + Math.sqrt(hf / win) * 0.9;
      energy[f] = e;
      if (e > maxE) maxE = e;
    }
    if (maxE < 1e-6) return [];
    for (let i = 0; i < nFrames; i++) energy[i] /= maxE;
    let mean = 0; for (let i = 0; i < nFrames; i++) mean += energy[i];
    mean /= nFrames;
    let variance = 0; for (let i = 0; i < nFrames; i++) variance += (energy[i] - mean) ** 2;
    const std = Math.sqrt(variance / nFrames);
    const k = 1.7 - (sensVal / 100) * 1.9;
    const thresh = mean + k * std;
    const minFrames = Math.max(1, Math.round((minMs / 1000) * sr / hop));
    const peaks = [];
    for (let i = 1; i < nFrames - 1; i++) {
      if (energy[i] > thresh && energy[i] > energy[i - 1] && energy[i] >= energy[i + 1]) {
        const prevPeak = peaks.length ? peaks[peaks.length - 1] : -1e9;
        if (i - prevPeak >= minFrames) {
          if (energy[i] > thresh + 0.03 || energy[i] - Math.max(energy[i - 1], energy[i + 1]) > 0.015) peaks.push(i);
        } else {
          if (energy[i] > energy[prevPeak]) peaks[peaks.length - 1] = i;
        }
      }
    }
    const times = peaks.map(p => (p * hop) / sr);
    times.sort((a, b) => a - b);
    if (times.length > 31) {
      const scored = peaks.map((p, idx) => ({ t: times[idx], e: energy[p] }));
      scored.sort((a, b) => b.e - a.e);
      const kept = scored.slice(0, 31).map(s => s.t).sort((a, b) => a - b);
      return kept;
    }
    return times;
  }

  function autoChop() {
    if (!audioBuffer) return;
    const sensVal = +sens.value;
    const minMs = +minEl.value;
    const tStart = (+trimStartEl.value) / 1000 * audioBuffer.duration;
    const tEnd = (+trimEndEl.value) / 1000 * audioBuffer.duration;
    let times = detectTransients(audioBuffer, { sens: sensVal, minMs });
    times = times.filter(t => t >= tStart && t <= tEnd);
    const bounds = [tStart, ...times, tEnd];
    bounds.sort((a, b) => a - b);
    const uniq = [];
    for (const b of bounds) { if (!uniq.length || Math.abs(b - uniq[uniq.length - 1]) > 0.012) uniq.push(b); }
    if (uniq.length <= 2) {
      const n = 16; const span = tEnd - tStart; uniq.length = 0;
      for (let i = 0; i <= n; i++) uniq.push(tStart + (span * i) / n);
    }
    let finalBounds = uniq;
    if (uniq.length > 33) {
      const step = (uniq.length - 1) / 32;
      finalBounds = [];
      for (let i = 0; i <= 32; i++) finalBounds.push(uniq[Math.round(i * step)]);
      finalBounds[0] = tStart; finalBounds[finalBounds.length - 1] = tEnd;
      finalBounds.sort((a, b) => a - b);
    }
    slices = [];
    for (let i = 0; i < finalBounds.length - 1; i++) slices.push({ start: finalBounds[i], end: finalBounds[i + 1] });
    const minSec = (minMs * 0.6) / 1000;
    const merged = [];
    for (const s of slices) {
      if (merged.length && (s.end - s.start) < minSec * 0.7) merged[merged.length - 1].end = s.end;
      else merged.push(s);
    }
    slices = merged.filter(s => (s.end - s.start) > 0.015);
    if (slices.length === 0 && audioBuffer) slices = [{ start: tStart, end: tEnd }];
    if (slices.length > 32) slices = slices.slice(0, 32);
    selectedGlobal = Math.min(selectedGlobal, Math.max(0, slices.length - 1));
    status(`Auto-chopped ${slices.length} • ${sensVal} sens • ${minMs}ms • ${activeStem !== "original" ? activeStem : "mix"}`);
    updateCount(); renderPads(); renderChopsList();
  }

  function equalChop(n = 16) {
    if (!audioBuffer) return;
    const tStart = (+trimStartEl.value) / 1000 * audioBuffer.duration;
    const tEnd = (+trimEndEl.value) / 1000 * audioBuffer.duration;
    const span = tEnd - tStart;
    slices = [];
    for (let i = 0; i < n; i++) slices.push({ start: tStart + (span * i) / n, end: tStart + (span * (i + 1)) / n });
    if (slices.length > 32) slices = slices.slice(0, 32);
    selectedGlobal = 0;
    status(`${n} equal • ${activeStem}`);
    updateCount(); renderPads();
  }

  function clearChops() {
    if (!audioBuffer) return;
    const tStart = (+trimStartEl.value) / 1000 * audioBuffer.duration;
    const tEnd = (+trimEndEl.value) / 1000 * audioBuffer.duration;
    slices = [{ start: tStart, end: tEnd }];
    selectedGlobal = 0;
    status("Cleared — single slice");
    updateCount(); renderPads();
  }

  // --- pads UI
  function renderPads() {
    padsEl.innerHTML = "";
    for (let i = 0; i < 16; i++) {
      const g = bank * 16 + i;
      const has = g < slices.length;
      const sl = slices[g];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sam-pad" + (has ? "" : " empty") + (g === selectedGlobal ? " selected" : "") + (activePad === i ? " active" : "");
      btn.dataset.pad = String(i);
      const keyHint = KEY_HINTS[i] || "";
      const label = has && sl ? `${fmtTime(sl.end - sl.start)}` : "—";
      const bankChar = g < 16 ? "A" : "B";
      btn.innerHTML = `<span class="pad-num">${bankChar}${String(i + 1).padStart(2, "0")}<em>${keyHint}</em></span><span class="pad-time">${has ? label : "empty"}</span><span class="pad-bar"><i style="width:${has ? Math.min(100, ((sl.end - sl.start) / 0.6) * 100) : 0}%"></i></span><span class="pad-led"></span>`;
      btn.addEventListener("mousedown", (e) => { e.preventDefault(); triggerPad(i, "down"); });
      btn.addEventListener("mouseup", () => triggerPad(i, "up"));
      btn.addEventListener("mouseleave", () => triggerPad(i, "up"));
      btn.addEventListener("touchstart", (e) => { e.preventDefault(); triggerPad(i, "down"); }, { passive: false });
      btn.addEventListener("touchend", (e) => { e.preventDefault(); triggerPad(i, "up"); });
      btn.addEventListener("click", () => { if (has) { selectedGlobal = g; renderPads(); renderChopsList(); drawChops(); } });
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
      padsEl.appendChild(btn);
    }
  }

  function renderChopsList() {
    chopsList.innerHTML = "";
    if (!slices.length) { chopsList.innerHTML = `<span class="mono small-muted">No chops — drop audio or hit Find Samples</span>`; return; }
    slices.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "chop-row" + (i === selectedGlobal ? " sel" : "");
      const bankChar = i < 16 ? "A" : "B";
      const padNum = (i % 16) + 1;
      const dur = (s.end - s.start);
      row.innerHTML = `<button type="button" class="chop-play" data-i="${i}">${bankChar}${String(padNum).padStart(2,"0")}</button><span class="mono">${fmtTime(s.start)} → ${fmtTime(s.end)}</span><span class="mono dim">${dur.toFixed(3)}s</span><span class="mono dim">${KEY_HINTS[i % 16] || ""}${i>=16 ? " (B)" : ""}</span><button type="button" class="ghost small chop-del" data-i="${i}">✕</button>`;
      row.querySelector(".chop-play").addEventListener("click", () => { selectedGlobal = i; bank = Math.floor(i / 16); syncBankUI(); renderPads(); drawChops(); triggerGlobal(i); });
      row.querySelector(".chop-del").addEventListener("click", () => { slices.splice(i, 1); if (selectedGlobal >= slices.length) selectedGlobal = Math.max(0, slices.length - 1); updateCount(); renderPads(); });
      row.addEventListener("click", (e) => { if (e.target.closest("button")) return; selectedGlobal = i; bank = Math.floor(i / 16); syncBankUI(); renderPads(); drawChops(); renderChopsList(); });
      chopsList.appendChild(row);
    });
  }

  function syncBankUI() {
    $$("#samBankSeg button").forEach(b => b.classList.toggle("on", +b.dataset.v === bank));
    bankLabel.textContent = bank === 0 ? "BANK A" : "BANK B";
    bankLabel.style.color = bank === 0 ? "var(--heat)" : "var(--ice)";
  }
  function syncModeUI() {
    $$("#samModeSeg button").forEach(b => b.classList.toggle("on", b.dataset.v === mode));
    modeLabel.textContent = mode.toUpperCase();
    modeLabel.style.color = mode === "slice" ? "var(--ice)" : "var(--heat)";
  }
  function syncPlayUI() { $$("#samPlaySeg button").forEach(b => b.classList.toggle("on", b.dataset.v === playMode)); }

  // --- playback
  function stopPad(padInBank) {
    const entry = scheduledSources.get(padInBank);
    if (!entry) return;
    try {
      const now = getCtx().currentTime;
      const rel = (+relEl.value) / 1000;
      entry.gain.gain.cancelScheduledValues(now);
      entry.gain.gain.setTargetAtTime(0, now, Math.max(0.01, rel * 0.3));
      entry.src.stop(now + rel + 0.05);
    } catch {}
    scheduledSources.delete(padInBank);
  }
  function triggerPad(padInBank, phase) {
    if (phase === "down") { activePad = padInBank; renderPads(); triggerGlobalByPad(padInBank); }
    else if (phase === "up") { activePad = null; renderPads(); if (playMode === "gate") stopPad(padInBank); }
  }
  function triggerGlobalByPad(padInBank) {
    if (mode === "chromatic") {
      const srcIdx = selectedGlobal < slices.length ? selectedGlobal : 0;
      const sl = slices[srcIdx];
      if (!sl) return;
      const semitone = padInBank - 8 + (+tuneEl.value) + (+rootEl.value);
      const fine = (+fineEl.value) / 100;
      playSlice(sl, padInBank, semitone + fine);
    } else { const g = bank * 16 + padInBank; triggerGlobal(g, padInBank); }
  }
  function triggerGlobal(g, padForGate) {
    const sl = slices[g];
    if (!sl) return;
    selectedGlobal = g; drawChops(); renderChopsList();
    const pad = padForGate !== undefined ? padForGate : (g % 16);
    const tune = (+tuneEl.value); const fine = (+fineEl.value) / 100;
    const total = mode === "chromatic" ? 0 : tune + fine;
    playSlice(sl, pad, total);
  }
  function playSlice(slice, padInBank, semitoneOffset = 0) {
    if (!audioBuffer || !slice) return;
    const c = getCtx();
    if (playMode === "oneshot") stopPad(padInBank);
    const src = c.createBufferSource(); src.buffer = audioBuffer;
    const gainNode = c.createGain();
    const dur = slice.end - slice.start;
    if (dur <= 0) return;
    const gainVal = (+gainEl.value) / 100;
    const att = (+attEl.value) / 1000;
    const rel = (+relEl.value) / 1000;
    const isReverse = revChk.checked;
    const isLoop = loopChk.checked;
    let bufferToPlay = audioBuffer;
    let offset = slice.start;
    let playDur = dur;
    if (isReverse) {
      const sr = audioBuffer.sampleRate;
      const startSample = Math.floor(slice.start * sr);
      const endSample = Math.floor(slice.end * sr);
      const len = Math.max(1, endSample - startSample);
      const revBuf = c.createBuffer(audioBuffer.numberOfChannels, len, sr);
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const srcD = audioBuffer.getChannelData(ch);
        const dstD = revBuf.getChannelData(ch);
        for (let i = 0; i < len; i++) dstD[i] = srcD[endSample - 1 - i];
      }
      bufferToPlay = revBuf; src.buffer = bufferToPlay; offset = 0; playDur = len / sr;
    }
    src.loop = isLoop; if (isLoop) { src.loopStart = 0; src.loopEnd = playDur; }
    const rate = Math.pow(2, semitoneOffset / 12); src.playbackRate.value = rate;
    const now = c.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    if (att > 0.001) gainNode.gain.linearRampToValueAtTime(gainVal, now + att);
    else gainNode.gain.setValueAtTime(gainVal, now);
    src.connect(gainNode).connect(c.destination);
    if (playMode === "oneshot" && !isLoop) {
      const adjustedDur = playDur / rate;
      gainNode.gain.setValueAtTime(gainVal, now + Math.max(0, adjustedDur - rel - 0.01));
      gainNode.gain.linearRampToValueAtTime(0, now + adjustedDur);
      src.start(now, offset, adjustedDur + 0.02);
      src.stop(now + adjustedDur + 0.03);
    } else src.start(now, offset);
    src.onended = () => {
      try { src.disconnect(); gainNode.disconnect(); } catch {}
      if (scheduledSources.get(padInBank)?.src === src) scheduledSources.delete(padInBank);
      if (activePad === padInBank && playMode !== "gate") { activePad = null; renderPads(); }
    };
    showPlayhead(slice, rate, playMode === "oneshot" ? dur / rate : null);
    scheduledSources.set(padInBank, { src, gain: gainNode });
    activePad = padInBank; renderPads();
    if (playMode !== "gate") setTimeout(() => { if (activePad === padInBank) { activePad = null; renderPads(); } }, Math.min(260, (dur / rate) * 1000 * 0.9));
  }
  let playheadTimer = null;
  function showPlayhead(slice, rate = 1, durOrNull) {
    if (!audioBuffer) return;
    const totalDur = audioBuffer.duration;
    const startX = (slice.start / totalDur) * W;
    const endX = (slice.end / totalDur) * W;
    const dur = durOrNull !== null && durOrNull !== undefined ? durOrNull : (slice.end - slice.start) / rate;
    playhead.style.display = "block"; playhead.style.left = startX + "px"; playhead.style.width = "2px"; playhead.style.opacity = "1";
    const start = performance.now();
    if (playheadTimer) cancelAnimationFrame(playheadTimer);
    function tick() {
      const elapsed = (performance.now() - start) / 1000;
      const t = Math.min(1, elapsed / dur);
      const x = startX + (endX - startX) * t;
      playhead.style.left = x + "px";
      if (t < 1) playheadTimer = requestAnimationFrame(tick);
      else { playhead.style.display = "none"; playheadTimer = null; }
    }
    playheadTimer = requestAnimationFrame(tick);
  }

  // --- STEM SPLITTER (Serato Sample-like, DSP lite, no AI server)
  function extractCenterBuffer(buffer) {
    const sr = buffer.sampleRate, len = buffer.length, ch = buffer.numberOfChannels;
    if (ch < 2) return buffer;
    const out = getCtx().createBuffer(2, len, sr);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    const oL = out.getChannelData(0), oR = out.getChannelData(1);
    for (let i = 0; i < len; i++) { const mid = (L[i] + R[i]) * 0.5; oL[i] = mid; oR[i] = mid; }
    return out;
  }
  function extractSideBuffer(buffer) {
    const sr = buffer.sampleRate, len = buffer.length, ch = buffer.numberOfChannels;
    if (ch < 2) {
      const out = getCtx().createBuffer(2, len, sr);
      const mono = buffer.getChannelData(0), oL = out.getChannelData(0), oR = out.getChannelData(1);
      for (let i = 0; i < len; i++) { const v = mono[i] * 0.5; oL[i] = v; oR[i] = -v; }
      return out;
    }
    const out = getCtx().createBuffer(2, len, sr);
    const L = buffer.getChannelData(0), R = buffer.getChannelData(1);
    const oL = out.getChannelData(0), oR = out.getChannelData(1);
    for (let i = 0; i < len; i++) { const sideL = (L[i] - R[i]) * 0.5; const sideR = (R[i] - L[i]) * 0.5; oL[i] = sideL; oR[i] = sideR; }
    return out;
  }

  async function offlineFilterBuffer(srcBuffer, chain) {
    const sr = srcBuffer.sampleRate, len = srcBuffer.length, ch = srcBuffer.numberOfChannels;
    const offline = new OfflineAudioContext(ch, len, sr);
    const src = offline.createBufferSource(); src.buffer = srcBuffer;
    let last = src;
    for (const f of chain) {
      const bi = offline.createBiquadFilter();
      bi.type = f.type; bi.frequency.value = f.frequency;
      if (f.Q !== undefined) bi.Q.value = f.Q;
      if (f.gain !== undefined) bi.gain.value = f.gain;
      last.connect(bi); last = bi;
    }
    last.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    return rendered;
  }

  async function splitStems() {
    if (!originalBuffer) { stemsStatus.textContent = "No audio — drop first"; return; }
    splitStemsBtn.disabled = true; splitStemsBtn.textContent = "Splitting…";
    stemsStatus.textContent = "DSP lite — centre/side + filters — instant";
    try {
      const src = originalBuffer;
      const ctxSR = src.sampleRate;
      // Bass: lowpass 250
      const bassP = offlineFilterBuffer(src, [{ type: "lowpass", frequency: 250, Q: 0.7 }]);
      // Mid centre for vocals
      const centre = extractCenterBuffer(src);
      const side = extractSideBuffer(src);
      const vocalsP = offlineFilterBuffer(centre, [{ type: "highpass", frequency: 300, Q: 0.7 }, { type: "lowpass", frequency: 3400, Q: 0.7 }, { type: "peaking", frequency: 1200, Q: 1.2, gain: 2 }]);
      // Drums: side highpass 180 + presence peak; for mono fallback use original highpass
      const drumsP = (() => {
        if (src.numberOfChannels < 2) {
          return offlineFilterBuffer(src, [{ type: "highpass", frequency: 180, Q: 0.7 }, { type: "peaking", frequency: 3000, Q: 0.8, gain: 2 }]);
        }
        return offlineFilterBuffer(side, [{ type: "highpass", frequency: 150, Q: 0.7 }, { type: "peaking", frequency: 5000, Q: 0.9, gain: 1.5 }]);
      })();
      // Other/Melody: original highpass 250 minus vocal energy? Simple highpass 250 + gentle cut at 300-3400 to reduce vocal bleed
      const otherP = offlineFilterBuffer(src, [{ type: "highpass", frequency: 250, Q: 0.7 }, { type: "peaking", frequency: 1200, Q: 0.7, gain: -2.5 }]);

      const [bassBuf, vocalsBuf, drumsBuf, otherBuf] = await Promise.all([bassP, vocalsP, drumsP, otherP]);

      stemBuffers = { original: originalBuffer, bass: bassBuf, vocals: vocalsBuf, drums: drumsBuf, other: otherBuf };
      activeStem = "vocals";
      stemsSolo = null;
      stemsMuted = { vocals: false, drums: false, bass: false, other: false };
      stemsGain = { vocals: 100, drums: 100, bass: 100, other: 100 };
      renderStemsGrid();
      drawStemsWaveforms();
      // auto chop the vocal stem (most useful for Serato Sample workflow) — but keep option
      await useStemForChops("vocals", false);
      stemsStatus.textContent = "Done — 4 stems ready. Solo / Chop any stem → pads.";
      status("Stems split — DSP lite (Bass/Vocals/Drums/Melody) — instant");
    } catch (e) {
      console.error(e);
      stemsStatus.textContent = "Split failed: " + e.message;
    } finally {
      splitStemsBtn.disabled = false; splitStemsBtn.textContent = "Split Stems";
    }
  }

  async function useStemForChops(stemId, doAutoChop = true) {
    const buf = stemBuffers[stemId];
    if (!buf) { status("No stem: " + stemId, true); return; }
    activeStem = stemId;
    audioBuffer = buf;
    // update stems UI active
    $$(".stem-card").forEach(c => c.classList.toggle("active", c.dataset.stem === stemId));
    $$("#stemsGrid .stem-chop").forEach(b => b.classList.toggle("on", b.dataset.stem === stemId));
    draw();
    if (doAutoChop || (stemsAutoChop && stemsAutoChop.checked)) {
      autoChop();
    } else {
      updateCount();
    }
    // update BPM display
    updateBpmKey();
    // highlight selector
    if (stemsGrid) stemsGrid.querySelectorAll(".stem-card").forEach(c => c.dataset.active = c.dataset.stem === stemId ? "true" : "false");
  }

  function renderStemsGrid() {
    if (!stemsGrid) return;
    stemsGrid.innerHTML = "";
    const hasStems = stemBuffers.vocals || stemBuffers.bass;
    STEMS.forEach(st => {
      const buf = stemBuffers[st.id];
      const has = !!buf;
      const card = document.createElement("div");
      card.className = "stem-card" + (activeStem === st.id ? " active" : "") + (has ? "" : " empty");
      card.dataset.stem = st.id;
      card.innerHTML = `
        <div class="stem-head">
          <span class="stem-icon" style="border-color:${st.color}">${st.icon}</span>
          <div class="stem-title"><b>${st.name}</b><span class="mono">${st.desc}</span></div>
          <span class="stem-led" style="background:${has ? st.color : "#2a261c"}"></span>
        </div>
        <canvas class="stem-wave" width="280" height="64" data-stem="${st.id}"></canvas>
        <div class="stem-controls">
          <button class="ghost small stem-play" data-stem="${st.id}" ${has ? "" : "disabled"}>Play</button>
          <button class="ghost small stem-solo ${stemsSolo === st.id ? "on" : ""}" data-stem="${st.id}" ${has ? "" : "disabled"}>Solo</button>
          <button class="ghost small stem-mute ${stemsMuted[st.id] ? "on" : ""}" data-stem="${st.id}" ${has ? "" : "disabled"}>Mute</button>
          <label class="field small" style="flex:1;min-width:80px">Gain <input type="range" class="stem-gain" data-stem="${st.id}" min="0" max="150" value="${stemsGain[st.id] ?? 100}" ${has ? "" : "disabled"}></label>
        </div>
        <button class="primary small stem-chop ${activeStem === st.id ? "on" : ""}" data-stem="${st.id}" ${has ? "" : "disabled"}>${activeStem === st.id ? "✓ Chopping" : "Chop This Stem → Pads"}</button>
      `;
      stemsGrid.appendChild(card);
    });
    // bind
    stemsGrid.querySelectorAll(".stem-play").forEach(b => b.addEventListener("click", () => stemPreview(b.dataset.stem)));
    stemsGrid.querySelectorAll(".stem-solo").forEach(b => b.addEventListener("click", () => toggleStemSolo(b.dataset.stem)));
    stemsGrid.querySelectorAll(".stem-mute").forEach(b => b.addEventListener("click", () => toggleStemMute(b.dataset.stem)));
    stemsGrid.querySelectorAll(".stem-gain").forEach(r => r.addEventListener("input", (e) => { stemsGain[e.target.dataset.stem] = +e.target.value; updateStemGains(); }));
    stemsGrid.querySelectorAll(".stem-chop").forEach(b => b.addEventListener("click", async () => { await useStemForChops(b.dataset.stem, true); }));
    // canvas click to play
    stemsGrid.querySelectorAll(".stem-wave").forEach(cv => cv.addEventListener("click", () => { const id = cv.dataset.stem; if (stemBuffers[id]) stemPreview(id); }));
    drawStemsWaveforms();
  }

  function drawStemsWaveforms() {
    STEMS.forEach(st => {
      const cv = stemsGrid.querySelector(`canvas[data-stem="${st.id}"]`);
      if (!cv) return;
      const g = cv.getContext("2d");
      const W2 = cv.width, H2 = cv.height;
      g.clearRect(0, 0, W2, H2);
      g.fillStyle = "#0f0e0b"; g.fillRect(0, 0, W2, H2);
      const buf = stemBuffers[st.id];
      if (!buf) {
        g.fillStyle = "#6e6454"; g.font = "10px IBM Plex Mono, monospace"; g.textAlign = "center";
        g.fillText(hasStemsSplit() ? "—" : "Split to generate", W2 / 2, H2 / 2);
        return;
      }
      const data0 = buf.getChannelData(0);
      const data1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : data0;
      const len = buf.length;
      const step = Math.max(1, Math.floor(len / W2));
      const mid = H2 / 2;
      const amp = (H2 / 2) * 0.85;
      g.fillStyle = st.id === "vocals" ? "rgba(255,106,26,0.12)" : st.id === "bass" ? "rgba(126,224,200,0.12)" : st.id === "drums" ? "rgba(214,255,61,0.12)" : "rgba(154,140,114,0.12)";
      g.beginPath();
      for (let x = 0; x < W2; x++) {
        let min = 1, max = -1;
        const s = x * step, e = Math.min(len, s + step);
        for (let i = s; i < e; i++) { const v = (data0[i] + data1[i]) * 0.5; if (v < min) min = v; if (v > max) max = v; }
        const y = mid - max * amp; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      for (let x = W2 - 1; x >= 0; x--) {
        let min = 1; const s = x * step, e = Math.min(len, s + step);
        for (let i = s; i < e; i++) { const v = (data0[i] + data1[i]) * 0.5; if (v < min) min = v; }
        const y = mid - min * amp; g.lineTo(x, y);
      }
      g.closePath(); g.fill();
      g.strokeStyle = st.color; g.lineWidth = 1.2; g.beginPath();
      for (let x = 0; x < W2; x++) {
        let max = -1; const s = x * step, e = Math.min(len, s + step);
        for (let i = s; i < e; i++) { const v = (data0[i] + data1[i]) * 0.5; if (v > max) max = v; }
        const y = mid - max * amp; if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.stroke();
      if (activeStem === st.id) {
        g.strokeStyle = st.color; g.lineWidth = 1.5; g.strokeRect(0.5, 0.5, W2 - 1, H2 - 1);
      }
      // mute overlay
      if (stemsMuted[st.id]) {
        g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(0, 0, W2, H2);
        g.fillStyle = "#fff"; g.font = "10px Sora, sans-serif"; g.textAlign = "center"; g.fillText("MUTED", W2 / 2, H2 / 2);
      }
    });
  }

  function hasStemsSplit() { return !!(stemBuffers.vocals || stemBuffers.bass); }

  function toggleStemSolo(id) {
    if (stemsSolo === id) stemsSolo = null;
    else stemsSolo = id;
    renderStemsGrid(); drawStemsWaveforms(); updateStemGains();
  }
  function toggleStemMute(id) {
    stemsMuted[id] = !stemsMuted[id];
    renderStemsGrid(); drawStemsWaveforms(); updateStemGains();
  }
  function updateStemGains() {
    // for preview, gain is applied on play; for mix, we adjust
    drawStemsWaveforms();
  }

  let stemPreviewSource = null;
  function stopStemPreview() {
    if (stemPreviewSource) { try { stemPreviewSource.stop(); stemPreviewSource.disconnect(); } catch {} stemPreviewSource = null; }
    stemSources.forEach(({ src }) => { try { src.stop(); } catch {} });
    stemSources.clear();
  }
  function stemPreview(id) {
    const buf = stemBuffers[id];
    if (!buf) return;
    stopStemPreview();
    const c = getCtx();
    const src = c.createBufferSource(); src.buffer = buf;
    const gain = c.createGain();
    const g = (stemsGain[id] ?? 100) / 100;
    gain.gain.value = stemsMuted[id] ? 0 : g;
    src.connect(gain).connect(c.destination);
    src.start(0);
    stemPreviewSource = src;
    src.onended = () => { if (stemPreviewSource === src) stemPreviewSource = null; };
    status(`Preview: ${id} — ${buf.duration.toFixed(2)}s`);
    // visual: highlight card
    $$(".stem-card").forEach(card => card.classList.toggle("playing", card.dataset.stem === id));
    setTimeout(() => $$(".stem-card").forEach(card => card.classList.remove("playing")), buf.duration * 1000 + 200);
  }

  function playMixPreview() {
    if (!originalBuffer) return;
    // if solo, play solo stem, else play original (mix)
    if (stemsSolo && stemBuffers[stemsSolo]) { stemPreview(stemsSolo); return; }
    // if muted stems, we could mix remaining stems, but simplest: play original with mutes applied via gains? For now play original if no solo
    // check if any stem muted -> if all stems except one muted, play that solo logic already handled
    // else play originalBuffer
    stopStemPreview();
    const c = getCtx();
    const src = c.createBufferSource(); src.buffer = originalBuffer;
    src.connect(c.destination); src.start(0);
    stemPreviewSource = src;
    status("Play mix — original");
  }

  async function exportStemsZip() {
    if (!hasStemsSplit()) { status("No stems to export — Split first", true); return; }
    const files = [];
    for (const st of STEMS) {
      const buf = stemBuffers[st.id];
      if (!buf) continue;
      const wav = encodeWAV(buf, 0, buf.duration);
      files.push({ name: `7H_stem_${st.id}_${fileName || "stem"}.wav`, data: wav });
    }
    // also add chops of active stem if any
    if (audioBuffer && slices.length) {
      const chopFiles = slices.map((s, i) => {
        const wav = encodeWAV(audioBuffer, s.start, s.end);
        const bankChar = i < 16 ? "A" : "B";
        const pad = String((i % 16) + 1).padStart(2, "0");
        return { name: `chops_${activeStem}/7H_chop_${bankChar}${pad}.wav`, data: wav };
      });
      files.push(...chopFiles);
    }
    const zip = makeZip(files);
    downloadBlob(new Blob([zip], { type: "application/zip" }), `7H_stems_${fileName || "pack"}_${activeStem}.zip`);
    status(`Exported stems ZIP · ${files.length} files`);
  }

  // --- loading
  async function loadArrayBuffer(ab, name = "sample") {
    const c = getCtx();
    try {
      const buf = await c.decodeAudioData(ab.slice(0));
      audioBuffer = buf;
      originalBuffer = buf;
      stemBuffers = { original: buf, vocals: null, drums: null, bass: null, other: null };
      activeStem = "original";
      stemsSolo = null;
      stemsMuted = { vocals: false, drums: false, bass: false, other: false };
      renderStemsGrid();
      fileName = name.replace(/\.[^.]+$/, "");
      status(`Loaded ${name} · ${buf.duration.toFixed(2)}s · ${buf.sampleRate}Hz · ${buf.numberOfChannels}ch`);
      trimStartEl.value = 0; trimEndEl.value = 1000;
      selectedGlobal = 0; bank = 0; syncBankUI();
      autoChop();
      draw();
      if (stemsStatus) stemsStatus.textContent = "Ready — Split Stems to isolate Vocals/Drums/Bass/Melody";
    } catch (e) {
      console.error(e);
      status("Decode failed: " + e.message, true);
    }
  }

  async function loadFile(file) {
    if (!file) return;
    const ab = await file.arrayBuffer();
    await loadArrayBuffer(ab, file.name);
  }

  function status(msg, isErr) {
    statusEl.textContent = msg;
    statusEl.style.color = isErr ? "var(--danger)" : "var(--mute)";
    if (isErr) console.warn(msg);
  }

  // --- demo break generation (synthetic 92 BPM dust break, 2 bars)
  function makeDemoBuffer() {
    const c = getCtx();
    const sr = c.sampleRate;
    const bpm = 92, bars = 2, beatsPerBar = 4;
    const dur = (60 / bpm) * beatsPerBar * bars;
    const len = Math.floor(dur * sr);
    const buf = c.createBuffer(2, len, sr);
    const L = buf.getChannelData(0), R = buf.getChannelData(1);
    function addClick(time, freq, decay, amp, type = "sine") {
      const start = Math.floor(time * sr);
      const n = Math.floor(decay * sr);
      for (let i = 0; i < n && start + i < len; i++) {
        const t = i / sr;
        const env = Math.exp(-t * (18 / decay)) * amp;
        const v = Math.sin(2 * Math.PI * freq * t * (type === "kick" ? (1 + Math.exp(-t * 60) * 0.8) : 1)) * env;
        L[start + i] += v * 0.92; R[start + i] += v * 0.88;
        if (i < 0.008 * sr) {
          const nse = (Math.random() * 2 - 1) * amp * 0.25 * Math.exp(-t * 300);
          L[start + i] += nse; R[start + i] += nse * 0.9;
        }
      }
    }
    function addHat(time, amp = 0.22) {
      const start = Math.floor(time * sr);
      const n = Math.floor(0.08 * sr);
      for (let i = 0; i < n && start + i < len; i++) {
        const t = i / sr;
        const env = Math.exp(-t * 85) * amp;
        const v = (Math.random() * 2 - 1) * env * 0.6 + Math.sin(2 * Math.PI * 8000 * t) * env * 0.18;
        const hp = v * (i > 5 ? 1 : i / 5);
        L[start + i] += hp * 0.9; R[start + i] += hp * 1.0;
      }
    }
    const step = (60 / bpm) / 2;
    for (let bar = 0; bar < bars; bar++) {
      const barStart = bar * (60 / bpm) * 4;
      addClick(barStart + 0.00, 62, 0.42, 0.95, "kick");
      addClick(barStart + 0.70, 60, 0.18, 0.38, "kick");
      addClick(barStart + (60 / bpm) * 2 + 0.02, 58, 0.35, 0.62, "kick");
      addClick(barStart + (60 / bpm) * 1, 180, 0.22, 0.72);
      addClick(barStart + (60 / bpm) * 3, 176, 0.26, 0.78);
      for (let e = 0; e < 8; e++) {
        const swing = e % 2 === 1 ? 0.07 * (0.62 - 0.5) * 4 : 0;
        const t = barStart + e * step + swing;
        const acc = (e % 4 === 0) ? 0.26 : (e % 2 === 0) ? 0.18 : 0.14;
        if (Math.random() < 0.92) addHat(t, acc);
      }
      for (let i = bar * len / bars; i < (bar + 1) * len / bars; i++) {
        if (Math.random() < 0.003) { const v = (Math.random() * 2 - 1) * 0.06; L[i] += v; R[i] += v * 0.9; }
      }
    }
    for (let i = 0; i < len; i++) {
      const wob = Math.sin(2 * Math.PI * 0.7 * i / sr) * 0.012;
      L[i] += wob * 0.05; R[i] -= wob * 0.05;
    }
    let max = 0; for (let i = 0; i < len; i++) { max = Math.max(max, Math.abs(L[i]), Math.abs(R[i])); }
    const gain = max > 0 ? 0.86 / max : 1;
    for (let i = 0; i < len; i++) { L[i] *= gain; R[i] *= gain; }
    return buf;
  }

  async function loadDemo() {
    const buf = makeDemoBuffer();
    audioBuffer = buf;
    originalBuffer = buf;
    stemBuffers = { original: buf, vocals: null, drums: null, bass: null, other: null };
    activeStem = "original";
    renderStemsGrid();
    fileName = "7H_DEMO_DUST_92";
    status(`Demo break · ${buf.duration.toFixed(2)}s · ${buf.sampleRate}Hz · 92 BPM swung`);
    trimStartEl.value = 0; trimEndEl.value = 1000;
    selectedGlobal = 0; bank = 0; syncBankUI();
    autoChop();
    draw();
    if (stemsStatus) stemsStatus.textContent = "Demo loaded — Split Stems to isolate";
  }

  // --- WAV & ZIP encoding
  function encodeWAV(audioBuf, startSec, endSec) {
    const sr = audioBuf.sampleRate; const ch = audioBuf.numberOfChannels;
    const start = Math.max(0, Math.floor(startSec * sr));
    const end = Math.min(audioBuf.length, Math.floor(endSec * sr));
    const len = Math.max(1, end - start);
    const bytesPerSample = 2; const blockAlign = ch * bytesPerSample; const byteRate = sr * blockAlign; const dataSize = len * blockAlign;
    const buf = new ArrayBuffer(44 + dataSize); const view = new DataView(buf);
    function writeStr(off, s) { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
    writeStr(0, "RIFF"); view.setUint32(4, 36 + dataSize, true); writeStr(8, "WAVE"); writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, ch, true); view.setUint32(24, sr, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, 16, true); writeStr(36, "data"); view.setUint32(40, dataSize, true);
    let off = 44;
    for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const v = audioBuf.getChannelData(c)[start + i]; const s = Math.max(-1, Math.min(1, v)); view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2; }
    return new Uint8Array(buf);
  }
  function makeZip(files) {
    const parts = []; const central = []; let offset = 0; const enc = new TextEncoder();
    for (const f of files) {
      const nameBytes = enc.encode(f.name); const data = f.data; const crc = crc32(data);
      const lh = new ArrayBuffer(30 + nameBytes.length); const v = new DataView(lh);
      v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0, true); v.setUint16(8, 0, true); v.setUint16(10, 0, true); v.setUint16(12, 0, true); v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, nameBytes.length, true); v.setUint16(28, 0, true);
      const lhBytes = new Uint8Array(lh); lhBytes.set(nameBytes, 30); parts.push(lhBytes); parts.push(data);
      const ch = new ArrayBuffer(46 + nameBytes.length); const cv = new DataView(ch);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, nameBytes.length, true); cv.setUint16(30, 0, true); cv.setUint16(32, 0, true); cv.setUint16(34, 0, true); cv.setUint16(36, 0, true); cv.setUint32(38, 0, true); cv.setUint32(42, offset, true);
      const chBytes = new Uint8Array(ch); chBytes.set(nameBytes, 46); central.push(chBytes); offset += lhBytes.length + data.length;
    }
    const centralSize = central.reduce((a, b) => a + b.length, 0); const centralOffset = offset;
    const eocd = new ArrayBuffer(22); const ev = new DataView(eocd);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(4, 0, true); ev.setUint16(6, 0, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, centralSize, true); ev.setUint32(16, centralOffset, true); ev.setUint16(20, 0, true);
    const eocdBytes = new Uint8Array(eocd); const totalLen = offset + centralSize + eocdBytes.length; const out = new Uint8Array(totalLen);
    let pos = 0; for (const p of parts) { out.set(p, pos); pos += p.length; } for (const c of central) { out.set(c, pos); pos += c.length; } out.set(eocdBytes, pos); return out;
  }
  const crcTable = (() => { const t = new Uint32Array(256); for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[i] = c; } return t; })();
  function crc32(u8) { let c = 0 ^ -1; for (let i = 0; i < u8.length; i++) c = (c >>> 8) ^ crcTable[(c ^ u8[i]) & 0xFF]; return (c ^ -1) >>> 0; }
  function downloadBlob(blob, name) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
  function exportOneWav() {
    if (!audioBuffer || !slices[selectedGlobal]) { status("No slice selected", true); return; }
    const s = slices[selectedGlobal]; const wav = encodeWAV(audioBuffer, s.start, s.end);
    const bankChar = selectedGlobal < 16 ? "A" : "B"; const pad = String((selectedGlobal % 16) + 1).padStart(2, "0");
    downloadBlob(new Blob([wav], { type: "audio/wav" }), `7H_chop_${bankChar}${pad}_${fileName || "slice"}_${activeStem}.wav`);
  }
  function exportEachWav() {
    if (!audioBuffer || !slices.length) return;
    slices.forEach((s, i) => { const wav = encodeWAV(audioBuffer, s.start, s.end); const bankChar = i < 16 ? "A" : "B"; const pad = String((i % 16) + 1).padStart(2, "0"); setTimeout(() => downloadBlob(new Blob([wav], { type: "audio/wav" }), `7H_chop_${bankChar}${pad}_${fileName || "slice"}_${activeStem}.wav`), i * 120); });
  }
  function exportZipAll() {
    if (!audioBuffer || !slices.length) { status("No slices to export", true); return; }
    const files = slices.map((s, i) => { const wav = encodeWAV(audioBuffer, s.start, s.end); const bankChar = i < 16 ? "A" : "B"; const pad = String((i % 16) + 1).padStart(2, "0"); return { name: `7H_chop_${bankChar}${pad}_${fileName || "slice"}_${activeStem}.wav`, data: wav }; });
    try { if (window.SEVEN_H && document.getElementById("styleOut")) { const style = $("#styleOut")?.textContent || ""; const struct = $("#structOut")?.textContent || ""; const excl = $("#exclOut")?.textContent || ""; if (style && struct) { const pack = [style, struct, excl].join("\n\n"); const enc = new TextEncoder(); files.push({ name: "7H_prompt_pack.txt", data: enc.encode(pack) }); } } } catch {}
    const zip = makeZip(files);
    downloadBlob(new Blob([zip], { type: "application/zip" }), `7H_chops_${fileName || "pack"}_${activeStem}_${slices.length}chops.zip`);
    status(`Exported ZIP · ${files.length} files (${activeStem})`);
  }

  // --- interaction: drag markers
  let dragIdx = null; let dragIsEnd = false;
  function hitTestMarker(clientX) {
    if (!audioBuffer) return null;
    const rect = chopCanvas.getBoundingClientRect(); const x = clientX - rect.left; const dur = audioBuffer.duration; const scale = W / rect.width; const cx = x * scale;
    for (let i = 0; i < slices.length; i++) {
      const sx = (slices[i].start / dur) * W; const ex = (slices[i].end / dur) * W;
      if (Math.abs(cx - sx) < 10) return { idx: i, isEnd: false };
      if (i === slices.length - 1 && Math.abs(cx - ex) < 10) return { idx: i, isEnd: true };
    } return null;
  }
  chopCanvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    const hit = hitTestMarker(e.clientX);
    if (hit) { dragIdx = hit.idx; dragIsEnd = hit.isEnd; e.preventDefault(); }
    else {
      if (!audioBuffer) return;
      const rect = chopCanvas.getBoundingClientRect(); const x = e.clientX - rect.left; const t = (x / rect.width) * audioBuffer.duration;
      const idx = slices.findIndex(s => t >= s.start && t < s.end);
      if (idx >= 0) { selectedGlobal = idx; bank = Math.floor(idx / 16); syncBankUI(); renderPads(); drawChops(); triggerGlobal(idx); }
      else { const c = getCtx(); const src = c.createBufferSource(); src.buffer = audioBuffer; src.connect(c.destination); const dur = 0.35; src.start(0, t, dur); showPlayhead({ start: t, end: Math.min(audioBuffer.duration, t + dur) }, 1, dur); }
    }
  });
  chopCanvas.addEventListener("dblclick", (e) => {
    if (!audioBuffer) return; e.preventDefault();
    const hit = hitTestMarker(e.clientX); if (hit) return;
    const rect = chopCanvas.getBoundingClientRect(); const t = ((e.clientX - rect.left) / rect.width) * audioBuffer.duration;
    const existing = slices.findIndex(s => t > s.start && t < s.end);
    if (existing >= 0) {
      const s = slices[existing]; const left = { start: s.start, end: t }; const right = { start: t, end: s.end };
      if ((left.end - left.start) > 0.025 && (right.end - right.start) > 0.025) { slices.splice(existing, 1, left, right); if (slices.length > 32) slices = slices.slice(0, 32); updateCount(); renderPads(); }
    }
  });
  chopCanvas.addEventListener("contextmenu", (e) => {
    e.preventDefault(); const hit = hitTestMarker(e.clientX);
    if (hit && !hit.isEnd) {
      if (hit.idx < slices.length - 1) { slices[hit.idx].end = slices[hit.idx + 1].end; slices.splice(hit.idx + 1, 1); if (selectedGlobal >= slices.length) selectedGlobal = slices.length - 1; updateCount(); renderPads(); }
      else if (slices.length > 1) { slices.pop(); updateCount(); renderPads(); }
    }
  });
  window.addEventListener("mousemove", (e) => {
    if (dragIdx === null) return;
    const rect = chopCanvas.getBoundingClientRect(); let t = ((e.clientX - rect.left) / rect.width) * audioBuffer.duration; t = clamp(t, 0, audioBuffer.duration - 0.01);
    if (dragIsEnd) { const s = slices[dragIdx]; if (t > s.start + 0.02) s.end = t; if (dragIdx < slices.length - 1) slices[dragIdx + 1].start = t; }
    else { const s = slices[dragIdx]; if (t < s.end - 0.02 && t >= 0) { const prevEnd = dragIdx > 0 ? slices[dragIdx - 1].end : 0; if (t > prevEnd + 0.02) { s.start = t; if (dragIdx > 0) slices[dragIdx - 1].end = t; } } }
    drawChops(); renderPads(); renderChopsList();
  });
  window.addEventListener("mouseup", () => { dragIdx = null; });

  // --- keyboard
  const heldKeys = new Set();
  window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    const k = e.key.toLowerCase(); const isShift = e.shiftKey; let pad = QWERTY_MAP[k];
    if (pad !== undefined) {
      if (isShift) {
        const g = 16 + pad; if (g < slices.length) { e.preventDefault(); if (heldKeys.has(k + "_s")) return; heldKeys.add(k + "_s"); bank = 1; syncBankUI(); triggerPad(pad, "down"); selectedGlobal = g; drawChops(); renderChopsList(); }
      } else { e.preventDefault(); if (heldKeys.has(k)) return; heldKeys.add(k); triggerPad(pad, "down"); selectedGlobal = bank * 16 + pad; if (selectedGlobal < slices.length) { drawChops(); renderChopsList(); } }
    }
    if (e.code === "Space" && !e.repeat) {
      const view = $("#view-sampler");
      if (view && view.classList.contains("show")) { e.preventDefault(); if (slices[selectedGlobal]) triggerGlobal(selectedGlobal); }
    }
  });
  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase(); const shiftKey = k + "_s";
    if (heldKeys.has(k)) { heldKeys.delete(k); const pad = QWERTY_MAP[k]; if (pad !== undefined) triggerPad(pad, "up"); }
    if (heldKeys.has(shiftKey)) { heldKeys.delete(shiftKey); const pad = QWERTY_MAP[k]; if (pad !== undefined) triggerPad(pad, "up"); }
  });

  // --- MIDI
  let midiAccess = null;
  async function enableMidi() {
    if (!navigator.requestMIDIAccess) { midiStatus.textContent = "MIDI: not supported"; return; }
    try {
      midiAccess = await navigator.requestMIDIAccess();
      midiStatus.textContent = "MIDI: ready — C1–B2";
      midiBtn.textContent = "MIDI on"; midiBtn.classList.add("on");
      for (const input of midiAccess.inputs.values()) input.onmidimessage = onMidi;
      midiAccess.onstatechange = () => { for (const input of midiAccess.inputs.values()) input.onmidimessage = onMidi; };
      status("MIDI enabled");
    } catch (err) { midiStatus.textContent = "MIDI: denied"; console.warn(err); }
  }
  function onMidi(msg) {
    const [status, note, vel] = msg.data; const cmd = status & 0xf0;
    if (cmd === 0x90 && vel > 0) handleMidiNote(note, vel / 127);
    else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) handleMidiNoteOff(note);
  }
  const midiPadDown = new Map();
  function handleMidiNote(note, v) {
    if (mode === "chromatic") {
      if (note >= 60 && note <= 75) {
        const semitone = note - 60 + (+tuneEl.value) + (+rootEl.value); const fine = (+fineEl.value) / 100; const sl = slices[selectedGlobal];
        if (sl) playSlice(sl, note - 60, semitone + fine);
        midiStatus.textContent = `MIDI: ${note} → chromatic ${semitone > 0 ? "+" : ""}${semitone}`; return;
      }
    }
    if (note >= 36 && note <= 67) {
      const g = note - 36; if (g < slices.length) {
        selectedGlobal = g; bank = g < 16 ? 0 : 1; syncBankUI(); renderPads(); drawChops(); renderChopsList();
        const pad = g % 16; midiPadDown.set(note, pad); triggerGlobal(g, pad);
        midiStatus.textContent = `MIDI: ${note} → ${g < 16 ? "A" : "B"}${(pad + 1).toString().padStart(2,"0")}`;
      }
    }
  }
  function handleMidiNoteOff(note) {
    if (mode === "chromatic" && note >= 60) return;
    const pad = midiPadDown.get(note);
    if (pad !== undefined) { if (playMode === "gate") stopPad(pad); midiPadDown.delete(note); }
  }

  // --- exports
  exportOne.addEventListener("click", exportOneWav);
  exportEach.addEventListener("click", exportEachWav);
  exportZip.addEventListener("click", exportZipAll);
  if (copyPack) copyPack.addEventListener("click", () => {
    const styleEl = $("#styleOut"), structEl = $("#structOut"), exclEl = $("#exclOut");
    if (styleEl && structEl) {
      const style = styleEl.textContent; const struct = structEl.textContent; const excl = exclEl.textContent;
      const pack = window.SEVEN_H ? window.SEVEN_H.pack(style, struct, excl) : (style + "\n" + struct + "\n" + excl);
      const txt = pack + `\n\n# Chop ${selectedGlobal < 16 ? "A" : "B"}${(selectedGlobal % 16) + 1} · ${fileName || "sample"} · ${slices[selectedGlobal] ? fmtTime(slices[selectedGlobal].start) + "–" + fmtTime(slices[selectedGlobal].end) : ""} • stem:${activeStem}`;
      navigator.clipboard.writeText(txt).then(() => { const old = copyPack.textContent; copyPack.textContent = "Copied"; copyPack.classList.add("ok"); setTimeout(() => { copyPack.textContent = old; copyPack.classList.remove("ok"); }, 1200); });
    }
  });

  // --- sens / min
  sens.addEventListener("input", () => { sensV.textContent = sens.value; });
  sens.addEventListener("change", autoChop);
  minEl.addEventListener("input", () => { minV.textContent = minEl.value + "ms"; });
  minEl.addEventListener("change", autoChop);
  autoBtn.addEventListener("click", autoChop);
  equalBtn.addEventListener("click", () => equalChop(16));
  if (clearBtn) clearBtn.addEventListener("click", clearChops);
  if (trimApplyBtn) trimApplyBtn.addEventListener("click", autoChop);
  if (trimStartEl) trimStartEl.addEventListener("input", drawChops);
  if (trimEndEl) trimEndEl.addEventListener("input", drawChops);
  gainEl.addEventListener("input", () => gainV.textContent = gainEl.value + "%");
  attEl.addEventListener("input", () => attV.textContent = attEl.value + "ms");
  relEl.addEventListener("input", () => relV.textContent = relEl.value + "ms");
  tuneEl.addEventListener("input", () => tuneV.textContent = (tuneEl.value > 0 ? "+" : "") + tuneEl.value);
  fineEl.addEventListener("input", () => fineV.textContent = (fineEl.value > 0 ? "+" : "") + fineEl.value + "ct");
  if (rootEl) rootEl.addEventListener("change", () => {});

  // --- bank/mode
  bankSeg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; bank = +b.dataset.v; syncBankUI(); renderPads(); drawChops(); });
  modeSeg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; mode = b.dataset.v; syncModeUI(); renderPads(); status(mode === "chromatic" ? "Chromatic: selected chop pitched across pads" : "Slice: each pad = one chop"); });
  playSeg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; playMode = b.dataset.v; syncPlayUI(); });

  // --- simple mode
  if (simpleSeg) {
    simpleSeg.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      simpleMode = b.dataset.v === "simple";
      syncSimpleMode();
    });
    syncSimpleMode();
  }

  // --- stems bindings
  if (splitStemsBtn) splitStemsBtn.addEventListener("click", splitStems);
  if (stemsUseOriginalBtn) stemsUseOriginalBtn.addEventListener("click", async () => { await useStemForChops("original", true); stemsStatus.textContent = "Back to original mix — chopping full sample"; });
  if (stemsExportAllBtn) stemsExportAllBtn.addEventListener("click", exportStemsZip);
  if (stemsPlayMixBtn) stemsPlayMixBtn.addEventListener("click", playMixPreview);

  // --- file/drop
  function isAudioFile(f) { return f && f.type.startsWith("audio/") || /\.(wav|mp3|flac|ogg|m4a|aiff|aif)$/i.test(f.name); }
  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
  drop.addEventListener("drop", async (e) => {
    e.preventDefault(); drop.classList.remove("drag");
    const f = e.dataTransfer.files[0]; if (!f) return;
    if (!isAudioFile(f)) { status("Not audio: " + f.name, true); return; }
    await loadFile(f);
  });
  fileInput.addEventListener("change", async () => { const f = fileInput.files[0]; if (f) await loadFile(f); fileInput.value = ""; });
  const hiddenInput = document.getElementById("samFile");
  if (hiddenInput && hiddenInput !== fileInput) hiddenInput.addEventListener("change", async () => { const f = hiddenInput.files[0]; if (f) await loadFile(f); });
  window.addEventListener("dragover", (e) => e.preventDefault());
  window.addEventListener("drop", async (e) => {
    const samplerView = $("#view-sampler");
    if (!samplerView.classList.contains("show")) return;
    if (e.target.closest("#samDrop")) return;
    e.preventDefault();
    const f = e.dataTransfer.files[0]; if (f && isAudioFile(f)) await loadFile(f);
  });
  demoBtn.addEventListener("click", loadDemo);
  const altDemo = $("#samDemo"); if (altDemo && altDemo !== demoBtn) altDemo.addEventListener("click", loadDemo);
  midiBtn.addEventListener("click", enableMidi);

  // initial render
  renderPads(); renderChopsList(); renderStemsGrid(); draw(); syncBankUI(); syncModeUI(); syncPlayUI();
  if (gainV) gainV.textContent = gainEl.value + "%";
  if (attV) attV.textContent = attEl.value + "ms";
  if (relV) relV.textContent = relEl.value + "ms";
  function resizeCanvas() { draw(); }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  window._sampler = {
    get buffer() { return audioBuffer; },
    get originalBuffer() { return originalBuffer; },
    get stemBuffers() { return stemBuffers; },
    get activeStem() { return activeStem; },
    get slices() { return slices; },
    set slices(v) { slices = v; updateCount(); renderPads(); },
    autoChop, equalChop, clearChops, splitStems, useStemForChops,
    get selected() { return selectedGlobal; },
    set selected(v) { selectedGlobal = v; drawChops(); },
    get bank() { return bank; },
    set bank(v) { bank = v; syncBankUI(); renderPads(); },
    loadDemo
  };
})();
