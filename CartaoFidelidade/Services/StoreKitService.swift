//
//  StoreKitService.swift
//  CartaoFidelidade
//
//  Serviço para assinatura Premium via Apple In-App Purchase (StoreKit 2)
//

import Foundation
import StoreKit
import FirebaseAuth
import FirebaseFirestore

/// ID do produto de assinatura mensal Premium
/// Configure em App Store Connect → In-App Purchases
private let premiumMonthlyProductId = "com.coreplus.premium.monthly"

@MainActor
final class StoreKitService {
    static let shared = StoreKitService()
    private let db = Firestore.firestore()
    private let usersCollection = "users"

    private init() {}

    /// Produtos disponíveis para compra
    private var products: [Product] = []

    /// Carrega os produtos de assinatura
    func loadProducts() async throws -> [Product] {
        let productIds = [premiumMonthlyProductId]
        let storeProducts = try await Product.products(for: productIds)
        products = storeProducts
        return storeProducts
    }

    /// Retorna o produto Premium mensal
    func getPremiumProduct() async throws -> Product? {
        if products.isEmpty {
            _ = try await loadProducts()
        }
        return products.first { $0.id == premiumMonthlyProductId }
    }

    /// Verifica se o usuário tem assinatura Premium ativa
    func hasActivePremiumEntitlement() async -> Bool {
        for await result in Transaction.currentEntitlements {
            if case .verified(let transaction) = result,
               transaction.productID == premiumMonthlyProductId {
                return true
            }
        }
        return false
    }

    /// Realiza a compra do Premium
    /// - Returns: true se a compra foi concluída com sucesso
    func purchasePremium() async throws -> Bool {
        guard let product = try await getPremiumProduct() else {
            throw StoreKitError.productNotFound
        }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            switch verification {
            case .verified(let transaction):
                await transaction.finish()
                if let userId = Auth.auth().currentUser?.uid {
                    try await updateUserPlanInFirestore(userId: userId, plan: "premium", source: "apple")
                }
                return true
            case .unverified:
                throw StoreKitError.verificationFailed
            @unknown default:
                throw StoreKitError.verificationFailed
            }
        case .pending:
            return false
        case .userCancelled:
            throw StoreKitError.userCancelled
        @unknown default:
            throw StoreKitError.unknown
        }
    }

    /// Restaura compras anteriores (ex.: após reinstalar o app)
    func restorePurchases() async throws -> Bool {
        try await AppStore.sync()
        let hasPremium = await hasActivePremiumEntitlement()
        if hasPremium, let userId = Auth.auth().currentUser?.uid {
            try await updateUserPlanInFirestore(userId: userId, plan: "premium", source: "apple")
        }
        return hasPremium
    }

    /// Atualiza o plano do usuário no Firestore após compra verificada
    private func updateUserPlanInFirestore(userId: String, plan: String, source: String) async throws {
        let userRef = db.collection(usersCollection).document(userId)
        try await userRef.setData([
            "plan": plan,
            "subscriptionSource": source,
            "subscriptionUpdatedAt": FieldValue.serverTimestamp(),
            "updatedAt": FieldValue.serverTimestamp(),
        ], merge: true)
    }
}

enum StoreKitError: LocalizedError {
    case productNotFound
    case verificationFailed
    case userCancelled
    case unknown

    var errorDescription: String? {
        switch self {
        case .productNotFound:
            return "Produto Premium não encontrado. Configure em App Store Connect."
        case .verificationFailed:
            return "Falha na verificação da compra."
        case .userCancelled:
            return "Compra cancelada."
        case .unknown:
            return "Erro desconhecido na compra."
        }
    }
}
