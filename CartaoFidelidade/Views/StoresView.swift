//
//  StoresView.swift
//  CartaoFidelidade
//
//  Tela de Lojas Parceiras
//

import SwiftUI

struct Store: Identifiable {
    let id: Int
    let name: String
    let address: String
    let distance: String
    let rating: Double
    let openUntil: String
    let phone: String
    let isOpen: Bool
    let offers: Int
}

struct StoresView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var showFilters = false
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var selectedStore: Store? = nil
    
    let stores = [
        Store(
            id: 1,
            name: "Café Central",
            address: "Rua das Flores, 123 - Centro",
            distance: "0.8 km",
            rating: 4.8,
            openUntil: "22:00",
            phone: "(11) 3456-7890",
            isOpen: true,
            offers: 5
        ),
        Store(
            id: 2,
            name: "Restaurante Sabor",
            address: "Av. Principal, 456 - Jardim",
            distance: "1.2 km",
            rating: 4.6,
            openUntil: "23:30",
            phone: "(11) 3456-7891",
            isOpen: true,
            offers: 3
        ),
        Store(
            id: 3,
            name: "Padaria Doce Vida",
            address: "Rua Comercial, 789 - Vila Nova",
            distance: "2.5 km",
            rating: 4.9,
            openUntil: "20:00",
            phone: "(11) 3456-7892",
            isOpen: true,
            offers: 8
        ),
        Store(
            id: 4,
            name: "Supermercado Bom Preço",
            address: "Av. Shopping, 321 - Centro",
            distance: "3.1 km",
            rating: 4.5,
            openUntil: "23:00",
            phone: "(11) 3456-7893",
            isOpen: false,
            offers: 12
        ),
        Store(
            id: 5,
            name: "Farmácia Saúde",
            address: "Rua da Saúde, 654 - Centro",
            distance: "1.8 km",
            rating: 4.7,
            openUntil: "24:00",
            phone: "(11) 3456-7894",
            isOpen: true,
            offers: 2
        )
    ]
    
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
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.white)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            Text("Lojas Parceiras")
                                .font(.appTitle)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Search Bar
                        HStack(spacing: AppSpacing.sm) {
                            HStack {
                                Image(systemName: "magnifyingglass")
                                    .foregroundColor(.white.opacity(0.6))
                                    .font(.system(size: 20))
                                
                                TextField("Buscar lojas...", text: $searchQuery)
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
                            
                            Button(action: { showFilters.toggle() }) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 44, height: 44)
                                    
                                    Image(systemName: "slider.horizontal.3")
                                        .foregroundColor(.white)
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
                        if filteredStores.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "storefront")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Nenhuma loja encontrada")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Tente buscar com outros termos")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(filteredStores.enumerated()), id: \.element.id) { index, store in
                                StoreCard(store: store)
                                    .fadeIn(delay: 0.15 + Double(index) * 0.05)
                                    .onTapGesture {
                                        selectedStore = store
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
            
            // Store Detail
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
            }
        }
        .ignoresSafeArea(edges: .top)
        .animation(.easeInOut(duration: 0.3), value: selectedStore)
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
    @State private var isPressed = false
    
    var body: some View {
        Button(action: {}) {
            HStack(spacing: AppSpacing.md) {
                // Store Image
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .fill(AppGradients.primary)
                        .frame(width: 80, height: 80)
                    
                    Image(systemName: "storefront.fill")
                        .foregroundColor(.primaryForeground)
                        .font(.system(size: 40))
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
