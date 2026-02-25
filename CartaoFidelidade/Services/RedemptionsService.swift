//
//  RedemptionsService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar resgates de ofertas no Firebase
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

enum RedemptionStatus: String {
    case pending = "pending"   // Oferta Solicitada
    case confirmed = "confirmed" // Oferta Resgatada
}

struct FirebaseRedemption: Identifiable {
    let id: String
    let offerId: String
    let offerTitle: String
    let storeId: String
    let storeName: String
    let merchantId: String
    let userId: String
    let userName: String
    let userEmail: String
    let status: RedemptionStatus
    let createdAt: Date
}

class RedemptionsService {
    static let shared = RedemptionsService()
    private let db = Firestore.firestore()
    private let collectionName = "offerRedemptions"
    
    private init() {}
    
    /// Cria um resgate quando o usuário solicita usar uma oferta.
    /// Não cria duplicata se já existir resgate pendente para o mesmo usuário+oferta.
    func createRedemption(
        offerId: String,
        offerTitle: String,
        storeId: String,
        storeName: String,
        merchantId: String
    ) async throws -> String {
        guard let user = Auth.auth().currentUser else {
            throw NSError(domain: "RedemptionsService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        // Evitar duplicatas: se já existe resgate pendente, retornar o id existente
        if let existing = try await getUserRedemptionForOffer(userId: user.uid, offerId: offerId),
           existing.status == .pending {
            return existing.id
        }
        
        let ref = db.collection(collectionName)
        let data: [String: Any] = [
            "offerId": offerId,
            "offerTitle": offerTitle,
            "storeId": storeId,
            "storeName": storeName,
            "merchantId": merchantId,
            "userId": user.uid,
            "userName": user.displayName ?? user.email?.components(separatedBy: "@").first ?? "Usuário",
            "userEmail": user.email ?? "",
            "status": RedemptionStatus.pending.rawValue,
            "createdAt": Timestamp()
        ]
        
        let docRef = try await ref.addDocument(data: data)
        return docRef.documentID
    }
    
    /// Busca resgates do merchant, opcionalmente filtrados por loja
    func getMerchantRedemptions(merchantId: String, storeId: String? = nil) async throws -> [FirebaseRedemption] {
        var query: Query = db.collection(collectionName)
            .whereField("merchantId", isEqualTo: merchantId)
        
        if let sid = storeId, !sid.isEmpty {
            query = query.whereField("storeId", isEqualTo: sid)
        }
        
        let snapshot = try await query.getDocuments()
        return snapshot.documents.compactMap { doc in
            parseRedemption(docId: doc.documentID, data: doc.data())
        }.sorted { $0.createdAt > $1.createdAt }
    }
    
    /// Retorna mapa offerId -> status dos resgates do usuário (para exibir na lista de ofertas).
    func getUserRedemptionsMap(userId: String) async throws -> [String: RedemptionStatus] {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .order(by: "createdAt", descending: true)
            .getDocuments()
        var map: [String: RedemptionStatus] = [:]
        for doc in snapshot.documents {
            guard let redemption = parseRedemption(docId: doc.documentID, data: doc.data()) else { continue }
            if !redemption.offerId.isEmpty, map[redemption.offerId] == nil {
                map[redemption.offerId] = redemption.status
            }
        }
        return map
    }
    
    /// Busca o resgate mais recente do usuário para uma oferta (para exibir status na tela de detalhes)
    func getUserRedemptionForOffer(userId: String, offerId: String) async throws -> FirebaseRedemption? {
        let snapshot = try await db.collection(collectionName)
            .whereField("userId", isEqualTo: userId)
            .whereField("offerId", isEqualTo: offerId)
            .order(by: "createdAt", descending: true)
            .limit(to: 1)
            .getDocuments()
        return snapshot.documents.first.flatMap { parseRedemption(docId: $0.documentID, data: $0.data()) }
    }
    
    /// Confirma o resgate (lojista marca como atendido)
    func confirmRedemption(redemptionId: String, merchantId: String) async throws {
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            throw NSError(domain: "RedemptionsService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Não autorizado"])
        }
        let ref = db.collection(collectionName).document(redemptionId)
        try await ref.updateData([
            "status": RedemptionStatus.confirmed.rawValue,
            "confirmedAt": Timestamp()
        ])
    }
    
    private func parseRedemption(docId: String, data: [String: Any]) -> FirebaseRedemption? {
        guard let createdAt = dateFromFirestore(data["createdAt"]) else { return nil }
        let statusRaw = (data["status"] as? String) ?? RedemptionStatus.pending.rawValue
        let status = RedemptionStatus(rawValue: statusRaw) ?? .pending
        return FirebaseRedemption(
            id: docId,
            offerId: (data["offerId"] as? String) ?? "",
            offerTitle: (data["offerTitle"] as? String) ?? "",
            storeId: (data["storeId"] as? String) ?? "",
            storeName: (data["storeName"] as? String) ?? "",
            merchantId: (data["merchantId"] as? String) ?? "",
            userId: (data["userId"] as? String) ?? "",
            userName: (data["userName"] as? String) ?? "",
            userEmail: (data["userEmail"] as? String) ?? "",
            status: status,
            createdAt: createdAt
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
