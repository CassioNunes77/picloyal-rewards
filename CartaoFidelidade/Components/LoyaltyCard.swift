//
//  LoyaltyCard.swift
//  CartaoFidelidade
//
//  Componente de cartão de fidelidade
//

import SwiftUI

struct LoyaltyCard: View {
    let currentPoints: Int
    let totalPoints: Int
    let userName: String
    let cardNumber: String
    
    private var progress: Double {
        Double(currentPoints) / Double(totalPoints)
    }
    
    private var starsCount: Int {
        min(5, currentPoints / 200)
    }
    
    var body: some View {
        ZStack {
            AppGradients.card
            
            // Background decorations
            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 128, height: 128)
                .offset(x: 80, y: -60)
            
            Circle()
                .fill(Color.white.opacity(0.05))
                .frame(width: 160, height: 160)
                .offset(x: -60, y: 80)
            
            VStack(alignment: .leading, spacing: 0) {
                // Header
                HStack {
                    HStack(spacing: AppSpacing.sm) {
                        ZStack {
                            Circle()
                                .fill(Color.white.opacity(0.2))
                                .frame(width: 40, height: 40)
                            
                            Image(systemName: "gift.fill")
                                .foregroundColor(.white)
                                .font(.system(size: 20))
                        }
                        
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Cartão Fidelidade")
                                .font(.appCaption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            Text(cardNumber)
                                .font(.system(size: 10))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "sparkles")
                        .foregroundColor(.white.opacity(0.8))
                        .font(.system(size: 24))
                }
                
                Spacer().frame(height: AppSpacing.lg)
                
                // User greeting
                VStack(alignment: .leading, spacing: 4) {
                    Text(userName)
                        .font(.appHeadline)
                        .foregroundColor(.white)
                }
                
                Spacer().frame(height: AppSpacing.lg)
                
                // Points section
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("\(currentPoints)")
                                .font(.system(size: 32, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("pontos")
                                .font(.appCaption)
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 4) {
                            Text("Próxima recompensa")
                                .font(.appCaption)
                                .foregroundColor(.white.opacity(0.8))
                            
                            Text("\(totalPoints - currentPoints) pts")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    
                    // Progress bar
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack {
                            Text("Progresso")
                                .font(.system(size: 10))
                                .foregroundColor(.white.opacity(0.8))
                            
                            Spacer()
                            
                            Text("\(Int(progress * 100))%")
                                .font(.system(size: 10))
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.white.opacity(0.2))
                                    .frame(height: 12)
                                
                                RoundedRectangle(cornerRadius: 6)
                                    .fill(Color.white)
                                    .frame(width: geometry.size.width * progress, height: 12)
                                    .animation(.easeOut(duration: 0.5), value: progress)
                            }
                        }
                        .frame(height: 12)
                    }
                }
                
                Spacer().frame(height: AppSpacing.md)
                
                // Stars
                HStack(spacing: 4) {
                    ForEach(0..<5) { index in
                        Image(systemName: index < starsCount ? "star.fill" : "star")
                            .foregroundColor(index < starsCount ? .white : .white.opacity(0.3))
                            .font(.system(size: 16))
                    }
                }
            }
            .padding(AppSpacing.lg)
        }
        .frame(height: 280)
        .cornerRadius(AppRadius.xl)
        .appShadow(AppShadow.xl)
        .slideUp(delay: 0.1)
    }
}

#Preview {
    LoyaltyCard(
        currentPoints: 650,
        totalPoints: 1000,
        userName: "Maria Silva",
        cardNumber: "**** **** **** 4589"
    )
    .padding()
}
