import confetti from 'canvas-confetti';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function burstFrom(el: Element, colors: string[]) {
  if (reduced()) return;
  const r = el.getBoundingClientRect();
  void confetti({
    particleCount: 26,
    spread: 70,
    startVelocity: 20,
    gravity: 0.9,
    decay: 0.9,
    scalar: 0.7,
    ticks: 110,
    shapes: ['circle', 'square'],
    colors,
    origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
  });
}

export function celebrate(colors: string[]) {
  if (reduced()) return;
  const base = { particleCount: 70, spread: 75, startVelocity: 45, scalar: 0.9, ticks: 200, colors };
  void confetti({ ...base, angle: 60, origin: { x: 0, y: 0.75 } });
  void confetti({ ...base, angle: 120, origin: { x: 1, y: 0.75 } });
}
