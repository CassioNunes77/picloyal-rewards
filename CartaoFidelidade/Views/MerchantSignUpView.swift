//
//  MerchantSignUpView.swift
//  CartaoFidelidade
//
//  Formulário de cadastro de conta de lojista
//

import SwiftUI
import FirebaseAuth

struct MerchantSignUpView: View {
    var onSuccess: () -> Void
    var onCancel: () -> Void
    
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var displayName = ""
    @State private var loading = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.lg) {
            // Header
            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                Text("Criar Conta de Lojista")
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                    .foregroundColor(.cardForeground)
                
                Text("Crie sua conta para gerenciar sua loja no Core+")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.mutedForeground)
            }
            
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    // Nome
                    FormField(
                        label: "Nome",
                        icon: "person.fill",
                        isRequired: false,
                        content: {
                            TextField("Seu nome", text: $displayName)
                                .textContentType(.name)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // E-mail
                    FormField(
                        label: "E-mail",
                        icon: "envelope.fill",
                        isRequired: true,
                        content: {
                            TextField("seu@email.com", text: $email)
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Senha
                    FormField(
                        label: "Senha",
                        icon: "lock.fill",
                        isRequired: true,
                        content: {
                            SecureField("Mínimo 6 caracteres", text: $password)
                                .textContentType(.newPassword)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Confirmar Senha
                    FormField(
                        label: "Confirmar Senha",
                        icon: "lock.fill",
                        isRequired: true,
                        content: {
                            SecureField("Digite a senha novamente", text: $confirmPassword)
                                .textContentType(.newPassword)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    if let msg = errorMessage {
                        Text(msg)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.destructive)
                            .padding(.top, AppSpacing.sm)
                    }
                    
                    // Botões
                    HStack(spacing: AppSpacing.md) {
                        Button(action: onCancel) {
                            Text("Cancelar")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.cardForeground)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        }
                        .background(Color.appBackground)
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .disabled(loading)
                        
                        Button(action: submit) {
                            Group {
                                if loading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .primaryForeground))
                                } else {
                                    Text("Criar Conta")
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
                        .disabled(loading || !isFormValid)
                    }
                    .padding(.top, AppSpacing.lg)
                }
            }
        }
        .padding(AppSpacing.lg)
        .background(Color.card)
        .cornerRadius(24)
        .appShadow(AppShadow.lg)
    }
    
    private var isFormValid: Bool {
        !email.trimmingCharacters(in: .whitespaces).isEmpty &&
        !password.isEmpty &&
        password.count >= 6 &&
        password == confirmPassword
    }
    
    private func submit() {
        guard isFormValid else {
            if password.count < 6 {
                errorMessage = "A senha deve ter pelo menos 6 caracteres"
            } else if password != confirmPassword {
                errorMessage = "As senhas não coincidem"
            } else {
                errorMessage = "Preencha todos os campos obrigatórios"
            }
            return
        }
        
        errorMessage = nil
        loading = true
        
        Task { @MainActor in
            do {
                // Criar conta no Firebase Auth
                let userCredential = try await Auth.auth().createUser(
                    withEmail: email.trimmingCharacters(in: .whitespaces),
                    password: password
                )
                
                // Atualizar displayName se fornecido
                if !displayName.trimmingCharacters(in: .whitespaces).isEmpty {
                    let changeRequest = userCredential.user.createProfileChangeRequest()
                    changeRequest.displayName = displayName.trimmingCharacters(in: .whitespaces)
                    try await changeRequest.commitChanges()
                }
                
                // Criar documento no Firestore (futuramente usar merchantsService)
                // Por enquanto, apenas sucesso
                loading = false
                onSuccess()
            } catch {
                loading = false
                let nsError = error as NSError
                if nsError.domain == "FIRAuthErrorDomain" {
                    switch nsError.code {
                    case 17007: // email-already-in-use
                        errorMessage = "Este e-mail já está em uso"
                    case 17008: // invalid-email
                        errorMessage = "E-mail inválido"
                    case 17026: // weak-password
                        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres"
                    default:
                        errorMessage = "Erro ao criar conta: \(nsError.localizedDescription)"
                    }
                } else {
                    errorMessage = "Erro ao criar conta. Tente novamente."
                }
            }
        }
    }
}

#Preview {
    MerchantSignUpView(onSuccess: { }, onCancel: { })
}
