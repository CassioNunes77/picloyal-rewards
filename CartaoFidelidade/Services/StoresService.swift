//
//  StoresService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar lojas no Firebase
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

struct FirebaseStore: Identifiable, Codable {
    let id: String
    let merchantId: String
    let name: String
    let cnpj: String
    let address: String
    let city: String
    let phone: String
    let hours: String
    let photoURL: String?
    let active: Bool
    let createdAt: Date
    let updatedAt: Date
}

class StoresService {
    static let shared = StoresService()
    private let db = Firestore.firestore()
    private let collectionName = "stores"
    private let merchantsCollectionName = "merchants"
    
    private init() {}
    
    /// Cria uma nova loja para um lojista
    func createStore(merchantId: String, storeData: StoreData) async throws -> String {
        print("🔍 [StoresService] Criando loja para merchant: \(merchantId)")
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            print("❌ [StoresService] Usuário não autenticado ou merchantId não corresponde ao usuário atual")
            throw NSError(domain: "StoresService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        // Verificar se o merchant existe
        let merchantRef = db.collection(merchantsCollectionName).document(merchantId)
        let merchantDoc = try await merchantRef.getDocument()
        
        if !merchantDoc.exists {
            print("❌ [StoresService] Merchant não encontrado: \(merchantId)")
            throw NSError(domain: "StoresService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Lojista não encontrado"])
        }
        
        // Criar documento da loja
        let storeRef = db.collection(collectionName).document()
        let now = Timestamp()
        
        let storeData: [String: Any] = [
            "merchantId": merchantId,
            "name": storeData.name,
            "cnpj": storeData.cnpj,
            "address": storeData.address,
            "city": storeData.city,
            "phone": storeData.phone,
            "hours": storeData.hours,
            "photoURL": storeData.photoURL ?? NSNull(),
            "active": storeData.active,
            "createdAt": now,
            "updatedAt": now
        ]
        
        do {
            try await storeRef.setData(storeData)
            print("✅ [StoresService] Loja criada com sucesso: \(storeRef.documentID)")
            
            // Atualizar lista de lojas do merchant
            let currentStores = merchantDoc.data()?["stores"] as? [String] ?? []
            try await merchantRef.updateData([
                "stores": currentStores + [storeRef.documentID],
                "updatedAt": Timestamp()
            ])
            
            print("✅ [StoresService] Lista de lojas do merchant atualizada")
            return storeRef.documentID
        } catch {
            print("❌ [StoresService] Erro ao criar loja: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Atualiza uma loja existente
    func updateStore(storeId: String, merchantId: String, storeData: StoreUpdateData) async throws {
        print("🔍 [StoresService] Atualizando loja: \(storeId)")
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            print("❌ [StoresService] Usuário não autenticado ou merchantId não corresponde ao usuário atual")
            throw NSError(domain: "StoresService", code: 401, userInfo: [NSLocalizedDescriptionKey: "Usuário não autenticado"])
        }
        
        // Verificar se a loja pertence ao merchant
        let storeRef = db.collection(collectionName).document(storeId)
        let storeDoc = try await storeRef.getDocument()
        
        guard storeDoc.exists,
              let storeMerchantId = storeDoc.data()?["merchantId"] as? String,
              storeMerchantId == merchantId else {
            print("❌ [StoresService] Loja não encontrada ou não pertence ao merchant")
            throw NSError(domain: "StoresService", code: 404, userInfo: [NSLocalizedDescriptionKey: "Loja não encontrada"])
        }
        
        // Preparar dados de atualização
        var updateData: [String: Any] = [
            "updatedAt": Timestamp()
        ]
        
        if let name = storeData.name {
            updateData["name"] = name
        }
        if let cnpj = storeData.cnpj {
            updateData["cnpj"] = cnpj
        }
        if let address = storeData.address {
            updateData["address"] = address
        }
        if let city = storeData.city {
            updateData["city"] = city
        }
        if let phone = storeData.phone {
            updateData["phone"] = phone
        }
        if let hours = storeData.hours {
            updateData["hours"] = hours
        }
        if let active = storeData.active {
            updateData["active"] = active
        }
        if let photoURL = storeData.photoURL {
            updateData["photoURL"] = photoURL
        }
        
        do {
            try await storeRef.updateData(updateData)
            print("✅ [StoresService] Loja atualizada com sucesso: \(storeId)")
        } catch {
            print("❌ [StoresService] Erro ao atualizar loja: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Busca lojas ativas por cidade (para app do usuário)
    /// cityFilter: formato "Cidade, UF" (LocationSelector) ou "Cidade - UF" (store.city)
    func getStoresByCity(cityFilter: String) async throws -> [FirebaseStore] {
        let normalizedCity = cityFilter.replacingOccurrences(of: ", ", with: " - ")
        
        let storesRef = db.collection(collectionName)
        let query = storesRef
            .whereField("city", isEqualTo: normalizedCity)
            .whereField("active", isEqualTo: true)
        
        do {
            let snapshot = try await query.getDocuments()
            var stores: [FirebaseStore] = []
            for document in snapshot.documents {
                do {
                    let store = try parseStore(documentId: document.documentID, data: document.data())
                    stores.append(store)
                } catch {
                    print("❌ [StoresService] Erro ao parsear loja \(document.documentID): \(error.localizedDescription)")
                }
            }
            stores.sort { $0.name.localizedCompare($1.name) == .orderedAscending }
            return stores
        } catch {
            print("❌ [StoresService] Erro ao buscar lojas por cidade: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Busca todas as lojas de um lojista
    func getMerchantStores(merchantId: String) async throws -> [FirebaseStore] {
        print("🔍 [StoresService] Buscando lojas do merchant: \(merchantId)")
        
        let storesRef = db.collection(collectionName)
        let query = storesRef.whereField("merchantId", isEqualTo: merchantId)
        
        do {
            let snapshot = try await query.getDocuments()
            print("✅ [StoresService] \(snapshot.documents.count) lojas encontradas")
            
            var stores: [FirebaseStore] = []
            
            for document in snapshot.documents {
                do {
                    let store = try self.parseStore(documentId: document.documentID, data: document.data())
                    stores.append(store)
                } catch {
                    print("❌ [StoresService] Erro ao parsear loja \(document.documentID): \(error.localizedDescription)")
                }
            }
            
            // Ordenar por data de criação (mais recentes primeiro)
            stores.sort { $0.createdAt > $1.createdAt }
            
            print("✅ [StoresService] \(stores.count) lojas processadas com sucesso")
            return stores
        } catch {
            print("❌ [StoresService] Erro ao buscar lojas: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Parse de documento do Firestore para FirebaseStore
    private func parseStore(documentId: String, data: [String: Any]) throws -> FirebaseStore {
        guard let merchantId = data["merchantId"] as? String,
              let name = data["name"] as? String,
              let cnpj = data["cnpj"] as? String,
              let address = data["address"] as? String,
              let city = data["city"] as? String,
              let phone = data["phone"] as? String,
              let hours = data["hours"] as? String,
              let active = data["active"] as? Bool else {
            throw NSError(domain: "StoresService", code: 1, userInfo: [NSLocalizedDescriptionKey: "Campos obrigatórios faltando"])
        }
        
        let photoURL = data["photoURL"] as? String
        
        // Converter timestamps
        var createdAt = Date()
        var updatedAt = Date()
        
        if let createdAtTimestamp = data["createdAt"] as? Timestamp {
            createdAt = createdAtTimestamp.dateValue()
        }
        
        if let updatedAtTimestamp = data["updatedAt"] as? Timestamp {
            updatedAt = updatedAtTimestamp.dateValue()
        }
        
        return FirebaseStore(
            id: documentId,
            merchantId: merchantId,
            name: name,
            cnpj: cnpj,
            address: address,
            city: city,
            phone: phone,
            hours: hours,
            photoURL: photoURL,
            active: active,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}

/// Estrutura para dados de entrada ao criar uma loja
struct StoreData {
    let name: String
    let cnpj: String
    let address: String
    let city: String
    let phone: String
    let hours: String
    let photoURL: String?
    let active: Bool
}

/// Estrutura para dados de atualização de uma loja (todos os campos são opcionais)
struct StoreUpdateData {
    let name: String?
    let cnpj: String?
    let address: String?
    let city: String?
    let phone: String?
    let hours: String?
    let photoURL: String?
    let active: Bool?
    
    init(
        name: String? = nil,
        cnpj: String? = nil,
        address: String? = nil,
        city: String? = nil,
        phone: String? = nil,
        hours: String? = nil,
        photoURL: String? = nil,
        active: Bool? = nil
    ) {
        self.name = name
        self.cnpj = cnpj
        self.address = address
        self.city = city
        self.phone = phone
        self.hours = hours
        self.photoURL = photoURL
        self.active = active
    }
}
