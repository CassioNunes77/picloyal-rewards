//
//  CityAutocompleteView.swift
//  CartaoFidelidade
//
//  Componente de autocomplete para seleção de cidade
//

import SwiftUI

struct CityAutocompleteView: View {
    @Binding var selectedCity: String
    var label: String
    var placeholder: String
    var isRequired: Bool
    var isDisabled: Bool
    
    @State private var cities: [String] = []
    @State private var filteredCities: [String] = []
    @State private var showSuggestions = false
    @State private var isLoading = false
    
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
            
            // Campo de texto com autocomplete
            ZStack(alignment: .trailing) {
                TextField(placeholder, text: $selectedCity)
                    .foregroundColor(.cardForeground)
                    .disabled(isDisabled || isLoading)
                    .onChange(of: selectedCity) { oldValue, newValue in
                        filterCities(query: newValue)
                    }
                    .onTapGesture {
                        if !filteredCities.isEmpty {
                            showSuggestions = true
                        }
                    }
                    .padding(AppSpacing.md)
                    .background(Color.appBackground)
                    .cornerRadius(AppRadius.lg)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppRadius.lg)
                            .stroke(isValidCity ? Color.border : Color.red, lineWidth: 1)
                    )
                
                // Botão de limpar
                if !selectedCity.isEmpty && !isDisabled {
                    Button(action: {
                        selectedCity = ""
                        filteredCities = cities
                        showSuggestions = false
                    }) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.mutedForeground)
                            .font(.system(size: 16))
                    }
                    .padding(.trailing, AppSpacing.md)
                }
            }
            
            // Lista de sugestões
            if showSuggestions && !filteredCities.isEmpty {
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(filteredCities, id: \.self) { city in
                            Button(action: {
                                selectedCity = city
                                showSuggestions = false
                                // Esconder teclado
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                            }) {
                                HStack(spacing: AppSpacing.sm) {
                                    Image(systemName: "mappin")
                                        .font(.system(size: 14))
                                        .foregroundColor(.mutedForeground)
                                    Text(city)
                                        .foregroundColor(.cardForeground)
                                        .font(.system(size: 14))
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
                .frame(maxHeight: 200)
                .background(Color.card)
                .cornerRadius(AppRadius.lg)
                .overlay(
                    RoundedRectangle(cornerRadius: AppRadius.lg)
                        .stroke(Color.border, lineWidth: 1)
                )
                .shadow(color: Color.black.opacity(0.1), radius: 8, x: 0, y: 4)
            }
            
            // Mensagem de erro se cidade inválida
            if !isValidCity && !selectedCity.isEmpty && isRequired {
                Text("Selecione uma cidade da lista")
                    .font(.system(size: 12))
                    .foregroundColor(.red)
                    .padding(.leading, AppSpacing.sm)
            }
        }
        .onAppear {
            loadCities()
        }
    }
    
    private var isValidCity: Bool {
        selectedCity.isEmpty || cities.contains(selectedCity)
    }
    
    private func filterCities(query: String) {
        if query.isEmpty {
            filteredCities = cities
            showSuggestions = false
            return
        }
        
        filteredCities = cities.filter { city in
            city.localizedCaseInsensitiveContains(query)
        }
        
        showSuggestions = !filteredCities.isEmpty
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
}

#Preview {
    CityAutocompleteView(
        selectedCity: .constant(""),
        label: "Cidade",
        placeholder: "Digite o nome da cidade",
        isRequired: true,
        isDisabled: false
    )
    .padding()
}
