//
//  MerchantProfileView.swift
//  CartaoFidelidade
//
//  View de perfil do lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantProfileView: View {
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
                            Spacer()
                        }
                        
                        VStack(spacing: AppSpacing.xs) {
                            Text("Perfil")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Informações da sua conta")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.primary)
                    
                    // Avatar e Nome
                    VStack(spacing: AppSpacing.md) {
                        Circle()
                            .fill(AppGradients.primary)
                            .frame(width: 96, height: 96)
                            .overlay(
                                Image(systemName: "person.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.primaryForeground)
                            )
                        
                        Text(userDisplayName.isEmpty ? (userEmail.isEmpty ? "Lojista" : String(userEmail.split(separator: "@").first ?? "Lojista")) : userDisplayName)
                            .font(.system(size: 20, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        
                        Text(userEmail)
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.mutedForeground)
                    }
                    .padding(.top, -AppRadius.xl)
                    
                    // Informações
                    VStack(spacing: AppSpacing.md) {
                        InfoRow(
                            icon: "envelope.fill",
                            title: "Email",
                            value: userEmail.isEmpty ? "Não informado" : userEmail
                        )
                        
                        InfoRow(
                            icon: "person.fill",
                            title: "Nome",
                            value: userDisplayName.isEmpty ? "Não informado" : userDisplayName
                        )
                    }
                    .padding(.horizontal, AppSpacing.lg)
                }
            }
        }
    }
}

struct InfoRow: View {
    let icon: String
    let title: String
    let value: String
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.primary)
                .frame(width: 40, height: 40)
                .background(Color.primary.opacity(0.1))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 12, weight: .regular))
                    .foregroundColor(.mutedForeground)
                
                Text(value)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.cardForeground)
            }
            
            Spacer()
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .appShadow(AppShadow.sm)
    }
}

#Preview {
    MerchantProfileView()
}
