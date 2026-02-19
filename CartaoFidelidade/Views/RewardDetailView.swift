//
//  RewardDetailView.swift
//  CartaoFidelidade
//
//  Tela de detalhes da recompensa
//

import SwiftUI

struct RewardDetailView: View {
    let reward: Reward
    let onResgatar: () -> Void
    let onDismiss: () -> Void
    
    private var iconName: String {
        switch reward.icon.lowercased() {
        case "coffee", "cup.and.saucer.fill": return "cup.and.saucer.fill"
        case "pizza", "birthday.cake": return "birthday.cake.fill"
        case "gift": return "gift.fill"
        default: return "percent"
        }
    }
    
    private var iconGradient: LinearGradient {
        switch reward.icon.lowercased() {
        case "coffee", "cup.and.saucer.fill":
            return AppGradients.primary
        case "pizza", "birthday.cake":
            return LinearGradient(colors: [Color.orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "gift":
            return AppGradients.secondary
        default:
            return LinearGradient(colors: [Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                // Card principal
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    HStack(alignment: .top, spacing: AppSpacing.md) {
                        ZStack {
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .fill(iconGradient)
                                .frame(width: 64, height: 64)
                            Image(systemName: iconName)
                                .foregroundColor(.white)
                                .font(.system(size: 32))
                        }
                        
                        VStack(alignment: .leading, spacing: AppSpacing.xs) {
                            HStack(alignment: .top, spacing: AppSpacing.sm) {
                                Text(reward.title)
                                    .font(.appHeadline)
                                    .foregroundColor(.cardForeground)
                                    .lineLimit(2)
                                
                                if !reward.available {
                                    Text("RESGATADA")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.mutedForeground)
                                        .padding(.horizontal, AppSpacing.sm)
                                        .padding(.vertical, 2)
                                        .background(Color.muted)
                                        .cornerRadius(AppRadius.sm)
                                }
                            }
                            
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 14))
                                    .foregroundColor(.primary)
                                Text("\(reward.points) pontos")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.primary)
                            }
                        }
                        
                        Spacer()
                    }
                    .padding(.bottom, AppSpacing.sm)
                    
                    Text(reward.description)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                        .padding(.bottom, AppSpacing.sm)
                    
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        if let expiresIn = reward.expiresIn {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "clock")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                                Text("Expira em \(expiresIn)")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                        }
                        
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: reward.available ? "checkmark.circle.fill" : "xmark.circle.fill")
                                .font(.system(size: 14))
                                .foregroundColor(reward.available ? .primary : .mutedForeground)
                            Text(reward.available ? "Disponível para resgate" : "Já foi resgatada")
                                .font(.appCaption)
                                .foregroundColor(reward.available ? .primary : .mutedForeground)
                        }
                    }
                }
                .padding(AppSpacing.lg)
                .background(Color.card)
                .cornerRadius(AppRadius.xl)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.xl)
                        .stroke(Color.primary.opacity(0.2), lineWidth: 2)
                )
                .appShadow(AppShadow.md)
                
                // Botão Resgatar (será atribuída outra função posteriormente)
                if reward.available {
                    Button(action: onResgatar) {
                        Text("Resgatar Recompensa")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.primaryForeground)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.md)
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.lg)
                    }
                    .buttonStyle(PlainButtonStyle())
                    
                    Text("Apresente esta tela ou o cupom ativado no estabelecimento")
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                        .padding(.top, AppSpacing.sm)
                } else {
                    HStack {
                        Spacer()
                        Text("Recompensa já resgatada")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.mutedForeground)
                        Spacer()
                    }
                    .padding(.vertical, AppSpacing.md)
                    .background(Color.muted)
                    .cornerRadius(AppRadius.lg)
                }
                
                Spacer()
                    .frame(height: 100)
            }
            .padding(AppSpacing.lg)
        }
        .navigationTitle("Detalhes da Recompensa")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    RewardDetailView(
        reward: Reward(
            title: "10% OFF",
            description: "Em qualquer produto",
            points: 100,
            icon: "percent",
            available: true,
            expiresIn: "7 dias"
        ),
        onResgatar: {},
        onDismiss: {}
    )
}
