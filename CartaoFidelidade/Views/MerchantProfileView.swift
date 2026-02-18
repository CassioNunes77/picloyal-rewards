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
        ZStack(alignment: .top) {
            Color.appBackground
                .ignoresSafeArea()
            
            // Camada roxa no topo (padrão painel lojista)
            VStack(spacing: 0) {
                profileHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            ScrollView {
                    VStack(spacing: 0) {
                        // Card que engloba todo o conteúdo (como Suas Lojas)
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
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.muted.opacity(0.5))
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                            
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
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.muted.opacity(0.5))
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(AppSpacing.lg)
                        .background(Color.card)
                        .clipShape(RoundedRectangle(cornerRadius: AppRadius.xl))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.xl)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .appShadow(AppShadow.lg)
                        .padding(.horizontal, 24)
                        .padding(.top, 75)
                        .padding(.bottom, 80)
                    }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.clear)
            }
        }
        .onAppear {
            loadUserProfile()
        }
    }
    
    private func loadUserProfile() {
        guard let user = Auth.auth().currentUser else { return }
        if let email = user.email, !email.isEmpty {
            userEmail = email
        }
        if let name = user.displayName, !name.isEmpty {
            userDisplayName = name
        } else if userDisplayName.isEmpty, let email = user.email, !email.isEmpty {
            userDisplayName = email.components(separatedBy: "@").first ?? "Usuário"
        }
    }
    
    /// Header roxo — 120pt altura, texto 15pt do topo (padrão painel lojista)
    private var profileHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Perfil")
                .font(.appTitle)
                .foregroundColor(.white)
            Text("Informações da conta")
                .font(.appCaption)
                .foregroundColor(.white.opacity(0.9))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppSpacing.lg)
        .padding(.top, 0)
        .padding(.bottom, AppSpacing.md)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
}

#Preview {
    MerchantProfileView()
}
