//
//  RewardsView.swift
//  CartaoFidelidade
//
//  Tela de Suas Recompensas
//

import SwiftUI

struct RewardsView: View {
    @Binding var activeTab: String
    @State private var searchQuery = ""
    @State private var selectedFilter = "all"
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
            icon: "coffee",
            available: true,
            expiresIn: nil
        ),
        Reward(
            title: "Sobremesa Grátis",
            description: "Na compra de qualquer prato",
            points: 350,
            icon: "pizza",
            available: false,
            expiresIn: nil
        ),
        Reward(
            title: "Brinde Especial",
            description: "Exclusivo para membros VIP",
            points: 500,
            icon: "gift",
            available: false,
            expiresIn: nil
        ),
        Reward(
            title: "15% OFF",
            description: "Desconto em qualquer compra acima de R$ 50",
            points: 300,
            icon: "percent",
            available: true,
            expiresIn: "5 dias"
        ),
        Reward(
            title: "Pizza Grátis",
            description: "Pizza média de sua escolha",
            points: 400,
            icon: "pizza",
            available: false,
            expiresIn: nil
        ),
        Reward(
            title: "20% OFF",
            description: "Desconto em bebidas e sobremesas",
            points: 250,
            icon: "cup.and.saucer.fill",
            available: true,
            expiresIn: "3 dias"
        )
    ]
    
    let filters = [
        ("all", "Todas", "list.bullet"),
        ("available", "Disponíveis", "checkmark.circle.fill"),
        ("claimed", "Resgatadas", "gift.fill")
    ]
    
    var filteredRewards: [Reward] {
        let statusFiltered: [Reward]
        switch selectedFilter {
        case "available":
            statusFiltered = rewards.filter { $0.available }
        case "claimed":
            statusFiltered = rewards.filter { !$0.available }
        default:
            statusFiltered = rewards
        }
        
        if searchQuery.isEmpty {
            return statusFiltered
        }
        
        return statusFiltered.filter { reward in
            reward.title.localizedCaseInsensitiveContains(searchQuery) ||
            reward.description.localizedCaseInsensitiveContains(searchQuery)
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
                                
                                Text("Suas Recompensas")
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
                            
                            TextField("Buscar recompensas...", text: $searchQuery)
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
                        
                        // Rewards List
                        if filteredRewards.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "gift")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Nenhuma recompensa encontrada")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Tente buscar com outros termos")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(filteredRewards.enumerated()), id: \.offset) { index, reward in
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
                                .fadeIn(delay: 0.2 + Double(index) * 0.05)
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

#Preview {
    RewardsView(activeTab: .constant("rewards"))
}
