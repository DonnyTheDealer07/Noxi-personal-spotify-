/** A decorative rhythmic pattern, not an audio-frequency spectrum. */
export function AmbientBars() {
  return (
    <div className="noxi-ambient-bars" aria-hidden="true">
      {Array.from({ length: 39 }, (_, index) => <i key={index} />)}
    </div>
  );
}
