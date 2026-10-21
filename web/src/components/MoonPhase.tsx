/** Phase names as the Myanmar calendar library reports them (`day.mp.en`). */
export type MoonPhaseName = 'Waxing' | 'Full Moon' | 'Waning' | 'New Moon';

/** Share of the disc that is lit: waxing grows from the right, waning shrinks to the left. */
function litShare(phase: string, day: number): number {
  if (phase === 'Full Moon') return 1;
  if (phase === 'New Moon') return 0;
  const share = Math.min(Math.max(day / 15, 0), 1);
  return phase === 'Waning' ? 1 - share : share;
}

/**
 * The moon as it looks that night (TGI-63). The lit part is the outer half on
 * the lit side plus or minus an ellipse, so a crescent and a gibbous moon are
 * both one path.
 */
export default function MoonPhase({ phase, day, size = 18 }: { phase: string; day: number; size?: number }) {
  const r = 8;
  const share = litShare(phase, day);
  const litRight = phase !== 'Waning';
  // The shadow edge is an ellipse; its x radius shrinks to 0 at half moon.
  const edge = Math.abs(1 - 2 * share) * r;
  const gibbous = share > 0.5;
  // From the top, round the lit side to the bottom, then back up along the shadow edge.
  const outerSweep = litRight ? 1 : 0;
  const edgeSweep = litRight ? (gibbous ? 1 : 0) : gibbous ? 0 : 1;
  const lit =
    share <= 0 ? null : share >= 1 ? (
      <circle cx="10" cy="10" r={r} className="moon-lit" />
    ) : (
      <path
        className="moon-lit"
        d={`M10 ${10 - r} A${r} ${r} 0 0 ${outerSweep} 10 ${10 + r} A${edge} ${r} 0 0 ${edgeSweep} 10 ${10 - r}Z`}
      />
    );

  return (
    <svg
      className={`moon-phase${phase === 'Full Moon' ? ' full' : ''}${phase === 'New Moon' ? ' new' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r={r} className="moon-dark" />
      {lit}
    </svg>
  );
}
