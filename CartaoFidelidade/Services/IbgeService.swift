//
//  IbgeService.swift
//  CartaoFidelidade
//
//  Serviço para consulta à API do IBGE (estados e municípios).
//  100% gratuito, sem API key.
//

import Foundation

struct IbgeState: Decodable {
    let id: Int
    let nome: String
    let sigla: String
}

struct IbgeCity: Decodable {
    let id: Int
    let nome: String
}

enum IbgeService {
    private static let base = "https://servicodados.ibge.gov.br/api/v1/localidades"
    
    static func fetchStates() async throws -> [IbgeState] {
        let url = URL(string: "\(base)/estados?orderBy=nome")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([IbgeState].self, from: data)
    }
    
    static func fetchCities(stateCode: String) async throws -> [IbgeCity] {
        let url = URL(string: "\(base)/estados/\(stateCode)/municipios?orderBy=nome")!
        let (data, _) = try await URLSession.shared.data(from: url)
        return try JSONDecoder().decode([IbgeCity].self, from: data)
    }
}
