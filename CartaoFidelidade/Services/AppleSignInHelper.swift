//
//  AppleSignInHelper.swift
//  CartaoFidelidade
//
//  Sign in with Apple via AuthenticationServices
//

import AuthenticationServices
import SwiftUI

/// Resultado do Sign in with Apple (identificador e e-mail opcional).
struct AppleSignInResult {
    let userIdentifier: String
    let email: String?
    let fullName: PersonNameComponents?
}

/// Helper que inicia o fluxo Sign in with Apple e notifica sucesso/erro.
final class AppleSignInHelper: NSObject {
    private var continuation: CheckedContinuation<AppleSignInResult, Error>?

    func signIn() async throws -> AppleSignInResult {
        let request = ASAuthorizationAppleIDProvider().createRequest()
        request.requestedScopes = [.fullName, .email]

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self

        return try await withCheckedThrowingContinuation { continuation in
            self.continuation = continuation
            controller.performRequests()
        }
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
            return
        }
        let result = AppleSignInResult(
            userIdentifier: credential.user,
            email: credential.email,
            fullName: credential.fullName
        )
        continuation?.resume(returning: result)
        continuation = nil
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
