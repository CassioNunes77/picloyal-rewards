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
    /// Retorna "merchant" se o usuário existir em merchants, "user" se existir em users
    func getUserRole(userId: String) async throws -> UserRole {
        print("🔍 [UserRoleService] Verificando role do usuário: \(userId)")
        
        do {
            // Verificar se existe na coleção 'merchants' (lojistas)
            let merchantDoc = try await db.collection(merchantsCollection).document(userId).getDocument()
            if merchantDoc.exists {
                print("✅ [UserRoleService] Usuário encontrado na coleção 'merchants', role: merchant")
                return .merchant
            }
            
            // Verificar se existe na coleção 'users' (usuários comuns)
            let userDoc = try await db.collection(usersCollection).document(userId).getDocument()
            if userDoc.exists {
                print("✅ [UserRoleService] Usuário encontrado na coleção 'users', role: user")
                return .user
            }
            
            // Se não encontrar em nenhuma coleção, assumir usuário comum
            print("⚠️ [UserRoleService] Usuário não encontrado em nenhuma coleção, assumindo: user")
            return .user
        } catch {
            print("❌ [UserRoleService] Erro ao verificar role: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Verifica se o usuário existe na coleção merchants
    func isMerchant(userId: String) async throws -> Bool {
        let merchantDoc = try await db.collection(merchantsCollection).document(userId).getDocument()
        return merchantDoc.exists
    }
    
    /// Verifica se o usuário existe na coleção users
    func isUser(userId: String) async throws -> Bool {
        let userDoc = try await db.collection(usersCollection).document(userId).getDocument()
        return userDoc.exists
    }
}
