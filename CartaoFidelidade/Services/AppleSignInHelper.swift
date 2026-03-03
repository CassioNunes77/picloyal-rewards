//
//  AppleSignInHelper.swift
//  CartaoFidelidade
//
//  Sign in with Apple via AuthenticationServices + Firebase Auth
//

import AuthenticationServices
import CryptoKit
import FirebaseAuth
import SwiftUI

/// Resultado do Sign in with Apple (identificador, e-mail, nome e credencial para Firebase).
struct AppleSignInResult {
    let userIdentifier: String
    let email: String?
    let fullName: PersonNameComponents?
}

/// Helper que inicia o fluxo Sign in with Apple e notifica sucesso/erro.
/// Inclui nonce para segurança e integração com Firebase Auth.
final class AppleSignInHelper: NSObject {
    private var continuation: CheckedContinuation<AppleSignInResult, Error>?
    private var currentNonce: String?

    func signIn() async throws -> AppleSignInResult {
        let nonce = randomNonceString()
        currentNonce = nonce

        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self

        return try await withCheckedThrowingContinuation { cont in
            self.continuation = cont
            controller.performRequests()
        }
    }

    private func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
        }
        let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        return String(randomBytes.map { byte in
            charset[Int(byte) % charset.count]
        })
    }

    private func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        return hashedData.compactMap { String(format: "%02x", $0) }.joined()
    }
}

extension AppleSignInHelper: ASAuthorizationControllerDelegate {
    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            continuation?.resume(throwing: NSError(domain: "AppleSignIn", code: -1, userInfo: [NSLocalizedDescriptionKey: "Credencial inválida"]))
            continuation = nil
            currentNonce = nil
            return
        }
        guard let nonce = currentNonce else {
            continuation?.resume(throwing: NSError(domain: "AppleSignIn", code: -2, userInfo: [NSLocalizedDescriptionKey: "Estado inválido: nonce não encontrado"]))
            continuation = nil
            currentNonce = nil
            return
        }
        guard let appleIDToken = credential.identityToken else {
            continuation?.resume(throwing: NSError(domain: "AppleSignIn", code: -3, userInfo: [NSLocalizedDescriptionKey: "Não foi possível obter o token de identidade da Apple"]))
            continuation = nil
            currentNonce = nil
            return
        }
        guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else {
            continuation?.resume(throwing: NSError(domain: "AppleSignIn", code: -4, userInfo: [NSLocalizedDescriptionKey: "Não foi possível converter o token"]))
            continuation = nil
            currentNonce = nil
            return
        }

        let firebaseCredential = OAuthProvider.appleCredential(
            withIDToken: idTokenString,
            rawNonce: nonce,
            fullName: credential.fullName
        )

        Task { @MainActor in
            do {
                _ = try await Auth.auth().signIn(with: firebaseCredential)
                let result = AppleSignInResult(
                    userIdentifier: credential.user,
                    email: credential.email,
                    fullName: credential.fullName
                )
                continuation?.resume(returning: result)
            } catch {
                continuation?.resume(throwing: error)
            }
            continuation = nil
            currentNonce = nil
        }
    }

    func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        let nsError = error as NSError
        if nsError.code == ASAuthorizationError.canceled.rawValue {
            continuation?.resume(throwing: CancellationError())
        } else {
            continuation?.resume(throwing: error)
        }
        continuation = nil
        currentNonce = nil
    }
}

extension AppleSignInHelper: ASAuthorizationControllerPresentationContextProviding {
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        guard let windowScene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive }),
              let window = windowScene.windows.first(where: { $0.isKeyWindow }) ?? windowScene.windows.first else {
            return UIWindow()
        }
        return window
    }
}
