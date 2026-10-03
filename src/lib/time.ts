export interface TimeParts { hour: number; minute: number; }

export const parseTime = (value: string | undefined): TimeParts | undefined => {
  if (!value || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) return undefined;
  const [hour, minute] = value.split(':').map(Number);
  return { hour, minute };
};

export const formatTimeParts = (hour: number, minute: number): string =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

export const getCurrentHHmm = (date = new Date()): string => formatTimeParts(date.getHours(), date.getMinutes());

export const calculateMinutesBetween = (start: string, end: string): number | undefined => {
  const from = parseTime(start);
  const to = parseTime(end);
  if (!from || !to) return undefined;
  const startMinutes = from.hour * 60 + from.minute;
  let difference = to.hour * 60 + to.minute - startMinutes;
  if (difference < 0) difference += 24 * 60;
  return difference;
};

export const subtractMinutesFromTime = (time: string, minutes: number): string | undefined => {
  const parsed = parseTime(time);
  if (!parsed || !Number.isFinite(minutes)) return undefined;
  const total = (parsed.hour * 60 + parsed.minute - minutes % (24 * 60) + 24 * 60) % (24 * 60);
  return formatTimeParts(Math.floor(total / 60), total % 60);
};
