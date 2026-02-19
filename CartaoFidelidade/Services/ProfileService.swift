//
//  ProfileService.swift
//  CartaoFidelidade
//
//  Serviço para perfil do usuário: Firestore (telefone) e Auth (email).
//

import Foundation
import FirebaseAuth
import FirebaseFirestore

enum ProfileServiceError: LocalizedError {
    case notAuthenticated
    case reauthFailed(String)
    case updateEmailFailed(String)
    case firestoreError(String)

    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Usuário não autenticado."
        case .reauthFailed(let msg):
            return "Falha ao confirmar senha: \(msg)"
        case .updateEmailFailed(let msg):
            return "Falha ao atualizar e-mail: \(msg)"
        case .firestoreError(let msg):
            return "Erro ao salvar dados: \(msg)"
        }
    }
}

struct UserProfile {
    var phone: String?
    var address: String?
    var birthDate: String?
    var displayName: String?
}

final class ProfileService {
    static let shared = ProfileService()
    private let firestore = Firestore.firestore()

    private init() {}

    private func userDoc() throws -> DocumentReference {
        guard let uid = Auth.auth().currentUser?.uid else {
            throw ProfileServiceError.notAuthenticated
        }
        return firestore.collection("users").document(uid)
    }

    /// Carrega o perfil do Firestore.
    func getProfile() async throws -> UserProfile {
        let doc = try userDoc()
        let snapshot = try await doc.getDocument()
        let data = snapshot.data()
        let phone = data?["phone"] as? String
        let address = data?["address"] as? String
        let birthDate = data?["birthDate"] as? String
        let displayName = data?["displayName"] as? String ?? Auth.auth().currentUser?.displayName
        return UserProfile(phone: phone, address: address, birthDate: birthDate, displayName: displayName)
    }

    /// Atualiza o telefone no Firestore.
    func updatePhone(_ phone: String) async throws {
        let doc = try userDoc()
        try await doc.setData(["phone": phone], merge: true)
    }

    /// Atualiza o endereço no Firestore.
    func updateAddress(_ address: String) async throws {
        let doc = try userDoc()
        try await doc.setData(["address": address], merge: true)
    }

    /// Atualiza a data de nascimento no Firestore (formato: dd/MM/yyyy).
    func updateBirthDate(_ birthDate: String) async throws {
        let doc = try userDoc()
        try await doc.setData(["birthDate": birthDate], merge: true)
    }

    /// Atualiza o nome de exibição no Firebase Auth e Firestore.
    func updateDisplayName(_ displayName: String) async throws {
        guard let user = Auth.auth().currentUser else {
            throw ProfileServiceError.notAuthenticated
        }
        let changeRequest = user.createProfileChangeRequest()
        changeRequest.displayName = displayName
        try await changeRequest.commitChanges()
        let doc = try userDoc()
        try await doc.setData(["displayName": displayName], merge: true)
    }

    /// Envia e-mail de verificação para o novo endereço; o e-mail só é alterado quando o usuário clicar no link (requer reautenticação com senha).
    func updateEmail(newEmail: String, currentPassword: String) async throws {
        guard let user = Auth.auth().currentUser else {
            throw ProfileServiceError.notAuthenticated
        }
        guard let email = user.email, !email.isEmpty else {
            throw ProfileServiceError.updateEmailFailed("Conta sem e-mail (ex.: login com Apple/Google).")
        }
        let credential = EmailAuthProvider.credential(withEmail: email, password: currentPassword)
        do {
            try await user.reauthenticate(with: credential)
        } catch {
            throw ProfileServiceError.reauthFailed(error.localizedDescription)
        }
        do {
            try await user.sendEmailVerification(beforeUpdatingEmail: newEmail)
        } catch {
            throw ProfileServiceError.updateEmailFailed(error.localizedDescription)
        }
    }
}
