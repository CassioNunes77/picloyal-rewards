//
//  RegionsService.swift
//  CartaoFidelidade
//
//  Serviço para buscar regiões/localizações do Firebase
//

import Foundation
import FirebaseFirestore

struct Region: Identifiable, Codable {
    let id: String
    let name: String
    let state: String // Código UF (ex: "SP")
    let stateName: String // Nome completo do estado (ex: "São Paulo")
    let city: String
    let cityId: String
    let country: String
    let active: Bool
    let storesCount: Int
    let createdAt: Date
    let updatedAt: Date
    
    var displayName: String {
        "\(city), \(state)"
    }
}

class RegionsService {
    static let shared = RegionsService()
    private let db = Firestore.firestore()
    private let collectionName = "regions"
    
    private init() {}
    
    /// Busca todas as regiões ativas do Firebase
    func getActiveRegions() async throws -> [Region] {
        print("🔍 [RegionsService] Buscando regiões ativas...")
        
        let regionsRef = db.collection(collectionName)
        let query = regionsRef.whereField("active", isEqualTo: true)
        
        do {
            let snapshot = try await query.getDocuments()
            print("✅ [RegionsService] \(snapshot.documents.count) regiões encontradas")
            
            var regions: [Region] = []
            
            for document in snapshot.documents {
                do {
                    let region = try self.parseRegion(documentId: document.documentID, data: document.data())
                    regions.append(region)
                } catch {
                    print("❌ [RegionsService] Erro ao parsear região \(document.documentID): \(error.localizedDescription)")
                }
            }
            
            // Ordenar por nome da cidade
            regions.sort { $0.city < $1.city }
            
            print("✅ [RegionsService] \(regions.count) regiões processadas com sucesso")
            return regions
        } catch {
            print("❌ [RegionsService] Erro ao buscar regiões: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Busca todas as cidades únicas cadastradas no Firebase (incluindo desativadas)
    /// Retorna array de strings com formato "Cidade - UF"
    func getAllCities() async throws -> [String] {
        print("🔍 [RegionsService] Buscando todas as cidades...")
        
        let regionsRef = db.collection(collectionName)
        
        do {
            let snapshot = try await regionsRef.getDocuments()
            print("✅ [RegionsService] \(snapshot.documents.count) documentos encontrados")
            
            var citiesSet = Set<String>()
            
            for document in snapshot.documents {
                let data = document.data()
                if let city = data["city"] as? String,
                   let state = data["state"] as? String {
                    let cityDisplay = "\(city) - \(state)"
                    citiesSet.insert(cityDisplay)
                }
            }
            
            // Converter para array e ordenar alfabeticamente
            let cities = Array(citiesSet).sorted { $0.localizedCompare($1) == .orderedAscending }
            print("✅ [RegionsService] \(cities.count) cidades únicas encontradas")
            return cities
        } catch {
            print("❌ [RegionsService] Erro ao buscar cidades: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Parse de documento do Firestore para Region
    private func parseRegion(documentId: String, data: [String: Any]) throws -> Region {
        guard let name = data["name"] as? String,
              let state = data["state"] as? String,
              let city = data["city"] as? String,
              let country = data["country"] as? String,
              let active = data["active"] as? Bool else {
            throw NSError(domain: "RegionsService", code: 1, userInfo: [NSLocalizedDescriptionKey: "Campos obrigatórios faltando"])
        }
        
        let stateName = data["stateName"] as? String ?? state
        let cityId = data["cityId"] as? String ?? ""
        let storesCount = data["storesCount"] as? Int ?? 0
        
        // Converter timestamps
        var createdAt = Date()
        var updatedAt = Date()
        
        if let createdAtTimestamp = data["createdAt"] as? Timestamp {
            createdAt = createdAtTimestamp.dateValue()
        }
        
        if let updatedAtTimestamp = data["updatedAt"] as? Timestamp {
            updatedAt = updatedAtTimestamp.dateValue()
        }
        
        return Region(
            id: documentId,
            name: name,
            state: state,
            stateName: stateName,
            city: city,
            cityId: cityId,
            country: country,
            active: active,
            storesCount: storesCount,
            createdAt: createdAt,
            updatedAt: updatedAt
        )
    }
}
