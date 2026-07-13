import React from 'react';

export default function TwoDotLogo({
  size = 28,
  color = 'var(--accent)',
  dotColor = 'var(--text)',
  bigSrc,
  smallSrc,
  smallRatio = 0.45,
  bigRatio, // optional fraction of `size` for big circle radius
  bigOffset = 0, // positive moves big circle down, negative moves it up
  separation, // optional extra separation in px (or fraction if 0<separation<1)
  className,
  style,
}) {
  const small = Math.round(size * smallRatio);
  const gap = Math.round(size * 0.12);

  const defaultBigR = Math.max(2, Math.round(size / 2 - gap));
  const bigR = typeof bigRatio === 'number' ? Math.max(2, Math.round(size * bigRatio)) : defaultBigR;
  // big circle center (slightly left of center, a bit lower)
  const bigCx = Math.round(size / 2 - gap);
  const bigCy = Math.round(size / 2 + gap / 2 + (bigR - defaultBigR) - bigOffset);

  const smallR = Math.max(1, Math.round(small / 2));
  // initial small position (top-right)
  let smallCx = size - smallR;
  let smallCy = smallR;

  // ensure circles do not overlap: require center distance >= bigR + smallR + pad
  const pad = Math.max(2, Math.round(size * 0.03));
  const extra = typeof separation === 'number'
    ? (separation > 0 && separation < 1 ? Math.round(size * separation) : Math.round(separation || 0))
    : Math.round(size * 0.04);
  const minDist = bigR + smallR + pad + extra;

  // compute svg height so enlarged big circle is fully visible
  const svgHeight = Math.max(size, bigCy + bigR + pad);

  // start from initial small center
  let vx = smallCx - bigCx;
  let vy = smallCy - bigCy;
  let dist = Math.sqrt(vx * vx + vy * vy) || 0;

  if (dist === 0) {
    // if exactly overlapping horizontally, push to the right by minDist
    vx = minDist;
    vy = 0;
    dist = minDist;
  }

  if (dist < minDist) {
    const scale = minDist / dist;
    let newCx = Math.round(bigCx + vx * scale);
    let newCy = Math.round(bigCy + vy * scale);

    // clamp to svg bounds so the small circle stays visible
    newCx = Math.min(size - smallR, Math.max(smallR, newCx));
    newCy = Math.min(svgHeight - smallR, Math.max(smallR, newCy));

    smallCx = newCx;
    smallCy = newCy;
  }

  const uid = `twoDot_${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      width={size}
      height={svgHeight}
      viewBox={`0 0 ${size} ${svgHeight}`}
      className={className}
      style={{ display: 'block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Two dot logo"
    >
      <defs>
        <clipPath id={`${uid}_big`}> 
          <circle cx={bigCx} cy={bigCy} r={bigR} />
        </clipPath>
        <clipPath id={`${uid}_small`}> 
          <circle cx={smallCx} cy={smallCy} r={smallR} />
        </clipPath>
      </defs>

      {/* big circle: image if provided, otherwise solid color */}
      {bigSrc ? (
        <g clipPath={`url(#${uid}_big)`}>
          <image
            href={bigSrc}
            x={bigCx - bigR}
            y={bigCy - bigR}
            width={bigR * 2}
            height={bigR * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <circle cx={bigCx} cy={bigCy} r={bigR} fill={color} />
      )}

      {/* small circle: image if provided, otherwise dotColor */}
      {smallSrc ? (
        <g clipPath={`url(#${uid}_small)`}>
          <image
            href={smallSrc}
            x={smallCx - smallR}
            y={smallCy - smallR}
            width={smallR * 2}
            height={smallR * 2}
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
      ) : (
        <circle cx={smallCx} cy={smallCy} r={smallR} fill={dotColor} />
      )}
    </svg>
  );
}
