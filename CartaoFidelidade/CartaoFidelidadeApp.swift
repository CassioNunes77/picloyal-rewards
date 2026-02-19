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
    @AppStorage("showMerchantLogin") private var showMerchantLogin = false
    @AppStorage("userDisplayName") private var userDisplayName = ""
    @AppStorage("userEmail") private var userEmail = ""
    @AppStorage("userPhotoURL") private var userPhotoURL = ""
    @ObservedObject private var darkModeManager = DarkModeManager.shared

    init() {
        FirebaseApp.configure()
    }

    @State private var splashDone = false
    
    var body: some Scene {
        WindowGroup {
            RootContentView(
                splashDone: $splashDone,
                isLoggedIn: $isLoggedIn,
                isMerchant: $isMerchant,
                showMerchantLogin: $showMerchantLogin,
                userDisplayName: $userDisplayName,
                userEmail: $userEmail,
                userPhotoURL: $userPhotoURL
            )
            .preferredColorScheme(darkModeManager.darkMode ? .dark : .light)
            .onAppear {
                Task { await DarkModeManager.shared.loadFromFirebase() }
            }
            .background(Color.appBackground.ignoresSafeArea())
            .onOpenURL { url in
                _ = handleGoogleSignInURL(url)
            }
            .onAppear {
                if isLoggedIn, let user = Auth.auth().currentUser {
                    checkUserRole(userId: user.uid)
                }
            }
        }
    }
    
    private func checkUserRole(userId: String) {
        Task {
            let roleService = UserRoleService.shared
            do {
                let isMerchantUser = try await roleService.isMerchant(userId: userId)
                isMerchant = isMerchantUser
                
                if isMerchantUser {
                    print("✅ [CartaoFidelidadeApp] Usuário encontrado em merchants, isMerchant: true")
                } else {
                    print("✅ [CartaoFidelidadeApp] Usuário não encontrado em merchants, isMerchant: false")
                }
            } catch {
                print("❌ [CartaoFidelidadeApp] Erro ao verificar role: \(error.localizedDescription)")
                isMerchant = false
            }
        }
    }
    
}

// MARK: - Root Content (extraído para simplificar o App)
private struct RootContentView: View {
    @Binding var splashDone: Bool
    @Binding var isLoggedIn: Bool
    @Binding var isMerchant: Bool
    @Binding var showMerchantLogin: Bool
    @Binding var userDisplayName: String
    @Binding var userEmail: String
    @Binding var userPhotoURL: String
    
    var body: some View {
        Group {
                if !splashDone {
                    SplashScreenView {
                        splashDone = true
                    }
                } else if isLoggedIn {
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
                } else if showMerchantLogin {
                    MerchantLoginView(
                        onSuccess: {
                            showMerchantLogin = false
                            Task { await DarkModeManager.shared.loadFromFirebase() }
                        },
                        onBack: { showMerchantLogin = false }
                    )
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
                            Task { @MainActor in
                                if let user = Auth.auth().currentUser {
                                    // Verificar se existe em merchants (lojista)
                                    let roleService = UserRoleService.shared
                                    do {
                                        let isMerchantUser = try await roleService.isMerchant(userId: user.uid)
                                        
                                        // Se for lojista, fazer logout e não permitir login como usuário comum
                                        if isMerchantUser {
                                            try? Auth.auth().signOut()
                                            print("❌ [CartaoFidelidadeApp] Lojista tentou fazer login como usuário comum. Login bloqueado.")
                                            return
                                        }
                                        
                                        // Verificar se existe em users (usuário comum)
                                        let isRegularUser = try await roleService.isUser(userId: user.uid)
                                        
                                        // Se não existir em users, criar documento (primeiro login)
                                        if !isRegularUser {
                                            let db = Firestore.firestore()
                                            let userRef = db.collection("users").document(user.uid)
                                            try await userRef.setData([
                                                "uid": user.uid,
                                                "email": user.email ?? "",
                                                "displayName": user.displayName ?? "",
                                                "photoURL": user.photoURL?.absoluteString ?? "",
                                                "phoneNumber": user.phoneNumber ?? "",
                                                "createdAt": Timestamp(),
                                                "updatedAt": Timestamp(),
                                                "lastLoginAt": Timestamp()
                                            ])
                                            print("✅ [CartaoFidelidadeApp] Documento de usuário criado no Firestore")
                                        }
                                        
                                        // Se chegou aqui, é um usuário comum válido
                                        isLoggedIn = true
                                        isMerchant = false
                                        
                                        if !(user.displayName?.isEmpty ?? true) { userDisplayName = user.displayName ?? userDisplayName }
                                        if !(user.email?.isEmpty ?? true) { userEmail = user.email ?? userEmail }
                                        userPhotoURL = user.photoURL?.absoluteString ?? ""
                                        
                                        print("✅ [CartaoFidelidadeApp] Usuário comum logado com sucesso")
                                        Task { await DarkModeManager.shared.loadFromFirebase() }
                                    } catch {
                                        print("❌ [CartaoFidelidadeApp] Erro ao verificar role: \(error.localizedDescription)")
                                        // Em caso de erro, não permitir login
                                        try? Auth.auth().signOut()
                                    }
                                }
                            }
                        },
                        onDismiss: nil
                    )
                }
            }
        }
}
