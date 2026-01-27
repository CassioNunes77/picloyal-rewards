//
//  BottomNav.swift
//  CartaoFidelidade
//
//  Navegação inferior
//

import SwiftUI

struct BottomNav: View {
    @Binding var activeTab: String
    @Binding var showQRCode: Bool
    
    @State private var pressedTab: String? = nil
    
    let navItems = [
        NavItem(icon: "house.fill", label: "Início", id: "home"),
        NavItem(icon: "tag.fill", label: "Ofertas", id: "offers"),
        NavItem(icon: "qrcode", label: "Escanear", id: "scan", isPrimary: true),
        NavItem(icon: "storefront.fill", label: "Lojas", id: "stores"),
        NavItem(icon: "person.fill", label: "Perfil", id: "profile")
    ]
    
    // Helper to map tab changes to navigation
    private func handleTabChange(_ id: String) {
        // Map bottom nav items to actual tabs
        switch id {
        case "home":
            activeTab = "home"
        case "offers":
            activeTab = "offers" // Navigate to offers
        case "scan":
            // QR Scanner action
            break
        case "stores":
            activeTab = "stores" // Navigate to stores
        case "profile":
            activeTab = "profile" // Navigate to profile
        default:
            activeTab = id
        }
    }
    
    var body: some View {
        VStack {
            Spacer()
            
            HStack(spacing: 0) {
                ForEach(navItems) { item in
                    if item.isPrimary {
                        // Primary button (centered, elevated)
                        Button(action: {
                            handleTabPress(item.id)
                            withAnimation {
                                showQRCode = true
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(AppGradients.secondary)
                                    .frame(width: 64, height: 64)
                                    .appShadow(pressedTab == item.id ? AppShadow.md : AppShadow.lg)
                                    .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                                
                                Image(systemName: item.icon)
                                    .foregroundColor(.secondaryForeground)
                                    .font(.system(size: 28))
                                    .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                            }
                        }
                        .offset(y: -24)
                        .zIndex(1)
                        .buttonStyle(PlainButtonStyle())
                    } else {
                        // Regular nav item
                        Button(action: {
                            handleTabPress(item.id)
                            handleTabChange(item.id)
                        }) {
                            VStack(spacing: 4) {
                                ZStack {
                                    Image(systemName: item.icon)
                                        .foregroundColor(activeTab == item.id ? .primary : .mutedForeground)
                                        .font(.system(size: 24))
                                        .scaleEffect(activeTab == item.id ? 1.1 : 1.0)
                                        .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                                    
                                    if let badge = item.badge {
                                        ZStack {
                                            Circle()
                                                .fill(Color.destructive)
                                                .frame(width: 16, height: 16)
                                            
                                            Text("\(badge)")
                                                .font(.system(size: 10, weight: .bold))
                                                .foregroundColor(.destructiveForeground)
                                        }
                                        .offset(x: 12, y: -12)
                                    }
                                }
                                
                                Text(item.label)
                                    .font(.system(size: 10, weight: .medium))
                                    .foregroundColor(activeTab == item.id ? .primary : .mutedForeground)
                                
                                if activeTab == item.id {
                                    Circle()
                                        .fill(Color.primary)
                                        .frame(width: 4, height: 4)
                                        .scaleEffect(pressedTab == item.id ? 0.9 : 1.0)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.sm)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
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

struct NavItem: Identifiable {
    let id: String
    let icon: String
    let label: String
    let isPrimary: Bool
    let badge: Int?
    
    init(icon: String, label: String, id: String, isPrimary: Bool = false, badge: Int? = nil) {
        self.icon = icon
        self.label = label
        self.id = id
        self.isPrimary = isPrimary
        self.badge = badge
    }
}

#Preview {
    ZStack {
        Color.appBackground
            .ignoresSafeArea()
        
        BottomNav(activeTab: .constant("home"), showQRCode: .constant(false))
    }
}
