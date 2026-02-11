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
    @State private var splashAnimated = false
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
            // Logo Core+ centralizado com animação
            Image("CorePlusLogo")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(maxWidth: 280, maxHeight: 280)
                .scaleEffect(splashAnimated ? 1.0 : 0.3)
                .opacity(splashAnimated ? 1.0 : 0.0)
                .animation(
                    .spring(response: 0.8, dampingFraction: 0.6)
                    .delay(0.1),
                    value: splashAnimated
                )
                .padding(.bottom, AppSpacing.sm)
            Text("Seu clube de benefícios")
                .font(.system(size: 16, weight: .regular, design: .rounded))
                .foregroundColor(.white.opacity(0.9))
                .multilineTextAlignment(.center)
                .opacity(splashAnimated ? 1.0 : 0.0)
                .offset(y: splashAnimated ? 0 : 20)
                .animation(
                    .easeOut(duration: 0.6)
                    .delay(0.4),
                    value: splashAnimated
                )
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, AppSpacing.lg)
        .background(AppGradients.hero)
        .ignoresSafeArea()
        .onAppear {
            // Iniciar animação quando a view aparecer
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                withAnimation {
                    splashAnimated = true
                }
            }
        }
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
        
        Task { @MainActor in
            do {
                let isSignUp = mode == .signup
                
                if isSignUp {
                    // Criar conta de usuário comum
                    let result = try await Auth.auth().createUser(withEmail: email.trimmingCharacters(in: .whitespaces), password: password)
                    // Verificar se não é lojista tentando criar conta de usuário comum
                    try await validateUserRole(userId: result.user.uid, isSignUp: true)
                } else {
                    // Fazer login de usuário comum
                    let result = try await Auth.auth().signIn(withEmail: email.trimmingCharacters(in: .whitespaces), password: password)
                    // Verificar se é realmente um usuário comum (existe em users, não existe em merchants)
                    try await validateUserRole(userId: result.user.uid, isSignUp: false)
                }
                
                // Se chegou aqui, o role está correto
                onLogin?(email.trimmingCharacters(in: .whitespaces), password, isSignUp)
                onSuccess?()
                loading = false
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
                    case 17007: // email-already-in-use
                        errorMessage = "Este e-mail já está em uso"
                    default:
                        errorMessage = "Erro ao fazer login: \(nsError.localizedDescription)"
                    }
                } else if nsError.domain == "UserRoleValidation" {
                    errorMessage = nsError.localizedDescription
                } else {
                    errorMessage = "Erro ao fazer login. Tente novamente."
                }
            }
        }
    }
    
    private func validateUserRole(userId: String, isSignUp: Bool) async throws {
        let roleService = UserRoleService.shared
        let db = Firestore.firestore()
        
        // Verificar se é lojista (existe em merchants)
        let isMerchantUser = try await roleService.isMerchant(userId: userId)
        
        if isMerchantUser {
            // Se for lojista tentando fazer login como usuário comum, bloquear
            try? Auth.auth().signOut()
            throw NSError(domain: "UserRoleValidation", code: 1, userInfo: [NSLocalizedDescriptionKey: "Esta conta é de um lojista. Use o login do painel do lojista."])
        }
        
        if isSignUp {
            // Ao criar conta, criar documento APENAS em users
            if let user = Auth.auth().currentUser {
                let userRef = db.collection("users").document(userId)
                try await userRef.setData([
                    "uid": userId,
                    "email": user.email ?? "",
                    "displayName": user.displayName ?? "",
                    "photoURL": user.photoURL?.absoluteString ?? "",
                    "phoneNumber": user.phoneNumber ?? "",
                    "createdAt": Timestamp(),
                    "updatedAt": Timestamp(),
                    "lastLoginAt": Timestamp()
                ])
                print("✅ [LoginView] Documento de usuário criado no Firestore")
            }
        } else {
            // Ao fazer login, verificar se existe em users
            let isRegularUser = try await roleService.isUser(userId: userId)
            
            if !isRegularUser {
                // Tentando fazer login mas não existe em users
                try? Auth.auth().signOut()
                throw NSError(domain: "UserRoleValidation", code: 2, userInfo: [NSLocalizedDescriptionKey: "Conta não encontrada. Crie uma conta primeiro."])
            }
        }
    }
    
    private func performAppleSignIn() {
        errorMessage = nil
        appleLoading = true
        Task { @MainActor in
            defer { appleLoading = false }
            let helper = AppleSignInHelper()
            do {
                let result = try await helper.signIn()
                
                // Verificar role após login com Apple
                if let user = Auth.auth().currentUser {
                    try await validateUserRole(userId: user.uid, isSignUp: false)
                }
                
                onAppleSignIn?(result)
                onSuccess?()
            } catch is CancellationError {
                // usuário cancelou
            } catch {
                let nsError = error as NSError
                if nsError.domain == "UserRoleValidation" {
                    errorMessage = nsError.localizedDescription
                } else {
                    errorMessage = error.localizedDescription
                }
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
                
                // Verificar role após login com Google
                if let user = Auth.auth().currentUser {
                    try await validateUserRole(userId: user.uid, isSignUp: false)
                }
                
                onSuccess?()
            } catch {
                let nsError = error as NSError
                if nsError.domain == "UserRoleValidation" {
                    errorMessage = nsError.localizedDescription
                } else {
                    errorMessage = error.localizedDescription
                }
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
