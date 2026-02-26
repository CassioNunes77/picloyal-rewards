//
//  OfferDetailView.swift
//  CartaoFidelidade
//
//  Tela de detalhes da oferta (apresentada em sheet a partir de Ofertas ou Detalhes da Loja).
//

import SwiftUI
import FirebaseAuth

struct OfferDetailView: View {
    let offer: Offer
    /// Nome da loja quando aberto a partir de Detalhes da Loja (sobrescreve offer.storeName se necessário).
    var storeNameOverride: String?
    let onUseOffer: () -> Void
    let onDismiss: () -> Void
    
    @State private var redemptionStatus: RedemptionStatus? = nil
    @State private var loadingRedemption = true
    @State private var showToast = false
    @State private var toastMessage = ""

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
                // Card principal - similar à versão WEB (visual desabilitado quando resgatada)
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
                .opacity(redemptionStatus == .confirmed ? 0.65 : 1)
                .saturation(redemptionStatus == .confirmed ? 0.6 : 1)
                .allowsHitTesting(redemptionStatus != .confirmed)

                // Botão Usar oferta / Oferta Solicitada / Oferta Resgatada
                offerButton

                // Botões de compartilhar (igual ao modelo Web)
                shareButtons

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
        .overlay {
            if showToast {
                VStack {
                    Spacer()
                    Text(toastMessage)
                        .font(.appBody)
                        .foregroundColor(.cardForeground)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .onAppear {
            // Busca status ao abrir e ao voltar: lembra se usuário já solicitou ou resgatou
            Task {
                loadingRedemption = true
                await loadRedemptionStatus()
            }
        }
    }
    
    @ViewBuilder
    private var offerButton: some View {
        if loadingRedemption {
            ProgressView()
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppSpacing.md)
        } else if redemptionStatus == .confirmed {
            Text("Oferta Resgatada")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppSpacing.md)
                .background(Color.gray.opacity(0.25))
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.gray.opacity(0.4), lineWidth: 1)
                )
                .cornerRadius(AppRadius.lg)
        } else if redemptionStatus == .pending {
            Text("Oferta Solicitada")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.primaryForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppSpacing.md)
                .background(Color.orange.opacity(0.8))
                .cornerRadius(AppRadius.lg)
        } else if !isUserLoggedIn {
            Text("Faça login para usar esta oferta")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.mutedForeground)
                .frame(maxWidth: .infinity)
                .padding(.vertical, AppSpacing.md)
                .background(Color.muted.opacity(0.5))
                .cornerRadius(AppRadius.lg)
        } else {
            Button(action: {
                redemptionStatus = .pending  // Otimista: evita duplo toque
                onUseOffer()
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
        }
    }
    
    private var isUserLoggedIn: Bool {
        Auth.auth().currentUser != nil
    }

    @ViewBuilder
    private var shareButtons: some View {
        HStack(spacing: AppSpacing.sm) {
            // WhatsApp (verde, igual ao Web)
            Button {
                shareViaWhatsApp()
            } label: {
                HStack(spacing: AppSpacing.sm) {
                    Image(systemName: "message.fill")
                        .font(.system(size: 14))
                    Text("WhatsApp")
                        .font(.system(size: 14, weight: .medium))
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.vertical, AppSpacing.md)
                .frame(maxWidth: .infinity)
                .background(Color(red: 0.13, green: 0.59, blue: 0.27)) // green-600
                .foregroundColor(.white)
                .cornerRadius(AppRadius.xl)
            }
            .buttonStyle(PlainButtonStyle())

            // Copiar link (muted, igual ao Web)
            Button {
                copyLinkToClipboard()
            } label: {
                HStack(spacing: AppSpacing.sm) {
                    Image(systemName: "doc.on.doc")
                        .font(.system(size: 14))
                    Text("Copiar link")
                        .font(.system(size: 14, weight: .medium))
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.vertical, AppSpacing.md)
                .frame(maxWidth: .infinity)
                .background(Color.muted)
                .foregroundColor(.mutedForeground)
                .cornerRadius(AppRadius.xl)
            }
            .buttonStyle(PlainButtonStyle())
        }
        .padding(.top, AppSpacing.lg)
    }

    private func shareViaWhatsApp() {
        let url = ShareService.shared.getOfferShareUrl(offerId: offer.id)
        let message = ShareService.shared.getWhatsAppShareMessage(
            offerTitle: offer.title,
            storeName: displayStoreName,
            url: url
        )
        ShareService.shared.trackOfferShare(
            offerId: offer.id,
            shareType: .whatsapp,
            offerTitle: offer.title,
            storeId: offer.storeId
        )
        if let whatsappUrl = ShareService.shared.getWhatsAppShareUrl(text: message) {
            UIApplication.shared.open(whatsappUrl)
        }
        toastMessage = "Abrindo WhatsApp..."
        withAnimation { showToast = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { showToast = false }
        }
    }

    private func copyLinkToClipboard() {
        let url = ShareService.shared.getOfferShareUrl(offerId: offer.id)
        UIPasteboard.general.string = url
        ShareService.shared.trackOfferShare(
            offerId: offer.id,
            shareType: .link,
            offerTitle: offer.title,
            storeId: offer.storeId
        )
        toastMessage = "Link copiado!"
        withAnimation { showToast = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { showToast = false }
        }
    }
    
    private func loadRedemptionStatus() async {
        guard let userId = Auth.auth().currentUser?.uid else {
            await MainActor.run { loadingRedemption = false }
            return
        }
        do {
            let redemption = try await RedemptionsService.shared.getUserRedemptionForOffer(userId: userId, offerId: offer.id)
            await MainActor.run {
                redemptionStatus = redemption?.status
                loadingRedemption = false
            }
        } catch {
            await MainActor.run {
                redemptionStatus = nil
                loadingRedemption = false
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
            storeId: "store1",
            storeName: "Café Central",
            storeAddress: "Rua das Flores, 123",
            merchantId: "merchant1",
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
