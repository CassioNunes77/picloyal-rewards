//
//  ShareService.swift
//  CartaoFidelidade
//
//  Serviço para compartilhar ofertas (link/WhatsApp) e registrar analytics.
//

import Foundation
import FirebaseFirestore
import FirebaseAuth

enum ShareType: String {
    case link = "link"
    case whatsapp = "whatsapp"
    case native = "native"
}

final class ShareService {
    static let shared = ShareService()
    private let db = Firestore.firestore()
    private let collectionName = "offerShareEvents"

    /// URL base do app web (links compartilhados abrem no navegador)
    private var webBaseUrl: String {
        Bundle.main.object(forInfoDictionaryKey: "WEB_APP_BASE_URL") as? String
            ?? "https://cardcorevo.netlify.app"
    }

    private init() {}

    /// Gera URL compartilhável da oferta
    func getOfferShareUrl(offerId: String) -> String {
        "\(webBaseUrl)/offer/\(offerId)"
    }

    /// Mensagem para compartilhar no WhatsApp
    func getWhatsAppShareMessage(offerTitle: String, storeName: String, url: String) -> String {
        "Confira esta oferta: \(offerTitle) em \(storeName)\n\n\(url)"
    }

    /// URL do WhatsApp com mensagem pré-preenchida
    func getWhatsAppShareUrl(text: String) -> URL? {
        let encoded = text.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed)
        guard let encoded = encoded else { return nil }
        return URL(string: "https://wa.me/?text=\(encoded)")
    }

    /// Registra compartilhamento para analytics (apenas se usuário autenticado)
    func trackOfferShare(
        offerId: String,
        shareType: ShareType,
        offerTitle: String = "",
        storeId: String = ""
    ) {
        guard Auth.auth().currentUser != nil else { return }
        let userId = Auth.auth().currentUser?.uid ?? ""

        let data: [String: Any] = [
            "offerId": offerId,
            "userId": userId,
            "shareType": shareType.rawValue,
            "offerTitle": offerTitle,
            "storeId": storeId,
            "createdAt": Timestamp(date: Date()),
        ]

        db.collection(collectionName).addDocument(data: data) { error in
            if let error = error {
                print("[ShareService] Erro ao registrar compartilhamento: \(error.localizedDescription)")
            }
        }
    }
}
