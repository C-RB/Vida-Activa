// Backend day_of_week: 1 = Monday … 7 = Sunday.
const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export const weekdayName = (day: number): string => WEEKDAYS[day - 1] ?? "—";

// "YYYY-MM-DD" → "DD/MM/YYYY", without building a Date to avoid time-zone shifts.
export const formatIsoDate = (iso: string): string => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
};
