//
//  OfferDetailView.swift
//  CartaoFidelidade
//
//  Tela de detalhes da oferta (apresentada em sheet a partir de Ofertas ou Detalhes da Loja).
//

import SwiftUI

struct OfferDetailView: View {
    let offer: Offer
    /// Nome da loja quando aberto a partir de Detalhes da Loja (sobrescreve offer.storeName se necessário).
    var storeNameOverride: String?
    let onUseOffer: () -> Void
    let onDismiss: () -> Void

    private var displayStoreName: String {
        storeNameOverride ?? offer.storeName
    }

    private var iconGradient: LinearGradient {
        switch offer.icon {
        case "cup.and.saucer.fill":
            return AppGradients.primary
        case "birthday.cake.fill":
            return LinearGradient(colors: [Color.orange], startPoint: .topLeading, endPoint: .bottomTrailing)
        case "gift.fill":
            return AppGradients.secondary
        default:
            return LinearGradient(colors: [Color.blue], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                // Card principal - similar à versão WEB
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    // Header com ícone e título/desconto
                    HStack(alignment: .top, spacing: AppSpacing.md) {
                        // Ícone
                        ZStack {
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .fill(iconGradient)
                                .frame(width: 64, height: 64)
                            Image(systemName: offer.icon)
                                .foregroundColor(.white)
                                .font(.system(size: 32))
                        }
                        
                        // Título e desconto
                        VStack(alignment: .leading, spacing: AppSpacing.xs) {
                            HStack(alignment: .top, spacing: AppSpacing.sm) {
                                Text(offer.title)
                                    .font(.appHeadline)
                                    .foregroundColor(.cardForeground)
                                    .lineLimit(2)
                                
                                if offer.isNew {
                                    Text("NOVO")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(.destructiveForeground)
                                        .padding(.horizontal, AppSpacing.sm)
                                        .padding(.vertical, 2)
                                        .background(Color.destructive)
                                        .cornerRadius(AppRadius.sm)
                                }
                            }
                            
                            Text(offer.discount)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.secondaryForeground)
                                .padding(.horizontal, AppSpacing.md)
                                .padding(.vertical, AppSpacing.sm)
                                .background(AppGradients.secondary)
                                .cornerRadius(AppRadius.md)
                        }
                        
                        Spacer()
                    }
                    .padding(.bottom, AppSpacing.sm)

                    // Descrição
                    Text(offer.description)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                        .padding(.bottom, AppSpacing.sm)

                    // Informações adicionais
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        // Validade
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "clock")
                                .font(.system(size: 14))
                                .foregroundColor(.mutedForeground)
                            Text("Válido até \(offer.validUntil)")
                                .font(.appCaption)
                                .foregroundColor(.mutedForeground)
                        }
                        
                        // Nome da loja
                        if !displayStoreName.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "mappin")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                                Text(displayStoreName)
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                        }
                        
                        // Endereço da loja (indentado, sem ícone)
                        if !offer.storeAddress.isEmpty {
                            Text(offer.storeAddress)
                                .font(.appCaption)
                                .foregroundColor(.mutedForeground)
                                .padding(.leading, 24)
                        }
                        
                        // Pontos necessários
                        if let points = offer.pointsRequired {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "sparkles")
                                    .font(.system(size: 14))
                                    .foregroundColor(.accentForeground)
                                Text("\(points) pontos necessários")
                                    .font(.appCaption)
                                    .foregroundColor(.accentForeground)
                            }
                        }
                    }
                }
                .padding(AppSpacing.lg)
                .background(Color.card)
                .cornerRadius(AppRadius.xl)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.xl)
                        .stroke(Color.primary.opacity(0.1), lineWidth: 1)
                )
                .appShadow(AppShadow.lg)

                // Botão Usar oferta
                Button(action: {
                    onUseOffer()
                    onDismiss()
                }) {
                    Text("Usar oferta")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.primaryForeground)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppSpacing.md)
                        .background(AppGradients.primary)
                        .cornerRadius(AppRadius.lg)
                        .appShadow(AppShadow.md)
                }
                .buttonStyle(PlainButtonStyle())

                // Texto informativo
                Text("Apresente esta tela ou o cupom ativado no estabelecimento")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
                    .frame(maxWidth: .infinity)
                    .multilineTextAlignment(.center)
            }
            .padding(AppSpacing.lg)
        }
        .background(Color.appBackground)
        .navigationTitle("Detalhes da Oferta")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("Fechar") {
                    onDismiss()
                }
            }
        }
    }
}

#Preview {
    OfferDetailView(
        offer: Offer(
            id: "1",
            title: "20% OFF em Bebidas",
            description: "Desconto em todas as bebidas do cardápio",
            discount: "20%",
            storeName: "Café Central",
            storeAddress: "Rua das Flores, 123",
            validUntil: "31/12/2024",
            icon: "cup.and.saucer.fill",
            category: "bebidas",
            pointsRequired: nil,
            isNew: true
        ),
        storeNameOverride: nil,
        onUseOffer: {},
        onDismiss: {}
    )
}
