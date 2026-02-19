//
//  DarkModeManager.swift
//  CartaoFidelidade
//
//  Gerencia modo escuro com persistência no Firebase (users/{userId}/preferences.darkMode)
//  Mesma estrutura do Web - use-dark-mode.ts e usersService
//

import SwiftUI
import FirebaseAuth

private let darkModeKey = "darkMode"

/// Gerenciador de modo escuro - carrega e salva preferência no Firebase
final class DarkModeManager: ObservableObject {
    static let shared = DarkModeManager()
    
    /// Preferência do usuário (true = escuro, false = claro)
    /// Sincronizado com AppStorage para persistência local
    @Published var darkMode: Bool {
        didSet { UserDefaults.standard.set(darkMode, forKey: darkModeKey) }
    }
    
    /// Indica se já carregou a preferência do Firebase
    @Published private(set) var hasLoadedFromFirebase = false
    
    private init() {
        self.darkMode = UserDefaults.standard.bool(forKey: darkModeKey)
    }
    
    /// Carrega preferência do Firebase. Se não houver usuário ou preferência salva, usa preferência do sistema.
    func loadFromFirebase() async {
        guard let userId = Auth.auth().currentUser?.uid else {
            await MainActor.run {
                // Sem usuário: usar preferência do sistema
                let systemDark = UITraitCollection.current.userInterfaceStyle == .dark
                self.darkMode = systemDark
                self.hasLoadedFromFirebase = true
            }
            return
        }
        
        do {
            let saved = try await UsersService.shared.getDarkModePreference(userId: userId)
            await MainActor.run {
                if let saved = saved {
                    self.darkMode = saved
                } else {
                    // Sem preferência salva: usar sistema
                    let systemDark = UITraitCollection.current.userInterfaceStyle == .dark
                    self.darkMode = systemDark
                }
                self.hasLoadedFromFirebase = true
            }
        } catch {
            print("❌ [DarkModeManager] Erro ao carregar modo escuro:", error.localizedDescription)
            await MainActor.run {
                let systemDark = UITraitCollection.current.userInterfaceStyle == .dark
                self.darkMode = systemDark
                self.hasLoadedFromFirebase = true
            }
        }
    }
    
    /// Alterna modo escuro e salva no Firebase
    func setDarkMode(_ value: Bool) async {
        let previous = darkMode
        await MainActor.run { darkMode = value }
        
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        do {
            try await UsersService.shared.updateDarkModePreference(userId: userId, darkMode: value)
        } catch {
            print("❌ [DarkModeManager] Erro ao salvar modo escuro:", error.localizedDescription)
            await MainActor.run { darkMode = previous }
        }
    }
}
