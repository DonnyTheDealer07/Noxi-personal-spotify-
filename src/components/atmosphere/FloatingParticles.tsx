// Seeded positions: particles remain stable across React renders and song changes.
const particles = Array.from({ length: 95 }, (_, index) => {
  const noise = (salt: number) => {
    const value = Math.sin((index + 3) * (salt * 74.129)) * 43758.5453;
    return value - Math.floor(value);
  };
  return {
    id: index,
    left: `${noise(1) * 100}%`,
    top: `${noise(2) * 100}%`,
    diameter: `${1.2 + noise(3) * 3.2}px`,
    delay: noise(4) * -8,
    duration: 3.5 + noise(5) * 5,
  };
});

export function FloatingParticles() {
  return <div className="noxi-specks" aria-hidden="true">
    {particles.map(particle => <i
      key={particle.id}
      className="noxi-speck"
      data-duration={particle.duration}
      data-delay={particle.delay}
      style={{ left: particle.left, top: particle.top, width: particle.diameter, height: particle.diameter }}
    />)}
  </div>;
}
