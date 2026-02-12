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
    
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @State private var showLogoutConfirmation = false
    @State private var showPrivacyPolicy = false
    
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
                            Text("Configurações")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Ajustes e preferências")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.primary)
                    
                    // Opções de configuração
                    VStack(spacing: AppSpacing.md) {
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
                            .background(Color.card)
                            .cornerRadius(AppRadius.lg)
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
                                .background(Color.card)
                                .cornerRadius(AppRadius.lg)
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .offset(y: -AppRadius.xl)
                }
            }
        }
        .alert("Sair da conta?", isPresented: $showLogoutConfirmation) {
            Button("Cancelar", role: .cancel) {}
            Button("Sair", role: .destructive) {
                performLogout()
            }
        } message: {
            Text("Deseja realmente sair da sua conta de lojista?")
        }
        .fullScreenCover(isPresented: $showPrivacyPolicy) {
            PrivacyPolicyView(onBack: { showPrivacyPolicy = false })
        }
    }
    
    private func performLogout() {
        do {
            try Auth.auth().signOut()
            print("✅ [MerchantSettingsView] Logout realizado com sucesso")
        } catch {
            print("❌ [MerchantSettingsView] Erro ao fazer logout: \(error.localizedDescription)")
        }
    }
}

#Preview {
    MerchantSettingsView()
}
