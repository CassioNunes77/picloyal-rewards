//
//  NotificationsView.swift
//  CartaoFidelidade
//
//  Tela de Notificações (dados do Firestore)
//

import SwiftUI
import FirebaseAuth

struct NotificationsView: View {
    @Binding var activeTab: String
    @State private var notifications: [FirebaseNotification] = []
    @State private var loading = true
    @State private var isToastVisible = false
    @State private var toastMessage = ""
    
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
                            
                            if unreadCount > 0 {
                                Button(action: {
                                    markAllAsRead()
                                }) {
                                    Text("Marcar todas")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.heroForegroundMuted)
                                }
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
                        if loading {
                            VStack(spacing: AppSpacing.md) {
                                ProgressView()
                                    .scaleEffect(1.5)
                                    .padding(.top, AppSpacing.xl * 2)
                                Text("Carregando notificações...")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                            }
                            .padding(.top, AppSpacing.xl * 2)
                        } else if notifications.isEmpty {
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
                                NotificationCardView(notification: notification)
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
            .onAppear {
                loadNotifications()
            }
            
            // Toast
            if isToastVisible {
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
                .animation(.easeInOut, value: isToastVisible)
            }
        }
    }
    
    private func loadNotifications() {
        guard let userId = Auth.auth().currentUser?.uid else {
            loading = false
            return
        }
        Task {
            do {
                let items = try await NotificationsService.shared.getNotifications(userId: userId)
                await MainActor.run {
                    notifications = items
                    loading = false
                }
            } catch {
                await MainActor.run {
                    notifications = []
                    loading = false
                }
            }
        }
    }
    
    private func markAsRead(_ notification: FirebaseNotification) {
        guard let userId = Auth.auth().currentUser?.uid, !notification.isRead else { return }
        Task {
            do {
                try await NotificationsService.shared.markAsRead(notificationId: notification.id, userId: userId)
                await MainActor.run {
                    if let index = notifications.firstIndex(where: { $0.id == notification.id }) {
                        notifications[index] = FirebaseNotification(
                            id: notification.id,
                            userId: notification.userId,
                            type: notification.type,
                            title: notification.title,
                            message: notification.message,
                            isRead: true,
                            createdAt: notification.createdAt,
                            icon: notification.icon,
                            data: notification.data
                        )
                    }
                    displayToast("Notificação marcada como lida")
                }
            } catch {
                await MainActor.run {
                    displayToast("Erro ao marcar como lida")
                }
            }
        }
    }
    
    private func markAllAsRead() {
        guard let userId = Auth.auth().currentUser?.uid, unreadCount > 0 else { return }
        Task {
            do {
                try await NotificationsService.shared.markAllAsRead(userId: userId)
                await MainActor.run {
                    notifications = notifications.map { n in
                        FirebaseNotification(
                            id: n.id,
                            userId: n.userId,
                            type: n.type,
                            title: n.title,
                            message: n.message,
                            isRead: true,
                            createdAt: n.createdAt,
                            icon: n.icon,
                            data: n.data
                        )
                    }
                    displayToast("Todas as notificações foram marcadas como lidas")
                }
            } catch {
                await MainActor.run {
                    displayToast("Erro ao marcar todas como lidas")
                }
            }
        }
    }
    
    private func displayToast(_ message: String) {
        toastMessage = message
        withAnimation {
            isToastVisible = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                isToastVisible = false
            }
        }
    }
}

struct NotificationCardView: View {
    let notification: FirebaseNotification
    
    private var typeColor: Color {
        switch notification.type {
        case .offer: return .primary
        case .points: return .secondary
        case .reward: return Color(red: 0.2, green: 0.8, blue: 0.4)
        case .system: return .mutedForeground
        }
    }
    
    private var relativeTime: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.locale = Locale(identifier: "pt_BR")
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: notification.createdAt, relativeTo: Date())
    }
    
    var body: some View {
        HStack(spacing: AppSpacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.md)
                    .fill(typeColor.opacity(0.1))
                    .frame(width: 48, height: 48)
                
                Image(systemName: notification.sfSymbol)
                    .foregroundColor(typeColor)
                    .font(.system(size: 20))
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.cardForeground)
                    
                    Spacer()
                    
                    if !notification.isRead {
                        Circle()
                            .fill(typeColor)
                            .frame(width: 8, height: 8)
                    }
                }
                
                Text(notification.message)
                    .font(.appBody)
                    .foregroundColor(.mutedForeground)
                    .lineLimit(2)
                
                Text(relativeTime)
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
                .stroke(notification.isRead ? Color.clear : typeColor.opacity(0.3), lineWidth: 1)
        )
    }
}

#Preview {
    NotificationsView(activeTab: .constant("notifications"))
}
