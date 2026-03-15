/**
 * Modelo de horário de funcionamento por dia da semana.
 * Usado em iOS e Web para formulários de cadastro/edição de loja.
 */

export const DAY_NAMES = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
] as const;

export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface DaySchedule {
  dayIndex: DayIndex;
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
}

// Padrão: todos os dias começam fechados, usuário escolhe livremente
export const DEFAULT_SCHEDULE: DaySchedule[] = DAY_NAMES.map((_, i) => ({
  dayIndex: i as DayIndex,
  isOpen: false,
  openTime: "09:00",
  closeTime: "18:00",
}));

/**
 * Converte HH:mm para formato legível "9h" ou "18h"
 */
function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}

/**
 * Serializa o cronograma para string legível (formato usado na API).
 * Ex: "Segunda a Sexta: 9h às 18h\nSábado: 9h às 13h\nDomingo: Fechado"
 */
export function formatBusinessHours(schedule: DaySchedule[]): string {
  const lines: string[] = [];
  let i = 0;

  while (i < schedule.length) {
    const entry = schedule[i];
    const dayName = DAY_NAMES[entry.dayIndex];

    if (!entry.isOpen) {
      lines.push(`${dayName}: Fechado`);
      i++;
      continue;
    }

    const timeStr = `${formatTimeDisplay(entry.openTime)} às ${formatTimeDisplay(entry.closeTime)}`;
    let j = i + 1;

    while (
      j < schedule.length &&
      schedule[j].isOpen &&
      schedule[j].openTime === entry.openTime &&
      schedule[j].closeTime === entry.closeTime
    ) {
      j++;
    }

    if (j === i + 1) {
      lines.push(`${dayName}: ${timeStr}`);
    } else {
      const startDay = DAY_NAMES[schedule[i].dayIndex];
      const endDay = DAY_NAMES[schedule[j - 1].dayIndex];
      lines.push(`${startDay} a ${endDay}: ${timeStr}`);
    }
    i = j;
  }

  return lines.join("\n");
}

/**
 * Tenta parsear string legível para DaySchedule[].
 * Retorna null se não conseguir parsear (usa dados legados).
 */
export function parseBusinessHours(str: string): DaySchedule[] | null {
  if (!str?.trim()) return null;

  const lines = str.split("\n").map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const result: DaySchedule[] = DEFAULT_SCHEDULE.map((d) => ({ ...d }));

  const dayToIndex: Record<string, number> = {
    segunda: 0, seg: 0, terça: 1, ter: 1, quarta: 2, qua: 2,
    quinta: 3, qui: 3, sexta: 4, sex: 4, sábado: 5, sabado: 5, sáb: 5, sab: 5,
    domingo: 6, dom: 6,
  };

  const parseTime = (t: string): string | null => {
    const m = t.match(/(\d{1,2})h?(\d{2})?/i);
    if (!m) return null;
    const h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("fechado") || lower.includes("closed")) {
      const dayMatch = line.match(/^(\w+)/i);
      if (dayMatch) {
        const key = dayMatch[1].toLowerCase();
        const idx = dayToIndex[key];
        if (idx !== undefined) result[idx] = { ...result[idx], isOpen: false };
      }
      continue;
    }

    const rangeMatch = line.match(/^(\w+)\s+a\s+(\w+)\s*[:：]\s*(.+)$/i);
    const singleMatch = line.match(/^(\w+)\s*[:：]\s*(.+)$/i);

    let startIdx: number | null = null;
    let endIdx: number | null = null;
    let timeStr = "";

    if (rangeMatch) {
      const [, start, end, times] = rangeMatch;
      startIdx = dayToIndex[start.toLowerCase()] ?? null;
      endIdx = dayToIndex[end.toLowerCase()] ?? null;
      timeStr = times;
    } else if (singleMatch) {
      const [, day, times] = singleMatch;
      startIdx = endIdx = dayToIndex[day.toLowerCase()] ?? null;
      timeStr = times;
    }

    if (startIdx == null || endIdx == null || !timeStr) continue;

    const timesMatch = timeStr.match(/(\d{1,2}h?\d{0,2})\s*[àa]\s*(\d{1,2}h?\d{0,2})/i);
    if (!timesMatch) continue;

    const openTime = parseTime(timesMatch[1]);
    const closeTime = parseTime(timesMatch[2]);
    if (!openTime || !closeTime) continue;

    for (let idx = Math.min(startIdx, endIdx); idx <= Math.max(startIdx, endIdx); idx++) {
      result[idx] = {
        dayIndex: idx as DayIndex,
        isOpen: true,
        openTime,
        closeTime,
      };
    }
  }

  return result;
}
