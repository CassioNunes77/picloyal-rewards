//
//  NotificationsService.swift
//  CartaoFidelidade
//
//  Serviço para notificações do usuário no Firestore
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

enum NotificationType: String {
    case offer = "offer"
    case points = "points"
    case reward = "reward"
    case system = "system"
}

struct FirebaseNotification: Identifiable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let message: String
    let isRead: Bool
    let createdAt: Date
    let icon: String?
    let data: [String: String]?
    
    var sfSymbol: String {
        switch icon ?? "" {
        case "tag": return "tag.fill"
        case "star": return "star.fill"
        case "gift": return "gift.fill"
        case "check": return "checkmark.circle.fill"
        case "clock": return "clock.fill"
        case "sparkles": return "sparkles"
        default:
            switch type {
            case .offer: return "tag.fill"
            case .points: return "star.fill"
            case .reward: return "gift.fill"
            case .system: return "checkmark.circle.fill"
            }
        }
    }
}

class NotificationsService {
    static let shared = NotificationsService()
    private let db = Firestore.firestore()
    private let collectionName = "notifications"
    
    private init() {}
    
    /// Busca notificações do usuário (mais recentes primeiro)
    func getNotifications(userId: String, limitCount: Int = 50) async throws -> [FirebaseNotification] {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .getDocuments()
        
        var items = snapshot.documents.compactMap { doc -> FirebaseNotification? in
            parseNotification(docId: doc.documentID, data: doc.data())
        }
        items.sort { $0.createdAt > $1.createdAt }
        return Array(items.prefix(limitCount))
    }
    
    /// Marca uma notificação como lida
    func markAsRead(notificationId: String, userId: String) async throws {
        let ref = db.collection(collectionName).document(notificationId)
        try await ref.updateData(["isRead": true])
    }
    
    /// Marca todas as notificações do usuário como lidas
    func markAllAsRead(userId: String) async throws {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .whereField("isRead", isEqualTo: false)
            .getDocuments()
        
        let batch = db.batch()
        for doc in snapshot.documents {
            batch.updateData(["isRead": true], forDocument: doc.reference)
        }
        if !snapshot.documents.isEmpty {
            try await batch.commit()
        }
    }
    
    /// Conta notificações não lidas
    func getUnreadCount(userId: String) async throws -> Int {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .whereField("isRead", isEqualTo: false)
            .getDocuments()
        return snapshot.documents.count
    }
    
    /// Cria uma notificação para um usuário (chamado pelo lojista ao confirmar resgate)
    func createNotification(
        userId: String,
        type: NotificationType,
        title: String,
        message: String,
        icon: String? = nil,
        data: [String: String]? = nil
    ) async throws -> String {
        let iconValue = icon ?? iconForType(type)
        let docRef = try await db.collection(collectionName).addDocument(data: [
            "userId": userId,
            "type": type.rawValue,
            "title": title,
            "message": message,
            "isRead": false,
            "createdAt": Timestamp(),
            "icon": iconValue,
            "data": data ?? [:]
        ])
        return docRef.documentID
    }
    
    private func iconForType(_ type: NotificationType) -> String {
        switch type {
        case .offer: return "tag"
        case .points: return "star"
        case .reward: return "gift"
        case .system: return "check"
        }
    }
    
    private func parseNotification(docId: String, data: [String: Any]) -> FirebaseNotification? {
        guard let createdAt = dateFromFirestore(data["createdAt"]) else { return nil }
        let typeRaw = (data["type"] as? String) ?? "system"
        let type = NotificationType(rawValue: typeRaw) ?? .system
        let dataDict = data["data"] as? [String: String]
        return FirebaseNotification(
            id: docId,
            userId: (data["userId"] as? String) ?? "",
            type: type,
            title: (data["title"] as? String) ?? "",
            message: (data["message"] as? String) ?? "",
            isRead: (data["isRead"] as? Bool) ?? false,
            createdAt: createdAt,
            icon: data["icon"] as? String,
            data: dataDict
        )
    }
    
    private func dateFromFirestore(_ value: Any?) -> Date? {
        guard let value = value else { return nil }
        if let ts = value as? Timestamp { return ts.dateValue() }
        if let dict = value as? [String: Any], let seconds = dict["seconds"] as? Int64 {
            return Date(timeIntervalSince1970: TimeInterval(seconds))
        }
        return nil
    }
}
