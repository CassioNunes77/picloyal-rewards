//
//  GoogleSignInService.swift
//  CartaoFidelidade
//
//  Login com Google via Firebase Auth + GoogleSignIn SDK
//

import FirebaseAuth
import FirebaseCore
import GoogleSignIn
import UIKit

enum GoogleSignInError: Error {
    case noClientID
    case noRootViewController
    case noIDToken
    case cancelled
}

/// Executa o fluxo "Entrar com Google" e faz login no Firebase.
@MainActor
func performGoogleSignIn() async throws {
    guard let clientID = FirebaseApp.app()?.options.clientID else {
        throw GoogleSignInError.noClientID
    }

    let config = GIDConfiguration(clientID: clientID)
    GIDSignIn.sharedInstance.configuration = config

    let windowScene = UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .first { $0.activationState == .foregroundActive }
    let rootVC = windowScene?.windows.first { $0.isKeyWindow }?.rootViewController
        ?? windowScene?.windows.first?.rootViewController
    guard let rootVC else {
        throw GoogleSignInError.noRootViewController
    }

    let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootVC)
    let user = result.user
    guard let idToken = user.idToken?.tokenString else {
        throw GoogleSignInError.noIDToken
    }

    let credential = GoogleAuthProvider.credential(
        withIDToken: idToken,
        accessToken: user.accessToken.tokenString
    )

    _ = try await Auth.auth().signIn(with: credential)
}

/// Retorna (idToken, accessToken) para o web fazer login via Firebase (bridge WebView).
@MainActor
func getGoogleCredentialsForWebBridge() async throws -> (idToken: String, accessToken: String) {
    guard let clientID = FirebaseApp.app()?.options.clientID else {
        throw GoogleSignInError.noClientID
    }

    let config = GIDConfiguration(clientID: clientID)
    GIDSignIn.sharedInstance.configuration = config

    guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
          let rootVC = windowScene.windows.first?.rootViewController else {
        throw GoogleSignInError.noRootViewController
    }

    let result = try await GIDSignIn.sharedInstance.signIn(withPresenting: rootVC)
    let user = result.user
    guard let idToken = user.idToken?.tokenString else {
        throw GoogleSignInError.noIDToken
    }
    let accessToken = user.accessToken.tokenString
    return (idToken: idToken, accessToken: accessToken)
}

/// Deve ser chamado quando o app abre uma URL (callback do Google).
func handleGoogleSignInURL(_ url: URL) -> Bool {
    GIDSignIn.sharedInstance.handle(url)
}
