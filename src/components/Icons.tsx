type IconProps = { size?: number; className?: string };

const Icon = ({ children, size = 20, className = "" }: IconProps & { children: React.ReactNode }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

export const CompassIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/></Icon>;
export const PlayIcon = (p: IconProps) => <Icon {...p}><path d="m8 5 11 7-11 7V5Z"/></Icon>;
export const ArrowIcon = (p: IconProps) => <Icon {...p}><path d="M5 12h14M14 7l5 5-5 5"/></Icon>;
export const GridIcon = (p: IconProps) => <Icon {...p}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></Icon>;
export const TrophyIcon = (p: IconProps) => <Icon {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4"/></Icon>;
export const UserIcon = (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="3"/><path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/></Icon>;
export const XIcon = (p: IconProps) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18"/></Icon>;
export const VolumeIcon = (p: IconProps) => <Icon {...p}><path d="M5 10v4h3l4 3V7l-4 3H5Z"/><path d="M16 9c1.4 1.7 1.4 4.3 0 6M19 6c3 3.5 3 8.5 0 12"/></Icon>;
