//
//  DarkModeManager.swift
//  CartaoFidelidade
//
//  Gerencia modo escuro — WebView usa tema do app web; native segue preferência do sistema.
//

import SwiftUI

/// Gerenciador de modo escuro — segue preferência do sistema (WebView controla tema).
final class DarkModeManager: ObservableObject {
    static let shared = DarkModeManager()
    
    @Published var darkMode: Bool
    
    private init() {
        self.darkMode = UITraitCollection.current.userInterfaceStyle == .dark
    }
    
    /// Carrega preferência do sistema (WebView controla tema).
    func loadFromFirebase() async {
        await MainActor.run {
            self.darkMode = UITraitCollection.current.userInterfaceStyle == .dark
        }
    }
}
