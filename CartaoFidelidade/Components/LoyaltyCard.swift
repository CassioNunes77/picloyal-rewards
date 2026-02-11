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
                                .frame(width: 32, height: 32)
                            
                            Image(systemName: "gift.fill")
                                .foregroundColor(.white)
                                .font(.system(size: 16))
                        }
                        
                        VStack(alignment: .leading, spacing: 1) {
                            Text("Core+")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.white.opacity(0.8))
                            
                            Text(cardNumber)
                                .font(.system(size: 9))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                    
                    Spacer()
                    
                    Image(systemName: "sparkles")
                        .foregroundColor(.white.opacity(0.8))
                        .font(.system(size: 20))
                }
                
                Spacer().frame(height: AppSpacing.md)
                
                // User greeting
                VStack(alignment: .leading, spacing: 2) {
                    Text(userName)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                Spacer().frame(height: AppSpacing.md)
                
                // Points section
                VStack(alignment: .leading, spacing: AppSpacing.sm) {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("\(currentPoints)")
                                .font(.system(size: 28, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("pontos")
                                .font(.system(size: 11))
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            // Stars acima de "Próxima recompensa"
                            HStack(spacing: 3) {
                                ForEach(0..<5) { index in
                                    Image(systemName: index < starsCount ? "star.fill" : "star")
                                        .foregroundColor(index < starsCount ? .white : .white.opacity(0.3))
                                        .font(.system(size: 14))
                                }
                            }
                            .padding(.bottom, 4)
                            
                            Text("Próxima recompensa")
                                .font(.system(size: 11))
                                .foregroundColor(.white.opacity(0.8))
                            
                            Text("\(totalPoints - currentPoints) pts")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    
                    // Progress bar
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("Progresso")
                                .font(.system(size: 9))
                                .foregroundColor(.white.opacity(0.8))
                            
                            Spacer()
                            
                            Text("\(Int(progress * 100))%")
                                .font(.system(size: 9))
                                .foregroundColor(.white.opacity(0.8))
                        }
                        
                        GeometryReader { geometry in
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.white.opacity(0.2))
                                    .frame(height: 8)
                                
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(Color.white)
                                    .frame(width: geometry.size.width * progress, height: 8)
                                    .animation(.easeOut(duration: 0.5), value: progress)
                            }
                        }
                        .frame(height: 8)
                    }
                }
            }
            .padding(.horizontal, AppSpacing.md)
            .padding(.top, AppSpacing.xl)
            .padding(.bottom, AppSpacing.xl)
        }
        .frame(height: 200)
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
