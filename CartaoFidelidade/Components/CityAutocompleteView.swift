//
//  CityAutocompleteView.swift
//  CartaoFidelidade
//
//  Componente de autocomplete para seleção de cidade
//

import SwiftUI

struct CityAutocompleteView: View {
    @Binding var value: String
    let label: String
    let placeholder: String
    let isRequired: Bool
    let isDisabled: Bool
    
    @State private var cities: [String] = []
    @State private var filteredCities: [String] = []
    @State private var showSuggestions = false
    @State private var isLoading = false
    @FocusState private var isFocused: Bool
    
    init(
        value: Binding<String>,
        label: String = "Cidade",
        placeholder: String = "Digite o nome da cidade",
        isRequired: Bool = false,
        isDisabled: Bool = false
    ) {
        self._value = value
        self.label = label
        self.placeholder = placeholder
        self.isRequired = isRequired
        self.isDisabled = isDisabled
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.sm) {
            // Label
            HStack(spacing: AppSpacing.sm) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.mutedForeground)
                Text(label + (isRequired ? " *" : ""))
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.cardForeground)
            }
            
            // Input com sugestões
            ZStack(alignment: .topLeading) {
                TextField(placeholder, text: $value)
                    .textContentType(.addressCity)
                    .foregroundColor(.cardForeground)
                    .disabled(isDisabled || isLoading)
                    .focused($isFocused)
                    .onChange(of: value) { oldValue, newValue in
                        filterCities(newValue)
                    }
                    .onChange(of: isFocused) { oldValue, newValue in
                        if newValue && !filteredCities.isEmpty {
                            showSuggestions = true
                        } else if !newValue {
                            showSuggestions = false
                        }
                    }
                    .padding(AppSpacing.md)
                    .background(Color.appBackground)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(
                                !isValidCity && !value.trimmingCharacters(in: .whitespaces).isEmpty && isRequired
                                    ? Color.red
                                    : Color.border,
                                lineWidth: 1
                            )
                    )
                
                // Botão de limpar
                if !value.isEmpty && !isDisabled {
                    HStack {
                        Spacer()
                        Button(action: {
                            value = ""
                            filteredCities = cities
                            showSuggestions = false
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundColor(.mutedForeground)
                        }
                        .padding(.trailing, AppSpacing.md)
                    }
                }
                
                // Lista de sugestões
                if showSuggestions && !filteredCities.isEmpty {
                    VStack(spacing: 0) {
                        ScrollView {
                            VStack(spacing: 0) {
                                ForEach(filteredCities, id: \.self) { city in
                                    Button(action: {
                                        value = city
                                        showSuggestions = false
                                        isFocused = false
                                    }) {
                                        HStack(spacing: AppSpacing.sm) {
                                            Image(systemName: "mappin.circle.fill")
                                                .font(.system(size: 14))
                                                .foregroundColor(.mutedForeground)
                                            Text(city)
                                                .font(.system(size: 14))
                                                .foregroundColor(.cardForeground)
                                            Spacer()
                                        }
                                        .padding(AppSpacing.md)
                                        .background(Color.appBackground)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                    
                                    if city != filteredCities.last {
                                        Divider()
                                            .padding(.leading, AppSpacing.md)
                                    }
                                }
                            }
                        }
                        .frame(maxHeight: 240)
                    }
                    .background(Color.card)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(Color.border, lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    .padding(.top, 52)
                }
                
                // Mensagem "Nenhuma cidade encontrada"
                if showSuggestions && filteredCities.isEmpty && !value.trimmingCharacters(in: .whitespaces).isEmpty {
                    VStack {
                        Text("Nenhuma cidade encontrada")
                            .font(.system(size: 12))
                            .foregroundColor(.mutedForeground)
                            .padding(AppSpacing.md)
                    }
                    .background(Color.card)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(Color.border, lineWidth: 1)
                    )
                    .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
                    .padding(.top, 52)
                }
            }
            
            // Mensagem de erro
            if !isValidCity && !value.trimmingCharacters(in: .whitespaces).isEmpty && isRequired {
                Text("Selecione uma cidade da lista")
                    .font(.system(size: 12))
                    .foregroundColor(.red)
            }
        }
        .onAppear {
            loadCities()
        }
    }
    
    private var isValidCity: Bool {
        !value.trimmingCharacters(in: .whitespaces).isEmpty && cities.contains(value)
    }
    
    private func loadCities() {
        isLoading = true
        Task {
            do {
                let allCities = try await RegionsService.shared.getAllCities()
                await MainActor.run {
                    self.cities = allCities
                    self.filteredCities = allCities
                    self.isLoading = false
                }
            } catch {
                print("❌ [CityAutocompleteView] Erro ao carregar cidades: \(error.localizedDescription)")
                await MainActor.run {
                    self.isLoading = false
                }
            }
        }
    }
    
    private func filterCities(_ searchText: String) {
        if searchText.trimmingCharacters(in: .whitespaces).isEmpty {
            filteredCities = cities
            showSuggestions = false
            return
        }
        
        let searchLower = searchText.lowercased()
        filteredCities = cities.filter { city in
            city.lowercased().contains(searchLower)
        }
        showSuggestions = !filteredCities.isEmpty
    }
}

#Preview {
    @Previewable @State var city = ""
    return CityAutocompleteView(
        value: $city,
        label: "Cidade",
        placeholder: "Digite o nome da cidade",
        isRequired: true
    )
    .padding()
}
