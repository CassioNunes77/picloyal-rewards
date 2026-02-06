//
//  LoginView.swift
//  CartaoFidelidade
//
//  Tela de login (estilo PINEE) – Cartão Fidelidade
//

import SwiftUI

struct LoginView: View {
    @Environment(\.dismiss) private var dismiss
    var onLogin: ((String, String, Bool) -> Void)?
    var onGoogleSignIn: (() -> Void)?
    var onDismiss: (() -> Void)?
    
    @State private var mode: LoginMode = .signin
    @State private var googleLoading = false
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var errorMessage: String?
    
    enum LoginMode {
        case signin
        case signup
    }
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 0) {
                    // Topo: gradiente + nome do app (estilo PINEE)
                    VStack(alignment: .leading, spacing: 0) {
                        Button(action: {
                            onDismiss?()
                            dismiss()
                        }) {
                            ZStack {
                                Circle()
                                    .fill(Color.white.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                Image(systemName: "chevron.left")
                                    .foregroundColor(.white)
                                    .font(.system(size: 20))
                            }
                        }
                        .padding(.bottom, AppSpacing.lg)
                        
                        Text("Cartão Fidelidade")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                        
                        Text("Seu cartão de benefícios e descontos")
                            .font(.appBody)
                            .foregroundColor(.white.opacity(0.9))
                            .padding(.top, AppSpacing.xs)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, 48)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.hero)
                    .cornerRadius(0)
                    
                    // Card branco central com formulário
                    VStack(alignment: .leading, spacing: AppSpacing.lg) {
                        Text(mode == .signin ? "Entrar" : "Criar conta")
                            .font(.appHeadline)
                            .foregroundColor(.cardForeground)
                        
                        Text(mode == .signin ? "Use seu e-mail e senha para acessar" : "Preencha os dados para se cadastrar")
                            .font(.appCaption)
                            .foregroundColor(.mutedForeground)
                            .padding(.bottom, AppSpacing.xs)
                        
                        // E-mail
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("E-mail")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.cardForeground)
                            HStack {
                                Image(systemName: "envelope.fill")
                                    .foregroundColor(.mutedForeground)
                                    .font(.system(size: 16))
                                TextField("seu@email.com", text: $email)
                                    .textContentType(.emailAddress)
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
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
                            HStack {
                                Text("Senha")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cardForeground)
                                Spacer()
                                if mode == .signin {
                                    Button("Esqueci minha senha") {
                                        // TODO: fluxo de recuperação
                                    }
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.primary)
                                }
                            }
                            HStack {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(.mutedForeground)
                                    .font(.system(size: 16))
                                SecureField("••••••••", text: $password)
                                    .textContentType(mode == .signin ? .password : .newPassword)
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
                                .font(.appCaption)
                                .foregroundColor(.destructive)
                        }
                        
                        // Botão Entrar / Criar conta (gradiente primary)
                        Button(action: submit) {
                            HStack {
                                if loading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .primaryForeground))
                                } else {
                                    Text(mode == .signin ? "Entrar" : "Criar conta")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.primaryForeground)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.lg)
                            .appShadow(AppShadow.md)
                        }
                        .disabled(loading || googleLoading || email.isEmpty || password.isEmpty)
                        .padding(.top, AppSpacing.sm)
                        
                        // Divisor "ou"
                        HStack {
                            Rectangle()
                                .fill(Color.border)
                                .frame(height: 1)
                            Text("ou")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.mutedForeground)
                                .textCase(.uppercase)
                            Rectangle()
                                .fill(Color.border)
                                .frame(height: 1)
                        }
                        .padding(.vertical, AppSpacing.md)
                        
                        // Botão Entrar com Google
                        Button(action: {
                            googleLoading = true
                            onGoogleSignIn?()
                            googleLoading = false
                        }) {
                            HStack(spacing: AppSpacing.sm) {
                                if googleLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .cardForeground))
                                } else {
                                    Image(systemName: "g.circle.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(.primary)
                                    Text("Entrar com Google")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.cardForeground)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 52)
                            .background(Color.appBackground)
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                        }
                        .disabled(loading || googleLoading)
                        .padding(.top, AppSpacing.xs)
                        
                        // Toggle Criar conta / Já tem conta
                        Button(action: {
                            errorMessage = nil
                            mode = mode == .signin ? .signup : .signin
                        }) {
                            Text(mode == .signin ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.top, AppSpacing.md)
                    }
                    .padding(AppSpacing.lg)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, AppSpacing.lg)
                    .offset(y: -AppSpacing.xl)
                }
            }
            .ignoresSafeArea(edges: .top)
        }
    }
    
    private func submit() {
        errorMessage = nil
        guard !email.trimmingCharacters(in: .whitespaces).isEmpty, !password.isEmpty else {
            errorMessage = "Preencha e-mail e senha."
            return
        }
        loading = true
        let isSignUp = mode == .signup
        onLogin?(email.trimmingCharacters(in: .whitespaces), password, isSignUp)
        loading = false
    }
}

#Preview {
    LoginView(
        onLogin: { _, _, _ in },
        onGoogleSignIn: {},
        onDismiss: {}
    )
}
