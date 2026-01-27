//
//  QRCodeCard.swift
//  CartaoFidelidade
//
//  Card com QR Code
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct QRCodeCard: View {
    @Binding var isPresented: Bool
    let qrCodeData: String
    
    var body: some View {
        ZStack {
            // Background overlay
            Color.black.opacity(0.5)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation {
                        isPresented = false
                    }
                }
            
            // Card
            VStack(spacing: AppSpacing.lg) {
                // Header
                HStack {
                    Text("Meu QR Code")
                        .font(.appHeadline)
                        .foregroundColor(.cardForeground)
                    
                    Spacer()
                    
                    Button(action: {
                        withAnimation {
                            isPresented = false
                        }
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.mutedForeground)
                            .font(.system(size: 24))
                    }
                }
                
                // QR Code
                if let qrImage = generateQRCode(from: qrCodeData) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 250, height: 250)
                        .background(Color.white)
                        .cornerRadius(AppRadius.md)
                        .padding(AppSpacing.md)
                }
                
                // Card Number
                VStack(spacing: AppSpacing.sm) {
                    Text("Cartão Fidelidade")
                        .font(.appCaption)
                        .foregroundColor(.mutedForeground)
                    
                    Text("**** **** **** 4589")
                        .font(.system(size: 18, weight: .semibold, design: .monospaced))
                        .foregroundColor(.cardForeground)
                }
                
                // Info
                Text("Apresente este QR Code no estabelecimento para acumular pontos")
                    .font(.appCaption)
                    .foregroundColor(.mutedForeground)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, AppSpacing.md)
            }
            .padding(AppSpacing.xl)
            .background(Color.card)
            .cornerRadius(AppRadius.xl)
            .appShadow(AppShadow.lg)
            .padding(AppSpacing.xl)
            .scaleEffect(isPresented ? 1.0 : 0.9)
            .opacity(isPresented ? 1.0 : 0.0)
        }
        .transition(.opacity.combined(with: .scale))
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        
        let data = Data(string.utf8)
        filter.setValue(data, forKey: "inputMessage")
        
        guard let outputImage = filter.outputImage else { return nil }
        
        let transform = CGAffineTransform(scaleX: 10, y: 10)
        let scaledImage = outputImage.transformed(by: transform)
        
        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else { return nil }
        
        return UIImage(cgImage: cgImage)
    }
}

#Preview {
    QRCodeCard(isPresented: .constant(true), qrCodeData: "CARTEIRA:4589")
}
