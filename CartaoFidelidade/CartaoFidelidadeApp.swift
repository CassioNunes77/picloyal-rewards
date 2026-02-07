//
//  CartaoFidelidadeApp.swift
//  CartaoFidelidade
//
//  App principal — fluxo igual à web: login como tela inicial, depois app
//

import SwiftUI
import FirebaseCore
import FirebaseAuth

@main
struct CartaoFidelidadeApp: App {
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            Group {
                if isLoggedIn {
                    ContentView()
                } else {
                    LoginView(
                        onLogin: { email, _, _ in
                            userEmail = email
                            userDisplayName = email.components(separatedBy: "@").first ?? "Usuário"
                        },
                        onAppleSignIn: { result in
                            let name = [result.fullName?.givenName, result.fullName?.familyName]
                                .compactMap { $0 }
                                .joined(separator: " ")
                            userDisplayName = name.isEmpty ? "Usuário" : name
                            userEmail = result.email ?? userEmail
                        },
                        onGoogleSignIn: {
                            try await performGoogleSignIn()
                        },
                        onSuccess: {
                            isLoggedIn = true
                            if let user = Auth.auth().currentUser {
                                if !(user.displayName?.isEmpty ?? true) { userDisplayName = user.displayName ?? userDisplayName }
                                if !(user.email?.isEmpty ?? true) { userEmail = user.email ?? userEmail }
                                userPhotoURL = user.photoURL?.absoluteString ?? ""
                            }
                        },
                        onDismiss: nil
                    )
                }
            }
            .background(Color.appBackground.ignoresSafeArea())
            .onOpenURL { url in
                _ = handleGoogleSignInURL(url)
            }
        }
    }
}
