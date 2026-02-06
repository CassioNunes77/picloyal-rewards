//
//  ProfileView.swift
//  CartaoFidelidade
//
//  Tela de Perfil
//

import SwiftUI

struct ProfileView: View {
    @Binding var activeTab: String
    @State private var notifications = true
    @State private var showToast = false
    @State private var toastMessage = ""
    
    let userStats = [
        ("Pontos", "650", "star.fill", Color.primary),
        ("Carimbos", "7/10", "gift.fill", Color.secondary),
        ("Recompensas", "12", "star.fill", Color.accentForeground)
    ]
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                ZStack(alignment: .top) {
                    VStack(spacing: 0) {
                        // Back button and title
                        HStack {
                            Button(action: {
                                withAnimation {
                                    activeTab = "home"
                                }
                            }) {
                                ZStack {
                                    Circle()
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.white)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            Text("Meu Perfil")
                                .font(.appTitle)
                                .foregroundColor(.white)
                            
                            Spacer()
                            
                            Button(action: { showLoginView = true }) {
                                Text("Entrar")
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, AppSpacing.md)
                                    .padding(.vertical, AppSpacing.sm)
                                    .background(Color.white.opacity(0.2))
                                    .cornerRadius(AppRadius.lg)
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.md)
                        
                        // Profile Card
                        HStack(spacing: AppSpacing.md) {
                            ZStack(alignment: .bottomTrailing) {
                                ZStack {
                                    Circle()
                                        .fill(AppGradients.primary)
                                        .frame(width: 96, height: 96)
                                    
                                    Image(systemName: "person.fill")
                                        .foregroundColor(.primaryForeground)
                                        .font(.system(size: 48))
                                }
                                
                                Button(action: {}) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.white)
                                            .frame(width: 32, height: 32)
                                        
                                        Image(systemName: "camera.fill")
                                            .foregroundColor(.primary)
                                            .font(.system(size: 16))
                                    }
                                }
                                .offset(x: 4, y: 4)
                            }
                            
                            VStack(alignment: .leading, spacing: AppSpacing.xs) {
                                Text("Maria Silva")
                                    .font(.appTitle)
                                    .foregroundColor(.white)
                                
                                Text("maria.silva@email.com")
                                    .font(.appCaption)
                                    .foregroundColor(.white)
                                
                                HStack(spacing: AppSpacing.sm) {
                                    Text("Membro VIP ⭐")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, AppSpacing.md)
                                        .padding(.vertical, 4)
                                        .background(Color.white.opacity(0.2))
                                        .cornerRadius(AppRadius.md)
                                    
                                    Text("Desde 2023")
                                        .font(.system(size: 12, weight: .medium))
                                        .foregroundColor(.white)
                                        .padding(.horizontal, AppSpacing.md)
                                        .padding(.vertical, 4)
                                        .background(Color.white.opacity(0.2))
                                        .cornerRadius(AppRadius.md)
                                }
                            }
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.bottom, AppSpacing.md)
                        .slideUp(delay: 0.1)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(AppGradients.card)
                    .ignoresSafeArea(edges: .top)
                }
                
                // Content
                ScrollView {
                    VStack(spacing: AppSpacing.md) {
                        // Stats
                        HStack(spacing: AppSpacing.md) {
                            ForEach(Array(userStats.enumerated()), id: \.offset) { index, stat in
                                VStack(spacing: AppSpacing.sm) {
                                    Image(systemName: stat.2)
                                        .foregroundColor(stat.3)
                                        .font(.system(size: 24))
                                    
                                    Text(stat.1)
                                        .font(.system(size: 24, weight: .bold))
                                        .foregroundColor(.cardForeground)
                                    
                                    Text(stat.0)
                                        .font(.system(size: 12))
                                        .foregroundColor(.mutedForeground)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(AppSpacing.md)
                                .background(Color.card)
                                .cornerRadius(AppRadius.lg)
                                .appShadow(AppShadow.md)
                                .fadeIn(delay: 0.15 + Double(index) * 0.05)
                            }
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        
                        // Personal Information
                        ProfileSection(title: "Informações Pessoais") {
                            ProfileInfoItem(
                                icon: "envelope.fill",
                                label: "E-mail",
                                value: "maria.silva@email.com",
                                delay: 0.3
                            )
                            
                            ProfileInfoItem(
                                icon: "phone.fill",
                                label: "Telefone",
                                value: "(11) 98765-4321",
                                delay: 0.35
                            )
                            
                            ProfileInfoItem(
                                icon: "mappin.fill",
                                label: "Endereço",
                                value: "Rua Exemplo, 123 - São Paulo, SP",
                                delay: 0.4
                            )
                            
                            ProfileInfoItem(
                                icon: "calendar",
                                label: "Data de Nascimento",
                                value: "15/03/1990",
                                delay: 0.45
                            )
                        }
                        
                        // Account Settings
                        ProfileSection(title: "Configurações da Conta") {
                            ProfileActionItem(
                                icon: "creditcard.fill",
                                label: "Formas de Pagamento",
                                description: "Gerenciar cartões salvos",
                                delay: 0.55
                            ) {
                                showToast(message: "Abrindo formas de pagamento...")
                            }
                            
                            ProfileActionItem(
                                icon: "bell.fill",
                                label: "Notificações",
                                description: "Gerenciar alertas e notificações",
                                delay: 0.6,
                                rightElement: AnyView(
                                    Toggle("", isOn: $notifications)
                                        .toggleStyle(SwitchToggleStyle(tint: .primary))
                                        .onChange(of: notifications) { _, newValue in
                                            showToast(message: newValue ? "Notificações ativadas" : "Notificações desativadas")
                                        }
                                )
                            )
                            
                            ProfileActionItem(
                                icon: "shield.fill",
                                label: "Segurança",
                                description: "Senha e autenticação",
                                delay: 0.65
                            ) {
                                showToast(message: "Abrindo configurações de segurança...")
                            }
                        }
                        
                        // Activity
                        ProfileSection(title: "Atividade") {
                            ProfileActionItem(
                                icon: "gift.fill",
                                label: "Histórico de Recompensas",
                                description: "Ver todas as recompensas resgatadas",
                                delay: 0.75
                            ) {
                                showToast(message: "Abrindo histórico...")
                            }
                            
                            ProfileActionItem(
                                icon: "star.fill",
                                label: "Avaliações",
                                description: "Suas avaliações de estabelecimentos",
                                delay: 0.8
                            ) {
                                showToast(message: "Abrindo avaliações...")
                            }
                        }
                        
                        // Logout
                        Button(action: {
                            showToast(message: "Até logo! 👋")
                        }) {
                            HStack(spacing: AppSpacing.md) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: AppRadius.md)
                                        .fill(Color.destructive.opacity(0.1))
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "arrow.right.square.fill")
                                        .foregroundColor(.destructive)
                                        .font(.system(size: 20))
                                }
                                
                                Text("Sair da Conta")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.destructive)
                                
                                Spacer()
                                
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.destructive)
                                    .font(.system(size: 20))
                            }
                            .padding(AppSpacing.md)
                            .background(Color.destructive.opacity(0.1))
                            .cornerRadius(AppRadius.lg)
                        }
                        .buttonStyle(PlainButtonStyle())
                        .fadeIn(delay: 0.85)
                        
                        // Version
                        Text("Versão 1.0.0 • Cartão Fidelidade")
                            .font(.system(size: 12))
                            .foregroundColor(.mutedForeground)
                            .padding(.top, AppSpacing.sm)
                            .fadeIn(delay: 0.9)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.md)
                    .padding(.bottom, 100)
                }
                .background(Color.appBackground)
                .cornerRadius(AppRadius.xl, corners: [.topLeft, .topRight])
                .offset(y: -AppRadius.xl)
            }
            
            // Toast
            if showToast {
                VStack {
                    Spacer()
                    
                    Text(toastMessage)
                        .font(.appBody)
                        .foregroundColor(.white)
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.vertical, AppSpacing.md)
                        .background(Color.appForeground.opacity(0.9))
                        .cornerRadius(AppRadius.md)
                        .padding(.bottom, 100)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.easeInOut, value: showToast)
            }
        }
        .fullScreenCover(isPresented: $showLoginView) {
            LoginView(
                onLogin: { _, _, _ in
                    showToast(message: "Login em breve com Firebase")
                    showLoginView = false
                },
                onDismiss: { showLoginView = false }
            )
        }
        .ignoresSafeArea(edges: .top)
    }
    
    private func showToast(message: String) {
        toastMessage = message
        withAnimation {
            showToast = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                showToast = false
            }
        }
    }
}

struct ProfileSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.mutedForeground)
                .textCase(.uppercase)
                .tracking(1)
                .padding(.horizontal, 4)
            
            VStack(spacing: AppSpacing.sm) {
                content
            }
        }
        .padding(.horizontal, AppSpacing.lg)
    }
}

struct ProfileInfoItem: View {
    let icon: String
    let label: String
    let value: String
    let delay: Double
    @State private var isPressed = false
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(Color.accent)
                    .frame(width: 40, height: 40)
                
                Image(systemName: icon)
                    .foregroundColor(.accentForeground)
                    .font(.system(size: 20))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(label)
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
                
                Text(value)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.cardForeground)
                    .lineLimit(1)
            }
            
            Spacer()
            
            Button(action: {}) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.sm)
                        .fill(Color.muted)
                        .frame(width: 32, height: 32)
                    
                    Image(systemName: "pencil")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 14))
                }
            }
        }
        .padding(AppSpacing.md)
        .background(Color.card)
        .cornerRadius(AppRadius.lg)
        .appShadow(AppShadow.md)
        .fadeIn(delay: delay)
    }
}

struct ProfileActionItem: View {
    let icon: String
    let label: String
    let description: String?
    let delay: Double
    let action: () -> Void
    let rightElement: AnyView?
    
    @State private var isPressed = false
    
    init(
        icon: String,
        label: String,
        description: String? = nil,
        delay: Double = 0,
        rightElement: AnyView? = nil,
        action: @escaping () -> Void = {}
    ) {
        self.icon = icon
        self.label = label
        self.description = description
        self.delay = delay
        self.rightElement = rightElement
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: AppSpacing.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.md)
                        .fill(Color.accent)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: icon)
                        .foregroundColor(.accentForeground)
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.cardForeground)
                    
                    if let description = description {
                        Text(description)
                            .font(.appCaption)
                            .foregroundColor(.mutedForeground)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                if let rightElement = rightElement {
                    rightElement
                } else {
                    Image(systemName: "chevron.right")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 20))
                }
            }
            .padding(AppSpacing.md)
            .background(Color.card)
            .cornerRadius(AppRadius.lg)
            .appShadow(isPressed ? AppShadow.sm : AppShadow.md)
            .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .fadeIn(delay: delay)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    if !isPressed {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    isPressed = false
                }
        )
    }
}

#Preview {
    ProfileView(activeTab: .constant("profile"))
}
