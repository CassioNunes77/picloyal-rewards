//
//  MerchantBottomNav.swift
//  CartaoFidelidade
//
//  Navegação inferior do painel do lojista
//

import SwiftUI

struct MerchantBottomNav: View {
    @Binding var activeTab: String
    
    @State private var pressedTab: String? = nil
    
    let navItems = [
        MerchantNavItem(icon: "square.grid.2x2.fill", label: "Dashboard", id: "dashboard"),
        MerchantNavItem(icon: "storefront.fill", label: "Lojas", id: "stores"),
        MerchantNavItem(icon: "person.fill", label: "Perfil", id: "profile"),
        MerchantNavItem(icon: "gearshape.fill", label: "Configurações", id: "settings")
    ]
    
    var body: some View {
        VStack {
            Spacer()
            
            HStack(spacing: 0) {
                ForEach(navItems) { item in
                    Button(action: {
                        handleTabPress(item.id)
                    }) {
                        VStack(spacing: 4) {
                            ZStack {
                                Image(systemName: item.icon)
                                    .foregroundColor(activeTab == item.id ? .primary : .mutedForeground)
                                    .font(.system(size: 24))
                                    .scaleEffect(activeTab == item.id ? 1.1 : 1.0)
                                    .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                            }
                            .animation(.bounceSmall, value: activeTab)
                            .animation(.bounceSmall, value: pressedTab)
                            
                            Text(item.label)
                                .font(.system(size: 10, weight: .medium))
                                .foregroundColor(activeTab == item.id ? .primary : .mutedForeground)
                                .animation(.bounceSmall, value: activeTab)
                            
                            if activeTab == item.id {
                                Circle()
                                    .fill(Color.primary)
                                    .frame(width: 4, height: 4)
                                    .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                                    .animation(.bounceSmall, value: pressedTab)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppSpacing.sm)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding(.horizontal, AppSpacing.md)
            .padding(.bottom, 8)
            .background(
                Color.card
                    .opacity(0.95)
                    .background(.ultraThinMaterial)
            )
        }
        .ignoresSafeArea(edges: .bottom)
    }
    
    private func handleTabPress(_ id: String) {
        withAnimation(.bounceSmall) {
            pressedTab = id
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
            pressedTab = nil
            activeTab = id
        }
    }
}

struct MerchantNavItem: Identifiable {
    let id: String
    let icon: String
    let label: String
    
    init(icon: String, label: String, id: String) {
        self.icon = icon
        self.label = label
        self.id = id
    }
}

#Preview {
    ZStack {
        Color.appBackground
            .ignoresSafeArea()
        
        MerchantBottomNav(activeTab: .constant("dashboard"))
    }
}
