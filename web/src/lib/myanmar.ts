const MYANMAR_DIGITS = '၀၁၂၃၄၅၆၇၈၉';

/** 18 → ၁၈ */
export function toMyanmarDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => MYANMAR_DIGITS[Number(digit)]);
}

/** "Day 5 of 18" in Myanmar: ၁၈ ရက်အနက် ၅ ရက်မြောက်နေ့ */
export function eventDayLabel(dayNumber: number, dayCount: number): string {
  return `${toMyanmarDigits(dayCount)} ရက်အနက် ${toMyanmarDigits(dayNumber)} ရက်မြောက်နေ့`;
}

// Fixed list: browser support for the "my" locale varies (some fall back to English).
const MONTHS = [
  'ဇန်နဝါရီ',
  'ဖေဖော်ဝါရီ',
  'မတ်',
  'ဧပြီ',
  'မေ',
  'ဇွန်',
  'ဇူလိုင်',
  'ဩဂုတ်',
  'စက်တင်ဘာ',
  'အောက်တိုဘာ',
  'နိုဝင်ဘာ',
  'ဒီဇင်ဘာ',
];

/** YYYY-MM-DD → a Myanmar day and month, e.g. ၂၅ အောက်တိုဘာ */
export function formatMyanmarDate(date: string): string {
  const [, month, day] = date.split('-').map(Number);
  return `${toMyanmarDigits(day)} ${MONTHS[month - 1] ?? ''}`.trim();
}
