//
//  StoresView.swift
//  CartaoFidelidade
//
//  Tela de Lojas Parceiras
//

import SwiftUI

struct Store: Identifiable, Equatable {
    let id: String
    let merchantId: String
    let name: String
    let address: String
    let city: String
    let distance: String
    let rating: Double
    let openUntil: String
    let phone: String
    let isOpen: Bool
    let offers: Int
    let hours: String?
    let photoURL: String?
    
    static func == (lhs: Store, rhs: Store) -> Bool {
        lhs.id == rhs.id
    }
    
    static func fromFirebase(_ fb: FirebaseStore) -> Store {
        Store(
            id: fb.id,
            merchantId: fb.merchantId,
            name: fb.name,
            address: fb.address,
            city: fb.city,
            distance: "-",
            rating: 0,
            openUntil: "-",
            phone: fb.phone,
            isOpen: fb.active,
            offers: 0,
            hours: fb.hours,
            photoURL: fb.photoURL
        )
    }
}

struct StoresView: View {
    @Binding var activeTab: String
    @AppStorage("selectedLocation") private var selectedLocation = ""
    @State private var searchQuery = ""
    @State private var showFilters = false
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedStore: Store? = nil
    @State private var stores: [Store] = []
    @State private var loadingStores = false
    
    var filteredStores: [Store] {
        if searchQuery.isEmpty {
            return stores
        }
        return stores.filter { store in
            store.name.localizedCaseInsensitiveContains(searchQuery) ||
            store.address.localizedCaseInsensitiveContains(searchQuery)
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
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            Text("Lojas Parceiras")
                                .font(.appTitle)
                                .foregroundColor(.heroForeground)
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Search Bar
                        HStack(spacing: AppSpacing.sm) {
                            HStack {
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(.heroForegroundSubtle)
                                    .font(.system(size: 20))
                                
                                TextField("Buscar lojas...", text: $searchQuery)
                                    .foregroundColor(.heroForeground)
                                    .tint(.heroForeground)
                            }
                            .padding(AppSpacing.md)
                            .background(Color.heroOverlay)
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.heroForegroundMuted.opacity(0.5), lineWidth: 1)
                            )
                            
                            Button(action: { showFilters.toggle() }) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color.heroOverlay)
                                        .frame(width: 44, height: 44)
                                    
                                    Image(systemName: "slider.horizontal.3")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
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
                    VStack(spacing: AppSpacing.md) {
                        if loadingStores {
                            VStack(spacing: AppSpacing.md) {
                                ProgressView()
                                    .scaleEffect(1.5)
                                    .padding(.top, AppSpacing.xl * 2)
                                Text("Carregando lojas...")
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
                                Text("Escolha sua localidade na tela inicial para ver as lojas")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                                    .multilineTextAlignment(.center)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else if filteredStores.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "storefront")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                Text("Nenhuma loja encontrada")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                Text(searchQuery.isEmpty ? "Não há lojas em \(selectedLocation)" : "Tente buscar com outros termos")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(filteredStores.enumerated()), id: \.element.id) { index, store in
                                StoreCard(store: store) {
                                    selectedStore = store
                                }
                                .fadeIn(delay: 0.15 + Double(index) * 0.05)
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
            
            // Store Detail (overlay em cima de todo o conteúdo)
            if let store = selectedStore {
                StoreDetailView(
                    store: store,
                    activeTab: $activeTab,
                    isPresented: Binding(
                        get: { selectedStore != nil },
                        set: { if !$0 { selectedStore = nil } }
                    )
                )
                .transition(.move(edge: .trailing))
                .zIndex(1)
            }
        }
        .ignoresSafeArea(edges: .top)
        .animation(.easeInOut(duration: 0.3), value: selectedStore)
        .onAppear {
            loadStores()
        }
        .onChange(of: selectedLocation) { _, _ in
            loadStores()
        }
    }
    
    private func loadStores() {
        guard !selectedLocation.isEmpty else {
            stores = []
            return
        }
        loadingStores = true
        Task {
            do {
                let fbStores = try await StoresService.shared.getStoresByCity(cityFilter: selectedLocation)
                await MainActor.run {
                    stores = fbStores.map { Store.fromFirebase($0) }
                    loadingStores = false
                }
            } catch {
                print("❌ [StoresView] Erro ao carregar lojas: \(error.localizedDescription)")
                await MainActor.run {
                    stores = []
                    loadingStores = false
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

struct StoreCard: View {
    let store: Store
    var onTap: () -> Void = {}
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppSpacing.md) {
                // Store Image
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .fill(AppGradients.primary)
                        .frame(width: 80, height: 80)
                    
                    if let urlString = store.photoURL, let url = URL(string: urlString) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 80, height: 80)
                                    .clipped()
                                    .cornerRadius(AppRadius.lg)
                            default:
                                Image(systemName: "storefront.fill")
                                    .foregroundColor(.primaryForeground)
                                    .font(.system(size: 40))
                            }
                        }
                    } else {
                        Image(systemName: "storefront.fill")
                            .foregroundColor(.primaryForeground)
                            .font(.system(size: 40))
                    }
                }
                
                // Store Info
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    HStack {
                        Text(store.name)
                            .font(.appBody)
                            .fontWeight(.semibold)
                            .foregroundColor(.cardForeground)
                            .lineLimit(1)
                        
                        Spacer()
                        
                        if store.isOpen {
                            Text("Aberto")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.primary)
                                .padding(.horizontal, AppSpacing.sm)
                                .padding(.vertical, 4)
                                .background(Color.primary.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        } else {
                            Text("Fechado")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.mutedForeground)
                                .padding(.horizontal, AppSpacing.sm)
                                .padding(.vertical, 4)
                                .background(Color.muted)
                                .cornerRadius(AppRadius.sm)
                        }
                    }
                    
                    HStack(spacing: 4) {
                        Image(systemName: "mappin")
                            .font(.system(size: 12))
                        Text(store.address)
                            .font(.appCaption)
                            .foregroundColor(.mutedForeground)
                            .lineLimit(1)
                    }
                    
                    HStack(spacing: AppSpacing.md) {
                        HStack(spacing: 4) {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                                .font(.system(size: 12))
                            Text(String(format: "%.1f", store.rating))
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                        
                        HStack(spacing: 4) {
                            Image(systemName: "mappin")
                                .font(.system(size: 12))
                            Text(store.distance)
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                        
                        if store.isOpen {
                            HStack(spacing: 4) {
                                Image(systemName: "clock")
                                    .font(.system(size: 12))
                                Text("Até \(store.openUntil)")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                            }
                        }
                    }
                    
                    HStack {
                        HStack(spacing: 4) {
                            Image(systemName: "phone")
                                .font(.system(size: 12))
                            Text(store.phone)
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                        
                        Spacer()
                        
                        if store.offers > 0 {
                            Text("\(store.offers) ofertas")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.secondary)
                                .padding(.horizontal, AppSpacing.sm)
                                .padding(.vertical, 4)
                                .background(Color.secondary.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        }
                    }
                }
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.mutedForeground)
                    .font(.system(size: 20))
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.xl)
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
    StoresView(activeTab: .constant("stores"))
}
