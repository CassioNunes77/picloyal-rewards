//
//  MerchantSettingsView.swift
//  CartaoFidelidade
//
//  View de configurações do lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantSettingsView: View {
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
    @State private var notifications = true
    @State private var showLogoutConfirmation = false
    
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
                            Text("Configurações")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Gerencie suas preferências")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.primary)
                    
                    // Configurações
                    VStack(spacing: AppSpacing.md) {
                        // Notificações
                        HStack(spacing: AppSpacing.md) {
                            Image(systemName: "bell.fill")
                                .font(.system(size: 20))
                                .foregroundColor(.primary)
                                .frame(width: 40, height: 40)
                                .background(Color.primary.opacity(0.1))
                                .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Notificações")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.cardForeground)
                                
                                Text("Receber alertas e notificações")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                            }
                            
                            Spacer()
                            
                            Toggle("", isOn: $notifications)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.lg)
                        .appShadow(AppShadow.sm)
                        
                        // Segurança
                        HStack(spacing: AppSpacing.md) {
                            Image(systemName: "shield.fill")
                                .font(.system(size: 20))
                                .foregroundColor(.primary)
                                .frame(width: 40, height: 40)
                                .background(Color.primary.opacity(0.1))
                                .clipShape(Circle())
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Segurança")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.cardForeground)
                                
                                Text("Alterar senha e configurações de segurança")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                            }
                            
                            Spacer()
                        }
                        .padding(AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.lg)
                        .appShadow(AppShadow.sm)
                        
                        // Logout
                        Button(action: {
                            showLogoutConfirmation = true
                        }) {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "arrow.right.square.fill")
                                    .font(.system(size: 20))
                                
                                Text("Sair da Conta")
                                    .font(.system(size: 16, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                        }
                        .background(Color.red)
                        .cornerRadius(AppRadius.lg)
                        .appShadow(AppShadow.sm)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, -AppRadius.xl)
                }
            }
        }
        .alert("Sair da conta?", isPresented: $showLogoutConfirmation) {
            Button("Cancelar", role: .cancel) { }
            Button("Sair", role: .destructive) {
                handleLogout()
            }
        } message: {
            Text("Deseja realmente sair da sua conta de lojista? Você precisará fazer login novamente para acessar o painel.")
        }
    }
    
    private func handleLogout() {
        do {
            try Auth.auth().signOut()
            isLoggedIn = false
            isMerchant = false
        } catch {
            print("❌ [MerchantSettingsView] Erro ao fazer logout: \(error.localizedDescription)")
        }
    }
}

#Preview {
    MerchantSettingsView()
}
