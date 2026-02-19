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
    var onEdit: (() -> Void)? = nil
    
    @State private var offers: [FirebaseOffer] = []
    @State private var stampRewards: [FirebaseStampReward] = []
    @State private var loadingOffers = false
    @State private var showOfferForm = false
    @State private var showStampForm = false
    @State private var showOfferTypeMenu = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    /// Header roxo — 120pt altura, texto 15pt do topo (padrão painel lojista)
    private var storeDetailsHeader: some View {
        ZStack(alignment: .topLeading) {
            HStack(alignment: .top, spacing: AppSpacing.md) {
                storeHeaderIcon
                VStack(alignment: .leading, spacing: 4) {
                    Text(store.name)
                    .font(.system(size: 24, weight: .bold, design: .rounded))
                                    .foregroundColor(.heroForeground)
                Text("Gerencie suas ofertas")
                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.heroForegroundMuted)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, AppSpacing.lg)
            .padding(.top, 0)
            
            HStack {
                Button(action: {
                    if let onBack = onBack { onBack() }
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .semibold))
                                    .foregroundColor(.heroForeground)
                }
                Spacer()
            }
            .padding(.horizontal, AppSpacing.lg)
            .padding(.top, 0)
        }
        .padding(.bottom, AppSpacing.md)
        .frame(maxWidth: .infinity)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
    
    private var storeHeaderIcon: some View {
        Group {
            if let urlString = store.photoURL, let url = URL(string: urlString) {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                            .frame(width: 48, height: 48)
                            .clipped()
                            .cornerRadius(AppRadius.md)
                    default:
                        Image(systemName: "storefront.fill")
                            .font(.system(size: 32))
                            .foregroundColor(.heroForeground)
                    }
                }
            } else {
                Image(systemName: "storefront.fill")
                    .font(.system(size: 32))
                    .foregroundColor(.heroForeground)
            }
        }
    }
    
    var body: some View {
        ZStack(alignment: .top) {
            Color.appBackground
                .ignoresSafeArea()
            
            // Camada roxa do topo (header)
            VStack(spacing: 0) {
                storeDetailsHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Conteúdo: cards à frente do roxo
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    // Card Informações da Loja — conforme imagem
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        if !store.address.isEmpty || !store.city.isEmpty {
                            HStack(alignment: .top, spacing: AppSpacing.sm) {
                                Image(systemName: "mappin.circle.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.mutedForeground)
                                VStack(alignment: .leading, spacing: 2) {
                                    if !store.address.isEmpty {
                                        Text(store.address)
                                            .font(.system(size: 14, weight: .regular))
                                            .foregroundColor(.cardForeground)
                                    }
                                    if !store.city.isEmpty {
                                        Text(store.city)
                                            .font(.system(size: 14, weight: .regular))
                                            .foregroundColor(.cardForeground)
                                    }
                                }
                            }
                        }
                        if !store.phone.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "phone.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.mutedForeground)
                                Text(store.phone)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        if !store.hours.isEmpty {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "clock.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.mutedForeground)
                                Text(store.hours)
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.cardForeground)
                            }
                        }
                        
                        Button(action: { onEdit?() }) {
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "pencil")
                                    .font(.system(size: 16))
                                Text("Editar loja")
                                    .font(.system(size: 14, weight: .semibold))
                            }
                            .foregroundColor(.primary)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.sm)
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(AppSpacing.lg)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, 75)
                    
                    // Card Ofertas — conforme imagem
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        HStack(alignment: .top) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Ofertas")
                                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                                    .foregroundColor(.cardForeground)
                                Text("\(offers.count) \(offers.count == 1 ? "oferta cadastrada" : "ofertas cadastradas")")
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.mutedForeground)
                            }
                            Spacer()
                            Button(action: { showOfferTypeMenu = true }) {
                                HStack(spacing: AppSpacing.xs) {
                                    Image(systemName: "plus")
                                        .font(.system(size: 14, weight: .semibold))
                                    Text("Nova Oferta")
                                        .font(.system(size: 14, weight: .semibold))
                                }
                                .foregroundColor(.primaryForeground)
                                .padding(.horizontal, AppSpacing.md)
                                .padding(.vertical, AppSpacing.sm)
                            }
                            .background(AppGradients.primary)
                            .cornerRadius(AppRadius.md)
                            .confirmationDialog("Tipo de oferta", isPresented: $showOfferTypeMenu) {
                                Button("Ofertas") { showOfferForm = true }
                                Button("Carimbo") { showStampForm = true }
                                Button("Cancelar", role: .cancel) { }
                            } message: {
                                Text("Escolha o tipo de oferta")
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, AppSpacing.lg)
                        
                        if showOfferForm {
                            MerchantOfferFormView(
                                storeId: store.id,
                                merchantId: store.merchantId,
                                onCancel: { showOfferForm = false },
                                onSuccess: {
                                    showOfferForm = false
                                    loadOffers()
                                }
                            )
                            .padding(.horizontal, AppSpacing.lg)
                        } else if showStampForm {
                            MerchantStampFormView(
                                storeId: store.id,
                                merchantId: store.merchantId,
                                onCancel: { showStampForm = false },
                                onSuccess: {
                                    showStampForm = false
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
                        } else if offers.isEmpty && stampRewards.isEmpty {
                            VStack(spacing: AppSpacing.lg) {
                                Image(systemName: "tag.fill")
                                    .font(.system(size: 56))
                                    .foregroundColor(.mutedForeground)
                                Text("Nenhuma oferta cadastrada")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.cardForeground)
                                Text("Crie sua primeira oferta para atrair mais clientes")
                                    .font(.system(size: 14, weight: .regular))
                                    .foregroundColor(.mutedForeground)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                                Button(action: { showOfferTypeMenu = true }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: "plus")
                                            .font(.system(size: 14, weight: .semibold))
                                        Text("Criar Oferta")
                                            .font(.system(size: 14, weight: .semibold))
                                    }
                                    .foregroundColor(.primaryForeground)
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.vertical, AppSpacing.md)
                                }
                                .background(AppGradients.primary)
                                .cornerRadius(AppRadius.md)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.xl * 2)
                            .padding(.horizontal, AppSpacing.lg)
                        } else {
                            VStack(alignment: .leading, spacing: AppSpacing.lg) {
                                // Carimbos cadastrados - acima das ofertas
                                if !stampRewards.isEmpty {
                                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                        HStack(spacing: AppSpacing.xs) {
                                            Image(systemName: "stamp")
                                                .font(.system(size: 14))
                                                .foregroundColor(.mutedForeground)
                                            Text("Carimbos (\(stampRewards.count))")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(.mutedForeground)
                                        }
                                        ForEach(stampRewards) { sr in
                                            StampRewardCardView(stampReward: sr)
                                        }
                                    }
                                }
                                // Ofertas
                                if !offers.isEmpty {
                                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                        HStack(spacing: AppSpacing.xs) {
                                            Image(systemName: "tag.fill")
                                                .font(.system(size: 14))
                                                .foregroundColor(.mutedForeground)
                                            Text("Ofertas (\(offers.count))")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(.mutedForeground)
                                        }
                                        ForEach(offers) { offer in
                                            OfferCardView(offer: offer) { deleteOffer(offer) }
                                        }
                                    }
                                }
                            }
                            .padding(.horizontal, AppSpacing.lg)
                            .padding(.bottom, AppSpacing.lg)
                        }
                    }
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, AppSpacing.lg)
                }
                .padding(.bottom, 80)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.clear)
        }
        .onAppear {
            loadOffers()
        }
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro desconhecido",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    private func loadOffers() {
        loadingOffers = true
        errorMessage = nil
        
        Task {
            do {
                async let storeOffersTask = OffersService.shared.getStoreOffers(storeId: store.id)
                async let stampRewardsTask = StampRewardsService.shared.getStoreStampRewards(storeId: store.id)
                let (storeOffers, stamps) = try await (storeOffersTask, stampRewardsTask)
                await MainActor.run {
                    self.offers = storeOffers
                    self.stampRewards = stamps
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

struct StampRewardCardView: View {
    let stampReward: FirebaseStampReward
    
    var body: some View {
        HStack(spacing: AppSpacing.sm) {
            Image(systemName: "stamp")
                .font(.system(size: 20))
                .foregroundColor(.primary)
                .frame(width: 40, height: 40)
                .background(Color.primary.opacity(0.1))
                .cornerRadius(AppRadius.md)
            VStack(alignment: .leading, spacing: 2) {
                Text("\(stampReward.totalStamps) carimbos = \(stampReward.rewardTitle)")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(.cardForeground)
                Text("Programa ativo")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
            }
            Spacer()
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
        .appShadow(AppShadow.sm)
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
        .appConfirmation(
            isPresented: $showDeleteConfirmation,
            title: "Excluir Oferta",
            message: "Tem certeza que deseja excluir esta oferta?",
            primaryTitle: "Excluir",
            primaryStyle: .destructive,
            primaryAction: onDelete,
            secondaryTitle: "Cancelar",
            secondaryAction: nil
        )
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
