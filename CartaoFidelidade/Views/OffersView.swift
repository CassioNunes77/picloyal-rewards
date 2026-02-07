//
//  OffersView.swift
//  CartaoFidelidade
//
//  Tela de Ofertas Especiais
//

import SwiftUI

struct Offer: Identifiable {
    let id: Int
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
}

struct OffersView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var selectedCategory = "all"
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedOffer: Offer?
    
    let offers = [
        Offer(
            id: 1,
            title: "20% OFF em Bebidas",
            description: "Desconto em todas as bebidas do cardápio",
            discount: "20%",
            storeName: "Café Central",
            storeAddress: "Rua das Flores, 123",
            validUntil: "31/12/2024",
            icon: "cup.and.saucer.fill",
            category: "bebidas",
            pointsRequired: nil,
            isNew: true
        ),
        Offer(
            id: 2,
            title: "Compre 2, Leve 3",
            description: "Na compra de 2 pizzas, ganhe 1 grátis",
            discount: "33%",
            storeName: "Restaurante Sabor",
            storeAddress: "Av. Principal, 456",
            validUntil: "25/12/2024",
            icon: "birthday.cake.fill",
            category: "comida",
            pointsRequired: nil,
            isNew: false
        ),
        Offer(
            id: 3,
            title: "10% OFF em Tudo",
            description: "Desconto em qualquer produto da loja",
            discount: "10%",
            storeName: "Supermercado Bom Preço",
            storeAddress: "Av. Shopping, 321",
            validUntil: "30/12/2024",
            icon: "percent",
            category: "geral",
            pointsRequired: 50,
            isNew: false
        ),
        Offer(
            id: 4,
            title: "Brinde Especial",
            description: "Ganhe um brinde na compra acima de R$ 50",
            discount: "Grátis",
            storeName: "Padaria Doce Vida",
            storeAddress: "Rua Comercial, 789",
            validUntil: "28/12/2024",
            icon: "gift.fill",
            category: "brinde",
            pointsRequired: nil,
            isNew: true
        ),
        Offer(
            id: 5,
            title: "15% OFF em Medicamentos",
            description: "Desconto em toda a farmácia",
            discount: "15%",
            storeName: "Farmácia Saúde",
            storeAddress: "Rua da Saúde, 654",
            validUntil: "29/12/2024",
            icon: "percent",
            category: "saude",
            pointsRequired: nil,
            isNew: false
        ),
        Offer(
            id: 6,
            title: "Café Expresso Grátis",
            description: "Um café expresso grátis com qualquer compra",
            discount: "100%",
            storeName: "Café Central",
            storeAddress: "Rua das Flores, 123",
            validUntil: "27/12/2024",
            icon: "cup.and.saucer.fill",
            category: "bebidas",
            pointsRequired: nil,
            isNew: false
        )
    ]
    
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
                        if filteredOffers.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "tag")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Nenhuma oferta encontrada")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Tente buscar com outros termos")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(filteredOffers.enumerated()), id: \.element.id) { index, offer in
                                OfferCard(offer: offer, compact: true)
                                    .fadeIn(delay: 0.2 + Double(index) * 0.05)
                                    .onTapGesture {
                                        selectedOffer = offer
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
        .sheet(item: $selectedOffer) { offer in
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
                onDismiss: { selectedOffer = nil }
            )
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
        Button(action: {}) {
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
    OffersView(activeTab: .constant("offers"))
}
