//
//  UserRoleService.swift
//  CartaoFidelidade
//
//  Serviço para verificar o role do usuário no Firestore
//

import Foundation
import FirebaseFirestore

enum UserRole: String {
    case user = "user"
    case merchant = "merchant"
}

class UserRoleService {
    static let shared = UserRoleService()
    private let db = Firestore.firestore()
    private let usersCollection = "users"
    private let merchantsCollection = "merchants"
    
    private init() {}
    
    /// Verifica o role do usuário no Firestore
    /// Retorna "merchant" se o usuário for lojista, "user" caso contrário
    func getUserRole(userId: String) async throws -> UserRole {
        print("🔍 [UserRoleService] Verificando role do usuário: \(userId)")
        
        do {
            // Primeiro, verificar o campo 'role' na coleção 'users'
            let userDoc = try await db.collection(usersCollection).document(userId).getDocument()
            
            if userDoc.exists, let data = userDoc.data(), let roleString = data["role"] as? String {
                if let role = UserRole(rawValue: roleString) {
                    print("✅ [UserRoleService] Role encontrado no campo 'role': \(role.rawValue)")
                    return role
                }
            }
            
            // Se não tiver role definido, verificar se existe na coleção 'merchants'
            let merchantDoc = try await db.collection(merchantsCollection).document(userId).getDocument()
            if merchantDoc.exists {
                print("✅ [UserRoleService] Usuário encontrado na coleção 'merchants', role: merchant")
                return .merchant
            }
            
            // Por padrão, se não encontrar nada, é um usuário comum
            print("✅ [UserRoleService] Role padrão: user")
            return .user
        } catch {
            print("❌ [UserRoleService] Erro ao verificar role: \(error.localizedDescription)")
            throw error
        }
    }
}
