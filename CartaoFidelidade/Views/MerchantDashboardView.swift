//
//  MerchantDashboardView.swift
//  CartaoFidelidade
//
//  Painel do lojista com cadastro de loja
//

import SwiftUI
import FirebaseAuth

struct MerchantDashboardView: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""
    @State private var showStoreForm = false
    @State private var showSignUpForm = false
    @State private var showLogoutConfirmation = false
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 0) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Painel do Lojista")
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Gerencie sua loja e clientes")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                        
                        Spacer()
                        
                        // Botão Sair da Conta (se estiver logado)
                        if isLoggedIn {
                            Button(action: {
                                showLogoutConfirmation = true
                            }) {
                                Image(systemName: "arrow.right.square.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.white.opacity(0.8))
                            }
                            .padding(.trailing, 8)
                        }
                        
                        Button(action: {
                            dismiss()
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.white.opacity(0.8))
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 56)
                    .padding(.bottom, 32)
                }
                .frame(maxWidth: .infinity)
                .background(AppGradients.hero)
                
                // Content
                ScrollView {
                    VStack(spacing: 0) {
                        if showSignUpForm {
                            // Formulário de cadastro de conta
                            MerchantSignUpView(
                                onSuccess: {
                                    withAnimation {
                                        showSignUpForm = false
                                    }
                                    dismiss()
                                },
                                onCancel: {
                                    withAnimation {
                                        showSignUpForm = false
                                    }
                                }
                            )
                            .padding(.top, 24)
                        } else if !showStoreForm {
                            // Estado inicial
                            if !isLoggedIn {
                                // Não está logado - mostrar opção de criar conta
                                VStack(spacing: AppSpacing.lg) {
                                    Image(systemName: "person.badge.plus.fill")
                                        .font(.system(size: 64))
                                        .foregroundColor(.mutedForeground)
                                        .padding(.top, 48)
                                    
                                    Text("Crie sua conta de lojista")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.cardForeground)
                                    
                                    Text("Cadastre seu e-mail e senha para começar a gerenciar sua loja")
                                        .font(.system(size: 14, weight: .regular))
                                        .foregroundColor(.mutedForeground)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, AppSpacing.lg)
                                    
                                    Button(action: {
                                        withAnimation {
                                            showSignUpForm = true
                                        }
                                    }) {
                                        HStack(spacing: AppSpacing.sm) {
                                            Image(systemName: "person.badge.plus.fill")
                                                .font(.system(size: 18))
                                            Text("Criar Conta")
                                                .font(.system(size: 16, weight: .semibold))
                                        }
                                        .foregroundColor(.primaryForeground)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 48)
                                    }
                                    .background(AppGradients.primary)
                                    .cornerRadius(AppRadius.lg)
                                    .appShadow(AppShadow.md)
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.top, AppSpacing.md)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 48)
                            } else {
                                // Está logado - mostrar opção de cadastrar loja
                                VStack(spacing: AppSpacing.lg) {
                                    Image(systemName: "storefront.fill")
                                        .font(.system(size: 64))
                                        .foregroundColor(.mutedForeground)
                                        .padding(.top, 48)
                                    
                                    Text("Cadastre sua loja")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.cardForeground)
                                    
                                    Text("Preencha os dados da sua loja para começar a usar o Core+")
                                        .font(.system(size: 14, weight: .regular))
                                        .foregroundColor(.mutedForeground)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, AppSpacing.lg)
                                    
                                    Button(action: {
                                        withAnimation {
                                            showStoreForm = true
                                        }
                                    }) {
                                        HStack(spacing: AppSpacing.sm) {
                                            Image(systemName: "plus.circle.fill")
                                                .font(.system(size: 18))
                                            Text("Cadastrar Loja")
                                                .font(.system(size: 16, weight: .semibold))
                                        }
                                        .foregroundColor(.primaryForeground)
                                        .frame(maxWidth: .infinity)
                                        .frame(height: 48)
                                    }
                                    .background(AppGradients.primary)
                                    .cornerRadius(AppRadius.lg)
                                    .appShadow(AppShadow.md)
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.top, AppSpacing.md)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 48)
                            }
                        } else {
                            // Formulário de cadastro de loja
                            MerchantStoreFormView(
                                onCancel: {
                                    withAnimation {
                                        showStoreForm = false
                                    }
                                },
                                onSuccess: {
                                    withAnimation {
                                        showStoreForm = false
                                    }
                                }
                            )
                            .padding(.top, 24)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, -24)
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
    }
    
    private func performLogout() {
        do {
            try Auth.auth().signOut()
            print("✅ [MerchantDashboardView] Logout realizado com sucesso")
        } catch {
            print("❌ [MerchantDashboardView] Erro ao fazer logout: \(error.localizedDescription)")
        }
        
        // Limpar dados do usuário
        userDisplayName = ""
        userEmail = ""
        userPhotoURL = ""
        isLoggedIn = false
        isMerchant = false
        
        print("✅ [MerchantDashboardView] Dados do usuário limpos, redirecionando para login")
    }
}

#Preview {
    MerchantDashboardView()
}
