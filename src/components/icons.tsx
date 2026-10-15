import {
  Baby,
  Banknote,
  Briefcase,
  CircleHelp,
  Clock,
  Coins,
  GraduationCap,
  House,
  IdCard,
  Landmark,
  Languages,
  Luggage,
  type LucideIcon,
  CalendarDays,
  Info,
  ShieldCheck,
  Stamp,
  Sun,
  Wallet,
  RotateCcw,
} from 'lucide-react'

export const TOPIC_ICONS: Record<string, LucideIcon> = {
  visados: Stamp,
  trabajo: Briefcase,
  vivienda: House,
  dinero: Wallet,
  'vida-cotidiana': Sun,
  preparacion: Luggage,
}

export const CRITERION_ICONS: Record<string, LucideIcon> = {
  age: CalendarDays,
  passport: IdCard,
  funds: Banknote,
  education: GraduationCap,
  english: Languages,
  dependentChildren: Baby,
  previousVisa: RotateCcw,
}

export const FACT_ICONS: Record<string, LucideIcon> = {
  capital: Landmark,
  language: Languages,
  currency: Coins,
  time: Clock,
  other: Info,
}

export const FallbackRequirementIcon = ShieldCheck
export const UnknownIcon = CircleHelp

export function Icon({ icon: I, size = 20 }: { icon: LucideIcon; size?: number }) {
  return <I size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" />
}
