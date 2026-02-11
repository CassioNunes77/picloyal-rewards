//
//  HomeView.swift
//  CartaoFidelidade
//
//  Página principal - equivalente ao Index.tsx
//

import SwiftUI

struct HomeView: View {
    @Binding var showSettings: Bool
    @Binding var activeTab: String
    @Binding var showQRCode: Bool
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @State private var showToast = false
    @State private var toastMessage = ""
    
    let rewards = [
        Reward(
            title: "10% OFF",
            description: "Em qualquer produto",
            points: 100,
            icon: "percent",
            available: true,
            expiresIn: "7 dias"
        ),
        Reward(
            title: "Café Grátis",
            description: "Um café expresso ou cappuccino",
            points: 200,
            icon: "cup.and.saucer.fill",
            available: true,
            expiresIn: nil
        ),
        Reward(
            title: "Sobremesa Grátis",
            description: "Na compra de qualquer prato",
            points: 350,
            icon: "birthday.cake.fill",
            available: false,
            expiresIn: nil
        ),
        Reward(
            title: "Brinde Especial",
            description: "Exclusivo para membros VIP",
            points: 500,
            icon: "gift.fill",
            available: false,
            expiresIn: nil
        )
    ]
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Hero Section with Gradient
                    VStack(spacing: 0) {
                        // Location Selector (estilo iFood) - Centralizado
                        HStack {
                            Spacer()
                            LocationSelectorView()
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 56) // Considerando notch do iOS
                        .padding(.bottom, 4) // Espaço mínimo entre localidade e header
                        
                        // Header
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Bem-vindo de volta,")
                                    .font(.appCaption)
                                    .foregroundColor(.white.opacity(0.8))
                                
                                Text(userDisplayName.isEmpty ? "Usuário" : String(userDisplayName.split(separator: " ").first ?? Substring(userDisplayName)))
                                    .font(.appTitle)
                                    .foregroundColor(.white)
                            }
                            .fadeIn()
                            
                            Spacer()
                            
                                HStack(spacing: AppSpacing.sm) {
                                    // Notifications button
                                    Button(action: {
                                        withAnimation {
                                            activeTab = "notifications"
                                        }
                                    }) {
                                        ZStack {
                                            Circle()
                                                .fill(Color.white.opacity(0.2))
                                                .frame(width: 40, height: 40)
                                            
                                            Image(systemName: "bell.fill")
                                                .foregroundColor(.white)
                                                .font(.system(size: 20))
                                            
                                            ZStack {
                                                Circle()
                                                    .fill(Color.destructive)
                                                    .frame(width: 20, height: 20)
                                                
                                                Text("2")
                                                    .font(.system(size: 10, weight: .bold))
                                                    .foregroundColor(.white)
                                            }
                                            .offset(x: 12, y: -12)
                                        }
                                    }
                                    .fadeIn(delay: 0.1)
                                
                                // Settings button
                                Button(action: {
                                    withAnimation {
                                        showSettings = true
                                    }
                                }) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.white.opacity(0.2))
                                            .frame(width: 40, height: 40)
                                        
                                        Image(systemName: "gearshape.fill")
                                            .foregroundColor(.white)
                                            .font(.system(size: 20))
                                    }
                                }
                                .fadeIn(delay: 0.15)
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Loyalty Card
                        LoyaltyCard(
                            currentPoints: 650,
                            totalPoints: 1000,
                            userName: userDisplayName.isEmpty ? "Usuário" : userDisplayName,
                            cardNumber: "**** **** **** 4589"
                        )
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.lg)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(
                        AppGradients.hero
                            .ignoresSafeArea(edges: .top)
                    )
                    
                    // Content
                    VStack(spacing: AppSpacing.lg) {
                        // Quick Actions
                        HStack(spacing: 0) {
                            QuickAction(icon: "qrcode", label: "Escanear", badge: nil) {
                                withAnimation {
                                    showQRCode = true
                                }
                            }
                            
                            Spacer()
                            
                            QuickAction(icon: "clock", label: "Atividades", badge: nil) {
                                withAnimation {
                                    activeTab = "history"
                                }
                            }
                            
                            Spacer()
                            
                            QuickAction(icon: "sparkles", label: "Recompensas", badge: nil) {
                                withAnimation {
                                    activeTab = "rewards"
                                }
                            }
                            
                            Spacer()
                            
                            QuickAction(icon: "storefront.fill", label: "Lojas", badge: nil) {
                                withAnimation {
                                    activeTab = "stores"
                                }
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .fadeIn(delay: 0.2)
                        
                        // Stamp Card
                        StampGrid(
                            currentStamps: 7,
                            totalStamps: 10,
                            reward: "1 Café Grátis"
                        )
                        .padding(.horizontal, AppSpacing.lg)
                        
                        // Rewards Section
                        VStack(alignment: .leading, spacing: AppSpacing.md) {
                            HStack {
                                HStack(spacing: AppSpacing.sm) {
                                    Image(systemName: "sparkles")
                                        .foregroundColor(.secondary)
                                        .font(.system(size: 20))
                                    
                                    Text("Suas Recompensas")
                                        .font(.appHeadline)
                                        .foregroundColor(.appForeground)
                                }
                                
                                Spacer()
                                
                                Button(action: {
                                    withAnimation {
                                        activeTab = "rewards"
                                    }
                                }) {
                                    Text("Ver todas")
                                        .font(.appCaption)
                                        .foregroundColor(.primary)
                                }
                            }
                            .padding(.horizontal, AppSpacing.lg)
                            .fadeIn(delay: 0.3)
                            
                            VStack(spacing: AppSpacing.sm) {
                                ForEach(Array(rewards.enumerated()), id: \.offset) { index, reward in
                                    RewardCard(
                                        title: reward.title,
                                        description: reward.description,
                                        points: reward.points,
                                        expiresIn: reward.expiresIn,
                                        icon: reward.icon,
                                        available: reward.available,
                                        onClaim: {
                                            showToast(message: "🎉 \(reward.title) resgatado com sucesso!")
                                        }
                                    )
                                    .fadeIn(delay: 0.35 + Double(index) * 0.05)
                                }
                            }
                            .padding(.horizontal, AppSpacing.lg)
                        }
                        
                        // Promo Banner
                        Button(action: {}) {
                            HStack {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Oferta Especial")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.white.opacity(0.8))
                                    
                                    Text("Pontos em Dobro!")
                                        .font(.appHeadline)
                                        .foregroundColor(.white)
                                    
                                    Text("Válido até domingo, 23:59")
                                        .font(.appCaption)
                                        .foregroundColor(.white.opacity(0.8))
                                }
                                
                                Spacer()
                                
                                ZStack {
                                    Circle()
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 64, height: 64)
                                    
                                    Text("2x")
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(AppSpacing.lg)
                            .background(AppGradients.secondary)
                            .cornerRadius(AppRadius.xl)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .padding(.horizontal, AppSpacing.lg)
                        .fadeIn(delay: 0.55)
                        
                        Spacer()
                            .frame(height: 100)
                    }
                    .padding(.top, AppSpacing.lg)
                    .background(Color.appBackground)
                    .cornerRadius(AppRadius.xl, corners: [.topLeft, .topRight])
                    .offset(y: -AppRadius.xl)
                }
            }
            .ignoresSafeArea(edges: .top)
            
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

struct Reward {
    let title: String
    let description: String
    let points: Int
    let icon: String
    let available: Bool
    let expiresIn: String?
}

// Extension for corner radius on specific corners
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

#Preview {
    HomeView(showSettings: .constant(false), activeTab: .constant("home"), showQRCode: .constant(false))
}
