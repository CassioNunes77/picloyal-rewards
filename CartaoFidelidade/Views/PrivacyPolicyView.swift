//
//  PrivacyPolicyView.swift
//  CartaoFidelidade
//
//  Tela de exibição da Política de Privacidade (conteúdo centralizado no Firestore).
//

import SwiftUI

struct PrivacyPolicyView: View {
    var onBack: () -> Void

    @State private var text: String = ""
    @State private var loading = true
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Header
                VStack(spacing: AppSpacing.md) {
                    HStack {
                        Button(action: onBack) {
                            Image(systemName: "chevron.left.circle.fill")
                                .font(.system(size: 24))
                                .foregroundColor(.white)
                        }

                        Spacer()
                    }

                    HStack(spacing: AppSpacing.sm) {
                        Image(systemName: "shield.fill")
                            .font(.system(size: 28))
                            .foregroundColor(.white)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Política de Privacidade")
                                .font(.system(size: 22, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            Text("Core+")
                                .font(.system(size: 14))
                                .foregroundColor(.white.opacity(0.9))
                        }
                        Spacer()
                    }
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.top, AppSpacing.lg)
                .padding(.bottom, AppSpacing.xl)
                .frame(maxWidth: .infinity)
                .background(AppGradients.hero)

                // Content
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        if loading {
                            VStack(spacing: AppSpacing.lg) {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle(tint: .primary))
                                    .scaleEffect(1.2)
                                    .padding(.top, 32)
                                Text("Carregando...")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 48)
                        } else if let error = errorMessage {
                            Text(error)
                                .font(.system(size: 14))
                                .foregroundColor(.mutedForeground)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, AppSpacing.lg)
                                .padding(.vertical, 32)
                                .frame(maxWidth: .infinity)
                        } else {
                            Text(text)
                                .font(.system(size: 15))
                                .foregroundColor(.cardForeground)
                                .lineSpacing(6)
                                .padding(AppSpacing.lg)
                        }
                    }
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, -AppRadius.xl)
                    .padding(.bottom, AppSpacing.xl)
                }
            }
        }
        .navigationBarHidden(true)
        .task {
            await loadPolicy()
        }
    }

    private func loadPolicy() {
        loading = true
        errorMessage = nil
        Task {
            do {
                let data = try await ContentService.shared.getPrivacyPolicy()
                await MainActor.run {
                    text = data.text
                    loading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Não foi possível carregar a política de privacidade."
                    loading = false
                }
            }
        }
    }
}

#Preview {
    PrivacyPolicyView(onBack: {})
}
