//
//  OffersService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar ofertas no Firebase
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

struct FirebaseOffer: Identifiable, Codable {
    let id: String
    let storeId: String
    let merchantId: String
    let title: String
    let description: String
    let discount: String?
    let category: String
    let validUntil: Date
    let pointsRequired: Int?
    let active: Bool
    let createdAt: Date
    let updatedAt: Date
}

class OffersService {
    static let shared = OffersService()
    private let db = Firestore.firestore()
    private let collectionName = "offers"
    
    private init() {}
    
    /// Cria uma nova oferta
    func createOffer(storeId: String, merchantId: String, offerData: OfferData) async throws -> String {
        print("🔍 [OffersService] Criando oferta para loja: \(storeId)")
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            print("❌ [OffersService] Usuário não autenticado ou merchantId não corresponde ao usuário atual")
            throw NSError(domain: "OffersService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        let offersRef = db.collection(collectionName)
        let now = Timestamp()
        
        var offerDataDict: [String: Any] = [
            "storeId": storeId,
            "merchantId": merchantId,
            "title": offerData.title,
            "description": offerData.description,
            "category": offerData.category,
            "validUntil": Timestamp(date: offerData.validUntil),
            "active": offerData.active,
            "createdAt": now,
            "updatedAt": now
        ]
        
        if let discount = offerData.discount {
            offerDataDict["discount"] = discount
        }
        if let pointsRequired = offerData.pointsRequired {
            offerDataDict["pointsRequired"] = pointsRequired
        }
        
        do {
            let docRef = try await offersRef.addDocument(data: offerDataDict)
            print("✅ [OffersService] Oferta criada com sucesso: \(docRef.documentID)")
            return docRef.documentID
        } catch {
            print("❌ [OffersService] Erro ao criar oferta: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Busca todas as ofertas de uma loja
    func getStoreOffers(storeId: String) async throws -> [FirebaseOffer] {
        print("🔍 [OffersService] Buscando ofertas da loja: \(storeId)")
        
        let offersRef = db.collection(collectionName)
        let query = offersRef
            .whereField("storeId", isEqualTo: storeId)
            .order(by: "createdAt", descending: true)
        
        do {
            let snapshot = try await query.getDocuments()
            print("✅ [OffersService] \(snapshot.documents.count) ofertas encontradas")
            
            var offers: [FirebaseOffer] = []
            
            for document in snapshot.documents {
                do {
                    let offer = try self.parseOffer(documentId: document.documentID, data: document.data())
                    offers.append(offer)
                } catch {
                    print("❌ [OffersService] Erro ao parsear oferta \(document.documentID): \(error.localizedDescription)")
                }
            }
            
            print("✅ [OffersService] \(offers.count) ofertas processadas com sucesso")
            return offers
        } catch {
            print("❌ [OffersService] Erro ao buscar ofertas: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Atualiza uma oferta existente
    func updateOffer(offerId: String, merchantId: String, offerData: OfferUpdateData) async throws {
        print("🔍 [OffersService] Atualizando oferta: \(offerId)")
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            print("❌ [OffersService] Usuário não autenticado ou merchantId não corresponde ao usuário atual")
            throw NSError(domain: "OffersService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        // Verificar se a oferta pertence ao merchant
        let offerRef = db.collection(collectionName).document(offerId)
        let offerDoc = try await offerRef.getDocument()
        
        guard offerDoc.exists,
              let offerMerchantId = offerDoc.data()?["merchantId"] as? String,
              offerMerchantId == merchantId else {
            print("❌ [OffersService] Oferta não encontrada ou não pertence ao merchant")
            throw NSError(domain: "OffersService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Oferta não encontrada"])
        }
        
        // Preparar dados de atualização
        var updateData: [String: Any] = [
            "updatedAt": Timestamp()
        ]
        
        if let title = offerData.title {
            updateData["title"] = title
        }
        if let description = offerData.description {
            updateData["description"] = description
        }
        if let discount = offerData.discount {
            updateData["discount"] = discount
        }
        if let category = offerData.category {
            updateData["category"] = category
        }
        if let validUntil = offerData.validUntil {
            updateData["validUntil"] = Timestamp(date: validUntil)
        }
        if let pointsRequired = offerData.pointsRequired {
            updateData["pointsRequired"] = pointsRequired
        }
        if let active = offerData.active {
            updateData["active"] = active
        }
        
        do {
            try await offerRef.updateData(updateData)
            print("✅ [OffersService] Oferta atualizada com sucesso: \(offerId)")
        } catch {
            print("❌ [OffersService] Erro ao atualizar oferta: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Deleta uma oferta
    func deleteOffer(offerId: String, merchantId: String) async throws {
        print("🔍 [OffersService] Deletando oferta: \(offerId)")
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            print("❌ [OffersService] Usuário não autenticado ou merchantId não corresponde ao usuário atual")
            throw NSError(domain: "OffersService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        // Verificar se a oferta pertence ao merchant
        let offerRef = db.collection(collectionName).document(offerId)
        let offerDoc = try await offerRef.getDocument()
        
        guard offerDoc.exists,
              let offerMerchantId = offerDoc.data()?["merchantId"] as? String,
              offerMerchantId == merchantId else {
            print("❌ [OffersService] Oferta não encontrada ou não pertence ao merchant")
            throw NSError(domain: "OffersService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Oferta não encontrada"])
        }
        
        do {
            try await offerRef.delete()
            print("✅ [OffersService] Oferta deletada com sucesso: \(offerId)")
        } catch {
            print("❌ [OffersService] Erro ao deletar oferta: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Parse de documento do Firestore para FirebaseOffer
    private func parseOffer(documentId: String, data: [String: Any]) throws -> FirebaseOffer {
        guard let storeId = data["storeId"] as? String,
              let merchantId = data["merchantId"] as? String,
              let title = data["title"] as? String,
              let description = data["description"] as? String,
              let category = data["category"] as? String,
              let active = data["active"] as? Bool else {
            throw NSError(domain: "OffersService", code: 1, userInfo: [NSLocalizedDescriptionKey: "Campos obrigatórios faltando"])
        }
        
        let discount = data["discount"] as? String
        let pointsRequired = data["pointsRequired"] as? Int
        
        // Converter timestamps
        var validUntil = Date()
        var createdAt = Date()
        var updatedAt = Date()
        
        if let validUntilTimestamp = data["validUntil"] as? Timestamp {
            validUntil = validUntilTimestamp.dateValue()
        }
        
        if let createdAtTimestamp = data["createdAt"] as? Timestamp {
            createdAt = createdAtTimestamp.dateValue()
        }
        
        if let updatedAtTimestamp = data["updatedAt"] as? Timestamp {
            updatedAt = updatedAtTimestamp.dateValue()
        }
        
        return FirebaseOffer(
            id: documentId,
            storeId: storeId,
            merchantId: merchantId,
            title: title,
            description: description,
            discount: discount,
            category: category,
            validUntil: validUntil,
            pointsRequired: pointsRequired,
            active: active,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

/// Estrutura para dados de entrada ao criar uma oferta
struct OfferData {
    let title: String
    let description: String
    let discount: String?
    let category: String
    let validUntil: Date
    let pointsRequired: Int?
    let active: Bool
}

/// Estrutura para dados de atualização de uma oferta (todos os campos são opcionais)
struct OfferUpdateData {
    let title: String?
    let description: String?
    let discount: String?
    let category: String?
    let validUntil: Date?
    let pointsRequired: Int?
    let active: Bool?
    
    init(
        title: String? = nil,
        description: String? = nil,
        discount: String? = nil,
        category: String? = nil,
        validUntil: Date? = nil,
        pointsRequired: Int? = nil,
        active: Bool? = nil
    ) {
        self.title = title
        self.description = description
        self.discount = discount
        self.category = category
        self.validUntil = validUntil
        self.pointsRequired = pointsRequired
        self.active = active
    }
}
