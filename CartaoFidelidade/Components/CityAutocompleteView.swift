//
//  CityAutocompleteView.swift
//  CartaoFidelidade
//
//  Componente de autocomplete para seleção de cidade
//

import SwiftUI

struct CityAutocompleteView: View {
    @Binding var selectedCity: String
    let label: String
    let placeholder: String
    let isRequired: Bool
    let isDisabled: Bool
    
    @State private var cities: [String] = []
    @State private var filteredCities: [String] = []
    @State private var showSuggestions = false
    @State private var isLoading = false
    @State private var searchText = ""
    @FocusState private var isFocused: Bool
    
    init(
        selectedCity: Binding<String>,
        label: String = "Cidade",
        placeholder: String = "Digite o nome da cidade",
        isRequired: Bool = false,
        isDisabled: Bool = false
    ) {
        self._selectedCity = selectedCity
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
            
            // Campo de entrada
            ZStack(alignment: .trailing) {
                TextField(placeholder, text: $searchText)
                    .textContentType(.addressCity)
                    .foregroundColor(.cardForeground)
                    .focused($isFocused)
                    .disabled(isDisabled || isLoading)
                    .onChange(of: searchText) { oldValue, newValue in
                        filterCities(newValue)
                        selectedCity = newValue
                    }
                    .onChange(of: isFocused) { oldValue, newValue in
                        if newValue && !filteredCities.isEmpty {
                            showSuggestions = true
                        } else if !newValue {
                            // Validar cidade ao perder foco
                            validateCity()
                        }
                    }
                    .padding(AppSpacing.md)
                    .background(Color.appBackground)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(
                                isValidCity ? Color.border : Color.red,
                                lineWidth: 1
                            )
                    )
                
                // Botão limpar
                if !searchText.isEmpty && !isDisabled {
                    Button(action: {
                        searchText = ""
                        selectedCity = ""
                        filteredCities = cities
                        showSuggestions = false
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.mutedForeground)
                            .font(.system(size: 18))
                    }
                    .padding(.trailing, AppSpacing.md)
                }
            }
            
            // Mensagem de erro
            if !isValidCity && !searchText.isEmpty && isRequired {
                Text("Selecione uma cidade da lista")
                    .font(.system(size: 12))
                    .foregroundColor(.red)
            }
            
            // Lista de sugestões
            if showSuggestions && !filteredCities.isEmpty {
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(filteredCities, id: \.self) { city in
                            Button(action: {
                                searchText = city
                                selectedCity = city
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
                                .background(Color.card)
                            }
                            .buttonStyle(PlainButtonStyle())
                            
                            if city != filteredCities.last {
                                Divider()
                                    .background(Color.border)
                            }
                        }
                    }
                }
                .frame(maxHeight: 240)
                .background(Color.card)
                .cornerRadius(AppRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.border, lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
            }
            
            // Mensagem quando não há resultados
            if showSuggestions && filteredCities.isEmpty && !searchText.isEmpty {
                VStack {
                    Text("Nenhuma cidade encontrada")
                        .font(.system(size: 14))
                        .foregroundColor(.mutedForeground)
                        .padding(AppSpacing.md)
                }
                .frame(maxWidth: .infinity)
                .background(Color.card)
                .cornerRadius(AppRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.border, lineWidth: 1)
                )
            }
        }
        .onAppear {
            loadCities()
            searchText = selectedCity
        }
        .onChange(of: selectedCity) { oldValue, newValue in
            if newValue != searchText {
                searchText = newValue
            }
        }
    }
    
    private var isValidCity: Bool {
        !searchText.isEmpty && cities.contains(searchText)
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
    
    private func filterCities(_ text: String) {
        if text.isEmpty {
            filteredCities = cities
            showSuggestions = false
            return
        }
        
        let lowercasedText = text.lowercased()
        filteredCities = cities.filter { city in
            city.lowercased().contains(lowercasedText)
        }
        showSuggestions = !filteredCities.isEmpty
    }
    
    private func validateCity() {
        if isRequired && !isValidCity && !searchText.isEmpty {
            // Manter sugestões abertas se cidade inválida
            showSuggestions = true
        } else {
            showSuggestions = false
        }
    }
}

#Preview {
    CityAutocompleteView(
        selectedCity: .constant(""),
        label: "Cidade",
        placeholder: "Digite o nome da cidade",
        isRequired: true
    )
    .padding()
    .background(Color.appBackground)
}
