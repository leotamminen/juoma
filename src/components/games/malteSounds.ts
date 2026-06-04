// Web Audio API sound engine for Malte

export type SoundPack = "normal" | "funny" | "intense";

// ── Primitive generators ────────────────────────────────────────────────────

function glug(ctx: AudioContext, t: number, freq: number, vol = 0.55, dur = 0.22) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  filt.type = "lowpass"; filt.frequency.value = 700; filt.Q.value = 8;
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.42, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur + 0.05);
}

function kick(ctx: AudioContext, t: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(175, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 0.07);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
  osc.start(t); osc.stop(t + 0.25);
}

function snare(ctx: AudioContext, t: number, vol: number) {
  const sz = Math.floor(ctx.sampleRate * 0.14);
  const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const filt = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filt.type = "bandpass"; filt.frequency.value = 2000; filt.Q.value = 0.8;
  src.buffer = buf;
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
  src.start(t); src.stop(t + 0.14);
}

function hat(ctx: AudioContext, t: number, vol: number) {
  const sz = Math.floor(ctx.sampleRate * 0.025);
  const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  const filt = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filt.type = "highpass"; filt.frequency.value = 9500;
  src.buffer = buf;
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
  src.start(t); src.stop(t + 0.03);
}

function bassNote(ctx: AudioContext, t: number, freq: number, dur: number, vol: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "triangle"; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.start(t); osc.stop(t + dur + 0.04);
}

// ── Drink sounds ────────────────────────────────────────────────────────────

export function playDrink(ctx: AudioContext, pack: SoundPack): void {
  const now = ctx.currentTime;

  if (pack === "normal") {
    glug(ctx, now,       115, 0.55);
    glug(ctx, now + 0.3, 95,  0.50);
    glug(ctx, now + 0.6, 105, 0.45);

  } else if (pack === "funny") {
    // Cartoon swoosh + glug
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(65,  now + 0.55);
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.start(now); osc.stop(now + 0.65);
    glug(ctx, now + 0.5, 170, 0.45, 0.2);
    glug(ctx, now + 0.78, 150, 0.35, 0.2);

  } else {
    // Intense: distorted bass chug
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const dist = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 80) * x / (Math.PI + 80 * Math.abs(x));
    }
    dist.curve = curve;
    osc.connect(dist); dist.connect(g); g.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(78, now);
    osc.frequency.exponentialRampToValueAtTime(33, now + 0.5);
    g.gain.setValueAtTime(0.85, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.start(now); osc.stop(now + 0.55);
    glug(ctx, now + 0.48, 68, 0.55, 0.26);
    glug(ctx, now + 0.76, 62, 0.45, 0.26);
  }
}

// ── Sip warning ─────────────────────────────────────────────────────────────

export function playSipWarning(ctx: AudioContext, pack: SoundPack): void {
  const now = ctx.currentTime;

  if (pack === "normal") {
    // Two soft chimes
    [0, 0.28].forEach((off, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 1100;
      g.gain.setValueAtTime(0.35, now + off);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.55);
      osc.start(now + off); osc.stop(now + off + 0.6);
    });

  } else if (pack === "funny") {
    // Wah wah wah
    const osc = ctx.createOscillator();
    const filt = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.type = "sawtooth"; osc.frequency.value = 220;
    filt.type = "bandpass"; filt.frequency.value = 900; filt.Q.value = 2;
    [0, 0.28, 0.56].forEach(off => {
      g.gain.setValueAtTime(0.4, now + off);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.22);
    });
    osc.start(now); osc.stop(now + 0.85);

  } else {
    // Air horn trio
    [0, 0.22, 0.44].forEach(off => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = 220;
      g.gain.setValueAtTime(0.55, now + off);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.16);
      osc.start(now + off); osc.stop(now + off + 0.2);
    });
  }
}

// ── Bus music ───────────────────────────────────────────────────────────────
// 8-step patterns per pack: [kickOn, snareOn, hatOn, bassHz]

const PATTERNS: Record<SoundPack, [number, number, number, number][]> = {
  normal: [
    [1,0,1,55],[0,0,0,0],[0,1,1,55],[0,0,0,0],
    [1,0,1,55],[0,0,0,0],[0,1,1,73],[0,0,1,0],
  ],
  funny: [
    [1,0,1,110],[0,0,1,138],[0,1,1,110],[0,1,1,92],
    [1,0,1,110],[0,0,1,0  ],[0,1,1,138],[0,1,1,110],
  ],
  intense: [
    [1,0,1,55],[1,0,1,55],[0,1,1,73],[1,0,1,0 ],
    [1,0,1,55],[1,0,1,0 ],[0,1,1,82],[1,0,1,55],
  ],
};

const VOLS: Record<SoundPack, [number, number, number, number]> = {
  normal:  [0.70, 0.28, 0.11, 0.30],
  funny:   [0.65, 0.32, 0.14, 0.28],
  intense: [0.95, 0.55, 0.20, 0.48],
};

export function startBussMusic(ctx: AudioContext, pack: SoundPack): () => void {
  const bpm = pack === "intense" ? 145 : pack === "funny" ? 118 : 95;
  const beatDur = 60 / bpm;
  const pat = PATTERNS[pack];
  const [vk, vs, vh, vb] = VOLS[pack];

  let running = true;
  let step = 0;
  let nextTime = ctx.currentTime + 0.05;

  function schedule() {
    if (!running) return;
    while (nextTime < ctx.currentTime + 0.15) {
      const s = step % 8;
      const t = nextTime;
      const [k, sn, h, b] = pat[s];
      if (k)  kick(ctx, t, vk);
      if (sn) snare(ctx, t, vs);
      if (h)  hat(ctx, t, vh);
      if (b)  bassNote(ctx, t, b, beatDur * 0.82, vb);
      // Intense: extra offbeat hat
      if (pack === "intense") hat(ctx, t + beatDur * 0.5, vh * 0.55);
      // Funny: extra syncopated hat
      if (pack === "funny" && s % 2 === 1) hat(ctx, t + beatDur * 0.5, vh * 0.4);
      step++;
      nextTime += beatDur;
    }
    if (running) setTimeout(schedule, 40);
  }

  schedule();
  return () => { running = false; };
}
