//
//  CnpjService.swift
//  CartaoFidelidade
//
//  Validação de CNPJ via BrasilAPI
//  https://brasilapi.com.br/api/cnpj/v1/{cnpj}
//

import Foundation

struct CnpjValidationResult {
    let valid: Bool
    let razaoSocial: String?
    let error: String?
}

@MainActor
final class CnpjService {
    static let shared = CnpjService()
    private let baseURL = "https://brasilapi.com.br/api/cnpj/v1"

    private init() {}

    /// Valida CNPJ consultando a BrasilAPI
    func validate(cnpj: String) async -> CnpjValidationResult {
        let digits = cnpj.filter { $0.isNumber }
        guard digits.count == 14 else {
            return CnpjValidationResult(valid: false, razaoSocial: nil, error: "CNPJ deve ter 14 dígitos")
        }

        guard let url = URL(string: "\(baseURL)/\(digits)") else {
            return CnpjValidationResult(valid: false, razaoSocial: nil, error: "URL inválida")
        }

        do {
            let (_, response) = try await URLSession.shared.data(from: url)
            guard let http = response as? HTTPURLResponse else {
                return CnpjValidationResult(valid: false, razaoSocial: nil, error: "Resposta inválida")
            }
            if http.statusCode == 200 {
                return CnpjValidationResult(valid: true, razaoSocial: nil, error: nil)
            }
            return CnpjValidationResult(valid: false, razaoSocial: nil, error: "CNPJ não encontrado")
        } catch {
            print("❌ [CnpjService] Erro ao validar CNPJ: \(error.localizedDescription)")
            return CnpjValidationResult(valid: false, razaoSocial: nil, error: "Erro ao consultar CNPJ")
        }
    }
}
