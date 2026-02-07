//
//  HistoryView.swift
//  CartaoFidelidade
//
//  Tela Histórico / Atividades (exibida ao tocar em Atividades na Home).
//

import SwiftUI

struct HistoryItem: Identifiable {
    let id: Int
    let title: String
    let description: String
    let date: String
    let points: Int
    let type: String // purchase, reward, points, offer
    let storeName: String
    let icon: String
}

struct HistoryView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var selectedFilter = "all"
    @State private var showToast = false
    @State private var toastMessage = ""

    let historyItems: [HistoryItem] = [
        HistoryItem(id: 1, title: "Compra realizada", description: "Café Central - R$ 45,00", date: "Hoje, 14:30", points: 45, type: "purchase", storeName: "Café Central", icon: "cup.and.saucer.fill"),
        HistoryItem(id: 2, title: "Recompensa resgatada", description: "1 Café Grátis", date: "Ontem, 10:15", points: -200, type: "reward", storeName: "Café Central", icon: "gift.fill"),
        HistoryItem(id: 3, title: "Pontos ganhos", description: "Bônus de fidelidade", date: "25/01/2025, 18:00", points: 50, type: "points", storeName: "Sistema", icon: "sparkles"),
        HistoryItem(id: 4, title: "Oferta utilizada", description: "20% OFF em Bebidas", date: "24/01/2025, 15:20", points: 0, type: "offer", storeName: "Café Central", icon: "tag.fill"),
        HistoryItem(id: 5, title: "Compra realizada", description: "Restaurante Sabor - R$ 120,00", date: "23/01/2025, 19:45", points: 120, type: "purchase", storeName: "Restaurante Sabor", icon: "fork.knife"),
    ]

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
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 40, height: 40)
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.white)
                                        .font(.system(size: 20))
                                }
                            }
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 24))
                                Text("Histórico")
                                    .font(.appTitle)
                                    .foregroundColor(.white)
                            }
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)

                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.white.opacity(0.6))
                            TextField("Buscar no histórico...", text: $searchQuery)
                                .foregroundColor(.white)
                                .tint(.white)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.white.opacity(0.2))
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
                    if filteredItems.isEmpty {
                        VStack(spacing: AppSpacing.md) {
                            Image(systemName: "clock")
                                .font(.system(size: 48))
                                .foregroundColor(.mutedForeground)
                            Text("Nenhum registro encontrado")
                                .font(.appBody)
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
                        .foregroundColor(.white)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.appForeground.opacity(0.9))
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .ignoresSafeArea(edges: .top)
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
