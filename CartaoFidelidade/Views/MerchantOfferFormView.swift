//
//  MerchantOfferFormView.swift
//  CartaoFidelidade
//
//  Formulário para criar ofertas
//

import SwiftUI
import FirebaseAuth

struct MerchantOfferFormView: View {
    let storeId: String
    let merchantId: String
    var onCancel: () -> Void
    var onSuccess: () -> Void
    
    @State private var title = ""
    @State private var description = ""
    @State private var discount = ""
    @State private var category = "geral"
    @State private var validUntil = Date()
    @State private var pointsRequired = ""
    @State private var active = true
    @State private var loading = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    
    private let categories = [
        ("geral", "Geral"),
        ("bebidas", "Bebidas"),
        ("comida", "Comida"),
        ("brinde", "Brinde")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                Text("Nova Oferta")
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundColor(.cardForeground)
                
                Spacer()
                
                Button(action: onCancel) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.mutedForeground)
                }
            }
            
            ScrollView {
                VStack(alignment: .leading, spacing: AppSpacing.md) {
                    // Status Ativo/Inativo
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Status da Oferta")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(.cardForeground)
                                
                                Text(active ? "Oferta está ativa e visível" : "Oferta está inativa e oculta")
                                    .font(.system(size: 12))
                                    .foregroundColor(.mutedForeground)
                            }
                            
                            Spacer()
                            
                            Toggle("", isOn: $active)
                                .disabled(loading)
                        }
                        .padding(AppSpacing.md)
                        .background(Color.appBackground)
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.border, lineWidth: 1)
                        )
                    }
                    
                    // Título
                    FormField(
                        label: "Título da Oferta",
                        icon: "tag.fill",
                        isRequired: true,
                        content: {
                            TextField("Ex: 20% OFF em Bebidas", text: $title)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Descrição
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Descrição")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.cardForeground)
                        
                        TextEditor(text: $description)
                            .foregroundColor(.cardForeground)
                            .frame(minHeight: 100)
                            .scrollContentBackground(.hidden)
                            .background(Color.appBackground)
                            .cornerRadius(AppRadius.lg)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppRadius.lg)
                                    .stroke(Color.border, lineWidth: 1)
                            )
                            .disabled(loading)
                    }
                    
                    // Categoria
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Categoria")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.cardForeground)
                        
                        Picker("Categoria", selection: $category) {
                            ForEach(categories, id: \.0) { cat in
                                Text(cat.1).tag(cat.0)
                            }
                        }
                        .pickerStyle(.menu)
                        .disabled(loading)
                    }
                    
                    // Desconto
                    FormField(
                        label: "Desconto (opcional)",
                        icon: "percent",
                        isRequired: false,
                        content: {
                            TextField("Ex: 20%, R$ 10, Grátis", text: $discount)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Data de Validade
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "calendar")
                                .font(.system(size: 14))
                                .foregroundColor(.mutedForeground)
                            Text("Válido até")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.cardForeground)
                        }
                        
                        DatePicker("", selection: $validUntil, in: Date()..., displayedComponents: .date)
                            .datePickerStyle(.compact)
                            .disabled(loading)
                    }
                    
                    // Pontos Necessários
                    FormField(
                        label: "Pontos Necessários (opcional)",
                        icon: "gift.fill",
                        isRequired: false,
                        content: {
                            TextField("Ex: 50", text: $pointsRequired)
                                .keyboardType(.numberPad)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Botões
                    HStack(spacing: AppSpacing.md) {
                        Button(action: onCancel) {
                            Text("Cancelar")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.cardForeground)
                                .frame(maxWidth: .infinity)
                                .frame(height: 48)
                        }
                        .background(Color.appBackground)
                        .cornerRadius(AppRadius.lg)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppRadius.lg)
                                .stroke(Color.border, lineWidth: 1)
                        )
                        .disabled(loading)
                        
                        Button(action: submit) {
                            Group {
                                if loading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .primaryForeground))
                                } else {
                                    Text("Criar Oferta")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(.primaryForeground)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                        }
                        .background(AppGradients.primary)
                        .cornerRadius(AppRadius.lg)
                        .appShadow(AppShadow.md)
                        .disabled(loading || !isFormValid)
                    }
                    .padding(.top, AppSpacing.lg)
                }
            }
        }
        .padding(AppSpacing.lg)
        .background(Color.card)
        .cornerRadius(AppRadius.xl)
        .appShadow(AppShadow.lg)
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro desconhecido ao criar oferta",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    private var isFormValid: Bool {
        !title.trimmingCharacters(in: .whitespaces).isEmpty &&
        !description.trimmingCharacters(in: .whitespaces).isEmpty &&
        validUntil >= Date()
    }
    
    private func submit() {
        guard isFormValid else { return }
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == merchantId else {
            errorMessage = "Você precisa estar autenticado para criar uma oferta"
            showError = true
            return
        }
        
        loading = true
        errorMessage = nil
        
        Task {
            do {
                let offerData = OfferData(
                    title: title.trimmingCharacters(in: .whitespaces),
                    description: description.trimmingCharacters(in: .whitespaces),
                    discount: discount.trimmingCharacters(in: .whitespaces).isEmpty ? nil : discount.trimmingCharacters(in: .whitespaces),
                    category: category,
                    validUntil: validUntil,
                    pointsRequired: pointsRequired.isEmpty ? nil : Int(pointsRequired),
                    active: active
                )
                
                _ = try await OffersService.shared.createOffer(
                    storeId: storeId,
                    merchantId: merchantId,
                    offerData: offerData
                )
                
                print("✅ [MerchantOfferFormView] Oferta criada com sucesso")
                
                await MainActor.run {
                    loading = false
                    onSuccess()
                }
            } catch {
                print("❌ [MerchantOfferFormView] Erro ao criar oferta: \(error.localizedDescription)")
                await MainActor.run {
                    loading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}

#Preview {
    MerchantOfferFormView(
        storeId: "store1",
        merchantId: "merchant1",
        onCancel: { },
        onSuccess: { }
    )
    .padding()
}
