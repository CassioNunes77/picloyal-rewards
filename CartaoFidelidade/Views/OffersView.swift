//
//  OffersView.swift
//  CartaoFidelidade
//
//  Tela de Ofertas Especiais
//

import SwiftUI

struct Offer: Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let discount: String
    let storeName: String
    let storeAddress: String
    let validUntil: String
    let icon: String
    let category: String
    let pointsRequired: Int?
    let isNew: Bool
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Offer, rhs: Offer) -> Bool {
        lhs.id == rhs.id
    }
    
    static func iconForCategory(_ category: String) -> String {
        switch category.lowercased() {
        case "bebidas": return "cup.and.saucer.fill"
        case "comida": return "birthday.cake.fill"
        case "brinde": return "gift.fill"
        default: return "percent"
        }
    }
    
    static func fromFirebase(_ fb: FirebaseOffer, storeName: String, storeAddress: String) -> Offer {
        let df = DateFormatter()
        df.dateFormat = "dd/MM/yyyy"
        return Offer(
            id: fb.id,
            title: fb.title,
            description: fb.description,
            discount: fb.discount ?? "—",
            storeName: storeName,
            storeAddress: storeAddress,
            validUntil: df.string(from: fb.validUntil),
            icon: iconForCategory(fb.category),
            category: fb.category,
            pointsRequired: fb.pointsRequired,
            isNew: false
        )
    }
}

struct OffersView: View {
    @Binding var activeTab: String
    @AppStorage("selectedLocation") private var selectedLocation = ""
    @State private var searchQuery = ""
    @State private var selectedCategory = "all"
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var navigationPath = NavigationPath()
    @State private var offers: [Offer] = []
    @State private var loadingOffers = false
    
    let categories = [
        ("all", "Todas", "tag.fill"),
        ("bebidas", "Bebidas", "cup.and.saucer.fill"),
        ("comida", "Comida", "birthday.cake.fill"),
        ("brinde", "Brindes", "gift.fill"),
        ("geral", "Geral", "percent")
    ]
    
    var filteredOffers: [Offer] {
        let categoryFiltered = selectedCategory == "all" ? offers : offers.filter { $0.category == selectedCategory }
        
        if searchQuery.isEmpty {
            return categoryFiltered
        }
        
        return categoryFiltered.filter { offer in
            offer.title.localizedCaseInsensitiveContains(searchQuery) ||
            offer.description.localizedCaseInsensitiveContains(searchQuery) ||
            offer.storeName.localizedCaseInsensitiveContains(searchQuery)
        }
    }
    
    var body: some View {
        NavigationStack(path: $navigationPath) {
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
                                    Image(systemName: "sparkles")
                                        .foregroundColor(.white)
                                        .font(.system(size: 24))
                                    
                                    Text("Ofertas Especiais")
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
                                
                                TextField("Buscar ofertas...", text: $searchQuery)
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
                        .background(AppGradients.secondary)
                        .ignoresSafeArea(edges: .top)
                    }
                    
                    // Content
                    ScrollView {
                        VStack(spacing: AppSpacing.lg) {
                            // Categories
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: AppSpacing.sm) {
                                    ForEach(categories, id: \.0) { category in
                                        CategoryButton(
                                            id: category.0,
                                            label: category.1,
                                            icon: category.2,
                                            isSelected: selectedCategory == category.0
                                        ) {
                                            selectedCategory = category.0
                                        }
                                    }
                                }
                                .padding(.horizontal, AppSpacing.lg)
                            }
                            .padding(.vertical, AppSpacing.sm)
                            .fadeIn(delay: 0.15)
                            
                            // Offers List
                            if loadingOffers {
                                VStack(spacing: AppSpacing.md) {
                                    ProgressView()
                                        .scaleEffect(1.5)
                                        .padding(.top, AppSpacing.xl * 2)
                                    Text("Carregando ofertas...")
                                        .font(.appBody)
                                        .foregroundColor(.mutedForeground)
                                }
                            } else if selectedLocation.isEmpty {
                                VStack(spacing: AppSpacing.md) {
                                    Image(systemName: "mappin.circle")
                                        .font(.system(size: 48))
                                        .foregroundColor(.mutedForeground)
                                    Text("Selecione uma cidade")
                                        .font(.appBody)
                                        .foregroundColor(.mutedForeground)
                                    Text("Escolha sua localidade na tela inicial para ver as ofertas")
                                        .font(.appCaption)
                                        .foregroundColor(.mutedForeground)
                                        .multilineTextAlignment(.center)
                                }
                                .padding(.top, AppSpacing.xl * 2)
                            } else if filteredOffers.isEmpty {
                                VStack(spacing: AppSpacing.md) {
                                    Image(systemName: "tag")
                                        .font(.system(size: 48))
                                        .foregroundColor(.mutedForeground)
                                    
                                    Text("Nenhuma oferta encontrada")
                                        .font(.appBody)
                                        .foregroundColor(.mutedForeground)
                                    
                                    Text(searchQuery.isEmpty ? "Não há ofertas em \(selectedLocation)" : "Tente buscar com outros termos")
                                        .font(.appCaption)
                                        .foregroundColor(.mutedForeground)
                                }
                                .padding(.top, AppSpacing.xl * 2)
                            } else {
                                ForEach(Array(filteredOffers.enumerated()), id: \.element.id) { index, offer in
                                    Button(action: {
                                        navigationPath.append(offer)
                                    }) {
                                        OfferCard(offer: offer, compact: true, onTap: nil)
                                            .fadeIn(delay: 0.2 + Double(index) * 0.05)
                                    }
                                    .buttonStyle(PlainButtonStyle())
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
            .onAppear { loadOffers() }
            .onChange(of: selectedLocation) { _, _ in loadOffers() }
            .navigationDestination(for: Offer.self) { offer in
                OfferDetailView(
                    offer: offer,
                    storeNameOverride: nil,
                    onUseOffer: {
                        toastMessage = "🎉 Oferta \"\(offer.title)\" ativada!"
                        withAnimation { showToast = true }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                            withAnimation { showToast = false }
                        }
                    },
                    onDismiss: {}
                )
            }
            .ignoresSafeArea(edges: .top)
        }
    }
    
    private func loadOffers() {
        guard !selectedLocation.isEmpty else {
            offers = []
            return
        }
        loadingOffers = true
        Task {
            do {
                let items = try await OffersService.shared.getOffersByCity(cityFilter: selectedLocation)
                await MainActor.run {
                    offers = items.map { Offer.fromFirebase($0.offer, storeName: $0.storeName, storeAddress: $0.storeAddress) }
                    loadingOffers = false
                }
            } catch {
                print("❌ [OffersView] Erro ao carregar ofertas: \(error.localizedDescription)")
                await MainActor.run {
                    offers = []
                    loadingOffers = false
                }
            }
        }
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

struct CategoryButton: View {
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
            .foregroundColor(isSelected ? .secondaryForeground : .cardForeground)
            .padding(.horizontal, AppSpacing.md)
            .padding(.vertical, AppSpacing.sm)
            .background(isSelected ? AppGradients.secondary : LinearGradient(colors: [Color.card], startPoint: .topLeading, endPoint: .bottomTrailing))
            .cornerRadius(AppRadius.lg)
            .appShadow(isSelected ? AppShadow.md : AppShadow.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct OfferCard: View {
    let offer: Offer
    /// Quando true, usa tamanhos de fonte alinhados à tela de Lojas (Detalhes da Loja > Ofertas).
    var compact: Bool = false
    /// Chamado ao tocar no card; quando definido, o card abre detalhes da oferta.
    var onTap: (() -> Void)? = nil
    @State private var isPressed = false
    
    var iconGradient: LinearGradient {
        switch offer.icon {
        case "cup.and.saucer.fill":
            return AppGradients.primary
        case "birthday.cake.fill":
            return LinearGradient(colors: [Color.orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "gift.fill":
            return AppGradients.secondary
        default:
            return LinearGradient(colors: [Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
    
    private var iconSize: CGFloat { compact ? 56 : 64 }
    private var iconFontSize: CGFloat { compact ? 28 : 32 }
    private var titleFont: Font { compact ? .appBody : .appHeadline }
    private var discountFontSize: CGFloat { compact ? 16 : 18 }
    private var padding: CGFloat { compact ? AppSpacing.md : AppSpacing.lg }
    private var cornerRadius: CGFloat { compact ? AppRadius.lg : AppRadius.xl }
    
    var body: some View {
        Group {
            if onTap != nil {
                // Usar Button quando há callback (para compatibilidade com outras telas)
                Button(action: {
                    onTap?()
                }) {
                    cardContent
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
            } else {
                // Sem Button quando usado dentro de NavigationLink
                cardContent
            }
        }
    }
    
    private var cardContent: some View {
        HStack(spacing: AppSpacing.md) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .fill(iconGradient)
                    .frame(width: iconSize, height: iconSize)
                
                Image(systemName: offer.icon)
                    .foregroundColor(.white)
                    .font(.system(size: iconFontSize))
            }
            
            // Content
            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                HStack {
                    Text(offer.title)
                        .font(titleFont)
                        .fontWeight(.semibold)
                        .foregroundColor(.cardForeground)
                        .lineLimit(1)
                    
                    if offer.isNew {
                        Text("NOVO")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.destructiveForeground)
                            .padding(.horizontal, AppSpacing.sm)
                            .padding(.vertical, 2)
                            .background(Color.destructive)
                            .cornerRadius(AppRadius.sm)
                    }
                    
                    Spacer()
                    
                    Text(offer.discount)
                        .font(.system(size: discountFontSize, weight: .bold))
                        .foregroundColor(.secondaryForeground)
                        .padding(.horizontal, compact ? AppSpacing.sm : AppSpacing.md)
                        .padding(.vertical, compact ? AppSpacing.xs : AppSpacing.sm)
                        .background(AppGradients.secondary)
                        .cornerRadius(AppRadius.md)
                }
                
                Text(offer.description)
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
                    .lineLimit(2)
                
                HStack(spacing: AppSpacing.sm) {
                    if !offer.storeName.isEmpty {
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.system(size: 12))
                            Text(offer.storeName)
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                                .lineLimit(1)
                        }
                    }
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 12))
                        Text("Válido até \(offer.validUntil)")
                            .font(.system(size: 12))
                            .foregroundColor(.mutedForeground)
                    }
                }
                
                if let points = offer.pointsRequired {
                    HStack(spacing: 4) {
                        Image(systemName: "sparkles")
                            .font(.system(size: 12))
                        Text("\(points) pontos necessários")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.accentForeground)
                    }
                    .padding(.horizontal, AppSpacing.sm)
                    .padding(.vertical, 4)
                    .background(Color.accent)
                    .cornerRadius(AppRadius.sm)
                }
            }
            
            Image(systemName: "chevron.right")
                .foregroundColor(.mutedForeground)
                .font(.system(size: compact ? 18 : 20))
        }
        .padding(padding)
        .background(Color.card)
        .cornerRadius(cornerRadius)
        .overlay(
            RoundedRectangle(cornerRadius: cornerRadius)
                .stroke(Color.primary.opacity(0.2), lineWidth: 2)
        )
        .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
        .scaleEffect(isPressed ? 0.98 : 1.0)
    }
}

#Preview {
    OffersView(activeTab: .constant("offers"))
}
