//
//  MerchantStoreFormView.swift
//  CartaoFidelidade
//
//  Formulário de cadastro de loja do lojista
//

import SwiftUI

struct MerchantStoreFormView: View {
    var onCancel: () -> Void
    var onSuccess: () -> Void
    
    @State private var name = ""
    @State private var cnpj = ""
    @State private var address = ""
    @State private var city = ""
    @State private var phone = ""
    @State private var hours = ""
    @State private var loading = false
    @State private var validCities: [String] = []
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.lg) {
            // Header do formulário
            HStack {
                Text("Cadastrar Loja")
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
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
                    // Nome
                    FormField(
                        label: "Nome da Loja",
                        icon: "storefront.fill",
                        isRequired: true,
                        content: {
                            TextField("Ex: Loja Exemplo", text: $name)
                                .textContentType(.organizationName)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // CNPJ
                    FormField(
                        label: "CNPJ",
                        icon: "building.2.fill",
                        isRequired: true,
                        content: {
                            TextField("00.000.000/0000-00", text: $cnpj)
                                .keyboardType(.numberPad)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                                .onChange(of: cnpj) { oldValue, newValue in
                                    cnpj = formatCNPJ(newValue)
                                }
                        }
                    )
                    
                    // Endereço
                    FormField(
                        label: "Endereço",
                        icon: "mappin.circle.fill",
                        isRequired: true,
                        content: {
                            TextField("Rua, número, bairro", text: $address)
                                .textContentType(.streetAddressLine1)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                        }
                    )
                    
                    // Cidade
                    CityAutocompleteView(
                        city: $city,
                        label: "Cidade",
                        placeholder: "Digite o nome da cidade",
                        isRequired: true,
                        isDisabled: loading
                    )
                    
                    // Telefone
                    FormField(
                        label: "Telefone",
                        icon: "phone.fill",
                        isRequired: true,
                        content: {
                            TextField("(00) 00000-0000", text: $phone)
                                .keyboardType(.phonePad)
                                .textContentType(.telephoneNumber)
                                .foregroundColor(.cardForeground)
                                .disabled(loading)
                                .onChange(of: phone) { oldValue, newValue in
                                    phone = formatPhone(newValue)
                                }
                        }
                    )
                    
                    // Horário de Funcionamento
                    FormField(
                        label: "Horário de Funcionamento",
                        icon: "clock.fill",
                        isRequired: true,
                        content: {
                            TextEditor(text: $hours)
                                .foregroundColor(.cardForeground)
                                .frame(minHeight: 100)
                                .scrollContentBackground(.hidden)
                                .background(Color.appBackground)
                                .disabled(loading)
                        }
                    )
                    
                    // Logo - Placeholder
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
                        Text("Logo da Loja")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.cardForeground)
                        
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(Color.border, style: StrokeStyle(lineWidth: 2, dash: [5]))
                            .frame(height: 120)
                            .overlay(
                                VStack(spacing: AppSpacing.sm) {
                                    Image(systemName: "photo.fill")
                                        .font(.system(size: 32))
                                        .foregroundColor(.mutedForeground)
                                    Text("Funcionalidade de upload de foto será implementada em breve")
                                        .font(.system(size: 12))
                                        .foregroundColor(.mutedForeground)
                                        .multilineTextAlignment(.center)
                                        .padding(.horizontal)
                                }
                            )
                    }
                    .padding(.top, AppSpacing.sm)
                    
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
                                    Text("Salvar Loja")
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
        .cornerRadius(24)
        .appShadow(AppShadow.lg)
        .onAppear {
            loadValidCities()
        }
    }
    
    private var isFormValid: Bool {
        // Validar se a cidade está na lista de cidades válidas
        let isValidCity = !city.trimmingCharacters(in: .whitespaces).isEmpty && 
                          (validCities.isEmpty || validCities.contains(city))
        
        return !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        !cnpj.trimmingCharacters(in: .whitespaces).isEmpty &&
        !address.trimmingCharacters(in: .whitespaces).isEmpty &&
        isValidCity &&
        !phone.trimmingCharacters(in: .whitespaces).isEmpty &&
        !hours.trimmingCharacters(in: .whitespaces).isEmpty
    }
    
    private func loadValidCities() {
        Task {
            do {
                let cities = try await RegionsService.shared.getAllCities()
                await MainActor.run {
                    self.validCities = cities
                }
            } catch {
                print("❌ [MerchantStoreFormView] Erro ao carregar cidades: \(error.localizedDescription)")
            }
        }
    }
    
    private func formatCNPJ(_ value: String) -> String {
        let numbers = value.filter { $0.isNumber }
        if numbers.count <= 14 {
            var formatted = numbers
            if formatted.count > 2 {
                formatted.insert(".", at: formatted.index(formatted.startIndex, offsetBy: 2))
            }
            if formatted.count > 6 {
                formatted.insert(".", at: formatted.index(formatted.startIndex, offsetBy: 6))
            }
            if formatted.count > 10 {
                formatted.insert("/", at: formatted.index(formatted.startIndex, offsetBy: 10))
            }
            if formatted.count > 15 {
                formatted.insert("-", at: formatted.index(formatted.startIndex, offsetBy: 15))
            }
            return String(formatted.prefix(18))
        }
        return value
    }
    
    private func formatPhone(_ value: String) -> String {
        let numbers = value.filter { $0.isNumber }
        if numbers.count <= 11 {
            var formatted = numbers
            if formatted.count > 2 {
                formatted.insert("(", at: formatted.startIndex)
                formatted.insert(")", at: formatted.index(formatted.startIndex, offsetBy: 3))
                formatted.insert(" ", at: formatted.index(formatted.startIndex, offsetBy: 4))
            }
            if formatted.count > 10 {
                formatted.insert("-", at: formatted.index(formatted.startIndex, offsetBy: 10))
            }
            return String(formatted.prefix(15))
        }
        return value
    }
    
    private func submit() {
        guard isFormValid else { return }
        
        loading = true
        
        // Simular salvamento (futuramente salvar no Firebase)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            loading = false
            print("Dados da loja:", [
                "name": name,
                "cnpj": cnpj,
                "address": address,
                "city": city,
                "phone": phone,
                "hours": hours
            ])
            onSuccess()
        }
    }
}

struct FormField<Content: View>: View {
    let label: String
    let icon: String?
    let isRequired: Bool
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            HStack(spacing: AppSpacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 14))
                        .foregroundColor(.mutedForeground)
                }
                Text(label + (isRequired ? " *" : ""))
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.cardForeground)
            }
            
            content
                .padding(AppSpacing.md)
                .background(Color.appBackground)
                .cornerRadius(AppRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.border, lineWidth: 1)
                )
        }
    }
}

#Preview {
    MerchantStoreFormView(onCancel: { }, onSuccess: { })
}
