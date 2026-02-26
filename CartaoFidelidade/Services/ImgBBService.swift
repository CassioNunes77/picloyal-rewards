//
//  ImgBBService.swift
//  CartaoFidelidade
//
//  Serviço para upload de imagens no ImgBB
//  API: https://api.imgbb.com/
//  Chave gratuita: https://api.imgbb.com/
//  Imagens são redimensionadas e comprimidas antes do upload (prioridade: leveza).
//

import Foundation
import UIKit

class ImgBBService {
    static let shared = ImgBBService()
    
    private let apiURL = "https://api.imgbb.com/1/upload"
    
    /// Dimensão máxima no lado maior (500px — encoder JPEG do iOS é menos eficiente que o Web)
    private let maxDimension: CGFloat = 500
    /// Qualidade JPEG (0.2 — para aproximar ~15KB como na Web)
    private let jpegQuality: CGFloat = 0.2
    
    /// Chave da API ImgBB - configure em Info.plist como IMGBB_API_KEY ou defina aqui
    private var apiKey: String? {
        Bundle.main.object(forInfoDictionaryKey: "IMGBB_API_KEY") as? String
            ?? "YOUR_IMGBB_API_KEY" // Substitua pela sua chave ou adicione no Info.plist
    }
    
    private init() {}
    
    /// Redimensiona imagem mantendo proporção (igual ao Web: 800px max, scale 1:1)
    /// UIGraphicsImageRenderer usa scale 2x/3x por padrão — forçar scale 1 para saída leve
    private func resizedImageForUpload(_ image: UIImage) -> UIImage {
        var w = image.size.width * image.scale
        var h = image.size.height * image.scale
        guard w > 0, h > 0 else { return image }
        
        if w > maxDimension || h > maxDimension {
            if w > h {
                h = (h * maxDimension) / w
                w = maxDimension
            } else {
                w = (w * maxDimension) / h
                h = maxDimension
            }
        }
        
        let size = CGSize(width: w, height: h)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: size, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: size))
        }
    }
    
    /// Faz upload de uma imagem para o ImgBB (redimensiona e comprime antes)
    /// - Parameter image: UIImage a ser enviada
    /// - Returns: URL da imagem ou nil em caso de erro
    func uploadImage(_ image: UIImage) async throws -> String? {
        guard let key = apiKey, key != "YOUR_IMGBB_API_KEY" else {
            print("❌ [ImgBBService] IMGBB_API_KEY não configurada. Adicione no Info.plist ou em ImgBBService.swift")
            return nil
        }
        
        let resized = resizedImageForUpload(image)
        guard let imageData = resized.jpegData(compressionQuality: jpegQuality) else {
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
