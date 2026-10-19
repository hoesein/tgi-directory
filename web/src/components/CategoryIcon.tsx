import {
  AlertTriangle,
  BedDouble,
  Bus,
  HeartPulse,
  Landmark,
  LayoutGrid,
  Mountain,
  ShoppingBag,
  UtensilsCrossed,
} from 'lucide-react';

type IconKind =
  | 'hotel'
  | 'bank'
  | 'food'
  | 'health'
  | 'shop'
  | 'travel'
  | 'visit'
  | 'emergency'
  | 'default';

interface CategoryIconProps {
  id: string;
  icon?: string | null;
  name: string;
  size?: number;
}

function resolveKind({ id, icon, name }: CategoryIconProps): IconKind {
  const hay = `${id} ${icon ?? ''} ${name}`.toLowerCase();
  if (/emergency|warning|alert|siren|ambulance/.test(hay)) return 'emergency';
  if (/places_to_visit|visit|pagoda|temple|lake|cave|waterfall|viewpoint/.test(hay)) return 'visit';
  if (/hotel|guest|bed|lodge|inn|motel/.test(hay)) return 'hotel';
  if (/restaurant|food|cafe|café|bar|bakery|tea|dining|eat|kitchen/.test(hay)) return 'food';
  if (/health|clinic|hospital|medic|medkit|pharma|doctor|care/.test(hay)) return 'health';
  if (/bank|atm|cash|finance/.test(hay)) return 'bank';
  if (/shop|mall|gift|mobile|store|wine|market|retail/.test(hay)) return 'shop';
  if (/travel|tour|transport|agency|bus|trip/.test(hay)) return 'travel';
  return 'default';
}

const ICONS: Record<IconKind, typeof BedDouble> = {
  hotel: BedDouble,
  bank: Landmark,
  food: UtensilsCrossed,
  health: HeartPulse,
  shop: ShoppingBag,
  travel: Bus,
  visit: Mountain,
  emergency: AlertTriangle,
  default: LayoutGrid,
};

export default function CategoryIcon({ size = 28, ...props }: CategoryIconProps) {
  const Icon = ICONS[resolveKind(props)];
  return <Icon size={size} aria-hidden="true" />;
}
