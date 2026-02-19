//
//  ImgBBService.swift
//  CartaoFidelidade
//
//  Serviço para upload de imagens no ImgBB
//  API: https://api.imgbb.com/
//  Chave gratuita: https://api.imgbb.com/
//

import Foundation
import UIKit

class ImgBBService {
    static let shared = ImgBBService()
    
    private let apiURL = "https://api.imgbb.com/1/upload"
    
    /// Chave da API ImgBB - configure em Info.plist como IMGBB_API_KEY ou defina aqui
    private var apiKey: String? {
        Bundle.main.object(forInfoDictionaryKey: "IMGBB_API_KEY") as? String
            ?? "YOUR_IMGBB_API_KEY" // Substitua pela sua chave ou adicione no Info.plist
    }
    
    private init() {}
    
    /// Faz upload de uma imagem para o ImgBB
    /// - Parameter image: UIImage a ser enviada
    /// - Returns: URL da imagem ou nil em caso de erro
    func uploadImage(_ image: UIImage) async throws -> String? {
        guard let key = apiKey, key != "YOUR_IMGBB_API_KEY" else {
            print("❌ [ImgBBService] IMGBB_API_KEY não configurada. Adicione no Info.plist ou em ImgBBService.swift")
            return nil
        }
        
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            print("❌ [ImgBBService] Falha ao converter imagem para JPEG")
            return nil
        }
        
        let base64 = imageData.base64EncodedString()
        
        var request = URLRequest(url: URL(string: "\(apiURL)?key=\(key.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? key)")!)
        request.httpMethod = "POST"
        
        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        
        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"image\"\r\n\r\n".data(using: .utf8)!)
        body.append(base64.data(using: .utf8)!)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            print("❌ [ImgBBService] Erro no upload:", (response as? HTTPURLResponse)?.statusCode ?? 0)
            return nil
        }
        
        struct ImgBBResponse: Decodable {
            let data: DataResponse?
            struct DataResponse: Decodable {
                let url: String?
            }
        }
        
        let decoded = try? JSONDecoder().decode(ImgBBResponse.self, from: data)
        return decoded?.data?.url
    }
}
