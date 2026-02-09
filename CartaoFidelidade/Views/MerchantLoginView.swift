//
//  MerchantLoginView.swift
//  CartaoFidelidade
//
//  Tela de login do lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantLoginView: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    var onSuccess: (() -> Void)?
    
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var showDashboard = false
    @State private var errorMessage: String?
    
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
                            
                            if let msg = errorMessage {
                                Text(msg)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.destructive)
                                    .padding(.top, AppSpacing.sm)
                            }
                            
                            if let msg = errorMessage {
                                Text(msg)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.destructive)
                                    .padding(.top, AppSpacing.sm)
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
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty,
              !password.isEmpty else {
            errorMessage = "Preencha e-mail e senha"
            return
        }
        
        errorMessage = nil
        loading = true
        
        Task { @MainActor in
            do {
                let result = try await Auth.auth().signIn(
                    withEmail: email.trimmingCharacters(in: .whitespaces),
                    password: password
                )
                
                // Marcar como logado
                isLoggedIn = true
                
                // Verificar se o usuário tem role merchant (futuramente)
                // Por enquanto, apenas redireciona
                loading = false
                withAnimation {
                    showDashboard = true
                }
                onSuccess?()
            } catch {
                loading = false
                let nsError = error as NSError
                if nsError.domain == "FIRAuthErrorDomain" {
                    switch nsError.code {
                    case 17011: // user-not-found
                        errorMessage = "Usuário não encontrado. Crie uma conta primeiro."
                    case 17009: // wrong-password
                        errorMessage = "E-mail ou senha incorretos"
                    case 17008: // invalid-email
                        errorMessage = "E-mail inválido"
                    default:
                        errorMessage = "Erro ao fazer login: \(nsError.localizedDescription)"
                    }
                } else {
                    errorMessage = "Erro ao fazer login. Tente novamente."
                }
            }
        }
    }
}

#Preview {
    MerchantLoginView(onSuccess: { })
}
