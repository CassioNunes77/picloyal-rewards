//
//  CartaoFidelidadeApp.swift
//  CartaoFidelidade
//
//  App principal — fluxo igual à web: login como tela inicial, depois app
//

import SwiftUI
import FirebaseCore
import FirebaseAuth
import FirebaseFirestore

@main
struct CartaoFidelidadeApp: App {
    @AppStorage("isLoggedIn") private var isLoggedIn = false
    @AppStorage("isMerchant") private var isMerchant = false
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
                    if isMerchant {
                        // Mostrar painel do lojista
                        MerchantDashboardView()
                            .onAppear {
                                print("✅ [CartaoFidelidadeApp] Painel do lojista aberto")
                            }
                    } else {
                        // Mostrar painel do usuário
                        ContentView()
                    }
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
                                
                                // Verificar se é lojista
                                checkUserRole(userId: user.uid)
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
            .onAppear {
                // Verificar role ao iniciar o app se já estiver logado
                if isLoggedIn, let user = Auth.auth().currentUser {
                    checkUserRole(userId: user.uid)
                }
            }
        }
    }
    
    private func checkUserRole(userId: String) {
        Task {
            let db = Firestore.firestore()
            do {
                let userDoc = try await db.collection("users").document(userId).getDocument()
                if let data = userDoc.data(), let role = data["role"] as? String {
                    isMerchant = (role == "merchant")
                    print("✅ [CartaoFidelidadeApp] Role do usuário: \(role), isMerchant: \(isMerchant)")
                } else {
                    // Se não tiver role definido, verificar se existe na coleção merchants
                    let merchantDoc = try await db.collection("merchants").document(userId).getDocument()
                    isMerchant = merchantDoc.exists
                    print("✅ [CartaoFidelidadeApp] Verificado via merchants collection, isMerchant: \(isMerchant)")
                }
            } catch {
                print("❌ [CartaoFidelidadeApp] Erro ao verificar role: \(error.localizedDescription)")
                isMerchant = false
            }
        }
    }
}
