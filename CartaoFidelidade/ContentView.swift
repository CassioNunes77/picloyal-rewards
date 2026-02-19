//
//  ContentView.swift
//  CartaoFidelidade
//
//  View principal - equivalente ao Index.tsx
//

import SwiftUI

struct ContentView: View {
    @State private var activeTab = "home"
    @State private var showSettings = false
    @State private var showQRCode = false
    @State private var showPremium = false
    
    var body: some View {
        ZStack {
            Color.appBackground
                .ignoresSafeArea()
            // Main Content — frame fixo em cada tela evita salto de reposicionamento ao fim da transição
            Group {
                if showPremium {
                    PremiumView(activeTab: $activeTab, onBack: { showPremium = false })
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .transition(.slideFadeShort)
                } else if showSettings {
                    SettingsScreen(onBack: { showSettings = false })
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .transition(.slideFadeShort)
                } else {
                    switch activeTab {
                    case "home":
                        HomeView(showSettings: $showSettings, activeTab: $activeTab, showQRCode: $showQRCode, showPremium: $showPremium)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "stores":
                        StoresView(activeTab: $activeTab)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "offers":
                        OffersView(activeTab: $activeTab, showPremium: $showPremium)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "profile":
                        ProfileView(activeTab: $activeTab)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "notifications":
                        NotificationsView(activeTab: $activeTab)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "rewards":
                        RewardsView(activeTab: $activeTab)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    case "history":
                        HistoryView(activeTab: $activeTab)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    default:
                        HomeView(showSettings: $showSettings, activeTab: $activeTab, showQRCode: $showQRCode, showPremium: $showPremium)
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                            .transition(.slideFadeShort)
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            
            // Bottom Navigation (only show if not in settings or premium)
            if !showSettings && !showPremium {
                BottomNav(activeTab: $activeTab, showQRCode: $showQRCode)
            }
            
            // QR Code Card
            if showQRCode {
                QRCodeCard(isPresented: $showQRCode, qrCodeData: "CARTEIRA:4589")
            }
        }
        .animation(.easeInOut(duration: 0.38), value: showSettings)
        .animation(.easeInOut(duration: 0.38), value: showPremium)
        .animation(.easeInOut(duration: 0.38), value: activeTab)
    }
}

#Preview {
    ContentView()
}
