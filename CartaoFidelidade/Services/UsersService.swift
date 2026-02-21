//
//  UsersService.swift
//  CartaoFidelidade
//
//  Serviço para gerenciar dados do usuário no Firestore (coleção users)
//  Usado para preferências como darkMode - mesma estrutura do Web
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

struct UserPreferences {
    var darkMode: Bool?
    var notifications: Bool?
}

/// Plano da conta: free (padrão) ou premium
enum UserPlan: String {
    case free
    case premium
}

class UsersService {
    static let shared = UsersService()
    private let db = Firestore.firestore()
    private let collectionName = "users"
    
    private init() {}
    
    /// Busca dados do usuário no Firestore (coleção users/{userId})
    /// Campo preferences.darkMode: Bool - mesma estrutura do Web
    func getUserData(userId: String) async throws -> [String: Any]? {
        let docRef = db.collection(collectionName).document(userId)
        let snapshot = try await docRef.getDocument()
        guard snapshot.exists, let data = snapshot.data() else { return nil }
        return data
    }
    
    /// Busca o plano do usuário (free ou premium)
    /// Retorna .free se não houver plano definido
    func getPlan(userId: String) async throws -> UserPlan {
        guard let data = try await getUserData(userId: userId),
              let planStr = data["plan"] as? String,
              planStr == "premium" else {
            return .free
        }
        return .premium
    }
    
    /// Busca preferência de modo escuro do Firebase
    /// Retorna nil se não houver preferência salva (usar preferência do sistema)
    func getDarkModePreference(userId: String) async throws -> Bool? {
        guard let data = try await getUserData(userId: userId) else { return nil }
        guard let prefs = data["preferences"] as? [String: Any],
              prefs["darkMode"] != nil else { return nil }
        return prefs["darkMode"] as? Bool
    }
    
    /// Atualiza preferência de modo escuro no Firebase
    /// Mescla com preferências existentes (updateUserData no Web)
    /// Usa setData com merge para criar documento se não existir (ex: merchant sem doc em users)
    func updateDarkModePreference(userId: String, darkMode: Bool) async throws {
        let userRef = db.collection(collectionName).document(userId)
        let snapshot = try await userRef.getDocument()
        let existingPrefs = snapshot.data()?["preferences"] as? [String: Any] ?? [:]
        
        var newPrefs = existingPrefs
        newPrefs["darkMode"] = darkMode
        
        let data: [String: Any] = [
            "preferences": newPrefs,
            "updatedAt": Timestamp()
        ]
        
        if snapshot.exists {
            try await userRef.updateData(data)
        } else {
            try await userRef.setData(data, merge: true)
        }
    }
}
