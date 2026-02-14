import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DAY_NAMES,
  type DaySchedule,
  formatBusinessHours,
  parseBusinessHours,
  DEFAULT_SCHEDULE,
} from "@/lib/businessHours";

interface BusinessHoursPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function BusinessHoursPicker({
  value,
  onChange,
  disabled = false,
  required = true,
}: BusinessHoursPickerProps) {
  const schedule: DaySchedule[] = (() => {
    const parsed = parseBusinessHours(value);
    if (parsed) return parsed;
    return DEFAULT_SCHEDULE.map((d) => ({ ...d }));
  })();

  const updateSchedule = (updates: Partial<DaySchedule>, dayIndex: number) => {
    const next = schedule.map((s) =>
      s.dayIndex === dayIndex ? { ...s, ...updates } : s
    );
    onChange(formatBusinessHours(next));
  };

  const applyWeekdays = () => {
    const next = schedule.map((s, i) =>
      i < 5 ? { ...s, isOpen: true, openTime: "09:00", closeTime: "18:00" } : s
    );
    onChange(formatBusinessHours(next));
  };

  const applySaturday = () => {
    const next = schedule.map((s, i) =>
      i === 5 ? { ...s, isOpen: true, openTime: "09:00", closeTime: "13:00" } : s
    );
    onChange(formatBusinessHours(next));
  };

  const applySundayClosed = () => {
    const next = schedule.map((s, i) =>
      i === 6 ? { ...s, isOpen: false } : s
    );
    onChange(formatBusinessHours(next));
  };

  const applyAllSame = () => {
    const next = schedule.map((s) => ({
      ...s,
      isOpen: true,
      openTime: "09:00",
      closeTime: "18:00",
    }));
    onChange(formatBusinessHours(next));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-card-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Horário de Funcionamento {required && "*"}
        </Label>
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={applyWeekdays}
            disabled={disabled}
          >
            Dias úteis
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={applySaturday}
            disabled={disabled}
          >
            Sáb 9h-13h
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={applySundayClosed}
            disabled={disabled}
          >
            Dom fechado
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={applyAllSame}
            disabled={disabled}
          >
            Todos 9h-18h
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="divide-y divide-border">
          {schedule.map((entry) => (
            <div
              key={entry.dayIndex}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="w-20 text-sm font-medium text-card-foreground shrink-0">
                {DAY_NAMES[entry.dayIndex]}
              </span>
              <Switch
                checked={entry.isOpen}
                onCheckedChange={(checked) =>
                  updateSchedule({ isOpen: checked }, entry.dayIndex)
                }
                disabled={disabled}
              />
              {entry.isOpen ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Input
                    type="time"
                    value={entry.openTime}
                    onChange={(e) =>
                      updateSchedule({ openTime: e.target.value }, entry.dayIndex)
                    }
                    className="h-9 w-28"
                    disabled={disabled}
                  />
                  <span className="text-muted-foreground text-sm">às</span>
                  <Input
                    type="time"
                    value={entry.closeTime}
                    onChange={(e) =>
                      updateSchedule({ closeTime: e.target.value }, entry.dayIndex)
                    }
                    className="h-9 w-28"
                    disabled={disabled}
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
