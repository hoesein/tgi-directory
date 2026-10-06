import { BedDouble, Landmark, UtensilsCrossed, HeartPulse, ShoppingBag, Bus, AlertTriangle, LayoutGrid } from 'lucide-react';

type IconKind =
  | 'hotel'
  | 'bank'
  | 'food'
  | 'health'
  | 'shop'
  | 'travel'
  | 'emergency'
  | 'default';

interface CategoryIconProps {
  id: string;
  icon?: string | null;
  name: string;
}

function resolveKind({ id, icon, name }: CategoryIconProps): IconKind {
  const hay = `${id} ${icon ?? ''} ${name}`.toLowerCase();
  if (/emergency|warning|alert|siren|ambulance/.test(hay)) return 'emergency';
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
  emergency: AlertTriangle,
  default: LayoutGrid,
};

export default function CategoryIcon(props: CategoryIconProps) {
  const kind = resolveKind(props);
  const Icon = ICONS[kind];
  return <Icon size={28} />;
}
