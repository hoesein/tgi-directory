import {
  getMarketDay,
  getMarketDayWithHolidays,
  gregorianToJdn,
  Mycal,
} from 'shan-market-day';

export function getEventsCalendarDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const jdn = gregorianToJdn(year, month, day);
  const myanmarDate = new Mycal(date);
  const marketDay = getMarketDay(jdn);
  const holidays = getMarketDayWithHolidays(jdn).holidays.filter(
    (holiday) => holiday.source.kind === 'official'
  );
  const specialEvents =
    myanmarDate.day.mp.en === 'Full Moon'
      ? ['လပြည့်နေ့']
      : myanmarDate.day.mp.en === 'New Moon'
        ? ['လကွယ်နေ့']
        : [];

  return { myanmarDate, marketDay, holidays, specialEvents };
}

export function getLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Myanmar months a Gregorian month spans, e.g. 'သီတင်းကျွတ် – တန်ဆောင်မုန်း' (0-based month). */
export function myanmarMonthsOf(year: number, month: number): string {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const names: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const name = new Mycal(date).month.my;
    if (!names.includes(name)) names.push(name);
  }
  return names.join(' – ');
}
