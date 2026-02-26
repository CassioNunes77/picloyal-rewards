//
//  HistoryView.swift
//  CartaoFidelidade
//
//  Tela Histórico / Atividades (exibida ao tocar em Atividades na Home).
//

import SwiftUI
import FirebaseAuth

struct HistoryItem: Identifiable {
    let id: String
    let title: String
    let description: String
    let date: String
    let points: Int
    let type: String
    let storeName: String
    let icon: String
}

private func formatActivityDate(_ date: Date) -> String {
    let now = Date()
    let diff = now.timeIntervalSince(date)
    let mins = Int(diff / 60)
    let hours = Int(diff / 3600)
    let days = Int(diff / 86400)
    let cal = Calendar.current
    if mins < 1 { return "Agora" }
    if mins < 60 { return "\(mins) min atrás" }
    if hours < 24, cal.isDateInToday(date) {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return "Hoje, \(formatter.string(from: date))"
    }
    if days == 1 {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return "Ontem, \(formatter.string(from: date))"
    }
    if days < 7 { return "\(days) dias atrás" }
    let formatter = DateFormatter()
    formatter.dateFormat = "dd/MM/yyyy, HH:mm"
    formatter.locale = Locale(identifier: "pt_BR")
    return formatter.string(from: date)
}

private func activityToHistoryItem(_ a: UserActivity) -> HistoryItem {
    let icon: String = (a.type == "offer") ? "tag.fill" : (a.type == "reward") ? "gift.fill" : "sparkles"
    return HistoryItem(
        id: a.id,
        title: a.title,
        description: a.description,
        date: formatActivityDate(a.createdAt),
        points: a.points ?? 0,
        type: a.type,
        storeName: a.storeName,
        icon: icon
    )
}

private func redemptionToHistoryItem(_ r: FirebaseRedemption) -> HistoryItem {
    let title = r.status == .confirmed ? "Oferta utilizada" : "Oferta solicitada"
    return HistoryItem(
        id: r.id,
        title: title,
        description: r.offerTitle,
        date: formatActivityDate(r.createdAt),
        points: 0,
        type: "offer",
        storeName: r.storeName,
        icon: "tag.fill"
    )
}

struct HistoryView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var selectedFilter = "all"
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var historyItems: [HistoryItem] = []
    @State private var loading = true

    var filteredItems: [HistoryItem] {
        historyItems.filter { item in
            let matchesSearch = searchQuery.isEmpty ||
                item.title.localizedCaseInsensitiveContains(searchQuery) ||
                item.description.localizedCaseInsensitiveContains(searchQuery) ||
                item.storeName.localizedCaseInsensitiveContains(searchQuery)
            let matchesFilter = selectedFilter == "all" || item.type == selectedFilter
            return matchesSearch && matchesFilter
        }
    }

    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                ZStack(alignment: .top) {
                    VStack(spacing: 0) {
                        HStack {
                            Button(action: {
                                withAnimation { activeTab = "home" }
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.heroForeground)
                                Text("Atividades")
                                    .font(.appTitle)
                                    .foregroundColor(.heroForeground)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)

                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.heroForegroundSubtle)
                            TextField("Buscar nas atividades...", text: $searchQuery)
                                .foregroundColor(.heroForeground)
                                .tint(.heroForeground)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.heroOverlay)
                        .cornerRadius(AppRadius.lg)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.lg)
                    }
                    .background(AppGradients.hero)
                    .ignoresSafeArea(edges: .top)
                }

                // Filters
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.sm) {
                        FilterChip(title: "Todas", isSelected: selectedFilter == "all") { selectedFilter = "all" }
                        FilterChip(title: "Compras", isSelected: selectedFilter == "purchase") { selectedFilter = "purchase" }
                        FilterChip(title: "Recompensas", isSelected: selectedFilter == "reward") { selectedFilter = "reward" }
                        FilterChip(title: "Pontos", isSelected: selectedFilter == "points") { selectedFilter = "points" }
                        FilterChip(title: "Ofertas", isSelected: selectedFilter == "offer") { selectedFilter = "offer" }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.vertical, AppSpacing.sm)
                }
                .background(Color.appBackground)
                .padding(.top, AppSpacing.sm)

                // List
                ScrollView {
                    if loading {
                        VStack(spacing: AppSpacing.md) {
                            ProgressView()
                                .scaleEffect(1.2)
                                .tint(.primary)
                            Text("Carregando atividades...")
                                .font(.appBody)
                                .foregroundColor(.mutedForeground)
                        }
                        .padding(.top, AppSpacing.xl * 2)
                    } else if filteredItems.isEmpty {
                        VStack(spacing: AppSpacing.md) {
                            Image(systemName: "clock")
                                .font(.system(size: 48))
                                .foregroundColor(.mutedForeground)
                            Text("Nenhum registro encontrado")
                                .font(.appBody)
                                .foregroundColor(.mutedForeground)
                            Text("Suas ofertas utilizadas aparecerão aqui")
                                .font(.appCaption)
                                .foregroundColor(.mutedForeground)
                        }
                        .padding(.top, AppSpacing.xl * 2)
                    } else {
                        LazyVStack(spacing: AppSpacing.sm) {
                            ForEach(filteredItems) { item in
                                HistoryRow(item: item)
                                    .onTapGesture {
                                        toastMessage = item.title
                                        withAnimation { showToast = true }
                                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                                            withAnimation { showToast = false }
                                        }
                                    }
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, AppSpacing.md)
                        .padding(.bottom, 100)
                    }
                }
                .background(Color.appBackground)
            }

            if showToast {
                VStack {
                    Spacer()
                    Text(toastMessage)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .ignoresSafeArea(edges: .top)
        .onAppear { loadActivities() }
    }

    private func loadActivities() {
        guard let userId = Auth.auth().currentUser?.uid else {
            historyItems = []
            loading = false
            return
        }
        loading = true
        Task {
            do {
                async let activitiesTask = UserActivitiesService.shared.getUserActivities(userId: userId)
                async let redemptionsTask = RedemptionsService.shared.getUserRedemptions(userId: userId)
                let (activities, redemptions) = try await (activitiesTask, redemptionsTask)

                let activityIds = Set(activities.compactMap { $0.redemptionId })
                let fromActivities = activities.map { (date: $0.createdAt, item: activityToHistoryItem($0)) }
                let fromRedemptions = redemptions
                    .filter { !activityIds.contains($0.id) }
                    .map { (date: $0.createdAt, item: redemptionToHistoryItem($0)) }
                let merged = (fromActivities + fromRedemptions)
                    .sorted { $0.date > $1.date }
                    .map { $0.item }

                await MainActor.run {
                    historyItems = merged
                    loading = false
                }
            } catch {
                await MainActor.run {
                    historyItems = []
                    loading = false
                }
            }
        }
    }
}

private struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(isSelected ? .primaryForeground : .cardForeground)
                .padding(.horizontal, AppSpacing.md)
                .padding(.vertical, AppSpacing.sm)
                .background(isSelected ? AppGradients.hero : LinearGradient(colors: [Color.card], startPoint: .topLeading, endPoint: .bottomTrailing))
                .cornerRadius(AppRadius.lg)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

private struct HistoryRow: View {
    let item: HistoryItem

    private var iconColor: Color {
        switch item.type {
        case "purchase": return .primary
        case "reward": return .green
        case "points": return .secondary
        case "offer": return .blue
        default: return .gray
        }
    }

    var body: some View {
        HStack(spacing: AppSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .fill(iconColor.opacity(0.2))
                    .frame(width: 56, height: 56)
                Image(systemName: item.icon)
                    .foregroundColor(iconColor)
                    .font(.system(size: 24))
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(item.title)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.cardForeground)
                Text(item.description)
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
                HStack(spacing: AppSpacing.sm) {
                    Label(item.storeName, systemImage: "mappin")
                    Label(item.date, systemImage: "clock")
                }
                .font(.system(size: 11))
                .foregroundColor(.mutedForeground)
            }
            Spacer()
            if item.points != 0 {
                VStack(alignment: .trailing, spacing: 0) {
                    Text(item.points > 0 ? "+\(item.points)" : "\(item.points)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(item.points > 0 ? .secondary : .destructive)
                    Text("pts")
                        .font(.system(size: 10))
                        .foregroundColor(.mutedForeground)
                }
            }
            Image(systemName: "chevron.right")
                .foregroundColor(.mutedForeground)
                .font(.system(size: 16))
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.xl)
        .appShadow(AppShadow.md)
    }
}

#Preview {
    HistoryView(activeTab: .constant("history"))
}
