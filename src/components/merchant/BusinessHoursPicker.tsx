import { useState, useCallback } from "react";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DAY_NAMES,
  type DaySchedule,
  type DayIndex,
  formatBusinessHours,
  parseBusinessHours,
} from "@/lib/businessHours";

interface BusinessHoursPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

const createDefaultSchedule = (): DaySchedule[] => 
  DAY_NAMES.map((_, i) => ({
    dayIndex: i as DayIndex,
    isOpen: false,
    openTime: "09:00",
    closeTime: "18:00",
  }));

export default function BusinessHoursPicker({
  value,
  onChange,
  disabled = false,
  required = true,
}: BusinessHoursPickerProps) {
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const parsed = parseBusinessHours(value);
    return parsed || createDefaultSchedule();
  });

  const handleToggleDay = useCallback((dayIndex: number, isOpen: boolean) => {
    setSchedule(prev => {
      const next = prev.map((s) =>
        s.dayIndex === dayIndex ? { ...s, isOpen } : s
      );
      onChange(formatBusinessHours(next));
      return next;
    });
  }, [onChange]);

  const handleTimeChange = useCallback((dayIndex: number, field: 'openTime' | 'closeTime', value: string) => {
    setSchedule(prev => {
      const next = prev.map((s) =>
        s.dayIndex === dayIndex ? { ...s, [field]: value } : s
      );
      onChange(formatBusinessHours(next));
      return next;
    });
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-card-foreground flex items-center gap-1.5 text-xs">
        <Clock className="h-3.5 w-3.5" />
        Horário de Funcionamento {required && "*"}
      </Label>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="divide-y divide-border">
          {schedule.map((entry) => (
            <div
              key={entry.dayIndex}
              className="flex items-center gap-2 px-3 py-2"
            >
              <span className="w-14 text-xs font-medium text-card-foreground shrink-0">
                {DAY_NAMES[entry.dayIndex]}
              </span>
              <Switch
                checked={entry.isOpen}
                onCheckedChange={(checked) => handleToggleDay(entry.dayIndex, checked)}
                disabled={disabled}
              />
              {entry.isOpen ? (
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Input
                    type="time"
                    value={entry.openTime}
                    onChange={(e) => handleTimeChange(entry.dayIndex, 'openTime', e.target.value)}
                    className="h-8 w-24 text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                    disabled={disabled}
                  />
                  <span className="text-muted-foreground text-xs">às</span>
                  <Input
                    type="time"
                    value={entry.closeTime}
                    onChange={(e) => handleTimeChange(entry.dayIndex, 'closeTime', e.target.value)}
                    className="h-8 w-24 text-xs [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
                    disabled={disabled}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
