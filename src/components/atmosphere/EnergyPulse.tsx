/**
 * Decorative light energy. GSAP drives the motion in useAtmosphereAnimation.
 * These pulses are independent of audio and don't read or synchronize to Spotify.
 */
export function EnergyPulse() {
  return (
    <div className="noxi-energy-field" aria-hidden="true">
      <span className="noxi-energy-glow noxi-energy-glow--violet" />
      <span className="noxi-energy-glow noxi-energy-glow--rose" />
      <span className="noxi-energy-glow noxi-energy-glow--ice" />
      <span className="noxi-energy-flare noxi-energy-flare--one" />
      <span className="noxi-energy-flare noxi-energy-flare--two" />
    </div>
  );
}
