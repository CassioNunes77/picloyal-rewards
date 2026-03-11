//
//  CartaoFidelidadeApp.swift
//  CartaoFidelidade
//
//  App principal — fluxo igual à web: login como tela inicial, depois app
//

import SwiftUI
import FirebaseCore
import FirebaseAuth
import StoreKit

@main
struct CartaoFidelidadeApp: App {
    @ObservedObject private var darkModeManager = DarkModeManager.shared

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            RootContentView()
            .preferredColorScheme(darkModeManager.darkMode ? .dark : .light)
            .onAppear {
                Task { await DarkModeManager.shared.loadFromFirebase() }
                Task { @MainActor in
                    StoreKitService.shared.startTransactionListener()
                }
            }
            .background(Color.appBackground.ignoresSafeArea())
            .onOpenURL { url in
                if url.host != "cardcorevo.netlify.app" {
                    _ = handleGoogleSignInURL(url)
                }
            }
        }
    }
}

// MARK: - Root Content (WebView: app web + recursos nativos via bridge)
private struct RootContentView: View {
    var body: some View {
        // WebView carrega o app web (src) - login e pagamento nativos via bridge
        WebAppView()
    }
}
