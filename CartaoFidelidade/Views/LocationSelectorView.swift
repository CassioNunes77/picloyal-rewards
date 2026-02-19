//
//  LocationSelectorView.swift
//  CartaoFidelidade
//
//  Seletor de localidade no estilo iFood
//

import SwiftUI

struct LocationSelectorView: View {
    @AppStorage("selectedLocation") private var selectedLocation = ""
    @State private var showLocationPicker = false
    @State private var regions: [Region] = []
    @State private var loading = false
    
    var body: some View {
        Button(action: {
            showLocationPicker = true
        }) {
            HStack(spacing: 4) {
                Image(systemName: "mappin.circle.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.heroForegroundMuted)
                
                Text(selectedLocation.isEmpty ? "Carregando..." : selectedLocation)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.heroForeground)
                    .lineLimit(1)
                
                Image(systemName: "chevron.down")
                    .font(.system(size: 10))
                    .foregroundColor(.heroForegroundMuted)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.heroOverlay)
            .cornerRadius(16)
        }
        .sheet(isPresented: $showLocationPicker) {
            LocationPickerSheet(
                selectedLocation: $selectedLocation,
                regions: $regions,
                loading: $loading,
                onDismiss: { showLocationPicker = false }
            )
            .onAppear {
                loadRegions()
            }
        }
        .onAppear {
            // Carregar localização salva ou primeira região disponível
            if selectedLocation.isEmpty {
                loadRegions()
            }
        }
    }
    
    private func loadRegions() {
        loading = true
        Task {
            do {
                let fetchedRegions = try await RegionsService.shared.getActiveRegions()
                await MainActor.run {
                    regions = fetchedRegions
                    loading = false
                    
                    // Se não houver localização selecionada e houver regiões, selecionar a primeira
                    if selectedLocation.isEmpty && !regions.isEmpty {
                        selectedLocation = regions[0].displayName
                    }
                }
            } catch {
                print("❌ [LocationSelectorView] Erro ao carregar regiões: \(error.localizedDescription)")
                await MainActor.run {
                    loading = false
                }
            }
        }
    }
}

struct LocationPickerSheet: View {
    @Binding var selectedLocation: String
    @Binding var regions: [Region]
    @Binding var loading: Bool
    let onDismiss: () -> Void
    @State private var searchText = ""
    
    var filteredRegions: [Region] {
        if searchText.isEmpty {
            return regions
        }
        let searchLower = searchText.lowercased()
        return regions.filter { region in
            region.city.localizedCaseInsensitiveContains(searchLower) ||
            region.state.localizedCaseInsensitiveContains(searchLower) ||
            region.name.localizedCaseInsensitiveContains(searchLower)
        }
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
                        if loading {
                            HStack {
                                Spacer()
                                ProgressView()
                                    .padding(.vertical, AppSpacing.xl)
                                Spacer()
                            }
                        } else if filteredRegions.isEmpty {
                            VStack(spacing: AppSpacing.sm) {
                                Text("Nenhuma localidade encontrada")
                                    .font(.appBody)
                                    .foregroundColor(.mutedForeground)
                                    .padding(.vertical, AppSpacing.xl)
                            }
                        } else {
                            ForEach(filteredRegions) { region in
                                Button(action: {
                                    selectedLocation = region.displayName
                                    onDismiss()
                                }) {
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(region.displayName)
                                                .font(.appBody)
                                                .foregroundColor(.cardForeground)
                                            
                                            Text(region.storesCount > 0 
                                                  ? "\(region.storesCount) loja\(region.storesCount > 1 ? "s" : "") disponível\(region.storesCount > 1 ? "eis" : "")"
                                                  : "Lojas disponíveis")
                                                .font(.appCaption)
                                                .foregroundColor(.mutedForeground)
                                        }
                                        
                                        Spacer()
                                        
                                        if selectedLocation == region.displayName {
                                            Image(systemName: "checkmark.circle.fill")
                                                .foregroundColor(.primary)
                                                .font(.system(size: 20))
                                        }
                                    }
                                    .padding(AppSpacing.md)
                                    .background(selectedLocation == region.displayName ? Color.accent.opacity(0.1) : Color.clear)
                                }
                                .buttonStyle(PlainButtonStyle())
                                
                                Divider()
                                    .padding(.leading, AppSpacing.md)
                            }
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
