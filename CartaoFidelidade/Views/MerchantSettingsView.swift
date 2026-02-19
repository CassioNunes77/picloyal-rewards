//
//  MerchantSettingsView.swift
//  CartaoFidelidade
//
//  View de configurações do lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantSettingsView: View {
    var onBack: (() -> Void)? = nil
    
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
    @AppStorage("showMerchantLogin") private var showMerchantLogin = false
    @State private var showLogoutConfirmation = false
    @State private var showPrivacyPolicy = false
    
    var body: some View {
        ZStack(alignment: .top) {
            Color.appBackground
                .ignoresSafeArea()
            
            // Camada roxa no topo (padrão painel lojista)
            VStack(spacing: 0) {
                settingsHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            ScrollView {
                    VStack(spacing: 0) {
                        // Card que engloba todo o conteúdo (como Suas Lojas)
                        VStack(spacing: AppSpacing.md) {
                            // Informações da conta (ex-Perfil)
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("Informações da Conta")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.mutedForeground)
                                
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
                            
                            Button(action: { showPrivacyPolicy = true }) {
                                HStack {
                                    Image(systemName: "shield.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(.primary)
                                    Text("Políticas de Privacidade")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.cardForeground)
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 14))
                                        .foregroundColor(.mutedForeground)
                                }
                                .padding(AppSpacing.md)
                                .background(Color.muted.opacity(0.5))
                                .cornerRadius(AppRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.lg)
                                        .stroke(Color.border, lineWidth: 1)
                                )
                            }
                            .buttonStyle(PlainButtonStyle())
                            if isLoggedIn {
                                Button(action: {
                                    showLogoutConfirmation = true
                                }) {
                                    HStack {
                                        Image(systemName: "arrow.right.square.fill")
                                            .font(.system(size: 20))
                                            .foregroundColor(.red)
                                        Text("Sair da Conta")
                                            .font(.system(size: 16, weight: .semibold))
                                            .foregroundColor(.red)
                                        Spacer()
                                        Image(systemName: "chevron.right")
                                            .font(.system(size: 14))
                                            .foregroundColor(.mutedForeground)
                                    }
                                    .padding(AppSpacing.md)
                                    .background(Color.destructive.opacity(0.1))
                                    .cornerRadius(AppRadius.lg)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: AppRadius.lg)
                                            .stroke(Color.border, lineWidth: 1)
                                    )
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
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
        .appConfirmation(
            isPresented: $showLogoutConfirmation,
            title: "Sair da conta?",
            message: "Deseja realmente sair da sua conta de lojista?",
            primaryTitle: "Sair",
            primaryStyle: .destructive,
            primaryAction: { performLogout() },
            secondaryTitle: "Cancelar",
            secondaryAction: nil
        )
        .fullScreenCover(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView(onBack: { showPrivacyPolicy = false })
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
    private var settingsHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Configurações")
                .font(.appTitle)
                .foregroundColor(.heroForeground)
            Text("Ajustes e preferências")
                .font(.appCaption)
                .foregroundColor(.heroForegroundMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppSpacing.lg)
        .padding(.top, 0)
        .padding(.bottom, AppSpacing.md)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
    
    private func performLogout() {
        do {
            try Auth.auth().signOut()
            print("✅ [MerchantSettingsView] Logout realizado com sucesso")
        } catch {
            print("❌ [MerchantSettingsView] Erro ao fazer logout: \(error.localizedDescription)")
        }
        isLoggedIn = false
        isMerchant = false
        showMerchantLogin = true
    }
}

#Preview {
    MerchantSettingsView()
}
