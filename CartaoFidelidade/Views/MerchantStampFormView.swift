//
//  MerchantStampFormView.swift
//  CartaoFidelidade
//
//  Formulário para criar programa de carimbo
//

import SwiftUI
import FirebaseAuth

struct MerchantStampFormView: View {
    let storeId: String
    let merchantId: String
    var onCancel: () -> Void
    var onSuccess: () -> Void
    
    @State private var totalStamps = "10"
    @State private var rewardTitle = ""
    @State private var loading = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                Text("Novo Carimbo")
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundColor(.cardForeground)
                Spacer()
                Button(action: onCancel) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.mutedForeground)
                }
            }
            
            FormField(
                label: "Quantidade de carimbos para ganhar",
                icon: "star.fill",
                isRequired: true,
                content: {
                    TextField("Ex: 10", text: $totalStamps)
                        .keyboardType(.numberPad)
                        .foregroundColor(.cardForeground)
                        .disabled(loading)
                }
            )
            
            FormField(
                label: "Recompensa ao completar",
                icon: "gift.fill",
                isRequired: true,
                content: {
                    TextField("Ex: 1 Café Grátis", text: $rewardTitle)
                        .foregroundColor(.cardForeground)
                        .disabled(loading)
                }
            )
            
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
                .overlay(RoundedRectangle(cornerRadius: AppRadius.lg).stroke(Color.border, lineWidth: 1))
                .disabled(loading)
                
                Button(action: submit) {
                    Group {
                        if loading {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .primaryForeground))
                        } else {
                            Text("Criar Carimbo")
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
        .padding(AppSpacing.lg)
        .background(Color.card)
        .cornerRadius(AppRadius.xl)
        .appShadow(AppShadow.lg)
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro ao criar carimbo",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    private var isFormValid: Bool {
        guard let n = Int(totalStamps), n >= 2, n <= 100 else { return false }
        return !rewardTitle.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func submit() {
        guard isFormValid else { return }
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            errorMessage = "Usuário não autenticado"
            showError = true
            return
        }
        guard let stamps = Int(totalStamps), stamps >= 2, stamps <= 100 else {
            errorMessage = "Informe entre 2 e 100 carimbos"
            showError = true
            return
        }
        
        loading = true
        errorMessage = nil
        
        Task {
            do {
                _ = try await StampRewardsService.shared.createStampReward(
                    storeId: storeId,
                    merchantId: merchantId,
                    totalStamps: stamps,
                    rewardTitle: rewardTitle.trimmingCharacters(in: .whitespaces)
                )
                await MainActor.run {
                    loading = false
                    onSuccess()
                }
            } catch {
                await MainActor.run {
                    loading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}
