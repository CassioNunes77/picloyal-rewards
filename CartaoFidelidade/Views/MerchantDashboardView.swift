//
//  MerchantDashboardView.swift
//  CartaoFidelidade
//
//  Painel do lojista com cadastro de loja
//

import SwiftUI
import FirebaseAuth

struct MerchantDashboardView: View {
    @Environment(\.dismiss) private var dismiss
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
    @AppStorage("showMerchantLogin") private var showMerchantLogin = false
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""
    @State private var showStoreForm = false
    @State private var editingStore: FirebaseStore? = nil
    @State private var selectedStore: FirebaseStore? = nil
    @State private var showSignUpForm = false
    @State private var showLogoutConfirmation = false
    @State private var stores: [FirebaseStore] = []
    @State private var loadingStores = false
    @State private var activeTab = "dashboard"
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            // Conteúdo baseado na tab ativa (sem animação ao abrir detalhes da loja)
            Group {
                switch activeTab {
                case "dashboard":
                    dashboardOverviewContent
                case "stores":
                    if let store = selectedStore {
                        MerchantStoreDetailsView(store: store, onBack: {
                            var t = Transaction()
                            t.disablesAnimations = true
                            withTransaction(t) { selectedStore = nil }
                        }, onEdit: {
                            var t = Transaction()
                            t.disablesAnimations = true
                            withTransaction(t) {
                                editingStore = store
                                selectedStore = nil
                            }
                        })
                    } else {
                        storesContent
                    }
                case "offers":
                    offersContent
                case "redemptions":
                    MerchantRedemptionsView(onBack: {
                        withAnimation {
                            activeTab = "dashboard"
                        }
                    })
                case "settings":
                    MerchantSettingsView(onBack: {
                        withAnimation {
                            activeTab = "dashboard"
                        }
                    })
                default:
                    dashboardOverviewContent
                }
            }
            
            // Bottom Navigation
            VStack {
                Spacer()
                MerchantBottomNav(activeTab: $activeTab)
            }
        }
        .appConfirmation(
            isPresented: $showLogoutConfirmation,
            title: "Sair da conta?",
            message: "Deseja realmente sair da sua conta de lojista?",
            primaryTitle: "Sair",
            primaryStyle: .destructive,
            primaryAction: { performLogout() },
            secondaryTitle: "Cancelar",
            secondaryAction: nil
        )
        .onAppear {
            if isLoggedIn {
                loadStores()
            }
        }
    }
    
    /// Header do Dashboard — área roxa até 120pt do topo
    private var dashboardHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Painel do Lojista")
                        .font(.appTitle)
                        .foregroundColor(.heroForeground)
                    Text("Visão geral do seu negócio")
                        .font(.appCaption)
                        .foregroundColor(.heroForegroundMuted)
                }
                Spacer()
                if isLoggedIn {
                    Button(action: { showLogoutConfirmation = true }) {
                        Image(systemName: "arrow.right.square.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.heroForegroundMuted)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, AppSpacing.lg)
        .padding(.top, 0)
        .padding(.bottom, AppSpacing.md)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
    
    /// Área roxa — 120pt altura, texto 15pt do topo (padrão painel lojista)
    private var merchantHeader: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if isLoggedIn {
                        Text("Bem-vindo, \(userDisplayName.isEmpty ? (userEmail.isEmpty ? "Lojista" : String(userEmail.split(separator: "@").first ?? "Lojista")) : userDisplayName)")
                            .font(.appCaption)
                            .foregroundColor(.heroForegroundMuted)
                    }
                    Text("Painel do Lojista")
                        .font(.appTitle)
                        .foregroundColor(.heroForeground)
                    Text("Gerencie suas lojas")
                        .font(.appCaption)
                        .foregroundColor(.heroForegroundMuted)
                }
                Spacer()
                if isLoggedIn {
                    Button(action: { showLogoutConfirmation = true }) {
                        Image(systemName: "arrow.right.square.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.heroForegroundMuted)
                    }
                }
            }
            .padding(.horizontal, AppSpacing.lg)
            .padding(.top, 0)
            .padding(.bottom, AppSpacing.md)
        }
        .frame(maxWidth: .infinity)
        .frame(minHeight: 120)
        .background(AppGradients.hero)
    }
    
    /// Header da tela Suas Lojas — 120pt altura, texto 15pt do topo (padrão painel lojista)
    private var storesHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Suas Lojas")
                .font(.appTitle)
                .foregroundColor(.heroForeground)
            Text("Gerencie e cadastre suas lojas")
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
    
    /// Dashboard: resumo e acesso rápido — conforme imagem de referência
    private var dashboardOverviewContent: some View {
        ZStack(alignment: .top) {
            VStack(spacing: 0) {
                dashboardHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    // Card Resumo — itens empilhados verticalmente, cada um em retângulo cinza claro
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Resumo")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        VStack(spacing: AppSpacing.sm) {
                            summaryRow(icon: "storefront.fill", iconBg: Color(red: 0.85, green: 0.95, blue: 0.88), iconColor: .primary, value: "\(stores.count)", label: "Lojas cadastradas")
                            summaryRow(icon: "tag.fill", iconBg: Color(red: 0.92, green: 0.88, blue: 0.98), iconColor: .secondary, value: "—", label: "Ofertas ativas")
                            summaryRow(icon: "chart.line.uptrend.xyaxis", iconBg: Color(red: 0.88, green: 0.96, blue: 0.92), iconColor: .primary, value: "—", label: "Visualizações (30 dias)")
                        }
                    }
                    .padding(AppSpacing.lg)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, 24)
                    .padding(.top, 75)
                    
                    // Card Acesso rápido — conforme imagem
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Acesso rápido")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        Button(action: { withAnimation { activeTab = "stores" } }) {
                            HStack(spacing: AppSpacing.md) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color(red: 0.85, green: 0.95, blue: 0.88))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "storefront.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(.primary)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Suas Lojas")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.cardForeground)
                                    Text("Cadastrar e gerenciar lojas")
                                        .font(.system(size: 12, weight: .regular))
                                        .foregroundColor(.mutedForeground)
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 14))
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(AppSpacing.md)
                            .background(Color.muted.opacity(0.5))
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                    .padding(.horizontal, 24)
                }
                .padding(.bottom, 80)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.clear)
        }
    }
    
    /// Linha do Resumo — ícone em quadrado colorido (esq), valor + label (dir)
    private func summaryRow(icon: String, iconBg: Color, iconColor: Color = .primary, value: String, label: String) -> some View {
        HStack(spacing: AppSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(iconBg)
                    .frame(width: 44, height: 44)
                Image(systemName: icon)
                    .font(.system(size: 20))
                    .foregroundColor(iconColor)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.cardForeground)
                Text(label)
                    .font(.system(size: 12, weight: .regular))
                    .foregroundColor(.mutedForeground)
            }
            Spacer()
        }
        .padding(AppSpacing.md)
        .background(Color.muted.opacity(0.5))
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
    }
    
    /// Tela Ofertas: acesso às ofertas por loja (mesmo padrão visual)
    private var offersContent: some View {
        ZStack(alignment: .top) {
            VStack(spacing: 0) {
                merchantHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Suas Ofertas")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        Text("Toque em uma loja para criar e gerenciar ofertas.")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.mutedForeground)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(AppSpacing.lg)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, 24)
                    .padding(.top, 75)
                    
                    if loadingStores {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .primary))
                            .padding(.top, 24)
                    } else if stores.isEmpty {
                        Text("Nenhuma loja cadastrada")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.mutedForeground)
                            .padding(.top, 24)
                        Button(action: { withAnimation { activeTab = "stores" } }) {
                            Text("Cadastrar loja")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.primary)
                        }
                        .padding(.top, AppSpacing.sm)
                    } else {
                        ForEach(stores) { store in
                            Button(action: {
                                var t = Transaction()
                                t.disablesAnimations = true
                                withTransaction(t) { selectedStore = store }
                                withAnimation { activeTab = "stores" }
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(store.name)
                                            .font(.system(size: 16, weight: .medium))
                                            .foregroundColor(.cardForeground)
                                        Text("Ver e gerenciar ofertas")
                                            .font(.system(size: 12, weight: .regular))
                                            .foregroundColor(.mutedForeground)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .font(.system(size: 14))
                                        .foregroundColor(.mutedForeground)
                                }
                                .padding(AppSpacing.md)
                                .background(Color.card)
                                .cornerRadius(AppRadius.lg)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.lg)
                                        .stroke(Color.border, lineWidth: 1)
                                )
                            }
                            .buttonStyle(PlainButtonStyle())
                        }
                        .padding(.horizontal, 24)
                    }
                }
                .padding(.bottom, 80)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.clear)
        }
    }
    
    /// Tela Lojas: lista de lojas, cadastro e edição (card à frente da área roxa) — conforme imagem de referência
    private var storesContent: some View {
        ZStack(alignment: .top) {
            // Camada de trás: área roxa no topo (header Suas Lojas)
            VStack(spacing: 0) {
                storesHeader
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Camada da frente: scroll com o card desenhado por cima do roxo
            ScrollView {
                    VStack(spacing: 0) {
                        if showSignUpForm {
                            // Formulário de cadastro de conta
                            MerchantSignUpView(
                                onSuccess: {
                                    withAnimation {
                                        showSignUpForm = false
                                    }
                                    dismiss()
                                },
                                onCancel: {
                                    withAnimation {
                                        showSignUpForm = false
                                    }
                                }
                            )
                            .padding(.top, 24)
                        } else if let storeToEdit = editingStore {
                            // Formulário de edição de loja
                            MerchantStoreEditView(
                                store: storeToEdit,
                                onCancel: {
                                    withAnimation {
                                        editingStore = nil
                                    }
                                },
                                onSuccess: {
                                    withAnimation {
                                        editingStore = nil
                                    }
                                    loadStores()
                                }
                            )
                            .frame(maxWidth: UIScreen.main.bounds.width - 48)
                            .padding(.top, 24)
                            .transition(.move(edge: .trailing))
                        } else if showStoreForm {
                            // Formulário de cadastro de nova loja
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
                                    loadStores()
                                }
                            )
                            .padding(.top, 24)
                        } else {
                            // Lista / estados iniciais
                            if loadingStores {
                                // Loading
                                VStack(spacing: AppSpacing.lg) {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .primary))
                                        .scaleEffect(1.5)
                                        .padding(.top, 48)
                                    
                                    Text("Carregando lojas...")
                                        .font(.system(size: 14, weight: .regular))
                                        .foregroundColor(.mutedForeground)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 48)
                            } else if !isLoggedIn {
                                // Não está logado - mostrar opção de criar conta
                                VStack(spacing: AppSpacing.lg) {
                                    Image(systemName: "person.badge.plus.fill")
                                        .font(.system(size: 64))
                                        .foregroundColor(.mutedForeground)
                                        .padding(.top, 48)
                                    
                                    Text("Crie sua conta de lojista")
                                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                                        .foregroundColor(.cardForeground)
                                    
                                    Text("Cadastre seu e-mail e senha para começar a gerenciar sua loja")
                                        .font(.system(size: 14, weight: .regular))
                                        .foregroundColor(.mutedForeground)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal, AppSpacing.lg)
                                    
                                    Button(action: {
                                        withAnimation {
                                            showSignUpForm = true
                                        }
                                    }) {
                                        HStack(spacing: AppSpacing.sm) {
                                            Image(systemName: "person.badge.plus.fill")
                                                .font(.system(size: 18))
                                            Text("Criar Conta")
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
                            } else if stores.isEmpty {
                                // Está logado mas não tem lojas - mostrar opção de cadastrar loja
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
                                // Card que engloba lojas cadastradas (conforme imagem de referência)
                                VStack(spacing: 0) {
                                    // Cabeçalho do card: Lojas cadastradas + X lojas + botão Nova Loja
                                    HStack(alignment: .top) {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Lojas cadastradas")
                                                .font(.system(size: 20, weight: .bold, design: .rounded))
                                                .foregroundColor(.cardForeground)
                                            Text("\(stores.count) \(stores.count == 1 ? "loja" : "lojas")")
                                                .font(.system(size: 14, weight: .regular))
                                                .foregroundColor(.cardForeground)
                                        }
                                        Spacer()
                                        Button(action: {
                                            withAnimation { showStoreForm = true }
                                        }) {
                                            HStack(spacing: AppSpacing.xs) {
                                                Image(systemName: "plus")
                                                    .font(.system(size: 14, weight: .semibold))
                                                Text("Nova Loja")
                                                    .font(.system(size: 14, weight: .medium))
                                            }
                                            .foregroundColor(.primaryForeground)
                                            .padding(.horizontal, AppSpacing.md)
                                            .padding(.vertical, AppSpacing.sm)
                                        }
                                        .background(AppGradients.primary)
                                        .cornerRadius(AppRadius.md)
                                    }
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.top, AppSpacing.lg)
                                    .padding(.bottom, AppSpacing.sm)
                                    
                                    // Lista de lojas dentro do mesmo card
                                    VStack(spacing: AppSpacing.sm) {
                                        ForEach(stores) { store in
                                            StoreCardView(
                                                store: store,
                                                onTap: {
                                                    var t = Transaction()
                                                    t.disablesAnimations = true
                                                    withTransaction(t) { selectedStore = store }
                                                    withAnimation {
                                                        showStoreForm = false
                                                        editingStore = nil
                                                    }
                                                }
                                            )
                                        }
                                    }
                                    .padding(.horizontal, AppSpacing.lg)
                                    .padding(.bottom, AppSpacing.lg)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.card)
                                .clipShape(RoundedRectangle(cornerRadius: AppRadius.xl))
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppRadius.xl)
                                        .stroke(Color.border, lineWidth: 1)
                                )
                                .appShadow(AppShadow.lg)
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, 75)
                    .padding(.bottom, 80)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.clear)
        }
    
    private func loadStores() {
        guard let currentUser = Auth.auth().currentUser else {
            stores = []
            loadingStores = false
            return
        }
        
        loadingStores = true
        
        Task {
            do {
                let merchantStores = try await StoresService.shared.getMerchantStores(merchantId: currentUser.uid)
                await MainActor.run {
                    self.stores = merchantStores
                    self.loadingStores = false
                }
            } catch {
                print("❌ [MerchantDashboardView] Erro ao carregar lojas: \(error.localizedDescription)")
                await MainActor.run {
                    self.loadingStores = false
                }
            }
        }
    }
    
    private func performLogout() {
        do {
            try Auth.auth().signOut()
            print("✅ [MerchantDashboardView] Logout realizado com sucesso")
        } catch {
            print("❌ [MerchantDashboardView] Erro ao fazer logout: \(error.localizedDescription)")
        }
        
        // Limpar dados e redirecionar para login do lojista
        userDisplayName = ""
        userEmail = ""
        userPhotoURL = ""
        isLoggedIn = false
        isMerchant = false
        showMerchantLogin = true
        
        print("✅ [MerchantDashboardView] Redirecionando para tela de login do lojista")
    }
}

#Preview {
    MerchantDashboardView()
}
