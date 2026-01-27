//
//  SettingsScreen.swift
//  CartaoFidelidade
//
//  Tela de configurações
//

import SwiftUI

struct SettingsScreen: View {
    let onBack: () -> Void
    @State private var notifications = true
    @State private var darkMode = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                // Header
                ZStack(alignment: .top) {
                    VStack(spacing: 0) {
                        // Back button and title
                        HStack {
                            Button(action: onBack) {
                                ZStack {
                                    Circle()
                                        .fill(Color.white.opacity(0.2))
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.white)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            Text("Configurações")
                                .font(.appTitle)
                                .foregroundColor(.white)
                            
                            Spacer()
                        }
                        .padding(.horizontal, AppSpacing.lg)
                        .padding(.top, 48)
                        .padding(.bottom, AppSpacing.lg)
                    }
                    .padding(.bottom, AppSpacing.lg)
                    .background(AppGradients.hero)
                    .ignoresSafeArea(edges: .top)
                }
                
                // Content
                VStack(spacing: AppSpacing.lg) {
                    // Profile Section
                    Button(action: {}) {
                        HStack(spacing: AppSpacing.md) {
                            ZStack {
                                Circle()
                                    .fill(AppGradients.card)
                                    .frame(width: 64, height: 64)
                                
                                Image(systemName: "person.fill")
                                    .foregroundColor(.primaryForeground)
                                    .font(.system(size: 32))
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Maria Silva")
                                    .font(.appHeadline)
                                    .foregroundColor(.cardForeground)
                                
                                Text("maria.silva@email.com")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Membro VIP ⭐")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.primary)
                            }
                            
                            Spacer()
                            
                            Image(systemName: "chevron.right")
                                .foregroundColor(.mutedForeground)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.card)
                        .cornerRadius(AppRadius.xl)
                        .appShadow(AppShadow.md)
                    }
                    .buttonStyle(PlainButtonStyle())
                    .fadeIn(delay: 0)
                    
                    // Preferences
                    SettingsSection(title: "Preferências") {
                        SettingsItem(
                            icon: "bell.fill",
                            label: "Notificações",
                            description: "Receber alertas de ofertas e pontos",
                            delay: 0.05,
                            rightElement: AnyView(
                                Toggle("", isOn: $notifications)
                                    .toggleStyle(SwitchToggleStyle(tint: .primary))
                            )
                        )
                        
                        SettingsItem(
                            icon: "moon.fill",
                            label: "Modo Escuro",
                            description: "Alterar aparência do app",
                            delay: 0.1,
                            rightElement: AnyView(
                                Toggle("", isOn: $darkMode)
                                    .toggleStyle(SwitchToggleStyle(tint: .primary))
                            )
                        )
                        
                        SettingsItem(
                            icon: "iphone",
                            label: "Instalar App",
                            description: "Adicionar à tela inicial",
                            delay: 0.15
                        )
                    }
                    
                    // Account
                    SettingsSection(title: "Conta") {
                        SettingsItem(
                            icon: "creditcard.fill",
                            label: "Formas de Pagamento",
                            description: "Gerenciar cartões salvos",
                            delay: 0.25
                        )
                        
                        SettingsItem(
                            icon: "shield.fill",
                            label: "Segurança",
                            description: "Senha e autenticação",
                            delay: 0.3
                        )
                        
                        SettingsItem(
                            icon: "square.and.arrow.up.fill",
                            label: "Indicar Amigos",
                            description: "Ganhe 50 pontos por indicação",
                            delay: 0.35
                        )
                    }
                    
                    // Support
                    SettingsSection(title: "Suporte") {
                        SettingsItem(
                            icon: "questionmark.circle.fill",
                            label: "Central de Ajuda",
                            description: "Perguntas frequentes",
                            delay: 0.45
                        )
                        
                        SettingsItem(
                            icon: "message.fill",
                            label: "Fale Conosco",
                            description: "Chat ou e-mail",
                            delay: 0.5
                        )
                        
                        SettingsItem(
                            icon: "star.fill",
                            label: "Avalie o App",
                            description: "Sua opinião é importante",
                            delay: 0.55
                        )
                    }
                    
                    // Account Actions
                    SettingsSection(title: "Ações da Conta") {
                        SettingsItem(
                            icon: "trash.fill",
                            label: "Excluir Conta",
                            description: "Excluir permanentemente sua conta e todos os dados",
                            delay: 0.6,
                            isDanger: true,
                            action: {
                                // Aqui você pode adicionar a lógica para excluir a conta
                                // Por exemplo, mostrar um alerta de confirmação
                            }
                        )
                        
                        SettingsItem(
                            icon: "arrow.right.square.fill",
                            label: "Sair da Conta",
                            delay: 0.65,
                            isDanger: true
                        )
                    }
                    
                    // Version
                    Text("Versão 1.0.0 • Cartão Fidelidade")
                        .font(.system(size: 12))
                        .foregroundColor(.mutedForeground)
                        .padding(.top, AppSpacing.md)
                        .fadeIn(delay: 0.65)
                }
                .padding(.horizontal, AppSpacing.lg)
                .padding(.top, AppSpacing.lg)
                .padding(.bottom, 100)
                .background(Color.appBackground)
                .cornerRadius(AppRadius.xl, corners: [.topLeft, .topRight])
                .offset(y: -AppRadius.xl)
            }
        }
        .transition(.move(edge: .trailing))
    }
}

struct SettingsSection<Content: View>: View {
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
    }
}

struct SettingsItem: View {
    let icon: String
    let label: String
    let description: String?
    let delay: Double
    let isDanger: Bool
    let rightElement: AnyView?
    let action: (() -> Void)?
    
    @State private var isPressed = false
    
    init(
        icon: String,
        label: String,
        description: String? = nil,
        delay: Double = 0,
        isDanger: Bool = false,
        rightElement: AnyView? = nil,
        action: (() -> Void)? = nil
    ) {
        self.icon = icon
        self.label = label
        self.description = description
        self.delay = delay
        self.isDanger = isDanger
        self.rightElement = rightElement
        self.action = action
    }
    
    var body: some View {
        Button(action: {
            action?()
        }) {
            HStack(spacing: AppSpacing.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: AppRadius.md)
                        .fill(isDanger ? Color.destructive.opacity(0.1) : Color.accent)
                        .frame(width: 40, height: 40)
                    
                    Image(systemName: icon)
                        .foregroundColor(isDanger ? .destructive : .accentForeground)
                        .font(.system(size: 20))
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(isDanger ? .destructive : .cardForeground)
                    
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
    SettingsScreen(onBack: {})
}
