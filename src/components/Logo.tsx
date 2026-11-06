export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="brand-logo" aria-label="NOXI music"><span className="logo-mark"><span>N</span><i /></span>{!compact && <span className="logo-word">noxi<span className="logo-dot">.</span></span>}</div>;
}
