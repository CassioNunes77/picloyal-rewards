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
    @State private var startImmediate = true
    @State private var validFrom = Date()
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
                    
                    // Quando a oferta estará disponível
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "calendar.badge.clock")
                                .font(.system(size: 14))
                                .foregroundColor(.mutedForeground)
                            Text("Quando a oferta estará disponível")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.cardForeground)
                        }
                        
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            HStack(spacing: AppSpacing.lg) {
                                Button(action: { startImmediate = true }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: startImmediate ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(startImmediate ? .primary : .mutedForeground)
                                        Text("Disponível ao salvar")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.cardForeground)
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                Button(action: { startImmediate = false }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: !startImmediate ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(!startImmediate ? .primary : .mutedForeground)
                                        Text("Agendar data de início")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.cardForeground)
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                            
                            if !startImmediate {
                                DatePicker("", selection: $validFrom, in: Date()..., displayedComponents: .date)
                                    .datePickerStyle(.compact)
                                    .disabled(loading)
                            }
                            
                            Text(startImmediate ? "A oferta ficará visível assim que for salva" : "A oferta só aparecerá para clientes a partir da data escolhida")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                    }
                    
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
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
              validUntil >= Date() else { return false }
        if !startImmediate { return validFrom >= Date() }
        return true
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
                    validFrom: startImmediate ? nil : validFrom,
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

// MARK: - MerchantOfferEditView

struct MerchantOfferEditView: View {
    let offer: FirebaseOffer
    var onCancel: () -> Void
    var onSuccess: () -> Void
    var onDelete: () -> Void
    
    @State private var title = ""
    @State private var description = ""
    @State private var discount = ""
    @State private var category = "geral"
    @State private var startImmediate = true
    @State private var validFrom = Date()
    @State private var validUntil = Date()
    @State private var pointsRequired = ""
    @State private var active = true
    @State private var loading = false
    @State private var errorMessage: String? = nil
    @State private var showError = false
    @State private var showDeleteConfirmation = false
    
    private let categories = [
        ("geral", "Geral"),
        ("bebidas", "Bebidas"),
        ("comida", "Comida"),
        ("brinde", "Brinde")
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                Text("Editar Oferta")
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
                    
                    // Quando a oferta estará disponível
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        HStack(spacing: AppSpacing.sm) {
                            Image(systemName: "calendar.badge.clock")
                                .font(.system(size: 14))
                                .foregroundColor(.mutedForeground)
                            Text("Quando a oferta estará disponível")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.cardForeground)
                        }
                        
                        VStack(alignment: .leading, spacing: AppSpacing.sm) {
                            HStack(spacing: AppSpacing.lg) {
                                Button(action: { startImmediate = true }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: startImmediate ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(startImmediate ? .primary : .mutedForeground)
                                        Text("Disponível ao salvar")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.cardForeground)
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                Button(action: { startImmediate = false }) {
                                    HStack(spacing: AppSpacing.xs) {
                                        Image(systemName: !startImmediate ? "checkmark.circle.fill" : "circle")
                                            .foregroundColor(!startImmediate ? .primary : .mutedForeground)
                                        Text("Agendar data de início")
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(.cardForeground)
                                    }
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                            
                            if !startImmediate {
                                DatePicker("", selection: $validFrom, in: Date()..., displayedComponents: .date)
                                    .datePickerStyle(.compact)
                                    .disabled(loading)
                            }
                            
                            Text(startImmediate ? "A oferta ficará visível assim que for salva" : "A oferta só aparecerá para clientes a partir da data escolhida")
                                .font(.system(size: 12))
                                .foregroundColor(.mutedForeground)
                        }
                    }
                    
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
                    VStack(spacing: AppSpacing.md) {
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
                                        Text("Salvar")
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
                        
                        Button(action: { showDeleteConfirmation = true }) {
                            HStack(spacing: AppSpacing.xs) {
                                Image(systemName: "trash.fill")
                                    .font(.system(size: 14))
                                Text("Excluir Oferta")
                                    .font(.system(size: 14, weight: .medium))
                            }
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .frame(height: 44)
                        }
                        .disabled(loading)
                    }
                    .padding(.top, AppSpacing.lg)
                }
            }
        }
        .padding(AppSpacing.lg)
        .background(Color.card)
        .cornerRadius(AppRadius.xl)
        .appShadow(AppShadow.lg)
        .onAppear {
            title = offer.title
            description = offer.description
            discount = offer.discount ?? ""
            category = offer.category
            startImmediate = offer.validFrom == nil
            validFrom = offer.validFrom ?? Date()
            validUntil = offer.validUntil
            pointsRequired = offer.pointsRequired.map { "\($0)" } ?? ""
            active = offer.active
        }
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro desconhecido ao atualizar oferta",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
        .appConfirmation(
            isPresented: $showDeleteConfirmation,
            title: "Excluir Oferta",
            message: "Tem certeza que deseja excluir esta oferta?",
            primaryTitle: "Excluir",
            primaryStyle: .destructive,
            primaryAction: {
                showDeleteConfirmation = false
                onDelete()
            },
            secondaryTitle: "Cancelar",
            secondaryAction: { showDeleteConfirmation = false }
        )
    }
    
    private var isFormValid: Bool {
        guard !title.trimmingCharacters(in: .whitespaces).isEmpty,
              !description.trimmingCharacters(in: .whitespaces).isEmpty,
              validUntil >= Date() else { return false }
        if !startImmediate { return validFrom >= Date() }
        return true
    }
    
    private func submit() {
        guard isFormValid else { return }
        
        guard let currentUser = Auth.auth().currentUser, currentUser.uid == offer.merchantId else {
            errorMessage = "Você precisa estar autenticado para editar uma oferta"
            showError = true
            return
        }
        
        loading = true
        errorMessage = nil
        
        Task {
            do {
                let updateData = OfferUpdateData(
                    title: title.trimmingCharacters(in: .whitespaces),
                    description: description.trimmingCharacters(in: .whitespaces),
                    discount: discount.trimmingCharacters(in: .whitespaces).isEmpty ? nil : discount.trimmingCharacters(in: .whitespaces),
                    category: category,
                    validUntil: validUntil,
                    validFrom: startImmediate ? nil : validFrom,
                    validFromDelete: startImmediate ? true : nil,
                    pointsRequired: pointsRequired.isEmpty ? nil : Int(pointsRequired),
                    active: active
                )
                
                try await OffersService.shared.updateOffer(
                    offerId: offer.id,
                    merchantId: offer.merchantId,
                    offerData: updateData
                )
                
                print("✅ [MerchantOfferEditView] Oferta atualizada com sucesso")
                
                await MainActor.run {
                    loading = false
                    onSuccess()
                }
            } catch {
                print("❌ [MerchantOfferEditView] Erro ao atualizar oferta: \(error.localizedDescription)")
                await MainActor.run {
                    loading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
}
