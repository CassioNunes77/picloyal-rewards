//
//  MerchantBottomNav.swift
//  CartaoFidelidade
//
//  Menu de navegação inferior para o painel do lojista
//

import SwiftUI

enum MerchantTab: String, CaseIterable {
    case dashboard = "dashboard"
    case stores = "stores"
    case profile = "profile"
    case settings = "settings"
    
    var icon: String {
        switch self {
        case .dashboard:
            return "square.grid.2x2.fill"
        case .stores:
            return "storefront.fill"
        case .profile:
            return "person.fill"
        case .settings:
            return "gearshape.fill"
        }
    }
    
    var label: String {
        switch self {
        case .dashboard:
            return "Dashboard"
        case .stores:
            return "Lojas"
        case .profile:
            return "Perfil"
        case .settings:
            return "Configurações"
        }
    }
}

struct MerchantBottomNav: View {
    @Binding var selectedTab: MerchantTab
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(MerchantTab.allCases, id: \.self) { tab in
                Button(action: {
                    withAnimation {
                        selectedTab = tab
                    }
                }) {
                    VStack(spacing: 4) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 20))
                            .foregroundColor(selectedTab == tab ? .primary : .mutedForeground)
                        
                        Text(tab.label)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(selectedTab == tab ? .primary : .mutedForeground)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppSpacing.sm)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .background(Color.card)
        .overlay(
            Rectangle()
                .frame(height: 1)
                .foregroundColor(.border),
            alignment: .top
        )
        .appShadow(AppShadow.md)
    }
}

#Preview {
    VStack {
        Spacer()
        MerchantBottomNav(selectedTab: .constant(.dashboard))
    }
    .background(Color.appBackground)
}
