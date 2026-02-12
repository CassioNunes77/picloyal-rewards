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
            
            // Conteúdo baseado na tab ativa
            Group {
                switch activeTab {
                case "dashboard":
                    dashboardOverviewContent
                case "stores":
                    storesContent
                case "profile":
                    MerchantProfileView(onBack: {
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
                    dashboardContent
                }
            }
            
            // Bottom Navigation
            VStack {
                Spacer()
                MerchantBottomNav(activeTab: $activeTab)
            }
        }
        .alert("Sair da conta?", isPresented: $showLogoutConfirmation) {
            Button("Cancelar", role: .cancel) {}
            Button("Sair", role: .destructive) {
                performLogout()
            }
        } message: {
            Text("Deseja realmente sair da sua conta de lojista?")
        }
        .onAppear {
            if isLoggedIn {
                loadStores()
            }
        }
    }
    
    private var merchantHeader: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    if isLoggedIn {
                        Text("Bem-vindo, \(userDisplayName.isEmpty ? (userEmail.isEmpty ? "Lojista" : String(userEmail.split(separator: "@").first ?? "Lojista")) : userDisplayName)")
                            .font(.system(size: 14, weight: .regular))
                            .foregroundColor(.white.opacity(0.9))
                    }
                    Text("Painel do Lojista")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Gerencie suas lojas")
                        .font(.system(size: 14, weight: .regular))
                        .foregroundColor(.white.opacity(0.9))
                }
                Spacer()
                if isLoggedIn {
                    Button(action: { showLogoutConfirmation = true }) {
                        Image(systemName: "arrow.right.square.fill")
                            .font(.system(size: 24))
                            .foregroundColor(.white.opacity(0.8))
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 56)
            .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity)
        .background(AppGradients.hero)
    }
    
    /// Dashboard: resumo e acesso rápido (campos exemplo)
    private var dashboardOverviewContent: some View {
        VStack(spacing: 0) {
            merchantHeader
            ScrollView {
                VStack(spacing: AppSpacing.lg) {
                    // Card Resumo
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Resumo")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        HStack(spacing: AppSpacing.md) {
                            summaryCard(icon: "storefront.fill", value: "\(stores.count)", label: "Lojas cadastradas")
                            summaryCard(icon: "tag.fill", value: "—", label: "Ofertas ativas")
                            summaryCard(icon: "chart.line.uptrend.xyaxis", value: "—", label: "Visualizações (30 dias)")
                        }
                    }
                    .padding(AppSpacing.lg)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.card)
                    .cornerRadius(AppRadius.xl)
                    .appShadow(AppShadow.lg)
                    .padding(.horizontal, 24)
                    .padding(.top, -24)
                    
                    // Acesso rápido
                    VStack(alignment: .leading, spacing: AppSpacing.md) {
                        Text("Acesso rápido")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundColor(.cardForeground)
                        Button(action: { withAnimation { activeTab = "stores" } }) {
                            HStack {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color.primary.opacity(0.1))
                                        .frame(width: 40, height: 40)
                                    Image(systemName: "storefront.fill")
                                        .font(.system(size: 20))
                                        .foregroundColor(.primary)
                                }
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Suas Lojas")
                                        .font(.system(size: 16, weight: .medium))
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
                .padding(.bottom, 80)
            }
        }
    }
    
    private func summaryCard(icon: String, value: String, label: String) -> some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 22))
                .foregroundColor(.primary)
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .foregroundColor(.cardForeground)
            Text(label)
                .font(.system(size: 12, weight: .regular))
                .foregroundColor(.mutedForeground)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppSpacing.md)
        .background(Color.muted.opacity(0.5))
        .cornerRadius(AppRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(Color.border, lineWidth: 1)
        )
    }
    
    /// Tela Lojas: lista de lojas, cadastro e edição
    private var storesContent: some View {
        VStack(spacing: 0) {
            merchantHeader
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
                        } else if !showStoreForm {
                            // Estado inicial
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
                                // Está logado e tem lojas - card que engloba todas as lojas (à frente do roxo)
                                VStack(spacing: AppSpacing.md) {
                                    // Header com título e botão Nova Loja
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text("Suas Lojas")
                                                .font(.system(size: 20, weight: .semibold, design: .rounded))
                                                .foregroundColor(.cardForeground)
                                            
                                            Text("\(stores.count) \(stores.count == 1 ? "loja cadastrada" : "lojas cadastradas")")
                                                .font(.system(size: 14, weight: .regular))
                                                .foregroundColor(.mutedForeground)
                                        }
                                        
                                        Spacer()
                                        
                                        Button(action: {
                                            withAnimation {
                                                showStoreForm = true
                                            }
                                        }) {
                                            HStack(spacing: AppSpacing.xs) {
                                                Image(systemName: "plus.circle.fill")
                                                    .font(.system(size: 16))
                                                Text("Nova Loja")
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
                                    .padding(.top, AppSpacing.md)
                                    
                                    // Lista de lojas
                                    VStack(spacing: AppSpacing.sm) {
                                        ForEach(stores) { store in
                                            StoreCardView(
                                                store: store,
                                                onEdit: {
                                                    // Editar loja
                                                    withAnimation {
                                                        editingStore = store
                                                        showStoreForm = false
                                                        selectedStore = nil
                                                    }
                                                },
                                                onTap: {
                                                    // Abrir detalhes da loja
                                                    withAnimation {
                                                        selectedStore = store
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
                                .appShadow(AppShadow.lg)
                            }
                        } else if let storeToView = selectedStore {
                            // View de detalhes da loja
                            MerchantStoreDetailsView(store: storeToView) {
                                withAnimation {
                                    selectedStore = nil
                                }
                            }
                            .transition(.move(edge: .trailing))
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
                                    loadStores() // Recarregar lista de lojas
                                }
                            )
                            .padding(.top, 24)
                            .transition(.move(edge: .trailing))
                        } else {
                            // Formulário de cadastro de loja
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
                                    loadStores() // Recarregar lista de lojas
                                }
                            )
                            .padding(.top, 24)
                        }
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, -24)
                    .padding(.bottom, 80)
                }
            }
        }
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
        
        // Limpar dados do usuário
        userDisplayName = ""
        userEmail = ""
        userPhotoURL = ""
        isLoggedIn = false
        isMerchant = false
        
        print("✅ [MerchantDashboardView] Dados do usuário limpos, redirecionando para login")
    }
}

#Preview {
    MerchantDashboardView()
}
