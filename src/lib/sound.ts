/**
 * All sound is synthesised with the Web Audio API: no audio files to load.
 * Browsers only allow audio after a user gesture, so nothing plays until the
 * visitor first clicks, taps or presses a key. A mute button is always shown.
 */

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let muted = false

const start = () => {
  if (ctx || typeof window === "undefined") return
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = muted ? 0 : 0.8
  master.connect(ctx.destination)

  // Two seconds of white noise, reused for wind, footsteps and whooshes.
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  // Ambient wind across the valley: low-passed noise that slowly breathes.
  const wind = ctx.createBufferSource()
  wind.buffer = noise
  wind.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 420
  const gain = ctx.createGain()
  gain.gain.value = 0.05
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 0.09
  const depth = ctx.createGain()
  depth.gain.value = 0.025
  lfo.connect(depth).connect(gain.gain)
  wind.connect(lp).connect(gain).connect(master)
  wind.start()
  lfo.start()
}

/** Call from any user gesture. Safe to call repeatedly. */
export const unlock = () => {
  start()
  if (ctx?.state === "suspended") void ctx.resume()
}

export const setMuted = (m: boolean) => {
  muted = m
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.8, ctx.currentTime, 0.05)
}

const burst = (freq: number, q: number, vol: number, dur: number, type: BiquadFilterType = "bandpass") => {
  if (!ctx || !master || !noise || muted) return
  const src = ctx.createBufferSource()
  src.buffer = noise
  src.playbackRate.value = 0.8 + Math.random() * 0.4
  const f = ctx.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx.createGain()
  const t = ctx.currentTime
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t, Math.random())
  src.stop(t + dur + 0.02)
}

const tone = (freq: number, vol: number, dur: number, delay = 0, type: OscillatorType = "sine") => {
  if (!ctx || !master || muted) return
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.value = freq
  const g = ctx.createGain()
  const t = ctx.currentTime + delay
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export const sound = {
  /** Fast travel: a rising shimmer as the character dissolves. */
  teleport() {
    if (!ctx || !master || !noise || muted) return
    const src = ctx.createBufferSource()
    src.buffer = noise
    const f = ctx.createBiquadFilter()
    f.type = "bandpass"
    f.Q.value = 4
    const g = ctx.createGain()
    const t = ctx.currentTime
    f.frequency.setValueAtTime(300, t)
    f.frequency.exponentialRampToValueAtTime(3200, t + 0.55)
    f.frequency.exponentialRampToValueAtTime(500, t + 1.15)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.3)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2)
    src.connect(f).connect(g).connect(master)
    src.start(t)
    src.stop(t + 1.25)
    ;[660, 990, 1320].forEach((hz, i) => tone(hz, 0.05, 0.5, 0.5 + i * 0.07))
  },
  /** Arriving at a place: two soft notes. */
  arrive() {
    tone(523.25, 0.07, 0.5)
    tone(783.99, 0.06, 0.7, 0.12)
  },
  /** Buttons and selections. */
  click() {
    tone(880, 0.05, 0.08, 0, "triangle")
  },
  /** Opening an information panel. */
  open() {
    tone(660, 0.05, 0.18, 0, "triangle")
    tone(990, 0.04, 0.22, 0.06, "triangle")
  },
}
