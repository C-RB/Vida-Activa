// Backend weekdays: 1 = Monday … 7 = Sunday.
const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const WEEKDAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// [1, 3, 5] → "Lun · Mié · Vie"
export const formatDays = (days: number[]): string =>
  days.length === 7 ? "Todos los días" : days.map((d) => WEEKDAYS_SHORT[d - 1] ?? "—").join(" · ");

// "10:00:00" → "10:00"
export const shortTime = (time: string): string => time.slice(0, 5);

export const weekdayName = (day: number): string => WEEKDAYS[day - 1] ?? "—";

// "YYYY-MM-DD" → "DD/MM/YYYY", without building a Date to avoid time-zone shifts.
export const formatIsoDate = (iso: string): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};

const WEEKDAYS_SUNDAY_FIRST = [
  "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado",
];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "Sábado 24 de octubre"
export const formatLongDate = (d: Date): string =>
  `${WEEKDAYS_SUNDAY_FIRST[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
