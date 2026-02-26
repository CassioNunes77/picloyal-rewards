//
//  PremiumView.swift
//  CartaoFidelidade
//
//  Tela Seja Premium - benefícios exclusivos
//

import SwiftUI

struct PremiumView: View {
    @Binding var activeTab: String
    let onBack: () -> Void
    
    private let benefits = [
        (icon: "star.fill", title: "Pontos em dobro", desc: "Ganhe 2x pontos em todas as compras"),
        (icon: "gift.fill", title: "Recompensas exclusivas", desc: "Acesso a ofertas só para Premium"),
        (icon: "crown.fill", title: "Prioridade no atendimento", desc: "Atendimento preferencial nas lojas"),
        (icon: "percent", title: "Descontos especiais", desc: "Até 20% OFF em parceiros selecionados"),
        (icon: "sparkles", title: "Aniversário Premium", desc: "Brinde especial no seu aniversário")
    ]
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header - mesma estrutura da tela Ofertas Especiais
                ZStack(alignment: .top) {
                    VStack(spacing: 0) {
                        HStack {
                            Button(action: onBack) {
                                ZStack {
                                    Circle()
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "crown.fill")
                                    .foregroundColor(.heroForeground)
                                    .font(.system(size: 24))
                                
                                Text("Seja Premium")
                                    .font(.appTitle)
                                    .foregroundColor(.heroForeground)
                            }
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(
                        LinearGradient(
                            colors: [
                                Color(red: 0.85, green: 0.65, blue: 0.2),
                                Color(red: 0.75, green: 0.5, blue: 0.1)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .ignoresSafeArea(edges: .top)
                }
                
                // Content - mesmo offset e cornerRadius da tela Ofertas Especiais
                ScrollView {
                    VStack(spacing: AppSpacing.lg) {
                        // Benefícios
                        VStack(alignment: .leading, spacing: AppSpacing.md) {
                            Text("O que você ganha")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.mutedForeground)
                                .textCase(.uppercase)
                                .tracking(1)
                                .padding(.horizontal, 4)
                            
                            VStack(spacing: AppSpacing.sm) {
                                ForEach(Array(benefits.enumerated()), id: \.offset) { index, benefit in
                                    HStack(spacing: AppSpacing.md) {
                                        ZStack {
                                            RoundedRectangle(cornerRadius: AppRadius.md)
                                                .fill(Color(red: 0.9, green: 0.75, blue: 0.3).opacity(0.3))
                                                .frame(width: 44, height: 44)
                                            
                                            Image(systemName: benefit.icon)
                                                .foregroundColor(Color(red: 0.75, green: 0.55, blue: 0.1))
                                                .font(.system(size: 20))
                                        }
                                        
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(benefit.title)
                                                .font(.system(size: 16, weight: .semibold))
                                                .foregroundColor(.cardForeground)
                                            
                                            Text(benefit.desc)
                                                .font(.appCaption)
                                                .foregroundColor(.mutedForeground)
                                        }
                                        
                                        Spacer()
                                    }
                                    .padding(AppSpacing.md)
                                    .background(Color.card)
                                    .cornerRadius(AppRadius.lg)
                                    .appShadow(AppShadow.md)
                                    .fadeIn(delay: 0.1 + Double(index) * 0.05)
                                }
                            }
                        }
                        
                        // CTA
                        Button(action: {
                            // TODO: Integrar com fluxo de assinatura
                        }) {
                            HStack {
                                Text("Assinar Premium")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.white)
                                
                                Image(systemName: "arrow.right")
                                    .foregroundColor(.white)
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.md)
                            .background(
                                LinearGradient(
                                    colors: [
                                        Color(red: 0.85, green: 0.65, blue: 0.2),
                                        Color(red: 0.75, green: 0.5, blue: 0.1)
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .cornerRadius(AppRadius.lg)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .fadeIn(delay: 0.4)
                        
                        Text("R$ 19,90/mês • Cancele quando quiser")
                            .font(.appCaption)
                            .foregroundColor(.mutedForeground)
                            .fadeIn(delay: 0.45)
                        
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
        }
    }
}

#Preview {
    PremiumView(activeTab: .constant("home"), onBack: {})
}
