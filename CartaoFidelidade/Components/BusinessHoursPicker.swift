//
//  BusinessHoursPicker.swift
//  CartaoFidelidade
//
//  Seletor de horário de funcionamento por dia da semana.
//  Modelo consolidado: todos os dias, toggle aberto/fechado, horários.
//

import SwiftUI

// MARK: - Model

struct DaySchedule: Identifiable {
    let id: Int
    var isOpen: Bool
    var openTime: Date
    var closeTime: Date
    
    var dayIndex: Int { id }
}

// MARK: - Helpers

private let DAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

private func timeToDate(_ time: String) -> Date? {
    let parts = time.split(separator: ":")
    guard parts.count >= 2,
          let h = Int(parts[0]), let m = Int(parts[1]),
          h >= 0, h <= 23, m >= 0, m <= 59 else { return nil }
    var comp = DateComponents()
    comp.hour = h
    comp.minute = m
    return Calendar.current.date(from: comp)
}

private func formatTimeDisplay(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm"
    return formatter.string(from: date)
}

private func formatTimeLegible(_ date: Date) -> String {
    let h = Calendar.current.component(.hour, from: date)
    let m = Calendar.current.component(.minute, from: date)
    if m == 0 { return "\(h)h" }
    return "\(h)h\(String(format: "%02d", m))"
}

func formatBusinessHoursString(_ schedule: [DaySchedule]) -> String {
    var lines: [String] = []
    var i = 0
    
    while i < schedule.count {
        let entry = schedule[i]
        let dayName = DAY_NAMES[entry.dayIndex]
        
        if !entry.isOpen {
            lines.append("\(dayName): Fechado")
            i += 1
            continue
        }
        
        let timeStr = "\(formatTimeLegible(entry.openTime)) às \(formatTimeLegible(entry.closeTime))"
        var j = i + 1
        
        while j < schedule.count {
            let next = schedule[j]
            guard next.isOpen,
                  formatTimeDisplay(next.openTime) == formatTimeDisplay(entry.openTime),
                  formatTimeDisplay(next.closeTime) == formatTimeDisplay(entry.closeTime) else { break }
            j += 1
        }
        
        if j == i + 1 {
            lines.append("\(dayName): \(timeStr)")
        } else {
            let startDay = DAY_NAMES[schedule[i].dayIndex]
            let endDay = DAY_NAMES[schedule[j - 1].dayIndex]
            lines.append("\(startDay) a \(endDay): \(timeStr)")
        }
        i = j
    }
    
    return lines.joined(separator: "\n")
}

func parseBusinessHoursString(_ str: String) -> [DaySchedule]? {
    let trimmed = str.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !trimmed.isEmpty else { return nil }
    
    let lines = trimmed.split(separator: "\n").map { String($0).trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
    guard !lines.isEmpty else { return nil }
    
    let dayToIndex: [String: Int] = [
        "segunda": 0, "seg": 0, "terça": 1, "ter": 1, "quarta": 2, "qua": 2,
        "quinta": 3, "qui": 3, "sexta": 4, "sex": 4, "sábado": 5, "sabado": 5, "sáb": 5, "sab": 5,
        "domingo": 6, "dom": 6
    ]
    
    var result = defaultDaySchedules()
    
    for line in lines {
        let lower = line.lowercased()
        if lower.contains("fechado") || lower.contains("closed") {
            if let first = line.split(separator: " ").first {
                let key = String(first).lowercased()
                if let idx = dayToIndex[key] {
                    result[idx] = DaySchedule(id: idx, isOpen: false, openTime: result[idx].openTime, closeTime: result[idx].closeTime)
                }
            }
            continue
        }
        
        let rangePattern = try? NSRegularExpression(pattern: "^(\\w+)\\s+a\\s+(\\w+)\\s*[:：]\\s*(.+)$", options: .caseInsensitive)
        let singlePattern = try? NSRegularExpression(pattern: "^(\\w+)\\s*[:：]\\s*(.+)$", options: .caseInsensitive)
        
        var startIdx: Int? = nil
        var endIdx: Int? = nil
        var timeStr = ""
        
        if let rangePattern = rangePattern, let m = rangePattern.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)) {
            if let r1 = Range(m.range(at: 1), in: line), let r2 = Range(m.range(at: 2), in: line), let r3 = Range(m.range(at: 3), in: line) {
                startIdx = dayToIndex[String(line[r1]).lowercased()]
                endIdx = dayToIndex[String(line[r2]).lowercased()]
                timeStr = String(line[r3])
            }
        } else if let singlePattern = singlePattern, let m = singlePattern.firstMatch(in: line, range: NSRange(line.startIndex..., in: line)) {
            if let r1 = Range(m.range(at: 1), in: line), let r2 = Range(m.range(at: 2), in: line) {
                startIdx = dayToIndex[String(line[r1]).lowercased()]
                endIdx = startIdx
                timeStr = String(line[r2])
            }
        }
        
        guard let s = startIdx, let e = endIdx, !timeStr.isEmpty else { continue }
        
        func parseTime(_ s: String) -> (h: Int, m: Int)? {
            let nums = s.replacingOccurrences(of: "h", with: " ")
                .components(separatedBy: CharacterSet.decimalDigits.inverted)
                .compactMap { Int($0) }
            if nums.isEmpty { return nil }
            let h = nums[0]
            let m = nums.count > 1 ? nums[1] : 0
            guard h >= 0, h <= 23, m >= 0, m <= 59 else { return nil }
            return (h, m)
        }
        var openStr = ""
        var closeStr = ""
        if let r = timeStr.range(of: " às ") {
            openStr = String(timeStr[..<r.lowerBound]).trimmingCharacters(in: .whitespaces)
            closeStr = String(timeStr[r.upperBound...]).trimmingCharacters(in: .whitespaces)
        } else if let r = timeStr.range(of: " a ") {
            openStr = String(timeStr[..<r.lowerBound]).trimmingCharacters(in: .whitespaces)
            closeStr = String(timeStr[r.upperBound...]).trimmingCharacters(in: .whitespaces)
        }
        guard !openStr.isEmpty, !closeStr.isEmpty else { continue }
        guard let ot = parseTime(openStr), let ct = parseTime(closeStr) else { continue }
        let oh = ot.h
        let om = ot.m
        let ch = ct.h
        let cm = ct.m
        
        var openComp = DateComponents()
        openComp.hour = oh
        openComp.minute = om
        var closeComp = DateComponents()
        closeComp.hour = ch
        closeComp.minute = cm
        
        guard let openDate = Calendar.current.date(from: openComp),
              let closeDate = Calendar.current.date(from: closeComp) else { continue }
        
        let lo = min(s, e)
        let hi = max(s, e)
        for idx in lo...hi {
            result[idx] = DaySchedule(id: idx, isOpen: true, openTime: openDate, closeTime: closeDate)
        }
    }
    
    return result
}

func defaultDaySchedules() -> [DaySchedule] {
    let formatter = DateFormatter()
    formatter.dateFormat = "HH:mm"
    let open = formatter.date(from: "09:00")!
    let close = formatter.date(from: "18:00")!
    return (0..<7).map { i in
        DaySchedule(id: i, isOpen: i < 5, openTime: open, closeTime: i == 5 ? formatter.date(from: "13:00")! : close)
    }
}

// MARK: - View

struct BusinessHoursPicker: View {
    @Binding var hours: String
    var disabled: Bool = false
    
    @State private var schedule: [DaySchedule]
    
    init(hours: Binding<String>, disabled: Bool = false) {
        self._hours = hours
        self.disabled = disabled
        let parsed = parseBusinessHoursString(hours.wrappedValue)
        self._schedule = State(initialValue: parsed ?? defaultDaySchedules())
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack {
                HStack(spacing: AppSpacing.sm) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.mutedForeground)
                    Text("Horário de Funcionamento *")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.cardForeground)
                }
                Spacer()
                HStack(spacing: AppSpacing.xs) {
                    shortcutButton("Dias úteis") { applyWeekdays() }
                    shortcutButton("Sáb 9h-13h") { applySaturday() }
                    shortcutButton("Dom fechado") { applySundayClosed() }
                    shortcutButton("Todos 9h-18h") { applyAllSame() }
                }
            }
            
            VStack(spacing: 0) {
                ForEach(Array(schedule.enumerated()), id: \.element.id) { idx, entry in
                    BusinessHoursRow(
                        dayName: DAY_NAMES[entry.dayIndex],
                        isOpen: Binding(
                            get: { schedule[idx].isOpen },
                            set: { val in
                                var s = schedule
                                s[idx].isOpen = val
                                schedule = s
                                hours = formatBusinessHoursString(schedule)
                            }
                        ),
                        openTime: Binding(
                            get: { schedule[idx].openTime },
                            set: { val in
                                var s = schedule
                                s[idx].openTime = val
                                schedule = s
                                hours = formatBusinessHoursString(schedule)
                            }
                        ),
                        closeTime: Binding(
                            get: { schedule[idx].closeTime },
                            set: { val in
                                var s = schedule
                                s[idx].closeTime = val
                                schedule = s
                                hours = formatBusinessHoursString(schedule)
                            }
                        ),
                        disabled: disabled
                    )
                    if idx < 6 {
                        Divider()
                            .background(Color.border)
                            .padding(.leading, AppSpacing.md)
                    }
                }
            }
            .background(Color.appBackground)
            .cornerRadius(AppRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .stroke(Color.border, lineWidth: 1)
            )
        }
        .onAppear { syncFromHours() }
        .onChange(of: hours) { _, newValue in
            syncFromHours()
        }
    }
    
    /// Sincroniza o schedule a partir do binding hours (quando o pai atualiza, ex: onAppear)
    private func syncFromHours() {
        if let parsed = parseBusinessHoursString(hours) {
            schedule = parsed
        }
    }
    
    private func shortcutButton(_ title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 11, weight: .medium))
        }
        .buttonStyle(.bordered)
        .controlSize(.small)
        .disabled(disabled)
    }
    
    private func syncToHours() {
        let formatted = formatBusinessHoursString(schedule)
        if hours != formatted {
            hours = formatted
        }
    }
    
    private func applyWeekdays() {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        let open = formatter.date(from: "09:00")!
        let close = formatter.date(from: "18:00")!
        for i in 0..<5 {
            schedule[i] = DaySchedule(id: i, isOpen: true, openTime: open, closeTime: close)
        }
        syncToHours()
    }
    
    private func applySaturday() {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        schedule[5] = DaySchedule(id: 5, isOpen: true, openTime: formatter.date(from: "09:00")!, closeTime: formatter.date(from: "13:00")!)
        syncToHours()
    }
    
    private func applySundayClosed() {
        schedule[6] = DaySchedule(id: 6, isOpen: false, openTime: schedule[6].openTime, closeTime: schedule[6].closeTime)
        syncToHours()
    }
    
    private func applyAllSame() {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        let open = formatter.date(from: "09:00")!
        let close = formatter.date(from: "18:00")!
        for i in 0..<7 {
            schedule[i] = DaySchedule(id: i, isOpen: true, openTime: open, closeTime: close)
        }
        syncToHours()
    }
}

struct BusinessHoursRow: View {
    let dayName: String
    @Binding var isOpen: Bool
    @Binding var openTime: Date
    @Binding var closeTime: Date
    var disabled: Bool
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            Text(dayName)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.cardForeground)
                .frame(width: 70, alignment: .leading)
            
            Toggle("", isOn: $isOpen)
                .disabled(disabled)
            
            if isOpen {
                DatePicker("", selection: $openTime, displayedComponents: .hourAndMinute)
                    .labelsHidden()
                    .disabled(disabled)
                Text("às")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
                DatePicker("", selection: $closeTime, displayedComponents: .hourAndMinute)
                    .labelsHidden()
                    .disabled(disabled)
            } else {
                Text("Fechado")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
            }
        }
        .padding(AppSpacing.md)
    }
}
