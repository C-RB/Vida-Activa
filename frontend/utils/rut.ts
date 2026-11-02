// Formats a Chilean RUT while typing (12.345.678-9). It keeps at most 9 characters (8 digits plus the check
// digit): a longer formatted value would be cut by the input's maxLength mid-format and desync the native
// and controlled values (repeated or phantom digits).
export const formatRut = (value: string): string => {
  const clean = value.replace(/[^0-9kK]/g, "").toUpperCase().slice(0, 9);
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${body}-${clean.slice(-1)}`;
};
