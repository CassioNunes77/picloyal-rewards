//
//  MerchantDashboardView.swift
//  CartaoFidelidade
//
//  Painel do lojista com cadastro de loja
//

import SwiftUI

struct MerchantDashboardView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var showStoreForm = false
    
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
                        if !showStoreForm {
                            // Estado inicial - botão para cadastrar
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
                        } else {
                            // Formulário de cadastro
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
    }
}

#Preview {
    MerchantDashboardView()
}
