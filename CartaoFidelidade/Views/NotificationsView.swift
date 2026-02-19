//
//  NotificationsView.swift
//  CartaoFidelidade
//
//  Tela de Notificações
//

import SwiftUI

struct Notification: Identifiable {
    let id: Int
    let title: String
    let message: String
    let time: String
    let icon: String
    let type: NotificationType
    let isRead: Bool
}

enum NotificationType {
    case offer
    case points
    case reward
    case system
    
    var color: Color {
        switch self {
        case .offer:
            return .primary
        case .points:
            return .secondary
        case .reward:
            return Color(red: 0.2, green: 0.8, blue: 0.4)
        case .system:
            return .mutedForeground
        }
    }
}

struct NotificationsView: View {
    @Binding var activeTab: String
    @State private var showToast = false
    @State private var toastMessage = ""
    
    @State private var notifications = [
        Notification(
            id: 1,
            title: "Nova Oferta Disponível!",
            message: "20% OFF em todas as bebidas do Café Central",
            time: "Há 5 minutos",
            icon: "tag.fill",
            type: .offer,
            isRead: false
        ),
        Notification(
            id: 2,
            title: "Pontos Adicionados",
            message: "Você ganhou 50 pontos pela sua última compra",
            time: "Há 1 hora",
            icon: "star.fill",
            type: .points,
            isRead: false
        ),
        Notification(
            id: 3,
            title: "Recompensa Disponível",
            message: "Você pode resgatar: 1 Café Grátis",
            time: "Há 2 horas",
            icon: "gift.fill",
            type: .reward,
            isRead: true
        ),
        Notification(
            id: 4,
            title: "Lembrete de Oferta",
            message: "A oferta 'Compre 2, Leve 3' expira em 2 dias",
            time: "Há 3 horas",
            icon: "clock.fill",
            type: .offer,
            isRead: true
        ),
        Notification(
            id: 5,
            title: "Bem-vindo!",
            message: "Obrigado por se juntar ao nosso programa de fidelidade",
            time: "Há 1 dia",
            icon: "checkmark.circle.fill",
            type: .system,
            isRead: true
        ),
        Notification(
            id: 6,
            title: "Pontos em Dobro",
            message: "Esta semana você ganha o dobro de pontos em todas as compras",
            time: "Há 2 dias",
            icon: "sparkles",
            type: .points,
            isRead: true
        )
    ]
    
    var unreadCount: Int {
        notifications.filter { !$0.isRead }.count
    }
    
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
                                        .fill(Color.heroOverlay)
                                        .frame(width: 40, height: 40)
                                    
                                    Image(systemName: "chevron.left")
                                        .foregroundColor(.heroForeground)
                                        .font(.system(size: 20))
                                }
                            }
                            
                            HStack(spacing: AppSpacing.sm) {
                                Image(systemName: "bell.fill")
                                    .foregroundColor(.heroForeground)
                                    .font(.system(size: 24))
                                
                                Text("Notificações")
                                    .font(.appTitle)
                                    .foregroundColor(.heroForeground)
                                
                                if unreadCount > 0 {
                                    ZStack {
                                        Circle()
                                            .fill(Color.destructive)
                                            .frame(width: 20, height: 20)
                                        
                                        Text("\(unreadCount)")
                                            .font(.system(size: 10, weight: .bold))
                                            .foregroundColor(.white)
                                    }
                                }
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                markAllAsRead()
                            }) {
                                Text("Marcar todas")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.heroForegroundMuted)
                            }
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
                ScrollView {
                    VStack(spacing: AppSpacing.md) {
                        if notifications.isEmpty {
                            VStack(spacing: AppSpacing.md) {
                                Image(systemName: "bell.slash")
                                    .font(.system(size: 48))
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Nenhuma notificação")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                
                                Text("Você está em dia!")
                                    .font(.appCaption)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else {
                            ForEach(Array(notifications.enumerated()), id: \.element.id) { index, notification in
                                NotificationCard(notification: notification)
                                    .fadeIn(delay: 0.1 + Double(index) * 0.05)
                                    .onTapGesture {
                                        markAsRead(notification)
                                    }
                            }
                        }
                        
                        Spacer()
                            .frame(height: 100)
                    }
                    .padding(.horizontal, AppSpacing.lg)
                    .padding(.top, AppSpacing.lg)
                }
                .background(
                    RoundedCorner(radius: AppRadius.xl, corners: [.topLeft, .topRight])
                        .fill(Color.appBackground)
                )
                .clipShape(RoundedCorner(radius: AppRadius.xl, corners: [.topLeft, .topRight]))
                .offset(y: -AppRadius.xl)
            }
            
            // Toast
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
    }
    
    private func markAsRead(_ notification: Notification) {
        if let index = notifications.firstIndex(where: { $0.id == notification.id }) {
            notifications[index] = Notification(
                id: notification.id,
                title: notification.title,
                message: notification.message,
                time: notification.time,
                icon: notification.icon,
                type: notification.type,
                isRead: true
            )
            showToast(message: "Notificação marcada como lida")
        }
    }
    
    private func markAllAsRead() {
        for index in notifications.indices {
            notifications[index] = Notification(
                id: notifications[index].id,
                title: notifications[index].title,
                message: notifications[index].message,
                time: notifications[index].time,
                icon: notifications[index].icon,
                type: notifications[index].type,
                isRead: true
            )
        }
        showToast(message: "Todas as notificações foram marcadas como lidas")
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

struct NotificationCard: View {
    let notification: Notification
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            // Icon
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(notification.type.color.opacity(0.1))
                    .frame(width: 48, height: 48)
                
                Image(systemName: notification.icon)
                    .foregroundColor(notification.type.color)
                    .font(.system(size: 20))
            }
            
            // Content
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.cardForeground)
                    
                    Spacer()
                    
                    if !notification.isRead {
                        Circle()
                            .fill(notification.type.color)
                            .frame(width: 8, height: 8)
                    }
                }
                
                Text(notification.message)
                    .font(.appBody)
                    .foregroundColor(.mutedForeground)
                    .lineLimit(2)
                
                Text(notification.time)
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
            }
        }
        .padding(AppSpacing.md)
        .background(notification.isRead ? Color.card : Color.card.opacity(0.7))
        .cornerRadius(AppRadius.lg)
        .appShadow(AppShadow.sm)
        .overlay(
            RoundedRectangle(cornerRadius: AppRadius.lg)
                .stroke(notification.isRead ? Color.clear : notification.type.color.opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    NotificationsView(activeTab: .constant("notifications"))
}
