export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  opacity: number;
}

export function createConfetti(count: number = 50): ConfettiParticle[] {
  const particles: ConfettiParticle[] = [];
  const colors = ['#00d4ff', '#00a8e8', '#22c55e', '#fbbf24', '#f59e0b', '#ef4444'];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
    });
  }

  return particles;
}

export function updateParticle(particle: ConfettiParticle, deltaTime: number = 1): ConfettiParticle {
  return {
    ...particle,
    x: particle.x + particle.vx * deltaTime,
    y: particle.y + particle.vy * deltaTime,
    rotation: particle.rotation + particle.rotationSpeed * deltaTime,
    vy: particle.vy + 0.1 * deltaTime,
    opacity: Math.max(0, particle.opacity - 0.005 * deltaTime),
  };
}

export function renderConfetti(ctx: CanvasRenderingContext2D, particles: ConfettiParticle[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  particles.forEach((particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.opacity;
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    ctx.restore();
  });
}
