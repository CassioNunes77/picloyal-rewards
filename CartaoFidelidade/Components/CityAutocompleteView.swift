//
//  CityAutocompleteView.swift
//  CartaoFidelidade
//
//  Componente de autocomplete para seleção de cidade
//

import SwiftUI

struct CityAutocompleteView: View {
    @Binding var city: String
    let label: String
    let isRequired: Bool
    let isDisabled: Bool
    let placeholder: String
    
    @State private var allCities: [String] = []
    @State private var filteredCities: [String] = []
    @State private var showSuggestions = false
    @State private var isLoading = false
    @FocusState private var isFocused: Bool
    
    init(
        city: Binding<String>,
        label: String = "Cidade",
        isRequired: Bool = false,
        isDisabled: Bool = false,
        placeholder: String = "Digite o nome da cidade"
    ) {
        self._city = city
        self.label = label
        self.isRequired = isRequired
        self.isDisabled = isDisabled
        self.placeholder = placeholder
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
            
            // Campo de input com sugestões
            ZStack(alignment: .top) {
                VStack(spacing: 0) {
                    // Input
                    HStack {
                        TextField(placeholder, text: $city)
                            .focused($isFocused)
                            .foregroundColor(.cardForeground)
                            .disabled(isDisabled || isLoading)
                            .onChange(of: city) { oldValue, newValue in
                                filterCities(newValue)
                            }
                            .onChange(of: isFocused) { oldValue, newValue in
                                if newValue {
                                    if !filteredCities.isEmpty {
                                        showSuggestions = true
                                    }
                                } else {
                                    // Delay para permitir clique na sugestão
                                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                                        showSuggestions = false
                                    }
                                }
                            }
                        
                        if !city.isEmpty && !isDisabled {
                            Button(action: {
                                city = ""
                                filteredCities = allCities
                                showSuggestions = false
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 16))
                                    .foregroundColor(.mutedForeground)
                            }
                        }
                    }
                    .padding(AppSpacing.md)
                    .background(Color.appBackground)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(
                                (!isValidCity && !city.isEmpty && isRequired) ? Color.red : Color.border,
                                lineWidth: 1
                            )
                    )
                    
                    // Lista de sugestões
                    if showSuggestions && !filteredCities.isEmpty {
                        ScrollView {
                            VStack(spacing: 0) {
                                ForEach(filteredCities, id: \.self) { cityOption in
                                    Button(action: {
                                        city = cityOption
                                        showSuggestions = false
                                        isFocused = false
                                    }) {
                                        HStack(spacing: AppSpacing.sm) {
                                            Image(systemName: "mappin.circle.fill")
                                                .font(.system(size: 14))
                                                .foregroundColor(.mutedForeground)
                                            Text(cityOption)
                                                .font(.system(size: 14))
                                                .foregroundColor(.cardForeground)
                                            Spacer()
                                        }
                                        .padding(AppSpacing.md)
                                        .background(Color.appBackground)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                    
                                    if cityOption != filteredCities.last {
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
                        .padding(.top, 4)
                    }
                    
                    // Mensagem quando não há resultados
                    if showSuggestions && filteredCities.isEmpty && !city.isEmpty {
                        VStack {
                            Text("Nenhuma cidade encontrada")
                                .font(.system(size: 12))
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
                        .padding(.top, 4)
                    }
                }
            }
            
            // Mensagem de erro
            if !isValidCity && !city.isEmpty && isRequired {
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
        !city.isEmpty && allCities.contains(city)
    }
    
    private func loadCities() {
        isLoading = true
        Task {
            do {
                let cities = try await RegionsService.shared.getAllCities()
                await MainActor.run {
                    self.allCities = cities
                    self.filteredCities = cities
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
        if searchText.isEmpty {
            filteredCities = allCities
            showSuggestions = false
            return
        }
        
        let searchLower = searchText.lowercased()
        filteredCities = allCities.filter { city in
            city.lowercased().contains(searchLower)
        }
        
        showSuggestions = !filteredCities.isEmpty
    }
}

#Preview {
    CityAutocompleteView(
        city: .constant(""),
        label: "Cidade",
        isRequired: true
    )
    .padding()
    .background(Color.appBackground)
}
