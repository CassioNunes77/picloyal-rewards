//
//  MerchantLoginView.swift
//  CartaoFidelidade
//
//  Tela de login do lojista
//

import SwiftUI
import UIKit
import FirebaseAuth
import FirebaseFirestore

struct MerchantLoginView: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
    var onSuccess: (() -> Void)?
    
    @State private var email = ""
    @State private var password = ""
    @State private var loading = false
    @State private var showDashboard = false
    @State private var showSignUpForm = false
    @State private var errorMessage: String?
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            if showSignUpForm {
                // Formulário de cadastro direto
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
                            
                            Text("Crie sua conta para gerenciar sua loja")
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
                        
                        // Formulário de cadastro
                        MerchantSignUpView(
                            onSuccess: {
                                // Após criar conta, ir para o dashboard
                                print("🔄 [MerchantLoginView] onSuccess chamado, abrindo dashboard...")
                                // Ocultar teclado antes de navegar
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                                withAnimation(.easeInOut(duration: 0.3)) {
                                    showSignUpForm = false
                                    showDashboard = true
                                }
                                print("✅ [MerchantLoginView] Dashboard deve estar visível agora")
                            },
                            onCancel: {
                                // Ocultar teclado ao cancelar
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                                withAnimation {
                                    showSignUpForm = false
                                }
                            }
                        )
                        .padding(.top, 24)
                        .padding(.horizontal, 24)
                        .offset(y: -24)
                        .onTapGesture {
                            // Ocultar teclado ao tocar na área do formulário
                            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                        }
                    }
                }
                .scrollDismissesKeyboard(.interactively)
                .ignoresSafeArea(edges: .top)
            } else if showDashboard {
                MerchantDashboardView()
                    .transition(.slideFadeShort)
                    .onAppear {
                        print("✅ [MerchantLoginView] Dashboard do lojista aberto")
                    }
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
                            
                            // Botão Cadastre-se
                            Button(action: {
                                // Abrir formulário de cadastro diretamente
                                withAnimation {
                                    showSignUpForm = true
                                }
                            }) {
                                Text("Não tem conta lojista? Cadastre-se")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.primary)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, AppSpacing.md)
                            
                            // Botão Voltar
                            Button(action: {
                                dismiss()
                            }) {
                                Text("Voltar para o app")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.mutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.top, AppSpacing.sm)
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
                
                let userId = result.user.uid
                print("🔍 [MerchantLoginView] Verificando login de lojista para usuário: \(userId)")
                
                // Verificar se o usuário existe APENAS na coleção merchants
                // Esta é a validação principal: o login só é permitido se o usuário existir em merchants
                let roleService = UserRoleService.shared
                let isMerchantUser = try await roleService.isMerchant(userId: userId)
                
                // Se não for lojista (não existe em merchants), fazer logout e mostrar erro
                guard isMerchantUser else {
                    print("❌ [MerchantLoginView] Usuário \(userId) não encontrado na coleção 'merchants'. Login negado.")
                    // Se não for lojista, fazer logout e mostrar erro
                    try? Auth.auth().signOut()
                    errorMessage = "Esta conta não é de um lojista. Use o login de usuário comum."
                    loading = false
                    return
                }
                
                print("✅ [MerchantLoginView] Usuário \(userId) confirmado como lojista na coleção 'merchants'. Login permitido.")
                
                // Marcar como logado e como lojista
                isLoggedIn = true
                isMerchant = true
                
                print("✅ [MerchantLoginView] Usuário marcado como logado e como lojista")
                
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
