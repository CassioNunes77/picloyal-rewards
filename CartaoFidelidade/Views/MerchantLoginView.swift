//
//  MerchantLoginView.swift
//  CartaoFidelidade
//
//  Tela de login do lojista
//

import SwiftUI

struct MerchantLoginView: View {
    @Environment(\.dismiss) private var dismiss
    var onSuccess: (() -> Void)?
    
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var showDashboard = false
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            if showDashboard {
                MerchantDashboardView()
                    .transition(.slideFadeShort)
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        // Hero: gradiente + título
                        VStack(alignment: .leading, spacing: 0) {
                            HStack {
                                Spacer()
                                Image(systemName: "storefront.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.white)
                                Spacer()
                            }
                            .padding(.top, 56)
                            .padding(.bottom, 16)
                            
                            Text("Painel do Lojista")
                                .font(.system(size: 28, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Gerencie sua loja e clientes")
                                .font(.system(size: 16, weight: .regular, design: .rounded))
                                .foregroundColor(.white.opacity(0.9))
                                .padding(.top, 8)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 48)
                        .background(
                            AppGradients.hero
                                .clipShape(BottomRoundedShape(radius: 32))
                        )
                        
                        // Card branco central
                        VStack(alignment: .leading, spacing: AppSpacing.lg) {
                            Text("Entrar")
                                .font(.system(size: 20, weight: .semibold, design: .rounded))
                                .foregroundColor(.cardForeground)
                            
                            Text("Use seu e-mail e senha para acessar")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.mutedForeground)
                                .padding(.bottom, AppSpacing.sm)
                            
                            // E-mail
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("E-mail")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cardForeground)
                                HStack(spacing: 12) {
                                    Image(systemName: "envelope.fill")
                                        .foregroundColor(.mutedForeground)
                                        .font(.system(size: 16))
                                    TextField("seu@email.com", text: $email)
                                        .textContentType(.emailAddress)
                                        .keyboardType(.emailAddress)
                                        .autocapitalization(.none)
                                        .foregroundColor(.cardForeground)
                                        .disabled(loading)
                                }
                                .padding(AppSpacing.md)
                                .background(Color.appBackground)
                                .cornerRadius(AppRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.lg)
                                        .stroke(Color.border, lineWidth: 1)
                                )
                            }
                            
                            // Senha
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("Senha")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cardForeground)
                                HStack(spacing: 12) {
                                    Image(systemName: "lock.fill")
                                        .foregroundColor(.mutedForeground)
                                        .font(.system(size: 16))
                                    SecureField("••••••••", text: $password)
                                        .textContentType(.password)
                                        .foregroundColor(.cardForeground)
                                        .disabled(loading)
                                }
                                .padding(AppSpacing.md)
                                .background(Color.appBackground)
                                .cornerRadius(AppRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.lg)
                                        .stroke(Color.border, lineWidth: 1)
                                )
                            }
                            
                            // Botão Entrar
                            Button(action: submit) {
                                Group {
                                    if loading {
                                        ProgressView()
                                            .progressViewStyle(CircularProgressViewStyle(tint: .primaryForeground))
                                    } else {
                                        Text("Entrar")
                                            .font(.system(size: 16, weight: .semibold))
                                            .foregroundColor(.primaryForeground)
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                            }
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.lg)
                            .appShadow(AppShadow.md)
                            .disabled(loading || email.isEmpty || password.isEmpty)
                            .padding(.top, AppSpacing.sm)
                            
                            // Botão Voltar
                            Button(action: {
                                dismiss()
                            }) {
                                Text("Voltar para o app")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.mutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, AppSpacing.md)
                        }
                        .padding(AppSpacing.lg)
                        .background(Color.card)
                        .cornerRadius(24)
                        .appShadow(AppShadow.lg)
                        .padding(.horizontal, 24)
                        .offset(y: -24)
                    }
                }
                .scrollDismissesKeyboard(.interactively)
                .ignoresSafeArea(edges: .top)
            }
        }
    }
    
    private func submit() {
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty, !password.isEmpty else {
            return
        }
        loading = true
        // Por enquanto, apenas abre o dashboard
        // Futuramente implementar autenticação
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            loading = false
            withAnimation {
                showDashboard = true
            }
        }
    }
}

#Preview {
    MerchantLoginView(onSuccess: { })
}
