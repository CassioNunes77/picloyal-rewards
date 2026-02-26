//
//  MerchantStoreFormView.swift
//  CartaoFidelidade
//
//  Formulário de cadastro de loja do lojista
//

import SwiftUI
import FirebaseAuth

enum CnpjStatus {
    case idle
    case loading
    case valid
    case invalid
}

struct MerchantStoreFormView: View {
    var onCancel: () -> Void
    var onSuccess: () -> Void
    
    @State private var name = ""
    @State private var cnpj = ""
    @State private var address = ""
    @State private var city = ""
    @State private var phone = ""
    @State private var hours = ""
    @State private var photoURL: String? = nil
    @State private var loading = false
    @State private var validCities: [String] = []
    @State private var errorMessage: String? = nil
    @State private var showError = false
    @State private var cnpjStatus: CnpjStatus = .idle
    
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
                    VStack(alignment: .leading, spacing: AppSpacing.sm) {
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
                                        validateCnpjDebounced()
                                    }
                            }
                        )
                        cnpjStatusView
                    }
                    
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
                        selectedCity: $city,
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
                    BusinessHoursPicker(hours: $hours, disabled: loading)
                    
                    // Logo da Loja (ImgBB)
                    StorePhotoPickerView(photoURL: $photoURL, disabled: loading)
                    
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
        .appConfirmation(
            isPresented: $showError,
            title: "Erro",
            message: errorMessage ?? "Erro desconhecido ao cadastrar loja",
            primaryTitle: "OK",
            primaryStyle: .default,
            primaryAction: { showError = false },
            secondaryTitle: nil,
            secondaryAction: nil
        )
    }
    
    @ViewBuilder
    private var cnpjStatusView: some View {
        switch cnpjStatus {
        case .loading:
            HStack(spacing: 6) {
                ProgressView()
                    .scaleEffect(0.8)
                Text("Validando CNPJ...")
                    .font(.system(size: 12))
                    .foregroundColor(.mutedForeground)
            }
        case .valid:
            HStack(spacing: 6) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundColor(.green)
                Text("CNPJ válido")
                    .font(.system(size: 12))
                    .foregroundColor(.green)
            }
        case .invalid:
            HStack(spacing: 6) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.red)
                Text("CNPJ inválido")
                    .font(.system(size: 12))
                    .foregroundColor(.red)
            }
        case .idle:
            EmptyView()
        }
    }

    private func validateCnpjDebounced() {
        let digits = cnpj.filter { $0.isNumber }
        if digits.count != 14 {
            cnpjStatus = .idle
            return
        }
        Task {
            cnpjStatus = .loading
            try? await Task.sleep(nanoseconds: 500_000_000)
            let cnpjToValidate = cnpj
            let result = await CnpjService.shared.validate(cnpj: cnpjToValidate)
            if cnpj == cnpjToValidate {
                cnpjStatus = result.valid ? .valid : .invalid
            }
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
        
        guard let currentUser = Auth.auth().currentUser else {
            errorMessage = "Você precisa estar autenticado para cadastrar uma loja"
            showError = true
            return
        }
        
        loading = true
        errorMessage = nil
        
        Task {
            do {
                let storeData = StoreData(
                    name: name.trimmingCharacters(in: .whitespaces),
                    cnpj: cnpj.trimmingCharacters(in: .whitespaces),
                    address: address.trimmingCharacters(in: .whitespaces),
                    city: city.trimmingCharacters(in: .whitespaces),
                    phone: phone.trimmingCharacters(in: .whitespaces),
                    hours: hours.trimmingCharacters(in: .whitespaces),
                    photoURL: photoURL,
                    active: true
                )
                
                let storeId = try await StoresService.shared.createStore(
                    merchantId: currentUser.uid,
                    storeData: storeData
                )
                
                print("✅ [MerchantStoreFormView] Loja criada com sucesso: \(storeId)")
                
                await MainActor.run {
                    loading = false
                    onSuccess()
                }
            } catch {
                print("❌ [MerchantStoreFormView] Erro ao criar loja: \(error.localizedDescription)")
                await MainActor.run {
                    loading = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
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
                .frame(minWidth: 0, maxWidth: .infinity)
                .padding(AppSpacing.md)
                .background(Color.appBackground)
                .cornerRadius(AppRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.border, lineWidth: 1)
                )
        }
        .frame(minWidth: 0, maxWidth: .infinity)
    }
}

#Preview {
    MerchantStoreFormView(onCancel: { }, onSuccess: { })
}
