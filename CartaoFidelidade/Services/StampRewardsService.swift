//
//  StampRewardsService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar programas de carimbo (stamp rewards) no Firebase
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

struct FirebaseStampReward: Identifiable {
    let id: String
    let storeId: String
    let storeName: String?
    let merchantId: String
    let totalStamps: Int
    let rewardTitle: String
    let active: Bool
    let createdAt: Date
    let updatedAt: Date
}

class StampRewardsService {
    static let shared = StampRewardsService()
    private let db = Firestore.firestore()
    private let collectionName = "stampRewards"
    
    private init() {}
    
    /// Cria um novo programa de carimbo
    func createStampReward(storeId: String, merchantId: String, totalStamps: Int, rewardTitle: String) async throws -> String {
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            throw NSError(domain: "StampRewardsService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        let ref = db.collection(collectionName).document()
        let now = Timestamp()
        let data: [String: Any] = [
            "storeId": storeId,
            "merchantId": merchantId,
            "totalStamps": totalStamps,
            "rewardTitle": rewardTitle,
            "active": true,
            "createdAt": now,
            "updatedAt": now
        ]
        
        try await ref.setData(data)
        return ref.documentID
    }
    
    /// Busca todos os programas de carimbo ativos (para exibição na home do usuário)
    /// - Parameter cityFilter: formato "Cidade, UF" ou "Cidade - UF" — quando informado, filtra por lojas da cidade
    func getAllStampRewards(cityFilter: String? = nil) async throws -> [FirebaseStampReward] {
        let snapshot = try await db.collection(collectionName)
            .whereField("active", isEqualTo: true)
            .getDocuments()
        
        var storeIdsInCity: Set<String>? = nil
        if let filter = cityFilter, !filter.trimmingCharacters(in: .whitespaces).isEmpty {
            let stores = try await StoresService.shared.getStoresByCity(cityFilter: filter)
            storeIdsInCity = Set(stores.map { $0.id })
        }
        
        var rewards: [FirebaseStampReward] = []
        for doc in snapshot.documents {
            guard let base = try? parseStampReward(doc.documentID, doc.data()) else { continue }
            if let ids = storeIdsInCity, !ids.contains(base.storeId) { continue }
            let store = try? await StoresService.shared.getStoreById(storeId: base.storeId)
            let reward = FirebaseStampReward(
                id: base.id,
                storeId: base.storeId,
                storeName: store?.name,
                merchantId: base.merchantId,
                totalStamps: base.totalStamps,
                rewardTitle: base.rewardTitle,
                active: base.active,
                createdAt: base.createdAt,
                updatedAt: base.updatedAt
            )
            rewards.append(reward)
        }
        return rewards
    }
    
    /// Busca programas de carimbo de uma loja
    func getStoreStampRewards(storeId: String, storeName: String? = nil) async throws -> [FirebaseStampReward] {
        let snapshot = try await db.collection(collectionName)
            .whereField("storeId", isEqualTo: storeId)
            .getDocuments()
        
        return snapshot.documents.compactMap { doc in
            try? parseStampReward(doc.documentID, doc.data(), storeName: storeName)
        }
    }
    
    private func parseStampReward(_ id: String, _ data: [String: Any], storeName: String? = nil) throws -> FirebaseStampReward {
        let totalStamps = (data["totalStamps"] as? Int) ?? (data["totalStamps"] as? Int64).map { Int($0) } ?? 0
        return FirebaseStampReward(
            id: id,
            storeId: data["storeId"] as? String ?? "",
            storeName: storeName,
            merchantId: data["merchantId"] as? String ?? "",
            totalStamps: totalStamps,
            rewardTitle: data["rewardTitle"] as? String ?? "",
            active: data["active"] as? Bool ?? true,
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date(),
            updatedAt: (data["updatedAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }
}
