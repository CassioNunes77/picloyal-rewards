//
//  LoginView.swift
//  CartaoFidelidade
//
//  Tela de login alinhada ao padrão visual da web (splash + hero + card)
//

import SwiftUI
import UIKit

struct LoginView: View {
    @Environment(\.dismiss) private var dismiss
    var onLogin: ((String, String, Bool) -> Void)?
    var onAppleSignIn: ((AppleSignInResult) -> Void)?
    var onGoogleSignIn: (() async throws -> Void)?
    var onSuccess: (() -> Void)?
    var onDismiss: (() -> Void)?
    
    @State private var showMerchantLogin = false
    
    private let splashDuration: Double = 1.8
    
    @State private var splashDone = false
    @State private var mode: LoginMode = .signin
    @State private var appleLoading = false
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
            
            if !splashDone {
                splashView
            } else {
                formView
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + splashDuration) {
                withAnimation(.easeInOut(duration: 0.3)) {
                    splashDone = true
                }
            }
        }
    }
    
    // MARK: - Splash (tela cheia gradiente + logo + título, igual à web)
    private var splashView: some View {
        VStack(spacing: 0) {
            Spacer()
            // Logo Core+ centralizado
            Image("CorePlusLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(maxWidth: 200, maxHeight: 200)
                .padding(.bottom, AppSpacing.lg)
            Text("Core+")
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            Text("Seu cartão de benefícios e descontos")
                .font(.system(size: 16, weight: .regular, design: .rounded))
                .foregroundColor(.white.opacity(0.9))
                .padding(.top, 12)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, AppSpacing.lg)
        .background(AppGradients.hero)
        .ignoresSafeArea()
    }
    
    // MARK: - Form (hero com cantos inferiores arredondados + card branco)
    private var formView: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Hero: gradiente + nome do app (cantos inferiores arredondados, como na web)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Core+")
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("Seu cartão de benefícios e descontos")
                        .font(.system(size: 16, weight: .regular, design: .rounded))
                        .foregroundColor(.white.opacity(0.9))
                        .padding(.top, 8)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)
                .padding(.top, 56)
                .padding(.bottom, 48)
                .background(
                    AppGradients.hero
                        .clipShape(BottomRoundedShape(radius: 32))
                )
                
                // Card branco central (sobreposição -mt-6 como na web)
                VStack(alignment: .leading, spacing: AppSpacing.lg) {
                    Text(mode == .signin ? "Entrar" : "Criar conta")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.cardForeground)
                    
                    if mode == .signin {
                        // Botão Entrar com Apple (estilo outline, alinhado ao Google)
                        Button(action: performAppleSignIn) {
                            HStack(spacing: AppSpacing.sm) {
                                if appleLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .cardForeground))
                                } else {
                                    Image(systemName: "apple.logo")
                                        .font(.system(size: 20, weight: .semibold))
                                        .foregroundColor(.cardForeground)
                                    Text("Entrar com Apple")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.cardForeground)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                        }
                        .background(Color.appBackground)
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .disabled(loading || appleLoading || googleLoading)
                        
                        // Botão Entrar com Google
                        Button(action: performGoogleSignIn) {
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
                            .frame(height: 48)
                        }
                        .background(Color.appBackground)
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .disabled(loading || appleLoading || googleLoading)
                        .padding(.top, 4)
                        
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
                        .padding(.top, 16)
                        .padding(.bottom, 8)
                    }
                    
                    // Via E-mail e Senha (mais próximos)
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("E-mail")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.cardForeground)
                            HStack(spacing: 12) {
                                Image(systemName: "envelope.fill")
                                    .foregroundColor(.mutedForeground)
                                    .font(.system(size: 16))
                                TextField("", text: $email)
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
                        
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            HStack {
                                Text("Senha")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cardForeground)
                                Spacer()
                                if mode == .signin {
                                    Button("Esqueci minha senha") {}
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.primary)
                                }
                            }
                            HStack(spacing: 12) {
                                Image(systemName: "lock.fill")
                                    .foregroundColor(.mutedForeground)
                                    .font(.system(size: 16))
                                SecureField("••••••••", text: $password)
                                    .textContentType(mode == .signin ? .password : .newPassword)
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
                    }
                    
                    if let msg = errorMessage {
                        Text(msg)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.destructive)
                    }
                    
                    // Botão Entrar / Criar conta (via e-mail)
                    Button(action: submit) {
                        Group {
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
                        .frame(height: 48)
                    }
                    .background(AppGradients.primary)
                    .cornerRadius(AppRadius.lg)
                    .appShadow(AppShadow.md)
                    .disabled(loading || appleLoading || googleLoading || email.isEmpty || password.isEmpty)
                    .padding(.top, AppSpacing.sm)
                    
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
                    
                    // Entrar como Lojista
                    Button(action: {
                        showMerchantLogin = true
                    }) {
                        Text("Entrar como Lojista")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.mutedForeground)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.top, AppSpacing.sm)
                    .sheet(isPresented: $showMerchantLogin) {
                        MerchantLoginView(onSuccess: {
                            showMerchantLogin = false
                        })
                    }
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
        .onTapGesture {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
        .ignoresSafeArea(edges: .top)
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
        onSuccess?()
        loading = false
    }
    
    private func performAppleSignIn() {
        errorMessage = nil
        appleLoading = true
        Task { @MainActor in
            defer { appleLoading = false }
            let helper = AppleSignInHelper()
            do {
                let result = try await helper.signIn()
                onAppleSignIn?(result)
                onSuccess?()
            } catch is CancellationError {
                // usuário cancelou
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
    
    private func performGoogleSignIn() {
        errorMessage = nil
        googleLoading = true
        Task { @MainActor in
            defer { googleLoading = false }
            do {
                try await onGoogleSignIn?()
                onSuccess?()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}

#Preview {
    LoginView(
        onLogin: { _, _, _ in },
        onAppleSignIn: { _ in },
        onGoogleSignIn: { },
        onSuccess: { },
        onDismiss: { }
    )
}
