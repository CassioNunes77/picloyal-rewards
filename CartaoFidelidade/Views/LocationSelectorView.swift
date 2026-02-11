//
//  LocationSelectorView.swift
//  CartaoFidelidade
//
//  Seletor de localidade no estilo iFood
//

import SwiftUI

struct LocationSelectorView: View {
    @AppStorage("selectedLocation") private var selectedLocation = "São Paulo, SP"
    @State private var showLocationPicker = false
    
    var body: some View {
        Button(action: {
            showLocationPicker = true
        }) {
            HStack(spacing: 4) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.9))
                
                Text("Entregar em")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.white.opacity(0.9))
                
                Text(selectedLocation)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white)
                    .lineLimit(1)
                
                Image(systemName: "chevron.down")
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.white.opacity(0.15))
            .cornerRadius(16)
        }
        .sheet(isPresented: $showLocationPicker) {
            LocationPickerSheet(
                selectedLocation: $selectedLocation,
                onDismiss: { showLocationPicker = false }
            )
        }
    }
}

struct LocationPickerSheet: View {
    @Binding var selectedLocation: String
    let onDismiss: () -> Void
    @State private var searchText = ""
    @State private var tempSelectedLocation: String
    
    let locations = [
        "São Paulo, SP",
        "Rio de Janeiro, RJ",
        "Belo Horizonte, MG",
        "Brasília, DF",
        "Salvador, BA",
        "Curitiba, PR",
        "Porto Alegre, RS",
        "Recife, PE",
        "Fortaleza, CE",
        "Manaus, AM"
    ]
    
    init(selectedLocation: Binding<String>, onDismiss: @escaping () -> Void) {
        self._selectedLocation = selectedLocation
        self.onDismiss = onDismiss
        self._tempSelectedLocation = State(initialValue: selectedLocation.wrappedValue)
    }
    
    var filteredLocations: [String] {
        if searchText.isEmpty {
            return locations
        }
        return locations.filter { $0.localizedCaseInsensitiveContains(searchText) }
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.mutedForeground)
                        .font(.system(size: 16))
                    
                    TextField("Buscar cidade...", text: $searchText)
                        .font(.appBody)
                }
                .padding(AppSpacing.md)
                .background(Color.card)
                .cornerRadius(AppRadius.md)
                .padding(.horizontal, AppSpacing.lg)
                .padding(.top, AppSpacing.md)
                
                // Locations List
                ScrollView {
                    VStack(spacing: 0) {
                        ForEach(filteredLocations, id: \.self) { location in
                            Button(action: {
                                tempSelectedLocation = location
                                selectedLocation = location
                                onDismiss()
                            }) {
                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(location)
                                            .font(.appBody)
                                            .foregroundColor(.cardForeground)
                                        
                                        Text("Entregas disponíveis")
                                            .font(.appCaption)
                                            .foregroundColor(.mutedForeground)
                                    }
                                    
                                    Spacer()
                                    
                                    if tempSelectedLocation == location {
                                        Image(systemName: "checkmark.circle.fill")
                                            .foregroundColor(.primary)
                                            .font(.system(size: 20))
                                    }
                                }
                                .padding(AppSpacing.md)
                                .background(tempSelectedLocation == location ? Color.accent.opacity(0.1) : Color.clear)
                            }
                            .buttonStyle(PlainButtonStyle())
                            
                            Divider()
                                .padding(.leading, AppSpacing.md)
                        }
                    }
                }
                .padding(.top, AppSpacing.md)
            }
            .background(Color.appBackground)
            .navigationTitle("Escolher localidade")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancelar") {
                        onDismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    LocationSelectorView()
}
