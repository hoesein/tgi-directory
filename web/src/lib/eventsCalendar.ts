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
