//
//  MerchantStoreDetailsView.swift
//  CartaoFidelidade
//
//  View de detalhes da loja com gerenciamento de ofertas
//

import SwiftUI
import FirebaseAuth

struct MerchantStoreDetailsView: View {
    let store: FirebaseStore
    var onBack: (() -> Void)? = nil
    
    @State private var offers: [FirebaseOffer] = []
    @State private var loadingOffers = false
    @State private var showOfferForm = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    // Header
                    VStack(spacing: AppSpacing.md) {
                        HStack {
                            Button(action: {
                                if let onBack = onBack {
                                    withAnimation {
                                        onBack()
                                    }
                                }
                            }) {
                                Image(systemName: "arrow.left.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(.white)
                            }
                            
                            Spacer()
                        }
                        
                        VStack(spacing: AppSpacing.xs) {
                            Text(store.name)
                                .font(.system(size: 24, weight: .bold, design: .rounded))
                                .foregroundColor(.white)
                            
                            Text("Gerencie suas ofertas")
                                .font(.system(size: 14, weight: .regular))
                                .foregroundColor(.white.opacity(0.9))
                        }
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                    .padding(.bottom, AppSpacing.xl)
                    .background(AppGradients.primary)
                    
                    // Informações da Loja
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        if !store.address.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "mappin.circle.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.primary)
                                Text(store.address)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        
                        if !store.city.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Text(store.city)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                            .padding(.leading, 24) // Alinhar com endereço
                        }
                        
                        if !store.phone.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "phone.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.primary)
                                Text(store.phone)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        
                        if !store.hours.isEmpty {
                            HStack(alignment: .top, spacing: AppSpacing.sm) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.primary)
                                    .padding(.top, 2)
                                Text(store.hours)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                                    .lineLimit(nil)
                            }
                        }
                    }
                    .padding(AppSpacing.lg)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, AppSpacing.lg)
                    .offset(y: -AppRadius.xl)
                    
                    // Seção de Ofertas
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Ofertas")
                                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                                    .foregroundColor(.cardForeground)
                                
                                Text("\(offers.count) \(offers.count == 1 ? "oferta cadastrada" : "ofertas cadastradas")")
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.mutedForeground)
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                showOfferForm = true
                            }) {
                                HStack(spacing: AppSpacing.xs) {
                                    Image(systemName: "plus.circle.fill")
                                        .font(.system(size: 16))
                                    Text("Nova Oferta")
                                        .font(.system(size: 14, weight: .semibold))
                                }
                                .foregroundColor(.primaryForeground)
                                .padding(.horizontal, AppSpacing.md)
                                .padding(.vertical, AppSpacing.sm)
                            }
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.md)
                            .appShadow(AppShadow.sm)
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, AppSpacing.lg)
                        
                        if showOfferForm {
                            MerchantOfferFormView(
                                storeId: store.id,
                                merchantId: store.merchantId,
                                onCancel: {
                                    showOfferForm = false
                                },
                                onSuccess: {
                                    showOfferForm = false
                                    loadOffers()
                                }
                            )
                            .padding(.horizontal, AppSpacing.lg)
                        } else if loadingOffers {
                            VStack(spacing: AppSpacing.md) {
                                ProgressView()
                                    .scaleEffect(1.2)
                                Text("Carregando ofertas...")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.xl * 2)
                        } else if offers.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "tag.fill")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground.opacity(0.5))
                                
                                Text("Nenhuma oferta cadastrada")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.cardForeground)
                                
                                Text("Crie sua primeira oferta para atrair mais clientes")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                                    .multilineTextAlignment(.center)
                                
                                Button(action: {
                                    showOfferForm = true
                                }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: "plus.circle.fill")
                                            .font(.system(size: 16))
                                        Text("Criar Oferta")
                                            .font(.system(size: 14, weight: .semibold))
                                    }
                                    .foregroundColor(.primaryForeground)
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.vertical, AppSpacing.md)
                                }
                                .background(AppGradients.primary)
                                .cornerRadius(AppRadius.md)
                                .appShadow(AppShadow.sm)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.xl * 2)
                            .padding(.horizontal, AppSpacing.lg)
                        } else {
                            VStack(spacing: AppSpacing.sm) {
                                ForEach(offers) { offer in
                                    OfferCardView(offer: offer) {
                                        deleteOffer(offer)
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.lg)
                        }
                    }
                    .padding(.top, AppSpacing.md)
                }
            }
        }
        .onAppear {
            loadOffers()
        }
        .alert("Erro", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(errorMessage ?? "Erro desconhecido")
        }
    }
    
    private func loadOffers() {
        loadingOffers = true
        errorMessage = nil
        
        Task {
            do {
                let storeOffers = try await OffersService.shared.getStoreOffers(storeId: store.id)
                await MainActor.run {
                    self.offers = storeOffers
                    self.loadingOffers = false
                }
            } catch {
                print("❌ [MerchantStoreDetailsView] Erro ao carregar ofertas: \(error.localizedDescription)")
                await MainActor.run {
                    self.loadingOffers = false
                    self.errorMessage = "Erro ao carregar ofertas: \(error.localizedDescription)"
                    self.showError = true
                }
            }
        }
    }
    
    private func deleteOffer(_ offer: FirebaseOffer) {
        guard let currentUser = Auth.auth().currentUser else { return }
        
        Task {
            do {
                try await OffersService.shared.deleteOffer(offerId: offer.id, merchantId: currentUser.uid)
                await MainActor.run {
                    loadOffers()
                }
            } catch {
                print("❌ [MerchantStoreDetailsView] Erro ao deletar oferta: \(error.localizedDescription)")
                await MainActor.run {
                    self.errorMessage = "Erro ao deletar oferta: \(error.localizedDescription)"
                    self.showError = true
                }
            }
        }
    }
}

struct OfferCardView: View {
    let offer: FirebaseOffer
    let onDelete: () -> Void
    
    @State private var showDeleteConfirmation = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: AppSpacing.xs) {
                    HStack(spacing: AppSpacing.sm) {
                        Text(getCategoryEmoji(offer.category))
                            .font(.system(size: 24))
                        
                        Text(offer.title)
                            .font(.system(size: 16, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        
                        if let discount = offer.discount {
                            Text(discount)
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.primary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.primary.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        }
                        
                        if !offer.active {
                            Text("Inativa")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundColor(.gray)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.gray.opacity(0.1))
                                .cornerRadius(AppRadius.sm)
                        }
                    }
                    
                    Text(offer.description)
                        .font(.system(size: 14, weight: .regular))
                        .foregroundColor(.mutedForeground)
                        .lineLimit(2)
                    
                    HStack(spacing: AppSpacing.md) {
                        HStack(spacing: AppSpacing.xs) {
                            Image(systemName: "calendar")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                            Text(formatDate(offer.validUntil))
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                        
                        if let pointsRequired = offer.pointsRequired {
                            HStack(spacing: AppSpacing.xs) {
                                Image(systemName: "gift.fill")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                                Text("\(pointsRequired) pontos")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                            }
                        }
                    }
                }
                
                Spacer()
                
                Button(action: {
                    showDeleteConfirmation = true
                }) {
                    Image(systemName: "trash.fill")
                        .font(.system(size: 16))
                        .foregroundColor(.red)
                }
            }
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
        .appShadow(AppShadow.sm)
        .alert("Excluir Oferta", isPresented: $showDeleteConfirmation) {
            Button("Cancelar", role: .cancel) { }
            Button("Excluir", role: .destructive) {
                onDelete()
            }
        } message: {
            Text("Tem certeza que deseja excluir esta oferta?")
        }
    }
    
    private func getCategoryEmoji(_ category: String) -> String {
        switch category.lowercased() {
        case "bebidas":
            return "🥤"
        case "comida":
            return "🍕"
        case "brinde":
            return "🎁"
        case "geral":
            return "🏷️"
        default:
            return "🏷️"
        }
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd/MM/yyyy"
        formatter.locale = Locale(identifier: "pt_BR")
        return formatter.string(from: date)
    }
}

#Preview {
    MerchantStoreDetailsView(
        store: FirebaseStore(
            id: "1",
            merchantId: "merchant1",
            name: "Loja Exemplo",
            cnpj: "12.345.678/0001-90",
            address: "Rua Exemplo, 123",
            city: "São Paulo - SP",
            phone: "(11) 1234-5678",
            hours: "Segunda a Sexta: 9h às 18h",
            photoURL: nil,
            active: true,
            createdAt: Date(),
            updatedAt: Date()
        ),
        onBack: { }
    )
}
