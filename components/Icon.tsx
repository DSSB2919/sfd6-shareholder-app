'use client';

interface IconProps {
  name: string;
  className?: string;
}

export function Icon({ name, className = 'h-5 w-5' }: IconProps) {
  const paths: Record<string, React.ReactNode> = {
    snow: (
      <>
        <path d="M12 2v20" />
        <path d="M4.93 4.93l14.14 14.14" />
        <path d="M19.07 4.93L4.93 19.07" />
        <path d="M3 12h18" />
        <path d="M8 4l4 4 4-4" />
        <path d="M8 20l4-4 4 4" />
      </>
    ),
    crown: (
      <>
        <path d="M3 8l4 4 5-8 5 8 4-4v11H3V8z" />
        <path d="M3 19h18" />
      </>
    ),
    wallet: (
      <>
        <path d="M3 7a3 3 0 013-3h13v4H6a3 3 0 000 6h15v6H6a3 3 0 01-3-3V7z" />
        <path d="M16 12h5" />
        <path d="M18 12.01v.01" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 2v4" />
        <path d="M17 2v4" />
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M3 10h18" />
      </>
    ),
    wine: (
      <>
        <path d="M8 2h8l-1 8a4 4 0 01-6 0L8 2z" />
        <path d="M12 14v7" />
        <path d="M8 22h8" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0112 0" />
        <path d="M16 11a3 3 0 100-6" />
        <path d="M17 20a5 5 0 00-3-4.6" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13" />
        <path d="M3 12h18" />
        <path d="M7.5 8A2.5 2.5 0 1112 6v2" />
        <path d="M16.5 8A2.5 2.5 0 1012 6v2" />
      </>
    ),
    percent: (
      <>
        <path d="M19 5L5 19" />
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    qr: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3h-3z" />
        <path d="M18 18h3v3h-3z" />
        <path d="M14 21h2" />
        <path d="M21 14v2" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13" />
        <path d="M8 12h13" />
        <path d="M8 18h13" />
        <path d="M3 6h.01" />
        <path d="M3 12h.01" />
        <path d="M3 18h.01" />
      </>
    ),
    chevron: <path d="M9 18l6-6-6-6" />,
    building: (
      <>
        <path d="M4 22V5a2 2 0 012-2h12a2 2 0 012 2v17" />
        <path d="M9 22v-6h6v6" />
        <path d="M8 7h.01" />
        <path d="M12 7h.01" />
        <path d="M16 7h.01" />
        <path d="M8 11h.01" />
        <path d="M12 11h.01" />
        <path d="M16 11h.01" />
      </>
    ),
    star: <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2z" />,
    shield: (
      <>
        <path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-4z" />
        <path d="M8.5 12l2.2 2.2L15.8 9" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V8z" />
        <path d="M13 6v14" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    home: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
    scan: (
      <>
        <path d="M3 7V5a2 2 0 012-2h2" />
        <path d="M17 3h2a2 2 0 012 2v2" />
        <path d="M21 17v2a2 2 0 01-2 2h-2" />
        <path d="M7 21H5a2 2 0 01-2-2v-2" />
        <rect x="8" y="8" width="8" height="8" rx="1" />
      </>
    ),
    history: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    close: (
      <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.snow}
    </svg>
  );
}