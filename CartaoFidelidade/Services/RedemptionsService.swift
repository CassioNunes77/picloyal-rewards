//
//  RedemptionsService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar resgates de ofertas no Firebase
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

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
    let createdAt: Date
}

class RedemptionsService {
    static let shared = RedemptionsService()
    private let db = Firestore.firestore()
    private let collectionName = "offerRedemptions"
    
    private init() {}
    
    /// Cria um resgate quando o usuário solicita usar uma oferta
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
    
    private func parseRedemption(docId: String, data: [String: Any]) -> FirebaseRedemption? {
        guard let createdAt = dateFromFirestore(data["createdAt"]) else { return nil }
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
