//
//  RewardCard.swift
//  CartaoFidelidade
//
//  Card de recompensa
//

import SwiftUI

struct RewardCard: View {
    let title: String
    let description: String
    let points: Int
    let expiresIn: String?
    let icon: String
    let available: Bool
    let onClaim: () -> Void
    
    @State private var isPressed = false
    @State private var isClaimPressed = false
    
    var body: some View {
        Button(action: {
            withAnimation(.bounceSmall) {
                isPressed = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                isPressed = false
            }
        }) {
            HStack(spacing: AppSpacing.md) {
                // Icon
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.md)
                        .fill(available ? AppGradients.primary : LinearGradient(colors: [Color.muted], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(width: 56, height: 56)
                        .scaleEffect(isPressed ? 0.95 : 1.0)
                    
                    Image(systemName: icon)
                        .foregroundColor(available ? .primaryForeground : .mutedForeground)
                        .font(.system(size: 24))
                }
                
                // Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.cardForeground)
                        .lineLimit(1)
                    
                    Text(description)
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                        .lineLimit(1)
                    
                    HStack(spacing: AppSpacing.sm) {
                        Text("\(points) pontos")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(available ? .primary : .mutedForeground)
                        
                        if let expiresIn = expiresIn {
                            HStack(spacing: 4) {
                                Image(systemName: "clock")
                                    .font(.system(size: 12))
                                Text(expiresIn)
                                    .font(.system(size: 12))
                            }
                            .foregroundColor(.mutedForeground)
                        }
                    }
                }
                
                Spacer()
                
                // Action button
                if available {
                    Button(action: {
                        withAnimation(.bounceSmall) {
                            isClaimPressed = true
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                            isClaimPressed = false
                            onClaim()
                        }
                    }) {
                        Text("Resgatar")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.primaryForeground)
                            .padding(.horizontal, AppSpacing.md)
                            .padding(.vertical, AppSpacing.sm)
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.md)
                            .scaleEffect(isClaimPressed ? 0.9 : 1.0)
                            .opacity(isClaimPressed ? 0.8 : 1.0)
                    }
                    .buttonStyle(PlainButtonStyle())
                } else {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 20))
                        .offset(x: isPressed ? 4 : 0)
                }
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .overlay(
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .stroke(available ? Color.primary : Color.clear, lineWidth: 2)
            )
            .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    VStack {
        RewardCard(
            title: "10% OFF",
            description: "Em qualquer produto",
            points: 100,
            expiresIn: "7 dias",
            icon: "percent",
            available: true,
            onClaim: {}
        )
        
        RewardCard(
            title: "Sobremesa Grátis",
            description: "Na compra de qualquer prato",
            points: 350,
            expiresIn: nil,
            icon: "birthday.cake",
            available: false,
            onClaim: {}
        )
    }
    .padding()
}
