//
//  MerchantProfileView.swift
//  CartaoFidelidade
//
//  View de perfil do lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantProfileView: View {
    var onBack: (() -> Void)? = nil
    
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    // Header
                    VStack(spacing: AppSpacing.md) {
                        HStack {
                            Button(action: {
                                onBack?()
                            }) {
                                Image(systemName: "arrow.left.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.white)
                            }
                            
                            Spacer()
                        }
                        
                        VStack(spacing: AppSpacing.xs) {
                            Text("Perfil")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Informações da conta")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.primary)
                    
                    // Informações do perfil
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        // Nome
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("Nome")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.mutedForeground)
                            
                            Text(userDisplayName.isEmpty ? "Não informado" : userDisplayName)
                                .font(.system(size: 16, weight: .regular))
                                .foregroundColor(.cardForeground)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.lg)
                        
                        // Email
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("E-mail")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.mutedForeground)
                            
                            Text(userEmail.isEmpty ? "Não informado" : userEmail)
                                .font(.system(size: 16, weight: .regular))
                                .foregroundColor(.cardForeground)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.lg)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .offset(y: -AppRadius.xl)
                }
            }
        }
    }
}

#Preview {
    MerchantProfileView()
}
