//
//  MerchantRedemptionsView.swift
//  CartaoFidelidade
//
//  Tela de resgates de ofertas solicitados por usuários
//

import SwiftUI
import FirebaseAuth

struct MerchantRedemptionsView: View {
    var onBack: (() -> Void)? = nil
    
    @State private var redemptions: [FirebaseRedemption] = []
    @State private var stores: [FirebaseStore] = []
    @State private var selectedStoreId: String? = nil
    @State private var loading = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    var filteredRedemptions: [FirebaseRedemption] {
        guard let sid = selectedStoreId, !sid.isEmpty else { return redemptions }
        return redemptions.filter { $0.storeId == sid }
    }
    
    var body: some View {
        ZStack(alignment: .top) {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                redemptionsHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            ScrollView {
                VStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        // Filtro por Loja
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            Text("Filtrar por Loja")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.mutedForeground)
                            
                            Picker("Loja", selection: $selectedStoreId) {
                                Text("Todas as lojas").tag(Optional<String>.none)
                                ForEach(stores) { store in
                                    Text(store.name).tag(Optional(store.id))
                                }
                            }
                            .pickerStyle(.menu)
                        }
                        
                        if loading {
                            VStack(spacing: AppSpacing.md) {
                                ProgressView()
                                    .scaleEffect(1.2)
                                Text("Carregando resgates...")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.xl * 2)
                        } else if filteredRedemptions.isEmpty {
                            VStack(spacing: AppSpacing.lg) {
                                Image(systemName: "tag.slash")
                                    .font(.system(size: 56))
                                    .foregroundColor(.mutedForeground)
                                Text("Nenhum resgate encontrado")
                                    .font(.system(size: 18, weight: .semibold))
                                    .foregroundColor(.cardForeground)
                                Text(selectedStoreId == nil
                                     ? "Quando usuários solicitarem ofertas, elas aparecerão aqui."
                                     : "Não há resgates para esta loja.")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                                    .multilineTextAlignment(.center)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, AppSpacing.xl * 2)
                        } else {
                            VStack(alignment: .leading, spacing: AppSpacing.sm) {
                                Text("\(filteredRedemptions.count) \(filteredRedemptions.count == 1 ? "resgate" : "resgates")")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.mutedForeground)
                                
                                ForEach(filteredRedemptions) { r in
                                    RedemptionCard(redemption: r)
                                }
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(AppSpacing.lg)
                    .background(Color.card)
                    .clipShape(RoundedRectangle(cornerRadius: AppRadius.xl))
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.xl)
                            .stroke(Color.border, lineWidth: 1)
                    )
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, 24)
                    .padding(.top, 75)
                    .padding(.bottom, 80)
                }
            }
        }
        .onAppear {
            loadData()
        }
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro ao carregar resgates",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    private var redemptionsHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Resgates")
                .font(.appTitle)
                .foregroundColor(.heroForeground)
            Text("Solicitações de ofertas por usuários")
                .font(.appCaption)
                .foregroundColor(.heroForegroundMuted)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppSpacing.lg)
        .padding(.top, 0)
        .padding(.bottom, AppSpacing.md)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
    
    private func loadData() {
        guard let user = Auth.auth().currentUser else { return }
        
        loading = true
        errorMessage = nil
        
        Task {
            do {
                async let redemptionsTask = RedemptionsService.shared.getMerchantRedemptions(merchantId: user.uid)
                async let storesTask = StoresService.shared.getMerchantStores(merchantId: user.uid)
                
                let (reds, str) = try await (redemptionsTask, storesTask)
                
                await MainActor.run {
                    redemptions = reds
                    stores = str
                    loading = false
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

struct RedemptionCard: View {
    let redemption: FirebaseRedemption
    
    private func formatDate(_ date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "dd/MM/yyyy HH:mm"
        f.locale = Locale(identifier: "pt_BR")
        return f.string(from: date)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(redemption.offerTitle)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.cardForeground)
                    Text(redemption.storeName)
                        .font(.system(size: 12))
                        .foregroundColor(.mutedForeground)
                }
                Spacer()
                Text(formatDate(redemption.createdAt))
                    .font(.system(size: 11))
                    .foregroundColor(.mutedForeground)
            }
            
            HStack(spacing: AppSpacing.sm) {
                Image(systemName: "person.fill")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
                Text(redemption.userName)
                    .font(.system(size: 14))
                    .foregroundColor(.cardForeground)
                if !redemption.userEmail.isEmpty {
                    Text("•")
                        .foregroundColor(.mutedForeground)
                    Text(redemption.userEmail)
                        .font(.system(size: 12))
                        .foregroundColor(.mutedForeground)
                        .lineLimit(1)
                }
            }
        }
        .padding(AppSpacing.md)
        .background(Color.muted.opacity(0.5))
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
    }
}

#Preview {
    MerchantRedemptionsView()
}
