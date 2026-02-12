//
//  ContentService.swift
//  CartaoFidelidade
//
//  Serviço para conteúdo global do app (ex.: Política de Privacidade)
//

import Foundation
import FirebaseFirestore

private let appContentCollection = "appContent"
private let privacyPolicyDocId = "privacyPolicy"

private let defaultPrivacyPolicyText = """
Política de Privacidade – Core+

Última atualização: conforme alterações no painel administrativo.

1. Coleta de dados
O Core+ coleta apenas os dados necessários para o funcionamento do programa de fidelidade: nome, e-mail, dados de uso do app e pontos de fidelidade.

2. Uso dos dados
Utilizamos seus dados para gerenciar sua conta, exibir ofertas e recompensas e melhorar a experiência no aplicativo.

3. Compartilhamento
Não vendemos seus dados. Podemos compartilhar informações apenas com lojas parceiras para aplicação de ofertas e pontos, dentro do escopo do programa.

4. Segurança
Adotamos medidas técnicas para proteger seus dados contra acesso não autorizado.

5. Seus direitos
Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato conosco.

6. Alterações
Esta política pode ser atualizada. O uso continuado do app após alterações constitui aceite da nova versão.
"""

struct PrivacyPolicyData {
    let text: String
    let updatedAt: Date?
}

enum ContentServiceError: Error {
    case firestoreUnavailable
}

final class ContentService {
    static let shared = ContentService()
    private let db = Firestore.firestore()

    private init() {}

    /// Busca o texto da Política de Privacidade no Firestore (leitura pública).
    func getPrivacyPolicy() async throws -> PrivacyPolicyData {
        let ref = db.collection(appContentCollection).document(privacyPolicyDocId)
        let snapshot = try await ref.getDocument()
        guard snapshot.exists, let data = snapshot.data() else {
            return PrivacyPolicyData(text: defaultPrivacyPolicyText, updatedAt: nil)
        }
        let text = data["text"] as? String ?? defaultPrivacyPolicyText
        let updatedAt = (data["updatedAt"] as? Timestamp)?.dateValue()
        return PrivacyPolicyData(text: text, updatedAt: updatedAt)
    }
}
