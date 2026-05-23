export type IconName =
  | 'dashboard' | 'pos' | 'sales' | 'customers' | 'suppliers'
  | 'package' | 'bookmark' | 'inventory' | 'finance' | 'reports'
  | 'settings' | 'search' | 'bell' | 'plus' | 'minus' | 'pin' | 'pin_filled'
  | 'star' | 'caret' | 'caret_down' | 'chevron_l' | 'chevron_r'
  | 'ellipsis' | 'check' | 'x' | 'edit' | 'trash' | 'download'
  | 'upload' | 'calendar' | 'refresh' | 'trend_up' | 'trend_dn'
  | 'sun' | 'moon' | 'logout' | 'invoices' | 'filter' | 'eye'
  | 'arrow_right' | 'arrow_left' | 'menu'

interface IconProps {
  name: IconName
  size?: number
  stroke?: number
  className?: string
}

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  pos: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 14h.01M11 14h.01M15 14h.01"/></>,
  sales: <><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></>,
  customers: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M16 11a3 3 0 100-6M21 21v-1.5a3.5 3.5 0 00-2.5-3.36"/></>,
  suppliers: <><path d="M3 7h13l3 4h2v6h-3M3 7v10h13V7zm0 10a2 2 0 104 0M16 17a2 2 0 104 0"/></>,
  package: <><path d="M21 8L12 3 3 8m18 0l-9 5m9-5v8l-9 5m-9-13l9 5m-9-5v8l9 5"/></>,
  bookmark: <><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></>,
  inventory: <><path d="M3 10h18M3 14h18M10 3v18M14 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/></>,
  finance: <><circle cx="12" cy="12" r="9"/><path d="M14.5 9a2.5 2.5 0 00-5 0c0 1.5 2.5 2 2.5 2s2.5.5 2.5 2a2.5 2.5 0 01-5 0M12 7v1m0 8v1"/></>,
  reports: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 17v-4M12 17V8M16 17v-7"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  bell: <><path d="M18 16v-5a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2zM9 21a3 3 0 006 0"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  minus: <><path d="M5 12h14"/></>,
  pin: <><path d="M12 17v5M9 10.76V6a3 3 0 016 0v4.76l2 2.62v2.12H7v-2.12l2-2.62z"/></>,
  pin_filled: <><path d="M12 17v5M9 10.76V6a3 3 0 016 0v4.76l2 2.62v2.12H7v-2.12l2-2.62z" fill="currentColor"/></>,
  star: <><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></>,
  caret: <><path d="M9 6l6 6-6 6"/></>,
  caret_down: <><path d="M6 9l6 6 6-6"/></>,
  chevron_l: <><path d="M15 18l-6-6 6-6"/></>,
  chevron_r: <><path d="M9 18l6-6-6-6"/></>,
  ellipsis: <><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></>,
  check: <><path d="M5 12l5 5L20 7"/></>,
  x: <><path d="M18 6L6 18M6 6l12 12"/></>,
  edit: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash: <><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></>,
  download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></>,
  upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
  refresh: <><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></>,
  trend_up: <><path d="M3 17l6-6 4 4 8-8M14 7h7v7"/></>,
  trend_dn: <><path d="M3 7l6 6 4-4 8 8M14 17h7v-7"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M5 5l1.4 1.4M17.6 17.6L19 19M2 12h2M20 12h2M5 19l1.4-1.4M17.6 6.4L19 5"/></>,
  moon: <><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  invoices: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/></>,
  filter: <><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  arrow_right: <><path d="M5 12h14M12 5l7 7-7 7"/></>,
  arrow_left: <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
  menu: <><path d="M3 12h18M3 6h18M3 18h18"/></>,
}

export function Icon({ name, size = 16, stroke = 1.6, className = '' }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
