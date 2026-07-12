'use client';

// ---------------------------------------------------------------------------
// Shared glyph dictionary. Every mechanic option/item across all themes
// references one of these by name — one SVG vocabulary, skinned by CSS color.
// ---------------------------------------------------------------------------

const P: Record<string, JSX.Element> = {
  trident: (
    <>
      <path d="M12 21V6" />
      <path d="M12 6c0-2 1.5-3.5 3-4-.5 2 .5 4-3 4z" />
      <path d="M6 4c0 4 2 7 6 7s6-3 6-7" />
      <path d="M9 21h6" />
    </>
  ),
  wave: (
    <>
      <path d="M2 12c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3" />
      <path d="M2 17c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3" />
    </>
  ),
  spiral: (
    <path d="M12 12a1.5 1.5 0 0 1 3 0 3 3 0 0 1-6 0 4.5 4.5 0 0 1 9 0 6 6 0 0 1-12 0 7.5 7.5 0 0 1 15 0" />
  ),
  star: (
    <path d="M12 2l2.2 6.4L21 9.2l-5 4.4 1.5 6.6L12 16.8 6.5 20.2 8 13.6 3 9.2l6.8-.8L12 2z" />
  ),
  eye: (
    <>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  column: <path d="M5 4h14M5 20h14M8 4v16M12 4v16M16 4v16" />,
  pearl: (
    <>
      <circle cx="12" cy="13" r="5" />
      <path d="M4 13a8 8 0 0 1 16 0" />
      <path d="M10 11.5a2.5 2.5 0 0 1 2-1" />
    </>
  ),
  coral: (
    <path d="M12 21v-8M12 13c0-3-2-4-2-7M12 13c0-3 2-4 2-7M10 6c0-1.5-1-2-1-3.5M14 6c0-1.5 1-2 1-3.5M8 21h8" />
  ),
  plant: (
    <path d="M12 21v-9M12 12C8 12 6 9 6 5c4 0 6 3 6 7zM12 12c4 0 6-3 6-7-4 0-6 3-6 7z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z" />,
  bolt: <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9z" />,
  skull: (
    <>
      <path d="M12 3a7 7 0 0 0-7 7c0 3 1.5 4.5 3 5.5V19h8v-3.5c1.5-1 3-2.5 3-5.5a7 7 0 0 0-7-7z" />
      <circle cx="9.5" cy="10.5" r="1.4" />
      <circle cx="14.5" cy="10.5" r="1.4" />
      <path d="M10.5 19v2M13.5 19v2" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2V21M12 21c-4 0-7-3-8-6l2.5 1M12 21c4 0 7-3 8-6l-2.5 1M8 10h8" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11l4.5-2.5z" />
    </>
  ),
  map: (
    <>
      <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  knot: (
    <path d="M7 7c3 0 7 2 7 5s-3 5-6 5M17 7c-3 0-7 2-7 5s3 5 6 5M7 7c-2 0-3 1.5-3 3M17 7c2 0 3 1.5 3 3" />
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l9 9M17 17l2-2M14 14l2-2" />
    </>
  ),
  flask: (
    <path d="M10 3h4M11 3v6l-5.5 9A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.7-3L13 9V3M8 15h8" />
  ),
  vial: (
    <>
      <path d="M9 3h6M10 3v14a2 2 0 0 0 4 0V3" />
      <path d="M10 12h4" />
    </>
  ),
  biohazard: (
    <>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 9.4V4M9.8 13.3l-4.6 2.8M14.2 13.3l4.6 2.8" />
      <circle cx="12" cy="5.5" r="1.2" />
      <circle cx="6.5" cy="15.3" r="1.2" />
      <circle cx="17.5" cy="15.3" r="1.2" />
    </>
  ),
  snowflake: (
    <path d="M12 2v20M4 7l16 10M20 7L4 17M12 5l-2-2M12 5l2-2M12 19l-2 2M12 19l2 2" />
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2.2 2.2M17.3 17.3l2.2 2.2M19.5 4.5l-2.2 2.2M6.7 17.3l-2.2 2.2" />
    </>
  ),
  crown: (
    <path d="M3 18h18M4 18l-1-9 5 3.5L12 5l4 7.5L21 9l-1 9" />
  ),
  shield: (
    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
  ),
  banner: <path d="M6 3v18M6 4h12l-3 4 3 4H6" />,
  bell: (
    <>
      <path d="M6 17h12a1 1 0 0 0 .8-1.6C17.5 13.8 17 12.5 17 10a5 5 0 0 0-10 0c0 2.5-.5 3.8-1.8 5.4A1 1 0 0 0 6 17z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  teacup: (
    <>
      <path d="M4 9h13v5a5 5 0 0 1-5 5h-3a5 5 0 0 1-5-5V9z" />
      <path d="M17 10h2a2.5 2.5 0 0 1 0 5h-2M6 5c0-1 1-1 1-2M10 5c0-1 1-1 1-2M14 5c0-1 1-1 1-2" />
    </>
  ),
  cake: (
    <>
      <path d="M4 20h16M5 20v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6" />
      <path d="M5 15c2 1.5 4-1.5 6 0s4-1.5 6 0M12 11V8" />
      <path d="M12 8a1.5 1.5 0 0 0 1-2.5L12 4l-1 1.5A1.5 1.5 0 0 0 12 8z" />
    </>
  ),
  bottle: (
    <path d="M10 2h4M10.5 2v4L8 10v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V10l-2.5-4V2M8 14h8" />
  ),
  mirror: (
    <>
      <ellipse cx="12" cy="10" rx="6" ry="8" />
      <path d="M12 18v4M9 22h6M9.5 7c.5-1.5 2-2.5 3-2.5" />
    </>
  ),
  rose: (
    <>
      <path d="M12 22v-8M12 14c-3 0-5-2-5-5 2 0 3 .5 4 1.5C11 8 11 6 12 4c1 2 1 4 1 6.5 1-1 2-1.5 4-1.5 0 3-2 5-5 5z" />
      <path d="M9 18c-2 0-3.5-1-4-2.5 2-.5 3.5 0 4 1M15 18c2 0 3.5-1 4-2.5-2-.5-3.5 0-4 1" />
    </>
  ),
  flamingo: (
    <path d="M9 21c4 0 6-2.5 6-6V9a3 3 0 0 0-6 0c0 2 1.5 3 3 3M15 9c0-3-1-5-4-5-1.5 0-2 1-2 2M9 21v-3M12 21v-3" />
  ),
  rocket: (
    <>
      <path d="M12 2c3 2 4.5 6 4.5 9.5L14 14h-4l-2.5-2.5C7.5 8 9 4 12 2z" />
      <circle cx="12" cy="8" r="1.6" />
      <path d="M9.5 14 7 19l3-1.5M14.5 14 17 19l-3-1.5M12 15v5" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.6" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-60 12 12)" />
    </>
  ),
  satellite: (
    <>
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M2 9l5 0M2 12h5M2 15h5M17 9h5M17 12h5M17 15h5" />
      <path d="M12 15v4M9 21h6" />
    </>
  ),
  badge: (
    <>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <circle cx="12" cy="10" r="2.2" />
      <path d="M8.5 17c.5-2 2-3 3.5-3s3 1 3.5 3" />
    </>
  ),
  chart: (
    <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8M20 16V6" />
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="1.5" />
      <rect x="4" y="14" width="16" height="6" rx="1.5" />
      <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v3" />
    </>
  ),
  flame: (
    <path d="M12 22c4 0 7-2.5 7-7 0-3-2-5.5-4-8-.5 2-1.5 3-3 3.5C12.5 8 12 5 9 2c.5 4-4 6-4 12 0 5 3.5 8 7 8z" />
  ),
  wheel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" />
    </>
  ),
  fuse: (
    <path d="M3 18c3 0 3-4 6-4s3 4 6 4 3-6 6-6M18 9l3-6M18 9l-2-1M18 9l1 2" />
  ),
  note: (
    <>
      <path d="M9 18V6l10-2v11" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="16.5" cy="15" r="2.5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M9.5 9.5c0-1 1-1.7 2.5-1.7s2.5.7 2.5 1.7-1 1.5-2.5 2-2.5 1-2.5 2 1 1.7 2.5 1.7 2.5-.7 2.5-1.7" />
    </>
  ),
  hourglass: (
    <path d="M6 2h12M6 22h12M7 2c0 5 4 6 4 10s-4 5-4 10M17 2c0 5-4 6-4 10s4 5 4 10" />
  ),
  feather: (
    <path d="M20 4c-6 0-12 5-13 12l-3 4M7 16c5 1 10-2 12-8M9 12h6M11 8h6" />
  ),
  book: (
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zM4 19a2 2 0 0 1 2-2h13M8 7h7" />
  ),
};

export function Glyph({
  name,
  className = 'h-8 w-8',
}: {
  name: string;
  className?: string;
}) {
  const body = P[name];
  if (!body)
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <circle cx="12" cy="12" r="8" />
      </svg>
    );
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {body}
    </svg>
  );
}
