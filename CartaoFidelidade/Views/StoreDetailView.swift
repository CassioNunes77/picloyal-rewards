//
//  StoreDetailView.swift
//  CartaoFidelidade
//
//  Tela de Detalhes da Loja
//

import SwiftUI

struct StoreDetailView: View {
    let store: Store
    @Binding var activeTab: String
    @Binding var isPresented: Bool
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedTab = "offers"
    @State private var selectedOffer: Offer?
    @State private var storeOffers: [Offer] = []
    @State private var loadingOffers = false
    
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
                                    isPresented = false
                                }
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
                            
                            Text(store.name)
                                .font(.appTitle)
                                .foregroundColor(.heroForeground)
                                .lineLimit(1)
                            
                            Spacer()
                            
                            Button(action: {
                                showToast(message: "Compartilhando loja...")
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "square.and.arrow.up")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Store Header Info
                        HStack(spacing: AppSpacing.lg) {
                            // Store Image
                            ZStack {
                                RoundedRectangle(cornerRadius: AppRadius.xl)
                                    .fill(AppGradients.primary)
                                    .frame(width: 100, height: 100)
                                
                                if let urlString = store.photoURL, let url = URL(string: urlString) {
                                    AsyncImage(url: url) { phase in
                                        switch phase {
                                        case .success(let image):
                                            image
                                                .resizable()
                                                .scaledToFill()
                                                .frame(width: 100, height: 100)
                                                .clipped()
                                                .cornerRadius(AppRadius.xl)
                                        default:
                                            Image(systemName: "storefront.fill")
                                                .foregroundColor(.primaryForeground)
                                                .font(.system(size: 50))
                                        }
                                    }
                                } else {
                                    Image(systemName: "storefront.fill")
                                        .foregroundColor(.primaryForeground)
                                        .font(.system(size: 50))
                                }
                            }
                            
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                HStack {
                                    if store.isOpen {
                                        HStack(spacing: 4) {
                                            Circle()
                                                .fill(Color.green)
                                                .frame(width: 8, height: 8)
                                            Text("Aberto")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(.heroForeground)
                                        }
                                    } else {
                                        HStack(spacing: 4) {
                                            Circle()
                                                .fill(Color.red)
                                                .frame(width: 8, height: 8)
                                            Text("Fechado")
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(.heroForeground)
                                        }
                                    }
                                }
                                
                                if !store.city.isEmpty {
                                    HStack(spacing: 4) {
                                        Image(systemName: "mappin")
                                            .font(.system(size: 14))
                                        Text(store.city)
                                            .font(.system(size: 14))
                                            .foregroundColor(.heroForegroundMuted)
                                    }
                                }
                                
                                if let hours = store.hours, !hours.isEmpty {
                                    HStack(spacing: 4) {
                                        Image(systemName: "clock")
                                            .font(.system(size: 14))
                                        Text(summarizeBusinessHours(hours))
                                            .font(.system(size: 14))
                                            .foregroundColor(.heroForegroundMuted)
                                            .lineLimit(2)
                                    }
                                }
                            }
                            
                            Spacer()
                        }
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
                        // Tabs
                        HStack(spacing: 0) {
                            TabButton(title: "Ofertas", isSelected: selectedTab == "offers", badge: storeOffers.count > 0 ? "\(storeOffers.count)" : nil) {
                                selectedTab = "offers"
                            }
                            
                            TabButton(title: "Informações", isSelected: selectedTab == "info") {
                                selectedTab = "info"
                            }
                            
                            TabButton(title: "Avaliações", isSelected: selectedTab == "reviews") {
                                selectedTab = "reviews"
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, AppSpacing.lg)
                        .fadeIn(delay: 0.15)
                        
                        // Tab Content
                        if selectedTab == "info" {
                            InfoTab(store: store)
                        } else if selectedTab == "offers" {
                            OffersTab(offers: storeOffers, loading: loadingOffers, showToast: $showToast, toastMessage: $toastMessage, onOfferTap: { selectedOffer = $0 })
                        } else {
                            ReviewsTab(store: store)
                        }
                        
                        Spacer()
                            .frame(height: 100)
                    }
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
                        .foregroundColor(.cardForeground)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .onAppear {
            loadOffers()
        }
        .sheet(item: $selectedOffer) { offer in
            OfferDetailView(
                offer: offer,
                storeNameOverride: store.name,
                onUseOffer: {
                    Task {
                        do {
                            _ = try await RedemptionsService.shared.createRedemption(
                                offerId: offer.id,
                                offerTitle: offer.title,
                                storeId: store.id,
                                storeName: store.name,
                                merchantId: store.merchantId
                            )
                        } catch {
                            print("❌ [StoreDetailView] Erro ao registrar resgate: \(error.localizedDescription)")
                        }
                    }
                    showToast(message: "Oferta solicitada! Aguarde a confirmação do estabelecimento.")
                },
                onDismiss: { selectedOffer = nil }
            )
        }
        .ignoresSafeArea(edges: .top)
    }

    private func loadOffers() {
        loadingOffers = true
        Task {
            do {
                let fbOffers = try await OffersService.shared.getStoreOffers(storeId: store.id)
                let offers = fbOffers
                    .filter { $0.active }
                    .map { Offer.fromFirebase($0, storeId: store.id, storeName: store.name, storeAddress: store.address) }
                await MainActor.run {
                    storeOffers = offers
                    loadingOffers = false
                }
            } catch {
                print("❌ [StoreDetailView] Erro ao carregar ofertas: \(error.localizedDescription)")
                await MainActor.run {
                    storeOffers = []
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

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let badge: String?
    let action: () -> Void
    
    init(title: String, isSelected: Bool, badge: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.isSelected = isSelected
        self.badge = badge
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                HStack(spacing: AppSpacing.sm) {
                    Text(title)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(isSelected ? .primary : .mutedForeground)
                    
                    if let badge = badge {
                        ZStack {
                            Circle()
                                .fill(Color.destructive)
                                .frame(width: 16, height: 16)
                            
                            Text(badge)
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(.white)
                        }
                    }
                }
                
                if isSelected {
                    Rectangle()
                        .fill(Color.primary)
                        .frame(height: 2)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppSpacing.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct InfoTab: View {
    let store: Store
    
    var body: some View {
        VStack(spacing: AppSpacing.lg) {
            // Address
            InfoCard(
                icon: "location.fill",
                title: "Endereço",
                content: store.address,
                color: .primary
            )
            
            // City
            if !store.city.isEmpty {
                InfoCard(
                    icon: "building.2.fill",
                    title: "Cidade",
                    content: store.city,
                    color: .primary
                )
            }
            
            // Phone
            InfoCard(
                icon: "phone.fill",
                title: "Telefone",
                content: store.phone,
                color: .secondary,
                action: {
                    if let url = URL(string: "tel://\(store.phone.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression))") {
                        UIApplication.shared.open(url)
                    }
                }
            )
            
            // Hours
            InfoCard(
                icon: "clock.fill",
                title: "Horário de Funcionamento",
                content: (store.hours.flatMap { !$0.isEmpty ? summarizeBusinessHours($0) : nil } ?? (store.isOpen ? "Aberto" : "Fechado")),
                color: store.isOpen ? Color.green : Color.red
            )
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

struct InfoCard: View {
    let icon: String
    let title: String
    let content: String
    let color: Color
    let action: (() -> Void)?
    
    init(icon: String, title: String, content: String, color: Color, action: (() -> Void)? = nil) {
        self.icon = icon
        self.title = title
        self.content = content
        self.color = color
        self.action = action
    }
    
    var body: some View {
        Button(action: action ?? {}) {
            HStack(spacing: AppSpacing.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.md)
                        .fill(color.opacity(0.1))
                        .frame(width: 48, height: 48)
                    
                    Image(systemName: icon)
                        .foregroundColor(color)
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.mutedForeground)
                        .textCase(.uppercase)
                    
                    Text(content)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                }
                
                Spacer()
                
                if action != nil {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 16))
                }
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .appShadow(AppShadow.sm)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct OffersTab: View {
    let offers: [Offer]
    var loading: Bool = false
    @Binding var showToast: Bool
    @Binding var toastMessage: String
    var onOfferTap: ((Offer) -> Void)?

    var body: some View {
        VStack(spacing: AppSpacing.md) {
            if loading {
                VStack(spacing: AppSpacing.md) {
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Carregando ofertas...")
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                }
                .padding(.top, AppSpacing.xl)
            } else if offers.isEmpty {
                VStack(spacing: AppSpacing.md) {
                    Image(systemName: "tag")
                        .font(.system(size: 40))
                        .foregroundColor(.mutedForeground)

                    Text("Nenhuma oferta disponível")
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                }
                .padding(.top, AppSpacing.xl)
            } else {
                ForEach(Array(offers.enumerated()), id: \.element.id) { index, offer in
                    OfferCard(offer: offer, compact: true, onTap: { onOfferTap?(offer) })
                        .fadeIn(delay: 0.2 + Double(index) * 0.05)
                }
            }
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

struct ReviewsTab: View {
    let store: Store
    
    let reviews = [
        ("João Silva", "Ótimo atendimento e produtos de qualidade!", 5, "Há 2 dias"),
        ("Maria Santos", "Adorei! Voltarei com certeza.", 5, "Há 5 dias"),
        ("Pedro Costa", "Bom, mas poderia melhorar o tempo de espera.", 4, "Há 1 semana")
    ]
    
    var body: some View {
        VStack(spacing: AppSpacing.md) {
            ForEach(Array(reviews.enumerated()), id: \.offset) { index, review in
                ReviewCard(
                    name: review.0,
                    comment: review.1,
                    rating: review.2,
                    date: review.3
                )
                .fadeIn(delay: 0.2 + Double(index) * 0.05)
            }
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

struct ReviewCard: View {
    let name: String
    let comment: String
    let rating: Int
    let date: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack {
                ZStack {
                    Circle()
                        .fill(AppGradients.primary)
                        .frame(width: 40, height: 40)
                    
                    Text(String(name.prefix(1)))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.primaryForeground)
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(name)
                        .font(.appHeadline)
                        .foregroundColor(.cardForeground)
                    
                    HStack(spacing: 2) {
                        ForEach(0..<5) { index in
                            Image(systemName: index < rating ? "star.fill" : "star")
                                .foregroundColor(index < rating ? .yellow : .mutedForeground)
                                .font(.system(size: 12))
                        }
                    }
                }
                
                Spacer()
                
                Text(date)
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
            }
            
            Text(comment)
                .font(.appBody)
                .foregroundColor(.mutedForeground)
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .appShadow(AppShadow.sm)
    }
}

#Preview {
    StoreDetailView(
        store: Store(
            id: "1",
            merchantId: "merchant1",
            name: "Café Central",
            address: "Rua das Flores, 123 - Centro",
            city: "São Paulo - SP",
            distance: "0.8 km",
            rating: 4.8,
            openUntil: "22:00",
            phone: "(11) 3456-7890",
            isOpen: true,
            offers: 5,
            hours: "Segunda a Sexta: 9h às 18h",
            photoURL: nil
        ),
        activeTab: .constant("stores"),
        isPresented: .constant(true)
    )
}
