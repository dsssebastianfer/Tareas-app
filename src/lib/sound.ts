let ctx: AudioContext | null = null;

function audio(): AudioContext {
  ctx ??= new AudioContext();
  return ctx;
}

function note(ac: AudioContext, freq: number, at: number, dur: number, vol: number) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.04, at + dur);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(vol, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

/** Dos notas suaves ascendentes: el "ding" de completar. */
export function playComplete() {
  try {
    const ac = audio();
    const t = ac.currentTime;
    note(ac, 784, t, 0.16, 0.09);
    note(ac, 1175, t + 0.07, 0.24, 0.07);
  } catch {
    /* audio no disponible */
  }
}

/** Una nota corta y suave: tarea agregada. */
export function playAdd() {
  try {
    const ac = audio();
    note(ac, 660, ac.currentTime, 0.12, 0.06);
  } catch {
    /* audio no disponible */
  }
}

/** Arpegio corto para cuando no queda nada pendiente. */
export function playCelebrate() {
  try {
    const ac = audio();
    const t = ac.currentTime;
    [784, 988, 1175, 1568].forEach((f, i) => note(ac, f, t + i * 0.08, 0.3, 0.07));
  } catch {
    /* audio no disponible */
  }
}
