//
//  HistoryView.swift
//  CartaoFidelidade
//
//  Tela de Histórico
//

import SwiftUI

struct HistoryItem: Identifiable {
    let id: Int
    let title: String
    let description: String
    let date: String
    let points: Int
    let type: HistoryType
    let storeName: String
    let icon: String
}

enum HistoryType {
    case purchase
    case reward
    case points
    case offer
    
    var color: Color {
        switch self {
        case .purchase:
            return .primary
        case .reward:
            return Color(red: 0.2, green: 0.8, blue: 0.4)
        case .points:
            return .secondary
        case .offer:
            return .accent
        }
    }
}

struct HistoryView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var selectedFilter = "all"
    @State private var showToast = false
    @State private var toastMessage = ""
    
    let historyItems = [
        HistoryItem(
            id: 1,
            title: "Compra realizada",
            description: "Café Central - R$ 45,00",
            date: "Hoje, 14:30",
            points: 45,
            type: .purchase,
            storeName: "Café Central",
            icon: "cup.and.saucer.fill"
        ),
        HistoryItem(
            id: 2,
            title: "Recompensa resgatada",
            description: "1 Café Grátis",
            date: "Ontem, 10:15",
            points: -200,
            type: .reward,
            storeName: "Café Central",
            icon: "gift.fill"
        ),
        HistoryItem(
            id: 3,
            title: "Pontos ganhos",
            description: "Bônus de fidelidade",
            date: "25/01/2025, 18:00",
            points: 50,
            type: .points,
            storeName: "Sistema",
            icon: "sparkles"
        ),
        HistoryItem(
            id: 4,
            title: "Oferta utilizada",
            description: "20% OFF em Bebidas",
            date: "24/01/2025, 15:20",
            points: 0,
            type: .offer,
            storeName: "Café Central",
            icon: "tag.fill"
        ),
        HistoryItem(
            id: 5,
            title: "Compra realizada",
            description: "Restaurante Sabor - R$ 120,00",
            date: "23/01/2025, 19:45",
            points: 120,
            type: .purchase,
            storeName: "Restaurante Sabor",
            icon: "fork.knife"
        ),
        HistoryItem(
            id: 6,
            title: "Pontos ganhos",
            description: "Promoção pontos em dobro",
            date: "22/01/2025, 12:00",
            points: 100,
            type: .points,
            storeName: "Sistema",
            icon: "star.fill"
        ),
        HistoryItem(
            id: 7,
            title: "Compra realizada",
            description: "Supermercado Bom Preço - R$ 85,50",
            date: "21/01/2025, 16:30",
            points: 85,
            type: .purchase,
            storeName: "Supermercado Bom Preço",
            icon: "cart.fill"
        ),
        HistoryItem(
            id: 8,
            title: "Recompensa resgatada",
            description: "10% OFF em qualquer produto",
            date: "20/01/2025, 11:00",
            points: -100,
            type: .reward,
            storeName: "Supermercado Bom Preço",
            icon: "percent"
        )
    ]
    
    let filters = [
        ("all", "Todas", "list.bullet"),
        ("purchase", "Compras", "cart.fill"),
        ("reward", "Recompensas", "gift.fill"),
        ("points", "Pontos", "sparkles"),
        ("offer", "Ofertas", "tag.fill")
    ]
    
    var filteredItems: [HistoryItem] {
        let typeFiltered = selectedFilter == "all" ? historyItems : historyItems.filter { item in
            switch selectedFilter {
            case "purchase":
                return item.type == .purchase
            case "reward":
                return item.type == .reward
            case "points":
                return item.type == .points
            case "offer":
                return item.type == .offer
            default:
                return true
            }
        }
        
        if searchQuery.isEmpty {
            return typeFiltered
        }
        
        return typeFiltered.filter { item in
            item.title.localizedCaseInsensitiveContains(searchQuery) ||
            item.description.localizedCaseInsensitiveContains(searchQuery) ||
            item.storeName.localizedCaseInsensitiveContains(searchQuery)
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
                        // Back button and title
                        HStack {
                            Button(action: {
                                withAnimation {
                                    activeTab = "home"
                                }
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
                                    .foregroundColor(.white)
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
                        
                        // Search Bar
                        HStack {
                            Image(systemName: "magnifyingglass")
                                .foregroundColor(.white.opacity(0.6))
                                .font(.system(size: 20))
                            
                            TextField("Buscar no histórico...", text: $searchQuery)
                                .foregroundColor(.white)
                                .tint(.white)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.white.opacity(0.3), lineWidth: 1)
                        )
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.lg)
                        .fadeIn(delay: 0.1)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(AppGradients.hero)
                    .ignoresSafeArea(edges: .top)
                }
                
                // Content
                ScrollView {
                    VStack(spacing: AppSpacing.lg) {
                        // Filters
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: AppSpacing.sm) {
                                ForEach(filters, id: \.0) { filter in
                                    FilterButton(
                                        id: filter.0,
                                        label: filter.1,
                                        icon: filter.2,
                                        isSelected: selectedFilter == filter.0
                                    ) {
                                        selectedFilter = filter.0
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.lg)
                        }
                        .padding(.vertical, AppSpacing.sm)
                        .fadeIn(delay: 0.15)
                        
                        // History List
                        if filteredItems.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "clock.badge.xmark")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Nenhum registro encontrado")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Tente buscar com outros termos")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(filteredItems.enumerated()), id: \.element.id) { index, item in
                                HistoryCard(item: item)
                                    .fadeIn(delay: 0.2 + Double(index) * 0.05)
                                    .onTapGesture {
                                        showToast(message: "Detalhes: \(item.title)")
                                    }
                            }
                        }
                        
                        Spacer()
                            .frame(height: 100)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                }
                .background(Color.appBackground)
                .cornerRadius(AppRadius.xl, corners: [.topLeft, .topRight])
                .offset(y: -AppRadius.xl)
            }
            
            // Toast
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
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .ignoresSafeArea(edges: .top)
    }
    
    private func showToast(message: String) {
        toastMessage = message
        withAnimation {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showToast = false
            }
        }
    }
}

struct FilterButton: View {
    let id: String
    let label: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: AppSpacing.sm) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                
                Text(label)
                    .font(.system(size: 14, weight: .medium))
            }
            .foregroundColor(isSelected ? .primaryForeground : .cardForeground)
            .padding(.horizontal, AppSpacing.md)
            .padding(.vertical, AppSpacing.sm)
            .background(isSelected ? AppGradients.hero : LinearGradient(colors: [Color.card], startPoint: .topLeading, endPoint: .bottomTrailing))
            .cornerRadius(AppRadius.lg)
            .appShadow(isSelected ? AppShadow.md : AppShadow.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct HistoryCard: View {
    let item: HistoryItem
    @State private var isPressed = false
    
    var iconGradient: LinearGradient {
        switch item.type {
        case .purchase:
            return AppGradients.primary
        case .reward:
            return LinearGradient(colors: [Color(red: 0.2, green: 0.8, blue: 0.4)], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .points:
            return AppGradients.secondary
        case .offer:
            return LinearGradient(colors: [Color.accent], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
    
    var body: some View {
        Button(action: {}) {
            HStack(spacing: AppSpacing.md) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .fill(iconGradient)
                        .frame(width: 64, height: 64)
                    
                    Image(systemName: item.icon)
                        .foregroundColor(.white)
                        .font(.system(size: 32))
                }
                
                // Content
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    Text(item.title)
                        .font(.appHeadline)
                        .foregroundColor(.cardForeground)
                        .lineLimit(1)
                    
                    Text(item.description)
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                        .lineLimit(2)
                    
                    HStack(spacing: AppSpacing.sm) {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.system(size: 12))
                            Text(item.storeName)
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                                .lineLimit(1)
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "clock")
                                .font(.system(size: 12))
                            Text(item.date)
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                    }
                }
                
                Spacer()
                
                // Points
                VStack(alignment: .trailing, spacing: 4) {
                    if item.points != 0 {
                        Text(item.points > 0 ? "+\(item.points)" : "\(item.points)")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(item.points > 0 ? .secondaryForeground : .destructive)
                    }
                    
                    Text("pts")
                        .font(.system(size: 12))
                        .foregroundColor(.mutedForeground)
                }
                .padding(.horizontal, AppSpacing.md)
                .padding(.vertical, AppSpacing.sm)
                .background(item.points > 0 ? AppGradients.secondary.opacity(0.2) : Color.destructive.opacity(0.1))
                .cornerRadius(AppRadius.md)
            }
            .padding(AppSpacing.lg)
            .background(Color.card)
            .cornerRadius(AppRadius.xl)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.xl)
                    .stroke(item.type.color.opacity(0.2), lineWidth: 2)
            )
            .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressed {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    isPressed = false
                }
        )
    }
}

#Preview {
    HistoryView(activeTab: .constant("history"))
}
