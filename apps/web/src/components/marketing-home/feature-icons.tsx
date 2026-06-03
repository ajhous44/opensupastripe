const cls = 'w-full h-full'
const brand = '#2563eb'

export function OpportunityIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill={brand} fillOpacity="0.08" />
      <path d="M12 32 L18 24 L24 28 L30 18 L36 14" stroke={brand} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="36" cy="14" r="3" fill={brand} fillOpacity="0.3" />
      <circle cx="36" cy="14" r="1.5" fill={brand} />
      <line x1="12" y1="36" x2="36" y2="36" stroke={brand} strokeOpacity="0.15" strokeWidth="1.5" />
    </svg>
  )
}

export function LongFormIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill={brand} fillOpacity="0.08" />
      <rect x="12" y="12" width="24" height="24" rx="4" stroke={brand} strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="18" x2="28" y2="18" stroke={brand} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="23" x2="32" y2="23" stroke={brand} strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="28" x2="25" y2="28" stroke={brand} strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="32" x2="30" y2="32" stroke={brand} strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function UgcIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill={brand} fillOpacity="0.08" />
      <rect x="10" y="14" width="12" height="20" rx="3" stroke={brand} strokeOpacity="0.35" strokeWidth="1.5" fill={brand} fillOpacity="0.06" />
      <rect x="18" y="12" width="12" height="24" rx="3" stroke={brand} strokeOpacity="0.55" strokeWidth="1.5" fill={brand} fillOpacity="0.1" />
      <rect x="26" y="14" width="12" height="20" rx="3" stroke={brand} strokeOpacity="0.35" strokeWidth="1.5" fill={brand} fillOpacity="0.06" />
      <path d="M22 22 L27 25 L22 28 Z" fill={brand} />
    </svg>
  )
}

export function AuditIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="48" height="48" rx="12" fill={brand} fillOpacity="0.08" />
      <circle cx="24" cy="24" r="10" stroke={brand} strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
      <path d="M24 14 A10 10 0 0 1 34 24" stroke={brand} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="24" r="2" fill={brand} />
      <line x1="24" y1="24" x2="30" y2="18" stroke={brand} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ConnectStepIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="8" y="20" width="28" height="40" rx="6" stroke={brand} strokeOpacity="0.25" strokeWidth="1.5" fill={brand} fillOpacity="0.04" />
      <text x="22" y="44" textAnchor="middle" fill={brand} fillOpacity="0.6" fontSize="10" fontWeight="600" fontFamily="ui-monospace, monospace">ORG</text>
      <rect x="44" y="20" width="28" height="40" rx="6" stroke={brand} strokeOpacity="0.25" strokeWidth="1.5" fill={brand} fillOpacity="0.04" />
      <text x="58" y="44" textAnchor="middle" fill={brand} fillOpacity="0.6" fontSize="10" fontWeight="600" fontFamily="ui-monospace, monospace">RLS</text>
      <path d="M36 36 L44 36" stroke={brand} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
      <circle cx="40" cy="36" r="2" fill={brand} />
    </svg>
  )
}

export function PrioritizeStepIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="12" y={20 + i * 16} width={56 - i * 12} height="10" rx="3" fill={brand} fillOpacity={0.2 - i * 0.05} stroke={brand} strokeOpacity={0.3 - i * 0.08} strokeWidth="1" />
          <circle cx={20} cy={25 + i * 16} r="2" fill={brand} fillOpacity={0.8 - i * 0.2} />
        </g>
      ))}
      <path d="M16 64 L28 58 L40 62 L52 54 L64 50" stroke={brand} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="64" cy="50" r="2.5" fill={brand} />
    </svg>
  )
}

export function ShipStepIcon({ className = cls }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="12" y="16" width="56" height="48" rx="6" stroke={brand} strokeOpacity="0.2" strokeWidth="1.5" fill={brand} fillOpacity="0.03" />
      <line x1="12" y1="30" x2="68" y2="30" stroke={brand} strokeOpacity="0.12" strokeWidth="1" />
      <rect x="18" y="21" width="8" height="4" rx="1" fill={brand} fillOpacity="0.3" />
      <rect x="29" y="21" width="12" height="4" rx="1" fill={brand} fillOpacity="0.15" />
      <line x1="18" y1="38" x2="52" y2="38" stroke={brand} strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="44" x2="62" y2="44" stroke={brand} strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="50" x2="44" y2="50" stroke={brand} strokeOpacity="0.12" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="44" y="54" width="20" height="6" rx="3" fill={brand} fillOpacity="0.2" />
      <text x="54" y="59" textAnchor="middle" fill={brand} fontSize="5" fontWeight="600" fontFamily="system-ui">SHIP</text>
    </svg>
  )
}
