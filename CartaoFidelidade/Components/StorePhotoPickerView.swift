//
//  StorePhotoPickerView.swift
//  CartaoFidelidade
//
//  Componente para seleção e upload de foto da loja via ImgBB
//

import SwiftUI
import PhotosUI

struct StorePhotoPickerView: View {
    @Binding var photoURL: String?
    var disabled: Bool = false
    
    @State private var selectedItem: PhotosPickerItem? = nil
    @State private var selectedImage: UIImage? = nil
    @State private var uploading = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            Text("Foto da Loja")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.cardForeground)
            
            ZStack {
                RoundedRectangle(cornerRadius: AppRadius.lg)
                    .stroke(Color.border, style: StrokeStyle(lineWidth: 2, dash: [5]))
                    .frame(height: 120)
                
                if uploading {
                    VStack(spacing: AppSpacing.sm) {
                        ProgressView()
                            .scaleEffect(1.2)
                            .tint(.primary)
                        Text("Enviando...")
                            .font(.system(size: 12))
                            .foregroundColor(.mutedForeground)
                    }
                } else if let urlString = photoURL, let url = URL(string: urlString) {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .scaledToFit()
                                .frame(maxHeight: 100)
                                .cornerRadius(AppRadius.md)
                        case .failure:
                            defaultIcon
                        case .empty:
                            ProgressView()
                        @unknown default:
                            defaultIcon
                        }
                    }
                    .overlay(alignment: .topTrailing) {
                        if !disabled {
                            Button(action: removePhoto) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(.white)
                                    .background(Circle().fill(Color.red))
                            }
                            .padding(8)
                        }
                    }
                } else {
                    PhotosPicker(
                        selection: $selectedItem,
                        matching: .images,
                        photoLibrary: .shared()
                    ) {
                        defaultIcon
                    }
                    .disabled(disabled)
                    .onChange(of: selectedItem) { _, newItem in
                        Task { await loadAndUploadImage(from: newItem) }
                    }
                }
            }
        }
        .padding(.top, AppSpacing.sm)
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro ao enviar foto",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    private var defaultIcon: some View {
        VStack(spacing: AppSpacing.sm) {
            Image(systemName: "storefront.fill")
                .font(.system(size: 32))
                .foregroundColor(.mutedForeground)
            Text("Clique para enviar foto")
                .font(.system(size: 12))
                .foregroundColor(.mutedForeground)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
    }
    
    private func loadAndUploadImage(from item: PhotosPickerItem?) async {
        guard let item = item else { return }
        
        do {
            if let data = try await item.loadTransferable(type: Data.self),
               let image = UIImage(data: data) {
                await MainActor.run { uploading = true }
                
                if let url = try await ImgBBService.shared.uploadImage(image) {
                    await MainActor.run {
                        photoURL = url
                        selectedItem = nil
                        uploading = false
                    }
                } else {
                    await MainActor.run {
                        errorMessage = "Erro ao enviar foto. Verifique a chave ImgBB no Info.plist."
                        showError = true
                        uploading = false
                        selectedItem = nil
                    }
                }
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                showError = true
                uploading = false
                selectedItem = nil
            }
        }
    }
    
    private func removePhoto() {
        photoURL = nil
        selectedItem = nil
        selectedImage = nil
    }
}
