import { AppLanguage } from '../types';

const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** "3:45 PM" (en) or "٣:٤٥ م" style wording, kept in Western digits —
 * matches how most Arabic tech UI actually reads day to day. */
export function formatMessageTime(timestamp: number, language: AppLanguage): string {
  const date = new Date(timestamp);
  const hours24 = date.getHours();
  const minutes = pad2(date.getMinutes());
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  if (language === 'ar') {
    return `${hours12}:${minutes} ${isPM ? 'م' : 'ص'}`;
  }
  return `${hours12}:${minutes} ${isPM ? 'PM' : 'AM'}`;
}

/** "Today" / "Yesterday" / "5 Aug" style label for the chat list. */
export function formatChatListDate(
  timestamp: number,
  language: AppLanguage,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) return labels.today;
  if (isSameDay(date, yesterday)) return labels.yesterday;

  const months = language === 'ar' ? MONTHS_AR : MONTHS_EN;
  const day = date.getDate();
  const month = months[date.getMonth()];
  return language === 'ar' ? `${day} ${month}` : `${month} ${day}`;
}

/** Full "day + time" label, used in the favorites list and exports. */
export function formatFullDateTime(timestamp: number, language: AppLanguage): string {
  const date = new Date(timestamp);
  const months = language === 'ar' ? MONTHS_AR : MONTHS_EN;
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const time = formatMessageTime(timestamp, language);
  return language === 'ar' ? `${day} ${month} ${year} — ${time}` : `${month} ${day}, ${year} — ${time}`;
}
