//
//  UserActivitiesService.swift
//  CartaoFidelidade
//
//  Serviço para registrar e listar atividades do usuário.
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

struct UserActivity: Identifiable {
    let id: String
    let userId: String
    let type: String // offer, reward, stamp, purchase, points
    let title: String
    let description: String
    let storeName: String
    let storeId: String?
    let offerId: String?
    let redemptionId: String?
    let merchantId: String?
    let points: Int?
    let status: String? // pending, confirmed
    let createdAt: Date
}

final class UserActivitiesService {
    static let shared = UserActivitiesService()
    private let db = Firestore.firestore()
    private let collectionName = "userActivities"

    private init() {}

    /// Registra atividade quando o usuário solicita uso de oferta
    func recordOfferRequested(
        userId: String,
        redemptionId: String,
        offerId: String,
        offerTitle: String,
        storeId: String,
        storeName: String,
        merchantId: String
    ) {
        let data: [String: Any] = [
            "userId": userId,
            "type": "offer",
            "title": "Oferta solicitada",
            "description": offerTitle,
            "storeName": storeName,
            "storeId": storeId,
            "offerId": offerId,
            "redemptionId": redemptionId,
            "merchantId": merchantId,
            "status": "pending",
            "createdAt": Timestamp(date: Date()),
        ]
        db.collection(collectionName).addDocument(data: data) { error in
            if let error = error {
                print("❌ [UserActivitiesService] Erro ao registrar atividade: \(error.localizedDescription)")
            }
        }
    }

    /// Atualiza atividade quando o lojista confirma o resgate
    func recordOfferConfirmed(redemptionId: String) {
        db.collection(collectionName)
            .whereField("redemptionId", isEqualTo: redemptionId)
            .getDocuments { [weak self] snapshot, error in
                guard let self = self, error == nil, let docs = snapshot?.documents else { return }
                for doc in docs {
                    doc.reference.updateData([
                        "status": "confirmed",
                        "title": "Oferta utilizada",
                        "updatedAt": Timestamp(date: Date()),
                    ]) { err in
                        if let err = err {
                            print("❌ [UserActivitiesService] Erro ao atualizar: \(err.localizedDescription)")
                        }
                    }
                }
            }
    }

    /// Busca atividades do usuário
    func getUserActivities(userId: String, limitCount: Int = 50) async throws -> [UserActivity] {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .order(by: "createdAt", descending: true)
            .limit(to: limitCount)
            .getDocuments()

        return snapshot.documents.compactMap { doc -> UserActivity? in
            let data = doc.data()
            guard let createdAt = (data["createdAt"] as? Timestamp)?.dateValue() else { return nil }
            return UserActivity(
                id: doc.documentID,
                userId: data["userId"] as? String ?? "",
                type: data["type"] as? String ?? "offer",
                title: data["title"] as? String ?? "",
                description: data["description"] as? String ?? "",
                storeName: data["storeName"] as? String ?? "",
                storeId: data["storeId"] as? String,
                offerId: data["offerId"] as? String,
                redemptionId: data["redemptionId"] as? String,
                merchantId: data["merchantId"] as? String,
                points: data["points"] as? Int,
                status: data["status"] as? String,
                createdAt: createdAt
            )
        }
    }
}
